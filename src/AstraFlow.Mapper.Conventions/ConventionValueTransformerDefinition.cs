namespace AstraFlow.Mapper.Conventions;

internal sealed class ConventionValueTransformerDefinition
{
    public ConventionValueTransformerDefinition(Type valueType, Func<object?, object?> transformer)
    {
        ValueType = valueType ?? throw new ArgumentNullException(nameof(valueType));
        Transformer = transformer ?? throw new ArgumentNullException(nameof(transformer));
    }

    public Type ValueType { get; }

    public Func<object?, object?> Transformer { get; }
}
