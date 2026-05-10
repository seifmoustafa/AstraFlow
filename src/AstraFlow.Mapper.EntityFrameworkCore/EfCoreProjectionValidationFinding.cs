namespace AstraFlow.Mapper.EntityFrameworkCore;

/// <summary>
/// One EF Core projection translation validation finding.
/// </summary>
/// <param name="Code">Stable EF Core projection finding code.</param>
/// <param name="Message">Human-readable validation message.</param>
/// <param name="SourceType">Projection source type.</param>
/// <param name="DestinationType">Projection destination type.</param>
/// <param name="ProjectionName">Projection name when available.</param>
/// <param name="ImplementationType">Projection implementation type.</param>
/// <param name="ExceptionType">Exception type produced by EF Core translation when available.</param>
public sealed record EfCoreProjectionValidationFinding(
    string Code,
    string Message,
    Type SourceType,
    Type DestinationType,
    string? ProjectionName,
    Type ImplementationType,
    string? ExceptionType);
