namespace AstraFlow.Assertions;

/// <summary>Assertions for asynchronous operations.</summary>
public sealed class AsyncActionAssertions
{
    private readonly Func<Task> _action;

    internal AsyncActionAssertions(Func<Task> action) => _action = action ?? throw new ArgumentNullException(nameof(action));

    /// <summary>Asserts that the operation throws the requested exception type or a derived type.</summary>
    public async Task<ExceptionAssertions<TException>> ThrowAsync<TException>() where TException : Exception
    {
        try
        {
            await _action().ConfigureAwait(false);
        }
        catch (TException exception)
        {
            return new ExceptionAssertions<TException>(exception);
        }
        catch (Exception exception)
        {
            AssertionFailure.Fail($"Expected exception assignable to '{typeof(TException).FullName}', but an exception of type '{exception.GetType().FullName}' was thrown.");
        }

        AssertionFailure.Fail($"Expected exception assignable to '{typeof(TException).FullName}', but the operation completed successfully.");
        throw new InvalidOperationException("Unreachable assertion state.");
    }

    /// <summary>Asserts that the operation completes without throwing.</summary>
    public async Task NotThrowAsync()
    {
        try
        {
            await _action().ConfigureAwait(false);
        }
        catch (Exception exception)
        {
            AssertionFailure.Fail($"Expected operation not to throw, but an exception of type '{exception.GetType().FullName}' was thrown.");
        }
    }
}
