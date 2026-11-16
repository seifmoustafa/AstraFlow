using System.Collections.Generic;
using System;

namespace AstraFlow.Assertions;

/// <summary>Assertions for enumerable sequences.</summary>
public sealed class CollectionAssertions<T>
{
    private readonly IEnumerable<T>? _actual;

    internal CollectionAssertions(IEnumerable<T>? actual) => _actual = actual;

    /// <summary>Returns this assertion object for an additional related check.</summary>
    public CollectionAssertions<T> And => this;

    /// <summary>Gets the sequence being asserted.</summary>
    public IEnumerable<T>? Subject => _actual;

    /// <summary>Asserts that the sequence is structurally equivalent to the expected value.</summary>
    /// <param name="expected">The expected sequence or object graph.</param>
    /// <param name="configure">Optional settings for member selection, exclusions, custom comparers, fields, ordering, and maximum graph depth.</param>
    public CollectionAssertions<T> BeEquivalentTo<TExpected>(TExpected expected, Action<EquivalencyOptions>? configure = null)
    {
        var comparer = CreateEquivalencyComparer(expected, configure);
        if (!comparer.TryCompare(_actual, expected, out var mismatchPath))
        {
            AssertionFailure.Fail($"Expected sequence values to be structurally equivalent at '{mismatchPath}'.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence is structurally equivalent to the supplied items.</summary>
    /// <param name="expected">The expected items. The default ordering is strict.</param>
    public CollectionAssertions<T> BeEquivalentTo(params T[] expected)
        => BeEquivalentTo((IEnumerable<T>)expected, configure: null);

    /// <summary>Asserts sequence equivalency using the supplied options.</summary>
    /// <param name="expected">The expected items.</param>
    /// <param name="configure">Options for structural comparison.</param>
    public CollectionAssertions<T> BeEquivalentTo(IEnumerable<T> expected, Action<EquivalencyOptions>? configure)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        var comparer = CreateEquivalencyComparer(expected, configure);
        if (!comparer.TryCompare(_actual, expected, out var mismatchPath))
        {
            AssertionFailure.Fail($"Expected sequence values to be structurally equivalent at '{mismatchPath}'.");
        }

        return this;
    }

    /// <summary>Asserts sequence equivalency and includes formatted context in a failure message.</summary>
    /// <param name="expected">The expected items.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public CollectionAssertions<T> BeEquivalentTo(IEnumerable<T> expected, string? because, params object?[] becauseArgs)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        var comparer = CreateEquivalencyComparer(expected, configure: null);
        if (!comparer.TryCompare(_actual, expected, out var mismatchPath))
        {
            AssertionFailure.FailWithBecause($"Expected sequence values to be structurally equivalent at '{mismatchPath}'.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the sequence is not structurally equivalent to the unexpected value.</summary>
    /// <param name="unexpected">The object graph that must differ.</param>
    /// <param name="configure">Optional settings for member selection, exclusions, custom comparers, fields, ordering, and maximum graph depth.</param>
    public CollectionAssertions<T> NotBeEquivalentTo<TExpected>(TExpected unexpected, Action<EquivalencyOptions>? configure = null)
    {
        var comparer = CreateEquivalencyComparer(unexpected, configure);
        if (comparer.TryCompare(_actual, unexpected, out _))
        {
            AssertionFailure.Fail("Expected sequence values not to be structurally equivalent, but they matched.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence is not structurally equivalent to the supplied items.</summary>
    /// <param name="unexpected">The items that must differ.</param>
    public CollectionAssertions<T> NotBeEquivalentTo(params T[] unexpected)
        => NotBeEquivalentTo((IEnumerable<T>)unexpected, configure: null);

    /// <summary>Asserts sequence difference using the supplied options.</summary>
    /// <param name="unexpected">The items that must differ.</param>
    /// <param name="configure">Options for structural comparison.</param>
    public CollectionAssertions<T> NotBeEquivalentTo(IEnumerable<T> unexpected, Action<EquivalencyOptions>? configure)
    {
        if (unexpected is null)
        {
            throw new ArgumentNullException(nameof(unexpected));
        }

        var comparer = CreateEquivalencyComparer(unexpected, configure);
        if (comparer.TryCompare(_actual, unexpected, out _))
        {
            AssertionFailure.Fail("Expected sequence values not to be structurally equivalent, but they matched.");
        }

        return this;
    }

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

    /// <summary>Asserts that the sequence is empty and includes formatted context in a failure message.</summary>
    public CollectionAssertions<T> BeEmpty(string? because, params object?[] becauseArgs)
    {
        if (_actual is null)
        {
            AssertionFailure.FailWithBecause("Expected an empty sequence, but found null.", because, becauseArgs);
        }

        using var enumerator = _actual.GetEnumerator();
        if (enumerator.MoveNext())
        {
            AssertionFailure.FailWithBecause("Expected an empty sequence, but it contained at least one item.", because, becauseArgs);
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

    /// <summary>Asserts that the sequence contains at least one item and includes formatted context on failure.</summary>
    public CollectionAssertions<T> NotBeEmpty(string? because, params object?[] becauseArgs)
    {
        if (_actual is null)
        {
            AssertionFailure.FailWithBecause("Expected a non-empty sequence, but found null.", because, becauseArgs);
        }

        using var enumerator = _actual.GetEnumerator();
        if (!enumerator.MoveNext())
        {
            AssertionFailure.FailWithBecause("Expected a non-empty sequence, but found an empty sequence.", because, becauseArgs);
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
    /// <remarks>The sequence is enumerated at most once for this call. Separate chained assertions enumerate independently.</remarks>
    public CollectionAssertions<T> Contain(params T[] expected)
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
            AssertionFailure.Fail($"Expected sequence to contain an item equal to {AssertionFailure.Describe(expected[0])}.");
            return this;
        }

        var comparer = EqualityComparer<T>.Default;
        var matched = new bool[expected.Length];
        var matchedCount = 0;

        foreach (var actual in _actual)
        {
            for (var index = 0; index < expected.Length; index++)
            {
                if (!matched[index] && comparer.Equals(actual, expected[index]))
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

        for (var index = 0; index < expected.Length; index++)
        {
            if (!matched[index])
            {
                AssertionFailure.Fail($"Expected sequence to contain an item equal to {AssertionFailure.Describe(expected[index])}.");
                break;
            }
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

    /// <summary>Asserts that the sequence does not have the exact requested runtime type.</summary>
    public CollectionAssertions<T> NotBeOfType<TUnexpected>()
    {
        if (_actual is not null && _actual.GetType() == typeof(TUnexpected))
        {
            AssertionFailure.Fail($"Expected a sequence not to have exact runtime type '{typeof(TUnexpected).FullName}'.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence object is not assignable to the requested type.</summary>
    public CollectionAssertions<T> NotBeAssignableTo<TUnexpected>()
    {
        if (_actual is TUnexpected)
        {
            AssertionFailure.Fail($"Expected a sequence not assignable to '{typeof(TUnexpected).FullName}'.");
        }

        return this;
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
    public CollectionAssertions<T> NotContain(T unexpected) => NotContain(unexpected, null);

    /// <summary>Asserts that the sequence does not contain an equal item and adds formatted context to a failure message.</summary>
    /// <param name="unexpected">The item that must not be present.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public CollectionAssertions<T> NotContain(T unexpected, string? because, params object?[] becauseArgs)
    {
        if (_actual is not null)
        {
            var comparer = EqualityComparer<T>.Default;
            foreach (var item in _actual)
            {
                if (comparer.Equals(item, unexpected))
                {
                    AssertionFailure.FailWithBecause(
                        $"Expected sequence not to contain an item equal to {AssertionFailure.Describe(unexpected)}.",
                        because,
                        becauseArgs);
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

    /// <summary>Asserts that the sequence contains no null items.</summary>
    public CollectionAssertions<T> NotContainNulls()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence without null items, but found null.");
        }

        var index = 0;
        foreach (var item in _actual)
        {
            if (item is null)
            {
                AssertionFailure.Fail($"Expected a sequence without null items, but found one at index {index}.");
            }

            index++;
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

    /// <summary>Asserts that the sequence does not equal the supplied items in order.</summary>
    public CollectionAssertions<T> NotEqual(params T[] unexpected)
    {
        if (unexpected is null)
        {
            throw new ArgumentNullException(nameof(unexpected));
        }

        if (_actual is null)
        {
            return this;
        }

        using var actualEnumerator = _actual.GetEnumerator();
        var comparer = EqualityComparer<T>.Default;
        for (var index = 0; index < unexpected.Length; index++)
        {
            if (!actualEnumerator.MoveNext() || !comparer.Equals(actualEnumerator.Current, unexpected[index]))
            {
                return this;
            }
        }

        if (!actualEnumerator.MoveNext())
        {
            AssertionFailure.Fail("Expected sequence not to equal the supplied items, but every item matched in order.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence starts with the expected items in the specified order.</summary>
    /// <param name="expected">A finite sequence of expected leading items.</param>
    public CollectionAssertions<T> StartWith(params T[] expected) => StartWith((IEnumerable<T>)expected);

    /// <summary>Asserts that the sequence starts with the expected items in the specified order.</summary>
    /// <param name="expected">A finite sequence of expected leading items.</param>
    /// <param name="comparer">The comparer used to match items. Defaults to <see cref="EqualityComparer{T}.Default"/>.</param>
    /// <remarks>The expected sequence is read at most once. A null subject fails, including for an empty expectation. A non-null subject with an empty expectation succeeds without enumeration.</remarks>
    public CollectionAssertions<T> StartWith(IEnumerable<T> expected, IEqualityComparer<T>? comparer = null)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a non-null sequence to start with the requested items.");
        }

        if (ReferenceEquals(_actual, expected))
        {
            return this;
        }

        var expectedItems = GetExpectedItems(expected);
        if (expectedItems.Count == 0)
        {
            return this;
        }

        comparer ??= EqualityComparer<T>.Default;
        using var actualEnumerator = _actual!.GetEnumerator();
        for (var index = 0; index < expectedItems.Count; index++)
        {
            if (!actualEnumerator.MoveNext())
            {
                AssertionFailure.Fail($"Expected the sequence to start with {expectedItems.Count} items, but it ended at index {index}.");
            }

            if (!comparer.Equals(actualEnumerator.Current, expectedItems[index]))
            {
                AssertionFailure.Fail($"Expected the sequence prefix to match at index {index}.");
            }
        }

        return this;
    }

    /// <summary>Asserts that the sequence ends with the expected items in the specified order.</summary>
    /// <param name="expected">A finite sequence of expected trailing items.</param>
    public CollectionAssertions<T> EndWith(params T[] expected) => EndWith((IEnumerable<T>)expected);

    /// <summary>Asserts that the sequence ends with the expected items in the specified order.</summary>
    /// <param name="expected">A finite sequence of expected trailing items.</param>
    /// <param name="comparer">The comparer used to match items. Defaults to <see cref="EqualityComparer{T}.Default"/>.</param>
    /// <remarks>The subject and expected sequence are each read at most once. A null subject fails, including for an empty expectation. A non-null subject with an empty expectation succeeds without subject enumeration.</remarks>
    public CollectionAssertions<T> EndWith(IEnumerable<T> expected, IEqualityComparer<T>? comparer = null)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a non-null sequence to end with the requested items.");
        }

        if (ReferenceEquals(_actual, expected))
        {
            return this;
        }

        var expectedItems = GetExpectedItems(expected);
        if (expectedItems.Count == 0)
        {
            return this;
        }

        var actualItems = Materialize(_actual!);
        var firstExpectedIndex = actualItems.Count - expectedItems.Count;
        if (firstExpectedIndex < 0)
        {
            AssertionFailure.Fail($"Expected the sequence to end with {expectedItems.Count} items, but it contained only {actualItems.Count}.");
        }

        comparer ??= EqualityComparer<T>.Default;
        for (var expectedIndex = 0; expectedIndex < expectedItems.Count; expectedIndex++)
        {
            if (!comparer.Equals(actualItems[firstExpectedIndex + expectedIndex], expectedItems[expectedIndex]))
            {
                AssertionFailure.Fail($"Expected the sequence suffix to match at index {firstExpectedIndex + expectedIndex}.");
            }
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

    /// <summary>Asserts that the item at <paramref name="index"/> equals <paramref name="expected"/> and returns it.</summary>
    /// <param name="index">The zero-based item position.</param>
    /// <param name="expected">The value expected at that position.</param>
    /// <remarks>The subject is enumerated once and disposed. A negative index is an argument error; an absent or unequal item is an assertion failure.</remarks>
    public SingleItemAssertions<T> HaveElementAt(int index, T expected)
    {
        if (index < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(index), index, "Index cannot be negative.");
        }

        if (_actual is null)
        {
            AssertionFailure.Fail($"Expected an item equal to {AssertionFailure.Describe(expected)} at index {index}, but found a null sequence.");
        }

        using var enumerator = _actual.GetEnumerator();
        var currentIndex = 0;
        while (enumerator.MoveNext())
        {
            var actual = enumerator.Current;
            if (currentIndex == index)
            {
                if (!EqualityComparer<T>.Default.Equals(actual, expected))
                {
                    AssertionFailure.Fail($"Expected item at index {index} to equal {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(actual)}.");
                }

                return new SingleItemAssertions<T>(actual);
            }

            currentIndex++;
        }

        AssertionFailure.Fail($"Expected an item at index {index}, but the sequence ended after {currentIndex} items.");
        return null!;
    }

    /// <summary>Asserts that <paramref name="expectedPredecessor"/> immediately precedes the first matching <paramref name="successor"/>.</summary>
    /// <remarks>The subject is read once and stops at the first matching successor. Failure messages omit compared values.</remarks>
    public CollectionAssertions<T> HaveElementPreceding(T successor, T expectedPredecessor)
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence with a matching successor, but found null.");
        }

        using var enumerator = _actual.GetEnumerator();
        if (!enumerator.MoveNext())
        {
            AssertionFailure.Fail("Expected a sequence with a matching successor, but found an empty sequence.");
        }

        var comparer = EqualityComparer<T>.Default;
        var hasPredecessor = false;
        var previous = default(T)!;
        do
        {
            var current = enumerator.Current;
            if (comparer.Equals(current, successor))
            {
                if (!hasPredecessor)
                {
                    AssertionFailure.Fail("Expected the first matching successor to have a preceding item, but it was the first sequence item.");
                }

                if (!comparer.Equals(previous, expectedPredecessor))
                {
                    AssertionFailure.Fail("Expected the item immediately before the first matching successor to match.");
                }

                return this;
            }

            previous = current;
            hasPredecessor = true;
        }
        while (enumerator.MoveNext());

        AssertionFailure.Fail("Expected a matching successor in the sequence, but none was found.");
        return this;
    }

    /// <summary>Asserts that <paramref name="expectedSuccessor"/> immediately follows the first matching <paramref name="predecessor"/>.</summary>
    /// <remarks>The subject is read once and stops after the first matching predecessor and its successor. Failure messages omit compared values.</remarks>
    public CollectionAssertions<T> HaveElementSucceeding(T predecessor, T expectedSuccessor)
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence with a matching predecessor, but found null.");
        }

        using var enumerator = _actual.GetEnumerator();
        if (!enumerator.MoveNext())
        {
            AssertionFailure.Fail("Expected a sequence with a matching predecessor, but found an empty sequence.");
        }

        var comparer = EqualityComparer<T>.Default;
        do
        {
            if (comparer.Equals(enumerator.Current, predecessor))
            {
                if (!enumerator.MoveNext())
                {
                    AssertionFailure.Fail("Expected the first matching predecessor to have a succeeding item, but it was the last sequence item.");
                }

                if (!comparer.Equals(enumerator.Current, expectedSuccessor))
                {
                    AssertionFailure.Fail("Expected the item immediately after the first matching predecessor to match.");
                }

                return this;
            }
        }
        while (enumerator.MoveNext());

        AssertionFailure.Fail("Expected a matching predecessor in the sequence, but none was found.");
        return this;
    }

    /// <summary>Asserts that the expected items occur in the sequence in the given order.</summary>
    /// <remarks>Other sequence items may occur between the expected items.</remarks>
    /// <param name="expected">The ordered subsequence to find.</param>
    /// <returns>This assertion object for additional checks.</returns>
    public CollectionAssertions<T> ContainInOrder(params T[] expected) => ContainInOrder((IEnumerable<T>)expected);

    /// <summary>Asserts that the expected sequence occurs in the subject in order, allowing intervening items.</summary>
    /// <remarks>The subject and expected sequence are each read at most once. An empty expectation succeeds, including for a null subject.</remarks>
    /// <param name="expected">The ordered subsequence to find.</param>
    public CollectionAssertions<T> ContainInOrder(IEnumerable<T> expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        var expectedItems = GetExpectedItems(expected);
        if (expectedItems.Count == 0)
        {
            return this;
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected the sequence to contain the requested items in order, but found null.");
        }

        if (ReferenceEquals(_actual, expected))
        {
            return this;
        }

        var comparer = EqualityComparer<T>.Default;
        var expectedIndex = 0;
        foreach (var item in _actual)
        {
            if (comparer.Equals(item, expectedItems[expectedIndex]))
            {
                expectedIndex++;
                if (expectedIndex == expectedItems.Count)
                {
                    return this;
                }
            }
        }

        AssertionFailure.Fail($"Expected sequence to contain {expectedItems.Count} items in the specified order.");
        return this;
    }

    /// <summary>Asserts that the sequence does not contain the expected items in order, allowing intervening items.</summary>
    /// <remarks>An empty expectation succeeds. Null subjects fail. The subject and expected sequence are each read at most once.</remarks>
    /// <param name="unexpected">The ordered subsequence that must not occur.</param>
    public CollectionAssertions<T> NotContainInOrder(params T[] unexpected) => NotContainInOrder((IEnumerable<T>)unexpected);

    /// <summary>Asserts that the sequence does not contain the expected items in order, allowing intervening items.</summary>
    /// <param name="unexpected">The ordered subsequence that must not occur.</param>
    public CollectionAssertions<T> NotContainInOrder(IEnumerable<T> unexpected)
    {
        if (unexpected is null)
        {
            throw new ArgumentNullException(nameof(unexpected));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Cannot verify absence of ordered containment in a null sequence.");
        }

        var unexpectedItems = GetExpectedItems(unexpected);
        if (unexpectedItems.Count == 0)
        {
            return this;
        }

        var actualItems = ReferenceEquals(_actual, unexpected)
            ? unexpectedItems
            : GetExpectedItems(_actual);
        var comparer = EqualityComparer<T>.Default;
        var unexpectedIndex = 0;
        var lastMatchIndex = -1;
        for (var actualIndex = 0; actualIndex < actualItems.Count; actualIndex++)
        {
            if (comparer.Equals(actualItems[actualIndex], unexpectedItems[unexpectedIndex]))
            {
                unexpectedIndex++;
                lastMatchIndex = actualIndex;
                if (unexpectedIndex == unexpectedItems.Count)
                {
                    AssertionFailure.Fail($"Expected no ordered match, but the requested items appeared in order ending at index {lastMatchIndex}.");
                }
            }
        }

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

    /// <summary>Asserts that the sequence is null.</summary>
    public CollectionAssertions<T> BeNull() => BeNull(null);

    /// <summary>Asserts that the sequence is null and adds formatted context to a failure message.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public CollectionAssertions<T> BeNull(string? because, params object?[] becauseArgs)
    {
        if (_actual is not null)
        {
            AssertionFailure.FailWithBecause("Expected a null sequence.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the sequence is not null.</summary>
    public CollectionAssertions<T> NotBeNull() => NotBeNull(null);

    /// <summary>Asserts that the sequence is not null and adds formatted context to a failure message.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public CollectionAssertions<T> NotBeNull(string? because, params object?[] becauseArgs)
    {
        if (_actual is null)
        {
            AssertionFailure.FailWithBecause("Expected a non-null sequence.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the sequence is null or contains no items.</summary>
    public CollectionAssertions<T> BeNullOrEmpty()
    {
        if (_actual is null)
        {
            return this;
        }

        using var enumerator = _actual.GetEnumerator();
        if (enumerator.MoveNext())
        {
            AssertionFailure.Fail("Expected a null or empty sequence, but it contained at least one item.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence is non-null and contains at least one item.</summary>
    public CollectionAssertions<T> NotBeNullOrEmpty()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a non-null, non-empty sequence, but found null.");
        }

        using var enumerator = _actual.GetEnumerator();
        if (!enumerator.MoveNext())
        {
            AssertionFailure.Fail("Expected a non-null, non-empty sequence, but found an empty sequence.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence does not contain the specified number of items.</summary>
    public CollectionAssertions<T> NotHaveCount(int unexpected)
    {
        ValidateNonnegative(unexpected, nameof(unexpected));
        var count = CountSubject();
        if (count == unexpected)
        {
            AssertionFailure.Fail($"Expected a sequence count different from {unexpected}.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence contains more than the specified number of items.</summary>
    public CollectionAssertions<T> HaveCountGreaterThan(int expected)
    {
        ValidateNonnegative(expected, nameof(expected));
        var count = CountSubject();
        if (count <= expected)
        {
            AssertionFailure.Fail($"Expected sequence count greater than {expected}, but found {count}.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence contains at least the specified number of items.</summary>
    public CollectionAssertions<T> HaveCountGreaterThanOrEqualTo(int expected)
    {
        ValidateNonnegative(expected, nameof(expected));
        var count = CountSubject();
        if (count < expected)
        {
            AssertionFailure.Fail($"Expected sequence count to be at least {expected}, but found {count}.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence contains fewer than the specified number of items.</summary>
    public CollectionAssertions<T> HaveCountLessThan(int expected)
    {
        ValidateNonnegative(expected, nameof(expected));
        var count = CountSubject();
        if (count >= expected)
        {
            AssertionFailure.Fail($"Expected sequence count less than {expected}, but found {count}.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence contains no more than the specified number of items.</summary>
    public CollectionAssertions<T> HaveCountLessThanOrEqualTo(int expected)
    {
        ValidateNonnegative(expected, nameof(expected));
        var count = CountSubject();
        if (count > expected)
        {
            AssertionFailure.Fail($"Expected sequence count to be at most {expected}, but found {count}.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence and another sequence contain the same number of items.</summary>
    public CollectionAssertions<T> HaveSameCount(IEnumerable<T> expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence with the same count, but found null.");
        }

        if (ReferenceEquals(_actual, expected))
        {
            return this;
        }

        using var actualEnumerator = _actual.GetEnumerator();
        using var expectedEnumerator = expected.GetEnumerator();
        var index = 0;
        while (true)
        {
            var hasActual = actualEnumerator.MoveNext();
            var hasExpected = expectedEnumerator.MoveNext();
            if (hasActual != hasExpected)
            {
                AssertionFailure.Fail($"Expected sequences with the same count, but their lengths differed at index {index}.");
            }

            if (!hasActual)
            {
                return this;
            }

            index++;
        }
    }

    /// <summary>Asserts that the sequence is in ascending order.</summary>
    /// <param name="comparer">The comparer used to order items, or the default comparer when omitted.</param>
    public CollectionAssertions<T> BeInAscendingOrder(IComparer<T>? comparer = null)
    {
        comparer ??= Comparer<T>.Default;
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected an ascending sequence, but found null.");
        }

        using var enumerator = _actual.GetEnumerator();
        if (!enumerator.MoveNext())
        {
            return this;
        }

        var previous = enumerator.Current;
        var index = 1;
        while (enumerator.MoveNext())
        {
            var current = enumerator.Current;
            if (comparer.Compare(previous, current) > 0)
            {
                AssertionFailure.Fail($"Expected ascending order, but order failed at index {index}.");
            }

            previous = current;
            index++;
        }

        return this;
    }

    /// <summary>Asserts that the sequence is in descending order.</summary>
    /// <param name="comparer">The comparer used to order items, or the default comparer when omitted.</param>
    public CollectionAssertions<T> BeInDescendingOrder(IComparer<T>? comparer = null)
    {
        comparer ??= Comparer<T>.Default;
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a descending sequence, but found null.");
        }

        using var enumerator = _actual.GetEnumerator();
        if (!enumerator.MoveNext())
        {
            return this;
        }

        var previous = enumerator.Current;
        var index = 1;
        while (enumerator.MoveNext())
        {
            var current = enumerator.Current;
            if (comparer.Compare(previous, current) < 0)
            {
                AssertionFailure.Fail($"Expected descending order, but order failed at index {index}.");
            }

            previous = current;
            index++;
        }

        return this;
    }

    /// <summary>Asserts that the sequence is in ascending order by a selected key.</summary>
    /// <typeparam name="TKey">The selected key type.</typeparam>
    /// <param name="keySelector">The key calculated once for each sequence item.</param>
    /// <param name="comparer">The key comparer, or the default comparer when omitted.</param>
    /// <remarks>Equal adjacent keys are allowed. The sequence is enumerated once.</remarks>
    public CollectionAssertions<T> BeInAscendingOrderBy<TKey>(Func<T, TKey> keySelector, IComparer<TKey>? comparer = null) =>
        CheckOrderByKey(keySelector, comparer, ascending: true);

    /// <summary>Asserts that the sequence is in descending order by a selected key.</summary>
    /// <typeparam name="TKey">The selected key type.</typeparam>
    /// <param name="keySelector">The key calculated once for each sequence item.</param>
    /// <param name="comparer">The key comparer, or the default comparer when omitted.</param>
    /// <remarks>Equal adjacent keys are allowed. The sequence is enumerated once.</remarks>
    public CollectionAssertions<T> BeInDescendingOrderBy<TKey>(Func<T, TKey> keySelector, IComparer<TKey>? comparer = null) =>
        CheckOrderByKey(keySelector, comparer, ascending: false);

    /// <summary>Asserts that every sequence item is unique under the supplied equality comparer.</summary>
    /// <param name="comparer">The comparer used to identify duplicate items, or the default comparer when omitted.</param>
    public CollectionAssertions<T> OnlyHaveUniqueItems(IEqualityComparer<T>? comparer = null)
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence of unique items, but found null.");
        }

        comparer ??= EqualityComparer<T>.Default;
        var seen = new List<T>();
        using var enumerator = _actual.GetEnumerator();
        var index = 0;
        while (enumerator.MoveNext())
        {
            var current = enumerator.Current;
            for (var seenIndex = 0; seenIndex < seen.Count; seenIndex++)
            {
                if (comparer.Equals(seen[seenIndex], current))
                {
                    AssertionFailure.Fail($"Expected unique items, but a duplicate was found at index {index}.");
                }
            }

            seen.Add(current);
            index++;
        }

        return this;
    }

    /// <summary>Asserts that the sequence contains at least the expected item multiplicities, regardless of order.</summary>
    /// <remarks>Items are compared with the equality comparer; this does not compare object graphs structurally.</remarks>
    /// <param name="expected">The expected items and multiplicities.</param>
    /// <param name="comparer">The comparer used to match items, or the default comparer when omitted.</param>
    public CollectionAssertions<T> ContainEquivalentItems(IEnumerable<T> expected, IEqualityComparer<T>? comparer = null)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence containing the requested items, but found null.");
        }

        var actualItems = Materialize(_actual);
        var expectedItems = ReferenceEquals(_actual, expected) ? actualItems : Materialize(expected);
        comparer ??= EqualityComparer<T>.Default;
        if (!ContainsMultiset(actualItems, expectedItems, comparer))
        {
            AssertionFailure.Fail("Expected sequence to contain the requested item multiplicities.");
        }

        return this;
    }

    /// <summary>Asserts that every sequence item is structurally equivalent to the expected value.</summary>
    /// <param name="expected">The expected object shape and values.</param>
    /// <param name="configure">Optional comparison rules for this assertion.</param>
    /// <remarks>The subject is enumerated once. Nested sequences are snapshotted at most once during this assertion.</remarks>
    public CollectionAssertions<T> AllBeEquivalentTo<TExpected>(TExpected expected, Action<EquivalencyOptions>? configure = null)
    {
        var comparer = CreateEquivalencyComparer(expected, configure);
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected every sequence item to be structurally equivalent, but found a null sequence.");
        }

        using var enumerator = _actual.GetEnumerator();
        var index = 0;
        while (enumerator.MoveNext())
        {
            var item = enumerator.Current;
            if (!comparer.CreateFreshComparison().TryCompare(item, expected, out var mismatchPath))
            {
                AssertionFailure.Fail($"Expected item at index {index} to be structurally equivalent at '{mismatchPath}'.");
            }

            index++;
        }

        return this;
    }

    /// <summary>Asserts that the sequence contains an item structurally equivalent to the expected value and returns it.</summary>
    /// <param name="expected">The expected object shape and values.</param>
    /// <param name="configure">Optional comparison rules for this assertion.</param>
    /// <remarks>The subject is enumerated once. Nested sequences are snapshotted at most once during this assertion.</remarks>
    public SingleItemAssertions<T> ContainEquivalentOf<TExpected>(TExpected expected, Action<EquivalencyOptions>? configure = null)
    {
        var comparer = CreateEquivalencyComparer(expected, configure);
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence containing a structurally equivalent item, but found a null sequence.");
        }

        using var enumerator = _actual.GetEnumerator();
        var index = 0;
        while (enumerator.MoveNext())
        {
            var item = enumerator.Current;
            if (comparer.CreateFreshComparison().TryCompare(item, expected, out _))
            {
                return new SingleItemAssertions<T>(item);
            }

            index++;
        }

        AssertionFailure.Fail($"Expected a structurally equivalent item, but no match was found among {index} sequence items.");
        return null!;
    }

    /// <summary>Asserts that no sequence item is structurally equivalent to the unexpected value.</summary>
    /// <param name="unexpected">The object shape and values that must not occur.</param>
    /// <param name="configure">Optional comparison rules for this assertion.</param>
    /// <remarks>The subject is enumerated once. Nested sequences are snapshotted at most once during this assertion.</remarks>
    public CollectionAssertions<T> NotContainEquivalentOf<TExpected>(TExpected unexpected, Action<EquivalencyOptions>? configure = null)
    {
        var comparer = CreateEquivalencyComparer(unexpected, configure);
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence without a structurally equivalent item, but found a null sequence.");
        }

        using var enumerator = _actual.GetEnumerator();
        var index = 0;
        while (enumerator.MoveNext())
        {
            var item = enumerator.Current;
            if (comparer.CreateFreshComparison().TryCompare(item, unexpected, out _))
            {
                AssertionFailure.Fail($"Expected no structurally equivalent item, but found one at index {index}.");
            }

            index++;
        }

        return this;
    }

    /// <summary>Asserts that the sequence contains the same item multiplicities, regardless of order.</summary>
    /// <remarks>Items are compared with the equality comparer; this does not compare object graphs structurally.</remarks>
    /// <param name="expected">The expected items and multiplicities.</param>
    /// <param name="comparer">The comparer used to match items, or the default comparer when omitted.</param>
    public CollectionAssertions<T> HaveSameItems(IEnumerable<T> expected, IEqualityComparer<T>? comparer = null)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence with the same items, but found null.");
        }

        var actualItems = Materialize(_actual);
        var expectedItems = ReferenceEquals(_actual, expected) ? actualItems : Materialize(expected);
        comparer ??= EqualityComparer<T>.Default;
        if (actualItems.Count != expectedItems.Count || !ContainsMultiset(actualItems, expectedItems, comparer))
        {
            AssertionFailure.Fail("Expected sequences to contain the same item multiplicities.");
        }

        return this;
    }

    /// <summary>Asserts that every distinct item in the sequence is present in the supplied superset.</summary>
    /// <remarks>Duplicate items do not require duplicate matches in the superset. Each distinct input sequence is enumerated at most once.</remarks>
    public CollectionAssertions<T> BeSubsetOf(IEnumerable<T> superset)
    {
        if (superset is null)
        {
            throw new ArgumentNullException(nameof(superset));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence that is a subset, but found null.");
        }

        if (!ReferenceEquals(_actual, superset) && !ContainsAllItems(superset))
        {
            AssertionFailure.Fail("Expected every sequence item to be present in the supplied superset.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence is not a subset of the supplied collection.</summary>
    /// <remarks>Duplicate items do not require duplicate matches in the superset. Each distinct input sequence is enumerated at most once.</remarks>
    public CollectionAssertions<T> NotBeSubsetOf(IEnumerable<T> superset)
    {
        if (superset is null)
        {
            throw new ArgumentNullException(nameof(superset));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence that is not a subset, but found null.");
        }

        if (ReferenceEquals(_actual, superset) || ContainsAllItems(superset))
        {
            AssertionFailure.Fail("Expected the sequence not to be a subset of the supplied collection.");
        }

        return this;
    }

    /// <summary>Asserts that the sequence and another sequence share at least one distinct item.</summary>
    /// <returns>A new assertion object over the distinct shared items, in the order they occur in this sequence.</returns>
    public CollectionAssertions<T> IntersectWith(IEnumerable<T> other)
    {
        var intersection = GetIntersection(other);
        if (intersection.Count == 0)
        {
            AssertionFailure.Fail("Expected the sequences to share at least one item, but no intersection was found.");
        }

        return new CollectionAssertions<T>(intersection);
    }

    /// <summary>Asserts that the sequence and another sequence share no items.</summary>
    public CollectionAssertions<T> NotIntersectWith(IEnumerable<T> other)
    {
        if (GetIntersection(other).Count > 0)
        {
            AssertionFailure.Fail("Expected the sequences to have no shared items, but an intersection was found.");
        }

        return this;
    }

    /// <summary>Asserts that each sequence item satisfies its corresponding assertion in order.</summary>
    /// <param name="assertions">The per-item assertions, in sequence order.</param>
    public CollectionAssertions<T> SatisfyRespectively(params Action<T>[] assertions)
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        for (var index = 0; index < assertions.Length; index++)
        {
            if (assertions[index] is null)
            {
                throw new ArgumentException("An item assertion cannot be null.", nameof(assertions));
            }
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence with one item for each assertion, but found null.");
        }

        var items = Materialize(_actual);
        if (items.Count != assertions.Length)
        {
            AssertionFailure.Fail($"Expected {assertions.Length} items for the per-item assertions, but found {items.Count}.");
        }

        for (var index = 0; index < assertions.Length; index++)
        {
            assertions[index](items[index]);
        }

        return this;
    }

    /// <summary>Asserts that every item in the sequence satisfies the supplied assertion.</summary>
    /// <param name="assertion">The assertion applied once to each item.</param>
    public CollectionAssertions<T> AllSatisfy(Action<T> assertion)
    {
        if (assertion is null)
        {
            throw new ArgumentNullException(nameof(assertion));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence whose items satisfy the assertion, but found null.");
        }

        using var enumerator = _actual.GetEnumerator();
        while (enumerator.MoveNext())
        {
            assertion(enumerator.Current);
        }

        return this;
    }

    /// <summary>Asserts that every item is assignable to <typeparamref name="TExpected"/> and returns the typed matches.</summary>
    /// <remarks>An empty sequence succeeds. A null sequence or a null item fails. The sequence is enumerated once.</remarks>
    public CollectionAssertions<TExpected> AllBeAssignableTo<TExpected>()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence whose items are assignable to the requested type, but found null.");
        }

        var matches = new List<TExpected>();
        var index = 0;
        foreach (var item in _actual)
        {
            if (item is null)
            {
                AssertionFailure.Fail($"Expected every item to be assignable to '{GetTypeName(typeof(TExpected))}', but item at index {index} was null.");
            }

            var actualType = GetAssertedType(item!);
            if (!typeof(TExpected).IsAssignableFrom(actualType))
            {
                AssertionFailure.Fail($"Expected every item to be assignable to '{GetTypeName(typeof(TExpected))}', but item at index {index} had type '{GetTypeName(actualType)}'.");
            }

            if (item is TExpected typedItem)
            {
                matches.Add(typedItem);
            }

            index++;
        }

        return new CollectionAssertions<TExpected>(matches);
    }

    /// <summary>Asserts that every item is assignable to <paramref name="expectedType"/>.</summary>
    /// <remarks>An empty sequence succeeds. A null sequence or a null item fails. The sequence is enumerated once.</remarks>
    /// <param name="expectedType">The type that every item must be assignable to.</param>
    public CollectionAssertions<T> AllBeAssignableTo(Type expectedType)
    {
        ValidateExpectedType(expectedType);
        CheckAllItemsMatchType(expectedType, requireExactType: false);
        return this;
    }

    /// <summary>Asserts that every item has exactly the runtime type <typeparamref name="TExpected"/> and returns the typed matches.</summary>
    /// <remarks>An empty sequence succeeds. A null sequence or a null item fails. The sequence is enumerated once.</remarks>
    public CollectionAssertions<TExpected> AllBeOfType<TExpected>()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence whose items have the requested exact runtime type, but found null.");
        }

        var expectedType = typeof(TExpected);
        var matches = new List<TExpected>();
        var index = 0;
        foreach (var item in _actual)
        {
            if (item is null)
            {
                AssertionFailure.Fail($"Expected every item to have exact runtime type '{GetTypeName(expectedType)}', but item at index {index} was null.");
            }

            var actualType = GetAssertedType(item!);
            if (actualType != expectedType)
            {
                AssertionFailure.Fail($"Expected every item to have exact runtime type '{GetTypeName(expectedType)}', but item at index {index} had type '{GetTypeName(actualType)}'.");
            }

            if (item is TExpected typedItem)
            {
                matches.Add(typedItem);
            }

            index++;
        }

        return new CollectionAssertions<TExpected>(matches);
    }

    /// <summary>Asserts that every item has exactly the runtime type <paramref name="expectedType"/>.</summary>
    /// <remarks>An empty sequence succeeds. A null sequence or a null item fails. The sequence is enumerated once.</remarks>
    /// <param name="expectedType">The exact runtime type required for every item.</param>
    public CollectionAssertions<T> AllBeOfType(Type expectedType)
    {
        ValidateExpectedType(expectedType);
        CheckAllItemsMatchType(expectedType, requireExactType: true);
        return this;
    }

    /// <summary>Asserts that the sequence contains at least one item assignable to <typeparamref name="TExpected"/>.</summary>
    /// <remarks>Null items do not match. A null sequence or an empty sequence fails. The sequence is enumerated at most once.</remarks>
    public CollectionAssertions<T> ContainItemsAssignableTo<TExpected>() => ContainItemsAssignableTo(typeof(TExpected));

    /// <summary>Asserts that the sequence contains at least one item assignable to <paramref name="expectedType"/>.</summary>
    /// <param name="expectedType">The type that at least one item must be assignable to.</param>
    public CollectionAssertions<T> ContainItemsAssignableTo(Type expectedType)
    {
        ValidateExpectedType(expectedType);
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence containing an item assignable to the requested type, but found null.");
        }

        using var enumerator = _actual.GetEnumerator();
        while (enumerator.MoveNext())
        {
            var item = enumerator.Current;
            if (item is not null && expectedType.IsAssignableFrom(GetAssertedType(item)))
            {
                return this;
            }
        }

        AssertionFailure.Fail($"Expected a sequence containing an item assignable to '{GetTypeName(expectedType)}', but no matching item was found.");
        return this;
    }

    /// <summary>Asserts that the sequence contains no items assignable to <typeparamref name="TExpected"/>.</summary>
    /// <remarks>Null items do not match. An empty sequence succeeds. A null sequence fails.</remarks>
    public CollectionAssertions<T> NotContainItemsAssignableTo<TExpected>() => NotContainItemsAssignableTo(typeof(TExpected));

    /// <summary>Asserts that the sequence contains no items assignable to <paramref name="unexpectedType"/>.</summary>
    /// <param name="unexpectedType">The type that no item may be assignable to.</param>
    public CollectionAssertions<T> NotContainItemsAssignableTo(Type unexpectedType)
    {
        ValidateExpectedType(unexpectedType, nameof(unexpectedType));
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence containing no items assignable to the requested type, but found null.");
        }

        var index = 0;
        foreach (var item in _actual)
        {
            if (item is not null && unexpectedType.IsAssignableFrom(GetAssertedType(item)))
            {
                AssertionFailure.Fail($"Expected no item assignable to '{GetTypeName(unexpectedType)}', but item at index {index} matched.");
            }

            index++;
        }

        return this;
    }

    /// <summary>Asserts that the expected items appear consecutively in the sequence.</summary>
    /// <remarks>No items may occur between expected items. An empty expectation succeeds, including for a null sequence.</remarks>
    /// <param name="expected">The consecutive items to find.</param>
    public CollectionAssertions<T> ContainConsecutive(params T[] expected) => ContainInConsecutiveOrder((IEnumerable<T>)expected);

    /// <summary>Asserts that the expected items appear consecutively in the sequence.</summary>
    /// <param name="expected">The consecutive items to find.</param>
    public CollectionAssertions<T> ContainInConsecutiveOrder(params T[] expected) => ContainInConsecutiveOrder((IEnumerable<T>)expected);

    /// <summary>Asserts that the expected sequence appears consecutively in the subject.</summary>
    /// <remarks>The subject and expected sequence are each read at most once. An empty expectation succeeds, including for a null subject.</remarks>
    /// <param name="expected">The consecutive items to find.</param>
    public CollectionAssertions<T> ContainInConsecutiveOrder(IEnumerable<T> expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        var expectedItems = GetExpectedItems(expected);
        if (expectedItems.Count == 0)
        {
            return this;
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence containing consecutive items, but found null.");
        }

        var items = ReferenceEquals(_actual, expected) ? expectedItems : GetExpectedItems(_actual);
        var comparer = EqualityComparer<T>.Default;
        for (var start = 0; start <= items.Count - expectedItems.Count; start++)
        {
            var matches = true;
            for (var offset = 0; offset < expectedItems.Count; offset++)
            {
                if (!comparer.Equals(items[start + offset], expectedItems[offset]))
                {
                    matches = false;
                    break;
                }
            }

            if (matches)
            {
                return this;
            }
        }

        AssertionFailure.Fail($"Expected {expectedItems.Count} consecutive items in the sequence.");
        return this;
    }

    /// <summary>Asserts that the sequence does not contain the requested items in consecutive order.</summary>
    /// <remarks>An empty expectation succeeds. Null subjects fail. The subject and expected sequence are each read at most once.</remarks>
    /// <param name="unexpected">The consecutive items that must not occur.</param>
    public CollectionAssertions<T> NotContainInConsecutiveOrder(params T[] unexpected) =>
        NotContainInConsecutiveOrder((IEnumerable<T>)unexpected);

    /// <summary>Asserts that the sequence does not contain the requested items in consecutive order.</summary>
    /// <param name="unexpected">The consecutive items that must not occur.</param>
    public CollectionAssertions<T> NotContainInConsecutiveOrder(IEnumerable<T> unexpected)
    {
        if (unexpected is null)
        {
            throw new ArgumentNullException(nameof(unexpected));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Cannot verify absence of consecutive containment in a null sequence.");
        }

        var unexpectedItems = GetExpectedItems(unexpected);
        if (unexpectedItems.Count == 0)
        {
            return this;
        }

        var actualItems = ReferenceEquals(_actual, unexpected)
            ? unexpectedItems
            : GetExpectedItems(_actual);
        var comparer = EqualityComparer<T>.Default;
        for (var start = 0; start <= actualItems.Count - unexpectedItems.Count; start++)
        {
            var matches = true;
            for (var offset = 0; offset < unexpectedItems.Count; offset++)
            {
                if (!comparer.Equals(actualItems[start + offset], unexpectedItems[offset]))
                {
                    matches = false;
                    break;
                }
            }

            if (matches)
            {
                AssertionFailure.Fail($"Expected no consecutive match, but the requested items appeared in order ending at index {start + unexpectedItems.Count - 1}.");
            }
        }

        return this;
    }

    private CollectionAssertions<T> CheckOrderByKey<TKey>(Func<T, TKey> keySelector, IComparer<TKey>? comparer, bool ascending)
    {
        if (keySelector is null)
        {
            throw new ArgumentNullException(nameof(keySelector));
        }

        comparer ??= Comparer<TKey>.Default;
        if (_actual is null)
        {
            var direction = ascending ? "ascending" : "descending";
            AssertionFailure.Fail($"Expected an {direction} sequence by the selected key, but found null.");
        }

        using var enumerator = _actual.GetEnumerator();
        if (!enumerator.MoveNext())
        {
            return this;
        }

        var previousKey = keySelector(enumerator.Current);
        var index = 1;
        while (enumerator.MoveNext())
        {
            var currentKey = keySelector(enumerator.Current);
            var comparison = comparer.Compare(previousKey, currentKey);
            if (ascending ? comparison > 0 : comparison < 0)
            {
                var direction = ascending ? "ascending" : "descending";
                AssertionFailure.Fail($"Expected {direction} order by the selected key, but order failed at index {index}.");
            }

            previousKey = currentKey;
            index++;
        }

        return this;
    }

    private static ObjectGraphEquivalencyComparer CreateEquivalencyComparer<TExpected>(
        TExpected expected,
        Action<EquivalencyOptions>? configure)
    {
        var options = new EquivalencyOptions();
        configure?.Invoke(options);
        options.ValidateIncludedPaths(expected);
        return new ObjectGraphEquivalencyComparer(options);
    }

    private void CheckAllItemsMatchType(Type expectedType, bool requireExactType)
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence with items of the requested type, but found null.");
        }

        var index = 0;
        foreach (var item in _actual)
        {
            if (item is null)
            {
                AssertionFailure.Fail($"Expected every item to match '{GetTypeName(expectedType)}', but item at index {index} was null.");
            }

            var actualType = GetAssertedType(item!);
            var matches = requireExactType
                ? actualType == expectedType
                : expectedType.IsAssignableFrom(actualType);
            if (!matches)
            {
                var relation = requireExactType ? "have exact runtime type" : "be assignable to";
                AssertionFailure.Fail($"Expected every item to {relation} '{GetTypeName(expectedType)}', but item at index {index} had type '{GetTypeName(actualType)}'.");
            }

            index++;
        }
    }

    private static void ValidateExpectedType(Type? expectedType, string parameterName = "expectedType")
    {
        if (expectedType is null)
        {
            throw new ArgumentNullException(parameterName);
        }
    }

    private static Type GetAssertedType(object item) => item is Type representedType ? representedType : item.GetType();

    private static string GetTypeName(Type type) => type.FullName ?? type.Name;

    private long CountSubject()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a sequence with a count, but found null.");
        }

        long count = 0;
        foreach (var _ in _actual)
        {
            count++;
        }

        return count;
    }

    private bool ContainsAllItems(IEnumerable<T> superset)
    {
        var supersetItems = new HashSet<T>(superset);
        foreach (var item in _actual!)
        {
            if (!supersetItems.Contains(item))
            {
                return false;
            }
        }

        return true;
    }

    private List<T> GetIntersection(IEnumerable<T> other)
    {
        if (other is null)
        {
            throw new ArgumentNullException(nameof(other));
        }

        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a non-null sequence to check for shared items.");
        }

        var intersection = new List<T>();
        var sharedItems = new HashSet<T>();
        if (ReferenceEquals(_actual, other))
        {
            foreach (var item in _actual)
            {
                if (sharedItems.Add(item))
                {
                    intersection.Add(item);
                }
            }

            return intersection;
        }

        var otherItems = new HashSet<T>(other);
        foreach (var item in _actual)
        {
            if (otherItems.Contains(item) && sharedItems.Add(item))
            {
                intersection.Add(item);
            }
        }

        return intersection;
    }

    private static void ValidateNonnegative(int count, string parameterName)
    {
        if (count < 0)
        {
            throw new ArgumentOutOfRangeException(parameterName, count, "Count cannot be negative.");
        }
    }

    private static List<T> Materialize(IEnumerable<T> sequence)
    {
        var items = new List<T>();
        using var enumerator = sequence.GetEnumerator();
        while (enumerator.MoveNext())
        {
            items.Add(enumerator.Current);
        }

        return items;
    }

    private static IList<T> GetExpectedItems(IEnumerable<T> sequence) => sequence as IList<T> ?? Materialize(sequence);

    private static bool ContainsMultiset(List<T> actual, List<T> expected, IEqualityComparer<T> comparer)
    {
        if (expected.Count > actual.Count)
        {
            return false;
        }

        var matched = new bool[actual.Count];
        foreach (var expectedItem in expected)
        {
            var found = false;
            for (var actualIndex = 0; actualIndex < actual.Count; actualIndex++)
            {
                if (!matched[actualIndex] && comparer.Equals(actual[actualIndex], expectedItem))
                {
                    matched[actualIndex] = true;
                    found = true;
                    break;
                }
            }

            if (!found)
            {
                return false;
            }
        }

        return true;
    }
}
