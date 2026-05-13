using AstraFlow.Mapper;

namespace AstraFlow.Testing;

/// <summary>
/// Deterministic secure ID codec for tests. It is not encryption and must not be used in production.
/// </summary>
public sealed class TestSecureIdCodec : ISecureIdCodec
{
    private const string Prefix = "test:";

    /// <summary>
    /// Encodes a GUID in a deterministic test-only format.
    /// </summary>
    public string Encrypt(Guid id)
    {
        return Prefix + id.ToString("N");
    }

    /// <summary>
    /// Decodes a GUID from the deterministic test-only format.
    /// </summary>
    public Guid? TryDecrypt(string? encryptedId)
    {
        if (string.IsNullOrWhiteSpace(encryptedId))
        {
            return null;
        }

        var value = encryptedId!;
        if (!value.StartsWith(Prefix, StringComparison.Ordinal))
        {
            return null;
        }

        var raw = value.Substring(Prefix.Length);
        return Guid.TryParseExact(raw, "N", out var id) ? id : null;
    }
}
