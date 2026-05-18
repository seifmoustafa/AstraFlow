namespace AstraFlow.Mapper;

/// <summary>
/// Describes a source-to-destination mapping plan for diagnostics.
/// </summary>
/// <param name="SourceType">The source type display name.</param>
/// <param name="DestinationType">The destination type display name.</param>
/// <param name="Members">Member-level mapping decisions.</param>
/// <param name="Findings">Plan findings such as unmapped, ambiguous, or sensitive members.</param>
public sealed record MappingPlan(
    string SourceType,
    string DestinationType,
    IReadOnlyList<MappingPlanMember> Members,
    IReadOnlyList<MappingPlanFinding> Findings);

/// <summary>
/// Describes one member decision inside a mapping plan.
/// </summary>
/// <param name="DestinationMember">The destination member name.</param>
/// <param name="SourceMember">The matched source member name, if any.</param>
/// <param name="Decision">The decision, such as mapped, ignored, or blocked.</param>
/// <param name="Reason">A short reason suitable for diagnostics output.</param>
public sealed record MappingPlanMember(
    string DestinationMember,
    string? SourceMember,
    string Decision,
    string Reason);

/// <summary>
/// Describes a mapping plan diagnostic finding.
/// </summary>
/// <param name="Severity">The finding severity.</param>
/// <param name="Code">Stable finding code.</param>
/// <param name="Member">The related member name, if any.</param>
/// <param name="Message">Human-readable finding message.</param>
public sealed record MappingPlanFinding(
    MappingPlanFindingSeverity Severity,
    string Code,
    string? Member,
    string Message);

/// <summary>
/// Severity for mapping plan diagnostics.
/// </summary>
public enum MappingPlanFindingSeverity
{
    /// <summary>
    /// Informational finding.
    /// </summary>
    Info = 0,

    /// <summary>
    /// Warning finding.
    /// </summary>
    Warning = 1,

    /// <summary>
    /// Error finding.
    /// </summary>
    Error = 2
}
