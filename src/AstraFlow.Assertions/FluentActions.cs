using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AstraFlow.Assertions;

/// <summary>Creates delegates for fluent action, function, and deferred-sequence assertions.</summary>
public static class FluentActions
{
    /// <summary>Wraps an action for fluent exception assertions.</summary>
    public static Action Invoking(Action action)
    {
        if (action is null)
        {
            throw new ArgumentNullException(nameof(action));
        }

        return action;
    }

    /// <summary>Wraps a function for fluent exception assertions.</summary>
    public static Func<TResult> Invoking<TResult>(Func<TResult> function)
    {
        if (function is null)
        {
            throw new ArgumentNullException(nameof(function));
        }

        return function;
    }

    /// <summary>Wraps an asynchronous action for fluent exception assertions.</summary>
    public static Func<Task> Awaiting(Func<Task> action)
    {
        if (action is null)
        {
            throw new ArgumentNullException(nameof(action));
        }

        return action;
    }

    /// <summary>Wraps an asynchronous function for fluent exception assertions.</summary>
    public static Func<Task<TResult>> Awaiting<TResult>(Func<Task<TResult>> function)
    {
        if (function is null)
        {
            throw new ArgumentNullException(nameof(function));
        }

        return function;
    }

    /// <summary>Wraps an enumerable factory so its deferred iterator body is executed by the assertion.</summary>
    public static Action Enumerating(Func<IEnumerable> enumerable) => enumerable.Enumerating();

    /// <summary>Wraps a generic enumerable factory so its deferred iterator body is executed by the assertion.</summary>
    public static Action Enumerating<T>(Func<IEnumerable<T>> enumerable) => enumerable.Enumerating();
}
