using System;
using System.Threading.Tasks;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class ExceptionChainAssertionTests
{
    [Fact]
    public async Task CapturedException_ChecksExactAndAssignableTypes()
    {
        Func<Task> operation = () => Task.FromException(new ArgumentException("outer detail"));
        var captured = await operation.Should().ThrowAsync<Exception>();

        captured.BeAssignableTo<ArgumentException>().BeOfType<ArgumentException>().WithMessage("outer *");

        Assert.Throws<AstraFlowAssertionException>(() => captured.BeOfType<Exception>());
        Assert.Throws<AstraFlowAssertionException>(() => captured.BeAssignableTo<InvalidOperationException>());
    }

    [Fact]
    public void CapturedException_InspectsImmediateAndNestedInnerExceptions()
    {
        var chain = new InvalidOperationException(
            "outer secret",
            new ArgumentException("middle secret", new NotSupportedException("inner secret")));
        var captured = ((Action)(() => throw chain)).Should().Throw<InvalidOperationException>();

        captured
            .WithInnerException<ArgumentException>()
            .WithInnerExceptionExactly<NotSupportedException>()
            .WithMessage("inner secret");
        captured.WithInnerExceptionMessage("middle *");
        captured.HaveInnerException().WithMessage("middle secret");

        Assert.Throws<AstraFlowAssertionException>(() => captured.WithInnerExceptionExactly<Exception>());
        Assert.Throws<AstraFlowAssertionException>(() => captured.WithInnerException<NotSupportedException>());
    }

    [Fact]
    public void CapturedException_SupportsRuntimeTypesAndSingleInvocationPredicates()
    {
        var captured = ((Action)(() => throw new InvalidOperationException(
                "outer",
                new ArgumentException("inner"))))
            .Should()
            .Throw<InvalidOperationException>();

        captured.WithInnerException(typeof(ArgumentException)).WithMessage("inner");
        captured.WithInnerException(typeof(Exception)).WithMessage("inner");
        captured.WithInnerExceptionExactly(typeof(ArgumentException)).WithMessage("inner");
        Assert.Throws<AstraFlowAssertionException>(() => captured.WithInnerException(typeof(NotSupportedException)));
        Assert.Throws<AstraFlowAssertionException>(() => captured.WithInnerExceptionExactly(typeof(Exception)));

        var calls = 0;
        captured.Where(exception =>
        {
            calls++;
            return exception.Message == "outer";
        });
        Assert.Equal(1, calls);

        captured.NotWhere(exception => exception.Message == "different");
        Assert.Throws<AstraFlowAssertionException>(() => captured.Where(_ => false));
        Assert.Throws<AstraFlowAssertionException>(() => captured.NotWhere(_ => true));
        var callbackFailure = new InvalidOperationException("predicate failure");
        Assert.Same(callbackFailure, Assert.Throws<InvalidOperationException>(() => captured.Where(_ => throw callbackFailure)));
        Assert.Throws<ArgumentNullException>(() => captured.WithInnerException((Type)null!));
        Assert.Throws<ArgumentNullException>(() => captured.WithInnerExceptionExactly((Type)null!));
        Assert.Throws<ArgumentNullException>(() => captured.Where(null!));
        Assert.Throws<ArgumentNullException>(() => captured.NotWhere(null!));
    }

    [Fact]
    public void CapturedException_ReportsMissingInnerExceptionsAndKeepsMessagesPrivate()
    {
        var captured = ((Action)(() => throw new InvalidOperationException("outer-private-marker")))
            .Should()
            .Throw<InvalidOperationException>();

        captured.NotHaveInnerException();
        Assert.Throws<AstraFlowAssertionException>(() => captured.HaveInnerException());
        Assert.Throws<AstraFlowAssertionException>(() => captured.WithInnerExceptionMessage("secret"));

        var failure = Assert.Throws<AstraFlowAssertionException>(() => captured.WithMessage("different"));
        Assert.DoesNotContain("outer-private-marker", failure.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task CapturedException_AsyncExpectedExceptionUsesSameChainChecks()
    {
        Func<Task> operation = () => Task.FromException(new InvalidOperationException(
            "async outer",
            new ArgumentException("async inner")));

        var captured = await operation.Should().ThrowAsync<InvalidOperationException>();

        captured.WithInnerException<ArgumentException>().WithMessage("async inner");
    }
}
