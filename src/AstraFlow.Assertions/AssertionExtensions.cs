using System.IO;
using System.Net.Http;
using System.Reflection;

namespace AstraFlow.Assertions;

/// <summary>Creates typed assertion entry points for values, strings, and sequences.</summary>
public static class AssertionExtensions
{
    /// <summary>Asserts that a sequence of key-value pairs contains the specified key.</summary>
    public static CollectionAssertions<KeyValuePair<TKey, TValue>> ContainKey<TKey, TValue>(
        this CollectionAssertions<KeyValuePair<TKey, TValue>> assertions,
        TKey key)
        where TKey : notnull
    {
        if (assertions is null)
        {
            throw new ArgumentNullException(nameof(assertions));
        }
        if (!DictionarySequenceAssertionExtensions.ContainsKey(assertions.Subject, key))
        {
            AssertionFailure.Fail("Expected key-value pairs to contain the requested key.");
        }

        return assertions;
    }

    /// <summary>Starts assertions for a comparable struct.</summary>
    public static ObjectAssertions<T> Should<T>(this T actual) where T : struct, IComparable => new(actual);

    /// <summary>Starts assertions for a nullable value type.</summary>
    public static NullableValueAssertions<T> Should<T>(this T? actual) where T : struct => new(actual);

    /// <summary>Starts assertions for an object value.</summary>
    public static ObjectAssertions<object?> Should(this object? actual) => new(actual);

    /// <summary>Starts assertions about CLR type structure and public members.</summary>
    public static TypeAssertions Should(this Type? actual) => new(actual);

    /// <summary>Starts assertions about assembly references and declared types.</summary>
    public static AssemblyAssertions Should(this Assembly? actual) => new(actual);

    /// <summary>Starts assertions over events captured by an event monitor.</summary>
    public static EventMonitorAssertions Should(this EventMonitor actual)
    {
        if (actual is null)
        {
            throw new ArgumentNullException(nameof(actual));
        }

        return new EventMonitorAssertions(actual);
    }

    /// <summary>Starts assertions for a Boolean value.</summary>
    public static BooleanAssertions Should(this bool actual) => new(actual);

    /// <summary>Starts assertions for a GUID value.</summary>
    public static GuidAssertions Should(this Guid actual) => new(actual);

    /// <summary>Starts string assertions.</summary>
    public static StringAssertions Should(this string? actual) => new(actual);

    /// <summary>Starts sequence assertions.</summary>
    public static CollectionAssertions<T> Should<T>(this IEnumerable<T>? actual) => new(actual);

    /// <summary>Starts non-consuming state and metadata assertions for a stream.</summary>
    public static StreamAssertions Should(this Stream? actual) => new(actual);

    /// <summary>Starts status, header, and text-content assertions for an HTTP response.</summary>
    public static HttpResponseMessageAssertions Should(this HttpResponseMessage? actual) => new(actual);

#if NET8_0_OR_GREATER
    /// <summary>Starts asynchronous sequence assertions on .NET 8 and later.</summary>
    public static AsyncEnumerableAssertions<T> Should<T>(this System.Collections.Generic.IAsyncEnumerable<T>? actual) => new(actual);
#endif

    /// <summary>Starts dictionary assertions.</summary>
    public static DictionaryAssertions<TKey, TValue> Should<TKey, TValue>(this IDictionary<TKey, TValue>? actual)
        where TKey : notnull => new(actual);

    /// <summary>Starts dictionary assertions for a sequence of key-value pairs.</summary>
    public static DictionaryAssertions<TKey, TValue> Should<TKey, TValue>(this IEnumerable<KeyValuePair<TKey, TValue>>? actual)
        where TKey : notnull => new(actual);

    /// <summary>Starts assertions for a synchronous action.</summary>
    public static ActionAssertions Should(this Action action) => new(action);

    /// <summary>Starts assertions for an asynchronous operation.</summary>
    public static AsyncActionAssertions Should(this Func<Task> action) => new(action);

    /// <summary>Starts assertions for a synchronous function, including expected exceptions.</summary>
    public static FunctionAssertions<TResult> Should<TResult>(this Func<TResult> action) => new(action);

    /// <summary>Starts assertions for an asynchronous function that returns a value.</summary>
    public static AsyncFunctionAssertions<TResult> Should<TResult>(this Func<Task<TResult>> action) => new(action);

    /// <summary>Starts assertions for the task produced by a generic task completion source.</summary>
    public static TaskCompletionSourceAssertions<TResult> Should<TResult>(this TaskCompletionSource<TResult>? source)
    {
        if (source is null)
        {
            throw new ArgumentNullException(nameof(source));
        }

        return new TaskCompletionSourceAssertions<TResult>(source);
    }

#if NET6_0_OR_GREATER
    /// <summary>Starts assertions for the task produced by a non-generic task completion source.</summary>
    public static TaskCompletionSourceAssertions Should(this TaskCompletionSource? source)
    {
        if (source is null)
        {
            throw new ArgumentNullException(nameof(source));
        }

        return new TaskCompletionSourceAssertions(source);
    }
#endif
}
