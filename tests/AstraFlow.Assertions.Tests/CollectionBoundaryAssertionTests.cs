using System;
using System.Collections.Generic;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class CollectionBoundaryAssertionTests
{
    [Fact]
    public void StartWithAndEndWithMatchOrderedPrefixesAndSuffixes()
    {
        var values = new[] { "alpha", "beta", "gamma" };

        values.Should().StartWith("alpha").StartWith(new[] { "alpha", "beta" });
        values.Should().EndWith("gamma").EndWith(new[] { "beta", "gamma" });
        values.Should()
            .StartWith(new[] { "ALPHA", "BETA" }, StringComparer.OrdinalIgnoreCase)
            .EndWith(new[] { "BETA", "GAMMA" }, StringComparer.OrdinalIgnoreCase);
        Array.Empty<int>().Should().StartWith(Array.Empty<int>()).EndWith(Array.Empty<int>());
    }

    [Fact]
    public void StartWithAndEndWithRejectNullSubjectsAndNullExpectations()
    {
        IEnumerable<int>? absent = null;

        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().StartWith(Array.Empty<int>()));
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().EndWith(Array.Empty<int>()));
        Assert.Equal("expected", Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().StartWith(null!)).ParamName);
        Assert.Equal("expected", Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().EndWith(null!)).ParamName);
    }

    [Fact]
    public void StartWithAndEndWithRejectWrongOrderAndTooLongExpectationsWithoutLeakingValues()
    {
        const string secret = "private-item-value";
        var values = new[] { secret, "middle", "end-secret" };

        var wrongPrefix = Assert.Throws<AstraFlowAssertionException>(() => values.Should().StartWith(new[] { "middle" }));
        var wrongSuffix = Assert.Throws<AstraFlowAssertionException>(() => values.Should().EndWith(new[] { "middle" }));
        var longPrefix = Assert.Throws<AstraFlowAssertionException>(() => new[] { 1 }.Should().StartWith(new[] { 1, 2 }));
        var longSuffix = Assert.Throws<AstraFlowAssertionException>(() => new[] { 1 }.Should().EndWith(new[] { 1, 2 }));

        Assert.DoesNotContain(secret, wrongPrefix.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("middle", wrongPrefix.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("end-secret", wrongSuffix.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("middle", wrongSuffix.Message, StringComparison.Ordinal);
        Assert.Contains("index 1", longPrefix.Message, StringComparison.Ordinal);
        Assert.Contains("only 1", longSuffix.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void BoundaryAssertionsEnumerateFiniteInputsAtMostOnceAndDisposeEnumerators()
    {
        var prefixSubject = new OneShotEnumerable<int>(new[] { 1, 2, 3 });
        var prefixExpected = new OneShotEnumerable<int>(new[] { 1, 2 });
        prefixSubject.Should().StartWith(prefixExpected);
        Assert.Equal(1, prefixSubject.GetEnumeratorCalls);
        Assert.Equal(1, prefixSubject.DisposeCalls);
        Assert.Equal(1, prefixExpected.GetEnumeratorCalls);
        Assert.Equal(1, prefixExpected.DisposeCalls);

        var suffixSubject = new OneShotEnumerable<int>(new[] { 1, 2, 3 });
        var suffixExpected = new OneShotEnumerable<int>(new[] { 2, 3 });
        suffixSubject.Should().EndWith(suffixExpected);
        Assert.Equal(1, suffixSubject.GetEnumeratorCalls);
        Assert.Equal(1, suffixSubject.DisposeCalls);
        Assert.Equal(1, suffixExpected.GetEnumeratorCalls);
        Assert.Equal(1, suffixExpected.DisposeCalls);

        var emptyExpected = new OneShotEnumerable<int>(Array.Empty<int>());
        var untouchedSubject = new OneShotEnumerable<int>(new[] { 1 });
        untouchedSubject.Should().StartWith(emptyExpected).EndWith(Array.Empty<int>());
        Assert.Equal(1, emptyExpected.GetEnumeratorCalls);
        Assert.Equal(1, emptyExpected.DisposeCalls);
        Assert.Equal(0, untouchedSubject.GetEnumeratorCalls);
    }

    [Fact]
    public void BoundaryAssertionsPropagateEnumeratorFailuresAndStillDispose()
    {
        var producerFailure = new InvalidOperationException("producer-secret");
        var subject = new OneShotEnumerable<int>(new[] { 1 }, moveNextException: producerFailure);

        var observed = Assert.Throws<InvalidOperationException>(() => subject.Should().StartWith(new[] { 1 }));

        Assert.Same(producerFailure, observed);
        Assert.Equal(1, subject.GetEnumeratorCalls);
        Assert.Equal(1, subject.DisposeCalls);
    }
}
