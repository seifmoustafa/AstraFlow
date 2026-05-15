using AstraFlow.Mapper;

namespace AstraFlow.Testing;

/// <summary>
/// Assertion helpers for secure ID codec tests.
/// </summary>
public static class SecureIdAssertions
{
    /// <summary>
    /// Asserts that a secure ID codec can encode and decode the supplied identifier.
    /// </summary>
    /// <param name="codec">The codec under test.</param>
    /// <param name="id">The identifier to round-trip.</param>
    /// <returns>The encoded identifier.</returns>
    public static string ShouldRoundTripSecureId(this ISecureIdCodec codec, Guid id)
    {
        if (codec is null)
        {
            throw new ArgumentNullException(nameof(codec));
        }

        var encoded = codec.Encrypt(id);
        var decoded = codec.TryDecrypt(encoded);

        if (decoded != id)
        {
            throw new AstraFlowAssertionException(
                $"Expected secure ID codec '{codec.GetType().FullName}' to round-trip '{id}', but decoded '{decoded}'.");
        }

        return encoded;
    }
}
