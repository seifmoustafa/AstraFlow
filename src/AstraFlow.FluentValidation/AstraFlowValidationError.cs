namespace AstraFlow.FluentValidation;

/// <summary>
/// Framework-neutral validation error reported by AstraFlow validation behaviors.
/// </summary>
/// <param name="PropertyName">Validated property name.</param>
/// <param name="Message">Human-readable validation message.</param>
/// <param name="ErrorCode">Optional FluentValidation error code.</param>
/// <param name="Severity">FluentValidation severity name.</param>
public sealed record AstraFlowValidationError(
    string PropertyName,
    string Message,
    string? ErrorCode,
    string Severity);
