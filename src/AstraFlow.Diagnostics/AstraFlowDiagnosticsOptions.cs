namespace AstraFlow.Diagnostics;

/// <summary>
/// Options for framework-neutral AstraFlow diagnostics reporting.
/// </summary>
public sealed class AstraFlowDiagnosticsOptions
{
    /// <summary>
    /// Gets marker types whose assemblies should be scanned for request contracts in addition to assemblies
    /// discovered from registered AstraFlow services.
    /// </summary>
    public IList<Type> AssemblyMarkerTypes { get; } = [];

    /// <summary>
    /// Gets or sets whether diagnostics should look for scanned request contracts with missing handlers.
    /// </summary>
    public bool ValidateRequestCoverage { get; set; } = true;

    /// <summary>
    /// Gets or sets whether diagnostics should resolve the mapper validator and report catalog validation failures.
    /// </summary>
    public bool ValidateMappingCatalog { get; set; } = true;

    /// <summary>
    /// Gets or sets whether successful registration counts should be emitted as informational findings.
    /// </summary>
    public bool IncludeInfoFindings { get; set; } = true;
}
