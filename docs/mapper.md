# Mapper

`AstraFlow.Mapper` is explicit by default. It maps only when an `IObjectMappingRule` says it can map a source and destination type. Opt-in convention mapping lives in the separate `AstraFlow.Mapper.Conventions` package and must be registered pair by pair.

For every method and option, see [API Reference](api-reference.md). For expected behavior across object, collection, validation, projection, and secure-ID cases, see [Mapper Scenarios](mapper-scenarios.md), [Projection Scenarios](projection-scenarios.md), and [Troubleshooting](troubleshooting.md).

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

Projection registry lookup is explicit too:

```csharp
var registry = provider.GetRequiredService<IProjectionRegistry>();
var query = db.Invoices.ProjectWith<Invoice, InvoiceResponse>(registry, "list");
```

Use [Projections](projections.md) for named projections, validation options, and diagnostics behavior. Use [Entity Framework Core](entity-framework-core.md) when you need optional EF Core translation checks.

Use [Convention Mapping](convention-mapping.md) only when a project deliberately wants opt-in property-name mapping with mapping plan diagnostics and sensitive-field safeguards.

The secure ID abstraction is intentionally narrow:

- `ISecureIdCodec` encrypts and decrypts IDs.
- `SecureIdMapper` is the mapper-friendly helper.
- Applications own keys, algorithms, configuration, and rotation policy.

## Recommended Rule Shape

Use one rule for one pair or a tightly related group of pairs inside the same module. Keep `CanMap` exact unless you have a deliberate inheritance policy.

```csharp
public bool CanMap(Type sourceType, Type destinationType)
{
    return sourceType == typeof(Invoice)
        && destinationType == typeof(InvoiceResponse);
}
```

Avoid broad checks such as `destinationType.Name.EndsWith("Response")`; broad checks make duplicate ownership more likely and reduce auditability.

## What The Mapper Will Not Do

- It will not infer property matches by name unless `AstraFlow.Mapper.Conventions` is installed and exact pairs are registered.
- It will not flatten nested objects automatically.
- It will not create reverse maps.
- It will not turn object mapping rules into query-provider projections.
- It will not encrypt IDs unless your rule asks `SecureIdMapper` to do so.

Those boundaries are intentional. They keep v1 behavior reviewable.
