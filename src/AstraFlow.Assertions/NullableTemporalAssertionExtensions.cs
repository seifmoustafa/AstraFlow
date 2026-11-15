using System;

namespace AstraFlow.Assertions;

/// <summary>Temporal assertions for nullable dates, instants, durations, and clock values.</summary>
public static class NullableTemporalAssertionExtensions
{
    /// <summary>Asserts that a present date is before the expected date by its ticks.</summary>
    public static NullableValueAssertions<DateTime> BeBefore(this NullableValueAssertions<DateTime> assertions, DateTime expected)
    {
        Guard(assertions);
        assertions.Which.Should().BeBefore(expected);
        return assertions;
    }

    /// <summary>Asserts that a present date is after the expected date by its ticks.</summary>
    public static NullableValueAssertions<DateTime> BeAfter(this NullableValueAssertions<DateTime> assertions, DateTime expected)
    {
        Guard(assertions);
        assertions.Which.Should().BeAfter(expected);
        return assertions;
    }

    /// <summary>Asserts that a present date is within the inclusive tick precision, without converting its kind.</summary>
    public static NullableValueAssertions<DateTime> BeCloseTo(this NullableValueAssertions<DateTime> assertions, DateTime expected, TimeSpan precision)
    {
        Guard(assertions);
        assertions.Which.Should().BeCloseTo(expected, precision);
        return assertions;
    }

    /// <summary>Asserts the kind of a present nullable date.</summary>
    public static NullableValueAssertions<DateTime> HaveKind(this NullableValueAssertions<DateTime> assertions, DateTimeKind expected)
    {
        Guard(assertions);
        assertions.Which.Should().HaveKind(expected);
        return assertions;
    }

    /// <summary>Asserts that a present instant is before the expected instant.</summary>
    public static NullableValueAssertions<DateTimeOffset> BeBefore(this NullableValueAssertions<DateTimeOffset> assertions, DateTimeOffset expected)
    {
        Guard(assertions);
        assertions.Which.Should().BeBefore(expected);
        return assertions;
    }

    /// <summary>Asserts that a present instant is after the expected instant.</summary>
    public static NullableValueAssertions<DateTimeOffset> BeAfter(this NullableValueAssertions<DateTimeOffset> assertions, DateTimeOffset expected)
    {
        Guard(assertions);
        assertions.Which.Should().BeAfter(expected);
        return assertions;
    }

    /// <summary>Asserts that a present instant is within the inclusive precision.</summary>
    public static NullableValueAssertions<DateTimeOffset> BeCloseTo(this NullableValueAssertions<DateTimeOffset> assertions, DateTimeOffset expected, TimeSpan precision)
    {
        Guard(assertions);
        assertions.Which.Should().BeCloseTo(expected, precision);
        return assertions;
    }

    /// <summary>Asserts the stored offset of a present instant.</summary>
    public static NullableValueAssertions<DateTimeOffset> HaveOffset(this NullableValueAssertions<DateTimeOffset> assertions, TimeSpan expected)
    {
        Guard(assertions);
        assertions.Which.Should().HaveOffset(expected);
        return assertions;
    }

    /// <summary>Asserts that a present duration is within the inclusive precision.</summary>
    public static NullableValueAssertions<TimeSpan> BeCloseTo(this NullableValueAssertions<TimeSpan> assertions, TimeSpan expected, TimeSpan precision)
    {
        Guard(assertions);
        assertions.Which.Should().BeCloseTo(expected, precision);
        return assertions;
    }

    /// <summary>Asserts that a present duration is greater than zero.</summary>
    public static NullableValueAssertions<TimeSpan> BePositive(this NullableValueAssertions<TimeSpan> assertions)
    {
        Guard(assertions);
        assertions.Which.Should().BePositive();
        return assertions;
    }

    /// <summary>Asserts that a present duration is less than zero.</summary>
    public static NullableValueAssertions<TimeSpan> BeNegative(this NullableValueAssertions<TimeSpan> assertions)
    {
        Guard(assertions);
        assertions.Which.Should().BeNegative();
        return assertions;
    }

#if NET8_0_OR_GREATER
    /// <summary>Asserts that a present date-only value is before the expected date.</summary>
    public static NullableValueAssertions<DateOnly> BeBefore(this NullableValueAssertions<DateOnly> assertions, DateOnly expected)
    {
        Guard(assertions);
        assertions.Which.Should().BeBefore(expected);
        return assertions;
    }

    /// <summary>Asserts that a present date-only value is after the expected date.</summary>
    public static NullableValueAssertions<DateOnly> BeAfter(this NullableValueAssertions<DateOnly> assertions, DateOnly expected)
    {
        Guard(assertions);
        assertions.Which.Should().BeAfter(expected);
        return assertions;
    }

    /// <summary>Asserts that a present date-only value is within the inclusive day precision.</summary>
    public static NullableValueAssertions<DateOnly> BeCloseTo(this NullableValueAssertions<DateOnly> assertions, DateOnly expected, int precisionInDays)
    {
        Guard(assertions);
        assertions.Which.Should().BeCloseTo(expected, precisionInDays);
        return assertions;
    }

    /// <summary>Asserts that a present clock value is before the expected time.</summary>
    public static NullableValueAssertions<TimeOnly> BeBefore(this NullableValueAssertions<TimeOnly> assertions, TimeOnly expected)
    {
        Guard(assertions);
        assertions.Which.Should().BeBefore(expected);
        return assertions;
    }

    /// <summary>Asserts that a present clock value is after the expected time.</summary>
    public static NullableValueAssertions<TimeOnly> BeAfter(this NullableValueAssertions<TimeOnly> assertions, TimeOnly expected)
    {
        Guard(assertions);
        assertions.Which.Should().BeAfter(expected);
        return assertions;
    }

    /// <summary>Asserts that a present clock value is within the inclusive precision without wrapping midnight.</summary>
    public static NullableValueAssertions<TimeOnly> BeCloseTo(this NullableValueAssertions<TimeOnly> assertions, TimeOnly expected, TimeSpan precision)
    {
        Guard(assertions);
        assertions.Which.Should().BeCloseTo(expected, precision);
        return assertions;
    }
#endif

    private static void Guard<T>(NullableValueAssertions<T> assertions) where T : struct
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }
    }
}
