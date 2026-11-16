using System;
using System.Collections.Generic;

namespace AstraFlow.Assertions;

/// <summary>Dictionary checks for sequences of key-value pairs, including read-only dictionaries.</summary>
public static class DictionarySequenceAssertionExtensions
{
    /// <summary>Asserts that the sequence contains no pair with the specified key.</summary>
    public static CollectionAssertions<KeyValuePair<TKey, TValue>> NotContainKey<TKey, TValue>(
        this CollectionAssertions<KeyValuePair<TKey, TValue>> assertions,
        TKey unexpected)
        where TKey : notnull
        => NotContainKey(assertions, unexpected, null);

    /// <summary>Asserts that the sequence contains no pair with the specified key and adds formatted failure context.</summary>
    /// <param name="assertions">The key-value sequence assertions.</param>
    /// <param name="unexpected">The key that must not be present.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public static CollectionAssertions<KeyValuePair<TKey, TValue>> NotContainKey<TKey, TValue>(
        this CollectionAssertions<KeyValuePair<TKey, TValue>> assertions,
        TKey unexpected,
        string? because,
        params object?[] becauseArgs)
        where TKey : notnull
    {
        Validate(assertions);
        var subject = assertions.Subject;
        if (subject is null)
        {
            AssertionFailure.FailWithBecause("Expected key-value pairs without the requested key, but found null.", because, becauseArgs);
        }

        if (ContainsKey(subject, unexpected))
        {
            AssertionFailure.FailWithBecause("Expected key-value pairs not to contain the requested key.", because, becauseArgs);
        }

        return assertions;
    }

    /// <summary>Asserts that the sequence contains every expected key.</summary>
    /// <remarks>Repeated expected keys do not require distinct pairs. Dictionary subjects use their own key comparer.</remarks>
    public static CollectionAssertions<KeyValuePair<TKey, TValue>> ContainKeys<TKey, TValue>(
        this CollectionAssertions<KeyValuePair<TKey, TValue>> assertions,
        params TKey[] expected)
        where TKey : notnull
    {
        Validate(assertions);
        ValidateExpected(expected);
        if (expected.Length == 0)
        {
            return assertions;
        }

        var subject = assertions.Subject;
        if (subject is null)
        {
            AssertionFailure.Fail("Expected key-value pairs to contain the requested keys, but found null.");
        }

        if (subject is IDictionary<TKey, TValue> dictionary)
        {
            foreach (var key in expected)
            {
                if (!dictionary.ContainsKey(key))
                {
                    AssertionFailure.Fail("Expected key-value pairs to contain the requested keys.");
                }
            }

            return assertions;
        }

        if (subject is IReadOnlyDictionary<TKey, TValue> readOnlyDictionary)
        {
            foreach (var key in expected)
            {
                if (!readOnlyDictionary.ContainsKey(key))
                {
                    AssertionFailure.Fail("Expected key-value pairs to contain the requested keys.");
                }
            }

            return assertions;
        }

        var matched = new bool[expected.Length];
        var matchedCount = 0;
        foreach (var pair in subject)
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
                return assertions;
            }
        }

        AssertionFailure.Fail("Expected key-value pairs to contain the requested keys.");
        return assertions;
    }

    /// <summary>Asserts that the sequence contains none of the specified keys.</summary>
    /// <remarks>Dictionary subjects use their own key comparer.</remarks>
    public static CollectionAssertions<KeyValuePair<TKey, TValue>> NotContainKeys<TKey, TValue>(
        this CollectionAssertions<KeyValuePair<TKey, TValue>> assertions,
        params TKey[] unexpected)
        where TKey : notnull
    {
        Validate(assertions);
        ValidateExpected(unexpected);
        if (unexpected.Length == 0)
        {
            return assertions;
        }

        var subject = assertions.Subject;
        if (subject is null)
        {
            AssertionFailure.Fail("Expected key-value pairs without the requested keys, but found null.");
        }

        if (subject is IDictionary<TKey, TValue> dictionary)
        {
            foreach (var key in unexpected)
            {
                if (dictionary.ContainsKey(key))
                {
                    AssertionFailure.Fail("Expected key-value pairs not to contain the requested keys.");
                }
            }

            return assertions;
        }

        if (subject is IReadOnlyDictionary<TKey, TValue> readOnlyDictionary)
        {
            foreach (var key in unexpected)
            {
                if (readOnlyDictionary.ContainsKey(key))
                {
                    AssertionFailure.Fail("Expected key-value pairs not to contain the requested keys.");
                }
            }

            return assertions;
        }

        foreach (var pair in subject)
        {
            for (var index = 0; index < unexpected.Length; index++)
            {
                if (EqualityComparer<TKey>.Default.Equals(pair.Key, unexpected[index]))
                {
                    AssertionFailure.Fail("Expected key-value pairs not to contain the requested keys.");
                }
            }
        }

        return assertions;
    }

    /// <summary>Asserts that the sequence contains a value equal to the expected value.</summary>
    public static CollectionAssertions<KeyValuePair<TKey, TValue>> ContainValue<TKey, TValue>(
        this CollectionAssertions<KeyValuePair<TKey, TValue>> assertions,
        TValue expected)
    {
        Validate(assertions);
        var comparer = EqualityComparer<TValue>.Default;
        var subject = assertions.Subject;
        if (subject is null)
        {
            AssertionFailure.Fail("Expected key-value pairs to contain the requested value, but found null.");
        }

        if (subject is not null)
        {
            foreach (var pair in subject)
            {
                if (comparer.Equals(pair.Value, expected))
                {
                    return assertions;
                }
            }
        }

        AssertionFailure.Fail("Expected key-value pairs to contain the requested value.");
        return assertions;
    }

    /// <summary>Asserts that the sequence contains none of the specified values.</summary>
    public static CollectionAssertions<KeyValuePair<TKey, TValue>> NotContainValue<TKey, TValue>(
        this CollectionAssertions<KeyValuePair<TKey, TValue>> assertions,
        TValue unexpected)
    {
        Validate(assertions);
        var comparer = EqualityComparer<TValue>.Default;
        var subject = assertions.Subject;
        if (subject is null)
        {
            AssertionFailure.Fail("Expected key-value pairs without the requested value, but found null.");
        }

        if (subject is not null)
        {
            foreach (var pair in subject)
            {
                if (comparer.Equals(pair.Value, unexpected))
                {
                    AssertionFailure.Fail("Expected key-value pairs not to contain the requested value.");
                }
            }
        }

        return assertions;
    }

    /// <summary>Asserts that the sequence contains every expected value.</summary>
    /// <remarks>Repeated expected values do not require distinct pairs.</remarks>
    public static CollectionAssertions<KeyValuePair<TKey, TValue>> ContainValues<TKey, TValue>(
        this CollectionAssertions<KeyValuePair<TKey, TValue>> assertions,
        params TValue[] expected)
    {
        Validate(assertions);
        ValidateExpected(expected);
        if (expected.Length == 0)
        {
            return assertions;
        }

        var subject = assertions.Subject;
        if (subject is null)
        {
            AssertionFailure.Fail("Expected key-value pairs to contain the requested values, but found null.");
        }

        var actualValues = new List<TValue>();
        foreach (var pair in subject)
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
                AssertionFailure.Fail("Expected key-value pairs to contain the requested values.");
            }
        }

        return assertions;
    }

    /// <summary>Asserts that the sequence contains none of the specified values.</summary>
    public static CollectionAssertions<KeyValuePair<TKey, TValue>> NotContainValues<TKey, TValue>(
        this CollectionAssertions<KeyValuePair<TKey, TValue>> assertions,
        params TValue[] unexpected)
    {
        Validate(assertions);
        ValidateExpected(unexpected);
        if (unexpected.Length == 0)
        {
            return assertions;
        }

        var subject = assertions.Subject;
        if (subject is null)
        {
            AssertionFailure.Fail("Expected key-value pairs without the requested values, but found null.");
        }

        var comparer = EqualityComparer<TValue>.Default;
        foreach (var pair in subject)
        {
            foreach (var value in unexpected)
            {
                if (comparer.Equals(pair.Value, value))
                {
                    AssertionFailure.Fail("Expected key-value pairs not to contain the requested values.");
                }
            }
        }

        return assertions;
    }

    /// <summary>Asserts that the sequence contains the specified key/value pair.</summary>
    /// <remarks>Dictionary subjects use their own key comparer.</remarks>
    public static CollectionAssertions<KeyValuePair<TKey, TValue>> Contain<TKey, TValue>(
        this CollectionAssertions<KeyValuePair<TKey, TValue>> assertions,
        TKey key,
        TValue value)
        where TKey : notnull
    {
        Validate(assertions);
        var subject = assertions.Subject;
        var valueComparer = EqualityComparer<TValue>.Default;
        if (subject is IDictionary<TKey, TValue> dictionary)
        {
            if (dictionary.TryGetValue(key, out var actual) && valueComparer.Equals(actual, value))
            {
                return assertions;
            }
        }
        else if (subject is IReadOnlyDictionary<TKey, TValue> readOnlyDictionary)
        {
            if (readOnlyDictionary.TryGetValue(key, out var actual) && valueComparer.Equals(actual, value))
            {
                return assertions;
            }
        }
        else if (subject is not null)
        {
            foreach (var pair in subject)
            {
                if (EqualityComparer<TKey>.Default.Equals(pair.Key, key) && valueComparer.Equals(pair.Value, value))
                {
                    return assertions;
                }
            }
        }

        AssertionFailure.Fail("Expected key-value pairs to contain the requested key/value pair.");
        return assertions;
    }

    internal static bool ContainsKey<TKey, TValue>(IEnumerable<KeyValuePair<TKey, TValue>>? subject, TKey expected)
        where TKey : notnull
    {
        if (subject is IDictionary<TKey, TValue> dictionary)
        {
            return dictionary.ContainsKey(expected);
        }

        if (subject is IReadOnlyDictionary<TKey, TValue> readOnlyDictionary)
        {
            return readOnlyDictionary.ContainsKey(expected);
        }

        if (subject is not null)
        {
            foreach (var pair in subject)
            {
                if (EqualityComparer<TKey>.Default.Equals(pair.Key, expected))
                {
                    return true;
                }
            }
        }

        return false;
    }

    private static void Validate<TKey, TValue>(CollectionAssertions<KeyValuePair<TKey, TValue>>? assertions)
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }
    }

    private static void ValidateExpected<T>(T[]? expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }
    }
}
