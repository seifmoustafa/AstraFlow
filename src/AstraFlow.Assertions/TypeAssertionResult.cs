namespace AstraFlow.Assertions;

/// <summary>Exposes the typed value proven by a runtime type or assignability assertion.</summary>
/// <typeparam name="T">The type established by the assertion.</typeparam>
public sealed class TypeAssertionResult<T>
{
    internal TypeAssertionResult(T subject) => Subject = subject;

    /// <summary>Gets the value proven by the assertion.</summary>
    public T Subject { get; }

    /// <summary>Gets the value proven by the assertion.</summary>
    public T Which => Subject;

    /// <summary>Returns this result for additional related checks.</summary>
    public TypeAssertionResult<T> And => this;
}
