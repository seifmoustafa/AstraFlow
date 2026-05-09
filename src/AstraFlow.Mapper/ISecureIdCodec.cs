namespace AstraFlow.Mapper;

/// <summary>
/// Encrypts and decrypts entity identifiers without coupling AstraFlow to an application-specific cryptography implementation.
/// </summary>
public interface ISecureIdCodec
{
    /// <summary>
    /// Encrypts a required entity identifier for transit.
    /// </summary>
    /// <param name="id">The raw entity identifier.</param>
    /// <returns>The encrypted identifier string.</returns>
    string Encrypt(Guid id);

    /// <summary>
    /// Attempts to decrypt an encrypted identifier.
    /// </summary>
    /// <param name="encryptedId">The encrypted identifier string.</param>
    /// <returns>The decrypted identifier when valid; otherwise null.</returns>
    Guid? TryDecrypt(string? encryptedId);
}
