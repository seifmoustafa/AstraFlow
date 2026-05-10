namespace AstraFlow.Diagnostics;

/// <summary>
/// Health-check-ready summary of an AstraFlow diagnostics report.
/// </summary>
/// <param name="RequestHandlerCount">Number of request handler registrations.</param>
/// <param name="NotificationHandlerCount">Number of notification handler registrations.</param>
/// <param name="PipelineBehaviorCount">Number of pipeline behavior registrations.</param>
/// <param name="MappingRuleCount">Number of mapping rule registrations.</param>
/// <param name="ProjectionCount">Number of projection registrations.</param>
/// <param name="InfoCount">Number of informational findings.</param>
/// <param name="WarningCount">Number of warning findings.</param>
/// <param name="ErrorCount">Number of error findings.</param>
/// <param name="FatalCount">Number of fatal findings.</param>
public sealed record AstraFlowDiagnosticsSummary(
    int RequestHandlerCount,
    int NotificationHandlerCount,
    int PipelineBehaviorCount,
    int MappingRuleCount,
    int ProjectionCount,
    int InfoCount,
    int WarningCount,
    int ErrorCount,
    int FatalCount)
{
    /// <summary>
    /// Gets whether the report has any error or fatal findings.
    /// </summary>
    public bool HasErrors => ErrorCount != 0 || FatalCount != 0;
}
