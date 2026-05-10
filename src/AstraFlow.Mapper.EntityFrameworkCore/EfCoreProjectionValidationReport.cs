namespace AstraFlow.Mapper.EntityFrameworkCore;

/// <summary>
/// EF Core projection translation validation result.
/// </summary>
/// <param name="Findings">Translation findings produced by EF Core.</param>
public sealed record EfCoreProjectionValidationReport(IReadOnlyList<EfCoreProjectionValidationFinding> Findings)
{
    /// <summary>
    /// Gets whether the report contains at least one translation finding.
    /// </summary>
    public bool HasFindings => Findings.Count != 0;
}
