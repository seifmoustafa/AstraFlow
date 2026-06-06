# Mapper Scenarios

This guide describes what should happen in common and edge-case mapper scenarios.

## Scenario Matrix

| Scenario | Setup | What Happens | Expected Outcome |
| --- | --- | --- | --- |
| Map object with one rule | One rule returns true for source/destination. | The rule maps the object. | Destination value is returned. |
| Map object with no rule | No rule accepts the pair. | Rule lookup returns zero matches. | `InvalidOperationException` says no mapping rule is registered. |
| Map object with duplicate rules | More than one rule accepts the pair. | Rule lookup sees multiple matches. | `InvalidOperationException` says multiple rules are registered. |
| Map null source | Source is null. | Mapper returns null/default. | Reference destinations return null; generic value destinations receive default. |
| Map assignable source | Destination type is assignable from source type. | Mapper returns the source object directly. | No mapping rule is required. |
| Map list | Source is enumerable; destination is `List<TDestination>`. | Each item maps through explicit rules. | `List<TDestination>` is returned. |
| Map array | Source is enumerable; destination is `TDestination[]`. | Each item maps, then array is created. | Array is returned. |
| Map `IReadOnlyList<T>` | Source is enumerable; destination is `IReadOnlyList<TDestination>`. | Items are placed in a list assignable to the interface. | Compatible list is returned. |
| Validate declared rules | Every rule declares pairs and accepts its own pairs. | Validator passes. | Startup continues. |
| Validate undeclared rule | A rule does not implement `IDeclaredObjectMappingRule` while required. | Validator rejects the catalog. | Startup fails clearly. |
| Validate duplicate declared pair | Two rules declare the same pair. | Validator rejects duplicate ownership. | Startup fails clearly. |
| Use projection | Query calls `ProjectWith`. | Expression is applied to `IQueryable`. | Provider receives explicit projection expression. |
| Use secure ID mapper | Rule injects `SecureIdMapper`. | Raw `Guid` is converted through application codec. | DTO receives encrypted/public ID string. |

## Writing A Production Mapping Rule

Use `IDeclaredObjectMappingRule` for production code:

```csharp
public sealed class CustomerMappingRule(SecureIdMapper ids)
    : IDeclaredObjectMappingRule
{
    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
    [
        ObjectMappingPair.Create<Customer, CustomerResponse>()
    ];

    public bool CanMap(Type sourceType, Type destinationType)
    {
        return sourceType == typeof(Customer)
            && destinationType == typeof(CustomerResponse);
    }

    public object? Map(object? source, Type destinationType, IMapper mapper)
    {
        var customer = (Customer)source!;
        return new CustomerResponse(
            ids.Encrypt(customer.Id),
            customer.Name);
    }
}
```

Expected behavior:

- Startup validation knows this rule owns `Customer -> CustomerResponse`.
- Runtime mapping asks `CanMap` before calling `Map`.
- The rule maps only the fields you write.
- Sensitive fields are not copied unless you copy them.

## Missing Mapping Rule

If this call has no matching rule:

```csharp
var dto = mapper.Map<CustomerResponse>(customer);
```

Expected error:

```text
No mapping rule registered from 'Customer' to 'CustomerResponse'.
```

Fix:

- Add an `IDeclaredObjectMappingRule`.
- Ensure `DeclaredMappings` includes `ObjectMappingPair.Create<Customer, CustomerResponse>()`.
- Ensure `CanMap(typeof(Customer), typeof(CustomerResponse))` returns true.
- Ensure the rule's assembly is included in `AddAstraFlowMapper(...)`.

## Duplicate Mapping Rules

Duplicate runtime ownership happens when two rules return true for the same source/destination pair.

Fix:

- Keep one owning rule.
- Split broad rules into narrower module rules.
- Make `CanMap` exact unless there is a deliberate inheritance strategy.

Duplicate declared ownership happens when two declared rules list the same `ObjectMappingPair`. Startup validation catches this before traffic reaches the mapper.

## Null Source Behavior

```csharp
CustomerResponse? response = mapper.Map<CustomerResponse?>(null);
```

