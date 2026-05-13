namespace AstraFlow.Testing;

/// <summary>
/// Exception thrown by AstraFlow testing assertions.
/// </summary>
public sealed class AstraFlowAssertionException : Exception
{
    /// <summary>
    /// Initializes a new assertion exception.
    /// </summary>
    /// <param name="message">The assertion failure message.</param>
    public AstraFlowAssertionException(string message)
        : base(message)
    {
    }
}
