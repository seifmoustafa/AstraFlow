# Mapper

`AstraFlow.Mapper` is explicit by default. It maps only when an `IObjectMappingRule` says it can map a source and destination type.

For production use, prefer `IDeclaredObjectMappingRule`:

```csharp
public sealed class InvoiceMappingRule : IDeclaredObjectMappingRule
{
    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
    [
        ObjectMappingPair.Create<Invoice, InvoiceResponse>()
    ];

    public bool CanMap(Type sourceType, Type destinationType) =>
        sourceType == typeof(Invoice) && destinationType == typeof(InvoiceResponse);

    public object? Map(object? source, Type destinationType, IMapper mapper)
    {
        var invoice = (Invoice)source!;
        return new InvoiceResponse(invoice.Id, invoice.Number);
    }
}
```

Supported v1 mapping shapes:

- single object
- nullable source
- `IEnumerable<T>`
- `List<T>`
- arrays
- `IReadOnlyList<T>`

Projection is explicit:

```csharp
query.ProjectWith(new InvoiceProjection());
```

The secure ID abstraction is intentionally narrow:

- `ISecureIdCodec` encrypts and decrypts IDs.
- `SecureIdMapper` is the mapper-friendly helper.
- Applications own keys, algorithms, configuration, and rotation policy.
