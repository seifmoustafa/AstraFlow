namespace AstraFlow.AspNetCore;

/// <summary>
/// Options for AstraFlow ASP.NET Core integration endpoints.
/// </summary>
public sealed class AstraFlowAspNetCoreOptions
{
    /// <summary>
    /// Gets or sets the diagnostics endpoint path.
    /// </summary>
    public string DiagnosticsEndpointPath { get; set; } = "/_astraflow/diagnostics";

    /// <summary>
    /// Gets or sets the health-summary endpoint path.
    /// </summary>
    public string HealthSummaryPath { get; set; } = "/_astraflow/health";

    /// <summary>
    /// Gets or sets whether diagnostics may run outside development environments.
    /// </summary>
    public bool EnableDiagnosticsOutsideDevelopment { get; set; }

    /// <summary>
    /// Gets or sets whether diagnostics responses include finding details.
    /// Defaults to false so public endpoints expose only aggregate counts.
    /// </summary>
    public bool IncludeDiagnosticsFindings { get; set; }
}
