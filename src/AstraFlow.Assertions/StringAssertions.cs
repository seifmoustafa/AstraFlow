namespace AstraFlow.Assertions;

/// <summary>Assertions for strings. Comparisons use ordinal semantics.</summary>
public sealed class StringAssertions
{
    private readonly string? _actual;

    internal StringAssertions(string? actual) => _actual = actual;

    /// <summary>Returns this assertion object for an additional related check.</summary>
    public StringAssertions And => this;

    /// <summary>Asserts that the string equals the expected string using ordinal comparison.</summary>
    public void Be(string? expected)
    {
        if (!string.Equals(_actual, expected, StringComparison.Ordinal))
        {
            AssertionFailure.Fail($"Expected strings to be ordinally equal; actual string length was {_actual?.Length.ToString() ?? "<null>"}.");
        }
    }

    /// <summary>Asserts that the string is empty; null is not considered empty.</summary>
    public void BeEmpty()
    {
        if (_actual is null || _actual.Length != 0)
        {
            AssertionFailure.Fail($"Expected an empty string, but actual string length was {_actual?.Length.ToString() ?? "<null>"}.");
        }
    }

    /// <summary>Asserts that the string is null.</summary>
    public void BeNull()
    {
        if (_actual is not null)
        {
            AssertionFailure.Fail($"Expected a null string, but actual string length was {_actual.Length}.");
        }
    }

    /// <summary>Asserts that the string is null or empty.</summary>
    public void BeNullOrEmpty()
    {
        if (!string.IsNullOrEmpty(_actual))
        {
            AssertionFailure.Fail($"Expected a null or empty string, but actual length was {_actual!.Length}.");
        }
    }

    /// <summary>Asserts that the string is not null or empty.</summary>
    public void NotBeNullOrEmpty()
    {
        if (string.IsNullOrEmpty(_actual))
        {
            AssertionFailure.Fail("Expected a non-empty string, but found null or empty.");
        }
    }

    /// <summary>Asserts that the string is null, empty, or whitespace.</summary>
    public void BeNullOrWhiteSpace()
    {
        if (!string.IsNullOrWhiteSpace(_actual))
        {
            AssertionFailure.Fail($"Expected a null, empty, or whitespace string, but actual length was {_actual!.Length}.");
        }
    }

    /// <summary>Asserts that the string is not null, empty, or whitespace.</summary>
    public void NotBeNullOrWhiteSpace()
    {
        if (string.IsNullOrWhiteSpace(_actual))
        {
            AssertionFailure.Fail("Expected a non-whitespace string, but found null, empty, or whitespace.");
        }
    }

    /// <summary>Asserts that the string contains the specified substring.</summary>
    public StringAssertions Contain(string expected)
    {
        if (_actual is null || expected is null || _actual.IndexOf(expected, StringComparison.Ordinal) < 0)
        {
            AssertionFailure.Fail($"Expected string to contain a substring of length {expected?.Length.ToString() ?? "<null>"}; actual string length was {_actual?.Length.ToString() ?? "<null>"}.");
        }

        return this;
    }

    /// <summary>Asserts that the string does not contain the specified substring.</summary>
    public void NotContain(string unexpected)
    {
        if (_actual is not null && unexpected is not null && _actual.IndexOf(unexpected, StringComparison.Ordinal) >= 0)
        {
            AssertionFailure.Fail($"Expected string not to contain a substring of length {unexpected.Length}, but it did.");
        }
    }

    /// <summary>Asserts that the string starts with the specified value.</summary>
    public void StartWith(string expected)
    {
        if (_actual is null || expected is null || !_actual.StartsWith(expected, StringComparison.Ordinal))
        {
            AssertionFailure.Fail($"Expected string to start with a value of length {expected?.Length.ToString() ?? "<null>"}; actual string length was {_actual?.Length.ToString() ?? "<null>"}.");
        }
    }

    /// <summary>Asserts that the string ends with the specified value.</summary>
    public void EndWith(string expected)
    {
        if (_actual is null || expected is null || !_actual.EndsWith(expected, StringComparison.Ordinal))
        {
            AssertionFailure.Fail($"Expected string to end with a value of length {expected?.Length.ToString() ?? "<null>"}; actual string length was {_actual?.Length.ToString() ?? "<null>"}.");
        }
    }
}
