namespace AstraFlow.Security;

/// <summary>
/// Shared AstraFlow policy for classifying sensitive member, parameter, and tag names.
/// </summary>
public sealed class AstraFlowSensitiveDataPolicy
{
    /// <summary>
    /// Default sensitive-name fragments used by AstraFlow security-aware packages.
    /// </summary>
    public static IReadOnlyList<string> DefaultSensitiveNameFragments { get; } =
    [
        "password",
        "secret",
        "token",
        "apikey",
        "api_key",
        "accesskey",
        "access_key",
        "privatekey",
        "private_key",
        "secretkey",
        "secret_key",
        "credential",
        "credentials",
        "connectionstring",
        "connection_string",
        "hash",
        "salt",
        "recoverycode",
        "recovery_code"
    ];

    private readonly IReadOnlyList<string> normalizedFragments;

    /// <summary>
    /// Creates a sensitive data policy with the supplied fragments, or the AstraFlow default taxonomy.
    /// </summary>
    /// <param name="sensitiveNameFragments">Name fragments that identify sensitive fields, members, parameters, or tags.</param>
    public AstraFlowSensitiveDataPolicy(IEnumerable<string>? sensitiveNameFragments = null)
    {
        SensitiveNameFragments = (sensitiveNameFragments ?? DefaultSensitiveNameFragments)
            .Where(fragment => !string.IsNullOrWhiteSpace(fragment))
            .Select(fragment => fragment.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        normalizedFragments = SensitiveNameFragments
            .Select(NormalizeName)
            .Where(fragment => fragment.Length != 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    /// <summary>
    /// Gets the configured sensitive-name fragments.
    /// </summary>
    public IReadOnlyList<string> SensitiveNameFragments { get; }

    /// <summary>
    /// Returns true when the supplied name appears security-sensitive.
    /// </summary>
    /// <param name="name">A member, parameter, diagnostic field, or telemetry tag name.</param>
    public bool IsSensitiveName(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return false;

        var normalizedName = NormalizeName(name!);
        return normalizedFragments.Any(fragment =>
            normalizedName.IndexOf(fragment, StringComparison.OrdinalIgnoreCase) >= 0);
    }

    /// <summary>
    /// Normalizes a name for sensitive-fragment comparison.
    /// </summary>
    public static string NormalizeName(string name)
    {
        if (name is null)
            throw new ArgumentNullException(nameof(name));

        return name
            .Replace("_", string.Empty)
            .Replace("-", string.Empty)
            .Replace(".", string.Empty)
            .Replace(" ", string.Empty);
    }
}
