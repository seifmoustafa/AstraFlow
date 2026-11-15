namespace AstraFlow.Assertions;

/// <summary>Provides negative enum assertions.</summary>
public static class EnumAssertionExtensions
{
    /// <summary>Asserts that the enum value is not a declared member of its enum type.</summary>
    public static ObjectAssertions<TEnum> NotBeDefined<TEnum>(this ObjectAssertions<TEnum> assertions)
        where TEnum : struct, Enum
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        if (Enum.IsDefined(typeof(TEnum), assertions.SubjectValue))
        {
            AssertionFailure.Fail("Expected an undefined enum value.");
        }

        return assertions;
    }

    /// <summary>Asserts that a present nullable enum value is a declared member.</summary>
    public static NullableValueAssertions<TEnum> BeDefined<TEnum>(this NullableValueAssertions<TEnum> assertions)
        where TEnum : struct, Enum
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        if (!Enum.IsDefined(typeof(TEnum), assertions.Which))
        {
            AssertionFailure.Fail("Expected a declared nullable enum value.");
        }

        return assertions;
    }

    /// <summary>Asserts that a present nullable enum value is not a declared member.</summary>
    public static NullableValueAssertions<TEnum> NotBeDefined<TEnum>(this NullableValueAssertions<TEnum> assertions)
        where TEnum : struct, Enum
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        if (Enum.IsDefined(typeof(TEnum), assertions.Which))
        {
            AssertionFailure.Fail("Expected an undefined nullable enum value.");
        }

        return assertions;
    }

    /// <summary>Asserts that a present nullable flags enum contains the requested flag.</summary>
    public static NullableValueAssertions<TEnum> HaveFlag<TEnum>(this NullableValueAssertions<TEnum> assertions, TEnum flag)
        where TEnum : struct, Enum
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        if (!((Enum)(object)assertions.Which).HasFlag((Enum)(object)flag))
        {
            AssertionFailure.Fail("Expected the nullable enum value to contain the requested flag.");
        }

        return assertions;
    }

    /// <summary>Asserts that a present nullable flags enum does not contain the requested flag.</summary>
    public static NullableValueAssertions<TEnum> NotHaveFlag<TEnum>(this NullableValueAssertions<TEnum> assertions, TEnum flag)
        where TEnum : struct, Enum
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        if (((Enum)(object)assertions.Which).HasFlag((Enum)(object)flag))
        {
            AssertionFailure.Fail("Expected the nullable enum value not to contain the requested flag.");
        }

        return assertions;
    }
}
