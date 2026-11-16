using System;

namespace AstraFlow.Assertions;

/// <summary>GUID assertions for nullable GUID values.</summary>
public static class NullableGuidAssertionExtensions
{
    /// <summary>Asserts that a present nullable GUID is <see cref="Guid.Empty"/>.</summary>
    public static NullableValueAssertions<Guid> BeEmpty(this NullableValueAssertions<Guid> assertions)
    {
        Guard(assertions);
        if (assertions.Which != Guid.Empty)
        {
            AssertionFailure.Fail("Expected an empty nullable GUID.");
        }

        return assertions;
    }

    /// <summary>Asserts that a present nullable GUID is empty and includes formatted failure context.</summary>
    public static NullableValueAssertions<Guid> BeEmpty(this NullableValueAssertions<Guid> assertions, string? because, params object?[] becauseArgs)
    {
        Guard(assertions);
        if (assertions.Which != Guid.Empty)
        {
            AssertionFailure.FailWithBecause("Expected an empty nullable GUID.", because, becauseArgs);
        }

        return assertions;
    }

    /// <summary>Asserts that a present nullable GUID is not <see cref="Guid.Empty"/>.</summary>
    public static NullableValueAssertions<Guid> NotBeEmpty(this NullableValueAssertions<Guid> assertions)
    {
        Guard(assertions);
        if (assertions.Which == Guid.Empty)
        {
            AssertionFailure.Fail("Expected a non-empty nullable GUID.");
        }

        return assertions;
    }

    /// <summary>Asserts that a present nullable GUID is non-empty and includes formatted failure context.</summary>
    public static NullableValueAssertions<Guid> NotBeEmpty(this NullableValueAssertions<Guid> assertions, string? because, params object?[] becauseArgs)
    {
        Guard(assertions);
        if (assertions.Which == Guid.Empty)
        {
            AssertionFailure.FailWithBecause("Expected a non-empty nullable GUID.", because, becauseArgs);
        }

        return assertions;
    }

    private static void Guard(NullableValueAssertions<Guid> assertions)
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }
    }
}
