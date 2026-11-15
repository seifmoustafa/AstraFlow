namespace AstraFlow.Assertions;

/// <summary>Represents a failed AstraFlow assertion.</summary>
public sealed class AstraFlowAssertionException : Exception
{
    /// <summary>Initializes a new assertion exception.</summary>
    /// <param name="message">A safe, actionable failure description.</param>
    public AstraFlowAssertionException(string message)
        : base(message)
    {
    }
}
