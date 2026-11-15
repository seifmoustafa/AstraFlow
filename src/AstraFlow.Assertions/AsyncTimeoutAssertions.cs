using System;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;

namespace AstraFlow.Assertions;

internal static class AsyncTimeoutAssertions
{
    private const double MaximumSupportedMilliseconds = int.MaxValue;

    public static void ValidateTimeout(TimeSpan timeout)
    {
        if (timeout < TimeSpan.Zero || timeout.TotalMilliseconds > MaximumSupportedMilliseconds)
        {
            throw new ArgumentOutOfRangeException(nameof(timeout), "Timeout must be nonnegative and supported by Task.Delay.");
        }
    }

    public static async Task WaitForCompletionAsync(Task operation, TimeSpan timeout, CancellationToken cancellationToken)
    {
        if (operation is null)
        {
            throw new InvalidOperationException("The asynchronous operation returned a null task.");
        }

        if (cancellationToken.IsCancellationRequested)
        {
            ObserveLaterFailure(operation);
            cancellationToken.ThrowIfCancellationRequested();
        }
        if (operation.IsCompleted)
        {
            await operation.ConfigureAwait(false);
            return;
        }

        using var delayCancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        var delay = Task.Delay(timeout, delayCancellation.Token);
        var completed = await Task.WhenAny(operation, delay).ConfigureAwait(false);
        if (cancellationToken.IsCancellationRequested)
        {
            ObserveLaterFailure(operation);
            cancellationToken.ThrowIfCancellationRequested();
        }

        if (ReferenceEquals(completed, operation))
        {
            delayCancellation.Cancel();
            await operation.ConfigureAwait(false);
            return;
        }

        ObserveLaterFailure(operation);
        AssertionFailure.Fail($"Expected the asynchronous operation to complete within {FormatTimeout(timeout)}, but it did not.");
    }

    public static async Task WaitForNonCompletionAsync(Task operation, TimeSpan timeout, CancellationToken cancellationToken)
    {
        if (operation is null)
        {
            throw new InvalidOperationException("The asynchronous operation returned a null task.");
        }

        if (cancellationToken.IsCancellationRequested)
        {
            ObserveLaterFailure(operation);
            cancellationToken.ThrowIfCancellationRequested();
        }
        if (operation.IsCompleted)
        {
            ObserveLaterFailure(operation);
            AssertionFailure.Fail($"Expected the asynchronous operation not to complete within {FormatTimeout(timeout)}, but it completed.");
        }

        using var delayCancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        var delay = Task.Delay(timeout, delayCancellation.Token);
        var completed = await Task.WhenAny(operation, delay).ConfigureAwait(false);
        if (cancellationToken.IsCancellationRequested)
        {
            ObserveLaterFailure(operation);
            cancellationToken.ThrowIfCancellationRequested();
        }

        if (ReferenceEquals(completed, operation))
        {
            delayCancellation.Cancel();
            ObserveLaterFailure(operation);
            AssertionFailure.Fail($"Expected the asynchronous operation not to complete within {FormatTimeout(timeout)}, but it completed.");
        }

        await delay.ConfigureAwait(false);
        ObserveLaterFailure(operation);
    }

    private static void ObserveLaterFailure(Task operation)
    {
        _ = operation.ContinueWith(
            static completed => { _ = completed.Exception; },
            CancellationToken.None,
            TaskContinuationOptions.OnlyOnFaulted | TaskContinuationOptions.ExecuteSynchronously,
            TaskScheduler.Default);
    }

    private static string FormatTimeout(TimeSpan timeout) =>
        timeout.TotalMilliseconds.ToString("0.###", CultureInfo.InvariantCulture) + " ms";
}
