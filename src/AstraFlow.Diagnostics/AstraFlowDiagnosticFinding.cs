namespace AstraFlow.Diagnostics;

/// <summary>
/// One diagnostics finding produced from AstraFlow registrations or validation.
/// </summary>
/// <param name="Severity">Finding severity.</param>
/// <param name="Code">Stable diagnostic code.</param>
/// <param name="Message">Human-readable message.</param>
/// <param name="Subject">Optional type, service, or category the finding describes.</param>
public sealed record AstraFlowDiagnosticFinding(
    DiagnosticSeverity Severity,
    string Code,
    string Message,
    string? Subject = null);
