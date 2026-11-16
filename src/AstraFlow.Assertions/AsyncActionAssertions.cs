namespace AstraFlow.Assertions;

/// <summary>Assertions for asynchronous operations.</summary>
public sealed class AsyncActionAssertions
{
    private readonly Func<Task> _action;

    internal AsyncActionAssertions(Func<Task> action) => _action = action ?? throw new ArgumentNullException(nameof(action));

    /// <summary>Asserts that the operation throws the requested exception type or a derived type.</summary>
    public Task<ExceptionAssertions<TException>> ThrowAsync<TException>() where TException : Exception => ThrowAsync<TException>(null);

    /// <summary>Asserts that the operation throws the requested exception type or a derived type and adds formatted failure context.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public async Task<ExceptionAssertions<TException>> ThrowAsync<TException>(string? because, params object?[] becauseArgs) where TException : Exception
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
            AssertionFailure.FailWithBecause($"Expected exception assignable to '{typeof(TException).FullName}', but an exception of type '{exception.GetType().FullName}' was thrown.", because, becauseArgs);
        }

        AssertionFailure.FailWithBecause($"Expected exception assignable to '{typeof(TException).FullName}', but the operation completed successfully.", because, becauseArgs);
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

    /// <summary>Asserts that the operation completes without throwing and includes formatted failure context.</summary>
    /// <param name="because">Why the assertion is expected to pass. Composite format items are supported.</param>
    /// <param name="becauseArgs">Values used to format <paramref name="because"/>.</param>
    public async Task NotThrowAsync(string? because, params object?[] becauseArgs)
    {
        try
        {
            await _action().ConfigureAwait(false);
        }
        catch (Exception exception)
        {
            AssertionFailure.FailWithBecause($"Expected operation not to throw, but an exception of type '{exception.GetType().FullName}' was thrown.", because, becauseArgs);
        }
    }

    /// <summary>Asserts that the operation completes within the timeout and propagates its exception, if any.</summary>
    /// <param name="timeout">The nonnegative, finite timeout to observe.</param>
    /// <param name="cancellationToken">Cancels only the assertion's wait; it is not passed to the operation.</param>
    public async Task CompleteWithinAsync(TimeSpan timeout, CancellationToken cancellationToken = default)
    {
        AsyncTimeoutAssertions.ValidateTimeout(timeout);
        cancellationToken.ThrowIfCancellationRequested();
        var operation = _action();
        await AsyncTimeoutAssertions.WaitForCompletionAsync(operation, timeout, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>Asserts that the operation remains incomplete for the timeout interval.</summary>
    /// <param name="timeout">The nonnegative, finite interval to observe.</param>
    /// <param name="cancellationToken">Cancels only the assertion's wait; it is not passed to the operation.</param>
    public async Task NotCompleteWithinAsync(TimeSpan timeout, CancellationToken cancellationToken = default)
    {
        AsyncTimeoutAssertions.ValidateTimeout(timeout);
        cancellationToken.ThrowIfCancellationRequested();
        var operation = _action();
        await AsyncTimeoutAssertions.WaitForNonCompletionAsync(operation, timeout, cancellationToken).ConfigureAwait(false);
    }
}
