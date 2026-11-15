namespace AstraFlow.Assertions;

/// <summary>Assertions for the task produced by a generic task completion source.</summary>
/// <typeparam name="TResult">The task result type.</typeparam>
public sealed class TaskCompletionSourceAssertions<TResult>
{
    private readonly TaskCompletionSource<TResult> _source;

    internal TaskCompletionSourceAssertions(TaskCompletionSource<TResult> source) =>
        _source = source ?? throw new ArgumentNullException(nameof(source));

    /// <summary>Gets the task completion source being observed.</summary>
    public TaskCompletionSource<TResult> Subject => _source;

    /// <summary>Returns these assertions for another related check.</summary>
    public TaskCompletionSourceAssertions<TResult> And => this;

    /// <summary>Asserts that the source task completes before the timeout and returns its result.</summary>
    /// <param name="timeout">The finite, nonnegative interval to wait.</param>
    /// <param name="cancellationToken">Cancels only this assertion's wait; it does not cancel the source task.</param>
    public async Task<TResult> CompleteWithinAsync(
        TimeSpan timeout,
        CancellationToken cancellationToken = default)
    {
        AsyncTimeoutAssertions.ValidateTimeout(timeout);
        await AsyncTimeoutAssertions.WaitForCompletionAsync(_source.Task, timeout, cancellationToken).ConfigureAwait(false);
        return await _source.Task.ConfigureAwait(false);
    }

    /// <summary>Asserts that the source task remains incomplete for the timeout interval.</summary>
    /// <param name="timeout">The finite, nonnegative interval to observe.</param>
    /// <param name="cancellationToken">Cancels only this assertion's wait; it does not cancel the source task.</param>
    public async Task<TaskCompletionSourceAssertions<TResult>> NotCompleteWithinAsync(
        TimeSpan timeout,
        CancellationToken cancellationToken = default)
    {
        AsyncTimeoutAssertions.ValidateTimeout(timeout);
        await AsyncTimeoutAssertions.WaitForNonCompletionAsync(_source.Task, timeout, cancellationToken).ConfigureAwait(false);
        return this;
    }
}

#if NET6_0_OR_GREATER
/// <summary>Assertions for the task produced by a non-generic task completion source.</summary>
public sealed class TaskCompletionSourceAssertions
{
    private readonly TaskCompletionSource _source;

    internal TaskCompletionSourceAssertions(TaskCompletionSource source) =>
        _source = source ?? throw new ArgumentNullException(nameof(source));

    /// <summary>Gets the task completion source being observed.</summary>
    public TaskCompletionSource Subject => _source;

    /// <summary>Returns these assertions for another related check.</summary>
    public TaskCompletionSourceAssertions And => this;

    /// <summary>Asserts that the source task completes before the timeout.</summary>
    /// <param name="timeout">The finite, nonnegative interval to wait.</param>
    /// <param name="cancellationToken">Cancels only this assertion's wait; it does not cancel the source task.</param>
    public async Task CompleteWithinAsync(
        TimeSpan timeout,
        CancellationToken cancellationToken = default)
    {
        AsyncTimeoutAssertions.ValidateTimeout(timeout);
        await AsyncTimeoutAssertions.WaitForCompletionAsync(_source.Task, timeout, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>Asserts that the source task remains incomplete for the timeout interval.</summary>
    /// <param name="timeout">The finite, nonnegative interval to observe.</param>
    /// <param name="cancellationToken">Cancels only this assertion's wait; it does not cancel the source task.</param>
    public async Task<TaskCompletionSourceAssertions> NotCompleteWithinAsync(
        TimeSpan timeout,
        CancellationToken cancellationToken = default)
    {
        AsyncTimeoutAssertions.ValidateTimeout(timeout);
        await AsyncTimeoutAssertions.WaitForNonCompletionAsync(_source.Task, timeout, cancellationToken).ConfigureAwait(false);
        return this;
    }
}
#endif
