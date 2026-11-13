namespace AstraFlow.Assertions;

/// <summary>Assertions for GUID values.</summary>
public sealed class GuidAssertions
{
    private readonly Guid _actual;

    internal GuidAssertions(Guid actual) => _actual = actual;

    /// <summary>Asserts that the value is <see cref="Guid.Empty"/>.</summary>
    public void BeEmpty()
    {
        if (_actual != Guid.Empty)
        {
            AssertionFailure.Fail("Expected an empty GUID.");
        }
    }

    /// <summary>Asserts that the value is not <see cref="Guid.Empty"/>.</summary>
    public void NotBeEmpty()
    {
        if (_actual == Guid.Empty)
        {
            AssertionFailure.Fail("Expected a non-empty GUID.");
        }
    }

    /// <summary>Asserts that the value equals the expected GUID.</summary>
    public void Be(Guid expected)
    {
        if (_actual != expected)
        {
            AssertionFailure.Fail("Expected GUID values to be equal.");
        }
    }
}
