using System.Reflection;
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

        var plan = ConventionMappingPlanBuilder.Build(definition, _options);
        ConventionMappingPlanBuilder.ThrowIfInvalid(plan, _options);

        var destination = Activator.CreateInstance(destinationType);
        if (destination is null)
        {
            throw new InvalidOperationException(
                $"Destination type '{destinationType.FullName}' could not be created by convention mapping.");
        }

        var sourceProperties = ConventionMappingPlanBuilder.GetReadableProperties(sourceType)
            .ToDictionary(property => property.Name, StringComparer.Ordinal);
        var destinationProperties = ConventionMappingPlanBuilder.GetWritableProperties(destinationType)
            .ToDictionary(property => property.Name, StringComparer.Ordinal);

        foreach (var member in plan.Members.Where(member => member.Decision == "Mapped"))
        {
            if (member.SourceMember is null)
                continue;

            var sourceProperty = GetSourceProperty(sourceProperties, member.SourceMember);
            var destinationProperty = destinationProperties[member.DestinationMember];
            destinationProperty.SetValue(destination, sourceProperty.GetValue(source));
        }

        return destination;
    }

    private static PropertyInfo GetSourceProperty(
        IReadOnlyDictionary<string, PropertyInfo> sourceProperties,
        string sourceMember)
    {
        if (sourceProperties.TryGetValue(sourceMember, out var exact))
            return exact;

        return sourceProperties.Values.Single(property =>
            string.Equals(property.Name, sourceMember, StringComparison.OrdinalIgnoreCase));
    }
}
