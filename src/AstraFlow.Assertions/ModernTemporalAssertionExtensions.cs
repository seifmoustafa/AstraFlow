#if NET8_0_OR_GREATER
using System;

namespace AstraFlow.Assertions;

/// <summary>Assertions for date-only and time-only values.</summary>
public static class ModernTemporalAssertionExtensions
{
    /// <summary>Asserts that a date is before the expected date.</summary>
    public static ObjectAssertions<DateOnly> BeBefore(this ObjectAssertions<DateOnly> assertions, DateOnly expected)
    {
        TemporalAssertionExtensions.Guard(assertions);
        TemporalAssertionExtensions.Require(assertions.SubjectValue.DayNumber < expected.DayNumber, "BeBefore");
        return assertions;
    }

    /// <summary>Asserts that a date is after the expected date.</summary>
    public static ObjectAssertions<DateOnly> BeAfter(this ObjectAssertions<DateOnly> assertions, DateOnly expected)
    {
        TemporalAssertionExtensions.Guard(assertions);
        TemporalAssertionExtensions.Require(assertions.SubjectValue.DayNumber > expected.DayNumber, "BeAfter");
        return assertions;
    }

    /// <summary>Asserts that dates are within an inclusive number of days.</summary>
    public static ObjectAssertions<DateOnly> BeCloseTo(this ObjectAssertions<DateOnly> assertions, DateOnly expected, int precisionInDays)
    {
        TemporalAssertionExtensions.Guard(assertions);
        if (precisionInDays < 0) throw new ArgumentOutOfRangeException(nameof(precisionInDays), "Precision must be nonnegative.");
        TemporalAssertionExtensions.Require(TemporalAssertionExtensions.Within(assertions.SubjectValue.DayNumber, expected.DayNumber, precisionInDays), "BeCloseTo");
        return assertions;
    }

    /// <summary>Asserts that a clock time is before the expected time.</summary>
    public static ObjectAssertions<TimeOnly> BeBefore(this ObjectAssertions<TimeOnly> assertions, TimeOnly expected)
    {
        TemporalAssertionExtensions.Guard(assertions);
        TemporalAssertionExtensions.Require(assertions.SubjectValue.Ticks < expected.Ticks, "BeBefore");
        return assertions;
    }

    /// <summary>Asserts that a clock time is after the expected time.</summary>
    public static ObjectAssertions<TimeOnly> BeAfter(this ObjectAssertions<TimeOnly> assertions, TimeOnly expected)
    {
        TemporalAssertionExtensions.Guard(assertions);
        TemporalAssertionExtensions.Require(assertions.SubjectValue.Ticks > expected.Ticks, "BeAfter");
        return assertions;
    }

    /// <summary>Asserts that clock times are within an inclusive precision without wrapping midnight.</summary>
    public static ObjectAssertions<TimeOnly> BeCloseTo(this ObjectAssertions<TimeOnly> assertions, TimeOnly expected, TimeSpan precision)
    {
        TemporalAssertionExtensions.Guard(assertions);
        TemporalAssertionExtensions.ValidatePrecision(precision);
        TemporalAssertionExtensions.Require(TemporalAssertionExtensions.Within(assertions.SubjectValue.Ticks, expected.Ticks, precision.Ticks), "BeCloseTo");
        return assertions;
    }
}
#endif
