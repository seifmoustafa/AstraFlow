using AstraFlow.Mapper;
using Microsoft.Extensions.Options;

namespace AstraFlow.Mapper.Conventions;

internal sealed class ConventionObjectMappingRule : IDeclaredObjectMappingRule
{
    private readonly ConventionMappingCatalog _catalog;
    private readonly ConventionMappingOptions _options;

    public ConventionObjectMappingRule(
        ConventionMappingCatalog catalog,
        IOptions<ConventionMappingOptions> options)
    {
        _catalog = catalog;
        _options = options.Value;
    }

    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings =>
        _catalog.Definitions.Select(definition => definition.Pair).ToArray();

    public bool CanMap(Type sourceType, Type destinationType)
    {
        return _catalog.Definitions.Any(definition =>
            definition.SourceType == sourceType &&
            definition.DestinationType == destinationType);
    }

    public object? Map(object? source, Type destinationType, IMapper mapper)
    {
        if (source is null)
            return null;

        var sourceType = source.GetType();
        var definition = _catalog.Definitions.SingleOrDefault(candidate =>
            candidate.SourceType == sourceType &&
            candidate.DestinationType == destinationType);

        if (definition is null)
        {
            throw new InvalidOperationException(
                $"No convention mapping pair registered from '{sourceType.FullName}' to '{destinationType.FullName}'.");
        }

        var resolvedPlan = ConventionMappingPlanBuilder.BuildResolvedPlan(definition, _options);
        ConventionMappingPlanBuilder.ThrowIfInvalid(resolvedPlan.Plan, _options);

        var destination = CreateDestination(destinationType, resolvedPlan, source);

        foreach (var member in resolvedPlan.Members.Where(member => member.CanMap && !member.IsConstructorBound))
        {
            ApplyMappedMember(source, destination, member);
        }

        return destination;
    }

    public void MapInto(object source, object destination)
    {
        if (source is null)
            throw new ArgumentNullException(nameof(source));
        if (destination is null)
            throw new ArgumentNullException(nameof(destination));

        var sourceType = source.GetType();
        var destinationType = destination.GetType();
        var definition = _catalog.Definitions.SingleOrDefault(candidate =>
            candidate.SourceType == sourceType &&
            candidate.DestinationType == destinationType);

        if (definition is null)
        {
            throw new InvalidOperationException(
                $"No convention mapping pair registered from '{sourceType.FullName}' to '{destinationType.FullName}'.");
        }

        if (!definition.UpdateMappingEnabled)
        {
            throw new InvalidOperationException(
                $"Convention update mapping from '{sourceType.FullName}' to '{destinationType.FullName}' requires EnableUpdateMapping.");
        }

        var resolvedPlan = ConventionMappingPlanBuilder.BuildResolvedPlan(definition, _options);
        ConventionMappingPlanBuilder.ThrowIfInvalid(resolvedPlan.Plan, _options);

        foreach (var member in resolvedPlan.Members.Where(member =>
            member.CanMap &&
            ConventionMappingPlanBuilder.CanWrite(member.DestinationProperty)))
        {
            ApplyMappedMember(source, destination, member);
        }
    }

    private static object CreateDestination(
        Type destinationType,
        ConventionResolvedMappingPlan resolvedPlan,
        object source)
    {
        if (!resolvedPlan.Constructor.CanConstruct)
        {
            throw new InvalidOperationException(
                $"Destination type '{destinationType.FullName}' could not be created by convention mapping.");
        }

        if (resolvedPlan.Constructor.UsesParameterizedConstructor)
        {
            var values = resolvedPlan.Constructor.Parameters
                .Select(parameter => ConvertValue(
                    parameter.SourceValueFactory(source),
                    parameter.Configuration,
                    parameter.RequiresEnumToString,
                    parameter.RequiresEnumToEnum,
                    parameter.RequiresCollectionMapping,
                    parameter.Parameter.ParameterType))
                .ToArray();

            var constructed = resolvedPlan.Constructor.Constructor!.Invoke(values);
            if (constructed is not null)
                return constructed;
        }

        var destination = Activator.CreateInstance(destinationType);
        if (destination is null)
        {
            throw new InvalidOperationException(
                $"Destination type '{destinationType.FullName}' could not be created by convention mapping.");
        }

        return destination;
    }

    private static void ApplyMappedMember(object source, object destination, ConventionResolvedMember member)
    {
        if (member.Configuration?.HasCondition == true &&
            member.Configuration.Condition is not null &&
            !member.Configuration.Condition(source))
        {
            return;
        }

        var value = member.SourceValueFactory is null
            ? null
            : member.SourceValueFactory(source);

        value = ConvertValue(
            value,
            member.Configuration,
            member.RequiresEnumToString,
            member.RequiresEnumToEnum,
            member.RequiresCollectionMapping,
            member.DestinationProperty.PropertyType);

        member.DestinationProperty.SetValue(destination, value);
    }

    private static object? ConvertValue(
        object? value,
        ConventionMemberMappingDefinition? configuration,
        bool requiresEnumToString,
        bool requiresEnumToEnum,
        bool requiresCollectionMapping,
        Type destinationType)
    {
        if (value is null && configuration?.HasNullSubstitute == true)
        {
            return configuration.NullSubstitute;
        }

        if (value is not null && configuration?.HasConverter == true && configuration.Converter is not null)
        {
            return configuration.Converter(value);
        }

        if (value is not null && requiresEnumToString)
        {
            return value.ToString();
        }

        if (value is not null && requiresEnumToEnum)
        {
            return Enum.Parse(Nullable.GetUnderlyingType(destinationType) ?? destinationType, value.ToString()!);
        }

        if (value is not null && requiresCollectionMapping)
        {
            return MapCollectionShape(value, destinationType);
        }

        return value;
    }

    private static object MapCollectionShape(object value, Type destinationType)
    {
        var itemType = ResolveCollectionItemType(destinationType);
        if (itemType is null)
            return value;

        var list = (System.Collections.IList)Activator.CreateInstance(typeof(List<>).MakeGenericType(itemType))!;
        foreach (var item in (System.Collections.IEnumerable)value)
        {
            list.Add(item);
        }

        if (destinationType.IsArray)
        {
            var array = Array.CreateInstance(itemType, list.Count);
            list.CopyTo(array, 0);
            return array;
        }

        return list;
    }

    private static Type? ResolveCollectionItemType(Type destinationType)
    {
        if (destinationType.IsArray)
            return destinationType.GetElementType();

        return destinationType
            .GetInterfaces()
            .Append(destinationType)
            .Where(type => type.IsGenericType)
            .Where(type =>
                type.GetGenericTypeDefinition() == typeof(IEnumerable<>) ||
                type.GetGenericTypeDefinition() == typeof(IReadOnlyList<>) ||
                type.GetGenericTypeDefinition() == typeof(List<>))
            .Select(type => type.GetGenericArguments()[0])
            .FirstOrDefault();
    }
}
