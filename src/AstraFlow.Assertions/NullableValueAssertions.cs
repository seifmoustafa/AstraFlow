using System;
using System.Collections.Generic;

namespace AstraFlow.Assertions;

/// <summary>Assertions for nullable value types.</summary>
/// <typeparam name="T">The underlying value type.</typeparam>
public sealed class NullableValueAssertions<T> where T : struct
{
    private readonly T? _actual;

    internal NullableValueAssertions(T? actual) => _actual = actual;

    /// <summary>Gets the subject value after asserting that it is present.</summary>
    public T Which
    {
        get
        {
            if (!_actual.HasValue)
            {
                AssertionFailure.Fail("Expected a nullable value to be present, but found null.");
            }

            return _actual.Value;
        }
    }

    /// <summary>Asserts that the subject has no value.</summary>
    public NullableValueAssertions<T> BeNull() => BeNull(null);

    /// <summary>Asserts that the subject has no value and adds formatted context to a failure message.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public NullableValueAssertions<T> BeNull(string? because, params object?[] becauseArgs)
    {
        if (_actual.HasValue)
        {
            AssertionFailure.FailWithBecause($"Expected null, but found {AssertionFailure.Describe(_actual.Value)}.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the subject has a value.</summary>
    public NullableValueAssertions<T> NotBeNull() => NotBeNull(null);

    /// <summary>Asserts that the subject has a value and adds formatted context to a failure message.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public NullableValueAssertions<T> NotBeNull(string? because, params object?[] becauseArgs)
    {
        if (!_actual.HasValue)
        {
            AssertionFailure.FailWithBecause("Expected a non-null value, but found null.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the subject has a value.</summary>
    public NullableValueAssertions<T> HaveValue() => NotBeNull();

    /// <summary>Asserts that the subject has no value.</summary>
    public NullableValueAssertions<T> NotHaveValue() => BeNull();

    /// <summary>Asserts that the subject has the expected value.</summary>
    public NullableValueAssertions<T> Be(T expected)
    {
        if (!_actual.HasValue || !EqualityComparer<T>.Default.Equals(_actual.Value, expected))
        {
            AssertionFailure.Fail($"Expected a nullable value equal to {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.");
        }

        return this;
    }

    /// <summary>Asserts that the nullable subject equals the expected value and includes formatted failure context.</summary>
    public NullableValueAssertions<T> Be(T expected, string? because, params object?[] becauseArgs)
    {
        if (!_actual.HasValue || !EqualityComparer<T>.Default.Equals(_actual.Value, expected))
        {
            AssertionFailure.FailWithBecause($"Expected a nullable value equal to {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the subject does not have the specified value.</summary>
    public NullableValueAssertions<T> NotBe(T unexpected)
    {
        if (_actual.HasValue && EqualityComparer<T>.Default.Equals(_actual.Value, unexpected))
        {
            AssertionFailure.Fail($"Expected a nullable value different from {AssertionFailure.Describe(unexpected)}, but the values were equal.");
        }

        return this;
    }

    /// <summary>Asserts that the nullable subject differs from the supplied value and includes formatted failure context.</summary>
    public NullableValueAssertions<T> NotBe(T unexpected, string? because, params object?[] becauseArgs)
    {
        if (_actual.HasValue && EqualityComparer<T>.Default.Equals(_actual.Value, unexpected))
        {
            AssertionFailure.FailWithBecause($"Expected a nullable value different from {AssertionFailure.Describe(unexpected)}, but the values were equal.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the subject compares greater than the expected value.</summary>
    public NullableValueAssertions<T> BeGreaterThan(T expected) => BeGreaterThan(expected, null);

    /// <summary>Asserts that the subject compares greater than the expected value and adds formatted failure context.</summary>
    /// <param name="expected">The value the subject must exceed.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public NullableValueAssertions<T> BeGreaterThan(T expected, string? because, params object?[] becauseArgs)
    {
        if (!_actual.HasValue)
        {
            AssertionFailure.FailWithBecause("Expected a nullable value to be present, but found null.", because, becauseArgs);
        }

        if (Comparer<T>.Default.Compare(_actual.Value, expected) <= 0)
        {
            AssertionFailure.FailWithBecause($"Expected a nullable value greater than {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the subject compares greater than or equal to the expected value.</summary>
    public NullableValueAssertions<T> BeGreaterThanOrEqualTo(T expected)
    {
        if (Comparer<T>.Default.Compare(Which, expected) < 0)
        {
            AssertionFailure.Fail($"Expected a nullable value greater than or equal to {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.");
        }

        return this;
    }

    /// <summary>Asserts that the subject compares less than the expected value.</summary>
    public NullableValueAssertions<T> BeLessThan(T expected) => BeLessThan(expected, null);

    /// <summary>Asserts that the subject compares less than the expected value and adds formatted failure context.</summary>
    /// <param name="expected">The value the subject must be below.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public NullableValueAssertions<T> BeLessThan(T expected, string? because, params object?[] becauseArgs)
    {
        if (!_actual.HasValue)
        {
            AssertionFailure.FailWithBecause("Expected a nullable value to be present, but found null.", because, becauseArgs);
        }

        if (Comparer<T>.Default.Compare(_actual.Value, expected) >= 0)
        {
            AssertionFailure.FailWithBecause($"Expected a nullable value less than {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the subject compares less than or equal to the expected value.</summary>
    public NullableValueAssertions<T> BeLessThanOrEqualTo(T expected)
    {
        if (Comparer<T>.Default.Compare(Which, expected) > 0)
        {
            AssertionFailure.Fail($"Expected a nullable value less than or equal to {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.");
        }

        return this;
    }

    /// <summary>Asserts that the subject is inclusively between the supplied bounds.</summary>
    public NullableValueAssertions<T> BeInRange(T minimum, T maximum)
    {
        if (Comparer<T>.Default.Compare(minimum, maximum) > 0)
        {
            throw new ArgumentException("The minimum range value cannot be greater than the maximum value.", nameof(minimum));
        }

        var actual = Which;
        if (Comparer<T>.Default.Compare(actual, minimum) < 0 || Comparer<T>.Default.Compare(actual, maximum) > 0)
        {
            AssertionFailure.Fail($"Expected a nullable value in the inclusive range [{AssertionFailure.Describe(minimum)}, {AssertionFailure.Describe(maximum)}], but found {AssertionFailure.Describe(_actual)}.");
        }

        return this;
    }

    /// <summary>Asserts that the subject matches one of the expected values.</summary>
    public NullableValueAssertions<T> BeOneOf(params T[] expected)
    {
        if (expected is null)
        {
            throw new ArgumentNullException(nameof(expected));
        }

        if (!_actual.HasValue)
        {
            AssertionFailure.Fail("Expected a nullable value to match one of the supplied values, but found null.");
        }

        for (var index = 0; index < expected.Length; index++)
        {
            if (EqualityComparer<T>.Default.Equals(_actual.Value, expected[index]))
            {
                return this;
            }
        }

        AssertionFailure.Fail("Expected the nullable value to match one of the supplied values.");
        return this;
    }

    /// <summary>Asserts that the subject matches none of the supplied values; a null subject is allowed.</summary>
    public NullableValueAssertions<T> NotBeOneOf(params T[] unexpected)
    {
        if (unexpected is null)
        {
            throw new ArgumentNullException(nameof(unexpected));
        }

        if (!_actual.HasValue)
        {
            return this;
        }

        for (var index = 0; index < unexpected.Length; index++)
        {
            if (EqualityComparer<T>.Default.Equals(_actual.Value, unexpected[index]))
            {
                AssertionFailure.Fail("Expected the nullable value to match none of the supplied values.");
            }
        }

        return this;
    }
}
