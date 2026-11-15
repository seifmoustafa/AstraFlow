using System;

namespace AstraFlow.Assertions;

/// <summary>Assertions for dates, instants, and durations.</summary>
public static class TemporalAssertionExtensions
{
    /// <summary>Asserts that the date is before the expected date by its ticks.</summary>
    public static ObjectAssertions<DateTime> BeBefore(this ObjectAssertions<DateTime> assertions, DateTime expected)
    {
        Guard(assertions);
        Require(assertions.SubjectValue.Ticks < expected.Ticks, "BeBefore");
        return assertions;
    }

    /// <summary>Asserts that the date is after the expected date by its ticks.</summary>
    public static ObjectAssertions<DateTime> BeAfter(this ObjectAssertions<DateTime> assertions, DateTime expected)
    {
        Guard(assertions);
        Require(assertions.SubjectValue.Ticks > expected.Ticks, "BeAfter");
        return assertions;
    }

    /// <summary>Asserts that dates are within an inclusive tick precision, without converting their kinds.</summary>
    public static ObjectAssertions<DateTime> BeCloseTo(this ObjectAssertions<DateTime> assertions, DateTime expected, TimeSpan precision)
    {
        Guard(assertions);
        ValidatePrecision(precision);
        Require(Within(assertions.SubjectValue.Ticks, expected.Ticks, precision.Ticks), "BeCloseTo");
        return assertions;
    }

    /// <summary>Asserts the date's kind.</summary>
    public static ObjectAssertions<DateTime> HaveKind(this ObjectAssertions<DateTime> assertions, DateTimeKind expected)
    {
        Guard(assertions);
        if (expected != DateTimeKind.Unspecified && expected != DateTimeKind.Utc && expected != DateTimeKind.Local)
            throw new ArgumentOutOfRangeException(nameof(expected), "Invalid date kind.");
        Require(assertions.SubjectValue.Kind == expected, "HaveKind");
        return assertions;
    }

    /// <summary>Asserts that the instant is before the expected instant.</summary>
    public static ObjectAssertions<DateTimeOffset> BeBefore(this ObjectAssertions<DateTimeOffset> assertions, DateTimeOffset expected)
    {
        Guard(assertions);
        Require(assertions.SubjectValue.UtcDateTime.Ticks < expected.UtcDateTime.Ticks, "BeBefore");
        return assertions;
    }

    /// <summary>Asserts that the instant is after the expected instant.</summary>
    public static ObjectAssertions<DateTimeOffset> BeAfter(this ObjectAssertions<DateTimeOffset> assertions, DateTimeOffset expected)
    {
        Guard(assertions);
        Require(assertions.SubjectValue.UtcDateTime.Ticks > expected.UtcDateTime.Ticks, "BeAfter");
        return assertions;
    }

    /// <summary>Asserts that instants are within an inclusive precision.</summary>
    public static ObjectAssertions<DateTimeOffset> BeCloseTo(this ObjectAssertions<DateTimeOffset> assertions, DateTimeOffset expected, TimeSpan precision)
    {
        Guard(assertions);
        ValidatePrecision(precision);
        Require(Within(assertions.SubjectValue.UtcDateTime.Ticks, expected.UtcDateTime.Ticks, precision.Ticks), "BeCloseTo");
        return assertions;
    }

    /// <summary>Asserts the stored offset, which must be a whole number of minutes within fourteen hours.</summary>
    public static ObjectAssertions<DateTimeOffset> HaveOffset(this ObjectAssertions<DateTimeOffset> assertions, TimeSpan expected)
    {
        Guard(assertions);
        if (expected.Ticks < -14 * TimeSpan.TicksPerHour || expected.Ticks > 14 * TimeSpan.TicksPerHour || expected.Ticks % TimeSpan.TicksPerMinute != 0)
            throw new ArgumentOutOfRangeException(nameof(expected), "Invalid date offset.");
        Require(assertions.SubjectValue.Offset == expected, "HaveOffset");
        return assertions;
    }

    /// <summary>Asserts that durations are within an inclusive precision.</summary>
    public static ObjectAssertions<TimeSpan> BeCloseTo(this ObjectAssertions<TimeSpan> assertions, TimeSpan expected, TimeSpan precision)
    {
        Guard(assertions);
        ValidatePrecision(precision);
        Require(Within(assertions.SubjectValue.Ticks, expected.Ticks, precision.Ticks), "BeCloseTo");
        return assertions;
    }

    /// <summary>Asserts that a duration is greater than zero.</summary>
    public static ObjectAssertions<TimeSpan> BePositive(this ObjectAssertions<TimeSpan> assertions)
    {
        Guard(assertions);
        Require(assertions.SubjectValue.Ticks > 0, "BePositive");
        return assertions;
    }

    /// <summary>Asserts that a duration is less than zero.</summary>
    public static ObjectAssertions<TimeSpan> BeNegative(this ObjectAssertions<TimeSpan> assertions)
    {
        Guard(assertions);
        Require(assertions.SubjectValue.Ticks < 0, "BeNegative");
        return assertions;
    }

    internal static void Guard<T>(ObjectAssertions<T> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
    }

    internal static void ValidatePrecision(TimeSpan precision)
    {
        if (precision.Ticks < 0) throw new ArgumentOutOfRangeException(nameof(precision), "Precision must be nonnegative.");
    }

    internal static bool Within(long actual, long expected, long precision)
    {
        ulong difference = actual >= expected
            ? unchecked((ulong)actual - (ulong)expected)
            : unchecked((ulong)expected - (ulong)actual);
        return difference <= (ulong)precision;
    }

    internal static void Require(bool condition, string operation)
    {
        if (!condition) AssertionFailure.Fail($"Temporal assertion {operation} failed.");
    }
}
