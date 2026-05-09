namespace AstraFlow.Mapper;

/// <summary>
/// Small mapping helper for converting raw entity identifiers to secure transit identifiers.
/// </summary>
public sealed class SecureIdMapper
{
    private readonly ISecureIdCodec _codec;

    /// <summary>
    /// Creates a secure identifier mapper.
    /// </summary>
    /// <param name="codec">The application-provided secure identifier codec.</param>
    public SecureIdMapper(ISecureIdCodec codec)
    {
        _codec = codec;
    }

    /// <summary>
    /// Encrypts a required entity identifier for API responses or DTOs.
    /// </summary>
    /// <param name="id">The raw entity identifier.</param>
    /// <returns>The encrypted identifier string.</returns>
    public string Encrypt(Guid id) => _codec.Encrypt(id);

    /// <summary>
    /// Encrypts an optional entity identifier for API responses or DTOs.
    /// </summary>
    /// <param name="id">The raw entity identifier, or null.</param>
    /// <returns>The encrypted identifier string, or null when the input is null.</returns>
    public string? Encrypt(Guid? id) => id.HasValue ? _codec.Encrypt(id.Value) : null;

    /// <summary>
    /// Attempts to decrypt an encrypted identifier.
    /// </summary>
    /// <param name="encryptedId">The encrypted identifier string.</param>
    /// <returns>The decrypted identifier when valid; otherwise null.</returns>
    public Guid? TryDecrypt(string? encryptedId) => _codec.TryDecrypt(encryptedId);
}
