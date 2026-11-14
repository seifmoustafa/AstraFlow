using System;
using Xunit;

namespace AstraFlow.Assertions.Tests;

public sealed class NullableValueAssertionTests
{
    [Fact]
    public void NullableValues_SupportNullAndPresentValueChecks()
    {
        int? missing = null;
        int? present = 4;

        var missingAssertions = missing.Should();
        var presentAssertions = present.Should();

        Assert.Same(missingAssertions, missingAssertions.BeNull().NotHaveValue());
        Assert.Same(presentAssertions, presentAssertions.NotBeNull().HaveValue().Be(4).NotBe(5));
        Assert.Equal(4, present.Should().Which);

        Assert.Throws<AstraFlowAssertionException>(() => missing.Should().NotBeNull());
        Assert.Throws<AstraFlowAssertionException>(() => present.Should().BeNull());
        Assert.Throws<AstraFlowAssertionException>(() => present.Should().Which.Should().Be(5));
    }

    [Fact]
    public void NullableValues_SupportComparisonRangesAndMembership()
    {
        int? value = 5;

        value.Should()
            .BeGreaterThan(4)
            .BeGreaterThanOrEqualTo(5)
            .BeLessThan(6)
            .BeLessThanOrEqualTo(5)
            .BeInRange(4, 6)
            .BeOneOf(2, 5, 8)
            .NotBeOneOf(1, 3, 7);

        Assert.Throws<AstraFlowAssertionException>(() => ((int?)null).Should().BeGreaterThan(0));
        Assert.Throws<AstraFlowAssertionException>(() => value.Should().BeLessThan(5));
        Assert.Throws<ArgumentException>(() => value.Should().BeInRange(6, 4));
        Assert.Throws<AstraFlowAssertionException>(() => ((int?)null).Should().BeOneOf(1));
        ((int?)null).Should().NotBeOneOf(1, 2);
    }

    [Fact]
    public void NullableValues_SupportDateAndGuidValues()
    {
        DateTime? date = new DateTime(2026, 11, 14, 0, 0, 0, DateTimeKind.Utc);
        Guid expectedId = Guid.NewGuid();
        Guid? id = expectedId;
        Guid? missingId = null;

        date.Should().BeGreaterThan(new DateTime(2026, 11, 13, 0, 0, 0, DateTimeKind.Utc));
        date.Should().BeInRange(date.Value, date.Value);
        id.Should().Be(expectedId).NotBe(Guid.Empty);
        missingId.Should().BeNull();
    }

    [Fact]
    public void NullableNumericValues_SupportApproximationClassificationAndSign()
    {
        double? approximate = 10.02;
        float? notANumber = float.NaN;
        decimal? amount = 1.25m;
        sbyte? negative = -2;
        byte? positive = 2;

        approximate.Should().BeApproximately(10d, 0.03).BePositive().BeFinite();
        notANumber.Should().BeNaN();
        amount.Should().BeApproximately(1.2m, 0.05m).BePositive();
        negative.Should().BeNegative();
        positive.Should().BePositive();

        Assert.Throws<ArgumentOutOfRangeException>(() => approximate.Should().BeApproximately(10d, -0.1));
        Assert.Throws<AstraFlowAssertionException>(() => ((double?)null).Should().BeFinite());
        Assert.Throws<AstraFlowAssertionException>(() => float.PositiveInfinity.Should().BeFinite());
        Assert.Throws<AstraFlowAssertionException>(() => ((byte?)1).Should().BeNegative());
        Assert.Throws<AstraFlowAssertionException>(() => ((float?)float.NaN).Should().BePositive());
    }

    [Fact]
    public void NullableEnums_SupportDefinedAndFlagChecks()
    {
        SampleState? defined = SampleState.Ready;
        SampleFlags? flags = SampleFlags.Read | SampleFlags.Write;
        SampleState? undefined = (SampleState)42;
        SampleState? missing = null;

        defined.Should().BeDefined();
        undefined.Should().NotBeDefined();
        flags.Should().HaveFlag(SampleFlags.Read).NotHaveFlag(SampleFlags.Execute);

        Assert.Throws<AstraFlowAssertionException>(() => defined.Should().NotBeDefined());
        Assert.Throws<AstraFlowAssertionException>(() => flags.Should().HaveFlag(SampleFlags.Execute));
        Assert.Throws<AstraFlowAssertionException>(() => missing.Should().BeDefined());
    }

    [Fact]
    public void NullableTemporalValues_SupportDateInstantAndDurationAssertions()
    {
        DateTime expectedDate = new DateTime(2026, 11, 13, 0, 0, 0, DateTimeKind.Utc);
        DateTime? date = expectedDate.AddTicks(1);
        DateTimeOffset expectedInstant = new DateTimeOffset(2026, 11, 13, 0, 0, 0, TimeSpan.Zero);
        DateTimeOffset? instant = expectedInstant.AddTicks(1).ToOffset(TimeSpan.FromHours(-5));
        TimeSpan? positiveDuration = TimeSpan.FromTicks(2);
        TimeSpan? negativeDuration = TimeSpan.FromTicks(-2);
        DateTime? missingDate = null;

        date.Should().BeAfter(expectedDate).BeCloseTo(expectedDate, TimeSpan.FromTicks(1)).HaveKind(DateTimeKind.Utc);
        instant.Should().BeAfter(expectedInstant).BeCloseTo(expectedInstant, TimeSpan.FromTicks(1)).HaveOffset(TimeSpan.FromHours(-5));
        positiveDuration.Should().BePositive().BeCloseTo(TimeSpan.FromTicks(1), TimeSpan.FromTicks(1));
        negativeDuration.Should().BeNegative();

        Assert.Throws<AstraFlowAssertionException>(() => missingDate.Should().BeBefore(expectedDate));
        Assert.Throws<ArgumentOutOfRangeException>(() => date.Should().BeCloseTo(expectedDate, TimeSpan.MinValue));
    }

    [Fact]
    public void NullableGuidValuesSupportEmptyChecks()
    {
        Guid? empty = Guid.Empty;
        Guid? populated = Guid.NewGuid();
        Guid? missing = null;

        empty.Should().BeEmpty();
        populated.Should().NotBeEmpty();

        Assert.Throws<AstraFlowAssertionException>(() => populated.Should().BeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => empty.Should().NotBeEmpty());
        Assert.Throws<AstraFlowAssertionException>(() => missing.Should().NotBeEmpty());
    }

    [Fact]
    public void NullableModernTemporalValues_SupportModernDateAndClockAssertions()
    {
        DateOnly? day = new DateOnly(2026, 11, 14);
        TimeOnly? time = new TimeOnly(12, 0, 0);

        day.Should().BeAfter(new DateOnly(2026, 11, 13)).BeCloseTo(new DateOnly(2026, 11, 13), 1);
        time.Should().BeAfter(new TimeOnly(11, 0, 0)).BeCloseTo(new TimeOnly(11, 59, 59), TimeSpan.FromSeconds(1));

        Assert.Throws<ArgumentOutOfRangeException>(() => day.Should().BeCloseTo(DateOnly.MinValue, -1));
        Assert.Throws<AstraFlowAssertionException>(() => ((TimeOnly?)null).Should().BeBefore(TimeOnly.MaxValue));
    }

    private enum SampleState
    {
        Ready = 1,
        Complete = 2
    }

    [Flags]
    private enum SampleFlags
    {
        Read = 1,
        Write = 2,
        Execute = 4
    }
}
