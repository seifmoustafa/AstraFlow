using System;
using System.Collections.Generic;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class CollectionIndexAssertionTests
{
    [Fact]
    public void HaveElementAtChecksOnlyTheRequestedIndexAndReturnsTheItem()
    {
        var values = new[] { 4, 7, 7, 9 };
        var result = values.Should().HaveElementAt(1, 7);

        Assert.Equal(7, result.Which);
        Assert.Equal(7, result.Subject);
        Assert.Same(result, result.And);
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveElementAt(1, 9));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveElementAt(4, 7));
        Assert.Throws<AstraFlowAssertionException>(() => Array.Empty<int>().Should().HaveElementAt(0, 7));
        Assert.Throws<ArgumentOutOfRangeException>(() => values.Should().HaveElementAt(-1, 7));

        IEnumerable<int>? absent = null;
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().HaveElementAt(0, 7));
    }

    [Fact]
    public void HaveElementAtEnumeratesOneShotInputsOnceAndDisposesThem()
    {
        var values = new OneShotEnumerable<int>(new[] { 4, 7, 9 });

        Assert.Equal(7, values.Should().HaveElementAt(1, 7).Which);
        Assert.Equal(1, values.GetEnumeratorCalls);
        Assert.Equal(1, values.DisposeCalls);

        var mismatch = new OneShotEnumerable<int>(new[] { 4, 9 });
        Assert.Throws<AstraFlowAssertionException>(() => mismatch.Should().HaveElementAt(1, 7));
        Assert.Equal(1, mismatch.GetEnumeratorCalls);
        Assert.Equal(1, mismatch.DisposeCalls);
    }

    [Fact]
    public void HaveElementAtFailureDoesNotPrintStringContents()
    {
        var failure = Assert.Throws<AstraFlowAssertionException>(
            () => new[] { "actual secret" }.Should().HaveElementAt(0, "expected secret"));

        Assert.DoesNotContain("actual secret", failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("expected secret", failure.Message, StringComparison.Ordinal);
    }
}
