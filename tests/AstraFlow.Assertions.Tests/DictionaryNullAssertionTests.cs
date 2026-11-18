using System.Collections.Generic;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class DictionaryNullAssertionTests
{
    [Fact]
    public void NullChecks_AreChainableAndKeepDictionaryValuesOutOfFailures()
    {
        IDictionary<string, string>? missing = null;
        var missingAssertions = missing.Should();

        Assert.Same(missingAssertions, missingAssertions.BeNull());

        var missingFailure = Assert.Throws<AstraFlowAssertionException>(
            () => missingAssertions.NotBeNull("the {0} dictionary is required", "settings"));
        Assert.Contains("Because the settings dictionary is required.", missingFailure.Message);

        IDictionary<string, string> present = new Dictionary<string, string>
        {
            ["secret-name"] = "secret-value"
        };
        var presentAssertions = present.Should();

        Assert.Same(presentAssertions, presentAssertions.NotBeNull());

        var presentFailure = Assert.Throws<AstraFlowAssertionException>(
            () => presentAssertions.BeNull("the {0} dictionary must be absent", "settings"));
        Assert.Contains("Because the settings dictionary must be absent.", presentFailure.Message);
        Assert.DoesNotContain("secret-name", presentFailure.Message);
        Assert.DoesNotContain("secret-value", presentFailure.Message);
    }
}