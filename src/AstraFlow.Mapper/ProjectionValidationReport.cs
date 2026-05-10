namespace AstraFlow.Mapper;

/// <summary>
/// Projection validation result for startup checks, diagnostics, and tests.
/// </summary>
/// <param name="Findings">Projection validation findings.</param>
public sealed record ProjectionValidationReport(IReadOnlyList<ProjectionValidationFinding> Findings)
{
    /// <summary>
    /// Gets whether the report contains at least one finding.
    /// </summary>
    public bool HasFindings => Findings.Count != 0;
}
