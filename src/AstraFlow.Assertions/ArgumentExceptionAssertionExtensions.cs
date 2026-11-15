namespace AstraFlow.Assertions;

/// <summary>Provides assertions for argument-specific exception data.</summary>
public static class ArgumentExceptionAssertionExtensions
{
    /// <summary>Asserts that an argument exception identifies the expected parameter name, ignoring casing.</summary>
    /// <typeparam name="TException">The captured argument exception type.</typeparam>
    /// <param name="assertions">The captured exception assertions.</param>
    /// <param name="expectedName">The parameter name to require.</param>
    public static ExceptionAssertions<TException> WithParameterName<TException>(
        this ExceptionAssertions<TException> assertions,
        string expectedName)
        where TException : ArgumentException
    {
        Validate(assertions, expectedName);

        if (!string.Equals(assertions.Subject.ParamName, expectedName, StringComparison.OrdinalIgnoreCase))
        {
            AssertionFailure.Fail("Expected the argument exception to identify the requested parameter name.");
        }

        return assertions;
    }

    /// <summary>Asserts that an argument exception does not identify the specified parameter name, ignoring casing.</summary>
    /// <typeparam name="TException">The captured argument exception type.</typeparam>
    /// <param name="assertions">The captured exception assertions.</param>
    /// <param name="unexpectedName">The parameter name that must not be present.</param>
    public static ExceptionAssertions<TException> NotHaveParameterName<TException>(
        this ExceptionAssertions<TException> assertions,
        string unexpectedName)
        where TException : ArgumentException
    {
        Validate(assertions, unexpectedName);

        if (string.Equals(assertions.Subject.ParamName, unexpectedName, StringComparison.OrdinalIgnoreCase))
        {
            AssertionFailure.Fail("Expected the argument exception not to identify the specified parameter name.");
        }

        return assertions;
    }

    /// <summary>Asserts the parameter name after an asynchronous expected-exception assertion.</summary>
    /// <typeparam name="TException">The captured argument exception type.</typeparam>
    /// <param name="assertionsTask">The asynchronous captured exception assertions.</param>
    /// <param name="expectedName">The parameter name to require.</param>
    public static async Task<ExceptionAssertions<TException>> WithParameterName<TException>(
        this Task<ExceptionAssertions<TException>> assertionsTask,
        string expectedName)
        where TException : ArgumentException
    {
        if (assertionsTask is null)
        {
            throw new ArgumentNullException(nameof(assertionsTask));
        }

        ValidateExpectedName(expectedName, nameof(expectedName));
        var assertions = await assertionsTask.ConfigureAwait(false);
        return assertions.WithParameterName(expectedName);
    }

    /// <summary>Asserts the parameter name is different after an asynchronous expected-exception assertion.</summary>
    /// <typeparam name="TException">The captured argument exception type.</typeparam>
    /// <param name="assertionsTask">The asynchronous captured exception assertions.</param>
    /// <param name="unexpectedName">The parameter name that must not be present.</param>
    public static async Task<ExceptionAssertions<TException>> NotHaveParameterName<TException>(
        this Task<ExceptionAssertions<TException>> assertionsTask,
        string unexpectedName)
        where TException : ArgumentException
    {
        if (assertionsTask is null)
        {
            throw new ArgumentNullException(nameof(assertionsTask));
        }

        ValidateExpectedName(unexpectedName, nameof(unexpectedName));
        var assertions = await assertionsTask.ConfigureAwait(false);
        return assertions.NotHaveParameterName(unexpectedName);
    }

    private static void Validate<TException>(ExceptionAssertions<TException> assertions, string expectedName)
        where TException : ArgumentException
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        ValidateExpectedName(expectedName, nameof(expectedName));
    }

    private static void ValidateExpectedName(string expectedName, string parameterName)
    {
        if (expectedName is null)
        {
            throw new ArgumentNullException(parameterName);
        }

        if (expectedName.Length == 0)
        {
            throw new ArgumentException("A parameter name is required.", parameterName);
        }
    }
}
