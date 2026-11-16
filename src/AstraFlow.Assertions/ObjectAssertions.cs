using System;
using System.Collections.Generic;

namespace AstraFlow.Assertions;

/// <summary>Assertions for equality, identity, nullability, and runtime type.</summary>
public sealed class ObjectAssertions<T>
{
    private readonly T _actual;

    internal ObjectAssertions(T actual) => _actual = actual;

    /// <summary>Gets the value being asserted.</summary>
    public T Subject => _actual;

    /// <summary>Gets the value being asserted.</summary>
    public T Which => _actual;

    /// <summary>Returns this assertion object for another related check.</summary>
    public ObjectAssertions<T> And => this;

    internal T SubjectValue => _actual;

    /// <summary>Asserts that the subject has matching values for the expected object's public members.</summary>
    /// <param name="expected">The expected object graph.</param>
    /// <param name="configure">Optional settings for member selection, exclusions, custom value comparers, field inclusion, ordering, and maximum graph depth.</param>
    public ObjectAssertions<T> BeEquivalentTo<TExpected>(TExpected expected, Action<EquivalencyOptions>? configure = null)
    {
        var options = CreateEquivalencyOptions(configure);
        options.ValidateIncludedPaths(expected);
        var comparer = new ObjectGraphEquivalencyComparer(options);
        if (!comparer.TryCompare(_actual, expected, out var mismatchPath))
        {
            AssertionFailure.Fail($"Expected values to be structurally equivalent at '{mismatchPath}'.");
        }

        return this;
    }

