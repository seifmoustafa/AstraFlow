namespace AstraFlow.Assertions;

using System.Text.RegularExpressions;

/// <summary>Assertions for strings. Comparisons use ordinal semantics.</summary>
public sealed class StringAssertions
{
    private readonly string? _actual;

    internal StringAssertions(string? actual) => _actual = actual;

    /// <summary>Gets the string being asserted.</summary>
    public string? Subject => _actual;

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

    /// <summary>Asserts ordinal equality and includes formatted context in a failure message.</summary>
    public void Be(string? expected, string? because, params object?[] becauseArgs)
    {
        if (!string.Equals(_actual, expected, StringComparison.Ordinal))
        {
            AssertionFailure.FailWithBecause($"Expected strings to be ordinally equal; actual string length was {_actual?.Length.ToString() ?? "<null>"}.", because, becauseArgs);
        }
    }

    /// <summary>Asserts that the string is not ordinally equal to the unexpected value.</summary>
    public void NotBe(string? unexpected)
    {
        if (string.Equals(_actual, unexpected, StringComparison.Ordinal))
        {
            AssertionFailure.Fail("Expected strings not to be ordinally equal.");
        }
    }

    /// <summary>Asserts ordinal inequality and includes formatted context in a failure message.</summary>
    public void NotBe(string? unexpected, string? because, params object?[] becauseArgs)
    {
        if (string.Equals(_actual, unexpected, StringComparison.Ordinal))
        {
            AssertionFailure.FailWithBecause("Expected strings not to be ordinally equal.", because, becauseArgs);
        }
    }

    /// <summary>Asserts that the string equals one of the supplied choices using ordinal comparison.</summary>
    public void BeOneOf(params string?[] expectations)
    {
        if (expectations is null)
        {
            throw new ArgumentNullException(nameof(expectations));
        }

        foreach (var expected in expectations)
        {
            if (string.Equals(_actual, expected, StringComparison.Ordinal))
            {
                return;
            }
        }

        AssertionFailure.Fail("Expected string to equal one of the supplied choices.");
    }

