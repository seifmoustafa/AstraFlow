using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AstraFlow.Assertions;

/// <summary>Creates deferred delegates for asserting on subject methods and lazy sequences.</summary>
public static class AssertionActionExtensions
{
    /// <summary>Defers invoking an action against the subject.</summary>
    public static Action Invoking<T>(this T subject, Action<T> action)
    {
        if (subject is null)
        {
            throw new ArgumentNullException(nameof(subject));
        }

        if (action is null)
        {
            throw new ArgumentNullException(nameof(action));
        }

        return () => action(subject);
    }

    /// <summary>Defers invoking a function against the subject.</summary>
    public static Func<TResult> Invoking<T, TResult>(this T subject, Func<T, TResult> function)
    {
        if (subject is null)
        {
            throw new ArgumentNullException(nameof(subject));
        }

        if (function is null)
        {
            throw new ArgumentNullException(nameof(function));
        }

        return () => function(subject);
    }

    /// <summary>Defers invoking an asynchronous action against the subject.</summary>
    public static Func<Task> Awaiting<T>(this T subject, Func<T, Task> action)
    {
        if (action is null)
        {
            throw new ArgumentNullException(nameof(action));
        }

        return () => action(subject) ?? throw new InvalidOperationException("The async action returned a null task.");
    }

    /// <summary>Defers invoking an asynchronous function against the subject.</summary>
    public static Func<Task<TResult>> Awaiting<T, TResult>(this T subject, Func<T, Task<TResult>> function)
    {
        if (function is null)
        {
            throw new ArgumentNullException(nameof(function));
        }

        return () => function(subject) ?? throw new InvalidOperationException("The async function returned a null task.");
    }

#if NET8_0_OR_GREATER
    /// <summary>Defers invoking an asynchronous action that returns a value task against the subject.</summary>
    public static Func<Task> Awaiting<T>(this T subject, Func<T, ValueTask> action)
    {
        if (action is null)
        {
            throw new ArgumentNullException(nameof(action));
        }

        return () => action(subject).AsTask();
    }

    /// <summary>Defers invoking an asynchronous function that returns a value task against the subject.</summary>
    public static Func<Task<TResult>> Awaiting<T, TResult>(this T subject, Func<T, ValueTask<TResult>> function)
    {
        if (function is null)
        {
            throw new ArgumentNullException(nameof(function));
        }

        return () => function(subject).AsTask();
    }
#endif

    /// <summary>Defers and fully enumerates a non-generic enumerable.</summary>
    public static Action Enumerating(this Func<IEnumerable> enumerable)
    {
        if (enumerable is null)
        {
            throw new ArgumentNullException(nameof(enumerable));
        }

        return () => ForceEnumeration(enumerable());
    }

    /// <summary>Defers and fully enumerates a generic enumerable.</summary>
    public static Action Enumerating<T>(this Func<IEnumerable<T>> enumerable)
    {
        if (enumerable is null)
        {
            throw new ArgumentNullException(nameof(enumerable));
        }

        return () => ForceEnumeration(enumerable());
    }

    /// <summary>Defers and fully enumerates a sequence returned by a subject method.</summary>
    public static Action Enumerating<TSubject, TResult>(this TSubject subject, Func<TSubject, IEnumerable<TResult>> enumerable)
    {
        if (subject is null)
        {
            throw new ArgumentNullException(nameof(subject));
        }

        if (enumerable is null)
        {
            throw new ArgumentNullException(nameof(enumerable));
        }

        return () => ForceEnumeration(enumerable(subject));
    }

    private static void ForceEnumeration(IEnumerable? enumerable)
    {
        if (enumerable is null)
        {
            throw new InvalidOperationException("The enumerable factory returned null.");
        }

        foreach (object? _ in enumerable)
        {
        }
    }

    private static void ForceEnumeration<T>(IEnumerable<T>? enumerable)
    {
        if (enumerable is null)
        {
            throw new InvalidOperationException("The enumerable factory returned null.");
        }

        foreach (T _ in enumerable)
        {
        }
    }
}
