namespace AstraFlow.Assertions;

/// <summary>Assertions for asynchronous functions that return a value.</summary>
/// <typeparam name="TResult">The function's return type.</typeparam>
public sealed class AsyncFunctionAssertions<TResult>
{
    private readonly Func<Task<TResult>> _action;

    internal AsyncFunctionAssertions(Func<Task<TResult>> action) => _action = action ?? throw new ArgumentNullException(nameof(action));

    /// <summary>Asserts that the operation throws the requested exception type or a derived type.</summary>
    public async Task<ExceptionAssertions<TException>> ThrowAsync<TException>() where TException : Exception
    {
        try
        {
            _ = await _action().ConfigureAwait(false);
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
    public async Task<AsyncFunctionAssertions<TResult>> NotThrowAsync()
    {
        try
        {
            _ = await _action().ConfigureAwait(false);
        }
        catch (Exception exception)
        {
            AssertionFailure.Fail($"Expected operation not to throw, but an exception of type '{exception.GetType().FullName}' was thrown.");
        }

        return this;
    }

    /// <summary>Asserts that the function completes within the timeout and returns its result.</summary>
    /// <param name="timeout">The nonnegative, finite timeout to observe.</param>
    /// <param name="cancellationToken">Cancels only the assertion's wait; it is not passed to the function.</param>
    public async Task<TResult> CompleteWithinAsync(TimeSpan timeout, CancellationToken cancellationToken = default)
    {
        AsyncTimeoutAssertions.ValidateTimeout(timeout);
        cancellationToken.ThrowIfCancellationRequested();
        var operation = _action();
        await AsyncTimeoutAssertions.WaitForCompletionAsync(operation, timeout, cancellationToken).ConfigureAwait(false);
        return await operation.ConfigureAwait(false);
    }

    /// <summary>Asserts that the function remains incomplete for the timeout interval.</summary>
    /// <param name="timeout">The nonnegative, finite interval to observe.</param>
    /// <param name="cancellationToken">Cancels only the assertion's wait; it is not passed to the function.</param>
    public async Task<AsyncFunctionAssertions<TResult>> NotCompleteWithinAsync(TimeSpan timeout, CancellationToken cancellationToken = default)
    {
        AsyncTimeoutAssertions.ValidateTimeout(timeout);
        cancellationToken.ThrowIfCancellationRequested();
        var operation = _action();
        await AsyncTimeoutAssertions.WaitForNonCompletionAsync(operation, timeout, cancellationToken).ConfigureAwait(false);
        return this;
    }
}
