namespace AstraFlow.OpenTelemetry;

/// <summary>
/// Default telemetry redactor. It only returns values that AstraFlow emits after opt-in.
/// </summary>
public sealed class AstraFlowDefaultTelemetryRedactor : IAstraFlowTelemetryRedactor
{
    /// <inheritdoc />
    public string Redact(string tagName, string value)
    {
        return value;
    }
}
