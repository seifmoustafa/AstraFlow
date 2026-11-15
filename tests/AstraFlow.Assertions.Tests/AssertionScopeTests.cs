using System;
using System.Threading.Tasks;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class AssertionScopeTests
{
    [Fact]
    public void Dispose_ThrowsOneExceptionContainingEveryCheckedFailure()
    {
        var exception = Assert.Throws<AstraFlowAssertionException>(() =>
        {
            using var scope = new AssertionScope();
            scope.Check(() => 1.Should().Be(2));
            scope.Check(() => "alpha".Should().Be("beta"));
        });

        Assert.Contains("collected 2 failures", exception.Message, StringComparison.Ordinal);
        Assert.Contains("Expected value equal to", exception.Message, StringComparison.Ordinal);
        Assert.Contains("Expected strings to be ordinally equal", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void NestedScope_ForwardsFailuresToParent()
    {
        var exception = Assert.Throws<AstraFlowAssertionException>(() =>
        {
            using var parent = new AssertionScope();
            using (var child = parent.BeginScope())
            {
                child.Check(() => 3.Should().Be(4));
            }

            parent.Check(() => true.Should().BeFalse());
        });

        Assert.Contains("collected 2 failures", exception.Message, StringComparison.Ordinal);
        Assert.Contains("Expected value equal to", exception.Message, StringComparison.Ordinal);
        Assert.Contains("Expected false, but found true", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task CheckAsync_CollectsFailuresFromConcurrentChecks()
    {
        var scope = new AssertionScope();
        await Task.WhenAll(
            scope.CheckAsync(() => Task.Run(() => 5.Should().Be(6))),
            scope.CheckAsync(() => Task.Run(() => "one".Should().Be("two"))));

        var exception = Assert.Throws<AstraFlowAssertionException>(() => scope.Dispose());

        Assert.Contains("collected 2 failures", exception.Message, StringComparison.Ordinal);
        Assert.Contains("Expected value equal to", exception.Message, StringComparison.Ordinal);
        Assert.Contains("Expected strings to be ordinally equal", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Dispose_DoesNotThrowWhenAllCheckedAssertionsPass()
    {
        using var scope = new AssertionScope();

        scope.Check(() => 7.Should().Be(7));
        scope.Check(() => "same".Should().Be("same"));

        scope.Dispose();
    }

    [Fact]
    public void Check_DoesNotCaptureNonAssertionExceptions()
    {
        using var scope = new AssertionScope();

        Assert.Throws<InvalidOperationException>(() => scope.Check(() => throw new InvalidOperationException("application failure")));
    }

    [Fact]
    public void Check_StopsAtTheFirstFailedAssertionInThatAction()
    {
        var laterAssertionRan = false;

        var exception = Assert.Throws<AstraFlowAssertionException>(() =>
        {
            using var scope = new AssertionScope();
            scope.Check(() =>
            {
                1.Should().Be(2);
                laterAssertionRan = true;
            });
        });

        Assert.False(laterAssertionRan);
        Assert.Contains("collected 1 failure", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Check_RejectsUseAfterScopeIsDisposed()
    {
        var scope = new AssertionScope();
        scope.Dispose();

        Assert.Throws<ObjectDisposedException>(() => scope.Check(() => 1.Should().Be(1)));
    }
}
