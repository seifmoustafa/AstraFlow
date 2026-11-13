namespace AstraFlow.Assertions;

/// <summary>Provides fluent checks over an exception returned by an expected-exception assertion.</summary>
/// <typeparam name="TException">The expected exception type.</typeparam>
public sealed class ExceptionAssertions<TException> where TException : Exception
{
    internal ExceptionAssertions(TException exception) => Subject = exception;

    /// <summary>Gets the exception returned by the assertion.</summary>
    public TException Which => Subject;

    /// <summary>Gets the exception returned by the assertion.</summary>
    public TException Subject { get; }

    /// <summary>Returns this result for additional related checks.</summary>
    public ExceptionAssertions<TException> And => this;

    /// <summary>Gets the exception message for direct inspection.</summary>
    public string Message => Subject.Message;
}
