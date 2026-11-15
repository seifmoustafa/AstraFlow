using System.Globalization;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class FloatingDecimalSignAssertionTests
{
    [Fact]
    public void FloatingPointSignChecksRejectZeroAndNaNAndAcceptMatchingInfinities()
    {
        var positiveFloat = float.Epsilon.Should();
        var negativeFloat = float.NegativeInfinity.Should();
        Assert.Same(positiveFloat, positiveFloat.BePositive());
        Assert.Same(negativeFloat, negativeFloat.BeNegative());
        float.MaxValue.Should().BePositive();
        float.PositiveInfinity.Should().BePositive();
        (-float.Epsilon).Should().BeNegative();
        (-float.MaxValue).Should().BeNegative();

        var positiveDouble = double.Epsilon.Should();
        var negativeDouble = double.NegativeInfinity.Should();
        Assert.Same(positiveDouble, positiveDouble.BePositive());
        Assert.Same(negativeDouble, negativeDouble.BeNegative());
        double.MaxValue.Should().BePositive();
        double.PositiveInfinity.Should().BePositive();
        (-double.Epsilon).Should().BeNegative();
        (-double.MaxValue).Should().BeNegative();

        AssertSignFailures(
            () => 0.0f.Should().BePositive(),
            () => (-0.0f).Should().BeNegative(),
            () => float.NaN.Should().BePositive(),
            () => float.NaN.Should().BeNegative(),
            () => float.NegativeInfinity.Should().BePositive(),
            () => float.PositiveInfinity.Should().BeNegative(),
            () => 0.0.Should().BePositive(),
            () => (-0.0).Should().BeNegative(),
            () => double.NaN.Should().BePositive(),
            () => double.NaN.Should().BeNegative(),
            () => double.NegativeInfinity.Should().BePositive(),
            () => double.PositiveInfinity.Should().BeNegative());
    }

    [Fact]
    public void DecimalSignChecksAreStrictAndCoverTheFullRange()
    {
        var positive = decimal.MaxValue.Should();
        var negative = decimal.MinValue.Should();
        Assert.Same(positive, positive.BePositive());
        Assert.Same(negative, negative.BeNegative());
        0.0000000000000000000000000001m.Should().BePositive();
        (-0.0000000000000000000000000001m).Should().BeNegative();

        AssertSignFailures(
            () => 0m.Should().BePositive(),
            () => 0m.Should().BeNegative(),
            () => decimal.MinValue.Should().BePositive(),
            () => decimal.MaxValue.Should().BeNegative());
    }

    [Fact]
    public void FloatingAndDecimalSignMethodsRetainTypedShouldBindingsAndWrapperIdentity()
    {
        ObjectAssertions<float> floatExtension = 1.0f.Should();
        ObjectAssertions<float> floatStatic = AssertionExtensions.Should(1.0f);
        ObjectAssertions<double> doubleExtension = 1.0.Should();
        ObjectAssertions<double> doubleStatic = AssertionExtensions.Should(1.0);
        ObjectAssertions<decimal> decimalExtension = 1m.Should();
        ObjectAssertions<decimal> decimalStatic = AssertionExtensions.Should(1m);

        Assert.Same(floatExtension, NumericAssertionExtensions.BePositive(floatExtension));
        Assert.Same(floatStatic, NumericAssertionExtensions.BePositive(floatStatic));
        Assert.Same(doubleExtension, NumericAssertionExtensions.BePositive(doubleExtension));
        Assert.Same(doubleStatic, NumericAssertionExtensions.BePositive(doubleStatic));
        Assert.Same(decimalExtension, NumericAssertionExtensions.BePositive(decimalExtension));
        Assert.Same(decimalStatic, NumericAssertionExtensions.BePositive(decimalStatic));

        var floatNegative = AssertionExtensions.Should(-1.0f);
        var doubleNegative = AssertionExtensions.Should(-1.0);
        var decimalNegative = AssertionExtensions.Should(-1m);
        Assert.Same(floatNegative, NumericAssertionExtensions.BeNegative(floatNegative));
        Assert.Same(doubleNegative, NumericAssertionExtensions.BeNegative(doubleNegative));
        Assert.Same(decimalNegative, NumericAssertionExtensions.BeNegative(decimalNegative));
    }

    [Fact]
    public void FloatingAndDecimalSignMethodsValidateNullReceiversAndOmitValues()
    {
        ObjectAssertions<float> floatValue = null!;
        ObjectAssertions<double> doubleValue = null!;
        ObjectAssertions<decimal> decimalValue = null!;

        foreach (var action in new Action[]
        {
            () => floatValue.BePositive(), () => floatValue.BeNegative(),
            () => doubleValue.BePositive(), () => doubleValue.BeNegative(),
            () => decimalValue.BePositive(), () => decimalValue.BeNegative()
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
                AssertPrivate(() => (-123.5f).Should().BePositive(), (-123.5f).ToString(CultureInfo.CurrentCulture));
                AssertPrivate(() => 123.5f.Should().BeNegative(), 123.5f.ToString(CultureInfo.CurrentCulture));
                AssertPrivate(() => (-123.5).Should().BePositive(), (-123.5).ToString(CultureInfo.CurrentCulture));
                AssertPrivate(() => 123.5.Should().BeNegative(), 123.5.ToString(CultureInfo.CurrentCulture));
                AssertPrivate(() => (-123.5m).Should().BePositive(), (-123.5m).ToString(CultureInfo.CurrentCulture));
                AssertPrivate(() => 123.5m.Should().BeNegative(), 123.5m.ToString(CultureInfo.CurrentCulture));
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
