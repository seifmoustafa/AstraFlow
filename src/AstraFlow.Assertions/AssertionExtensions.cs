namespace AstraFlow.Assertions;

/// <summary>Creates fluent assertions for values, strings, and sequences.</summary>
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
        assertions.Contain(pair => EqualityComparer<TKey>.Default.Equals(pair.Key, key));
        return assertions;
    }

    /// <summary>Starts assertions for a value.</summary>
    public static ObjectAssertions<T> Should<T>(this T actual) where T : struct, IComparable => new(actual);

    /// <summary>Starts assertions for an object value.</summary>
    public static ObjectAssertions<object?> Should(this object? actual) => new(actual);

    /// <summary>Starts assertions for a Boolean value.</summary>
    public static BooleanAssertions Should(this bool actual) => new(actual);

    /// <summary>Starts assertions for a GUID value.</summary>
    public static GuidAssertions Should(this Guid actual) => new(actual);

    /// <summary>Starts string assertions.</summary>
    public static StringAssertions Should(this string? actual) => new(actual);

    /// <summary>Starts sequence assertions.</summary>
    public static CollectionAssertions<T> Should<T>(this IEnumerable<T>? actual) => new(actual);

    /// <summary>Starts dictionary assertions.</summary>
    public static DictionaryAssertions<TKey, TValue> Should<TKey, TValue>(this IDictionary<TKey, TValue>? actual)
        where TKey : notnull => new(actual);

    /// <summary>Starts assertions for a synchronous action.</summary>
    public static ActionAssertions Should(this Action action) => new(action);

    /// <summary>Starts assertions for an asynchronous operation.</summary>
    public static AsyncActionAssertions Should(this Func<Task> action) => new(action);

    /// <summary>Starts assertions for a synchronous function, including expected exceptions.</summary>
    public static FunctionAssertions<TResult> Should<TResult>(this Func<TResult> action) => new(action);

    /// <summary>Starts assertions for an asynchronous function that returns a value.</summary>
    public static AsyncFunctionAssertions<TResult> Should<TResult>(this Func<Task<TResult>> action) => new(action);
}
