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
        RunHooks(definition.BeforeMapHooks, source, destination);

        foreach (var member in resolvedPlan.Members.Where(member => member.CanMap && !member.IsConstructorBound))
        {
            ApplyMappedMember(source, destination, member);
        }

        RunHooks(definition.AfterMapHooks, source, destination);
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

        RunHooks(definition.BeforeMapHooks, source, destination);

        foreach (var member in resolvedPlan.Members.Where(member =>
            member.CanMap &&
            ConventionMappingPlanBuilder.CanWrite(member.DestinationProperty)))
        {
            ApplyMappedMember(source, destination, member);
        }

        RunHooks(definition.AfterMapHooks, source, destination);
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
                    parameter.ValueTransformer,
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
            member.ValueTransformer,
            member.DestinationProperty.PropertyType);

        var target = ResolveDestinationTarget(destination, member.DestinationPath);
        member.DestinationProperty.SetValue(target, value);
    }

    private static object? ConvertValue(
        object? value,
        ConventionMemberMappingDefinition? configuration,
        bool requiresEnumToString,
        bool requiresEnumToEnum,
        bool requiresCollectionMapping,
        ConventionValueTransformerDefinition? valueTransformer,
        Type destinationType)
    {
        object? result = value;

        if (value is null && configuration?.HasNullSubstitute == true)
        {
            result = configuration.NullSubstitute;
        }
        else if (value is not null && configuration?.HasConverter == true && configuration.Converter is not null)
        {
            result = configuration.Converter(value);
        }
        else if (value is not null && requiresEnumToString)
        {
            result = value.ToString();
        }
        else if (value is not null && requiresEnumToEnum)
        {
            result = Enum.Parse(Nullable.GetUnderlyingType(destinationType) ?? destinationType, value.ToString()!);
        }
        else if (value is not null && requiresCollectionMapping)
        {
            result = MapCollectionShape(value, destinationType);
        }

        if (valueTransformer is not null)
        {
            return valueTransformer.Transformer(result);
        }

        return result;
    }

    private static void RunHooks(
        IReadOnlyList<Action<object, object>> hooks,
        object source,
        object destination)
    {
        foreach (var hook in hooks)
        {
            hook(source, destination);
        }
    }

    private static object ResolveDestinationTarget(object destination, IReadOnlyList<System.Reflection.PropertyInfo> path)
    {
        if (path.Count <= 1)
            return destination;

        object current = destination;
        for (var i = 0; i < path.Count - 1; i++)
        {
            var property = path[i];
            var next = property.GetValue(current);
            if (next is null)
            {
                next = Activator.CreateInstance(property.PropertyType);
                if (next is null)
                {
                    throw new InvalidOperationException(
                        $"Destination path '{property.Name}' could not be created by convention mapping.");
                }

                property.SetValue(current, next);
            }

            current = next;
        }

        return current;
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
