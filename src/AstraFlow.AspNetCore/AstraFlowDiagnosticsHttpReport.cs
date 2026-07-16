using AstraFlow.Diagnostics;

namespace AstraFlow.AspNetCore;

/// <summary>
/// Redacted HTTP diagnostics payload for AstraFlow ASP.NET Core endpoints.
/// </summary>
/// <param name="Summary">Aggregate diagnostics counts.</param>
/// <param name="Findings">Optional diagnostics findings. Null unless explicitly enabled.</param>
public sealed record AstraFlowDiagnosticsHttpReport(
    AstraFlowDiagnosticsSummary Summary,
    IReadOnlyList<AstraFlowDiagnosticFinding>? Findings);
