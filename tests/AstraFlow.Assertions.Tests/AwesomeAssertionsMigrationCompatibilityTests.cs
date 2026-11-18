using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

/// <summary>Compile-tested examples for common AwesomeAssertions-to-AstraFlow migration patterns.</summary>
public sealed class AwesomeAssertionsMigrationCompatibilityTests
{
    [Fact]
    public void CommonAssertions_PreserveFormattedBecauseMessages()
    {
        var booleanFailure = Assert.Throws<AstraFlowAssertionException>(
            () => false.Should().BeTrue("Expected failure but got {0}", "success"));
        Assert.Contains("Because Expected failure but got success.", booleanFailure.Message);

        var punctuatedFailure = Assert.Throws<AstraFlowAssertionException>(
            () => false.Should().BeTrue("Expected {0}.", "true"));
        Assert.Contains("Because Expected true.", punctuatedFailure.Message);

        var equalityFailure = Assert.Throws<AstraFlowAssertionException>(
            () => "actual".Should().Be("expected", "Observed {0}", "actual"));
        Assert.Contains("Because Observed actual.", equalityFailure.Message);

        var emptyFailure = Assert.Throws<AstraFlowAssertionException>(
            () => new[] { 1 }.Should().BeEmpty("Expected {0}", "no items"));
        Assert.Contains("Because Expected no items.", emptyFailure.Message);

        var notEmptyFailure = Assert.Throws<AstraFlowAssertionException>(
            () => Array.Empty<int>().Should().NotBeEmpty("Expected {0}", "an item"));
        Assert.Contains("Because Expected an item.", notEmptyFailure.Message);
    }

    [Fact]
    public void ReportedScripeCallShapes_CompileAndPreserveFormattedReasons()
    {
        var prefix = "legacy-";
        var prefixFailure = Assert.Throws<AstraFlowAssertionException>(
            () => "actual-value".Should().StartWith(prefix, "the {0} prefix is required", "catalog"));
        Assert.Contains("Because the catalog prefix is required.", prefixFailure.Message);
        Assert.DoesNotContain(prefix, prefixFailure.Message);

        var pattern = "^expected$";
        var timeout = TimeSpan.FromSeconds(1);
        var regexFailure = Assert.Throws<AstraFlowAssertionException>(
            () => "actual-value".Should().MatchRegex(pattern, timeout, "the {0} format must match", "identifier"));
        Assert.Contains("Because the identifier format must match.", regexFailure.Message);
        Assert.DoesNotContain(pattern, regexFailure.Message);
        Assert.DoesNotContain("actual-value", regexFailure.Message);

        decimal? actualAmount = 12.50m;
        decimal? expectedAmount = 12.50m;
        actualAmount.Should().Be(expectedAmount);
        actualAmount.Should().Be(expectedAmount, "the {0} amount should match", "invoice");
        decimal? noAmount = null;
        decimal? expectedNoAmount = null;
        noAmount.Should().Be(expectedNoAmount);

        DateTime? actualDate = new DateTime(2026, 11, 17);
        DateTime? expectedDate = new DateTime(2026, 11, 17);
        actualDate.Should().Be(expectedDate);

        var nullableFailure = Assert.Throws<AstraFlowAssertionException>(
            () => actualAmount.Should().Be((decimal?)13m, "the {0} amount should match", "invoice"));
        Assert.Contains("Because the invoice amount should match.", nullableFailure.Message);

        int? quota = 3;
        var comparisonFailure = Assert.Throws<AstraFlowAssertionException>(
            () => quota.Should().BeGreaterThanOrEqualTo(4, "the {0} minimum must be met", "quota"));
        Assert.Contains("Because the quota minimum must be met.", comparisonFailure.Message);

        int nonNullableQuota = 3;
        nonNullableQuota.Should().BeGreaterThanOrEqualTo(3, "the {0} minimum must be met", "quota");
        var nonNullableComparisonFailure = Assert.Throws<AstraFlowAssertionException>(
            () => nonNullableQuota.Should().BeGreaterThanOrEqualTo(4, "the {0} minimum must be met", "quota"));
        Assert.Contains("Because the quota minimum must be met.", nonNullableComparisonFailure.Message);

        object actualReference = new MigrationValue();
        object otherReference = new MigrationValue();
        actualReference.Should().BeSameAs(actualReference, "the {0} should retain identity", "result");
        var referenceFailure = Assert.Throws<AstraFlowAssertionException>(
            () => actualReference.Should().BeSameAs(otherReference, "the {0} should share identity", "result"));
        Assert.Contains("Because the result should share identity.", referenceFailure.Message);

        var id = Guid.NewGuid();
        id.Should().NotBe(Guid.Empty, "the {0} identifier should be non-empty", "request");
        var guidFailure = Assert.Throws<AstraFlowAssertionException>(
            () => id.Should().NotBe(id, "the {0} identifier should differ", "request"));
        Assert.Contains("Because the request identifier should differ.", guidFailure.Message);
        Assert.DoesNotContain(id.ToString(), guidFailure.Message);
    }

