namespace AstraFlow.Mapper.EntityFrameworkCore;

/// <summary>
/// EF Core projection translation validation result.
/// </summary>
/// <param name="Findings">Translation findings produced by EF Core.</param>
/// <param name="ProviderName">EF Core provider name used for validation.</param>
/// <param name="ValidatedProjectionCount">Number of projections validated against the provider.</param>
public sealed record EfCoreProjectionValidationReport(
    IReadOnlyList<EfCoreProjectionValidationFinding> Findings,
    string? ProviderName = null,
    int ValidatedProjectionCount = 0)
{
    /// <summary>
    /// Gets whether the report contains at least one translation finding.
    /// </summary>
    public bool HasFindings => Findings.Count != 0;
}