Expected behavior:

- Runtime mapping returns null.
- Generic mapping returns `default!`, which is null for reference and nullable destinations.

Do not rely on null mapping to create empty DTOs. If an empty DTO is required, handle that decision in application code.

## Collection Mapping

Collection mapping still uses explicit item mapping:

```csharp
List<CustomerResponse> responses = mapper.Map<List<CustomerResponse>>(customers);
CustomerResponse[] array = mapper.Map<CustomerResponse[]>(customers);
IReadOnlyList<CustomerResponse> readOnly = mapper.Map<IReadOnlyList<CustomerResponse>>(customers);
```

Expected behavior:

- AstraFlow resolves the destination item type.
- Each item maps through normal object mapping.
- Missing item rules fail with the same missing-rule error.
- Strings are not treated as collections.

Supported destination shapes in `1.12.0`:

- arrays
- `List<T>`
- `IEnumerable<T>`
- `IReadOnlyList<T>`

## Nested Mapping

Use the `mapper` argument inside a rule when nested mapping should also be explicit:

```csharp
public object? Map(object? source, Type destinationType, IMapper mapper)
{
    var order = (Order)source!;
    var customer = mapper.Map<CustomerResponse>(order.Customer);
    return new OrderResponse(order.Number, customer);
}
```

Expected behavior:

- Nested mapping goes through the same rule lookup.
- Missing nested rules fail clearly.
- There is no hidden recursive convention mapping.

## Startup Validation

By default:

```csharp
MappingOptions.ValidateRuleCatalogOnStartup = true;
MappingOptions.RequireDeclaredMappingRules = true;
```

That means a hosted service validates mapping rules at application startup. It catches:

- mapping rules that do not implement `IDeclaredObjectMappingRule`,
- declared rules with no pairs,
- duplicate declared pairs,
- declared pairs that no rule accepts,
- declared pairs accepted by multiple rules,
- declared pairs accepted by a different rule than the declaring rule.

Disable startup validation only when the application has a deliberate reason:

```csharp
services.Configure<MappingOptions>(options =>
{
    options.ValidateRuleCatalogOnStartup = false;
});
```

## Projections

Runtime mapping is not query projection. Do not call `mapper.Map` inside `IQueryable.Select`.

Use an explicit projection:

```csharp
public sealed class CustomerProjection
    : IProjection<Customer, CustomerResponse>
{
    public Expression<Func<Customer, CustomerResponse>> Expression =>
        customer => new CustomerResponse(
            customer.Id.ToString(),
            customer.Name);
}

var query = db.Customers.ProjectWith(new CustomerProjection());
```

Expected behavior:

- `ProjectWith` applies the expression to the query.
- The LINQ provider receives the expression.
- AstraFlow `1.12.0` validates projection registrations and high-risk expression patterns through `IProjectionValidator`.
- The optional `AstraFlow.Mapper.EntityFrameworkCore` package can ask EF Core to generate SQL for registered projections without executing the query.

For named projection and EF Core cases, see [Projection Scenarios](projection-scenarios.md) and [Entity Framework Core](entity-framework-core.md).

## Secure ID Mapping

AstraFlow provides the abstraction, not the encryption:

```csharp
public sealed class MySecureIdCodec : ISecureIdCodec
{
    public string Encrypt(Guid id)
    {
        return MyEncryptionLibrary.Encrypt(id);
    }

    public Guid? TryDecrypt(string? encryptedId)
    {
        return MyEncryptionLibrary.TryDecryptGuid(encryptedId);
    }
}
```

Register it:

```csharp
services.AddScoped<ISecureIdCodec, MySecureIdCodec>();
services.AddAstraFlowMapper(typeof(CustomerMappingRule));
```

Use it in rules through `SecureIdMapper`.

Expected behavior:

- `SecureIdMapper.Encrypt(Guid)` returns a string.
- `SecureIdMapper.Encrypt(Guid?)` returns null for null input.
- `SecureIdMapper.TryDecrypt(string?)` returns a `Guid?`.
- Secrets, keys, algorithms, and rotation remain outside AstraFlow.


