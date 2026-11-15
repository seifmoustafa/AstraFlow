using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class FluentActionTests
{
    [Fact]
    public void InvokingHelpers_DeferExecutionAndPreserveExceptionIdentity()
    {
        var calls = 0;
        var expected = new InvalidOperationException("private exception detail");
        Action action = FluentActions.Invoking(() =>
        {
            calls++;
            throw expected;
        });

        Assert.Equal(0, calls);
        var observed = action.Should().Throw<InvalidOperationException>().Which;
        Assert.Same(expected, observed);
        Assert.Equal(1, calls);

        var subject = new InvocationSubject(expected);
        var subjectAction = subject.Invoking(value => value.Throw());
        Assert.Equal(0, subject.CallCount);
        Assert.Same(expected, subjectAction.Should().Throw<InvalidOperationException>().Which);
        Assert.Equal(1, subject.CallCount);

        subject.Invoking(value => value.GetValue()).Should().NotThrow();
        Assert.Equal(2, subject.CallCount);

        var function = FluentActions.Invoking(() => 42);
        function.Should().NotThrow();
    }

    [Fact]
    public async Task AwaitingHelpers_DeferTaskAndValueTaskOperations()
    {
        var expected = new InvalidOperationException("private async detail");
        var calls = 0;
        var action = FluentActions.Awaiting(() =>
        {
            calls++;
            return Task.FromException(expected);
        });

        Assert.Equal(0, calls);
        Assert.Same(expected, (await action.Should().ThrowAsync<InvalidOperationException>()).Which);
        Assert.Equal(1, calls);

        var subject = new InvocationSubject(expected);
        var valueTaskAction = subject.Awaiting(value => value.ThrowValueTaskAsync());
        Assert.Equal(0, subject.CallCount);
        Assert.Same(expected, (await valueTaskAction.Should().ThrowAsync<InvalidOperationException>()).Which);
        Assert.Equal(1, subject.CallCount);

        var valueTaskFunction = subject.Awaiting(value => value.GetValueTaskAsync());
        await valueTaskFunction.Should().NotThrowAsync();
        Assert.Equal(2, subject.CallCount);
    }

    [Fact]
    public void EnumeratingHelpers_ExecuteDeferredIteratorAndDisposeOnFailure()
    {
        var expected = new InvalidOperationException("private iterator detail");
        var calls = 0;
        var disposed = false;
        IEnumerable<int> Deferred()
        {
            calls++;
            try
            {
                yield return 1;
                throw expected;
            }
            finally
            {
                disposed = true;
            }
        }

        var assertionAction = FluentActions.Enumerating((Func<IEnumerable<int>>)Deferred);
        Assert.Equal(0, calls);
        Assert.False(disposed);
        Assert.Same(expected, assertionAction.Should().Throw<InvalidOperationException>().Which);
        Assert.Equal(1, calls);
        Assert.True(disposed);

        var subject = new InvocationSubject(expected);
        Assert.Same(expected, subject.Enumerating(value => value.DeferredFailure()).Should().Throw<InvalidOperationException>().Which);
        Assert.Equal(1, subject.CallCount);
    }

    [Fact]
    public void EnumeratingHelpers_HandleNonGenericSequencesAndValidateFactories()
    {
        IEnumerable nonGeneric = new ArrayList { "one", 2 };
        FluentActions.Enumerating(() => nonGeneric).Should().NotThrow();

        Assert.Throws<ArgumentNullException>(() => FluentActions.Invoking((Action)null!));
        Assert.Throws<ArgumentNullException>(() => FluentActions.Awaiting((Func<Task>)null!));
        Assert.Throws<ArgumentNullException>(() => FluentActions.Enumerating((Func<IEnumerable<int>>)null!));
        Assert.Throws<ArgumentNullException>(() => ((InvocationSubject?)null).Invoking(value => value!.Throw()));
        Assert.Throws<ArgumentNullException>(() => ((InvocationSubject?)null).Enumerating(value => value!.DeferredFailure()));

        Action nullSequence = ((Func<IEnumerable<int>>)(() => null!)).Enumerating();
        nullSequence.Should().Throw<InvalidOperationException>();
    }

    private sealed class InvocationSubject
    {
        private readonly Exception _exception;

        public InvocationSubject(Exception exception) => _exception = exception;

        public int CallCount { get; private set; }

        public void Throw()
        {
            CallCount++;
            throw _exception;
        }

        public int GetValue()
        {
            CallCount++;
            return 42;
        }

        public ValueTask ThrowValueTaskAsync()
        {
            CallCount++;
            return new ValueTask(Task.FromException(_exception));
        }

        public ValueTask<int> GetValueTaskAsync()
        {
            CallCount++;
            return new ValueTask<int>(42);
        }

        public IEnumerable<int> DeferredFailure()
        {
            CallCount++;
            yield return 1;
            throw _exception;
        }
    }
}
