using System;
using System.Collections.Generic;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class CollectionKeyOrderingTests
{
    [Fact]
    public void KeyOrderingSupportsAscendingDescendingTiesAndCustomComparers()
    {
        new[] { new SortItem(1, "first"), new SortItem(1, "tie"), new SortItem(3, "last") }
            .Should().BeInAscendingOrderBy(item => item.Rank);
        new[] { new SortItem(3, "first"), new SortItem(2, "middle"), new SortItem(1, "last") }
            .Should().BeInDescendingOrderBy(item => item.Rank);

        new[] { new SortItem(1, "Alpha"), new SortItem(2, "alpha"), new SortItem(3, "Zeta") }
            .Should().BeInAscendingOrderBy(item => item.Name, StringComparer.OrdinalIgnoreCase);
        new[] { new SortItem(1, "Zeta"), new SortItem(2, "alpha"), new SortItem(3, "Alpha") }
            .Should().BeInDescendingOrderBy(item => item.Name, StringComparer.OrdinalIgnoreCase);

        Assert.Throws<AstraFlowAssertionException>(() => new[] { new SortItem(2, "first"), new SortItem(1, "last") }
            .Should().BeInAscendingOrderBy(item => item.Rank));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { new SortItem(1, "first"), new SortItem(2, "last") }
            .Should().BeInDescendingOrderBy(item => item.Rank));

        Array.Empty<SortItem>().Should().BeInAscendingOrderBy(item => item.Rank);
        new[] { new SortItem(1, "single") }.Should().BeInDescendingOrderBy(item => item.Rank);
    }

    [Fact]
    public void KeySelectorRunsOncePerItemAndOneShotSequenceIsDisposed()
    {
        var values = new OneShotEnumerable<SortItem>(new[]
        {
            new SortItem(1, "first"),
            new SortItem(2, "second"),
            new SortItem(3, "third")
        });
        var selectorCalls = 0;

        values.Should().BeInAscendingOrderBy(item =>
        {
            selectorCalls++;
            return item.Rank;
        });

        Assert.Equal(3, selectorCalls);
        Assert.Equal(1, values.GetEnumeratorCalls);
        Assert.Equal(1, values.DisposeCalls);

        var failure = new OneShotEnumerable<SortItem>(new[] { new SortItem(2, "first"), new SortItem(1, "second") });
        Assert.Throws<AstraFlowAssertionException>(() => failure.Should().BeInAscendingOrderBy(item => item.Rank));
        Assert.Equal(1, failure.GetEnumeratorCalls);
        Assert.Equal(1, failure.DisposeCalls);
    }

    [Fact]
    public void KeyOrderingValidatesInputsAndPropagatesSelectorErrors()
    {
        var values = new[] { new SortItem(1, "first") };
        Assert.Throws<ArgumentNullException>(() => values.Should().BeInAscendingOrderBy<int>(null!));
        Assert.Throws<ArgumentNullException>(() => values.Should().BeInDescendingOrderBy<int>(null!));

        IEnumerable<SortItem>? absent = null;
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().BeInAscendingOrderBy(item => item.Rank));
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().BeInDescendingOrderBy(item => item.Rank));

        var callbackFailure = new InvalidOperationException("selector failure");
        var actual = Assert.Throws<InvalidOperationException>(
            () => values.Should().BeInAscendingOrderBy<int>(_ => throw callbackFailure));
        Assert.Same(callbackFailure, actual);
    }

    [Fact]
    public void KeyOrderingFailureDoesNotRenderSelectedValues()
    {
        var failure = Assert.Throws<AstraFlowAssertionException>(() => new[]
        {
            new SortItem(2, "private marker zulu"),
            new SortItem(1, "private marker alpha")
        }.Should().BeInAscendingOrderBy(item => item.Name));

        Assert.DoesNotContain("private marker", failure.Message, StringComparison.Ordinal);
    }

    private sealed record SortItem(int Rank, string Name);
}
