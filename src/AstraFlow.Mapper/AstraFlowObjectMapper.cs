using System.Collections;

namespace AstraFlow.Mapper;

/// <summary>
/// Default AstraFlow object mapper implementation.
/// It intentionally maps only through explicit <see cref="IObjectMappingRule"/> registrations,
/// with lightweight collection support for application DTOs.
/// </summary>
public sealed class AstraFlowObjectMapper : IMapper
{
    private readonly IReadOnlyList<IObjectMappingRule> _rules;

    /// <summary>
    /// Creates a mapper with the registered explicit mapping rules.
    /// </summary>
    /// <param name="rules">Mapping rules discovered from active modules.</param>
    public AstraFlowObjectMapper(IEnumerable<IObjectMappingRule> rules)
    {
        _rules = rules.ToArray();
    }

    /// <inheritdoc />
    public TDestination Map<TDestination>(object? source)
    {
        var mapped = Map(source, typeof(TDestination));
        return mapped is null ? default! : (TDestination)mapped;
    }

    /// <inheritdoc />
    public object? Map(object? source, Type destinationType)
    {
        ArgumentNullException.ThrowIfNull(destinationType);

        if (source is null)
            return null;

        var sourceType = source.GetType();
        if (destinationType.IsAssignableFrom(sourceType))
            return source;

        if (TryMapCollection(source, destinationType, out var collection))
            return collection;

        var matches = _rules
            .Where(r => r.CanMap(sourceType, destinationType))
            .Take(2)
            .ToArray();

        if (matches.Length == 0)
        {
            throw new InvalidOperationException(
                $"No mapping rule registered from '{sourceType.FullName}' to '{destinationType.FullName}'.");
        }

        if (matches.Length > 1)
        {
            throw new InvalidOperationException(
                $"Multiple mapping rules registered from '{sourceType.FullName}' to '{destinationType.FullName}'.");
        }

        return matches[0].Map(source, destinationType, this);
    }

    /// <summary>
    /// Maps enumerable sources to the requested collection destination when an item type can be resolved.
    /// </summary>
    /// <param name="source">The enumerable source object.</param>
    /// <param name="destinationType">The requested collection destination type.</param>
    /// <param name="mapped">The mapped collection when this method succeeds.</param>
    /// <returns>True when collection mapping was performed; otherwise false.</returns>
    private bool TryMapCollection(object source, Type destinationType, out object? mapped)
    {
        mapped = null;

        if (source is not IEnumerable enumerable || source is string)
            return false;

        var itemType = ResolveCollectionItemType(destinationType);
        if (itemType is null)
            return false;

        var list = (IList)Activator.CreateInstance(typeof(List<>).MakeGenericType(itemType))!;

        foreach (var item in enumerable)
        {
            list.Add(Map(item, itemType));
        }

        if (destinationType.IsArray)
        {
            var array = Array.CreateInstance(itemType, list.Count);
            list.CopyTo(array, 0);
            mapped = array;
            return true;
        }

        mapped = list;
        return true;
    }

    /// <summary>
    /// Resolves the destination item type for arrays and common generic collection contracts.
    /// </summary>
    /// <param name="destinationType">The requested collection destination type.</param>
    /// <returns>The item type when supported; otherwise null.</returns>
    private static Type? ResolveCollectionItemType(Type destinationType)
    {
        if (destinationType.IsArray)
            return destinationType.GetElementType();

        if (destinationType.IsGenericType &&
            destinationType.GetGenericTypeDefinition() == typeof(List<>))
        {
            return destinationType.GetGenericArguments()[0];
        }

        return destinationType
            .GetInterfaces()
            .Append(destinationType)
            .Where(t => t.IsGenericType)
            .Where(t =>
                t.GetGenericTypeDefinition() == typeof(IEnumerable<>) ||
                t.GetGenericTypeDefinition() == typeof(IReadOnlyList<>))
            .Select(t => t.GetGenericArguments()[0])
            .FirstOrDefault();
    }
}
