namespace AstraFlow.OpenTelemetry;

/// <summary>
/// Redacts values before they are used as optional telemetry tags.
/// </summary>
public interface IAstraFlowTelemetryRedactor
{
    /// <summary>
    /// Redacts a value for the named telemetry tag.
    /// </summary>
    string Redact(string tagName, string value);
}
