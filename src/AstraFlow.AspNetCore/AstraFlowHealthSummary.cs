using AstraFlow.Diagnostics;

namespace AstraFlow.AspNetCore;

/// <summary>
/// HTTP-friendly health summary built from AstraFlow diagnostics.
/// </summary>
/// <param name="Status">Healthy when no diagnostics errors or fatal findings exist; otherwise Unhealthy.</param>
/// <param name="Summary">Aggregate diagnostics counts.</param>
public sealed record AstraFlowHealthSummary(string Status, AstraFlowDiagnosticsSummary Summary)
{
    /// <summary>
    /// Creates a health summary from a diagnostics report.
    /// </summary>
    public static AstraFlowHealthSummary FromReport(AstraFlowDiagnosticReport report)
    {
        if (report is null)
            throw new ArgumentNullException(nameof(report));

        return new AstraFlowHealthSummary(
            report.Summary.HasErrors ? "Unhealthy" : "Healthy",
            report.Summary);
    }
}
