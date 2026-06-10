namespace AstraFlow.Security;

/// <summary>
/// Shared AstraFlow value redaction policy.
/// </summary>
public sealed class AstraFlowRedactionPolicy
{
    /// <summary>
    /// Default replacement emitted when a value is redacted.
    /// </summary>
    public const string DefaultRedactedValue = "[redacted]";

    /// <summary>
    /// Creates the default AstraFlow redaction policy.
    /// </summary>
    public AstraFlowRedactionPolicy()
        : this(new AstraFlowSensitiveDataPolicy(), DefaultRedactedValue)
    {
    }

    /// <summary>
    /// Creates a redaction policy backed by the supplied sensitive data policy.
    /// </summary>
    /// <param name="sensitiveDataPolicy">Sensitive-name classifier.</param>
    /// <param name="redactedValue">Replacement returned for sensitive values.</param>
    public AstraFlowRedactionPolicy(
        AstraFlowSensitiveDataPolicy sensitiveDataPolicy,
        string redactedValue = DefaultRedactedValue)
    {
        SensitiveDataPolicy = sensitiveDataPolicy ?? throw new ArgumentNullException(nameof(sensitiveDataPolicy));
        RedactedValue = string.IsNullOrWhiteSpace(redactedValue)
            ? DefaultRedactedValue
            : redactedValue;
    }

    /// <summary>
    /// Gets the sensitive-name classifier used by this redaction policy.
    /// </summary>
    public AstraFlowSensitiveDataPolicy SensitiveDataPolicy { get; }

    /// <summary>
    /// Gets the replacement returned for sensitive values.
    /// </summary>
    public string RedactedValue { get; }

    /// <summary>
    /// Redacts the value when the associated name is classified as sensitive.
    /// </summary>
    /// <param name="name">A member, parameter, diagnostic field, or telemetry tag name.</param>
    /// <param name="value">The value that may need redaction.</param>
    public string RedactValue(string? name, string? value)
    {
        if (SensitiveDataPolicy.IsSensitiveName(name))
            return RedactedValue;

        return value ?? string.Empty;
    }
}
