namespace AstraFlow.Mapper;

/// <summary>
/// One projection validation finding.
/// </summary>
/// <param name="Severity">Finding severity derived from mapper projection validation options.</param>
/// <param name="Code">Stable projection finding code.</param>
/// <param name="Message">Human-readable validation message.</param>
/// <param name="SourceType">Projection source type when available.</param>
/// <param name="DestinationType">Projection destination type when available.</param>
/// <param name="ProjectionName">Projection name when available.</param>
/// <param name="ImplementationType">Projection implementation type when available.</param>
public sealed record ProjectionValidationFinding(
    ProjectionValidationMode Severity,
    string Code,
    string Message,
    Type? SourceType = null,
    Type? DestinationType = null,
    string? ProjectionName = null,
    Type? ImplementationType = null);
