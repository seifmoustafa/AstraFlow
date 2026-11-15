using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class AsyncEnumerableAssertionTests
{
    [Fact]
    public async Task BeEmptyAsyncAndNotBeEmptyAsync_EnumerateOnceAndDispose()
    {
        var empty = new OneShotAsyncEnumerable<int>(Array.Empty<int>());
        await empty.Should().BeEmptyAsync();
        Assert.Equal(1, empty.GetAsyncEnumeratorCalls);
        Assert.Equal(1, empty.MoveNextCalls);
        Assert.Equal(1, empty.DisposeAsyncCalls);

        var populated = new OneShotAsyncEnumerable<int>(new[] { 1, 2 });
        await populated.Should().NotBeEmptyAsync();
        Assert.Equal(1, populated.GetAsyncEnumeratorCalls);
        Assert.Equal(1, populated.MoveNextCalls);
        Assert.Equal(1, populated.DisposeAsyncCalls);
    }

    [Fact]
    public async Task BeEmptyAsyncAndNotBeEmptyAsync_ReportNullAndEmptyFailures()
    {
        IAsyncEnumerable<int>? missing = null;
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => missing.Should().BeEmptyAsync());
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => missing.Should().NotBeEmptyAsync());

        var empty = new OneShotAsyncEnumerable<int>(Array.Empty<int>());
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => empty.Should().NotBeEmptyAsync());
        Assert.Equal(1, empty.DisposeAsyncCalls);

        var populated = new OneShotAsyncEnumerable<int>(new[] { 1 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => populated.Should().BeEmptyAsync());
        Assert.Equal(1, populated.DisposeAsyncCalls);
    }

    [Fact]
    public async Task HaveCountAsync_StopsOnceTheExpectedCountIsExceeded()
    {
        var exact = new OneShotAsyncEnumerable<int>(new[] { 1, 2, 3 });
        await exact.Should().HaveCountAsync(3);
        Assert.Equal(4, exact.MoveNextCalls);
        Assert.Equal(1, exact.DisposeAsyncCalls);

        var tooMany = new OneShotAsyncEnumerable<int>(new[] { 1, 2, 3, 4 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => tooMany.Should().HaveCountAsync(2));
        Assert.Equal(3, tooMany.MoveNextCalls);
        Assert.Equal(1, tooMany.DisposeAsyncCalls);

        var tooFew = new OneShotAsyncEnumerable<int>(new[] { 1 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => tooFew.Should().HaveCountAsync(2));
        Assert.Equal(1, tooFew.DisposeAsyncCalls);
    }

    [Fact]
    public async Task HaveCountAsync_RejectsNegativeCountsAndNullSubject()
    {
        var actual = new OneShotAsyncEnumerable<int>(Array.Empty<int>());
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => actual.Should().HaveCountAsync(-1));
        Assert.Equal(0, actual.GetAsyncEnumeratorCalls);

        IAsyncEnumerable<int>? missing = null;
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => missing.Should().HaveCountAsync(0));
    }

    [Fact]
    public async Task ContainAsyncAndNotContainAsync_UseTheSelectedComparer()
    {
        var values = new OneShotAsyncEnumerable<string>(new[] { "alpha", "Beta" });
        await values.Should().ContainAsync("BETA", StringComparer.OrdinalIgnoreCase);
        Assert.Equal(1, values.GetAsyncEnumeratorCalls);
        Assert.Equal(1, values.DisposeAsyncCalls);

        var absent = new OneShotAsyncEnumerable<string>(new[] { "alpha", "beta" });
        await absent.Should().NotContainAsync("GAMMA", StringComparer.OrdinalIgnoreCase);
        Assert.Equal(1, absent.DisposeAsyncCalls);

        var present = new OneShotAsyncEnumerable<string>(new[] { "alpha", "Beta" });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => present.Should().NotContainAsync("BETA", StringComparer.OrdinalIgnoreCase));
        Assert.Equal(1, present.DisposeAsyncCalls);

        var missing = new OneShotAsyncEnumerable<int>(new[] { 1, 2 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => missing.Should().ContainAsync(3));
        Assert.Equal(1, missing.DisposeAsyncCalls);
    }

    [Fact]
    public async Task PredicateAsyncAssertions_CheckMatchingAndEveryItem()
    {
        var containing = new OneShotAsyncEnumerable<int>(new[] { 2, 3, 4 });
        await containing.Should().ContainAsync(value => value == 3);
        Assert.Equal(2, containing.MoveNextCalls);
        Assert.Equal(1, containing.DisposeAsyncCalls);

        var notContaining = new OneShotAsyncEnumerable<int>(new[] { 1, 3, 5 });
        await notContaining.Should().NotContainAsync(value => value > 5);
        Assert.Equal(1, notContaining.DisposeAsyncCalls);

        IAsyncEnumerable<int>? nullSequence = null;
        await nullSequence.Should().NotContainAsync(value => value > 0);

        var allMatching = new OneShotAsyncEnumerable<int>(new[] { 2, 4, 6 });
        await allMatching.Should().OnlyContainAsync(value => value % 2 == 0);
        Assert.Equal(1, allMatching.DisposeAsyncCalls);

        var wrongItem = new OneShotAsyncEnumerable<int>(new[] { 2, 3, 4 });
        var failure = await Assert.ThrowsAsync<AstraFlowAssertionException>(() => wrongItem.Should().OnlyContainAsync(value => value % 2 == 0));
        Assert.Contains("index 1", failure.Message, StringComparison.Ordinal);
        Assert.Equal(1, wrongItem.DisposeAsyncCalls);
    }

    [Fact]
    public async Task PredicateAsyncAssertions_RejectNullPredicatesAndPropagatePredicateFailures()
    {
        var values = new OneShotAsyncEnumerable<int>(new[] { 1 });
        await Assert.ThrowsAsync<ArgumentNullException>(() => values.Should().ContainAsync((Func<int, bool>)null!));
        Assert.Equal(0, values.GetAsyncEnumeratorCalls);

        var failure = new InvalidOperationException("predicate failed");
        var source = new OneShotAsyncEnumerable<int>(new[] { 1 });
        var observed = await Assert.ThrowsAsync<InvalidOperationException>(() => source.Should().ContainAsync(_ => throw failure));
        Assert.Same(failure, observed);
        Assert.Equal(1, source.DisposeAsyncCalls);
    }

    [Fact]
    public async Task ContainInOrderAsync_AllowsGapsAndConsumesBothSequencesOnce()
    {
        var actual = new OneShotAsyncEnumerable<int>(new[] { 1, 8, 2, 9, 3 });
        var expected = new OneShotEnumerable<int>(new[] { 1, 2, 3 });
        await actual.Should().ContainInOrderAsync(expected);
        Assert.Equal(1, actual.GetAsyncEnumeratorCalls);
        Assert.Equal(1, actual.DisposeAsyncCalls);
        Assert.Equal(1, expected.GetEnumeratorCalls);
        Assert.Equal(1, expected.DisposeCalls);

        var wrongOrder = new OneShotAsyncEnumerable<int>(new[] { 3, 2, 1 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => wrongOrder.Should().ContainInOrderAsync(new[] { 1, 2 }));
        Assert.Equal(1, wrongOrder.DisposeAsyncCalls);

        IAsyncEnumerable<int>? nullSequence = null;
        await nullSequence.Should().ContainInOrderAsync(Array.Empty<int>());
    }

    [Fact]
    public async Task ContainConsecutiveAsync_RequiresAdjacentItemsAndAllowsEmptyExpectation()
    {
        var actual = new OneShotAsyncEnumerable<int>(new[] { 0, 1, 2, 3 });
        var expected = new OneShotEnumerable<int>(new[] { 1, 2 });
        await actual.Should().ContainConsecutiveAsync(expected);
        Assert.Equal(1, actual.DisposeAsyncCalls);
        Assert.Equal(1, expected.DisposeCalls);

        var separated = new OneShotAsyncEnumerable<int>(new[] { 0, 1, 4, 2, 3 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => separated.Should().ContainConsecutiveAsync(new[] { 1, 2 }));
        Assert.Equal(1, separated.DisposeAsyncCalls);

        IAsyncEnumerable<int>? nullSequence = null;
        await nullSequence.Should().ContainConsecutiveAsync(Array.Empty<int>());
    }

    [Fact]
    public async Task NotContainInOrderAsync_RejectsOrderedSubsequencesAndConsumesEachInputOnce()
    {
        var actual = new OneShotAsyncEnumerable<int>(new[] { 1, 9, 2, 3 });
        var unexpected = new OneShotEnumerable<int>(new[] { 1, 2, 3 });
        var failure = await Assert.ThrowsAsync<AstraFlowAssertionException>(() => actual.Should().NotContainInOrderAsync(unexpected));
        Assert.Contains("ending at index 3", failure.Message, StringComparison.Ordinal);
        Assert.Equal(1, actual.GetAsyncEnumeratorCalls);
        Assert.Equal(1, actual.DisposeAsyncCalls);
        Assert.Equal(1, unexpected.GetEnumeratorCalls);
        Assert.Equal(1, unexpected.DisposeCalls);

        var absent = new OneShotAsyncEnumerable<int>(new[] { 1, 2, 3 });
        var reverse = new OneShotEnumerable<int>(new[] { 3, 2, 1 });
        await absent.Should().NotContainInOrderAsync(reverse);
        Assert.Equal(1, absent.DisposeAsyncCalls);
        Assert.Equal(1, reverse.DisposeCalls);
    }

    [Fact]
    public async Task NotContainInConsecutiveOrderAsync_RequiresAdjacentMatchesAndHandlesBoundaries()
    {
        var separated = new OneShotAsyncEnumerable<int>(new[] { 1, 9, 2, 3 });
        var expected = new OneShotEnumerable<int>(new[] { 1, 2, 3 });
        await separated.Should().NotContainInConsecutiveOrderAsync(expected);
        Assert.Equal(1, separated.DisposeAsyncCalls);
        Assert.Equal(1, expected.DisposeCalls);

        var adjacent = new OneShotAsyncEnumerable<int>(new[] { 1, 2, 3 });
        var failure = await Assert.ThrowsAsync<AstraFlowAssertionException>(() => adjacent.Should().NotContainInConsecutiveOrderAsync(new[] { 1, 2, 3 }));
        Assert.Contains("ending at index 2", failure.Message, StringComparison.Ordinal);
        Assert.Equal(1, adjacent.DisposeAsyncCalls);

        var privateValues = new OneShotAsyncEnumerable<string>(new[] { "sensitive-a", "sensitive-b" });
        var privateFailure = await Assert.ThrowsAsync<AstraFlowAssertionException>(() => privateValues.Should().NotContainInOrderAsync(new[] { "sensitive-a", "sensitive-b" }));
        Assert.DoesNotContain("sensitive", privateFailure.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task NegativeOrderedAsyncAssertions_ValidateNullsAndPropagateCancellation()
    {
        var values = new OneShotAsyncEnumerable<int>(new[] { 1, 2 });
        await values.Should().NotContainInOrderAsync(Array.Empty<int>());
        await values.Should().NotContainInConsecutiveOrderAsync(Array.Empty<int>());
        Assert.Equal(0, values.GetAsyncEnumeratorCalls);

        await Assert.ThrowsAsync<ArgumentNullException>(() => values.Should().NotContainInOrderAsync((IEnumerable<int>)null!));
        await Assert.ThrowsAsync<ArgumentNullException>(() => values.Should().NotContainInConsecutiveOrderAsync((IEnumerable<int>)null!));
        IAsyncEnumerable<int>? missing = null;
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => missing.Should().NotContainInOrderAsync(Array.Empty<int>()));
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => missing.Should().NotContainInConsecutiveOrderAsync(Array.Empty<int>()));

        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        var cancelled = new OneShotAsyncEnumerable<int>(new[] { 1 });
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => cancelled.Should().NotContainInOrderAsync(new[] { 2 }, cancellation.Token));
        Assert.Equal(cancellation.Token, cancelled.ReceivedCancellationToken);
        Assert.Equal(1, cancelled.DisposeAsyncCalls);
    }

    [Fact]
    public async Task OnlyHaveUniqueItemsAsync_UsesTheComparerAndDisposesOnFailure()
    {
        var unique = new OneShotAsyncEnumerable<int>(new[] { 1, 2, 3 });
        await unique.Should().OnlyHaveUniqueItemsAsync();
        Assert.Equal(1, unique.DisposeAsyncCalls);

        var duplicate = new OneShotAsyncEnumerable<int>(new[] { 1, 2, 1 });
        var failure = await Assert.ThrowsAsync<AstraFlowAssertionException>(() => duplicate.Should().OnlyHaveUniqueItemsAsync());
        Assert.Contains("index 2", failure.Message, StringComparison.Ordinal);
        Assert.Equal(1, duplicate.DisposeAsyncCalls);

        var caseInsensitive = new OneShotAsyncEnumerable<string>(new[] { "key", "KEY" });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => caseInsensitive.Should().OnlyHaveUniqueItemsAsync(StringComparer.OrdinalIgnoreCase));
        Assert.Equal(1, caseInsensitive.DisposeAsyncCalls);
    }

    [Fact]
    public async Task ContainEquivalentItemsAsync_RequiresExpectedMultiplicity()
    {
        var actual = new OneShotAsyncEnumerable<int>(new[] { 1, 2, 1, 3 });
        var expected = new OneShotEnumerable<int>(new[] { 1, 1, 3 });
        await actual.Should().ContainEquivalentItemsAsync(expected);
        Assert.Equal(1, actual.GetAsyncEnumeratorCalls);
        Assert.Equal(1, actual.DisposeAsyncCalls);
        Assert.Equal(1, expected.GetEnumeratorCalls);
        Assert.Equal(1, expected.DisposeCalls);

        var missingMultiplicity = new OneShotAsyncEnumerable<int>(new[] { 1, 2 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => missingMultiplicity.Should().ContainEquivalentItemsAsync(new[] { 1, 1 }));
        Assert.Equal(1, missingMultiplicity.DisposeAsyncCalls);

        var selectedComparer = new OneShotAsyncEnumerable<string>(new[] { "alpha", "BETA" });
        await selectedComparer.Should().ContainEquivalentItemsAsync(new[] { "ALPHA", "beta" }, StringComparer.OrdinalIgnoreCase);
        Assert.Equal(1, selectedComparer.DisposeAsyncCalls);
    }

    [Fact]
    public async Task HaveSameItemsAsync_UsesOrderIndependentMultiplicity()
    {
        var same = new OneShotAsyncEnumerable<int>(new[] { 1, 1, 2 });
        var expected = new OneShotEnumerable<int>(new[] { 2, 1, 1 });
        await same.Should().HaveSameItemsAsync(expected);
        Assert.Equal(1, same.GetAsyncEnumeratorCalls);
        Assert.Equal(1, same.DisposeAsyncCalls);
        Assert.Equal(1, expected.DisposeCalls);

        var differentMultiplicity = new OneShotAsyncEnumerable<int>(new[] { 1, 2 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => differentMultiplicity.Should().HaveSameItemsAsync(new[] { 1, 1 }));
        Assert.Equal(1, differentMultiplicity.DisposeAsyncCalls);
    }

    [Fact]
    public async Task AllSatisfyAsync_InvokesOncePerItemInOrder()
    {
        var actual = new OneShotAsyncEnumerable<int>(new[] { 1, 2, 3 });
        var observed = new List<int>();
        await actual.Should().AllSatisfyAsync(async value =>
        {
            await Task.Yield();
            observed.Add(value);
        });

        Assert.Equal(new[] { 1, 2, 3 }, observed);
        Assert.Equal(1, actual.GetAsyncEnumeratorCalls);
        Assert.Equal(1, actual.DisposeAsyncCalls);

        var failure = new InvalidOperationException("callback failed");
        var failing = new OneShotAsyncEnumerable<int>(new[] { 1 });
        var observedFailure = await Assert.ThrowsAsync<InvalidOperationException>(() => failing.Should().AllSatisfyAsync(_ => Task.FromException(failure)));
        Assert.Same(failure, observedFailure);
        Assert.Equal(1, failing.DisposeAsyncCalls);
    }

    [Fact]
    public async Task SatisfyRespectivelyAsync_MatchesCountsAndInvokesCallbacksInOrder()
    {
        var actual = new OneShotAsyncEnumerable<int>(new[] { 4, 9 });
        var observed = new List<int>();
        Func<int, Task>[] assertions =
        {
            value => { observed.Add(value); return Task.CompletedTask; },
            value => { observed.Add(value); return Task.CompletedTask; }
        };
        await actual.Should().SatisfyRespectivelyAsync(assertions);
        Assert.Equal(new[] { 4, 9 }, observed);
        Assert.Equal(1, actual.DisposeAsyncCalls);

        var tooFewCallbacks = new OneShotAsyncEnumerable<int>(new[] { 4, 9 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => tooFewCallbacks.Should().SatisfyRespectivelyAsync(new Func<int, Task>[] { _ => Task.CompletedTask }));
        Assert.Equal(1, tooFewCallbacks.DisposeAsyncCalls);
    }

    [Fact]
    public async Task ContainSingleAsync_ReturnsOnlyItemAndRejectsOtherCounts()
    {
        var only = new OneShotAsyncEnumerable<string>(new[] { "item" });
        var result = await only.Should().ContainSingleAsync();
        Assert.Equal("item", result.Which);
        Assert.Equal(2, only.MoveNextCalls);
        Assert.Equal(1, only.DisposeAsyncCalls);

        var empty = new OneShotAsyncEnumerable<int>(Array.Empty<int>());
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => empty.Should().ContainSingleAsync());
        Assert.Equal(1, empty.DisposeAsyncCalls);

        var several = new OneShotAsyncEnumerable<int>(new[] { 1, 2, 3 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => several.Should().ContainSingleAsync());
        Assert.Equal(2, several.MoveNextCalls);
        Assert.Equal(1, several.DisposeAsyncCalls);
    }

    [Fact]
    public async Task EqualAsync_ComparesExpectedOrderAndConsumesBothSequencesOnce()
    {
        var actual = new OneShotAsyncEnumerable<int>(new[] { 1, 2, 3 });
        var expected = new OneShotEnumerable<int>(new[] { 1, 2, 3 });
        await actual.Should().EqualAsync(expected);
        Assert.Equal(1, actual.GetAsyncEnumeratorCalls);
        Assert.Equal(1, actual.DisposeAsyncCalls);
        Assert.Equal(1, expected.GetEnumeratorCalls);
        Assert.Equal(1, expected.DisposeCalls);

        var wrongOrder = new OneShotAsyncEnumerable<int>(new[] { 2, 1 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => wrongOrder.Should().EqualAsync(new[] { 1, 2 }));
        Assert.Equal(1, wrongOrder.DisposeAsyncCalls);

        var extraActual = new OneShotAsyncEnumerable<int>(new[] { 1, 2 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => extraActual.Should().EqualAsync(new[] { 1 }));
        Assert.Equal(1, extraActual.DisposeAsyncCalls);

        var extraExpected = new OneShotAsyncEnumerable<int>(new[] { 1 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => extraExpected.Should().EqualAsync(new[] { 1, 2 }));
        Assert.Equal(1, extraExpected.DisposeAsyncCalls);
    }

    [Fact]
    public async Task AsyncAssertions_ForwardCancellationAndDisposeWhenCanceled()
    {
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        var actual = new OneShotAsyncEnumerable<int>(new[] { 1 });

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => actual.Should().HaveCountAsync(1, cancellation.Token));

        Assert.Equal(cancellation.Token, actual.ReceivedCancellationToken);
        Assert.Equal(1, actual.DisposeAsyncCalls);
    }

    [Fact]
    public async Task AsyncAssertions_PropagateEnumerationFailuresAndStillDispose()
    {
        var failure = new InvalidOperationException("producer failed");
        var actual = new OneShotAsyncEnumerable<int>(new[] { 1 }, failure);

        var observed = await Assert.ThrowsAsync<InvalidOperationException>(() => actual.Should().NotBeEmptyAsync());

        Assert.Same(failure, observed);
        Assert.Equal(1, actual.DisposeAsyncCalls);
    }

    [Fact]
    public async Task ThrowAsync_CapturesTheExpectedProducerExceptionAndDisposes()
    {
        var producerFailure = new InvalidOperationException("sensitive producer detail");
        var actual = new OneShotAsyncEnumerable<int>(new[] { 1 }, producerFailure);

        var result = await actual.Should().ThrowAsync<InvalidOperationException>();

        Assert.Same(producerFailure, result.Which);
        Assert.Equal(1, actual.DisposeAsyncCalls);
    }

    [Fact]
    public async Task ThrowAsync_RejectsWrongExceptionAndSuccessfulCompletion()
    {
        var wrongFailure = new OneShotAsyncEnumerable<int>(new[] { 1 }, new ArgumentException("private detail"));
        var wrong = await Assert.ThrowsAsync<AstraFlowAssertionException>(() => wrongFailure.Should().ThrowAsync<InvalidOperationException>());
        Assert.DoesNotContain("private detail", wrong.Message, StringComparison.Ordinal);
        Assert.Contains(nameof(ArgumentException), wrong.Message, StringComparison.Ordinal);
        Assert.Equal(1, wrongFailure.DisposeAsyncCalls);

        var completed = new OneShotAsyncEnumerable<int>(new[] { 1, 2 });
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => completed.Should().ThrowAsync<InvalidOperationException>());
        Assert.Equal(1, completed.DisposeAsyncCalls);
    }

    [Fact]
    public async Task NotThrowAsync_EnumeratesOnceAndDisposesOnCompletionOrFailure()
    {
        var completed = new OneShotAsyncEnumerable<int>(new[] { 1, 2, 3 });
        var result = await completed.Should().NotThrowAsync();

        Assert.Same(completed.Should().Subject, result.Subject);
        Assert.Equal(1, completed.GetAsyncEnumeratorCalls);
        Assert.Equal(4, completed.MoveNextCalls);
        Assert.Equal(1, completed.DisposeAsyncCalls);

        var producerFailure = new InvalidOperationException("private producer detail");
        var failed = new OneShotAsyncEnumerable<int>(new[] { 1 }, producerFailure);
        var assertionFailure = await Assert.ThrowsAsync<AstraFlowAssertionException>(() => failed.Should().NotThrowAsync());

        Assert.Contains(nameof(InvalidOperationException), assertionFailure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private producer detail", assertionFailure.Message, StringComparison.Ordinal);
        Assert.Equal(1, failed.DisposeAsyncCalls);
    }

    [Fact]
    public async Task NotThrowAsync_PropagatesCallerCancellationUnchanged()
    {
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        var actual = new OneShotAsyncEnumerable<int>(new[] { 1 });

        var exception = await Assert.ThrowsAnyAsync<OperationCanceledException>(
            () => actual.Should().NotThrowAsync(cancellation.Token));

        Assert.Equal(cancellation.Token, exception.CancellationToken);
        Assert.Equal(cancellation.Token, actual.ReceivedCancellationToken);
        Assert.Equal(1, actual.DisposeAsyncCalls);
    }

    [Fact]
    public async Task NotThrowAsync_RejectsNullSubject()
    {
        IAsyncEnumerable<int>? missing = null;

        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => missing.Should().NotThrowAsync());
    }

    [Fact]
    public async Task ThrowAsync_ReceivesCancellationTokenAndCapturesCancellation()
    {
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        var actual = new OneShotAsyncEnumerable<int>(new[] { 1 });

        var result = await actual.Should().ThrowAsync<OperationCanceledException>(cancellation.Token);

        Assert.IsAssignableFrom<OperationCanceledException>(result.Which);
        Assert.Equal(cancellation.Token, actual.ReceivedCancellationToken);
        Assert.Equal(1, actual.DisposeAsyncCalls);
    }
}
