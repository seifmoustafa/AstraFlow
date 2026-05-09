namespace AstraFlow.Mediator;

/// <summary>
/// Configuration options for AstraFlow mediator registration.
/// </summary>
public sealed class MediatorOptions
{
    /// <summary>
    /// Configuration section name used for mediator options.
    /// </summary>
    public const string SectionName = "Mediator";

    /// <summary>
    /// Gets or sets whether scanned concrete request contracts must have exactly one registered handler.
    /// </summary>
    public bool ValidateRequestHandlerCoverage { get; set; } = true;
}
