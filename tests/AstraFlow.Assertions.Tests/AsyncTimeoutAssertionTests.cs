using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class AsyncTimeoutAssertionTests
{
    [Fact]
    public async Task CompleteWithinAsync_AcceptsAlreadyCompletedOperationsAndReturnsFunctionResult()
    {
        var actionCalls = 0;
        Func<Task> action = () =>
        {
            actionCalls++;
            return Task.CompletedTask;
        };
        Func<Task<int>> function = () => Task.FromResult(42);

        await action.Should().CompleteWithinAsync(TimeSpan.Zero);
        var result = await function.Should().CompleteWithinAsync(TimeSpan.Zero);

        Assert.Equal(1, actionCalls);
        Assert.Equal(42, result);
    }

    [Fact]
    public async Task CompleteWithinAsync_WaitsForPendingOperationToFinish()
    {
        var completion = new TaskCompletionSource<int>(TaskCreationOptions.RunContinuationsAsynchronously);
        Func<Task<int>> function = () => completion.Task;
        var assertion = function.Should().CompleteWithinAsync(TimeSpan.FromSeconds(1));
        completion.SetResult(42);

        Assert.Equal(42, await assertion);
    }

    [Fact]
    public async Task CompleteWithinAsync_FailsWhenOperationExceedsTimeoutAndObservesLaterFailure()
    {
        var completion = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        Func<Task> operation = () => completion.Task;
        var assertion = operation.Should().CompleteWithinAsync(TimeSpan.FromMilliseconds(30));

        var failure = await Assert.ThrowsAsync<AstraFlowAssertionException>(() => assertion);
        Assert.Contains("complete within 30 ms", failure.Message, StringComparison.Ordinal);

        completion.SetException(new InvalidOperationException("late operation failure"));
        await Task.Yield();
    }

    [Fact]
    public async Task CompleteWithinAsync_PropagatesActionAndFunctionExceptions()
    {
        Func<Task> action = () => Task.FromException(new InvalidOperationException("action detail"));
        Func<Task<int>> function = () => Task.FromException<int>(new ArgumentException("function detail"));

        var actionFailure = await Assert.ThrowsAsync<InvalidOperationException>(() => action.Should().CompleteWithinAsync(TimeSpan.FromSeconds(1)));
        var functionFailure = await Assert.ThrowsAsync<ArgumentException>(() => function.Should().CompleteWithinAsync(TimeSpan.FromSeconds(1)));

        Assert.Equal("action detail", actionFailure.Message);
        Assert.Equal("function detail", functionFailure.Message);
    }

    [Fact]
    public async Task NotCompleteWithinAsync_SucceedsForPendingOperationsAndPreservesFunctionAssertions()
    {
        var actionCompletion = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var functionCompletion = new TaskCompletionSource<int>(TaskCreationOptions.RunContinuationsAsynchronously);
        var action = new Func<Task>(() => actionCompletion.Task).Should();
        var function = new Func<Task<int>>(() => functionCompletion.Task).Should();

        await action.NotCompleteWithinAsync(TimeSpan.FromMilliseconds(30));
        Assert.Same(function, await function.NotCompleteWithinAsync(TimeSpan.FromMilliseconds(30)));

        actionCompletion.SetResult();
        functionCompletion.SetResult(42);
        await Task.WhenAll(actionCompletion.Task, functionCompletion.Task);
    }

    [Fact]
    public async Task NotCompleteWithinAsync_FailsForOperationsThatAlreadyCompletedOrFinishEarly()
    {
        Func<Task> complete = () => Task.CompletedTask;
        var completion = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        Func<Task> completeSoon = () => completion.Task;

        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => complete.Should().NotCompleteWithinAsync(TimeSpan.FromSeconds(1)));
        var assertion = completeSoon.Should().NotCompleteWithinAsync(TimeSpan.FromSeconds(1));
        completion.SetResult();
        await Assert.ThrowsAsync<AstraFlowAssertionException>(() => assertion);
    }

    [Fact]
    public async Task TimeoutAndPreCanceledTokenAreValidatedBeforeStartingOperation()
    {
        var calls = 0;
        Func<Task> operation = () =>
        {
            calls++;
            return Task.CompletedTask;
        };
        using var canceled = new CancellationTokenSource();
        canceled.Cancel();

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => operation.Should().CompleteWithinAsync(TimeSpan.FromTicks(-1)));
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => operation.Should().NotCompleteWithinAsync(Timeout.InfiniteTimeSpan));
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() => operation.Should().CompleteWithinAsync(TimeSpan.FromMilliseconds(int.MaxValue + 1d)));
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => operation.Should().CompleteWithinAsync(TimeSpan.FromSeconds(1), canceled.Token));
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => operation.Should().NotCompleteWithinAsync(TimeSpan.FromSeconds(1), canceled.Token));

        Assert.Equal(0, calls);
    }

    [Fact]
    public async Task CancellationStopsOnlyTheAssertionWaitAndObservesLaterFailure()
    {
        var completion = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var calls = 0;
        Func<Task> operation = () =>
        {
            calls++;
            return completion.Task;
        };
        using var cancellation = new CancellationTokenSource();
        var assertion = operation.Should().NotCompleteWithinAsync(TimeSpan.FromSeconds(10), cancellation.Token);
        cancellation.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => assertion);
        Assert.Equal(1, calls);
        Assert.False(completion.Task.IsCompleted);

        completion.SetException(new InvalidOperationException("late canceled-wait failure"));
        await Task.Yield();
    }
}
