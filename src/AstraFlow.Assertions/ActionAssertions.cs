namespace AstraFlow.Assertions;

/// <summary>Assertions for synchronous actions.</summary>
public sealed class ActionAssertions
{
    private readonly Action _action;

    internal ActionAssertions(Action action) => _action = action ?? throw new ArgumentNullException(nameof(action));

    /// <summary>Asserts that the action throws the requested exception type or a derived type.</summary>
    public ExceptionAssertions<TException> Throw<TException>() where TException : Exception
    {
        try
        {
            _action();
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

    /// <summary>Asserts that the action completes without throwing.</summary>
    public void NotThrow()
    {
        try
        {
            _action();
        }
        catch (Exception exception)
        {
            AssertionFailure.Fail($"Expected action not to throw, but an exception of type '{exception.GetType().FullName}' was thrown.");
        }
    }

    /// <summary>Asserts that the action completes without throwing and includes formatted failure context.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public void NotThrow(string? because, params object?[] becauseArgs)
    {
        try
        {
            _action();
        }
        catch (Exception exception)
        {
            AssertionFailure.FailWithBecause($"Expected action not to throw, but an exception of type '{exception.GetType().FullName}' was thrown.", because, becauseArgs);
        }
    }
}