    [Fact]
    public void TypedResultsAndDictionaryValues_ExposeSubjectAndWhich()
    {
        object actual = new MigrationValue();
        var typeResult = actual.Should().BeOfTypeAndWhich<MigrationValue>();
        Assert.Same(actual, typeResult.Subject);
        Assert.Same(actual, typeResult.Which);

        var assignableResult = actual.Should().BeAssignableToAndWhich<MigrationValue>();
        Assert.Same(actual, assignableResult.Subject);

        var single = new[] { new MigrationValue() }.Should().ContainSingle();
        Assert.Same(single.Subject, single.Which);

        var dictionary = new Dictionary<string, int> { ["answer"] = 42 };
        dictionary.Should().ContainKey("answer").WhoseValue.Should().Be(42);
    }

    [Fact]
    public void CommonMissingMethods_AreAvailableForMigration()
    {
        var expected = Guid.NewGuid();
        expected.Should().NotBe(Guid.Empty);
        expected.Should().Be(expected, "Expected GUID {0}", "identity");
        expected.Should().BeOneOf(Guid.Empty, expected);
        "ready".Should().BeOneOf("waiting", "ready");
        2.Should().BeOneOf(1, 2, 3);

        IEnumerable<int> values = new[] { 1 };
        values.Should().NotEqual(2);
        values.Should().NotBeOfType<List<int>>();
        values.Should().NotBeAssignableTo<List<int>>();
        ((object)42).Should().NotBeOfType<string>();
        ((object)42).Should().NotBeAssignableTo<string>();

        ((Stream?)null).Should().BeNull();
        using var stream = new MemoryStream();
        stream.Should().NotBeNull();
    }

    [Fact]
    public void CollectionEquivalency_AcceptsCollectionExpressionsAndOrderingOptions()
    {
        var actual = new[] { "salary", "ssn" };

        actual.Should().BeEquivalentTo(["salary", "ssn"]);
        actual.Should().BeEquivalentTo("salary", "ssn");
        actual.Should().BeEquivalentTo(["salary", "ssn"], options => options.WithStrictOrdering());

        var guid = Guid.NewGuid();
        new[] { guid }.Should().BeEquivalentTo([guid]);

        Assert.Throws<AstraFlowAssertionException>(
            () => actual.Should().BeEquivalentTo(["ssn", "salary"], options => options.WithStrictOrdering()));
        Assert.Throws<AstraFlowAssertionException>(
            () => actual.Should().BeEquivalentTo(["invalid"], "The configured field was {0}", "invalid"));
    }

    [Fact]
    public async Task AsyncNotThrow_PreservesFormattedBecauseMessages()
    {
        Func<Task> action = () => Task.FromException(new InvalidOperationException());

        var failure = await Assert.ThrowsAsync<AstraFlowAssertionException>(
            async () => await action.Should().NotThrowAsync("Saving {0} should succeed", "the record"));

        Assert.Contains("Because Saving the record should succeed.", failure.Message);
    }

    private sealed class MigrationValue { }
}
