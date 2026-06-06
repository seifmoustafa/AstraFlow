using FluentValidation.Results;

namespace AstraFlow.FluentValidation;

/// <summary>
/// Options for AstraFlow FluentValidation pipeline behaviors.
/// </summary>
public sealed class AstraFlowValidationOptions
{
    /// <summary>
    /// Gets or sets whether validation stops after the first validator that reports failures.
    /// </summary>
    public bool FailFast { get; set; }

    /// <summary>
    /// Gets or sets an optional hook for localizing validation messages.
    /// Return null to keep FluentValidation's original message.
    /// </summary>
    public Func<ValidationFailure, string?>? LocalizeMessage { get; set; }
}
