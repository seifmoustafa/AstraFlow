using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class AssertionReasonParityTests
{
    [Fact]
    public void TypeAndPredicateAssertions_AppendFormattedFailureContext()
    {
        var typeFailure = Assert.Throws<AstraFlowAssertionException>(
            () => typeof(string).Should().Be(typeof(int), "the {0} type must be used", "integer"));
        Assert.Contains("Because the integer type must be used.", typeFailure.Message);

        var predicateFailure = Assert.Throws<AstraFlowAssertionException>(
            () => 5.Should().Match(value => value > 10, "the {0} must satisfy the check", "request"));
        Assert.Contains("Because the request must satisfy the check.", predicateFailure.Message);
    }

    [Fact]
    public void NumericAssertions_AppendFormattedFailureContext()
    {
        var valueFailure = Assert.Throws<AstraFlowAssertionException>(
            () => 5.Should().BeGreaterThan(5, "the {0} must exceed the boundary", "value"));
        Assert.Contains("Because the value must exceed the boundary.", valueFailure.Message);

        int? nullable = 5;
        var nullableFailure = Assert.Throws<AstraFlowAssertionException>(
            () => nullable.Should().BeLessThan(5, "the {0} must be below the boundary", "count"));
        Assert.Contains("Because the count must be below the boundary.", nullableFailure.Message);

        int? missing = null;
        var missingFailure = Assert.Throws<AstraFlowAssertionException>(
            () => missing.Should().BeGreaterThan(0, "the {0} must be present", "count"));
        Assert.Contains("Because the count must be present.", missingFailure.Message);
    }

    [Fact]
    public void CollectionAssertions_AppendFormattedFailureContext()
    {
        _ = new[] { 1 }.Should().StartWith(new[] { 1 }, null);
        Assert.Throws<ArgumentNullException>(() => new[] { 1 }.Should().ContainSingle(null!));

        var values = new[] { 1, 2 };
        var countFailure = Assert.Throws<AstraFlowAssertionException>(
            () => values.Should().HaveCount(3, "expected {0} values", "three"));
        Assert.Contains("Because expected three values.", countFailure.Message);

        var containFailure = Assert.Throws<AstraFlowAssertionException>(
            () => values.Should().Contain(3, "the {0} must be present", "result"));
        Assert.Contains("Because the result must be present.", containFailure.Message);

        var stringContainFailure = Assert.Throws<AstraFlowAssertionException>(
            () => Array.Empty<string>().Should().Contain("value", "the {0} must be present", "result"));
        Assert.DoesNotContain("Because the result must be present.", stringContainFailure.Message);

        object result = "result";
        var formattedStringContainFailure = Assert.Throws<AstraFlowAssertionException>(
            () => Array.Empty<string>().Should().Contain("value", "the {0} must be present", result));
        Assert.Contains("Because the result must be present.", formattedStringContainFailure.Message);

        var singleFailure = Assert.Throws<AstraFlowAssertionException>(
            () => Array.Empty<int>().Should().ContainSingle("expected {0} item", "one"));
        Assert.Contains("Because expected one item.", singleFailure.Message);

        var matchingSingleFailure = Assert.Throws<AstraFlowAssertionException>(
            () => values.Should().ContainSingle(value => value > 10, "expected one {0}", "match"));
        Assert.Contains("Because expected one match.", matchingSingleFailure.Message);

        var prefixFailure = Assert.Throws<AstraFlowAssertionException>(
            () => values.Should().StartWith(new[] { 0 }, "the {0} must be the prefix", "expected value"));
        Assert.Contains("Because the expected value must be the prefix.", prefixFailure.Message);
    }

    [Fact]
    public void DictionaryAndEquivalentStringAssertions_AppendContextWithoutValues()
    {
        var dictionary = new Dictionary<string, int> { ["private-key"] = 1 };
        var keyFailure = Assert.Throws<AstraFlowAssertionException>(
            () => dictionary.Should().NotContainKey("private-key", "the {0} key must be absent", "secret"));
        Assert.Contains("Because the secret key must be absent.", keyFailure.Message);
        Assert.DoesNotContain("private-key", keyFailure.Message);

        var dictionaryCountFailure = Assert.Throws<AstraFlowAssertionException>(
            () => dictionary.Should().HaveCount(2, "the {0} dictionary should contain two entries", "private"));
        Assert.Contains("Because the private dictionary should contain two entries.", dictionaryCountFailure.Message);

        KeyValuePair<string, int>[] pairs = [new("private-key", 1)];
        var pairKeyFailure = Assert.Throws<AstraFlowAssertionException>(
            () => pairs.Should().NotContainKey("private-key", "the {0} key must be absent", "secret"));
        Assert.Contains("Because the secret key must be absent.", pairKeyFailure.Message);
        Assert.DoesNotContain("private-key", pairKeyFailure.Message);

        var stringFailure = Assert.Throws<AstraFlowAssertionException>(
            () => "Private-Marker".Should().NotContainEquivalentOf("marker", "the {0} must be omitted", "secret"));
        Assert.Contains("Because the secret must be omitted.", stringFailure.Message);
        Assert.DoesNotContain("Private-Marker", stringFailure.Message);
        Assert.DoesNotContain("marker", stringFailure.Message);
    }

    [Fact]
    public void SynchronousThrowAssertions_AppendFormattedFailureContext()
    {
        Action action = () => { };
        var actionFailure = Assert.Throws<AstraFlowAssertionException>(
            () => action.Should().Throw<InvalidOperationException>("the {0} should throw", "operation"));
        Assert.Contains("Because the operation should throw.", actionFailure.Message);

        Func<int> function = () => throw new ArgumentException("private detail");
        var functionFailure = Assert.Throws<AstraFlowAssertionException>(
            () => function.Should().Throw<InvalidOperationException>("the {0} exception is expected", "request"));
        Assert.Contains("Because the request exception is expected.", functionFailure.Message);
        Assert.DoesNotContain("private detail", functionFailure.Message);
    }

    [Fact]
    public async Task AsyncThrowAssertions_AppendFormattedFailureContext()
    {
        var defaultTokenFailure = await Assert.ThrowsAsync<AstraFlowAssertionException>(
            () => EmptyAsyncSequence().Should().ThrowAsync<InvalidOperationException>(default));
        Assert.DoesNotContain("Because", defaultTokenFailure.Message);

        Func<Task> action = () => Task.CompletedTask;
        var actionFailure = await Assert.ThrowsAsync<AstraFlowAssertionException>(
            () => action.Should().ThrowAsync<InvalidOperationException>("the {0} should throw", "operation"));
        Assert.Contains("Because the operation should throw.", actionFailure.Message);

        Func<Task<int>> function = () => Task.FromException<int>(new ArgumentException("private detail"));
        var functionFailure = await Assert.ThrowsAsync<AstraFlowAssertionException>(
            () => function.Should().ThrowAsync<InvalidOperationException>("the {0} exception is expected", "request"));
        Assert.Contains("Because the request exception is expected.", functionFailure.Message);
        Assert.DoesNotContain("private detail", functionFailure.Message);

        var sequenceFailure = await Assert.ThrowsAsync<AstraFlowAssertionException>(
            () => EmptyAsyncSequence().Should().ThrowAsync<InvalidOperationException>("the {0} sequence should fail", "source"));
        Assert.Contains("Because the source sequence should fail.", sequenceFailure.Message);
    }

    private static async IAsyncEnumerable<int> EmptyAsyncSequence()
    {
        await Task.CompletedTask;
        yield break;
    }
}
