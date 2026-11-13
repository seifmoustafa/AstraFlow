namespace AstraFlow.Assertions;

/// <summary>Assertions for Boolean values.</summary>
public sealed class BooleanAssertions
{
    private readonly bool _actual;

    internal BooleanAssertions(bool actual) => _actual = actual;

    /// <summary>Asserts that the value is true.</summary>
    public void BeTrue()
    {
        if (!_actual)
        {
            AssertionFailure.Fail("Expected true, but found false.");
        }
    }

    /// <summary>Asserts that the value is false.</summary>
    public void BeFalse()
    {
        if (_actual)
        {
            AssertionFailure.Fail("Expected false, but found true.");
        }
    }
}
