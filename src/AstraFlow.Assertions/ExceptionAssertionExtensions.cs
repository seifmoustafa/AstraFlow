using System.Text.RegularExpressions;

namespace AstraFlow.Assertions;

/// <summary>Provides assertions over exceptions returned by exception assertions.</summary>
public static class ExceptionAssertionExtensions
{
    /// <summary>Asynchronously checks the message on an exception assertion.</summary>
    public static async Task<ExceptionAssertions<TException>> WithMessage<TException>(
        this Task<ExceptionAssertions<TException>> assertionsTask,
        string expectedPattern)
        where TException : Exception
    {
        if (assertionsTask is null)
        {
            throw new ArgumentNullException(nameof(assertionsTask));
        }
        var assertions = await assertionsTask.ConfigureAwait(false);
        assertions.WithMessage(expectedPattern);
        return assertions;
    }

    /// <summary>
    /// Asserts that the exception message matches a pattern where <c>*</c> matches zero or more
    /// characters and <c>?</c> matches exactly one character.
    /// </summary>
    /// <remarks>
    /// Matching is ordinal and case-sensitive. Failure output omits both message values to avoid
    /// disclosing exception content that may contain sensitive data.
    /// </remarks>
    /// <typeparam name="TException">The exception type.</typeparam>
    /// <param name="exception">The exception returned by an expected-exception assertion.</param>
    /// <param name="expectedPattern">The expected message pattern.</param>
    /// <returns>The same exception, allowing further inspection.</returns>
    public static TException WithMessage<TException>(this TException exception, string expectedPattern)
        where TException : Exception
    {
        if (exception is null)
        {
            throw new ArgumentNullException(nameof(exception));
        }

        if (expectedPattern is null)
        {
            throw new ArgumentNullException(nameof(expectedPattern));
        }

        var regexPattern = "\\A" + Regex.Escape(expectedPattern)
            .Replace("\\*", ".*")
            .Replace("\\?", ".") + "\\z";

        if (!Regex.IsMatch(exception.Message, regexPattern, RegexOptions.CultureInvariant | RegexOptions.Singleline))
        {
            AssertionFailure.Fail("Expected exception message to match the supplied pattern, but it did not.");
        }

        return exception;
    }

    /// <summary>Asserts that the captured exception message matches a wildcard pattern.</summary>
    /// <typeparam name="TException">The expected exception type.</typeparam>
    /// <param name="assertions">The captured exception assertion result.</param>
    /// <param name="expectedPattern">The expected message pattern.</param>
    /// <returns>The captured exception assertion result for additional related checks.</returns>
    public static ExceptionAssertions<TException> WithMessage<TException>(this ExceptionAssertions<TException> assertions, string expectedPattern)
        where TException : Exception
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }

        assertions.Subject.WithMessage(expectedPattern);
        return assertions;
    }
}
