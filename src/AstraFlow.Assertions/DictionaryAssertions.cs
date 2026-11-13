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
}
