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

    /// <summary>Asserts that the value equals the expected GUID and includes formatted failure context.</summary>
    public void Be(Guid expected, string? because, params object?[] becauseArgs)
    {
        if (_actual != expected)
        {
            AssertionFailure.FailWithBecause("Expected GUID values to be equal.", because, becauseArgs);
        }
    }

    /// <summary>Asserts that the value differs from the supplied GUID.</summary>
    public void NotBe(Guid unexpected)
    {
        if (_actual == unexpected)
        {
            AssertionFailure.Fail("Expected GUID values to differ.");
        }
    }

    /// <summary>Asserts that the value equals one of the supplied GUIDs.</summary>
    public void BeOneOf(params Guid[] expectations)
    {
        if (expectations is null)
        {
            throw new System.ArgumentNullException(nameof(expectations));
        }

        foreach (var expected in expectations)
        {
            if (_actual == expected)
            {
                return;
            }
        }

        AssertionFailure.Fail("Expected GUID to equal one of the supplied choices.");
    }
}
