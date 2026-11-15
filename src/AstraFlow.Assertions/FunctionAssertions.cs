namespace AstraFlow.Assertions;

/// <summary>Assertions for synchronous functions.</summary>
/// <typeparam name="TResult">The function's return type.</typeparam>
public sealed class FunctionAssertions<TResult>
{
    private readonly Func<TResult> _action;

    internal FunctionAssertions(Func<TResult> action) => _action = action ?? throw new ArgumentNullException(nameof(action));

    /// <summary>Asserts that the function throws the requested exception type or a derived type.</summary>
    public ExceptionAssertions<TException> Throw<TException>() where TException : Exception
    {
        try
        {
            _ = _action();
        }
        catch (TException exception)
        {
            return new ExceptionAssertions<TException>(exception);
        }
        catch (Exception exception)
        {
            AssertionFailure.Fail($"Expected exception assignable to '{typeof(TException).FullName}', but an exception of type '{exception.GetType().FullName}' was thrown.");
        }

        AssertionFailure.Fail($"Expected exception assignable to '{typeof(TException).FullName}', but no exception was thrown.");
        throw new InvalidOperationException("Unreachable assertion state.");
    }

    /// <summary>Asserts that the function completes without throwing.</summary>
    public FunctionAssertions<TResult> NotThrow()
    {
        try
        {
            _ = _action();
        }
        catch (Exception exception)
        {
            AssertionFailure.Fail($"Expected function not to throw, but an exception of type '{exception.GetType().FullName}' was thrown.");
        }

        return this;
    }
}
