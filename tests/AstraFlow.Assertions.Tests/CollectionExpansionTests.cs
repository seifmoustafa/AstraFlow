using System.Collections.Generic;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class CollectionExpansionTests
{
    [Fact]
    public void SubjectAndNullOrEmptyChecksPreserveTheOriginalSequence()
    {
        IEnumerable<int>? absent = null;
        var absentAssertions = absent.Should();
        Assert.Null(absentAssertions.Subject);
        Assert.Same(absentAssertions, absentAssertions.BeNull());
        Assert.Same(absentAssertions, absentAssertions.BeNullOrEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => absentAssertions.NotBeNull());
        Assert.Throws<AstraFlowAssertionException>(() => absentAssertions.NotBeNullOrEmpty());

        var empty = Array.Empty<int>();
        var emptyAssertions = empty.Should();
        Assert.Same(empty, emptyAssertions.Subject);
        Assert.Same(emptyAssertions, emptyAssertions.NotBeNull());
        Assert.Same(emptyAssertions, emptyAssertions.BeNullOrEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => emptyAssertions.BeNull());
        Assert.Throws<AstraFlowAssertionException>(() => emptyAssertions.NotBeNullOrEmpty());

        var values = new[] { 1 };
        var valuesAssertions = values.Should();
        Assert.Same(valuesAssertions, valuesAssertions.NotBeNullOrEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => valuesAssertions.BeNullOrEmpty());
    }

    [Fact]
    public void CountAssertionsUseNonnegativeCountsAndCompareExpectedSequencesOnce()
    {
        var values = new[] { 1, 2, 3 };
        values.Should().NotHaveCount(2).HaveCountGreaterThan(2).HaveCountLessThan(4);
        values.Should().HaveSameCount(new[] { 8, 9, 10 });
        Assert.Same(values, values.Should().Subject);

        Assert.Throws<AstraFlowAssertionException>(() => values.Should().NotHaveCount(3));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveCountGreaterThan(3));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveCountLessThan(3));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveSameCount(new[] { 1, 2 }));
        Assert.Throws<ArgumentNullException>(() => values.Should().HaveSameCount(null!));

        var negativeUnexpected = Assert.Throws<ArgumentOutOfRangeException>(() => values.Should().NotHaveCount(-1));
        var negativeGreaterThan = Assert.Throws<ArgumentOutOfRangeException>(() => values.Should().HaveCountGreaterThan(-1));
        var negativeLessThan = Assert.Throws<ArgumentOutOfRangeException>(() => values.Should().HaveCountLessThan(-1));
        Assert.Equal("unexpected", negativeUnexpected.ParamName);
        Assert.Equal("expected", negativeGreaterThan.ParamName);
        Assert.Equal("expected", negativeLessThan.ParamName);
    }

    [Fact]
    public void InclusiveCountAssertionsValidateBoundsAndEnumerateOnce()
    {
        var values = new[] { 1, 2, 3 };
        values.Should().HaveCountGreaterThanOrEqualTo(3).HaveCountLessThanOrEqualTo(3);
        Array.Empty<int>().Should().HaveCountGreaterThanOrEqualTo(0).HaveCountLessThanOrEqualTo(0);
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveCountGreaterThanOrEqualTo(4));
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().HaveCountLessThanOrEqualTo(2));

        var negativeLower = Assert.Throws<ArgumentOutOfRangeException>(() => values.Should().HaveCountGreaterThanOrEqualTo(-1));
        var negativeUpper = Assert.Throws<ArgumentOutOfRangeException>(() => values.Should().HaveCountLessThanOrEqualTo(-1));
        Assert.Equal("expected", negativeLower.ParamName);
        Assert.Equal("expected", negativeUpper.ParamName);

        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2 }), a => a.HaveCountGreaterThanOrEqualTo(2));
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2 }), a => a.HaveCountLessThanOrEqualTo(2));
        AssertOnePassFailure(new[] { 1 }, a => a.HaveCountGreaterThanOrEqualTo(2));
        AssertOnePassFailure(new[] { 1, 2 }, a => a.HaveCountLessThanOrEqualTo(1));
    }

    [Fact]
    public void SubsetAssertionsUseDistinctMembershipAndSinglePassInputs()
    {
        new[] { 1, 1, 2 }.Should().BeSubsetOf(new[] { 1, 2 });
        new[] { 1, 3 }.Should().NotBeSubsetOf(new[] { 1, 2 });
        Array.Empty<int>().Should().BeSubsetOf(new[] { 1 });
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 3 }.Should().BeSubsetOf(new[] { 1, 2 }));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1 }.Should().NotBeSubsetOf(new[] { 1, 2 }));
        Assert.Throws<AstraFlowAssertionException>(() => Array.Empty<int>().Should().NotBeSubsetOf(new[] { 1 }));

        var subject = new OneShotEnumerable<int>(new[] { 1, 2, 2 });
        var superset = new OneShotEnumerable<int>(new[] { 1, 2, 3 });
        subject.Should().BeSubsetOf(superset);
        Assert.Equal(1, subject.GetEnumeratorCalls);
        Assert.Equal(1, subject.DisposeCalls);
        Assert.Equal(1, superset.GetEnumeratorCalls);
        Assert.Equal(1, superset.DisposeCalls);

        var same = new OneShotEnumerable<int>(new[] { 1, 2 });
        same.Should().BeSubsetOf(same);
        Assert.Equal(0, same.GetEnumeratorCalls);
        Assert.Throws<AstraFlowAssertionException>(() => same.Should().NotBeSubsetOf(same));

        IEnumerable<int>? absent = null;
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().BeSubsetOf(new[] { 1 }));
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().NotBeSubsetOf(new[] { 1 }));
        var nullSuperset = Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().BeSubsetOf(null!));
        Assert.Equal("superset", nullSuperset.ParamName);
    }

    [Fact]
    public void IntersectionAssertionsReturnDistinctSharedItemsAndAvoidValueLeakage()
    {
        var subject = new OneShotEnumerable<int>(new[] { 1, 2, 2, 3 });
        var other = new OneShotEnumerable<int>(new[] { 2, 3, 4 });
        var intersection = subject.Should().IntersectWith(other);
        intersection.Equal(2, 3);
        Assert.Equal(1, subject.GetEnumeratorCalls);
        Assert.Equal(1, subject.DisposeCalls);
        Assert.Equal(1, other.GetEnumeratorCalls);
        Assert.Equal(1, other.DisposeCalls);

        new[] { 1, 2 }.Should().NotIntersectWith(new[] { 3, 4 });
        var noSharedItems = Assert.Throws<AstraFlowAssertionException>(
            () => new[] { 271828 }.Should().IntersectWith(new[] { 314159 }));
        Assert.DoesNotContain("271828", noSharedItems.Message);
        Assert.DoesNotContain("314159", noSharedItems.Message);
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1 }.Should().NotIntersectWith(new[] { 1 }));

        IEnumerable<int>? absent = null;
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().IntersectWith(new[] { 1 }));
        Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().IntersectWith(null!));
    }

    [Fact]
    public void NotContainNullsRequiresANonNullSequenceAndDoesNotExposeItems()
    {
        new string?[] { "first", "second" }.Should().NotContainNulls();
        var failure = Assert.Throws<AstraFlowAssertionException>(
            () => new string?[] { "private-value", null }.Should().NotContainNulls());
        Assert.Contains("index 1", failure.Message);
        Assert.DoesNotContain("private-value", failure.Message);
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<string?>?)null).Should().NotContainNulls());

        var onePass = new OneShotEnumerable<string?>(new string?[] { "value" });
        onePass.Should().NotContainNulls();
        Assert.Equal(1, onePass.GetEnumeratorCalls);
        Assert.Equal(1, onePass.DisposeCalls);
    }

    [Fact]
    public void ContainParamsEnumeratesOnceAndPreservesSetLikeAndNullBehavior()
    {
        new[] { 1 }.Should().Contain(1, 1);
        ((IEnumerable<int>?)null).Should().Contain(Array.Empty<int>());
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<int>?)null).Should().Contain(1));

        var nullExpected = Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().Contain((int[])null!));
        Assert.Equal("expected", nullExpected.ParamName);
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1 }.Should().Contain(1, 2));

        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2, 3 }), a => a.Contain(1, 1, 2));
        AssertOnePassFailure(new[] { 1 }, a => a.Contain(1, 2));

        var emptyExpectation = new OneShotEnumerable<int>(new[] { 1 });
        emptyExpectation.Should().Contain(Array.Empty<int>());
        Assert.Equal(0, emptyExpectation.GetEnumeratorCalls);
        Assert.Equal(0, emptyExpectation.DisposeCalls);
    }

    [Fact]
    public void OrderingAllowsTiesAndUsesTheProvidedComparer()
    {
        var values = new[] { "a", "A", "b" };
        values.Should().BeInAscendingOrder(StringComparer.OrdinalIgnoreCase);
        values.Reverse().Should().BeInDescendingOrder(StringComparer.OrdinalIgnoreCase);
        Array.Empty<int>().Should().BeInAscendingOrder();
        new[] { 7 }.Should().BeInDescendingOrder();

        var ascendingFailure = Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 3, 2 }.Should().BeInAscendingOrder());
        Assert.Contains("index 2", ascendingFailure.Message);
        Assert.DoesNotContain("3", ascendingFailure.Message);
        var descendingFailure = Assert.Throws<AstraFlowAssertionException>(() => new[] { 3, 1, 2 }.Should().BeInDescendingOrder());
        Assert.Contains("index 2", descendingFailure.Message);
        Assert.DoesNotContain("1", descendingFailure.Message);
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<int>?)null).Should().BeInAscendingOrder());
    }

    [Fact]
    public void UniqueAndMultisetAssertionsRetainMultiplicityAndUseEqualityComparers()
    {
        new[] { 1, 2, 3 }.Should().OnlyHaveUniqueItems();
        new[] { double.NaN }.Should().OnlyHaveUniqueItems();
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 2, 1 }.Should().OnlyHaveUniqueItems());
        Assert.Throws<AstraFlowAssertionException>(() => new[] { double.NaN, double.NaN }.Should().OnlyHaveUniqueItems());
        Assert.Throws<AstraFlowAssertionException>(() => new[] { "a", "A" }.Should().OnlyHaveUniqueItems(new HashDisagreementComparer()));

        new[] { 2, 1, 1 }.Should().HaveSameItems(new[] { 1, 2, 1 });
        new[] { 1, 1, 2 }.Should().ContainEquivalentItems(new[] { 1, 2 });
        new[] { "A", "b" }.Should().HaveSameItems(new[] { "a", "B" }, StringComparer.OrdinalIgnoreCase);
        new[] { "a", "A" }.Should().HaveSameItems(new[] { "A", "a" }, new HashDisagreementComparer());
        new[] { double.NaN }.Should().HaveSameItems(new[] { double.NaN });
        new[] { "a" }.Should().ContainEquivalentItems(new[] { "A" }, new HashDisagreementComparer());
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1 }.Should().ContainEquivalentItems(new[] { 1, 1 }));
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 1, 2 }.Should().HaveSameItems(new[] { 1, 2, 2 }));
        Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().ContainEquivalentItems(null!));
        Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().HaveSameItems(null!));
    }

    [Fact]
    public void NullSubjectsFailCountAndMultisetChecks()
    {
        IEnumerable<int>? absent = null;
        var assertions = absent.Should();

        Assert.Throws<AstraFlowAssertionException>(() => assertions.HaveSameCount(new[] { 1 }));
        Assert.Throws<AstraFlowAssertionException>(() => assertions.ContainEquivalentItems(new[] { 1 }));
        Assert.Throws<AstraFlowAssertionException>(() => assertions.HaveSameItems(new[] { 1 }));
    }

    [Fact]
    public void SatisfyRespectivelyAndAllSatisfyInvokeCallbacksOnceInOrder()
    {
        var observed = new List<int>();
        var subject = new[] { 4, 5, 6 }.Should();
        subject.SatisfyRespectively(
            value => observed.Add(value),
            value => observed.Add(value),
            value => observed.Add(value));
        Assert.Equal(new[] { 4, 5, 6 }, observed);

        observed.Clear();
        subject.AllSatisfy(value => observed.Add(value));
        Assert.Equal(new[] { 4, 5, 6 }, observed);
        Array.Empty<int>().Should().AllSatisfy(_ => throw new InvalidOperationException("Empty sequences have no callbacks."));

        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 2 }.Should().SatisfyRespectively(_ => { }));
        Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().SatisfyRespectively(null!));
        Assert.Throws<ArgumentException>(() => new[] { 1 }.Should().SatisfyRespectively((Action<int>)null!));
        Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().AllSatisfy(null!));

        var expectedCallbackFailure = new InvalidOperationException("callback failure");
        var actualCallbackFailure = Assert.Throws<InvalidOperationException>(() => new[] { 1 }.Should().AllSatisfy(_ => throw expectedCallbackFailure));
        Assert.Same(expectedCallbackFailure, actualCallbackFailure);
    }

    [Fact]
    public void ConsecutiveMatchingRequiresAdjacentItemsAndAnEmptyExpectationPreservesNullConvention()
    {
        new[] { 0, 1, 2, 3 }.Should().ContainConsecutive(1, 2);
        new[] { 1, 1, 1, 2 }.Should().ContainConsecutive(1, 1, 2);
        ((IEnumerable<int>?)null).Should().ContainConsecutive();
        Assert.Throws<AstraFlowAssertionException>(() => new[] { 1, 9, 2 }.Should().ContainConsecutive(1, 2));
        Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().ContainConsecutive(null!));
    }

    [Fact]
    public void SinglePassAssertionsEnumerateEachSubjectAtMostOnceAndDisposeIt()
    {
        AssertOnePass(new OneShotEnumerable<int>(Array.Empty<int>()), a => a.BeNullOrEmpty());
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1 }), a => a.NotBeNullOrEmpty());
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2 }), a => a.NotHaveCount(3));
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2 }), a => a.HaveCountGreaterThan(1));
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2 }), a => a.HaveCountLessThan(3));
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2 }), a => a.HaveSameCount(new[] { 8, 9 }));
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 1, 2 }), a => a.BeInAscendingOrder());
        AssertOnePass(new OneShotEnumerable<int>(new[] { 3, 2, 2 }), a => a.BeInDescendingOrder());
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2, 3 }), a => a.OnlyHaveUniqueItems());
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2, 2 }), a => a.ContainEquivalentItems(new[] { 2, 2 }));
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2, 2 }), a => a.HaveSameItems(new[] { 2, 1, 2 }));
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2 }), a => a.SatisfyRespectively(_ => { }, _ => { }));
        AssertOnePass(new OneShotEnumerable<int>(new[] { 1, 2 }), a => a.AllSatisfy(_ => { }));
        AssertOnePass(new OneShotEnumerable<int>(new[] { 0, 1, 2, 3 }), a => a.ContainConsecutive(1, 2));

        AssertOnePassFailure(new[] { 1 }, a => a.BeNullOrEmpty());
        AssertOnePassFailure(Array.Empty<int>(), a => a.NotBeNullOrEmpty());
        AssertOnePassFailure(new[] { 1, 2 }, a => a.NotHaveCount(2));
        AssertOnePassFailure(new[] { 1 }, a => a.HaveCountGreaterThan(1));
        AssertOnePassFailure(new[] { 1, 2 }, a => a.HaveCountLessThan(2));
        AssertOnePassFailure(new[] { 1 }, a => a.HaveSameCount(new[] { 1, 2 }));
        AssertOnePassFailure(new[] { 2, 1 }, a => a.BeInAscendingOrder());
        AssertOnePassFailure(new[] { 1, 2 }, a => a.BeInDescendingOrder());
        AssertOnePassFailure(new[] { 1, 1 }, a => a.OnlyHaveUniqueItems());
        AssertOnePassFailure(new[] { 1 }, a => a.ContainEquivalentItems(new[] { 1, 1 }));
        AssertOnePassFailure(new[] { 1, 1 }, a => a.HaveSameItems(new[] { 1, 2 }));
        AssertOnePassFailure(new[] { 1 }, a => a.SatisfyRespectively(_ => { }, _ => { }));
        AssertOnePassFailure(new[] { 1 }, a => a.AllSatisfy(_ => throw new InvalidOperationException("predicate")), typeof(InvalidOperationException));
        AssertOnePassFailure(new[] { 1, 9, 2 }, a => a.ContainConsecutive(1, 2));

        var sameCount = new OneShotEnumerable<int>(new[] { 1, 2 });
        sameCount.Should().HaveSameCount(sameCount);
        Assert.Equal(0, sameCount.GetEnumeratorCalls);

        var sameItems = new OneShotEnumerable<int>(new[] { 1, 2 });
        sameItems.Should().HaveSameItems(sameItems);
        Assert.Equal(1, sameItems.GetEnumeratorCalls);
        Assert.Equal(1, sameItems.DisposeCalls);

        var sameSubItems = new OneShotEnumerable<int>(new[] { 1, 2 });
        sameSubItems.Should().ContainEquivalentItems(sameSubItems);
        Assert.Equal(1, sameSubItems.GetEnumeratorCalls);
        Assert.Equal(1, sameSubItems.DisposeCalls);
    }

    [Fact]
    public void EnumeratorsAreDisposedOnEarlyFailureAndEnumeratorOrCallbackExceptions()
    {
        var earlyExit = new OneShotEnumerable<int>(new[] { 1, 2, 3 });
        earlyExit.Should().NotBeNullOrEmpty();
        Assert.Equal(1, earlyExit.GetEnumeratorCalls);
        Assert.Equal(1, earlyExit.MoveNextCalls);
        Assert.Equal(1, earlyExit.DisposeCalls);

        var moveNextFailure = new OneShotEnumerable<int>(new[] { 1 }, new InvalidOperationException("move next"));
        Assert.Throws<InvalidOperationException>(() => moveNextFailure.Should().NotHaveCount(0));
        Assert.Equal(1, moveNextFailure.DisposeCalls);

        var currentFailure = new OneShotEnumerable<int>(new[] { 1 }, currentException: new InvalidOperationException("current"));
        Assert.Throws<InvalidOperationException>(() => currentFailure.Should().BeInAscendingOrder());
        Assert.Equal(1, currentFailure.DisposeCalls);

        var disposeFailure = new OneShotEnumerable<int>(Array.Empty<int>(), disposeException: new InvalidOperationException("dispose"));
        Assert.Throws<InvalidOperationException>(() => disposeFailure.Should().BeNullOrEmpty());
        Assert.Equal(1, disposeFailure.DisposeCalls);

        var callbackFailure = new OneShotEnumerable<int>(new[] { 1, 2 });
        Assert.Throws<InvalidOperationException>(() => callbackFailure.Should().AllSatisfy(_ => throw new InvalidOperationException("callback")));
        Assert.Equal(1, callbackFailure.GetEnumeratorCalls);
        Assert.Equal(1, callbackFailure.DisposeCalls);

        var respectiveCallbackFailure = new OneShotEnumerable<int>(new[] { 1 });
        Assert.Throws<InvalidOperationException>(() => respectiveCallbackFailure.Should().SatisfyRespectively(_ => throw new InvalidOperationException("callback")));
        Assert.Equal(1, respectiveCallbackFailure.GetEnumeratorCalls);
        Assert.Equal(1, respectiveCallbackFailure.DisposeCalls);
    }

    [Fact]
    public void AssertionFailuresDoNotIncludeSequenceValues()
    {
        var orderingFailure = Assert.Throws<AstraFlowAssertionException>(() => new[] { 271828, 0 }.Should().BeInAscendingOrder());
        Assert.DoesNotContain("271828", orderingFailure.Message);
        var predicateFailure = Assert.Throws<AstraFlowAssertionException>(() => new[] { 314159 }.Should().OnlyContain(_ => false));
        Assert.DoesNotContain("314159", predicateFailure.Message);
    }

    private static void AssertOnePass(OneShotEnumerable<int> source, Action<CollectionAssertions<int>> assertion)
    {
        assertion(source.Should());
        Assert.Equal(1, source.GetEnumeratorCalls);
        Assert.Equal(1, source.DisposeCalls);
    }

    private static void AssertOnePassFailure(
        IEnumerable<int> items,
        Action<CollectionAssertions<int>> assertion,
        Type? expectedException = null)
    {
        var source = new OneShotEnumerable<int>(items);
        if (expectedException is null)
        {
            Assert.Throws<AstraFlowAssertionException>(() => assertion(source.Should()));
        }
        else
        {
            Assert.Throws(expectedException, () => assertion(source.Should()));
        }

        Assert.Equal(1, source.GetEnumeratorCalls);
        Assert.Equal(1, source.DisposeCalls);
    }

    private sealed class HashDisagreementComparer : IEqualityComparer<string>
    {
        public bool Equals(string? left, string? right) => StringComparer.OrdinalIgnoreCase.Equals(left, right);

        public int GetHashCode(string value) => StringComparer.Ordinal.GetHashCode(value);
    }

}
