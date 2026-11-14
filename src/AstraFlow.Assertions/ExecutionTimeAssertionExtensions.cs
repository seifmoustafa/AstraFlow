using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace AstraFlow.Assertions;

/// <summary>Measures one execution of synchronous or asynchronous delegates.</summary>
public static class ExecutionTimeAssertionExtensions
{
    /// <summary>Runs the action once and returns its elapsed execution time.</summary>
    /// <remarks>The action runs on the calling thread. Any exception it throws propagates unchanged.</remarks>
    public static TimeSpan ExecutionTime(this Action action)
    {
        if (action is null)
        {
            throw new ArgumentNullException(nameof(action));
        }

        return Measure(action);
    }

    /// <summary>Runs one operation against the subject and returns its elapsed execution time.</summary>
    /// <remarks>The operation runs on the calling thread. Any exception it throws propagates unchanged.</remarks>
    public static TimeSpan ExecutionTimeOf<T>(this T subject, Action<T> action)
    {
        if (subject is null)
        {
            throw new ArgumentNullException(nameof(subject));
        }
        if (action is null)
        {
            throw new ArgumentNullException(nameof(action));
        }

        return Measure(() => action(subject));
    }

    /// <summary>Runs and awaits one operation against the subject, then returns its elapsed execution time.</summary>
    /// <remarks>The operation starts when this method is called. Any exception it throws propagates unchanged.</remarks>
    public static Task<TimeSpan> ExecutionTimeOfAsync<T>(this T subject, Func<T, Task> action)
    {
        if (subject is null)
        {
            throw new ArgumentNullException(nameof(subject));
        }
        if (action is null)
        {
            throw new ArgumentNullException(nameof(action));
        }

        return MeasureAsync(() => action(subject));
    }

    /// <summary>Runs and awaits one value-returning operation against the subject, discards its result, and returns elapsed time.</summary>
    /// <remarks>The operation starts when this method is called. Any exception it throws propagates unchanged.</remarks>
    public static Task<TimeSpan> ExecutionTimeOfAsync<TSubject, TResult>(
        this TSubject subject,
        Func<TSubject, Task<TResult>> function)
    {
        if (subject is null)
        {
            throw new ArgumentNullException(nameof(subject));
        }
        if (function is null)
        {
            throw new ArgumentNullException(nameof(function));
        }

        return MeasureAsync(async () =>
        {
            var operation = function(subject);
            if (operation is null)
            {
                throw new InvalidOperationException("The asynchronous function returned a null task.");
            }

            _ = await operation.ConfigureAwait(false);
        });
    }

    private static TimeSpan Measure(Action action)
    {
        var stopwatch = Stopwatch.StartNew();
        try
        {
            action();
        }
        finally
        {
            stopwatch.Stop();
        }

        return stopwatch.Elapsed;
    }

    /// <summary>Runs and awaits the operation once, then returns its elapsed execution time.</summary>
    /// <remarks>The operation starts when this method is called. Any exception it throws propagates unchanged.</remarks>
    public static Task<TimeSpan> ExecutionTimeAsync(this Func<Task> action)
    {
        if (action is null)
        {
            throw new ArgumentNullException(nameof(action));
        }

        return MeasureAsync(action);
    }

    /// <summary>Runs and awaits the function once, discards its result, and returns its elapsed execution time.</summary>
    /// <remarks>The function starts when this method is called. Any exception it throws propagates unchanged.</remarks>
    public static Task<TimeSpan> ExecutionTimeAsync<TResult>(this Func<Task<TResult>> function)
    {
        if (function is null)
        {
            throw new ArgumentNullException(nameof(function));
        }

        return MeasureAsync(async () =>
        {
            var operation = function();
            if (operation is null)
            {
                throw new InvalidOperationException("The asynchronous function returned a null task.");
            }

            _ = await operation.ConfigureAwait(false);
        });
    }

    private static async Task<TimeSpan> MeasureAsync(Func<Task> action)
    {
        var stopwatch = Stopwatch.StartNew();
        try
        {
            var operation = action();
            if (operation is null)
            {
                throw new InvalidOperationException("The asynchronous operation returned a null task.");
            }

            await operation.ConfigureAwait(false);
        }
        finally
        {
            stopwatch.Stop();
        }

        return stopwatch.Elapsed;
    }

}
