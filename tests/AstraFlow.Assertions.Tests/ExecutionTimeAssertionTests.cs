using System;
using System.Threading.Tasks;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class ExecutionTimeAssertionTests
{
    [Fact]
    public void ExecutionTime_ActionRunsExactlyOnceAndReturnsComparableDuration()
    {
        var calls = 0;

        var elapsed = new Action(() => calls++).ExecutionTime();

        Assert.Equal(1, calls);
        elapsed.Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);
    }

    [Fact]
    public void ExecutionTime_PropagatesDelegateExceptionUnchanged()
    {
        var expected = new InvalidOperationException("operation failed");
        Action action = () => throw expected;

        var observed = Assert.Throws<InvalidOperationException>(() => action.ExecutionTime());

        Assert.Same(expected, observed);
    }

    [Fact]
    public void ExecutionTimeOf_InvokesSubjectOperationOnceAndValidatesArgumentsFirst()
    {
        var subject = new OperationSubject();

        subject.ExecutionTimeOf(value => value.Run()).Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);

        Assert.Equal(1, subject.Calls);
        Assert.Throws<ArgumentNullException>(() => ExecutionTimeAssertionExtensions.ExecutionTimeOf((OperationSubject)null!, value => value.Run()));
        Assert.Throws<ArgumentNullException>(() => ExecutionTimeAssertionExtensions.ExecutionTimeOf(subject, (Action<OperationSubject>)null!));
        Assert.Equal(1, subject.Calls);
    }

    [Fact]
    public void ExecutionTimeOf_PropagatesSubjectOperationExceptionUnchanged()
    {
        var subject = new OperationSubject();
        var expected = new InvalidOperationException("subject operation failed");

        var observed = Assert.Throws<InvalidOperationException>(
            () => subject.ExecutionTimeOf(_ => throw expected));

        Assert.Same(expected, observed);
    }

    [Fact]
    public async Task ExecutionTimeAsync_AwaitsOneExecutionAndReturnsComparableDuration()
    {
        var calls = 0;
        Func<Task> action = () =>
        {
            calls++;
            return Task.CompletedTask;
        };

        var elapsed = await action.ExecutionTimeAsync();

        Assert.Equal(1, calls);
        elapsed.Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);
    }

    [Fact]
    public async Task ExecutionTimeAsync_AwaitsValueReturningFunctionAndPropagatesFailure()
    {
        var calls = 0;
        Func<Task<int>> function = () =>
        {
            calls++;
            return Task.FromResult(42);
        };

        var elapsed = await function.ExecutionTimeAsync();

        Assert.Equal(1, calls);
        elapsed.Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);

        var expected = new ArgumentException("async operation failed");
        Func<Task<int>> failing = () => Task.FromException<int>(expected);
        var observed = await Assert.ThrowsAsync<ArgumentException>(() => failing.ExecutionTimeAsync());
        Assert.Same(expected, observed);
    }

    [Fact]
    public async Task ExecutionTimeOfAsync_AwaitsSubjectOperationBeforeReturning()
    {
        var subject = new OperationSubject();
        var started = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);

        var measurement = subject.ExecutionTimeOfAsync(async value =>
        {
            value.Calls++;
            started.SetResult();
            await release.Task.ConfigureAwait(false);
        });

        await started.Task;
        Assert.False(measurement.IsCompleted);
        release.SetResult();
        (await measurement).Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);
        Assert.Equal(1, subject.Calls);

        var resultMeasurement = await subject.ExecutionTimeOfAsync(value =>
        {
            value.Calls++;
            return Task.FromResult(42);
        });
        resultMeasurement.Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);
        Assert.Equal(2, subject.Calls);

        var expected = new ArgumentException("async subject operation failed");
        var observed = await Assert.ThrowsAsync<ArgumentException>(
            () => subject.ExecutionTimeOfAsync(_ => Task.FromException(expected)));
        Assert.Same(expected, observed);
    }

    [Fact]
    public async Task ExecutionTimeOfAsync_ValidatesSubjectAndDelegateBeforeInvocation()
    {
        var subject = new OperationSubject();

        Assert.Throws<ArgumentNullException>(() =>
        {
            _ = ExecutionTimeAssertionExtensions.ExecutionTimeOfAsync((OperationSubject)null!, _ => Task.CompletedTask);
        });
        Assert.Throws<ArgumentNullException>(() =>
        {
            _ = ExecutionTimeAssertionExtensions.ExecutionTimeOfAsync(subject, (Func<OperationSubject, Task>)null!);
        });
        Assert.Equal(0, subject.Calls);

        var nullTask = await Assert.ThrowsAsync<InvalidOperationException>(
            () => subject.ExecutionTimeOfAsync(_ => (Task)null!));
        Assert.Contains("returned a null task", nullTask.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ExecutionTimeAsync_RejectsNullTaskResults()
    {
        Func<Task> action = () => null!;
        Func<Task<int>> function = () => null!;

        var actionFailure = await Assert.ThrowsAsync<InvalidOperationException>(() => action.ExecutionTimeAsync());
        var functionFailure = await Assert.ThrowsAsync<InvalidOperationException>(() => function.ExecutionTimeAsync());

        Assert.Contains("returned a null task", actionFailure.Message, StringComparison.Ordinal);
        Assert.Contains("returned a null task", functionFailure.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ExecutionTime_RejectsNullDelegates()
    {
        Assert.Throws<ArgumentNullException>(() => ExecutionTimeAssertionExtensions.ExecutionTime((Action)null!));
    }

    private sealed class OperationSubject
    {
        public int Calls { get; set; }

        public void Run() => Calls++;
    }
}
