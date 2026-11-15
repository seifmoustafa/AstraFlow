using System;
using System.Collections.Generic;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class CollectionAdjacencyAssertionTests
{
    [Fact]
    public void HaveElementPrecedingAndSucceedingCheckImmediateNeighbors()
    {
        var values = new[] { 10, 20, 30, 20, 40 };

        var preceding = values.Should().HaveElementPreceding(30, 20);
        var succeeding = values.Should().HaveElementSucceeding(30, 20);

        Assert.Same(preceding, preceding.And);
        Assert.Same(succeeding, succeeding.And);
        Assert.Same(values, preceding.Subject);
        Assert.Same(values, succeeding.Subject);
    }

    [Fact]
    public void AdjacencyAssertionsUseTheFirstMatchingPivotAndRejectMissingOrWrongNeighbors()
    {
        var values = new[] { 20, 10, 20, 30 };

        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveElementPreceding(20, 10));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveElementPreceding(30, 10));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveElementSucceeding(20, 30));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveElementSucceeding(30, 40));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 10, 20 }.Should().HaveElementPreceding(20, 99));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 10, 20 }.Should().HaveElementSucceeding(10, 99));
    }

    [Fact]
    public void AdjacencyAssertionsHandleNullAndEmptySequencesAndNullItems()
    {
        IEnumerable<int>? absent = null;
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().HaveElementPreceding(1, 0));
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().HaveElementSucceeding(0, 1));
        Assert.Throws<AstraFlowAssertionException>(() => Array.Empty<int>().Should().HaveElementPreceding(1, 0));
        Assert.Throws<AstraFlowAssertionException>(() => Array.Empty<int>().Should().HaveElementSucceeding(0, 1));

        string?[] values = [null, "next", "previous", null];
        values.Should().HaveElementPreceding("next", null!);
        values.Should().HaveElementSucceeding("previous", null!);
    }

    [Fact]
    public void AdjacencyAssertionsEnumerateOneShotInputsOnceAndDisposeThem()
    {
        var preceding = new OneShotEnumerable<int>([10, 20, 30, 40]);
        preceding.Should().HaveElementPreceding(30, 20);
        Assert.Equal(1, preceding.GetEnumeratorCalls);
        Assert.Equal(3, preceding.MoveNextCalls);
        Assert.Equal(1, preceding.DisposeCalls);

        var succeeding = new OneShotEnumerable<int>([10, 20, 30, 40]);
        succeeding.Should().HaveElementSucceeding(20, 30);
        Assert.Equal(1, succeeding.GetEnumeratorCalls);
        Assert.Equal(3, succeeding.MoveNextCalls);
        Assert.Equal(1, succeeding.DisposeCalls);

        var mismatch = new OneShotEnumerable<int>([10, 20, 30]);
        Assert.Throws<AstraFlowAssertionException>(() => mismatch.Should().HaveElementPreceding(30, 10));
        Assert.Equal(1, mismatch.GetEnumeratorCalls);
        Assert.Equal(1, mismatch.DisposeCalls);
    }

    [Fact]
    public void AdjacencyAssertionsPropagateEnumerationFailuresAndDisposeEnumerator()
    {
        var producerFailure = new InvalidOperationException("producer failure");
        var values = new OneShotEnumerable<int>([10, 20], moveNextException: producerFailure);

        var observed = Assert.Throws<InvalidOperationException>(() => values.Should().HaveElementPreceding(20, 10));

        Assert.Same(producerFailure, observed);
        Assert.Equal(1, values.GetEnumeratorCalls);
        Assert.Equal(1, values.DisposeCalls);
    }

    [Fact]
    public void AdjacencyFailuresOmitComparedValues()
    {
        const string secret = "private-token";
        var failure = Assert.Throws<AstraFlowAssertionException>(
            () => new[] { "actual-value", "successor-value" }.Should().HaveElementPreceding("successor-value", secret));

        Assert.DoesNotContain(secret, failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("actual-value", failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("successor-value", failure.Message, StringComparison.Ordinal);
    }
}
