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

        var destination = Activator.CreateInstance(destinationType);
        if (destination is null)
        {
            throw new InvalidOperationException(
                $"Destination type '{destinationType.FullName}' could not be created by convention mapping.");
        }

        foreach (var member in resolvedPlan.Members.Where(member => member.CanMap))
        {
            if (member.Configuration?.HasCondition == true &&
                member.Configuration.Condition is not null &&
                !member.Configuration.Condition(source))
            {
                continue;
            }

            var value = member.SourceValueFactory is null
                ? null
                : member.SourceValueFactory(source);

            if (value is null && member.Configuration?.HasNullSubstitute == true)
            {
                value = member.Configuration.NullSubstitute;
            }
            else if (value is not null && member.Configuration?.HasConverter == true && member.Configuration.Converter is not null)
            {
                value = member.Configuration.Converter(value);
            }
            else if (value is not null && member.RequiresEnumToString)
            {
                value = value.ToString();
            }
            else if (value is not null && member.RequiresEnumToEnum)
            {
                value = Enum.Parse(Nullable.GetUnderlyingType(member.DestinationProperty.PropertyType) ?? member.DestinationProperty.PropertyType, value.ToString()!);
            }

            member.DestinationProperty.SetValue(destination, value);
        }

        return destination;
    }
}