    /// <summary>Asserts that the string is not null.</summary>
    public void NotBeNull()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a non-null string.");
        }
    }

    /// <summary>Asserts that the string is neither null nor empty.</summary>
    public void NotBeEmpty()
    {
        if (string.IsNullOrEmpty(_actual))
        {
            AssertionFailure.Fail("Expected a non-empty string.");
        }
    }

    /// <summary>Asserts that the string is non-empty and includes formatted context in a failure message.</summary>
    public void NotBeEmpty(string? because, params object?[] becauseArgs)
    {
        if (string.IsNullOrEmpty(_actual))
        {
            AssertionFailure.FailWithBecause("Expected a non-empty string.", because, becauseArgs);
        }
    }

    /// <summary>Asserts that the string has the specified length.</summary>
    public void HaveLength(int expected)
    {
        if (expected < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(expected));
        }

        if (_actual is null || _actual.Length != expected)
        {
            AssertionFailure.Fail($"Expected string length {expected}, but actual length was {_actual?.Length.ToString() ?? "<null>"}.");
        }
    }

    /// <summary>Asserts that the string does not start with the specified ordinal value.</summary>
    public void NotStartWith(string unexpected)
    {
        if (unexpected is null)
        {
            throw new ArgumentNullException(nameof(unexpected));
        }

        if (_actual is null || _actual.StartsWith(unexpected, StringComparison.Ordinal))
        {
            AssertionFailure.Fail("Expected string not to start with the specified value.");
        }
    }

    /// <summary>Asserts that the string does not end with the specified ordinal value.</summary>
    public void NotEndWith(string unexpected)
    {
        if (unexpected is null)
        {
            throw new ArgumentNullException(nameof(unexpected));
        }

        if (_actual is null || _actual.EndsWith(unexpected, StringComparison.Ordinal))
        {
            AssertionFailure.Fail("Expected string not to end with the specified value.");
        }
    }

    /// <summary>Asserts that the string equals the expected value using the specified comparison.</summary>
    public void BeEquivalentTo(string? expected, StringComparison comparison)
    {
        if (!Enum.IsDefined(typeof(StringComparison), comparison))
        {
            throw new ArgumentOutOfRangeException(nameof(comparison));
        }

        if (!string.Equals(_actual, expected, comparison))
        {
            AssertionFailure.Fail("Expected strings to be equal using the selected comparison.");
        }
    }

    /// <summary>Asserts that the entire string matches an ordinal wildcard pattern.</summary>
    public void Match(string pattern)
    {
        if (pattern is null)
        {
            throw new ArgumentNullException(nameof(pattern));
        }

        if (pattern.Length == 0)
        {
            throw new ArgumentException("A wildcard pattern must not be empty.", nameof(pattern));
        }

        if (_actual is null || !IsGlobMatch(_actual, pattern))
        {
            AssertionFailure.Fail("Expected string to match the wildcard pattern.");
        }
    }

    /// <summary>Asserts that the string matches a regular expression within the specified timeout.</summary>
    public void MatchRegex(string pattern, TimeSpan timeout)
    {
        if (timeout <= TimeSpan.Zero || timeout == Regex.InfiniteMatchTimeout)
        {
            throw new ArgumentOutOfRangeException(nameof(timeout));
        }

        if (pattern is null)
        {
            throw new ArgumentNullException(nameof(pattern));
        }

        if (pattern.Length == 0)
        {
            throw new ArgumentException("A regular expression pattern must not be empty.", nameof(pattern));
        }

        Regex regex;
        try
        {
            regex = new Regex(pattern, RegexOptions.None, timeout);
        }
        catch (ArgumentOutOfRangeException)
        {
            throw new ArgumentOutOfRangeException(nameof(timeout));
        }
        catch (ArgumentException)
        {
            throw new ArgumentException("The regular expression pattern is invalid.", nameof(pattern));
        }

        try
        {
            if (_actual is null || !regex.IsMatch(_actual))
            {
                AssertionFailure.Fail("Expected string to match the regular expression.");
            }
        }
        catch (RegexMatchTimeoutException)
        {
            AssertionFailure.Fail("Regular expression matching exceeded its timeout.");
        }
    }

    private static bool IsGlobMatch(string value, string pattern)
    {
        var valueIndex = 0;
        var patternIndex = 0;
        var starIndex = -1;
        var retryValueIndex = -1;

        while (valueIndex < value.Length)
        {
            if (patternIndex < pattern.Length && pattern[patternIndex] == '?')
            {
                patternIndex++;
                valueIndex++;
            }
            else if (patternIndex < pattern.Length && pattern[patternIndex] == '*')
            {
                starIndex = patternIndex++;
                retryValueIndex = valueIndex;
            }
            else if (patternIndex < pattern.Length && pattern[patternIndex] == value[valueIndex])
            {
                patternIndex++;
                valueIndex++;
            }
            else if (starIndex >= 0)
            {
                patternIndex = starIndex + 1;
                valueIndex = ++retryValueIndex;
            }
            else
            {
                return false;
            }
        }

        while (patternIndex < pattern.Length && pattern[patternIndex] == '*')
        {
            patternIndex++;
        }

        return patternIndex == pattern.Length;
    }

    /// <summary>Asserts that the string is empty; null is not considered empty.</summary>
    public void BeEmpty()
    {
        if (_actual is null || _actual.Length != 0)
        {
            AssertionFailure.Fail($"Expected an empty string, but actual string length was {_actual?.Length.ToString() ?? "<null>"}.");
        }
    }

    /// <summary>Asserts that the string is empty and includes formatted context in a failure message.</summary>
    public void BeEmpty(string? because, params object?[] becauseArgs)
    {
        if (_actual is null || _actual.Length != 0)
        {
            AssertionFailure.FailWithBecause($"Expected an empty string, but actual string length was {_actual?.Length.ToString() ?? "<null>"}.", because, becauseArgs);
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
