using System;
using System.IO;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class TypeReflectionAssertionTests
{
    [Fact]
    public void Should_TypeAssertionsCheckInheritanceInterfacesAndMemberSignatures()
    {
        typeof(ReflectionDerived).Should()
            .NotBeNull()
            .BeSealed()
            .NotBeAbstract()
            .NotBeStatic()
            .BeDerivedFrom<ReflectionBase>()
            .Implement<IDisposable>()
            .HaveProperty(nameof(ReflectionDerived.Name), typeof(string))
            .HaveProperty(nameof(ReflectionBase.BaseName))
            .NotHaveProperty("Missing")
            .HaveMethod(nameof(ReflectionDerived.Transform), typeof(int))
            .NotHaveMethod("Missing", typeof(string))
            .HaveConstructor(typeof(string))
            .NotHaveConstructor(typeof(int));
    }

    [Fact]
    public void Should_TypeAssertionsCompareExactRuntimeTypeIdentity()
    {
        typeof(string).Should().Be(typeof(string)).And.NotBe(typeof(int));
        typeof(int).Should().NotBe(null);

        Type? missing = null;
        missing.Should().Be(null).And.NotBe(typeof(string));

        Assert.Throws<AstraFlowAssertionException>(() => typeof(string).Should().Be(typeof(int)));
        Assert.Throws<AstraFlowAssertionException>(() => typeof(string).Should().NotBe(typeof(string)));
    }

    [Fact]
    public void Should_TypeIdentityFailureDoesNotPrintRuntimeTypes()
    {
        var failure = Assert.Throws<AstraFlowAssertionException>(
            () => typeof(ReflectionDerived).Should().Be(typeof(ReflectionBase)));

        Assert.DoesNotContain(nameof(ReflectionDerived), failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain(nameof(ReflectionBase), failure.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Should_TypeAssertionsRecognizeAbstractAndStaticTypes()
    {
        typeof(ReflectionBase).Should().BeAbstract().NotBeSealed().NotBeStatic();
        typeof(ReflectionHelpers).Should().BeStatic();

        Type? missing = null;
        missing.Should().BeNull();
    }

    [Fact]
    public void Should_TypeAssertionsValidateRequestedInterfaceAndBaseTypes()
    {
        Assert.Throws<ArgumentNullException>(() => typeof(ReflectionDerived).Should().Implement((Type)null!));
        Assert.Throws<ArgumentException>(() => typeof(ReflectionDerived).Should().Implement(typeof(string)));
        Assert.Throws<ArgumentException>(() => typeof(ReflectionDerived).Should().BeDerivedFrom(typeof(IDisposable)));
        Assert.Throws<ArgumentNullException>(() => typeof(ReflectionDerived).Should().HaveProperty(null!));
        Assert.Throws<ArgumentNullException>(() => typeof(ReflectionDerived).Should().HaveMethod("Transform", (Type[])null!));
        Assert.Throws<ArgumentException>(() => typeof(ReflectionDerived).Should().HaveConstructor(typeof(string), null!));
    }

    [Fact]
    public void Should_TypeAssertionsInspectMembersWithoutInvokingThem()
    {
        var type = typeof(CountingProperty).Should();

        type.HaveProperty(nameof(CountingProperty.Name));

        Assert.Equal(0, CountingProperty.ReadCount);
    }

    [Fact]
    public void Should_TypeAssertionFailuresDoNotExposeRuntimeValues()
    {
        var failure = Assert.Throws<AstraFlowAssertionException>(
            () => typeof(ReflectionBase).Should().BeSealed());

        Assert.Contains("sealed", failure.Message, StringComparison.Ordinal);
        Assert.DoesNotContain(nameof(ReflectionBase), failure.Message, StringComparison.Ordinal);
    }

    private abstract class ReflectionBase
    {
        public string BaseName => "base";
    }

    private sealed class ReflectionDerived(string name) : ReflectionBase, IDisposable
    {
        public string Name { get; } = name;

        public int Transform(int value) => value;

        public string Transform(string value) => value;

        public void Dispose()
        {
        }
    }

    private static class ReflectionHelpers
    {
        public static void Run()
        {
        }
    }

    private sealed class CountingProperty
    {
        public static int ReadCount { get; private set; }

        public string Name
        {
            get
            {
                ReadCount++;
                return "private-value";
            }
        }
    }
}
