using System.Text.Json;

namespace AstraFlow.Diagnostics;

/// <summary>
/// Creates framework-neutral diagnostics reports for registered AstraFlow services.
/// </summary>
public interface IAstraFlowDiagnosticsReporter
{
    /// <summary>
    /// Creates a deterministic in-memory diagnostics report.
    /// </summary>
    /// <returns>The diagnostics report.</returns>
    AstraFlowDiagnosticReport CreateReport();

    /// <summary>
    /// Creates a JSON diagnostics report.
    /// </summary>
    /// <param name="jsonOptions">Optional JSON serializer options.</param>
    /// <returns>JSON report text.</returns>
    string CreateJsonReport(JsonSerializerOptions? jsonOptions = null);

    /// <summary>
    /// Creates a Markdown diagnostics report.
    /// </summary>
    /// <returns>Markdown report text.</returns>
    string CreateMarkdownReport();
}