    /// <summary>Asserts structural equivalency and includes formatted context in a failure message.</summary>
    /// <param name="expected">The expected object graph.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public ObjectAssertions<T> BeEquivalentTo<TExpected>(TExpected expected, string? because, params object?[] becauseArgs)
    {
        var options = CreateEquivalencyOptions(configure: null);
        options.ValidateIncludedPaths(expected);
        var comparer = new ObjectGraphEquivalencyComparer(options);
        if (!comparer.TryCompare(_actual, expected, out var mismatchPath))
        {
            AssertionFailure.FailWithBecause($"Expected values to be structurally equivalent at '{mismatchPath}'.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the subject does not match the expected object's public members.</summary>
    /// <param name="unexpected">The object graph that must differ.</param>
    /// <param name="configure">Optional settings for member selection, exclusions, custom value comparers, field inclusion, ordering, and maximum graph depth.</param>
    public ObjectAssertions<T> NotBeEquivalentTo<TExpected>(TExpected unexpected, Action<EquivalencyOptions>? configure = null)
    {
        var options = CreateEquivalencyOptions(configure);
        options.ValidateIncludedPaths(unexpected);
        var comparer = new ObjectGraphEquivalencyComparer(options);
        if (comparer.TryCompare(_actual, unexpected, out _))
        {
            AssertionFailure.Fail("Expected object graphs not to be structurally equivalent, but they matched.");
        }

        return this;
    }

    /// <summary>Asserts structural difference and includes formatted context in a failure message.</summary>
    /// <param name="unexpected">The object graph that must differ.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public ObjectAssertions<T> NotBeEquivalentTo<TExpected>(TExpected unexpected, string? because, params object?[] becauseArgs)
    {
        var options = CreateEquivalencyOptions(configure: null);
        options.ValidateIncludedPaths(unexpected);
        var comparer = new ObjectGraphEquivalencyComparer(options);
        if (comparer.TryCompare(_actual, unexpected, out _))
        {
            AssertionFailure.FailWithBecause("Expected object graphs not to be structurally equivalent, but they matched.", because, becauseArgs);
        }

        return this;
    }

    /// <summary>Asserts that the value equals the expected value.</summary>
    public void Be(T expected, string? because = null)
    {
        if (!EqualityComparer<T>.Default.Equals(_actual, expected))
        {
            AssertionFailure.FailWithBecause($"Expected value equal to {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.", because);
        }
    }

    /// <summary>Asserts equality and includes formatted context in a failure message.</summary>
    /// <param name="expected">The expected value.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public void Be(T expected, string? because, params object?[] becauseArgs)
    {
        if (!EqualityComparer<T>.Default.Equals(_actual, expected))
        {
            AssertionFailure.FailWithBecause($"Expected value equal to {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.", because, becauseArgs);
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

    /// <summary>Asserts inequality and includes formatted context in a failure message.</summary>
    /// <param name="unexpected">The value that must differ.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public void NotBe(T unexpected, string? because, params object?[] becauseArgs)
    {
        if (EqualityComparer<T>.Default.Equals(_actual, unexpected))
        {
            AssertionFailure.FailWithBecause($"Expected a value different from {AssertionFailure.Describe(unexpected)}, but the values were equal.", because, becauseArgs);
        }
    }

    /// <summary>Asserts that the value equals one of the supplied choices.</summary>
    /// <param name="expectations">The accepted values.</param>
    public void BeOneOf(params T[] expectations)
    {
        if (expectations is null)
        {
            throw new ArgumentNullException(nameof(expectations));
        }

        foreach (var expected in expectations)
        {
            if (EqualityComparer<T>.Default.Equals(_actual, expected))
            {
                return;
            }
        }

        AssertionFailure.Fail("Expected value to equal one of the supplied choices.");
    }

    /// <summary>Asserts that the value compares greater than the expected value.</summary>
    public void BeGreaterThan(T expected) => BeGreaterThan(expected, null);

    /// <summary>Asserts that the value compares greater than the expected value and adds formatted failure context.</summary>
    /// <param name="expected">The value the subject must exceed.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public void BeGreaterThan(T expected, string? because, params object?[] becauseArgs)
    {
        if (Comparer<T>.Default.Compare(_actual, expected) <= 0)
        {
            AssertionFailure.FailWithBecause($"Expected a value greater than {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.", because, becauseArgs);
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
    public void BeLessThan(T expected) => BeLessThan(expected, null);

    /// <summary>Asserts that the value compares less than the expected value and adds formatted failure context.</summary>
    /// <param name="expected">The value the subject must be below.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public void BeLessThan(T expected, string? because, params object?[] becauseArgs)
    {
        if (Comparer<T>.Default.Compare(_actual, expected) >= 0)
        {
            AssertionFailure.FailWithBecause($"Expected a value less than {AssertionFailure.Describe(expected)}, but found {AssertionFailure.Describe(_actual)}.", because, becauseArgs);
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
    public void BeNull() => BeNull(null);

    /// <summary>Asserts that the value is null and adds formatted context to a failure message.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public void BeNull(string? because, params object?[] becauseArgs)
    {
        if (_actual is not null)
        {
            AssertionFailure.FailWithBecause($"Expected null, but found {AssertionFailure.Describe(_actual)}.", because, becauseArgs);
        }
    }

    /// <summary>Asserts that the value is not null and returns it.</summary>
    public T NotBeNull() => NotBeNull(null);

    /// <summary>Asserts that the value is not null, returns it, and adds formatted context to a failure message.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public T NotBeNull(string? because, params object?[] becauseArgs)
    {
        if (_actual is null)
        {
            AssertionFailure.FailWithBecause("Expected a non-null value, but found null.", because, becauseArgs);
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

    /// <summary>Asserts the exact runtime type and returns a result exposing both <c>Subject</c> and <c>Which</c>.</summary>
    /// <typeparam name="TExpected">The required exact runtime type.</typeparam>
    public TypeAssertionResult<TExpected> BeOfTypeAndWhich<TExpected>() => new(BeOfType<TExpected>());

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

    /// <summary>Asserts assignability and returns a result exposing both <c>Subject</c> and <c>Which</c>.</summary>
    /// <typeparam name="TExpected">The required assignable type.</typeparam>
    public TypeAssertionResult<TExpected> BeAssignableToAndWhich<TExpected>() => new(BeAssignableTo<TExpected>());

    /// <summary>Asserts that the subject is not assignable to the requested type.</summary>
    /// <typeparam name="TUnexpected">The type the subject must not be assignable to.</typeparam>
    public void NotBeAssignableTo<TUnexpected>()
    {
        if (_actual is TUnexpected)
        {
            AssertionFailure.Fail($"Expected a value not assignable to '{typeof(TUnexpected).FullName}'.");
        }
    }

    /// <summary>Asserts that the subject does not have the exact requested runtime type.</summary>
    /// <typeparam name="TUnexpected">The runtime type the subject must not have.</typeparam>
    public void NotBeOfType<TUnexpected>()
    {
        if (_actual is not null && _actual.GetType() == typeof(TUnexpected))
        {
            AssertionFailure.Fail($"Expected a value not to have exact runtime type '{typeof(TUnexpected).FullName}'.");
        }
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

    /// <summary>Asserts that the enum value does not contain every bit in the requested flag.</summary>
    public void NotHaveFlag(Enum flag)
    {
        if (_actual is not Enum enumValue || flag is null || flag.GetType() != enumValue.GetType() || enumValue.HasFlag(flag))
        {
            AssertionFailure.Fail("Expected enum value not to contain the requested flag.");
        }
    }

    /// <summary>Asserts that the subject satisfies the predicate.</summary>
    public void Match(Func<T, bool> predicate) => Match(predicate, null);

    /// <summary>Asserts that the subject satisfies the predicate and adds formatted failure context.</summary>
    /// <param name="predicate">The predicate evaluated against the subject.</param>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public void Match(Func<T, bool> predicate, string? because, params object?[] becauseArgs)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }

        if (!predicate(_actual))
        {
            AssertionFailure.FailWithBecause("Expected value to satisfy the predicate.", because, becauseArgs);
        }
    }

    /// <summary>Asserts that the subject does not satisfy the predicate.</summary>
    public void NotMatch(Func<T, bool> predicate)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }

        if (predicate(_actual))
        {
            AssertionFailure.Fail("Expected value not to satisfy the predicate.");
        }
    }

    private static EquivalencyOptions CreateEquivalencyOptions(Action<EquivalencyOptions>? configure)
    {
        var options = new EquivalencyOptions();
        configure?.Invoke(options);
        return options;
    }

}
