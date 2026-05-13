using AstraFlow.Diagnostics;

namespace AstraFlow.Testing;

/// <summary>
/// Assertion helpers for AstraFlow diagnostics reports.
/// </summary>
public static class DiagnosticsAssertions
{
    /// <summary>
    /// Asserts that the diagnostics report has no error or fatal findings.
    /// </summary>
    /// <param name="report">The diagnostics report.</param>
    /// <returns>The same diagnostics report.</returns>
    public static AstraFlowDiagnosticReport ShouldHaveNoDiagnosticErrors(
        this AstraFlowDiagnosticReport report)
    {
        if (report is null)
        {
            throw new ArgumentNullException(nameof(report));
        }

        if (report.Summary.HasErrors)
        {
            throw new AstraFlowAssertionException(
                $"Expected diagnostics report to have no errors, but found {report.Summary.ErrorCount} errors and {report.Summary.FatalCount} fatal findings.");
        }

        return report;
    }

    /// <summary>
    /// Asserts that the diagnostics report contains a finding with the supplied code.
    /// </summary>
    public static AstraFlowDiagnosticFinding ShouldHaveDiagnosticFinding(
        this AstraFlowDiagnosticReport report,
        string code)
    {
        if (report is null)
        {
            throw new ArgumentNullException(nameof(report));
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Diagnostic code is required.", nameof(code));
        }

        var finding = report.Findings.FirstOrDefault(candidate => candidate.Code == code);
        if (finding is null)
        {
            throw new AstraFlowAssertionException(
                $"Expected diagnostics finding '{code}', but it was not present.");
        }

        return finding;
    }
}
