using System;
using System.Collections.Generic;

namespace AstraFlow.Assertions;

/// <summary>Assertions for dictionary keys and values.</summary>
public sealed class DictionaryAssertions<TKey, TValue>
    where TKey : notnull
{
    private readonly IEnumerable<KeyValuePair<TKey, TValue>>? _actual;
    private readonly IDictionary<TKey, TValue>? _mutableActual;
    private readonly IReadOnlyDictionary<TKey, TValue>? _readOnlyActual;

    internal DictionaryAssertions(IDictionary<TKey, TValue>? actual)
    {
        _actual = actual;
        _mutableActual = actual;
        _readOnlyActual = actual as IReadOnlyDictionary<TKey, TValue>;
    }

    internal DictionaryAssertions(IReadOnlyDictionary<TKey, TValue>? actual)
    {
        _actual = actual;
        _mutableActual = actual as IDictionary<TKey, TValue>;
        _readOnlyActual = actual;
    }

    internal DictionaryAssertions(IEnumerable<KeyValuePair<TKey, TValue>>? actual)
    {
        _actual = actual;
        _mutableActual = actual as IDictionary<TKey, TValue>;
        _readOnlyActual = actual as IReadOnlyDictionary<TKey, TValue>;
    }

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
    public DictionaryAssertions<TKey, TValue> ContainKey(TKey key)
    {
        if (_actual is null || !ContainsKey(key))
        {
            AssertionFailure.Fail("Expected dictionary to contain the requested key.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary does not contain the specified key.</summary>
    public DictionaryAssertions<TKey, TValue> NotContainKey(TKey key)
    {
        if (_actual is null || ContainsKey(key))
        {
            AssertionFailure.Fail("Expected dictionary not to contain the requested key.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary contains the expected key/value pair.</summary>
    public DictionaryAssertions<TKey, TValue> Contain(TKey key, TValue value)
    {
        if (_actual is null || !TryGetValue(key, out var actualValue) || !EqualityComparer<TValue>.Default.Equals(actualValue, value))
        {
            AssertionFailure.Fail("Expected dictionary to contain the requested key/value pair.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary does not contain the specified key/value pair.</summary>
    /// <remarks>The dictionary's key comparer is used for key lookup; values use their default equality comparer.</remarks>
    public DictionaryAssertions<TKey, TValue> NotContain(TKey key, TValue value)
    {
        if (_actual is null ||
            (TryGetValue(key, out var actualValue) && EqualityComparer<TValue>.Default.Equals(actualValue, value)))
        {
            AssertionFailure.Fail("Expected dictionary not to contain the requested key/value pair.");
        }

        return this;
    }

    /// <summary>Asserts that no dictionary entry satisfies the predicate.</summary>
    /// <param name="predicate">A predicate evaluated once per entry during one enumeration.</param>
    public DictionaryAssertions<TKey, TValue> NotContain(Func<KeyValuePair<TKey, TValue>, bool> predicate)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a dictionary without a matching entry, but found null.");
        }

        foreach (var pair in _actual)
        {
            if (predicate(pair))
            {
                AssertionFailure.Fail("Expected dictionary not to contain an entry satisfying the predicate.");
            }
        }

        return this;
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
    public DictionaryAssertions<TKey, TValue> ContainValue(TValue value)
    {
        if (_actual is not null)
        {
            var comparer = EqualityComparer<TValue>.Default;
            foreach (var pair in _actual)
            {
                if (comparer.Equals(pair.Value, value))
                {
                    return this;
                }
            }
        }

        AssertionFailure.Fail("Expected dictionary to contain the requested value.");
        return this;
    }

    /// <summary>Asserts that the dictionary does not contain a value equal to the specified value.</summary>
    public DictionaryAssertions<TKey, TValue> NotContainValue(TValue unexpected)
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a dictionary without the requested value, but found null.");
        }

        var comparer = EqualityComparer<TValue>.Default;
        foreach (var pair in _actual!)
        {
            if (comparer.Equals(pair.Value, unexpected))
            {
                AssertionFailure.Fail("Expected dictionary not to contain the requested value.");
            }
        }

        return this;
    }

    /// <summary>Asserts that the dictionary has the expected number of entries.</summary>
    public DictionaryAssertions<TKey, TValue> HaveCount(int expected)
    {
        if (expected < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(expected), expected, "Expected count cannot be negative.");
        }

        if (_actual is null || GetCount() != expected)
        {
            AssertionFailure.Fail($"Expected dictionary entry count {expected}, but found {(_actual is null ? "<null>" : GetCount().ToString())}.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary contains no entries.</summary>
    public DictionaryAssertions<TKey, TValue> BeEmpty()
    {
        if (_actual is null || GetCount() != 0)
        {
            AssertionFailure.Fail("Expected an empty dictionary.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary contains at least one entry.</summary>
    public DictionaryAssertions<TKey, TValue> NotBeEmpty()
    {
        if (_actual is null || GetCount() == 0)
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

        if (_mutableActual is not null || _readOnlyActual is not null)
        {
            foreach (var key in expected)
            {
                if (!ContainsKey(key))
                {
                    AssertionFailure.Fail("Expected dictionary to contain the requested keys.");
                }
            }

            return this;
        }

        var matched = new bool[expected.Length];
        var matchedCount = 0;
        foreach (var pair in _actual)
        {
            for (var index = 0; index < expected.Length; index++)
            {
                if (!matched[index] && EqualityComparer<TKey>.Default.Equals(pair.Key, expected[index]))
                {
                    matched[index] = true;
                    matchedCount++;
                }
            }

            if (matchedCount == expected.Length)
            {
                return this;
            }
        }

        AssertionFailure.Fail("Expected dictionary to contain the requested keys.");
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

        if (_mutableActual is not null || _readOnlyActual is not null)
        {
            foreach (var key in unexpected)
            {
                if (ContainsKey(key))
                {
                    AssertionFailure.Fail("Expected dictionary not to contain the requested keys.");
                }
            }

            return this;
        }

        foreach (var pair in _actual)
        {
            for (var index = 0; index < unexpected.Length; index++)
            {
                if (EqualityComparer<TKey>.Default.Equals(pair.Key, unexpected[index]))
                {
                    AssertionFailure.Fail("Expected dictionary not to contain the requested keys.");
                }
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

        // The source may be a one-shot key/value sequence, so avoid a count pass before reading values.
        var actualValues = new List<TValue>();
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
        if (_actual is null || GetCount() <= expected)
        {
            AssertionFailure.Fail($"Expected dictionary entry count greater than {expected}.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary has fewer than the specified number of entries.</summary>
    public DictionaryAssertions<TKey, TValue> HaveCountLessThan(int expected)
    {
        ValidateCount(expected);
        if (_actual is null || GetCount() >= expected)
        {
            AssertionFailure.Fail($"Expected dictionary entry count less than {expected}.");
        }

        return this;
    }

    /// <summary>Asserts that the dictionary and another dictionary have the same number of entries.</summary>
    public DictionaryAssertions<TKey, TValue> HaveSameCount(IEnumerable<KeyValuePair<TKey, TValue>> expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        if (_actual is null || (!ReferenceEquals(_actual, expected) && GetCount() != CountEntries(expected)))
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
        if ((_mutableActual is not null || _readOnlyActual is not null) && ReferenceEquals(_actual, expected))
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

        if (ReferenceEquals(_actual, expected))
        {
            mismatch = string.Empty;
            return true;
        }

        var comparer = EqualityComparer<TValue>.Default;
        var actualKeys = new HashSet<TKey>();
        var actualCount = 0;
        string? entryMismatch = null;
        foreach (var pair in _actual!)
        {
            if (!actualKeys.Add(pair.Key))
            {
                entryMismatch ??= "key set";
                actualCount++;
                continue;
            }

            if (!expectedByKey.TryGetValue(pair.Key, out var expectedValue))
            {
                entryMismatch ??= "key set";
                actualCount++;
                continue;
            }

            if (!comparer.Equals(pair.Value, expectedValue))
            {
                entryMismatch ??= "values";
            }

            actualCount++;
        }

        if (actualCount != expectedByKey.Count)
        {
            mismatch = "entry count";
            return false;
        }

        if (entryMismatch is not null)
        {
            mismatch = entryMismatch;
            return false;
        }

        mismatch = string.Empty;
        return true;
    }

    private bool ContainsKey(TKey key)
    {
        if (_mutableActual is not null)
        {
            return _mutableActual.ContainsKey(key);
        }

        if (_readOnlyActual is not null)
        {
            return _readOnlyActual.ContainsKey(key);
        }

        if (_actual is not null)
        {
            foreach (var pair in _actual)
            {
                if (EqualityComparer<TKey>.Default.Equals(pair.Key, key))
                {
                    return true;
                }
            }
        }

        return false;
    }

    private bool TryGetValue(TKey key, out TValue value)
    {
        if (_mutableActual is not null)
        {
            return _mutableActual.TryGetValue(key, out value!);
        }

        if (_readOnlyActual is not null)
        {
            return _readOnlyActual.TryGetValue(key, out value!);
        }

        if (_actual is not null)
        {
            foreach (var pair in _actual)
            {
                if (EqualityComparer<TKey>.Default.Equals(pair.Key, key))
                {
                    value = pair.Value;
                    return true;
                }
            }
        }

        value = default!;
        return false;
    }

    private int GetCount()
    {
        if (_mutableActual is not null)
        {
            return _mutableActual.Count;
        }

        if (_readOnlyActual is not null)
        {
            return _readOnlyActual.Count;
        }

        var count = 0;
        if (_actual is not null)
        {
            foreach (var _ in _actual)
            {
                count++;
            }
        }

        return count;
    }

    private static int CountEntries(IEnumerable<KeyValuePair<TKey, TValue>> entries)
    {
        if (entries is IReadOnlyCollection<KeyValuePair<TKey, TValue>> readOnlyCollection)
        {
            return readOnlyCollection.Count;
        }

        if (entries is ICollection<KeyValuePair<TKey, TValue>> collection)
        {
            return collection.Count;
        }

        var count = 0;
        using var enumerator = entries.GetEnumerator();
        while (enumerator.MoveNext())
        {
            count++;
        }

        return count;
    }
}
