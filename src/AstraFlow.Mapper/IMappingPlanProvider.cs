namespace AstraFlow.Mapper;

/// <summary>
/// Exposes deterministic mapping plans for diagnostics and tests.
/// </summary>
public interface IMappingPlanProvider
{
    /// <summary>
    /// Gets the mapping plans owned by this provider.
    /// </summary>
    /// <returns>Mapping plans ordered deterministically by source and destination type.</returns>
    IReadOnlyCollection<MappingPlan> GetMappingPlans();
}
