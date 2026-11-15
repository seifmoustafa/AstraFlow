using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class NumericPrecisionTests
{
    [Fact]
    public void NumericPrecision_BaselineShouldBindsToObjectAssertions()
    {
        ObjectAssertions<float> f = 1f.Should();
        ObjectAssertions<double> d = 1d.Should();
        ObjectAssertions<decimal> m = 1m.Should();
        ObjectAssertions<float> sf = AssertionExtensions.Should(1f);
        ObjectAssertions<double> sd = AssertionExtensions.Should(1d);
        ObjectAssertions<decimal> sm = AssertionExtensions.Should(1m);
        f.BeInRange(0f, 2f); d.BeInRange(0d, 2d); m.BeInRange(0m, 2m);
        sf.BeInRange(0f, 2f); sd.BeInRange(0d, 2d); sm.BeInRange(0m, 2m);
    }

    [Fact]
    public void Approximation_InclusiveFiniteBoundary()
    {
        foreach (var x in new[] { 1d, 1.25d, 1.5d }) { x.Should().BeApproximately(1d, .5d); Assert.Throws<AstraFlowAssertionException>(() => x.Should().NotBeApproximately(1d, .5d)); }
        1.75d.Should().NotBeApproximately(1d, .5d);
        foreach (var x in new[] { 1f, 1.25f, 1.5f }) { x.Should().BeApproximately(1f, .5f); Assert.Throws<AstraFlowAssertionException>(() => x.Should().NotBeApproximately(1f, .5f)); }
        1.75f.Should().NotBeApproximately(1f, .5f);
        foreach (var x in new[] { 1m, 1.25m, 1.5m }) { x.Should().BeApproximately(1m, .5m); Assert.Throws<AstraFlowAssertionException>(() => x.Should().NotBeApproximately(1m, .5m)); }
        1.75m.Should().NotBeApproximately(1m, .5m);
        (-0d).Should().BeApproximately(0d, -0d); double.Epsilon.Should().BeApproximately(0d, double.Epsilon);
        (-0f).Should().BeApproximately(0f, -0f); float.Epsilon.Should().BeApproximately(0f, float.Epsilon);
    }

    [Fact]
    public void Approximation_NaNOperandsAndInvalidTolerancePrecedence()
    {
        foreach (var pair in new[] { (double.NaN, 1d), (1d, double.NaN), (double.NaN, double.NaN) }) {
            Assert.Throws<AstraFlowAssertionException>(() => pair.Item1.Should().BeApproximately(pair.Item2, 0d));
            pair.Item1.Should().NotBeApproximately(pair.Item2, 0d);
            AssertInvalidTolerance(() => pair.Item1.Should().BeApproximately(pair.Item2, double.NaN));
            AssertInvalidTolerance(() => pair.Item1.Should().NotBeApproximately(pair.Item2, -1d));
        }
        foreach (var pair in new[] { (float.NaN, 1f), (1f, float.NaN), (float.NaN, float.NaN) }) {
            Assert.Throws<AstraFlowAssertionException>(() => pair.Item1.Should().BeApproximately(pair.Item2, 0f)); pair.Item1.Should().NotBeApproximately(pair.Item2, 0f);
            AssertInvalidTolerance(() => pair.Item1.Should().BeApproximately(pair.Item2, float.NaN));
            AssertInvalidTolerance(() => pair.Item1.Should().NotBeApproximately(pair.Item2, -1f));
        }
    }

    [Fact]
    public void Approximation_FloatingToleranceRejectsNaNAndInfinities()
    {
        foreach (var t in new[] { double.NaN, -1d, double.PositiveInfinity, double.NegativeInfinity }) {
            AssertInvalidTolerance(() => 1d.Should().BeApproximately(2d, t));
            AssertInvalidTolerance(() => 1d.Should().NotBeApproximately(2d, t));
        }
        foreach (var t in new[] { float.NaN, -1f, float.PositiveInfinity, float.NegativeInfinity }) {
            AssertInvalidTolerance(() => 1f.Should().BeApproximately(2f, t));
            AssertInvalidTolerance(() => 1f.Should().NotBeApproximately(2f, t));
        }
        AssertInvalidTolerance(() => 1m.Should().BeApproximately(2m, -1m));
        AssertInvalidTolerance(() => 1m.Should().NotBeApproximately(2m, -1m));
    }

    [Fact]
    public void Approximation_SignedInfinitiesAndOverflow()
    {
        foreach (var x in new[] { double.PositiveInfinity, double.NegativeInfinity }) x.Should().BeApproximately(x, 0d);
        foreach (var p in new[] { (double.PositiveInfinity, double.NegativeInfinity), (double.NegativeInfinity, double.PositiveInfinity), (double.PositiveInfinity, 0d), (0d, double.PositiveInfinity), (double.NegativeInfinity, 0d), (0d, double.NegativeInfinity), (double.MaxValue, -double.MaxValue), (-double.MaxValue, double.MaxValue) }) { Assert.Throws<AstraFlowAssertionException>(() => p.Item1.Should().BeApproximately(p.Item2, double.MaxValue)); p.Item1.Should().NotBeApproximately(p.Item2, double.MaxValue); }
        foreach (var x in new[] { double.PositiveInfinity, double.NegativeInfinity }) Assert.Throws<AstraFlowAssertionException>(() => x.Should().NotBeApproximately(x, 0d));
        foreach (var x in new[] { float.PositiveInfinity, float.NegativeInfinity }) x.Should().BeApproximately(x, 0f);
        foreach (var p in new[] { (float.PositiveInfinity, float.NegativeInfinity), (float.NegativeInfinity, float.PositiveInfinity), (float.PositiveInfinity, 0f), (0f, float.PositiveInfinity), (float.NegativeInfinity, 0f), (0f, float.NegativeInfinity), (float.MaxValue, -float.MaxValue), (-float.MaxValue, float.MaxValue) }) { Assert.Throws<AstraFlowAssertionException>(() => p.Item1.Should().BeApproximately(p.Item2, float.MaxValue)); p.Item1.Should().NotBeApproximately(p.Item2, float.MaxValue); }
        foreach (var x in new[] { float.PositiveInfinity, float.NegativeInfinity }) Assert.Throws<AstraFlowAssertionException>(() => x.Should().NotBeApproximately(x, 0f));
        Assert.Throws<AstraFlowAssertionException>(() => 10d.Should().BeApproximately(12d, 1d));
        Assert.Throws<AstraFlowAssertionException>(() => 10f.Should().BeApproximately(12f, 1f));
    }

    [Fact]
    public void Approximation_DecimalOverflowIsOutsideTolerance()
    {
        Assert.Throws<AstraFlowAssertionException>(() => 10m.Should().BeApproximately(12m, 1m));
        foreach (var p in new[] { (decimal.MaxValue, decimal.MinValue), (decimal.MinValue, decimal.MaxValue) }) { Assert.Throws<AstraFlowAssertionException>(() => p.Item1.Should().BeApproximately(p.Item2, decimal.MaxValue)); p.Item1.Should().NotBeApproximately(p.Item2, decimal.MaxValue); }
        decimal.MaxValue.Should().BeApproximately(0m, decimal.MaxValue); 0m.Should().BeApproximately(decimal.MinValue, decimal.MaxValue);
        decimal.MaxValue.Should().BeApproximately(decimal.MaxValue - 1m, 1m);
    }
    [Fact]
    public void Approximation_DecimalRoundingCanLandOnInclusiveBoundary()
    {
        foreach (var p in new[] { (decimal.MaxValue, -0.1m), (-0.1m, decimal.MaxValue), (decimal.MinValue, 0.1m), (0.1m, decimal.MinValue) }) { p.Item1.Should().BeApproximately(p.Item2, decimal.MaxValue); Assert.Throws<AstraFlowAssertionException>(() => p.Item1.Should().NotBeApproximately(p.Item2, decimal.MaxValue)); }
    }
    [Fact]
    public void NaNPredicates_RejectOrAcceptNaNAndInfinity()
    {
        double.NaN.Should().BeNaN(); float.NaN.Should().BeNaN();
        Assert.Throws<AstraFlowAssertionException>(() => double.NaN.Should().NotBeNaN()); Assert.Throws<AstraFlowAssertionException>(() => float.NaN.Should().NotBeNaN());
        foreach (var x in new[] { 1d, double.PositiveInfinity, double.NegativeInfinity }) { x.Should().NotBeNaN(); Assert.Throws<AstraFlowAssertionException>(() => x.Should().BeNaN()); }
        foreach (var x in new[] { 1f, float.PositiveInfinity, float.NegativeInfinity }) { x.Should().NotBeNaN(); Assert.Throws<AstraFlowAssertionException>(() => x.Should().BeNaN()); }
    }
    [Fact]
    public void FinitePredicates_OmitNaNAndInfinities()
    {
        1d.Should().BeFinite(); 1f.Should().BeFinite();
        foreach (var x in new[] { double.NaN, double.PositiveInfinity, double.NegativeInfinity }) Assert.Throws<AstraFlowAssertionException>(() => x.Should().BeFinite());
        foreach (var x in new[] { float.NaN, float.PositiveInfinity, float.NegativeInfinity }) Assert.Throws<AstraFlowAssertionException>(() => x.Should().BeFinite());
    }
    [Fact]
    public void NumericPrecision_NullWrapperAndSameFluentResult()
    {
        ObjectAssertions<double> d = 1d.Should(); ObjectAssertions<float> f = 1f.Should(); ObjectAssertions<decimal> m = 1m.Should();
        Assert.Same(d, d.BeApproximately(1d, 0d)); Assert.Same(d, d.NotBeApproximately(2d, 0d)); Assert.Same(d, d.NotBeNaN()); Assert.Same(d, d.BeFinite()); var dn = double.NaN.Should(); Assert.Same(dn, dn.BeNaN()); var fn = float.NaN.Should(); Assert.Same(fn, fn.BeNaN());
        Assert.Same(f, f.BeApproximately(1f, 0f)); Assert.Same(f, f.NotBeApproximately(2f, 0f)); Assert.Same(f, f.NotBeNaN()); Assert.Same(f, f.BeFinite());
        Assert.Same(m, m.BeApproximately(1m, 0m)); Assert.Same(m, m.NotBeApproximately(2m, 0m));
        Assert.Throws<ArgumentNullException>(() => NumericAssertionExtensions.BeApproximately((ObjectAssertions<double>)null!, 1d, -1d));
    }
    [Fact]
    public void NumericPrecision_NullGuardsAndPrivateMessages()
    {
        ObjectAssertions<double> d = null!; ObjectAssertions<float> f = null!; ObjectAssertions<decimal> m = null!;
        Assert.Throws<ArgumentNullException>(() => d.BeApproximately(0d, -1d)); Assert.Throws<ArgumentNullException>(() => d.NotBeApproximately(0d, -1d));
        Assert.Throws<ArgumentNullException>(() => f.BeApproximately(0f, -1f)); Assert.Throws<ArgumentNullException>(() => f.NotBeApproximately(0f, -1f));
        Assert.Throws<ArgumentNullException>(() => m.BeApproximately(0m, -1m)); Assert.Throws<ArgumentNullException>(() => m.NotBeApproximately(0m, -1m));
        Assert.Throws<ArgumentNullException>(() => d.BeNaN()); Assert.Throws<ArgumentNullException>(() => d.NotBeNaN()); Assert.Throws<ArgumentNullException>(() => d.BeFinite());
        Assert.Throws<ArgumentNullException>(() => f.BeNaN()); Assert.Throws<ArgumentNullException>(() => f.NotBeNaN()); Assert.Throws<ArgumentNullException>(() => f.BeFinite());
        var original = System.Globalization.CultureInfo.CurrentCulture;
        try {
            foreach (var culture in new[] { "en-US", "fr-FR" }) {
                System.Globalization.CultureInfo.CurrentCulture = System.Globalization.CultureInfo.GetCultureInfo(culture);
                AssertPrivacyMessage(() => 12345.5d.Should().BeApproximately(67890.5d, 0.125d), "12345.5", "67890.5", "0.125");
                AssertPrivacyMessage(() => 12345.5d.Should().NotBeApproximately(12345.75d, 1.25d), "12345.5", "12345.75", "1.25");
                AssertPrivacyMessage(() => 12345.5f.Should().BeApproximately(67890.5f, 0.125f), "12345.5", "67890.5", "0.125");
                AssertPrivacyMessage(() => 12345.5f.Should().NotBeApproximately(12345.75f, 1.25f), "12345.5", "12345.75", "1.25");
                AssertPrivacyMessage(() => 12345.5m.Should().BeApproximately(67890.5m, 0.125m), "12345.5", "67890.5", "0.125");
                AssertPrivacyMessage(() => 12345.5m.Should().NotBeApproximately(12345.75m, 1.25m), "12345.5", "12345.75", "1.25");
            }
        } finally { System.Globalization.CultureInfo.CurrentCulture = original; }
    }

    private static void AssertInvalidTolerance(Action assertion)
    {
        var exception = Assert.Throws<ArgumentOutOfRangeException>(assertion);
        Assert.Equal("absoluteTolerance", exception.ParamName);
        Assert.Null(exception.ActualValue);
    }

    private static void AssertPrivacyMessage(Action assertion, params string[] values)
    {
        var exception = Assert.Throws<AstraFlowAssertionException>(assertion);
        foreach (var value in values) {
            Assert.DoesNotContain(value, exception.Message);
            Assert.DoesNotContain(value.Replace(".", System.Globalization.CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator, StringComparison.Ordinal), exception.Message);
        }
    }

}
