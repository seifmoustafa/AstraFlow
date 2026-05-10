namespace AstraFlow.Mediator;

/// <summary>
/// Configuration options that applications may use when composing AstraFlow mediator registration.
/// The built-in registration overload accepts the current coverage flag directly to keep v1 setup explicit.
/// </summary>
public sealed class MediatorOptions
{
    /// <summary>
    /// Configuration section name used for mediator options.
    /// </summary>
    public const string SectionName = "Mediator";

    /// <summary>
    /// Gets or sets whether scanned concrete request contracts must have exactly one registered handler
    /// when an application chooses to bind this option in its own composition root.
    /// </summary>
    public bool ValidateRequestHandlerCoverage { get; set; } = true;
}
