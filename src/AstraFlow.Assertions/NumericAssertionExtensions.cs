using System;

namespace AstraFlow.Assertions;

/// <summary>Precision and classification assertions for numeric values.</summary>
public static class NumericAssertionExtensions
{
    /// <summary>Asserts that a value is within an inclusive absolute tolerance.</summary>
    public static ObjectAssertions<double> BeApproximately(this ObjectAssertions<double> assertions, double expected, double absoluteTolerance)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        ValidateTolerance(absoluteTolerance);
        var matches = Approximately(assertions.SubjectValue, expected, absoluteTolerance);
        if (!matches) AssertionFailure.Fail("Expected the value to be approximately equal.");
        return assertions;
    }

    /// <summary>Asserts that a value is outside an inclusive absolute tolerance.</summary>
    public static ObjectAssertions<double> NotBeApproximately(this ObjectAssertions<double> assertions, double unexpected, double absoluteTolerance)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        ValidateTolerance(absoluteTolerance);
        var matches = Approximately(assertions.SubjectValue, unexpected, absoluteTolerance);
        if (matches) AssertionFailure.Fail("Expected the value to not be approximately equal.");
        return assertions;
    }

    /// <summary>Asserts that a value is within an inclusive absolute tolerance.</summary>
    public static ObjectAssertions<float> BeApproximately(this ObjectAssertions<float> assertions, float expected, float absoluteTolerance)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        ValidateTolerance(absoluteTolerance);
        var matches = Approximately(assertions.SubjectValue, expected, absoluteTolerance);
        if (!matches) AssertionFailure.Fail("Expected the value to be approximately equal.");
        return assertions;
    }

    /// <summary>Asserts that a value is outside an inclusive absolute tolerance.</summary>
    public static ObjectAssertions<float> NotBeApproximately(this ObjectAssertions<float> assertions, float unexpected, float absoluteTolerance)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        ValidateTolerance(absoluteTolerance);
        var matches = Approximately(assertions.SubjectValue, unexpected, absoluteTolerance);
        if (matches) AssertionFailure.Fail("Expected the value to not be approximately equal.");
        return assertions;
    }

    /// <summary>Asserts that a value is within an inclusive absolute tolerance.</summary>
    public static ObjectAssertions<decimal> BeApproximately(this ObjectAssertions<decimal> assertions, decimal expected, decimal absoluteTolerance)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        ValidateTolerance(absoluteTolerance);
        var matches = Approximately(assertions.SubjectValue, expected, absoluteTolerance);
        if (!matches) AssertionFailure.Fail("Expected the value to be approximately equal.");
        return assertions;
    }

    /// <summary>Asserts that a value is outside an inclusive absolute tolerance.</summary>
    public static ObjectAssertions<decimal> NotBeApproximately(this ObjectAssertions<decimal> assertions, decimal unexpected, decimal absoluteTolerance)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        ValidateTolerance(absoluteTolerance);
        var matches = Approximately(assertions.SubjectValue, unexpected, absoluteTolerance);
        if (matches) AssertionFailure.Fail("Expected the value to not be approximately equal.");
        return assertions;
    }

    /// <summary>Asserts the numeric BeNaN condition.</summary>
    public static ObjectAssertions<double> BeNaN(this ObjectAssertions<double> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (!(double.IsNaN(assertions.SubjectValue))) AssertionFailure.Fail("Numeric assertion BeNaN failed.");
        return assertions;
    }

    /// <summary>Asserts the numeric NotBeNaN condition.</summary>
    public static ObjectAssertions<double> NotBeNaN(this ObjectAssertions<double> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (!(!double.IsNaN(assertions.SubjectValue))) AssertionFailure.Fail("Numeric assertion NotBeNaN failed.");
        return assertions;
    }

    /// <summary>Asserts the numeric BeFinite condition.</summary>
    public static ObjectAssertions<double> BeFinite(this ObjectAssertions<double> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (!(!double.IsNaN(assertions.SubjectValue) && !double.IsInfinity(assertions.SubjectValue))) AssertionFailure.Fail("Numeric assertion BeFinite failed.");
        return assertions;
    }

    /// <summary>Asserts the numeric BeNaN condition.</summary>
    public static ObjectAssertions<float> BeNaN(this ObjectAssertions<float> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (!(float.IsNaN(assertions.SubjectValue))) AssertionFailure.Fail("Numeric assertion BeNaN failed.");
        return assertions;
    }

    /// <summary>Asserts the numeric NotBeNaN condition.</summary>
    public static ObjectAssertions<float> NotBeNaN(this ObjectAssertions<float> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (!(!float.IsNaN(assertions.SubjectValue))) AssertionFailure.Fail("Numeric assertion NotBeNaN failed.");
        return assertions;
    }

    /// <summary>Asserts the numeric BeFinite condition.</summary>
    public static ObjectAssertions<float> BeFinite(this ObjectAssertions<float> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (!(!float.IsNaN(assertions.SubjectValue) && !float.IsInfinity(assertions.SubjectValue))) AssertionFailure.Fail("Numeric assertion BeFinite failed.");
        return assertions;
    }

    /// <summary>Asserts that a signed 8-bit integer is greater than zero.</summary>
    public static ObjectAssertions<sbyte> BePositive(this ObjectAssertions<sbyte> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue <= 0) AssertionFailure.Fail("Numeric assertion BePositive failed.");
        return assertions;
    }

    /// <summary>Asserts that a signed 8-bit integer is less than zero.</summary>
    public static ObjectAssertions<sbyte> BeNegative(this ObjectAssertions<sbyte> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue >= 0) AssertionFailure.Fail("Numeric assertion BeNegative failed.");
        return assertions;
    }

    /// <summary>Asserts that an unsigned 8-bit integer is greater than zero.</summary>
    public static ObjectAssertions<byte> BePositive(this ObjectAssertions<byte> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue == 0) AssertionFailure.Fail("Numeric assertion BePositive failed.");
        return assertions;
    }

    /// <summary>Asserts that an unsigned 8-bit integer is negative. This assertion always fails.</summary>
    public static ObjectAssertions<byte> BeNegative(this ObjectAssertions<byte> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        AssertionFailure.Fail("Numeric assertion BeNegative failed.");
        return assertions;
    }

    /// <summary>Asserts that a signed 16-bit integer is greater than zero.</summary>
    public static ObjectAssertions<short> BePositive(this ObjectAssertions<short> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue <= 0) AssertionFailure.Fail("Numeric assertion BePositive failed.");
        return assertions;
    }

    /// <summary>Asserts that a signed 16-bit integer is less than zero.</summary>
    public static ObjectAssertions<short> BeNegative(this ObjectAssertions<short> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue >= 0) AssertionFailure.Fail("Numeric assertion BeNegative failed.");
        return assertions;
    }

    /// <summary>Asserts that an unsigned 16-bit integer is greater than zero.</summary>
    public static ObjectAssertions<ushort> BePositive(this ObjectAssertions<ushort> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue == 0) AssertionFailure.Fail("Numeric assertion BePositive failed.");
        return assertions;
    }

    /// <summary>Asserts that an unsigned 16-bit integer is negative. This assertion always fails.</summary>
    public static ObjectAssertions<ushort> BeNegative(this ObjectAssertions<ushort> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        AssertionFailure.Fail("Numeric assertion BeNegative failed.");
        return assertions;
    }

    /// <summary>Asserts that a signed 32-bit integer is greater than zero.</summary>
    public static ObjectAssertions<int> BePositive(this ObjectAssertions<int> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue <= 0) AssertionFailure.Fail("Numeric assertion BePositive failed.");
        return assertions;
    }

    /// <summary>Asserts that a signed 32-bit integer is less than zero.</summary>
    public static ObjectAssertions<int> BeNegative(this ObjectAssertions<int> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue >= 0) AssertionFailure.Fail("Numeric assertion BeNegative failed.");
        return assertions;
    }

    /// <summary>Asserts that an unsigned 32-bit integer is greater than zero.</summary>
    public static ObjectAssertions<uint> BePositive(this ObjectAssertions<uint> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue == 0) AssertionFailure.Fail("Numeric assertion BePositive failed.");
        return assertions;
    }

    /// <summary>Asserts that an unsigned 32-bit integer is negative. This assertion always fails.</summary>
    public static ObjectAssertions<uint> BeNegative(this ObjectAssertions<uint> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        AssertionFailure.Fail("Numeric assertion BeNegative failed.");
        return assertions;
    }

    /// <summary>Asserts that a signed 64-bit integer is greater than zero.</summary>
    public static ObjectAssertions<long> BePositive(this ObjectAssertions<long> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue <= 0) AssertionFailure.Fail("Numeric assertion BePositive failed.");
        return assertions;
    }

    /// <summary>Asserts that a signed 64-bit integer is less than zero.</summary>
    public static ObjectAssertions<long> BeNegative(this ObjectAssertions<long> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue >= 0) AssertionFailure.Fail("Numeric assertion BeNegative failed.");
        return assertions;
    }

    /// <summary>Asserts that an unsigned 64-bit integer is greater than zero.</summary>
    public static ObjectAssertions<ulong> BePositive(this ObjectAssertions<ulong> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue == 0) AssertionFailure.Fail("Numeric assertion BePositive failed.");
        return assertions;
    }

    /// <summary>Asserts that an unsigned 64-bit integer is negative. This assertion always fails.</summary>
    public static ObjectAssertions<ulong> BeNegative(this ObjectAssertions<ulong> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        AssertionFailure.Fail("Numeric assertion BeNegative failed.");
        return assertions;
    }

    /// <summary>Asserts that a single-precision floating-point number is greater than zero.</summary>
    public static ObjectAssertions<float> BePositive(this ObjectAssertions<float> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (!(assertions.SubjectValue > 0)) AssertionFailure.Fail("Numeric assertion BePositive failed.");
        return assertions;
    }

    /// <summary>Asserts that a single-precision floating-point number is less than zero.</summary>
    public static ObjectAssertions<float> BeNegative(this ObjectAssertions<float> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (!(assertions.SubjectValue < 0)) AssertionFailure.Fail("Numeric assertion BeNegative failed.");
        return assertions;
    }

    /// <summary>Asserts that a double-precision floating-point number is greater than zero.</summary>
    public static ObjectAssertions<double> BePositive(this ObjectAssertions<double> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (!(assertions.SubjectValue > 0)) AssertionFailure.Fail("Numeric assertion BePositive failed.");
        return assertions;
    }

    /// <summary>Asserts that a double-precision floating-point number is less than zero.</summary>
    public static ObjectAssertions<double> BeNegative(this ObjectAssertions<double> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (!(assertions.SubjectValue < 0)) AssertionFailure.Fail("Numeric assertion BeNegative failed.");
        return assertions;
    }

    /// <summary>Asserts that a decimal number is greater than zero.</summary>
    public static ObjectAssertions<decimal> BePositive(this ObjectAssertions<decimal> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue <= 0) AssertionFailure.Fail("Numeric assertion BePositive failed.");
        return assertions;
    }

    /// <summary>Asserts that a decimal number is less than zero.</summary>
    public static ObjectAssertions<decimal> BeNegative(this ObjectAssertions<decimal> assertions)
    {
        if (assertions is null) throw new ArgumentNullException(nameof(assertions));
        if (assertions.SubjectValue >= 0) AssertionFailure.Fail("Numeric assertion BeNegative failed.");
        return assertions;
    }

    internal static void ValidateTolerance(double absoluteTolerance)
    {
        if (absoluteTolerance < 0 || double.IsNaN(absoluteTolerance) || double.IsInfinity(absoluteTolerance)) throw new ArgumentOutOfRangeException(nameof(absoluteTolerance), "Tolerance must be finite and nonnegative.");
    }

    internal static void ValidateTolerance(float absoluteTolerance)
    {
        if (absoluteTolerance < 0 || float.IsNaN(absoluteTolerance) || float.IsInfinity(absoluteTolerance)) throw new ArgumentOutOfRangeException(nameof(absoluteTolerance), "Tolerance must be finite and nonnegative.");
    }

    internal static void ValidateTolerance(decimal absoluteTolerance)
    {
        if (absoluteTolerance < 0) throw new ArgumentOutOfRangeException(nameof(absoluteTolerance), "Tolerance must be finite and nonnegative.");
    }

    internal static bool Approximately(double actual, double expected, double tolerance)
    {
        if (double.IsNaN(actual) || double.IsNaN(expected)) return false;
        if (actual == expected) return true;
        if (double.IsInfinity(actual) || double.IsInfinity(expected)) return false;
        double difference = Math.Abs(actual - expected);
        return difference <= tolerance;
    }

    internal static bool Approximately(float actual, float expected, float tolerance)
    {
        if (float.IsNaN(actual) || float.IsNaN(expected)) return false;
        if (actual == expected) return true;
        if (float.IsInfinity(actual) || float.IsInfinity(expected)) return false;
        float difference = Math.Abs(actual - expected);
        return difference <= tolerance;
    }

    internal static bool Approximately(decimal actual, decimal expected, decimal tolerance)
    {
        try
        {
            decimal difference = Math.Abs(actual - expected);
            return difference <= tolerance;
        }
        catch (OverflowException)
        {
            return false;
        }
    }
}
