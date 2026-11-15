using System;
using System.Reflection;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class AssemblyAssertionTests
{
    [Fact]
    public void AssemblyAssertions_CheckReferenceBoundariesByAssemblyName()
    {
        var testAssembly = typeof(AssemblyAssertionTests).Assembly;
        var assertionsAssembly = typeof(AssemblyAssertions).Assembly;
        var assertions = testAssembly.Should();
        var assertionsAssemblyAssertions = assertionsAssembly.Should();

        Assert.Same(assertions, assertions.Reference(assertionsAssembly));
        Assert.Same(assertionsAssemblyAssertions, assertionsAssemblyAssertions.NotReference(testAssembly));
        Assert.Throws<AstraFlowAssertionException>(() => assertions.NotReference(assertionsAssembly));
        Assert.Throws<AstraFlowAssertionException>(() => assertionsAssembly.Should().Reference(testAssembly));
    }

    [Fact]
    public void AssemblyAssertions_CheckTypesByIdentityAndExactReflectionName()
    {
        var assembly = typeof(AssemblyAssertions).Assembly;
        var assertions = assembly.Should();

        Assert.Same(assertions, assertions.HaveType(typeof(AssemblyAssertions)));
        Assert.Same(assertions, assertions.NotHaveType(typeof(AssemblyAssertionTests)));
        Assert.Same(assertions, assertions.HaveType("AstraFlow.Assertions.AssemblyAssertions"));
        Assert.Same(assertions, assertions.NotHaveType("AstraFlow.Assertions.MissingType"));
        Assert.Same(assertions, assertions.NotHaveType("astraflow.assertions.AssemblyAssertions"));
        Assert.Throws<AstraFlowAssertionException>(() => assertions.HaveType(typeof(AssemblyAssertionTests)));
        Assert.Throws<AstraFlowAssertionException>(() => assertions.NotHaveType(typeof(AssemblyAssertions)));
        Assert.Throws<AstraFlowAssertionException>(() => assertions.HaveType("AstraFlow.Assertions.MissingType"));
    }

    [Fact]
    public void AssemblyAssertions_RejectNullSubjectsAndArguments()
    {
        Assembly? missingAssembly = null;
        var assertions = typeof(AssemblyAssertions).Assembly.Should();

        Assert.Throws<AstraFlowAssertionException>(() => missingAssembly.Should().Reference(typeof(object).Assembly));
        Assert.Throws<ArgumentNullException>(() => assertions.Reference(null!));
        Assert.Throws<ArgumentNullException>(() => assertions.NotReference(null!));
        Assert.Throws<ArgumentNullException>(() => assertions.HaveType((Type)null!));
        Assert.Throws<ArgumentNullException>(() => assertions.NotHaveType((Type)null!));
        Assert.Throws<ArgumentNullException>(() => assertions.HaveType((string)null!));
        Assert.Throws<ArgumentException>(() => assertions.HaveType(string.Empty));
        Assert.Throws<ArgumentException>(() => assertions.NotHaveType("  "));
    }

    [Fact]
    public void AssemblyAssertions_FailureMessagesDoNotExposeTheSuppliedName()
    {
        var testAssemblyName = typeof(AssemblyAssertionTests).Assembly.GetName().Name!;

        var failure = Assert.Throws<AstraFlowAssertionException>(
            () => typeof(AssemblyAssertions).Assembly.Should().Reference(typeof(AssemblyAssertionTests).Assembly));

        Assert.DoesNotContain(testAssemblyName, failure.Message, StringComparison.Ordinal);
    }
}
