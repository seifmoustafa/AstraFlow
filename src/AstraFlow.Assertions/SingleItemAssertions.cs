namespace AstraFlow.Assertions;

/// <summary>Exposes the one item proven by a single-item collection assertion.</summary>
/// <typeparam name="T">The item type.</typeparam>
public sealed class SingleItemAssertions<T>
{
    internal SingleItemAssertions(T item) => Which = item;

    /// <summary>Gets the item found by the assertion.</summary>
    public T Which { get; }

    /// <summary>Gets the item found by the assertion.</summary>
    public T Subject => Which;

    /// <summary>Returns this result for additional related checks.</summary>
    public SingleItemAssertions<T> And => this;
}
