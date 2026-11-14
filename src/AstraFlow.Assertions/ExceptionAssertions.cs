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

    /// <summary>Asserts that the exception has an inner exception assignable to the requested type.</summary>
    public ExceptionAssertions<TInnerException> WithInnerException<TInnerException>()
        where TInnerException : Exception
    {
        var inner = Subject.InnerException as TInnerException;
        if (inner is null)
        {
            AssertionFailure.Fail($"Expected an inner exception assignable to '{typeof(TInnerException).FullName}'.");
        }

        return new ExceptionAssertions<TInnerException>(inner);
    }

    /// <summary>Asserts that the immediate inner exception is assignable to the supplied exception type.</summary>
    public ExceptionAssertions<Exception> WithInnerException(Type innerExceptionType)
    {
        if (innerExceptionType is null)
        {
            throw new ArgumentNullException(nameof(innerExceptionType));
        }
        var inner = Subject.InnerException;
        if (inner is null || !innerExceptionType.IsInstanceOfType(inner))
        {
            AssertionFailure.Fail($"Expected an inner exception assignable to '{innerExceptionType.FullName}'.");
        }

        return new ExceptionAssertions<Exception>(inner);
    }

    /// <summary>Asserts that the exception has an inner exception whose runtime type is exactly the requested type.</summary>
    public ExceptionAssertions<TInnerException> WithInnerExceptionExactly<TInnerException>()
        where TInnerException : Exception
    {
        var inner = Subject.InnerException as TInnerException;
        if (inner is null || inner.GetType() != typeof(TInnerException))
        {
            AssertionFailure.Fail($"Expected an inner exception with exact type '{typeof(TInnerException).FullName}'.");
        }

        return new ExceptionAssertions<TInnerException>(inner);
    }

    /// <summary>Asserts that the immediate inner exception has exactly the supplied runtime type.</summary>
    public ExceptionAssertions<Exception> WithInnerExceptionExactly(Type innerExceptionType)
    {
        if (innerExceptionType is null)
        {
            throw new ArgumentNullException(nameof(innerExceptionType));
        }
        var inner = Subject.InnerException;
        if (inner is null || inner.GetType() != innerExceptionType)
        {
            AssertionFailure.Fail($"Expected an inner exception with exact type '{innerExceptionType.FullName}'.");
        }

        return new ExceptionAssertions<Exception>(inner);
    }

    /// <summary>Asserts that the exception has an inner exception and returns it for further checks.</summary>
    public ExceptionAssertions<Exception> HaveInnerException()
    {
        var inner = Subject.InnerException;
        if (inner is null)
        {
            AssertionFailure.Fail("Expected an inner exception, but none was present.");
        }

        return new ExceptionAssertions<Exception>(inner);
    }

    /// <summary>Asserts that the exception has no inner exception.</summary>
    public ExceptionAssertions<TException> NotHaveInnerException()
    {
        if (Subject.InnerException is not null)
        {
            AssertionFailure.Fail("Expected no inner exception, but one was present.");
        }

        return this;
    }

    /// <summary>Asserts that the captured exception satisfies the supplied predicate.</summary>
    /// <remarks>If the predicate throws, its exception propagates unchanged.</remarks>
    public ExceptionAssertions<TException> Where(Func<TException, bool> predicate)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }
        if (!predicate(Subject))
        {
            AssertionFailure.Fail($"Expected exception of type '{typeof(TException).FullName}' to satisfy the predicate.");
        }

        return this;
    }

    /// <summary>Asserts that the captured exception does not satisfy the supplied predicate.</summary>
    /// <remarks>If the predicate throws, its exception propagates unchanged.</remarks>
    public ExceptionAssertions<TException> NotWhere(Func<TException, bool> predicate)
    {
        if (predicate is null)
        {
            throw new ArgumentNullException(nameof(predicate));
        }
        if (predicate(Subject))
        {
            AssertionFailure.Fail($"Expected exception of type '{typeof(TException).FullName}' not to satisfy the predicate.");
        }

        return this;
    }

    /// <summary>Asserts that the immediate inner exception message matches the supplied wildcard pattern.</summary>
    public ExceptionAssertions<TException> WithInnerExceptionMessage(string expectedPattern)
    {
        var inner = Subject.InnerException;
        if (inner is null)
        {
            AssertionFailure.Fail("Expected an inner exception with a matching message, but none was present.");
        }

        inner.WithMessage(expectedPattern);
        return this;
    }

    /// <summary>Asserts that the captured exception has the exact requested runtime type.</summary>
    public ExceptionAssertions<TExpectedException> BeOfType<TExpectedException>()
        where TExpectedException : Exception
    {
        if (Subject.GetType() != typeof(TExpectedException))
        {
            AssertionFailure.Fail($"Expected exception with exact type '{typeof(TExpectedException).FullName}'.");
        }

        return new ExceptionAssertions<TExpectedException>((TExpectedException)(object)Subject);
    }

    /// <summary>Asserts that the captured exception is assignable to the requested type.</summary>
    public ExceptionAssertions<TExpectedException> BeAssignableTo<TExpectedException>()
        where TExpectedException : Exception
    {
        var exception = Subject as TExpectedException;
        if (exception is null)
        {
            AssertionFailure.Fail($"Expected exception assignable to '{typeof(TExpectedException).FullName}'.");
        }

        return new ExceptionAssertions<TExpectedException>(exception);
    }
}
