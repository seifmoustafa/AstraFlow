using System;
using System.Collections.Generic;

namespace AstraFlow.Assertions;

/// <summary>Assertions for dictionary keys and values.</summary>
public sealed class DictionaryAssertions<TKey, TValue>
    where TKey : notnull
{
    private readonly IDictionary<TKey, TValue>? _actual;

    internal DictionaryAssertions(IDictionary<TKey, TValue>? actual) => _actual = actual;

    /// <summary>Returns this assertion object for an additional related check.</summary>
    public DictionaryAssertions<TKey, TValue> And => this;

    /// <summary>Asserts that the dictionary is structurally equivalent to the expected value.</summary>
    /// <param name="expected">The expected dictionary or object graph.</param>
    /// <param name="configure">Optional settings for member selection, exclusions, custom comparers, fields, ordering, and maximum graph depth.</param>
    public DictionaryAssertions<TKey, TValue> BeEquivalentTo<TExpected>(TExpected expected, Action<EquivalencyOptions>? configure = null)
    {
        var options = new EquivalencyOptions();
        configure?.Invoke(options);
        options.ValidateIncludedPaths(expected);
        var comparer = new ObjectGraphEquivalencyComparer(options);
        if (!comparer.TryCompare(_actual, expected, out var mismatchPath))
        {
            AssertionFailure.Fail($"Expected dictionary values to be structurally equivalent at '{mismatchPath}'.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary is not structurally equivalent to the unexpected value.</summary>
    /// <param name="unexpected">The object graph that must differ.</param>
    /// <param name="configure">Optional settings for member selection, exclusions, custom comparers, fields, ordering, and maximum graph depth.</param>
    public DictionaryAssertions<TKey, TValue> NotBeEquivalentTo<TExpected>(TExpected unexpected, Action<EquivalencyOptions>? configure = null)
    {
        var options = new EquivalencyOptions();
        configure?.Invoke(options);
        options.ValidateIncludedPaths(unexpected);
        var comparer = new ObjectGraphEquivalencyComparer(options);
        if (comparer.TryCompare(_actual, unexpected, out _))
        {
            AssertionFailure.Fail("Expected dictionary values not to be structurally equivalent, but they matched.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary is the same instance as the expected object.</summary>
    public DictionaryAssertions<TKey, TValue> BeSameAs(object? expected)
    {
        if (!ReferenceEquals(_actual, expected))
        {
            AssertionFailure.Fail("Expected dictionary to be the same object instance.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary is not the same instance as the unexpected object.</summary>
    public DictionaryAssertions<TKey, TValue> NotBeSameAs(object? unexpected)
    {
        if (ReferenceEquals(_actual, unexpected))
        {
            AssertionFailure.Fail("Expected dictionary not to be the same object instance.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary contains the expected key.</summary>
    public void ContainKey(TKey key)
    {
        if (_actual is null || !_actual.ContainsKey(key))
        {
            AssertionFailure.Fail("Expected dictionary to contain the requested key.");
        }
    }

    /// <summary>Asserts that the dictionary does not contain the specified key.</summary>
    public void NotContainKey(TKey key)
    {
        if (_actual is null || _actual.ContainsKey(key))
        {
            AssertionFailure.Fail("Expected dictionary not to contain the requested key.");
        }
    }

    /// <summary>Asserts that the dictionary contains the expected key/value pair.</summary>
    public void Contain(TKey key, TValue value)
    {
        if (_actual is null || !_actual.TryGetValue(key, out var actualValue) || !EqualityComparer<TValue>.Default.Equals(actualValue, value))
        {
            AssertionFailure.Fail("Expected dictionary to contain the requested key/value pair.");
        }
    }

    /// <summary>Asserts that the dictionary has the same keys and values as the expected entries, regardless of entry order.</summary>
    /// <param name="expected">A finite sequence of entries with unique keys.</param>
    /// <remarks>Keys and values use their default equality comparers. Failure messages omit keys and values.</remarks>
    public DictionaryAssertions<TKey, TValue> Equal(IEnumerable<KeyValuePair<TKey, TValue>> expected)
    {
        ValidateExpectedEntries(expected, nameof(expected));
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a dictionary equal to the requested entries, but found null.");
        }

        if (!TryMatchExpectedEntries(expected, out var mismatch))
        {
            AssertionFailure.Fail($"Expected dictionary entries to be equal, but the {mismatch} differed.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary has at least one key or value difference from the unexpected entries.</summary>
    /// <param name="unexpected">A finite sequence of entries with unique keys.</param>
    /// <remarks>Keys and values use their default equality comparers. Failure messages omit keys and values.</remarks>
    public DictionaryAssertions<TKey, TValue> NotEqual(IEnumerable<KeyValuePair<TKey, TValue>> unexpected)
    {
        ValidateExpectedEntries(unexpected, nameof(unexpected));
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a dictionary that differs from the requested entries, but found null.");
        }

        if (TryMatchExpectedEntries(unexpected, out _))
        {
            AssertionFailure.Fail("Expected dictionary entries to differ, but the mappings were equal.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary contains a value equal to the expected value.</summary>
    public void ContainValue(TValue value)
    {
        if (_actual is not null)
        {
            var comparer = EqualityComparer<TValue>.Default;
            foreach (var pair in _actual)
            {
                if (comparer.Equals(pair.Value, value))
                {
                    return;
                }
            }
        }

        AssertionFailure.Fail("Expected dictionary to contain the requested value.");
    }

    /// <summary>Asserts that the dictionary has the expected number of entries.</summary>
    public void HaveCount(int expected)
    {
        if (expected < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(expected), expected, "Expected count cannot be negative.");
        }

        if (_actual is null || _actual.Count != expected)
        {
            AssertionFailure.Fail($"Expected dictionary entry count {expected}, but found {_actual?.Count.ToString() ?? "<null>"}.");
        }
    }

    /// <summary>Asserts that the dictionary contains no entries.</summary>
    public DictionaryAssertions<TKey, TValue> BeEmpty()
    {
        if (_actual is null || _actual.Count != 0)
        {
            AssertionFailure.Fail("Expected an empty dictionary.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary contains at least one entry.</summary>
    public DictionaryAssertions<TKey, TValue> NotBeEmpty()
    {
        if (_actual is null || _actual.Count == 0)
        {
            AssertionFailure.Fail("Expected a non-empty dictionary.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary contains every expected key.</summary>
    /// <remarks>Repeated expected keys do not require distinct entries. Key matching uses the dictionary's comparer.</remarks>
    public DictionaryAssertions<TKey, TValue> ContainKeys(params TKey[] expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        if (expected.Length == 0)
        {
            return this;
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected dictionary to contain the requested keys, but found null.");
        }

        foreach (var key in expected)
        {
            if (!_actual.ContainsKey(key))
            {
                AssertionFailure.Fail("Expected dictionary to contain the requested keys.");
            }
        }

        return this;
    }

    /// <summary>Asserts that the dictionary contains none of the specified keys.</summary>
    /// <remarks>Key matching uses the dictionary's comparer.</remarks>
    public DictionaryAssertions<TKey, TValue> NotContainKeys(params TKey[] unexpected)
    {
        if (unexpected is null)
        {
            throw new ArgumentNullException(nameof(unexpected));
        }

        if (unexpected.Length == 0)
        {
            return this;
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a dictionary without the requested keys, but found null.");
        }

        foreach (var key in unexpected)
        {
            if (_actual.ContainsKey(key))
            {
                AssertionFailure.Fail("Expected dictionary not to contain the requested keys.");
            }
        }

        return this;
    }

    /// <summary>Asserts that the dictionary contains every expected value.</summary>
    /// <remarks>Value matching uses <see cref="EqualityComparer{TValue}.Default"/>. Repeated expected values do not require distinct entries.</remarks>
    public DictionaryAssertions<TKey, TValue> ContainValues(params TValue[] expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        if (expected.Length == 0)
        {
            return this;
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected dictionary to contain the requested values, but found null.");
        }

        var actualValues = new List<TValue>(_actual.Count);
        foreach (var pair in _actual)
        {
            actualValues.Add(pair.Value);
        }

        var comparer = EqualityComparer<TValue>.Default;
        foreach (var value in expected)
        {
            var found = false;
            foreach (var actualValue in actualValues)
            {
                if (comparer.Equals(actualValue, value))
                {
                    found = true;
                    break;
                }
            }

            if (!found)
            {
                AssertionFailure.Fail("Expected dictionary to contain the requested values.");
            }
        }

        return this;
    }

    /// <summary>Asserts that the dictionary contains none of the specified values.</summary>
    /// <remarks>Value matching uses <see cref="EqualityComparer{TValue}.Default"/>.</remarks>
    public DictionaryAssertions<TKey, TValue> NotContainValues(params TValue[] unexpected)
    {
        if (unexpected is null)
        {
            throw new ArgumentNullException(nameof(unexpected));
        }

        if (unexpected.Length == 0)
        {
            return this;
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a dictionary without the requested values, but found null.");
        }

        var comparer = EqualityComparer<TValue>.Default;
        foreach (var pair in _actual)
        {
            foreach (var value in unexpected)
            {
                if (comparer.Equals(pair.Value, value))
                {
                    AssertionFailure.Fail("Expected dictionary not to contain the requested values.");
                }
            }
        }

        return this;
    }

    /// <summary>Asserts that the dictionary has more than the specified number of entries.</summary>
    public DictionaryAssertions<TKey, TValue> HaveCountGreaterThan(int expected)
    {
        ValidateCount(expected);
        if (_actual is null || _actual.Count <= expected)
        {
            AssertionFailure.Fail($"Expected dictionary entry count greater than {expected}.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary has fewer than the specified number of entries.</summary>
    public DictionaryAssertions<TKey, TValue> HaveCountLessThan(int expected)
    {
        ValidateCount(expected);
        if (_actual is null || _actual.Count >= expected)
        {
            AssertionFailure.Fail($"Expected dictionary entry count less than {expected}.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary and another dictionary have the same number of entries.</summary>
    public DictionaryAssertions<TKey, TValue> HaveSameCount(IDictionary<TKey, TValue> expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        if (_actual is null || _actual.Count != expected.Count)
        {
            AssertionFailure.Fail("Expected dictionaries to have the same entry count.");
        }

        return this;
    }

    private static void ValidateCount(int expected)
    {
        if (expected < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(expected), expected, "Expected count cannot be negative.");
        }
    }

    private static void ValidateExpectedEntries(IEnumerable<KeyValuePair<TKey, TValue>>? entries, string parameterName)
    {
        if (entries is null)
        {
            throw new ArgumentNullException(parameterName);
        }
    }

    private bool TryMatchExpectedEntries(IEnumerable<KeyValuePair<TKey, TValue>> expected, out string mismatch)
    {
        if (ReferenceEquals(_actual, expected))
        {
            mismatch = string.Empty;
            return true;
        }

        var expectedByKey = new Dictionary<TKey, TValue>();
        foreach (var pair in expected)
        {
            if (expectedByKey.ContainsKey(pair.Key))
            {
                throw new ArgumentException("Expected dictionary entries must have unique keys.", nameof(expected));
            }

            expectedByKey.Add(pair.Key, pair.Value);
        }

        if (_actual!.Count != expectedByKey.Count)
        {
            mismatch = "entry count";
            return false;
        }

        var comparer = EqualityComparer<TValue>.Default;
        foreach (var pair in _actual)
        {
            if (!expectedByKey.TryGetValue(pair.Key, out var expectedValue))
            {
                mismatch = "key set";
                return false;
            }

            if (!comparer.Equals(pair.Value, expectedValue))
            {
                mismatch = "values";
                return false;
            }
        }

        mismatch = string.Empty;
        return true;
    }
}
