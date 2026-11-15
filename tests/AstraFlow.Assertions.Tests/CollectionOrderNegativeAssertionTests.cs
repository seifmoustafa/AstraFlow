using System;
using System.Collections.Generic;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class CollectionOrderNegativeAssertionTests
{
    [Fact]
    public void OrderedContainmentEnumerableOverloadReadsEachSourceOnce()
    {
        var values = new OneShotEnumerable<int>(new[] { 1, 2, 3, 4 });
        var expected = new OneShotEnumerable<int>(new[] { 1, 3, 4 });

        values.Should().ContainInOrder(expected);

        Assert.Equal(1, values.GetEnumeratorCalls);
        Assert.Equal(1, values.DisposeCalls);
        Assert.Equal(1, expected.GetEnumeratorCalls);
        Assert.Equal(1, expected.DisposeCalls);

        var same = new OneShotEnumerable<int>(new[] { 2, 1 });
        same.Should().ContainInOrder(same);
        Assert.Equal(1, same.GetEnumeratorCalls);
        Assert.Equal(1, same.DisposeCalls);
    }

    [Fact]
    public void NotContainInOrderChecksOrderedSubsequencesIncludingRepeatedAndNullItems()
    {
        new[] { 1, 2, 3 }.Should().NotContainInOrder(3, 1);
        new[] { 1, 2, 3 }.Should().NotContainInOrder(Array.Empty<int>());
        new[] { 1, 2, 1 }.Should().NotContainInOrder(1, 1, 1);
        new[] { 1, 9, 2, 3 }.Should().NotContainInConsecutiveOrder(1, 2, 3);
        new[] { 3, 2, 1 }.Should().NotContainInConsecutiveOrder(1, 2, 3);

        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 9, 2, 3 }.Should().NotContainInOrder(1, 2, 3));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 2, 1, 3 }.Should().NotContainInOrder(1, 2, 1, 3));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 2, 3 }.Should().NotContainInOrder(1, 2, 3));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 2, 3 }.Should().NotContainInConsecutiveOrder(1, 2, 3));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 2, 1, 3 }.Should().NotContainInConsecutiveOrder(1, 2, 1));

        object?[] withNull = { 1, null, 2 };
        Assert.Throws<AstraFlowAssertionException>(() => withNull.Should().NotContainInOrder(new object?[] { 1, null, 2 }));
        Assert.Throws<AstraFlowAssertionException>(() => withNull.Should().NotContainInConsecutiveOrder(new object?[] { 1, null, 2 }));

        Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().NotContainInOrder((IEnumerable<int>)null!));
        Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().NotContainInConsecutiveOrder((IEnumerable<int>)null!));
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<int>?)null).Should().NotContainInOrder(Array.Empty<int>()));
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<int>?)null).Should().NotContainInConsecutiveOrder(Array.Empty<int>()));
    }

    [Fact]
    public void NegativeOrderedChecksEnumerateOneShotInputsOnceAndDisposeThem()
    {
        var subject = new OneShotEnumerable<int>(new[] { 1, 2, 3 });
        var expected = new OneShotEnumerable<int>(new[] { 3, 2, 1 });
        subject.Should().NotContainInOrder(expected);
        Assert.Equal(1, subject.GetEnumeratorCalls);
        Assert.Equal(1, subject.DisposeCalls);
        Assert.Equal(1, expected.GetEnumeratorCalls);
        Assert.Equal(1, expected.DisposeCalls);

        var consecutiveSubject = new OneShotEnumerable<int>(new[] { 1, 8, 2, 3 });
        var consecutiveExpected = new OneShotEnumerable<int>(new[] { 1, 2, 3 });
        consecutiveSubject.Should().NotContainInConsecutiveOrder(consecutiveExpected);
        Assert.Equal(1, consecutiveSubject.GetEnumeratorCalls);
        Assert.Equal(1, consecutiveSubject.DisposeCalls);
        Assert.Equal(1, consecutiveExpected.GetEnumeratorCalls);
        Assert.Equal(1, consecutiveExpected.DisposeCalls);

        var same = new OneShotEnumerable<int>(new[] { 1, 2 });
        Assert.Throws<AstraFlowAssertionException>(() => same.Should().NotContainInOrder(same));
        Assert.Equal(1, same.GetEnumeratorCalls);
        Assert.Equal(1, same.DisposeCalls);
    }
}
