namespace AstraFlow.Mapper;

/// <summary>
/// Describes one registered projection for deterministic diagnostics and CI reports.
/// </summary>
/// <param name="SourceType">Projection source type display name.</param>
/// <param name="DestinationType">Projection destination type display name.</param>
/// <param name="ProjectionName">Projection name when available.</param>
/// <param name="ImplementationType">Projection implementation type display name.</param>
/// <param name="ParameterType">Projection parameter object type display name when available.</param>
/// <param name="Parameters">Parameter object member metadata.</param>
/// <param name="Members">Destination member decisions found in the projection expression.</param>
/// <param name="Findings">Projection plan findings.</param>
public sealed record ProjectionPlan(
    string SourceType,
    string DestinationType,
    string? ProjectionName,
    string ImplementationType,
    string? ParameterType,
    IReadOnlyList<ProjectionParameterMember> Parameters,
    IReadOnlyList<ProjectionPlanMember> Members,
    IReadOnlyList<ProjectionPlanFinding> Findings);

/// <summary>
/// Describes one public projection parameter object member.
/// </summary>
/// <param name="Name">Parameter member name.</param>
/// <param name="Type">Parameter member type display name.</param>
/// <param name="IsSensitive">Whether the member name looks sensitive and should not be logged as a value.</param>
public sealed record ProjectionParameterMember(string Name, string Type, bool IsSensitive);

/// <summary>
/// Describes one destination member decision inside a projection plan.
/// </summary>
/// <param name="DestinationMember">Destination member or constructor parameter name.</param>
/// <param name="SourceExpression">Source expression summary without payload values.</param>
/// <param name="Decision">Decision such as constructed, assigned, parameterized, or unknown.</param>
/// <param name="Reason">Short diagnostic reason.</param>
public sealed record ProjectionPlanMember(
    string DestinationMember,
    string? SourceExpression,
    string Decision,
    string Reason);

/// <summary>
/// Describes one projection plan finding.
/// </summary>
/// <param name="Severity">Finding severity.</param>
/// <param name="Code">Stable finding code.</param>
/// <param name="Member">Related member name, if available.</param>
/// <param name="Message">Human-readable finding message.</param>
public sealed record ProjectionPlanFinding(
    MappingPlanFindingSeverity Severity,
    string Code,
    string? Member,
    string Message);
