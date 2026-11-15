using System;

namespace AstraFlow.Assertions;

/// <summary>Numeric assertions for nullable numeric values.</summary>
public static class NullableNumericAssertionExtensions
{
    /// <summary>Asserts that a present nullable value is within the inclusive absolute tolerance.</summary>
    public static NullableValueAssertions<double> BeApproximately(this NullableValueAssertions<double> assertions, double expected, double absoluteTolerance)
    {
        NumericAssertionExtensions.ValidateTolerance(absoluteTolerance);
        return Check(assertions, actual => NumericAssertionExtensions.Approximately(actual, expected, absoluteTolerance), "Expected the nullable value to be approximately equal.");
    }

    /// <summary>Asserts that a present nullable value is outside the inclusive absolute tolerance.</summary>
    public static NullableValueAssertions<double> NotBeApproximately(this NullableValueAssertions<double> assertions, double unexpected, double absoluteTolerance)
    {
        NumericAssertionExtensions.ValidateTolerance(absoluteTolerance);
        return Check(assertions, actual => !NumericAssertionExtensions.Approximately(actual, unexpected, absoluteTolerance), "Expected the nullable value to not be approximately equal.");
    }

    /// <summary>Asserts that a present nullable value is within the inclusive absolute tolerance.</summary>
    public static NullableValueAssertions<float> BeApproximately(this NullableValueAssertions<float> assertions, float expected, float absoluteTolerance)
    {
        NumericAssertionExtensions.ValidateTolerance(absoluteTolerance);
        return Check(assertions, actual => NumericAssertionExtensions.Approximately(actual, expected, absoluteTolerance), "Expected the nullable value to be approximately equal.");
    }

    /// <summary>Asserts that a present nullable value is outside the inclusive absolute tolerance.</summary>
    public static NullableValueAssertions<float> NotBeApproximately(this NullableValueAssertions<float> assertions, float unexpected, float absoluteTolerance)
    {
        NumericAssertionExtensions.ValidateTolerance(absoluteTolerance);
        return Check(assertions, actual => !NumericAssertionExtensions.Approximately(actual, unexpected, absoluteTolerance), "Expected the nullable value to not be approximately equal.");
    }

    /// <summary>Asserts that a present nullable value is within the inclusive absolute tolerance.</summary>
    public static NullableValueAssertions<decimal> BeApproximately(this NullableValueAssertions<decimal> assertions, decimal expected, decimal absoluteTolerance)
    {
        NumericAssertionExtensions.ValidateTolerance(absoluteTolerance);
        return Check(assertions, actual => NumericAssertionExtensions.Approximately(actual, expected, absoluteTolerance), "Expected the nullable value to be approximately equal.");
    }

    /// <summary>Asserts that a present nullable value is outside the inclusive absolute tolerance.</summary>
    public static NullableValueAssertions<decimal> NotBeApproximately(this NullableValueAssertions<decimal> assertions, decimal unexpected, decimal absoluteTolerance)
    {
        NumericAssertionExtensions.ValidateTolerance(absoluteTolerance);
        return Check(assertions, actual => !NumericAssertionExtensions.Approximately(actual, unexpected, absoluteTolerance), "Expected the nullable value to not be approximately equal.");
    }

    /// <summary>Asserts that a present nullable double is NaN.</summary>
    public static NullableValueAssertions<double> BeNaN(this NullableValueAssertions<double> assertions) =>
        Check(assertions, double.IsNaN, "Expected the nullable value to be NaN.");

    /// <summary>Asserts that a present nullable double is not NaN.</summary>
    public static NullableValueAssertions<double> NotBeNaN(this NullableValueAssertions<double> assertions) =>
        Check(assertions, value => !double.IsNaN(value), "Expected the nullable value not to be NaN.");

    /// <summary>Asserts that a present nullable double is finite.</summary>
    public static NullableValueAssertions<double> BeFinite(this NullableValueAssertions<double> assertions) =>
        Check(assertions, value => !double.IsNaN(value) && !double.IsInfinity(value), "Expected the nullable value to be finite.");

    /// <summary>Asserts that a present nullable float is NaN.</summary>
    public static NullableValueAssertions<float> BeNaN(this NullableValueAssertions<float> assertions) =>
        Check(assertions, float.IsNaN, "Expected the nullable value to be NaN.");

    /// <summary>Asserts that a present nullable float is not NaN.</summary>
    public static NullableValueAssertions<float> NotBeNaN(this NullableValueAssertions<float> assertions) =>
        Check(assertions, value => !float.IsNaN(value), "Expected the nullable value not to be NaN.");

    /// <summary>Asserts that a present nullable float is finite.</summary>
    public static NullableValueAssertions<float> BeFinite(this NullableValueAssertions<float> assertions) =>
        Check(assertions, value => !float.IsNaN(value) && !float.IsInfinity(value), "Expected the nullable value to be finite.");

