#if NET8_0_OR_GREATER
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;

namespace AstraFlow.Assertions;

/// <summary>Assertions for asynchronous sequences on .NET 8 and later.</summary>
public sealed class AsyncEnumerableAssertions<T>
{
    private readonly IAsyncEnumerable<T>? _actual;

    internal AsyncEnumerableAssertions(IAsyncEnumerable<T>? actual) => _actual = actual;

    /// <summary>Returns this assertion object for an additional related check.</summary>
    public AsyncEnumerableAssertions<T> And => this;

    /// <summary>Gets the asynchronous sequence being asserted.</summary>
    public IAsyncEnumerable<T>? Subject => _actual;

    /// <summary>Asserts that the asynchronous sequence has no items.</summary>
    public async Task<AsyncEnumerableAssertions<T>> BeEmptyAsync(CancellationToken cancellationToken = default)
    {
        var actual = RequireSubject();
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        if (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            AssertionFailure.Fail("Expected an empty async sequence, but it contained at least one item.");
        }

        return this;
    }

    /// <summary>Asserts that the asynchronous sequence has at least one item.</summary>
    public async Task<AsyncEnumerableAssertions<T>> NotBeEmptyAsync(CancellationToken cancellationToken = default)
    {
        var actual = RequireSubject();
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        if (!await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            AssertionFailure.Fail("Expected a non-empty async sequence, but it was empty.");
        }

        return this;
    }

    /// <summary>Asserts that the asynchronous sequence contains the expected number of items.</summary>
    public async Task<AsyncEnumerableAssertions<T>> HaveCountAsync(
        int expected,
        CancellationToken cancellationToken = default)
    {
        if (expected < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(expected), expected, "Expected count cannot be negative.");
        }

