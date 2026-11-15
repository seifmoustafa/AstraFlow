using System;
using System.Collections.Generic;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class CollectionTypeAssertionTests
{
    [Fact]
    public void AllBeAssignableToChecksInheritanceAndReturnsTypedMatches()
    {
        var first = new DerivedValue();
        var second = new DerivedValue();
        IEnumerable<object> values = new object[] { first, second };

        values.Should().AllBeAssignableTo<BaseValue>()
            .HaveCount(2)
            .Contain(first)
            .Contain(second);

        Assert.Throws<AstraFlowAssertionException>(() => new object[] { first, new OtherValue() }
            .Should().AllBeAssignableTo<BaseValue>());
    }

    [Fact]
    public void AllBeOfTypeRequiresTheExactRuntimeType()
    {
        var values = new DerivedValue[] { new(), new() };
        values.Should().AllBeOfType<DerivedValue>().HaveCount(2);

        Assert.Throws<AstraFlowAssertionException>(() => new BaseValue[] { new DerivedValue() }
            .Should().AllBeOfType<BaseValue>());
        Assert.Throws<AstraFlowAssertionException>(() => new object[] { new DerivedValue(), new OtherValue() }
            .Should().AllBeOfType<DerivedValue>());
    }

    [Fact]
    public void RuntimeTypeOverloadsSupportAssignableAndExactChecks()
    {
        var values = new object[] { new DerivedValue(), new DerivedValue() };
        var assertions = values.Should();

        Assert.Same(assertions, assertions.AllBeAssignableTo(typeof(BaseValue)));
        Assert.Same(assertions, assertions.AllBeOfType(typeof(DerivedValue)));
        Assert.Throws<AstraFlowAssertionException>(() => assertions.AllBeOfType(typeof(BaseValue)));
        Assert.Throws<AstraFlowAssertionException>(() => new object[] { new OtherValue() }
            .Should().AllBeAssignableTo(typeof(BaseValue)));
        Assert.Throws<ArgumentNullException>(() => assertions.AllBeAssignableTo((Type)null!));
        Assert.Throws<ArgumentNullException>(() => assertions.AllBeOfType((Type)null!));
    }

    [Fact]
    public void TypeAssertionsRecognizeTypesRepresentedByTypeValues()
    {
        Type[] representedTypes = { typeof(BaseValue), typeof(DerivedValue) };

        representedTypes.Should().AllBeAssignableTo<BaseValue>();
        Assert.Throws<AstraFlowAssertionException>(() => representedTypes.Should().AllBeOfType<BaseValue>());
        new Type[] { typeof(DerivedValue), typeof(DerivedValue) }.Should().AllBeOfType<DerivedValue>();
    }

    [Fact]
    public void ContainmentChecksUseAssignableTypesAndHandleEmptyAndNullItems()
    {
        object?[] values = { null, new OtherValue(), new DerivedValue() };
        var assertions = values.Should();

        Assert.Same(assertions, assertions.ContainItemsAssignableTo<BaseValue>());
        Assert.Same(assertions, assertions.ContainItemsAssignableTo(typeof(DerivedValue)));
        Assert.Same(assertions, assertions.NotContainItemsAssignableTo<UnrelatedValue>());
        Assert.Same(assertions, assertions.NotContainItemsAssignableTo(typeof(UnrelatedValue)));

        Assert.Throws<AstraFlowAssertionException>(() => values.Should().ContainItemsAssignableTo<UnrelatedValue>());
        Assert.Throws<AstraFlowAssertionException>(() => values.Should().NotContainItemsAssignableTo<BaseValue>());
        Assert.Throws<AstraFlowAssertionException>(() => Array.Empty<object>().Should().ContainItemsAssignableTo<BaseValue>());
        Array.Empty<object>().Should().NotContainItemsAssignableTo<BaseValue>();
        new object?[] { null }.Should().NotContainItemsAssignableTo<BaseValue>();

        Assert.Throws<ArgumentNullException>(() => assertions.ContainItemsAssignableTo((Type)null!));
        Assert.Throws<ArgumentNullException>(() => assertions.NotContainItemsAssignableTo((Type)null!));
    }

    [Fact]
    public void AllTypeChecksRejectNullSubjectsAndNullElementsButAcceptEmptySequences()
    {
        IEnumerable<object>? absent = null;
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().AllBeAssignableTo<BaseValue>());
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().AllBeOfType<BaseValue>());
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().AllBeAssignableTo(typeof(BaseValue)));
        Assert.Throws<AstraFlowAssertionException>(() => absent.Should().AllBeOfType(typeof(BaseValue)));

        Assert.Throws<AstraFlowAssertionException>(() => new object?[] { new DerivedValue(), null }
            .Should().AllBeAssignableTo<BaseValue>());
        Assert.Throws<AstraFlowAssertionException>(() => new object?[] { new DerivedValue(), null }
            .Should().AllBeOfType<DerivedValue>());

        Array.Empty<object>().Should().AllBeAssignableTo<BaseValue>().BeEmpty();
        Array.Empty<object>().Should().AllBeOfType<BaseValue>().BeEmpty();
        Array.Empty<object>().Should().AllBeAssignableTo(typeof(BaseValue));
        Array.Empty<object>().Should().AllBeOfType(typeof(BaseValue));

        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<object>?)null)
            .Should().ContainItemsAssignableTo<BaseValue>());
        Assert.Throws<AstraFlowAssertionException>(() => ((IEnumerable<object>?)null)
            .Should().NotContainItemsAssignableTo<BaseValue>());
    }

    [Fact]
    public void TypeAssertionsEnumerateOneShotSequencesOnceAndDisposeOnFailure()
    {
        var accepted = new OneShotEnumerable<object>(new object[] { new DerivedValue(), new DerivedValue() });
        accepted.Should().AllBeAssignableTo<BaseValue>().HaveCount(2);
        Assert.Equal(1, accepted.GetEnumeratorCalls);
        Assert.Equal(1, accepted.DisposeCalls);

        var rejected = new OneShotEnumerable<object>(new object[] { new DerivedValue(), new OtherValue() });
        Assert.Throws<AstraFlowAssertionException>(() => rejected.Should().AllBeOfType<DerivedValue>());
        Assert.Equal(1, rejected.GetEnumeratorCalls);
        Assert.Equal(1, rejected.DisposeCalls);

        var found = new OneShotEnumerable<object>(new object[] { new OtherValue(), new DerivedValue() });
        found.Should().ContainItemsAssignableTo<BaseValue>();
        Assert.Equal(1, found.GetEnumeratorCalls);
        Assert.Equal(1, found.DisposeCalls);

        var absent = new OneShotEnumerable<object>(new object[] { new OtherValue() });
        absent.Should().NotContainItemsAssignableTo<BaseValue>();
        Assert.Equal(1, absent.GetEnumeratorCalls);
        Assert.Equal(1, absent.DisposeCalls);
    }

    [Fact]
    public void TypeAssertionFailuresDoNotRenderArbitraryValues()
    {
        var failure = Assert.Throws<AstraFlowAssertionException>(() => new object[] { new SecretValue() }
            .Should().AllBeOfType<DerivedValue>());

        Assert.DoesNotContain("private marker", failure.Message, StringComparison.Ordinal);
    }

    private class BaseValue { }

    private sealed class DerivedValue : BaseValue { }

    private sealed class OtherValue { }

    private sealed class UnrelatedValue { }

    private sealed class SecretValue
    {
        public override string ToString() => "private marker";
    }
}
