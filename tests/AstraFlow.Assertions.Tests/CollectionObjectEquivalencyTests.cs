using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class CollectionObjectEquivalencyTests
{
    [Fact]
    public void ContainEquivalentOf_FindsDifferentRuntimeShapeAndReturnsTheMatchedItem()
    {
        var actual = new ActualLine("ready", 4, "private actual marker");
        var subject = new[] { new ActualLine("waiting", 2, "private other marker"), actual };
        var expected = new ExpectedLine("ready", 4);

        var match = subject.Should().ContainEquivalentOf(expected);

        Assert.Same(actual, match.Which);
    }

    [Fact]
    public void AllBeEquivalentTo_UsesPerCallOptionsAndReportsOnlyIndexAndPath()
    {
        var actual = new[]
        {
            new ActualLine("READY", 4, "private actual marker"),
            new ActualLine("READY", 4, "private other marker")
        };
        var expected = new ExpectedLine("ready", 4);

        actual.Should().AllBeEquivalentTo(expected, options => options.Using<string>(StringComparer.OrdinalIgnoreCase));

        var mismatch = Assert.Throws<AstraFlowAssertionException>(() => new[]
        {
            new ActualLine("ready", 4, "private first marker"),
            new ActualLine("waiting", 9, "private second marker")
        }.Should().AllBeEquivalentTo(expected));

        Assert.Contains("index 1", mismatch.Message, StringComparison.Ordinal);
        Assert.Contains("$.Count", mismatch.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private first marker", mismatch.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private second marker", mismatch.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("waiting", mismatch.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void NotContainEquivalentOf_FailsAtTheMatchingIndexWithoutPrintingValues()
    {
        var mismatch = Assert.Throws<AstraFlowAssertionException>(() => new[]
        {
            new ActualLine("waiting", 2, "private marker"),
            new ActualLine("ready", 4, "private payload")
        }.Should().NotContainEquivalentOf(new ExpectedLine("ready", 4)));

        Assert.Contains("index 1", mismatch.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private marker", mismatch.Message, StringComparison.Ordinal);
        Assert.DoesNotContain("private payload", mismatch.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ContainEquivalentOf_SnapshotsOneShotNestedSequencesOnceAcrossCandidates()
    {
        var expectedValues = new OneShotEnumerable<int>(new[] { 1, 2 });
        var expected = new ExpectedNestedLine("task", expectedValues);
        var firstValues = new OneShotEnumerable<int>(new[] { 1, 3 });
        var secondValues = new OneShotEnumerable<int>(new[] { 1, 2 });
        var expectedMatch = new ActualNestedLine("task", secondValues);
        var subject = new OneShotEnumerable<ActualNestedLine>(new[]
        {
            new ActualNestedLine("task", firstValues),
            expectedMatch
        });

        var match = subject.Should().ContainEquivalentOf(expected);

        Assert.Same(expectedMatch, match.Which);
        Assert.Equal(1, subject.GetEnumeratorCalls);
        Assert.Equal(1, expectedValues.GetEnumeratorCalls);
        Assert.Equal(1, firstValues.GetEnumeratorCalls);
        Assert.Equal(1, secondValues.GetEnumeratorCalls);
        Assert.Equal(1, expectedValues.DisposeCalls);
        Assert.Equal(1, firstValues.DisposeCalls);
        Assert.Equal(1, secondValues.DisposeCalls);
    }

    [Fact]
    public void CollectionEquivalencyChecks_HandleEmptyAndNullSubjectsExplicitly()
    {
        var expected = new ExpectedLine("ready", 4);
        Array.Empty<ActualLine>().Should().AllBeEquivalentTo(expected);
        Array.Empty<ActualLine>().Should().NotContainEquivalentOf(expected);

        Assert.Throws<AstraFlowAssertionException>(() => Array.Empty<ActualLine>().Should().ContainEquivalentOf(expected));
        Assert.Throws<AstraFlowAssertionException>(() => ((ActualLine[]?)null).Should().AllBeEquivalentTo(expected));
        Assert.Throws<AstraFlowAssertionException>(() => ((ActualLine[]?)null).Should().ContainEquivalentOf(expected));
        Assert.Throws<AstraFlowAssertionException>(() => ((ActualLine[]?)null).Should().NotContainEquivalentOf(expected));
    }

    private sealed record ActualLine(string Name, int Count, string Secret);

    private sealed record ExpectedLine(string Name, int Count);

    private sealed record ActualNestedLine(string Name, IEnumerable<int> Values);

    private sealed record ExpectedNestedLine(string Name, IEnumerable<int> Values);
}
