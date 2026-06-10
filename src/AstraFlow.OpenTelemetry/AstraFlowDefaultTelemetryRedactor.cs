using AstraFlow.Security;

namespace AstraFlow.OpenTelemetry;

/// <summary>
/// Default telemetry redactor backed by the shared AstraFlow redaction policy.
/// </summary>
public sealed class AstraFlowDefaultTelemetryRedactor : IAstraFlowTelemetryRedactor
{
    private readonly AstraFlowRedactionPolicy redactionPolicy;

    /// <summary>
    /// Creates a redactor with the default AstraFlow redaction policy.
    /// </summary>
    public AstraFlowDefaultTelemetryRedactor()
        : this(new AstraFlowRedactionPolicy())
    {
    }

    /// <summary>
    /// Creates a redactor with the supplied shared redaction policy.
    /// </summary>
    public AstraFlowDefaultTelemetryRedactor(AstraFlowRedactionPolicy redactionPolicy)
    {
        this.redactionPolicy = redactionPolicy ?? throw new ArgumentNullException(nameof(redactionPolicy));
    }

    /// <inheritdoc />
    public string Redact(string tagName, string value)
    {
        return redactionPolicy.RedactValue(tagName, value);
    }
}
