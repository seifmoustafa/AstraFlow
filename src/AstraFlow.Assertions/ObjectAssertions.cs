using System.Collections.Generic;

namespace AstraFlow.Assertions;

/// <summary>Assertions for equality, identity, nullability, and runtime type.</summary>
public sealed class ObjectAssertions<T>
{
    private readonly T _actual;

    internal ObjectAssertions(T actual) => _actual = actual;

    /// <summary>Asserts that the value equals the expected value.</summary>
    public void Be(T expected, string? because = null)
    {
        if (!EqualityComparer<T>.Default.Equals(_actual, expected))
        {
            var reason = string.IsNullOrWhiteSpace(because) ? string.Empty : $" Because {because}.";
            AssertionFailure.Fail($"Expected value equal to {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.{reason}");
        }
    }

    /// <summary>Asserts that the value does not equal the unexpected value.</summary>
    public void NotBe(T unexpected)
    {
        if (EqualityComparer<T>.Default.Equals(_actual, unexpected))
        {
            AssertionFailure.Fail($"Expected a value different from {AssertionFailure.Describe(unexpected)}, but the values were equal.");
        }
    }

    /// <summary>Asserts that the value compares greater than the expected value.</summary>
    public void BeGreaterThan(T expected)
    {
        if (Comparer<T>.Default.Compare(_actual, expected) <= 0)
        {
            AssertionFailure.Fail($"Expected a value greater than {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.");
        }
    }

    /// <summary>Asserts that the value compares greater than or equal to the expected value.</summary>
    public void BeGreaterThanOrEqualTo(T expected)
    {
        if (Comparer<T>.Default.Compare(_actual, expected) < 0)
        {
            AssertionFailure.Fail($"Expected a value greater than or equal to {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.");
        }
    }

    /// <summary>Asserts that the value compares less than the expected value.</summary>
    public void BeLessThan(T expected)
    {
        if (Comparer<T>.Default.Compare(_actual, expected) >= 0)
        {
            AssertionFailure.Fail($"Expected a value less than {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.");
        }
    }

    /// <summary>Asserts that the value compares less than or equal to the expected value.</summary>
    public void BeLessThanOrEqualTo(T expected)
    {
        if (Comparer<T>.Default.Compare(_actual, expected) > 0)
        {
            AssertionFailure.Fail($"Expected a value less than or equal to {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.");
        }
    }

    /// <summary>Asserts that the value is inclusively between the supplied bounds.</summary>
    public void BeInRange(T minimum, T maximum)
    {
        if (Comparer<T>.Default.Compare(minimum, maximum) > 0)
        {
            throw new ArgumentException("The minimum range value cannot be greater than the maximum value.", nameof(minimum));
        }

        if (Comparer<T>.Default.Compare(_actual, minimum) < 0 || Comparer<T>.Default.Compare(_actual, maximum) > 0)
        {
            AssertionFailure.Fail($"Expected a value in the inclusive range [{AssertionFailure.Describe(minimum)}, {AssertionFailure.Describe(maximum)}], but found {AssertionFailure.Describe(_actual)}.");
        }
    }

    /// <summary>Asserts that the value is null.</summary>
    public void BeNull()
    {
        if (_actual is not null)
        {
            AssertionFailure.Fail($"Expected null, but found {AssertionFailure.Describe(_actual)}.");
        }
    }

    /// <summary>Asserts that the value is not null and returns it.</summary>
    public T NotBeNull()
    {
        if (_actual is null)
        {
            AssertionFailure.Fail("Expected a non-null value, but found null.");
        }

        return _actual;
    }

    /// <summary>Asserts that the value is the same object instance as expected.</summary>
    public void BeSameAs(object? expected)
    {
        if (!ReferenceEquals(_actual, expected))
        {
            AssertionFailure.Fail("Expected both values to reference the same object instance.");
        }
    }

    /// <summary>Asserts that the value is not the same object instance as unexpected.</summary>
    public void NotBeSameAs(object? unexpected)
    {
        if (ReferenceEquals(_actual, unexpected))
        {
            AssertionFailure.Fail("Expected values to reference different object instances.");
        }
    }

    /// <summary>Asserts that the value has the exact runtime type and returns it as that type.</summary>
    public TExpected BeOfType<TExpected>()
    {
        if (_actual is null || _actual.GetType() != typeof(TExpected))
        {
            var actualType = _actual?.GetType().FullName ?? "<null>";
            AssertionFailure.Fail($"Expected exact runtime type '{typeof(TExpected).FullName}', but found '{actualType}'.");
        }

        return (TExpected)(object)_actual!;
    }

    /// <summary>Asserts that the value can be assigned to the requested type and returns it.</summary>
    public TExpected BeAssignableTo<TExpected>()
    {
        if (_actual is TExpected result)
        {
            return result;
        }

        var actualType = _actual?.GetType().FullName ?? "<null>";
        AssertionFailure.Fail($"Expected a value assignable to '{typeof(TExpected).FullName}', but found '{actualType}'.");
        throw new InvalidOperationException("Unreachable assertion state.");
    }

    /// <summary>Asserts that the value is a declared member of its enum type.</summary>
    public void BeDefined()
    {
        if (_actual is not Enum enumValue || !Enum.IsDefined(enumValue.GetType(), enumValue))
        {
            AssertionFailure.Fail("Expected a defined enum value.");
        }
    }

    /// <summary>Asserts that the enum value contains all bits in the requested flag.</summary>
    public void HaveFlag(Enum flag)
    {
        if (_actual is not Enum enumValue || flag is null || flag.GetType() != enumValue.GetType() || !enumValue.HasFlag(flag))
        {
            AssertionFailure.Fail("Expected enum value to contain the requested flag.");
        }
    }

    /// <summary>Asserts that the enum value does not contain any bits in the requested flag.</summary>
    public void NotHaveFlag(Enum flag)
    {
        if (_actual is not Enum enumValue || flag is null || flag.GetType() != enumValue.GetType() || enumValue.HasFlag(flag))
        {
            AssertionFailure.Fail("Expected enum value not to contain the requested flag.");
        }
    }
}
