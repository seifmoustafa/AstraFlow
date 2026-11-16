namespace AstraFlow.Assertions;

/// <summary>Assertions for Boolean values.</summary>
public sealed class BooleanAssertions
{
    private readonly bool _actual;

    internal BooleanAssertions(bool actual) => _actual = actual;

    /// <summary>Asserts that the value equals the expected Boolean and adds optional formatted context to a failure message.</summary>
    /// <param name="expected">The expected Boolean value.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public void Be(bool expected, string? because = null, params object?[] becauseArgs)
    {
        if (_actual != expected)
        {
            AssertionFailure.FailWithBecause(
                $"Expected {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.",
                because,
                becauseArgs);
        }
    }

    /// <summary>Asserts that the value is true.</summary>
    public void BeTrue()
    {
        if (!_actual)
        {
            AssertionFailure.Fail("Expected true, but found false.");
        }
    }

    /// <summary>Asserts that the value is true and adds the supplied context to a failure message.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public void BeTrue(string? because, params object?[] becauseArgs)
    {
        if (!_actual)
        {
            AssertionFailure.FailWithBecause("Expected true, but found false.", because, becauseArgs);
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

    /// <summary>Asserts that the value is false and adds the supplied context to a failure message.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public void BeFalse(string? because, params object?[] becauseArgs)
    {
        if (_actual)
        {
            AssertionFailure.FailWithBecause("Expected false, but found true.", because, becauseArgs);
        }
    }
}
