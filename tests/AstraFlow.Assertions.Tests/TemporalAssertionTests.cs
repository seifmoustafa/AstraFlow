using System.Globalization;
using AstraFlow.Assertions;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class TemporalAssertionTests
{
    [Fact]
    public void BindingsAndFluentIdentity()
    {
        ObjectAssertions<DateTime> d = DateTime.MinValue.Should();
        ObjectAssertions<DateTimeOffset> o = DateTimeOffset.MinValue.Should();
        ObjectAssertions<TimeSpan> s = TimeSpan.FromTicks(1).Should();
        ObjectAssertions<DateOnly> day = DateOnly.MinValue.Should();
        ObjectAssertions<TimeOnly> time = TimeOnly.MinValue.Should();
        Assert.IsType<ObjectAssertions<DateTime>>(AssertionExtensions.Should(DateTime.MinValue));
        Assert.IsType<ObjectAssertions<DateTimeOffset>>(AssertionExtensions.Should(DateTimeOffset.MinValue));
        Assert.IsType<ObjectAssertions<TimeSpan>>(AssertionExtensions.Should(TimeSpan.Zero));
        Assert.IsType<ObjectAssertions<DateOnly>>(AssertionExtensions.Should(DateOnly.MinValue));
        Assert.IsType<ObjectAssertions<TimeOnly>>(AssertionExtensions.Should(TimeOnly.MinValue));
        Assert.Same(d, d.BeBefore(DateTime.MaxValue).BeCloseTo(DateTime.MinValue, TimeSpan.Zero).HaveKind(DateTimeKind.Unspecified));
        var maxDate = DateTime.MaxValue.Should(); Assert.Same(maxDate, maxDate.BeAfter(DateTime.MinValue));
        Assert.Same(o, o.BeBefore(DateTimeOffset.MaxValue).BeCloseTo(DateTimeOffset.MinValue, TimeSpan.Zero).HaveOffset(TimeSpan.Zero));
        var max = DateTimeOffset.MaxValue.Should(); Assert.Same(max, max.BeAfter(DateTimeOffset.MinValue));
        Assert.Same(s, s.BePositive().BeCloseTo(TimeSpan.Zero, TimeSpan.FromTicks(1)));
        var negative = TimeSpan.FromTicks(-1).Should(); Assert.Same(negative, negative.BeNegative());
        Assert.Same(day, day.BeBefore(DateOnly.MaxValue).BeCloseTo(DateOnly.MinValue, 0));
        var lastDay = DateOnly.MaxValue.Should(); Assert.Same(lastDay, lastDay.BeAfter(DateOnly.MinValue));
        Assert.Same(time, time.BeBefore(TimeOnly.MaxValue).BeCloseTo(TimeOnly.MinValue, TimeSpan.Zero));
        var lastTime = TimeOnly.MaxValue.Should(); Assert.Same(lastTime, lastTime.BeAfter(TimeOnly.MinValue));
    }

    [Fact]
    public void DateTimeUsesTicksAndKindSeparately()
    {
        var utc = new DateTime(2024, 3, 10, 2, 30, 0, DateTimeKind.Utc);
        var local = DateTime.SpecifyKind(utc, DateTimeKind.Local);
        utc.Should().BeCloseTo(local, TimeSpan.Zero).HaveKind(DateTimeKind.Utc);
        Assert.Throws<AstraFlowAssertionException>(() => utc.Should().BeBefore(local));
        Assert.Throws<AstraFlowAssertionException>(() => utc.Should().BeAfter(local));
        Assert.Throws<AstraFlowAssertionException>(() => utc.Should().HaveKind(DateTimeKind.Local));
        utc.AddTicks(1).Should().BeAfter(local); utc.AddTicks(-1).Should().BeBefore(local);
        utc.AddTicks(1).Should().BeCloseTo(local, TimeSpan.FromTicks(1));
        Assert.Throws<AstraFlowAssertionException>(() => utc.AddTicks(2).Should().BeCloseTo(local, TimeSpan.FromTicks(1)));
        DateTime.MinValue.Should().BeCloseTo(DateTime.MaxValue, TimeSpan.MaxValue);
        DateTime.MaxValue.Should().BeCloseTo(DateTime.MinValue, TimeSpan.MaxValue);
        DateTime.MinValue.Should().BeCloseTo(DateTime.MinValue.AddTicks(1), TimeSpan.FromTicks(1));
        Assert.Throws<AstraFlowAssertionException>(() => DateTime.MaxValue.Should().BeCloseTo(DateTime.MaxValue.AddTicks(-2), TimeSpan.FromTicks(1)));
    }

    [Fact]
    public void OffsetComparesUtcInstantsAndStoredOffset()
    {
        var instant = new DateTimeOffset(2024, 3, 10, 7, 30, 0, TimeSpan.Zero);
        var shifted = instant.ToOffset(TimeSpan.FromHours(-5));
        shifted.Should().BeCloseTo(instant, TimeSpan.Zero).HaveOffset(TimeSpan.FromHours(-5));
        Assert.Throws<AstraFlowAssertionException>(() => shifted.Should().BeBefore(instant));
        Assert.Throws<AstraFlowAssertionException>(() => shifted.Should().BeAfter(instant));
        Assert.Throws<AstraFlowAssertionException>(() => shifted.Should().HaveOffset(TimeSpan.Zero));
        shifted.AddTicks(-1).Should().BeBefore(instant); shifted.AddTicks(1).Should().BeAfter(instant);
        shifted.AddTicks(1).Should().BeCloseTo(instant, TimeSpan.FromTicks(1));
        Assert.Throws<AstraFlowAssertionException>(() => shifted.AddTicks(2).Should().BeCloseTo(instant, TimeSpan.FromTicks(1)));
        DateTimeOffset.MinValue.Should().BeCloseTo(DateTimeOffset.MaxValue, TimeSpan.MaxValue);
        DateTimeOffset.MaxValue.Should().BeCloseTo(DateTimeOffset.MinValue, TimeSpan.MaxValue);
        var nearMin = DateTimeOffset.MinValue.ToOffset(TimeSpan.FromHours(14));
        nearMin.Should().BeCloseTo(DateTimeOffset.MinValue, TimeSpan.Zero);
        var nearMax = DateTimeOffset.MaxValue.ToOffset(TimeSpan.FromHours(-14));
        nearMax.Should().BeCloseTo(DateTimeOffset.MaxValue, TimeSpan.Zero);
        nearMin.Should().BeCloseTo(DateTimeOffset.MinValue.AddTicks(1), TimeSpan.FromTicks(1));
        Assert.Throws<AstraFlowAssertionException>(() => nearMax.Should().BeCloseTo(DateTimeOffset.MaxValue.AddTicks(-2), TimeSpan.FromTicks(1)));
    }

    [Fact]
    public void DurationsCoverFullRangeAndInclusivePrecision()
    {
        TimeSpan.Zero.Should().BeCloseTo(TimeSpan.MaxValue, TimeSpan.MaxValue);
        TimeSpan.MinValue.Should().BeCloseTo(TimeSpan.FromTicks(-1), TimeSpan.MaxValue);
        TimeSpan.FromTicks(-1).Should().BeCloseTo(TimeSpan.MinValue, TimeSpan.MaxValue);
        Assert.Throws<AstraFlowAssertionException>(() => TimeSpan.MinValue.Should().BeCloseTo(TimeSpan.Zero, TimeSpan.MaxValue));
        Assert.Throws<AstraFlowAssertionException>(() => TimeSpan.MaxValue.Should().BeCloseTo(TimeSpan.MinValue, TimeSpan.MaxValue));
        Assert.Throws<AstraFlowAssertionException>(() => TimeSpan.MinValue.Should().BeCloseTo(TimeSpan.MaxValue, TimeSpan.MaxValue));
        Assert.Throws<AstraFlowAssertionException>(() => TimeSpan.Zero.Should().BePositive());
        Assert.Throws<AstraFlowAssertionException>(() => TimeSpan.Zero.Should().BeNegative());
        Assert.Throws<AstraFlowAssertionException>(() => TimeSpan.FromTicks(-1).Should().BePositive());
        Assert.Throws<AstraFlowAssertionException>(() => TimeSpan.FromTicks(1).Should().BeNegative());
    }

    [Fact]
    public void ModernDatesAndTimesAreLinear()
    {
        var leap = new DateOnly(2024, 2, 29);
        leap.Should().BeCloseTo(new DateOnly(2024, 3, 1), 1).BeAfter(new DateOnly(2024, 2, 28));
        Assert.Throws<AstraFlowAssertionException>(() => leap.Should().BeCloseTo(new DateOnly(2024, 3, 2), 1));
        DateOnly.MinValue.Should().BeCloseTo(DateOnly.MaxValue, int.MaxValue);
        DateOnly.MaxValue.Should().BeCloseTo(DateOnly.MinValue, int.MaxValue);
        Assert.Throws<AstraFlowAssertionException>(() => leap.Should().BeBefore(leap));
        Assert.Throws<AstraFlowAssertionException>(() => leap.Should().BeAfter(leap));
        TimeOnly.MinValue.Should().BeBefore(TimeOnly.MaxValue).BeCloseTo(TimeOnly.MaxValue, TimeSpan.FromTicks(TimeOnly.MaxValue.Ticks));
        TimeOnly.MaxValue.Should().BeAfter(TimeOnly.MinValue).BeCloseTo(TimeOnly.MinValue, TimeSpan.MaxValue);
        Assert.Throws<AstraFlowAssertionException>(() => TimeOnly.MinValue.Should().BeCloseTo(TimeOnly.MaxValue, TimeSpan.FromTicks(1)));
        Assert.Throws<AstraFlowAssertionException>(() => TimeOnly.MaxValue.Should().BeCloseTo(TimeOnly.MinValue, TimeSpan.FromTicks(TimeOnly.MaxValue.Ticks - 1)));
        Assert.Throws<AstraFlowAssertionException>(() => TimeOnly.MinValue.Should().BeBefore(TimeOnly.MinValue));
        Assert.Throws<AstraFlowAssertionException>(() => TimeOnly.MinValue.Should().BeAfter(TimeOnly.MinValue));
        new TimeOnly(0, 0, 0).Add(TimeSpan.FromTicks(1)).Should().BeCloseTo(TimeOnly.MinValue, TimeSpan.FromTicks(1));
    }

    [Fact]
    public void InvalidArgumentsAndNullReceiversAreSafe()
    {
        static void Invalid(Action action, string name) { var e = Assert.Throws<ArgumentOutOfRangeException>(action); Assert.Equal(name, e.ParamName); Assert.Null(e.ActualValue); }
        Invalid(() => DateTime.MinValue.Should().BeCloseTo(DateTime.MaxValue, TimeSpan.MinValue), "precision");
        Invalid(() => DateTimeOffset.MinValue.Should().BeCloseTo(DateTimeOffset.MaxValue, TimeSpan.MinValue), "precision");
        Invalid(() => TimeSpan.Zero.Should().BeCloseTo(TimeSpan.Zero, TimeSpan.MinValue), "precision");
        Invalid(() => TimeOnly.MinValue.Should().BeCloseTo(TimeOnly.MaxValue, TimeSpan.MinValue), "precision");
        Invalid(() => DateOnly.MinValue.Should().BeCloseTo(DateOnly.MaxValue, -1), "precisionInDays");
        Invalid(() => DateTime.MinValue.Should().HaveKind((DateTimeKind)(-1)), "expected");
        Invalid(() => DateTime.MinValue.Should().HaveKind((DateTimeKind)3), "expected");
        foreach (var offset in new[] { TimeSpan.FromTicks(1), TimeSpan.FromTicks(-1), TimeSpan.FromMinutes(841), TimeSpan.FromMinutes(-841), TimeSpan.MaxValue, TimeSpan.MinValue })
            Invalid(() => DateTimeOffset.MinValue.Should().HaveOffset(offset), "expected");
        DateTimeOffset.MinValue.ToOffset(TimeSpan.FromHours(14)).Should().HaveOffset(TimeSpan.FromHours(14));
        DateTimeOffset.MaxValue.ToOffset(TimeSpan.FromHours(-14)).Should().HaveOffset(TimeSpan.FromHours(-14));
        ObjectAssertions<DateTime> d = null!; ObjectAssertions<DateTimeOffset> o = null!; ObjectAssertions<TimeSpan> s = null!;
        ObjectAssertions<DateOnly> day = null!; ObjectAssertions<TimeOnly> time = null!;
        foreach (Action action in new Action[] { () => d.BeBefore(default), () => d.BeAfter(default), () => d.BeCloseTo(default, TimeSpan.MinValue), () => d.HaveKind((DateTimeKind)3), () => o.BeBefore(default), () => o.BeAfter(default), () => o.BeCloseTo(default, TimeSpan.MinValue), () => o.HaveOffset(TimeSpan.MaxValue), () => s.BeCloseTo(default, TimeSpan.MinValue), () => s.BePositive(), () => s.BeNegative(), () => day.BeBefore(default), () => day.BeAfter(default), () => day.BeCloseTo(default, -1), () => time.BeBefore(default), () => time.BeAfter(default), () => time.BeCloseTo(default, TimeSpan.MinValue) })
            Assert.Equal("assertions", Assert.Throws<ArgumentNullException>(action).ParamName);
    }

    [Fact]
    public void FailureMessagesDoNotDiscloseValues()
    {
        var original = CultureInfo.CurrentCulture;
        try
        {
            foreach (var culture in new[] { "en-US", "fr-FR" })
            {
                CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo(culture);
                foreach (Action action in new Action[] {
                    () => new DateTime(123456789).Should().BeCloseTo(new DateTime(987654321), TimeSpan.FromTicks(42)),
                    () => new DateTimeOffset(new DateTime(123456789), TimeSpan.Zero).Should().BeCloseTo(new DateTimeOffset(new DateTime(987654321), TimeSpan.Zero), TimeSpan.FromTicks(42)),
                    () => TimeSpan.FromTicks(123456789).Should().BeCloseTo(TimeSpan.FromTicks(987654321), TimeSpan.FromTicks(42)),
                    () => new DateOnly(2024, 2, 29).Should().BeCloseTo(new DateOnly(2025, 3, 1), 42),
                    () => new TimeOnly(123456789).Should().BeCloseTo(new TimeOnly(987654321), TimeSpan.FromTicks(42)) })
                {
                    var message = Assert.Throws<AstraFlowAssertionException>(action).Message;
                    Assert.DoesNotContain("123456789", message); Assert.DoesNotContain("987654321", message); Assert.DoesNotContain("42", message);
                }
            }
        }
        finally { CultureInfo.CurrentCulture = original; }
    }
}
