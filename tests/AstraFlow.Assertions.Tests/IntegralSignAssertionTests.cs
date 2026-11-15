using System.Globalization;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class IntegralSignAssertionTests
{
    [Fact]
    public void SignedIntegralSignChecksAreStrictAtEveryBoundary()
    {
        var sbytePositive = ((sbyte)1).Should();
        var sbyteNegative = sbyte.MinValue.Should();
        Assert.Same(sbytePositive, sbytePositive.BePositive());
        Assert.Same(sbyteNegative, sbyteNegative.BeNegative());
        ((sbyte)-1).Should().BeNegative();
        sbyte.MaxValue.Should().BePositive();
        AssertSignFailures(() => ((sbyte)0).Should().BePositive(), () => ((sbyte)0).Should().BeNegative(),
            () => sbyte.MinValue.Should().BePositive(), () => sbyte.MaxValue.Should().BeNegative());

        var shortPositive = ((short)1).Should();
        var shortNegative = short.MinValue.Should();
        Assert.Same(shortPositive, shortPositive.BePositive());
        Assert.Same(shortNegative, shortNegative.BeNegative());
        ((short)-1).Should().BeNegative();
        short.MaxValue.Should().BePositive();
        AssertSignFailures(() => ((short)0).Should().BePositive(), () => ((short)0).Should().BeNegative(),
            () => short.MinValue.Should().BePositive(), () => short.MaxValue.Should().BeNegative());

        var intPositive = 1.Should();
        var intNegative = int.MinValue.Should();
        Assert.Same(intPositive, intPositive.BePositive());
        Assert.Same(intNegative, intNegative.BeNegative());
        (-1).Should().BeNegative();
        int.MaxValue.Should().BePositive();
        AssertSignFailures(() => 0.Should().BePositive(), () => 0.Should().BeNegative(),
            () => int.MinValue.Should().BePositive(), () => int.MaxValue.Should().BeNegative());

        var longPositive = 1L.Should();
        var longNegative = long.MinValue.Should();
        Assert.Same(longPositive, longPositive.BePositive());
        Assert.Same(longNegative, longNegative.BeNegative());
        (-1L).Should().BeNegative();
        long.MaxValue.Should().BePositive();
        AssertSignFailures(() => 0L.Should().BePositive(), () => 0L.Should().BeNegative(),
            () => long.MinValue.Should().BePositive(), () => long.MaxValue.Should().BeNegative());
    }

    [Fact]
    public void UnsignedIntegralPositiveChecksRetainTheirFullRangeAndNegativeChecksFail()
    {
        var bytePositive = ((byte)1).Should();
        Assert.Same(bytePositive, bytePositive.BePositive());
        byte.MaxValue.Should().BePositive();
        Assert.Throws<AstraFlowAssertionException>(() => ((byte)0).Should().BePositive());
        Assert.Throws<AstraFlowAssertionException>(() => ((byte)0).Should().BeNegative());
        Assert.Throws<AstraFlowAssertionException>(() => ((byte)1).Should().BeNegative());
        Assert.Throws<AstraFlowAssertionException>(() => byte.MaxValue.Should().BeNegative());

        var ushortPositive = ((ushort)1).Should();
        Assert.Same(ushortPositive, ushortPositive.BePositive());
        ushort.MaxValue.Should().BePositive();
        Assert.Throws<AstraFlowAssertionException>(() => ((ushort)0).Should().BePositive());
        Assert.Throws<AstraFlowAssertionException>(() => ((ushort)0).Should().BeNegative());
        Assert.Throws<AstraFlowAssertionException>(() => ((ushort)1).Should().BeNegative());
        Assert.Throws<AstraFlowAssertionException>(() => ushort.MaxValue.Should().BeNegative());

        var uintPositive = 1U.Should();
        Assert.Same(uintPositive, uintPositive.BePositive());
        uint.MaxValue.Should().BePositive();
        Assert.Throws<AstraFlowAssertionException>(() => 0U.Should().BePositive());
        Assert.Throws<AstraFlowAssertionException>(() => 0U.Should().BeNegative());
        Assert.Throws<AstraFlowAssertionException>(() => 1U.Should().BeNegative());
        Assert.Throws<AstraFlowAssertionException>(() => uint.MaxValue.Should().BeNegative());

        var ulongPositive = 1UL.Should();
        Assert.Same(ulongPositive, ulongPositive.BePositive());
        ulong.MaxValue.Should().BePositive();
        Assert.Throws<AstraFlowAssertionException>(() => 0UL.Should().BePositive());
        Assert.Throws<AstraFlowAssertionException>(() => 0UL.Should().BeNegative());
        Assert.Throws<AstraFlowAssertionException>(() => 1UL.Should().BeNegative());
        Assert.Throws<AstraFlowAssertionException>(() => ulong.MaxValue.Should().BeNegative());
    }

    [Fact]
    public void IntegralShouldOverloadsAndStaticAssertionBindingsRemainExplicit()
    {
        ObjectAssertions<sbyte> sbyteExtension = ((sbyte)1).Should();
        ObjectAssertions<sbyte> sbyteStatic = AssertionExtensions.Should((sbyte)1);
        ObjectAssertions<byte> byteExtension = ((byte)1).Should();
        ObjectAssertions<byte> byteStatic = AssertionExtensions.Should((byte)1);
        ObjectAssertions<short> shortExtension = ((short)1).Should();
        ObjectAssertions<short> shortStatic = AssertionExtensions.Should((short)1);
        ObjectAssertions<ushort> ushortExtension = ((ushort)1).Should();
        ObjectAssertions<ushort> ushortStatic = AssertionExtensions.Should((ushort)1);
        ObjectAssertions<int> intExtension = 1.Should();
        ObjectAssertions<int> intStatic = AssertionExtensions.Should(1);
        ObjectAssertions<uint> uintExtension = 1U.Should();
        ObjectAssertions<uint> uintStatic = AssertionExtensions.Should(1U);
        ObjectAssertions<long> longExtension = 1L.Should();
        ObjectAssertions<long> longStatic = AssertionExtensions.Should(1L);
        ObjectAssertions<ulong> ulongExtension = 1UL.Should();
        ObjectAssertions<ulong> ulongStatic = AssertionExtensions.Should(1UL);

        Assert.Same(sbyteExtension, NumericAssertionExtensions.BePositive(sbyteExtension));
        Assert.Same(sbyteStatic, NumericAssertionExtensions.BePositive(sbyteStatic));
        Assert.Same(byteExtension, NumericAssertionExtensions.BePositive(byteExtension));
        Assert.Same(byteStatic, NumericAssertionExtensions.BePositive(byteStatic));
        Assert.Same(shortExtension, NumericAssertionExtensions.BePositive(shortExtension));
        Assert.Same(shortStatic, NumericAssertionExtensions.BePositive(shortStatic));
        Assert.Same(ushortExtension, NumericAssertionExtensions.BePositive(ushortExtension));
        Assert.Same(ushortStatic, NumericAssertionExtensions.BePositive(ushortStatic));
        Assert.Same(intExtension, NumericAssertionExtensions.BePositive(intExtension));
        Assert.Same(intStatic, NumericAssertionExtensions.BePositive(intStatic));
        Assert.Same(uintExtension, NumericAssertionExtensions.BePositive(uintExtension));
        Assert.Same(uintStatic, NumericAssertionExtensions.BePositive(uintStatic));
        Assert.Same(longExtension, NumericAssertionExtensions.BePositive(longExtension));
        Assert.Same(longStatic, NumericAssertionExtensions.BePositive(longStatic));
        Assert.Same(ulongExtension, NumericAssertionExtensions.BePositive(ulongExtension));
        Assert.Same(ulongStatic, NumericAssertionExtensions.BePositive(ulongStatic));

        var sbyteNegative = AssertionExtensions.Should((sbyte)-1);
        var shortNegative = AssertionExtensions.Should((short)-1);
        var intNegative = AssertionExtensions.Should(-1);
        var longNegative = AssertionExtensions.Should(-1L);
        Assert.Same(sbyteNegative, NumericAssertionExtensions.BeNegative(sbyteNegative));
        Assert.Same(shortNegative, NumericAssertionExtensions.BeNegative(shortNegative));
        Assert.Same(intNegative, NumericAssertionExtensions.BeNegative(intNegative));
        Assert.Same(longNegative, NumericAssertionExtensions.BeNegative(longNegative));
        Assert.Throws<AstraFlowAssertionException>(() => NumericAssertionExtensions.BeNegative(byteStatic));
        Assert.Throws<AstraFlowAssertionException>(() => NumericAssertionExtensions.BeNegative(ushortStatic));
        Assert.Throws<AstraFlowAssertionException>(() => NumericAssertionExtensions.BeNegative(uintStatic));
        Assert.Throws<AstraFlowAssertionException>(() => NumericAssertionExtensions.BeNegative(ulongStatic));
    }

    [Fact]
    public void IntegralFailuresValidateNullReceiversAndNeverRenderValuesAcrossCultures()
    {
        ObjectAssertions<sbyte> sbyteValue = null!;
        ObjectAssertions<byte> byteValue = null!;
        ObjectAssertions<short> shortValue = null!;
        ObjectAssertions<ushort> ushortValue = null!;
        ObjectAssertions<int> intValue = null!;
        ObjectAssertions<uint> uintValue = null!;
        ObjectAssertions<long> longValue = null!;
        ObjectAssertions<ulong> ulongValue = null!;

        foreach (var action in new Action[]
        {
            () => sbyteValue.BePositive(), () => sbyteValue.BeNegative(),
            () => byteValue.BePositive(), () => byteValue.BeNegative(),
            () => shortValue.BePositive(), () => shortValue.BeNegative(),
            () => ushortValue.BePositive(), () => ushortValue.BeNegative(),
            () => intValue.BePositive(), () => intValue.BeNegative(),
            () => uintValue.BePositive(), () => uintValue.BeNegative(),
            () => longValue.BePositive(), () => longValue.BeNegative(),
            () => ulongValue.BePositive(), () => ulongValue.BeNegative()
        })
        {
            var exception = Assert.Throws<ArgumentNullException>(action);
            Assert.Equal("assertions", exception.ParamName);
        }

        var originalCulture = CultureInfo.CurrentCulture;
        try
        {
            foreach (var cultureName in new[] { "en-US", "fr-FR" })
            {
                CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo(cultureName);
                AssertPrivate(() => ((sbyte)-97).Should().BePositive(), "-97");
                AssertPrivate(() => ((sbyte)97).Should().BeNegative(), "97");
                AssertPrivate(() => ((byte)253).Should().BeNegative(), "253");
                AssertPrivate(() => ((short)-30001).Should().BePositive(), "-30001");
                AssertPrivate(() => ((short)30001).Should().BeNegative(), "30001");
                AssertPrivate(() => ((ushort)65001).Should().BeNegative(), "65001");
                AssertPrivate(() => (-2000000001).Should().BePositive(), "-2000000001");
                AssertPrivate(() => 2000000001.Should().BeNegative(), "2000000001");
                AssertPrivate(() => 4000000001U.Should().BeNegative(), "4000000001");
                AssertPrivate(() => (-8000000000000000001L).Should().BePositive(), "-8000000000000000001");
                AssertPrivate(() => 8000000000000000001L.Should().BeNegative(), "8000000000000000001");
                AssertPrivate(() => ulong.MaxValue.Should().BeNegative(), ulong.MaxValue.ToString(CultureInfo.CurrentCulture));
            }
        }
        finally
        {
            CultureInfo.CurrentCulture = originalCulture;
        }
    }

    private static void AssertSignFailures(params Action[] actions)
    {
        foreach (var action in actions)
        {
            Assert.Throws<AstraFlowAssertionException>(action);
        }
    }

    private static void AssertPrivate(Action action, string value)
    {
        var exception = Assert.Throws<AstraFlowAssertionException>(action);
        Assert.DoesNotContain(value, exception.Message);
    }
}
