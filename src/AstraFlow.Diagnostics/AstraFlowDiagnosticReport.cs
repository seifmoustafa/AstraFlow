using AstraFlow.Mapper;

namespace AstraFlow.Diagnostics;

/// <summary>
/// Complete deterministic diagnostics report for AstraFlow registrations.
/// </summary>
/// <param name="RequestHandlers">Discovered request handler registrations.</param>
/// <param name="NotificationHandlers">Discovered notification handler registrations.</param>
/// <param name="PipelineBehaviors">Discovered pipeline behavior registrations.</param>
/// <param name="MappingRules">Discovered mapping rule registrations.</param>
/// <param name="MappingPlans">Discovered mapping plans.</param>
/// <param name="Projections">Discovered projection registrations.</param>
/// <param name="Findings">Diagnostics findings.</param>
/// <param name="Summary">Health-check-ready report summary.</param>
public sealed record AstraFlowDiagnosticReport(
    IReadOnlyList<AstraFlowDiagnosticRegistration> RequestHandlers,
    IReadOnlyList<AstraFlowDiagnosticRegistration> NotificationHandlers,
    IReadOnlyList<AstraFlowDiagnosticRegistration> PipelineBehaviors,
    IReadOnlyList<AstraFlowDiagnosticRegistration> MappingRules,
    IReadOnlyList<MappingPlan> MappingPlans,
    IReadOnlyList<AstraFlowDiagnosticRegistration> Projections,
    IReadOnlyList<AstraFlowDiagnosticFinding> Findings,
    AstraFlowDiagnosticsSummary Summary);
