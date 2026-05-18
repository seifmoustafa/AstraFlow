using AstraFlow.Mapper;
using Microsoft.Extensions.Options;

namespace AstraFlow.Mapper.Conventions;

internal sealed class ConventionMappingPlanProvider : IMappingPlanProvider
{
    private readonly ConventionMappingCatalog _catalog;
    private readonly ConventionMappingOptions _options;

    public ConventionMappingPlanProvider(
        ConventionMappingCatalog catalog,
        IOptions<ConventionMappingOptions> options)
    {
        _catalog = catalog;
        _options = options.Value;
    }

    public IReadOnlyCollection<MappingPlan> GetMappingPlans()
    {
        return _catalog.Definitions
            .Select(definition => ConventionMappingPlanBuilder.Build(definition, _options))
            .OrderBy(plan => plan.SourceType, StringComparer.Ordinal)
            .ThenBy(plan => plan.DestinationType, StringComparer.Ordinal)
            .ToArray();
    }
}
