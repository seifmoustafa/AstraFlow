using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class TaskCompletionSourceAssertionTests
{
    [Fact]
    public async Task GenericSource_CompletionReturnsTheResultAndCanBeChained()
    {
        var source = new TaskCompletionSource<int>(TaskCreationOptions.RunContinuationsAsynchronously);
        var assertions = source.Should();
        var completion = assertions.CompleteWithinAsync(TimeSpan.FromSeconds(2));

        source.SetResult(42);

        Assert.Equal(42, await completion);
        Assert.Same(source, assertions.And.Subject);
    }

    [Fact]
    public async Task GenericSource_NonCompletionPassesAndLeavesTheTaskUntouched()
    {
        var source = new TaskCompletionSource<string>();

        var assertions = await source.Should().NotCompleteWithinAsync(TimeSpan.FromMilliseconds(20));

        Assert.Same(source, assertions.Subject);
        Assert.False(source.Task.IsCompleted);
        source.SetResult("finished");
    }

    [Fact]
    public async Task GenericSource_CompletionTimeoutFailsWithoutChangingSourceState()
    {
        var source = new TaskCompletionSource<int>();

        await Assert.ThrowsAsync<AstraFlowAssertionException>(
            () => source.Should().CompleteWithinAsync(TimeSpan.FromMilliseconds(20)));

        Assert.False(source.Task.IsCompleted);
        source.SetResult(1);
    }

    [Fact]
    public async Task GenericSource_WaitCancellationDoesNotCancelTheSourceTask()
    {
        var source = new TaskCompletionSource<int>();
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(
            () => source.Should().CompleteWithinAsync(TimeSpan.FromSeconds(1), cancellation.Token));

        Assert.False(source.Task.IsCanceled);
        source.SetResult(1);
    }

    [Fact]
    public async Task GenericSource_PropagatesTheOriginalTaskFailure()
    {
        var source = new TaskCompletionSource<int>();
        var expected = new InvalidOperationException("private failure");
        source.SetException(expected);

        var actual = await Assert.ThrowsAsync<InvalidOperationException>(
            () => source.Should().CompleteWithinAsync(TimeSpan.FromSeconds(1)));

        Assert.Same(expected, actual);
    }

    [Fact]
    public async Task GenericSource_RejectsInvalidTimeoutBeforeWaiting()
    {
        var source = new TaskCompletionSource<int>();

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            () => source.Should().NotCompleteWithinAsync(TimeSpan.FromMilliseconds(-1)));

        Assert.False(source.Task.IsCompleted);
        source.SetResult(1);
    }

    [Fact]
    public void Should_RejectsNullSources()
    {
        TaskCompletionSource<int>? generic = null;

        Assert.Throws<ArgumentNullException>(() => generic.Should());
    }

#if NET6_0_OR_GREATER
    [Fact]
    public async Task NonGenericSource_CompletionAndNonCompletionAreSupported()
    {
        var source = new TaskCompletionSource();
        var assertions = source.Should();
        var incomplete = assertions.NotCompleteWithinAsync(TimeSpan.FromMilliseconds(20));
        await incomplete;

        var completion = assertions.CompleteWithinAsync(TimeSpan.FromSeconds(2));
        source.SetResult();
        await completion;
        Assert.Same(source, assertions.And.Subject);
    }

    [Fact]
    public async Task NonGenericSource_CanTimeOutAndPropagatesFaults()
    {
        var pending = new TaskCompletionSource();
        await Assert.ThrowsAsync<AstraFlowAssertionException>(
            () => pending.Should().CompleteWithinAsync(TimeSpan.FromMilliseconds(20)));

        var failed = new TaskCompletionSource();
        var expected = new InvalidOperationException("private failure");
        failed.SetException(expected);
        var actual = await Assert.ThrowsAsync<InvalidOperationException>(
            () => failed.Should().CompleteWithinAsync(TimeSpan.FromSeconds(1)));

        Assert.Same(expected, actual);
    }

    [Fact]
    public void Should_RejectsNullNonGenericSources()
    {
        TaskCompletionSource? source = null;

        Assert.Throws<ArgumentNullException>(() => source.Should());
    }
#endif
}
