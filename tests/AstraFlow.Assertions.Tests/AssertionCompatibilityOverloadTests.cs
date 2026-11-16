using System.Collections.Generic;
using System.IO;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class AssertionCompatibilityOverloadTests
{
    [Fact]
    public void BooleanBe_ComparesExpectedValueAndFormatsFailureContext()
    {
        true.Should().Be(true);

        var failure = Assert.Throws<AstraFlowAssertionException>(
            () => true.Should().Be(false, "the state was {0}", "enabled"));

        Assert.Equal("Expected false, but found true. Because the state was enabled.", failure.Message);
    }

    [Fact]
    public void NullAssertions_PreserveReturnValuesAndFormatFailureContext()
    {
        var value = new object();
        Assert.Same(value, value.Should().NotBeNull("the {0} result must be present", "service"));
        var objectFailure = Assert.Throws<AstraFlowAssertionException>(
            () => value.Should().BeNull("the {0} result must be absent", "service"));
        Assert.Contains("Because the service result must be absent.", objectFailure.Message);

        string? stringValue = null;
        var stringFailure = Assert.Throws<AstraFlowAssertionException>(
            () => stringValue.Should().NotBeNull("the {0} result must be present", "string"));
        Assert.Contains("Because the string result must be present.", stringFailure.Message);

        var stringPresentFailure = Assert.Throws<AstraFlowAssertionException>(
            () => "present".Should().BeNull("the {0} result must be absent", "string"));
        Assert.Contains("Because the string result must be absent.", stringPresentFailure.Message);

        IEnumerable<int>? sequence = null;
        var sequenceFailure = Assert.Throws<AstraFlowAssertionException>(
            () => sequence.Should().NotBeNull("the {0} sequence must be present", "result"));
        Assert.Contains("Because the result sequence must be present.", sequenceFailure.Message);

        var sequencePresentFailure = Assert.Throws<AstraFlowAssertionException>(
            () => new[] { 1 }.Should().BeNull("the {0} sequence must be absent", "result"));
        Assert.Contains("Because the result sequence must be absent.", sequencePresentFailure.Message);

        int? nullableValue = null;
        var nullableFailure = Assert.Throws<AstraFlowAssertionException>(
            () => nullableValue.Should().NotBeNull("the {0} value must be present", "count"));
        Assert.Contains("Because the count value must be present.", nullableFailure.Message);

        int? nullablePresent = 1;
        var nullablePresentFailure = Assert.Throws<AstraFlowAssertionException>(
            () => nullablePresent.Should().BeNull("the {0} value must be absent", "count"));
        Assert.Contains("Because the count value must be absent.", nullablePresentFailure.Message);

        Stream? stream = null;
        var streamFailure = Assert.Throws<AstraFlowAssertionException>(
            () => stream.Should().NotBeNull("the {0} stream must be open", "response"));
        Assert.Contains("Because the response stream must be open.", streamFailure.Message);

        using var openStream = new MemoryStream();
        var streamPresentFailure = Assert.Throws<AstraFlowAssertionException>(
            () => openStream.Should().BeNull("the {0} stream must be absent", "response"));
        Assert.Contains("Because the response stream must be absent.", streamPresentFailure.Message);

        Type? type = null;
        var typeFailure = Assert.Throws<AstraFlowAssertionException>(
            () => type.Should().NotBeNull("the {0} type must resolve", "handler"));
        Assert.Contains("Because the handler type must resolve.", typeFailure.Message);

        var typePresentFailure = Assert.Throws<AstraFlowAssertionException>(
            () => typeof(string).Should().BeNull("the {0} type must be absent", "handler"));
        Assert.Contains("Because the handler type must be absent.", typePresentFailure.Message);
    }

    [Fact]
    public void StringAssertions_FormatWhitespaceAndNotContainContext()
    {
        string? empty = " ";
        var whitespaceFailure = Assert.Throws<AstraFlowAssertionException>(
            () => empty.Should().NotBeNullOrWhiteSpace("the {0} must be actionable", "identifier"));
        Assert.Contains("Because the identifier must be actionable.", whitespaceFailure.Message);

        const string value = "private-marker";
        var notContainFailure = Assert.Throws<AstraFlowAssertionException>(
            () => value.Should().NotContain("marker", "the {0} must be omitted", "secret"));

        Assert.Contains("Because the secret must be omitted.", notContainFailure.Message);
        Assert.DoesNotContain(value, notContainFailure.Message);
    }

    [Fact]
    public void CollectionAndDictionaryAssertions_FormatFailureContext()
    {
        var values = new[] { "private-marker" };
        var notContainFailure = Assert.Throws<AstraFlowAssertionException>(
            () => values.Should().NotContain("private-marker", "the {0} must be excluded", "item"));
        Assert.Contains("Because the item must be excluded.", notContainFailure.Message);
        Assert.DoesNotContain("private-marker", notContainFailure.Message);

        var dictionary = new Dictionary<string, int>();
        var dictionaryFailure = Assert.Throws<AstraFlowAssertionException>(
            () => dictionary.Should().ContainKey("private-key", "the {0} registration is required", "handler"));
        Assert.Contains("Because the handler registration is required.", dictionaryFailure.Message);
        Assert.DoesNotContain("private-key", dictionaryFailure.Message);

        object[] entries = [new KeyValuePair<string, int>("present-key", 1)];
        var pairAssertions = entries.Should().AllBeOfType<KeyValuePair<string, int>>();
        var sequenceFailure = Assert.Throws<AstraFlowAssertionException>(
            () => pairAssertions.ContainKey("private-key", "the {0} entry is required", "handler"));
        Assert.Contains("Because the handler entry is required.", sequenceFailure.Message);
        Assert.DoesNotContain("private-key", sequenceFailure.Message);
    }
}