        var actual = RequireSubject();
        long count = 0;
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            count++;
            if (count > expected)
            {
                AssertionFailure.Fail($"Expected async sequence count {expected}, but found at least {count.ToString(CultureInfo.InvariantCulture)}.");
            }
        }

        if (count != expected)
        {
            AssertionFailure.Fail($"Expected async sequence count {expected}, but found {count.ToString(CultureInfo.InvariantCulture)}.");
        }

        return this;
    }

    /// <summary>Asserts that the asynchronous sequence contains an item equal to the expected value.</summary>
    public async Task<AsyncEnumerableAssertions<T>> ContainAsync(
        T expected,
        IEqualityComparer<T>? comparer = null,
        CancellationToken cancellationToken = default)
    {
        var actual = RequireSubject();
        comparer ??= EqualityComparer<T>.Default;
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            if (comparer.Equals(enumerator.Current, expected))
            {
                return this;
            }
        }

        AssertionFailure.Fail($"Expected async sequence to contain an item equal to {AssertionFailure.Describe(expected)}.");
        return this;
    }

    /// <summary>Asserts that the asynchronous sequence contains an item satisfying the predicate.</summary>
    public async Task<AsyncEnumerableAssertions<T>> ContainAsync(
        Func<T, bool> predicate,
        CancellationToken cancellationToken = default)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }

        var actual = RequireSubject();
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            if (predicate(enumerator.Current))
            {
                return this;
            }
        }

        AssertionFailure.Fail("Expected async sequence to contain an item satisfying the predicate, but no matching item was found.");
        return this;
    }

    /// <summary>Asserts that the asynchronous sequence does not contain an item equal to the specified value.</summary>
    public async Task<AsyncEnumerableAssertions<T>> NotContainAsync(
        T unexpected,
        IEqualityComparer<T>? comparer = null,
        CancellationToken cancellationToken = default)
    {
        if (_actual is null)
        {
            return this;
        }

        comparer ??= EqualityComparer<T>.Default;
        await using var enumerator = _actual.GetAsyncEnumerator(cancellationToken);
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            if (comparer.Equals(enumerator.Current, unexpected))
            {
                AssertionFailure.Fail($"Expected async sequence not to contain an item equal to {AssertionFailure.Describe(unexpected)}.");
            }
        }

        return this;
    }

    /// <summary>Asserts that no item in the asynchronous sequence satisfies the predicate.</summary>
    public async Task<AsyncEnumerableAssertions<T>> NotContainAsync(
        Func<T, bool> predicate,
        CancellationToken cancellationToken = default)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }

        if (_actual is null)
        {
            return this;
        }

        await using var enumerator = _actual.GetAsyncEnumerator(cancellationToken);
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            if (predicate(enumerator.Current))
            {
                AssertionFailure.Fail("Expected async sequence not to contain an item satisfying the predicate.");
            }
        }

        return this;
    }

    /// <summary>Asserts that every item in the asynchronous sequence satisfies the predicate.</summary>
    public async Task<AsyncEnumerableAssertions<T>> OnlyContainAsync(
        Func<T, bool> predicate,
        CancellationToken cancellationToken = default)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }

        var actual = RequireSubject();
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        var index = 0;
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            if (!predicate(enumerator.Current))
            {
                AssertionFailure.Fail($"Expected async sequence item at index {index.ToString(CultureInfo.InvariantCulture)} to satisfy the predicate.");
            }

            index++;
        }

        return this;
    }

    /// <summary>Asserts that every item in the asynchronous sequence is unique under the selected comparer.</summary>
    public async Task<AsyncEnumerableAssertions<T>> OnlyHaveUniqueItemsAsync(
        IEqualityComparer<T>? comparer = null,
        CancellationToken cancellationToken = default)
    {
        var actual = RequireSubject();
        comparer ??= EqualityComparer<T>.Default;
        var seen = new List<T>();
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        var index = 0;
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            var current = enumerator.Current;
            for (var seenIndex = 0; seenIndex < seen.Count; seenIndex++)
            {
                if (comparer.Equals(seen[seenIndex], current))
                {
                    AssertionFailure.Fail($"Expected unique async sequence items, but a duplicate was found at index {index.ToString(CultureInfo.InvariantCulture)}.");
                }
            }

            seen.Add(current);
            index++;
        }

        return this;
    }

    /// <summary>Asserts that the asynchronous sequence contains at least the expected item multiplicities, regardless of order.</summary>
    public async Task<AsyncEnumerableAssertions<T>> ContainEquivalentItemsAsync(
        IEnumerable<T> expected,
        IEqualityComparer<T>? comparer = null,
        CancellationToken cancellationToken = default)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        var actual = RequireSubject();
        var expectedItems = Materialize(expected);
        if (expectedItems.Count == 0)
        {
            return this;
        }

        comparer ??= EqualityComparer<T>.Default;
        var matched = new bool[expectedItems.Count];
        var matchedCount = 0;
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            var item = enumerator.Current;
            for (var expectedIndex = 0; expectedIndex < expectedItems.Count; expectedIndex++)
            {
                if (!matched[expectedIndex] && comparer.Equals(item, expectedItems[expectedIndex]))
                {
                    matched[expectedIndex] = true;
                    matchedCount++;
                    if (matchedCount == expectedItems.Count)
                    {
                        return this;
                    }

                    break;
                }
            }
        }

        AssertionFailure.Fail("Expected async sequence to contain the requested item multiplicities.");
        return this;
    }

    /// <summary>Asserts that the asynchronous sequence contains exactly the same item multiplicities, regardless of order.</summary>
    public async Task<AsyncEnumerableAssertions<T>> HaveSameItemsAsync(
        IEnumerable<T> expected,
        IEqualityComparer<T>? comparer = null,
        CancellationToken cancellationToken = default)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        var actual = RequireSubject();
        var actualItems = await MaterializeAsync(actual, cancellationToken).ConfigureAwait(false);
        var expectedItems = Materialize(expected);
        comparer ??= EqualityComparer<T>.Default;
        if (actualItems.Count != expectedItems.Count || !HaveSameMultiplicities(actualItems, expectedItems, comparer))
        {
            AssertionFailure.Fail("Expected async sequences to contain the same item multiplicities.");
        }

        return this;
    }

    /// <summary>Invokes the assertion once for each asynchronous sequence item, in order.</summary>
    public async Task<AsyncEnumerableAssertions<T>> AllSatisfyAsync(
        Func<T, Task> assertion,
        CancellationToken cancellationToken = default)
    {
        if (assertion is null)
        {
            throw new ArgumentNullException(nameof(assertion));
        }

        var actual = RequireSubject();
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            await assertion(enumerator.Current).ConfigureAwait(false);
        }

        return this;
    }

    /// <summary>Invokes one asynchronous assertion per sequence item in order and requires matching counts.</summary>
    public async Task<AsyncEnumerableAssertions<T>> SatisfyRespectivelyAsync(
        IReadOnlyList<Func<T, Task>> assertions,
        CancellationToken cancellationToken = default)
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        for (var index = 0; index < assertions.Count; index++)
        {
            if (assertions[index] is null)
            {
                throw new ArgumentException("An item assertion cannot be null.", nameof(assertions));
            }
        }

        var actual = RequireSubject();
        var items = await MaterializeAsync(actual, cancellationToken).ConfigureAwait(false);
        if (items.Count != assertions.Count)
        {
            AssertionFailure.Fail($"Expected {assertions.Count.ToString(CultureInfo.InvariantCulture)} items for the per-item async assertions, but found {items.Count.ToString(CultureInfo.InvariantCulture)}.");
        }

        for (var index = 0; index < assertions.Count; index++)
        {
            await assertions[index](items[index]).ConfigureAwait(false);
        }

        return this;
    }

    /// <summary>Asserts that the expected items occur in the asynchronous sequence in the given order.</summary>
    /// <remarks>Other items may occur between expected items. An empty expectation succeeds, including for a null subject.</remarks>
    public async Task<AsyncEnumerableAssertions<T>> ContainInOrderAsync(
        IEnumerable<T> expected,
        CancellationToken cancellationToken = default)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        var expectedItems = new List<T>();
        foreach (var item in expected)
        {
            expectedItems.Add(item);
        }

        if (expectedItems.Count == 0)
        {
            return this;
        }

        var actual = RequireSubject();
        var expectedIndex = 0;
        var comparer = EqualityComparer<T>.Default;
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            if (comparer.Equals(enumerator.Current, expectedItems[expectedIndex]))
            {
                expectedIndex++;
                if (expectedIndex == expectedItems.Count)
                {
                    return this;
                }
            }
        }

        AssertionFailure.Fail($"Expected async sequence to contain {expectedItems.Count.ToString(CultureInfo.InvariantCulture)} items in the specified order.");
        return this;
    }

    /// <summary>Asserts that the expected items occur consecutively in the asynchronous sequence.</summary>
    /// <remarks>An empty expectation succeeds, including for a null subject.</remarks>
    public async Task<AsyncEnumerableAssertions<T>> ContainConsecutiveAsync(
        IEnumerable<T> expected,
        CancellationToken cancellationToken = default)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        var expectedItems = new List<T>();
        foreach (var item in expected)
        {
            expectedItems.Add(item);
        }

        if (expectedItems.Count == 0)
        {
            return this;
        }

        var actual = RequireSubject();
        var window = new Queue<T>(expectedItems.Count);
        var comparer = EqualityComparer<T>.Default;
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            if (window.Count == expectedItems.Count)
            {
                window.Dequeue();
            }

            window.Enqueue(enumerator.Current);
            if (window.Count == expectedItems.Count && WindowMatches(window, expectedItems, comparer))
            {
                return this;
            }
        }

        AssertionFailure.Fail($"Expected {expectedItems.Count.ToString(CultureInfo.InvariantCulture)} consecutive items in the async sequence.");
        return this;
    }

    /// <summary>Asserts that the asynchronous sequence does not contain the expected items in order, allowing intervening items.</summary>
    /// <remarks>An empty expectation succeeds. Null subjects fail. The subject and expected sequence are each read at most once.</remarks>
    public async Task<AsyncEnumerableAssertions<T>> NotContainInOrderAsync(
        IEnumerable<T> unexpected,
        CancellationToken cancellationToken = default)
    {
        if (unexpected is null)
        {
            throw new ArgumentNullException(nameof(unexpected));
        }

        var actual = RequireSubject();
        var unexpectedItems = Materialize(unexpected);
        if (unexpectedItems.Count == 0)
        {
            return this;
        }

        var comparer = EqualityComparer<T>.Default;
        var unexpectedIndex = 0;
        var lastMatchIndex = -1;
        if (ReferenceEquals(actual, unexpected))
        {
            for (var actualIndex = 0; actualIndex < unexpectedItems.Count; actualIndex++)
            {
                if (comparer.Equals(unexpectedItems[actualIndex], unexpectedItems[unexpectedIndex]))
                {
                    unexpectedIndex++;
                    lastMatchIndex = actualIndex;
                    if (unexpectedIndex == unexpectedItems.Count)
                    {
                        AssertionFailure.Fail($"Expected no ordered match, but the requested items appeared in order ending at index {lastMatchIndex.ToString(CultureInfo.InvariantCulture)}.");
                    }
                }
            }

            return this;
        }

        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        var index = 0;
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            if (comparer.Equals(enumerator.Current, unexpectedItems[unexpectedIndex]))
            {
                unexpectedIndex++;
                lastMatchIndex = index;
                if (unexpectedIndex == unexpectedItems.Count)
                {
                    AssertionFailure.Fail($"Expected no ordered match, but the requested items appeared in order ending at index {lastMatchIndex.ToString(CultureInfo.InvariantCulture)}.");
                }
            }

            index++;
        }

        return this;
    }

    /// <summary>Asserts that the asynchronous sequence does not contain the expected items consecutively.</summary>
    /// <remarks>An empty expectation succeeds. Null subjects fail. The subject and expected sequence are each read at most once.</remarks>
    public async Task<AsyncEnumerableAssertions<T>> NotContainInConsecutiveOrderAsync(
        IEnumerable<T> unexpected,
        CancellationToken cancellationToken = default)
    {
        if (unexpected is null)
        {
            throw new ArgumentNullException(nameof(unexpected));
        }

        var actual = RequireSubject();
        var unexpectedItems = Materialize(unexpected);
        if (unexpectedItems.Count == 0)
        {
            return this;
        }

        if (ReferenceEquals(actual, unexpected))
        {
            AssertionFailure.Fail($"Expected no consecutive match, but the requested items appeared in order ending at index {(unexpectedItems.Count - 1).ToString(CultureInfo.InvariantCulture)}.");
        }

        var window = new Queue<T>(unexpectedItems.Count);
        var comparer = EqualityComparer<T>.Default;
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        var index = 0;
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            if (window.Count == unexpectedItems.Count)
            {
                window.Dequeue();
            }

            window.Enqueue(enumerator.Current);
            if (window.Count == unexpectedItems.Count && WindowMatches(window, unexpectedItems, comparer))
            {
                AssertionFailure.Fail($"Expected no consecutive match, but the requested items appeared in order ending at index {index.ToString(CultureInfo.InvariantCulture)}.");
            }

            index++;
        }

        return this;
    }

    /// <summary>Asserts that the asynchronous sequence contains exactly one item and returns it.</summary>
    public async Task<SingleItemAssertions<T>> ContainSingleAsync(CancellationToken cancellationToken = default)
    {
        var actual = RequireSubject();
        await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
        if (!await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            AssertionFailure.Fail("Expected exactly one item in the async sequence, but it was empty.");
        }

        var item = enumerator.Current;
        if (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            AssertionFailure.Fail("Expected exactly one item in the async sequence, but it contained more than one.");
        }

        return new SingleItemAssertions<T>(item);
    }

    /// <summary>Asserts that the asynchronous sequence equals the expected sequence in order.</summary>
    /// <remarks>Both sequences are consumed once. The asynchronous enumerator receives the cancellation token and is disposed on completion or failure.</remarks>
    public async Task<AsyncEnumerableAssertions<T>> EqualAsync(
        IEnumerable<T> expected,
        CancellationToken cancellationToken = default)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        var actual = RequireSubject();
        using var expectedEnumerator = expected.GetEnumerator();
        await using var actualEnumerator = actual.GetAsyncEnumerator(cancellationToken);
        var comparer = EqualityComparer<T>.Default;
        var index = 0;

        while (true)
        {
            var hasExpected = expectedEnumerator.MoveNext();
            var hasActual = await actualEnumerator.MoveNextAsync().ConfigureAwait(false);
            if (!hasExpected && !hasActual)
            {
                break;
            }

            if (!hasExpected || !hasActual || !comparer.Equals(actualEnumerator.Current, expectedEnumerator.Current))
            {
                AssertionFailure.Fail($"Expected async sequence to equal the ordered sequence at index {index.ToString(CultureInfo.InvariantCulture)}.");
            }

            index++;
        }

        return this;
    }

    /// <summary>Asserts that enumerating the asynchronous sequence throws the requested exception type or a derived type.</summary>
    public async Task<ExceptionAssertions<TException>> ThrowAsync<TException>(CancellationToken cancellationToken = default)
        where TException : Exception
        => await ThrowAsyncCore<TException>(cancellationToken, null, Array.Empty<object?>()).ConfigureAwait(false);

    /// <summary>Asserts that enumerating the asynchronous sequence throws the requested exception type or a derived type and adds formatted failure context.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public Task<ExceptionAssertions<TException>> ThrowAsync<TException>(object? because, params object?[] becauseArgs)
        where TException : Exception
        => ThrowAsyncCore<TException>(default, AssertionFailure.ValidateBecause(because), becauseArgs);

    private async Task<ExceptionAssertions<TException>> ThrowAsyncCore<TException>(CancellationToken cancellationToken, string? because, object?[] becauseArgs)
        where TException : Exception
    {
        var actual = RequireSubject();
        try
        {
            await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
            while (await enumerator.MoveNextAsync().ConfigureAwait(false))
            {
                _ = enumerator.Current;
            }
        }
        catch (TException exception)
        {
            return new ExceptionAssertions<TException>(exception);
        }
        catch (Exception exception)
        {
            AssertionFailure.FailWithBecause($"Expected async sequence enumeration to throw '{typeof(TException).FullName}', but an exception of type '{exception.GetType().FullName}' was thrown.", because, becauseArgs);
        }

        AssertionFailure.FailWithBecause($"Expected async sequence enumeration to throw '{typeof(TException).FullName}', but it completed successfully.", because, becauseArgs);
        throw new InvalidOperationException("Unreachable assertion state.");
    }

    /// <summary>Asserts that fully enumerating the asynchronous sequence completes without throwing.</summary>
    /// <remarks>
    /// The sequence is consumed once and its enumerator is disposed. Cancellation requested through the supplied
    /// token propagates unchanged; other producer and disposal exceptions become assertion failures without exposing
    /// their messages.
    /// </remarks>
    public async Task<AsyncEnumerableAssertions<T>> NotThrowAsync(CancellationToken cancellationToken = default)
    {
        var actual = RequireSubject();
        try
        {
            await using var enumerator = actual.GetAsyncEnumerator(cancellationToken);
            while (await enumerator.MoveNextAsync().ConfigureAwait(false))
            {
                _ = enumerator.Current;
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            AssertionFailure.Fail($"Expected async sequence enumeration not to throw, but it threw '{exception.GetType().FullName}'.");
        }

        return this;
    }

    /// <summary>Asserts that fully enumerating the sequence completes without throwing and includes formatted failure context.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public async Task<AsyncEnumerableAssertions<T>> NotThrowAsync(string? because, params object?[] becauseArgs)
    {
        var actual = RequireSubject();
        try
        {
            await using var enumerator = actual.GetAsyncEnumerator();
            while (await enumerator.MoveNextAsync().ConfigureAwait(false))
            {
                _ = enumerator.Current;
            }
        }
        catch (Exception exception)
        {
            AssertionFailure.FailWithBecause($"Expected async sequence enumeration not to throw, but it threw '{exception.GetType().FullName}'.", because, becauseArgs);
        }

        return this;
    }

    private IAsyncEnumerable<T> RequireSubject()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected an async sequence, but found null.");
        }

        return _actual;
    }

    private static bool WindowMatches(Queue<T> window, IReadOnlyList<T> expected, IEqualityComparer<T> comparer)
    {
        var index = 0;
        foreach (var actual in window)
        {
            if (!comparer.Equals(actual, expected[index]))
            {
                return false;
            }

            index++;
        }

        return true;
    }

    private static List<T> Materialize(IEnumerable<T> sequence)
    {
        var items = new List<T>();
        foreach (var item in sequence)
        {
            items.Add(item);
        }

        return items;
    }

    private static async Task<List<T>> MaterializeAsync(IAsyncEnumerable<T> sequence, CancellationToken cancellationToken)
    {
        var items = new List<T>();
        await using var enumerator = sequence.GetAsyncEnumerator(cancellationToken);
        while (await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            items.Add(enumerator.Current);
        }

        return items;
    }

    private static bool HaveSameMultiplicities(List<T> actual, List<T> expected, IEqualityComparer<T> comparer)
    {
        var matched = new bool[expected.Count];
        foreach (var actualItem in actual)
        {
            var found = false;
            for (var expectedIndex = 0; expectedIndex < expected.Count; expectedIndex++)
            {
                if (!matched[expectedIndex] && comparer.Equals(actualItem, expected[expectedIndex]))
                {
                    matched[expectedIndex] = true;
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
#endif
