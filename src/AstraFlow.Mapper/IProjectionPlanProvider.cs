namespace AstraFlow.Mapper;

/// <summary>
/// Exposes deterministic projection plans for diagnostics, CI reports, and tests.
/// </summary>
public interface IProjectionPlanProvider
{
    /// <summary>
    /// Gets projection plans for registered static and parameterized projections.
    /// </summary>
    IReadOnlyCollection<ProjectionPlan> GetProjectionPlans();
}
