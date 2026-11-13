using System.Collections.Generic;

namespace AstraFlow.Assertions;

/// <summary>Assertions for enumerable sequences.</summary>
public sealed class CollectionAssertions<T>
{
    private readonly IEnumerable<T>? _actual;

    internal CollectionAssertions(IEnumerable<T>? actual) => _actual = actual;

    /// <summary>Returns this assertion object for an additional related check.</summary>
    public CollectionAssertions<T> And => this;

    /// <summary>Asserts that the sequence object is the same instance as the expected object.</summary>
    public CollectionAssertions<T> BeSameAs(object? expected)
    {
        if (!ReferenceEquals(_actual, expected))
        {
            AssertionFailure.Fail("Expected sequence to be the same object instance.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence object is not the same instance as the unexpected object.</summary>
    public CollectionAssertions<T> NotBeSameAs(object? unexpected)
    {
        if (ReferenceEquals(_actual, unexpected))
        {
            AssertionFailure.Fail("Expected sequence not to be the same object instance.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence is empty.</summary>
    public CollectionAssertions<T> BeEmpty()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected an empty sequence, but found null.");
        }

        using var enumerator = _actual.GetEnumerator();
        if (enumerator.MoveNext())
        {
            AssertionFailure.Fail("Expected an empty sequence, but it contained at least one item.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence contains at least one item.</summary>
    public CollectionAssertions<T> NotBeEmpty()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a non-empty sequence, but found null.");
        }

        using var enumerator = _actual.GetEnumerator();
        if (!enumerator.MoveNext())
        {
            AssertionFailure.Fail("Expected a non-empty sequence, but found an empty sequence.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence contains the expected number of items.</summary>
    public CollectionAssertions<T> HaveCount(int expected)
    {
        if (expected < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(expected), expected, "Expected count cannot be negative.");
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence with a count, but found null.");
        }

        var count = 0;
        foreach (var _ in _actual)
        {
            count++;
        }

        if (count != expected)
        {
            AssertionFailure.Fail($"Expected sequence count {expected}, but found {count}.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence contains an equal item.</summary>
    public CollectionAssertions<T> Contain(T expected)
    {
        if (_actual is not null)
        {
            var comparer = EqualityComparer<T>.Default;
            foreach (var item in _actual)
            {
                if (comparer.Equals(item, expected))
                {
                    return this;
                }
            }
        }

        AssertionFailure.Fail($"Expected sequence to contain an item equal to {AssertionFailure.Describe(expected)}.");
        return this;
    }

    /// <summary>Asserts that the sequence contains each expected item.</summary>
    public CollectionAssertions<T> Contain(params T[] expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        foreach (var item in expected)
        {
            Contain(item);
        }

        return this;
    }

    /// <summary>Asserts that the sequence object has the exact requested runtime type.</summary>
    public TExpected BeOfType<TExpected>()
    {
        if (_actual is null || _actual.GetType() != typeof(TExpected))
        {
            var actualType = _actual?.GetType().FullName ?? "<null>";
            AssertionFailure.Fail($"Expected exact runtime type '{typeof(TExpected).FullName}', but found '{actualType}'.");
        }

        return (TExpected)(object)_actual!;
    }

    /// <summary>Asserts that the sequence contains at least one item satisfying the predicate.</summary>
    public CollectionAssertions<T> Contain(Func<T, bool> predicate)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }

        if (_actual is not null)
        {
            foreach (var item in _actual)
            {
                if (predicate(item))
                {
                    return this;
                }
            }
        }

        AssertionFailure.Fail("Expected sequence to contain an item satisfying the predicate, but no matching item was found.");
        return this;
    }

    /// <summary>Asserts that the sequence does not contain an equal item.</summary>
    public CollectionAssertions<T> NotContain(T unexpected)
    {
        if (_actual is not null)
        {
            var comparer = EqualityComparer<T>.Default;
            foreach (var item in _actual)
            {
                if (comparer.Equals(item, unexpected))
                {
                    AssertionFailure.Fail($"Expected sequence not to contain an item equal to {AssertionFailure.Describe(unexpected)}.");
                }
            }
        }

        return this;
    }

    /// <summary>Asserts that no sequence item satisfies the predicate.</summary>
    public CollectionAssertions<T> NotContain(Func<T, bool> predicate)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }

        if (_actual is not null)
        {
            foreach (var item in _actual)
            {
                if (predicate(item))
                {
                    AssertionFailure.Fail("Expected sequence not to contain an item satisfying the predicate.");
                }
            }
        }

        return this;
    }

    /// <summary>Asserts that the sequence equals the expected items in order.</summary>
    public CollectionAssertions<T> Equal(params T[] expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        using var actualEnumerator = _actual?.GetEnumerator();
        var comparer = EqualityComparer<T>.Default;
        var index = 0;

        while (index < expected.Length)
        {
            if (actualEnumerator is null || !actualEnumerator.MoveNext())
            {
                AssertionFailure.Fail($"Expected sequence with {expected.Length} items, but it ended at index {index}.");
            }

            if (!comparer.Equals(actualEnumerator.Current, expected[index]))
            {
                AssertionFailure.Fail($"Expected sequence item at index {index} to equal {AssertionFailure.Describe(expected[index])}, but found {AssertionFailure.Describe(actualEnumerator.Current)}.");
            }

            index++;
        }

        if (actualEnumerator is not null && actualEnumerator.MoveNext())
        {
            AssertionFailure.Fail($"Expected sequence with {expected.Length} items, but it contained additional items.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence contains exactly one item and returns it.</summary>
    public SingleItemAssertions<T> ContainSingle()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence containing one item, but found null.");
        }

        using var enumerator = _actual.GetEnumerator();
        if (!enumerator.MoveNext())
        {
            AssertionFailure.Fail("Expected a sequence containing one item, but it was empty.");
        }

        var item = enumerator.Current;
        if (enumerator.MoveNext())
        {
            AssertionFailure.Fail("Expected exactly one sequence item, but found additional items.");
        }

        return new SingleItemAssertions<T>(item);
    }

    /// <summary>Asserts that the sequence contains exactly one item matching the predicate and returns it.</summary>
    public SingleItemAssertions<T> ContainSingle(Func<T, bool> predicate)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence containing one matching item, but found null.");
        }

        var found = false;
        var match = default(T)!;
        foreach (var item in _actual)
        {
            if (!predicate(item))
            {
                continue;
            }

            if (found)
            {
                AssertionFailure.Fail("Expected exactly one matching sequence item, but found more than one.");
            }

            found = true;
            match = item;
        }

        if (!found)
        {
            AssertionFailure.Fail("Expected one matching sequence item, but found none.");
        }

        return new SingleItemAssertions<T>(match);
    }

    /// <summary>Asserts that the expected items occur in the sequence in the given order.</summary>
    /// <remarks>Other sequence items may occur between the expected items.</remarks>
    /// <param name="expected">The ordered subsequence to find.</param>
    /// <returns>This assertion object for additional checks.</returns>
    public CollectionAssertions<T> ContainInOrder(params T[] expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        if (expected.Length == 0)
        {
            return this;
        }

        if (_actual is not null)
        {
            var comparer = EqualityComparer<T>.Default;
            var expectedIndex = 0;
            foreach (var item in _actual)
            {
                if (comparer.Equals(item, expected[expectedIndex]))
                {
                    expectedIndex++;
                    if (expectedIndex == expected.Length)
                    {
                        return this;
                    }
                }
            }
        }

        AssertionFailure.Fail($"Expected sequence to contain {expected.Length} items in the specified order.");
        return this;
    }

    /// <summary>Asserts that every sequence item satisfies the predicate.</summary>
    public CollectionAssertions<T> OnlyContain(Func<T, bool> predicate)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence whose items satisfy the predicate, but found null.");
        }

        var index = 0;
        foreach (var item in _actual)
        {
            if (!predicate(item))
            {
                AssertionFailure.Fail($"Expected sequence item at index {index} to satisfy the predicate.");
            }

            index++;
        }

        return this;
    }
}