    /// <summary>Asserts that a present nullable value is positive.</summary>
    public static NullableValueAssertions<sbyte> BePositive(this NullableValueAssertions<sbyte> assertions) => Check(assertions, value => value > 0, "Expected a positive nullable numeric value.");
    /// <summary>Asserts that a present nullable value is negative.</summary>
    public static NullableValueAssertions<sbyte> BeNegative(this NullableValueAssertions<sbyte> assertions) => Check(assertions, value => value < 0, "Expected a negative nullable numeric value.");
    /// <summary>Asserts that a present nullable value is positive.</summary>
    public static NullableValueAssertions<byte> BePositive(this NullableValueAssertions<byte> assertions) => Check(assertions, value => value > 0, "Expected a positive nullable numeric value.");
    /// <summary>Asserts that a present nullable unsigned value is not negative.</summary>
    public static NullableValueAssertions<byte> BeNegative(this NullableValueAssertions<byte> assertions) => Check(assertions, _ => false, "Expected a negative nullable numeric value.");
    /// <summary>Asserts that a present nullable value is positive.</summary>
    public static NullableValueAssertions<short> BePositive(this NullableValueAssertions<short> assertions) => Check(assertions, value => value > 0, "Expected a positive nullable numeric value.");
    /// <summary>Asserts that a present nullable value is negative.</summary>
    public static NullableValueAssertions<short> BeNegative(this NullableValueAssertions<short> assertions) => Check(assertions, value => value < 0, "Expected a negative nullable numeric value.");
    /// <summary>Asserts that a present nullable value is positive.</summary>
    public static NullableValueAssertions<ushort> BePositive(this NullableValueAssertions<ushort> assertions) => Check(assertions, value => value > 0, "Expected a positive nullable numeric value.");
    /// <summary>Asserts that a present nullable unsigned value is not negative.</summary>
    public static NullableValueAssertions<ushort> BeNegative(this NullableValueAssertions<ushort> assertions) => Check(assertions, _ => false, "Expected a negative nullable numeric value.");
    /// <summary>Asserts that a present nullable value is positive.</summary>
    public static NullableValueAssertions<int> BePositive(this NullableValueAssertions<int> assertions) => Check(assertions, value => value > 0, "Expected a positive nullable numeric value.");
    /// <summary>Asserts that a present nullable value is negative.</summary>
    public static NullableValueAssertions<int> BeNegative(this NullableValueAssertions<int> assertions) => Check(assertions, value => value < 0, "Expected a negative nullable numeric value.");
    /// <summary>Asserts that a present nullable value is positive.</summary>
    public static NullableValueAssertions<uint> BePositive(this NullableValueAssertions<uint> assertions) => Check(assertions, value => value > 0, "Expected a positive nullable numeric value.");
    /// <summary>Asserts that a present nullable unsigned value is not negative.</summary>
    public static NullableValueAssertions<uint> BeNegative(this NullableValueAssertions<uint> assertions) => Check(assertions, _ => false, "Expected a negative nullable numeric value.");
    /// <summary>Asserts that a present nullable value is positive.</summary>
    public static NullableValueAssertions<long> BePositive(this NullableValueAssertions<long> assertions) => Check(assertions, value => value > 0, "Expected a positive nullable numeric value.");
    /// <summary>Asserts that a present nullable value is negative.</summary>
    public static NullableValueAssertions<long> BeNegative(this NullableValueAssertions<long> assertions) => Check(assertions, value => value < 0, "Expected a negative nullable numeric value.");
    /// <summary>Asserts that a present nullable value is positive.</summary>
    public static NullableValueAssertions<ulong> BePositive(this NullableValueAssertions<ulong> assertions) => Check(assertions, value => value > 0, "Expected a positive nullable numeric value.");
    /// <summary>Asserts that a present nullable unsigned value is not negative.</summary>
    public static NullableValueAssertions<ulong> BeNegative(this NullableValueAssertions<ulong> assertions) => Check(assertions, _ => false, "Expected a negative nullable numeric value.");
    /// <summary>Asserts that a present nullable value is positive.</summary>
    public static NullableValueAssertions<float> BePositive(this NullableValueAssertions<float> assertions) => Check(assertions, value => value > 0, "Expected a positive nullable numeric value.");
    /// <summary>Asserts that a present nullable value is negative.</summary>
    public static NullableValueAssertions<float> BeNegative(this NullableValueAssertions<float> assertions) => Check(assertions, value => value < 0, "Expected a negative nullable numeric value.");
    /// <summary>Asserts that a present nullable value is positive.</summary>
    public static NullableValueAssertions<double> BePositive(this NullableValueAssertions<double> assertions) => Check(assertions, value => value > 0, "Expected a positive nullable numeric value.");
    /// <summary>Asserts that a present nullable value is negative.</summary>
    public static NullableValueAssertions<double> BeNegative(this NullableValueAssertions<double> assertions) => Check(assertions, value => value < 0, "Expected a negative nullable numeric value.");
    /// <summary>Asserts that a present nullable value is positive.</summary>
    public static NullableValueAssertions<decimal> BePositive(this NullableValueAssertions<decimal> assertions) => Check(assertions, value => value > 0, "Expected a positive nullable numeric value.");
    /// <summary>Asserts that a present nullable value is negative.</summary>
    public static NullableValueAssertions<decimal> BeNegative(this NullableValueAssertions<decimal> assertions) => Check(assertions, value => value < 0, "Expected a negative nullable numeric value.");

    private static NullableValueAssertions<T> Check<T>(NullableValueAssertions<T> assertions, Func<T, bool> predicate, string failureMessage)
        where T : struct
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        if (!predicate(assertions.Which))
        {
            AssertionFailure.Fail(failureMessage);
        }

        return assertions;
    }
}
