# Explicit Object Mapping

`AstraFlow.Mapper` implements explicit, auditable object mapping rules with startup validation so DTO shape drift and unmapped type pairs fail cleanly before serving production traffic.

## Installation

Install `AstraFlow.Mapper` (already included when using the `AstraFlow` convenience package):

```bash
dotnet add package AstraFlow.Mapper
```

Register `AddAstraFlowMapper` with marker types from the assemblies containing your mapping rules and projections:

```csharp
using AstraFlow.Mapper;

builder.Services.AddAstraFlowMapper(
    [typeof(Program)],
    options =>
    {
        options.ValidateRuleCatalogOnStartup = true;
        options.RequireDeclaredMappingRules = true;
    });
```

## Implementing `IDeclaredObjectMappingRule`

Define explicit mapping ownership by implementing `IDeclaredObjectMappingRule`, which pairs `CanMap` and `Map` with a machine-readable `DeclaredMappings` catalog:

```csharp
using AstraFlow.Mapper;

public sealed record CustomerEntity(Guid Id, string FullName, string Tier);
public sealed record CustomerDto(string PublicId, string Name, string Tier);

public sealed class CustomerMappingRule(SecureIdMapper secureIds) : IDeclaredObjectMappingRule
{
    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
    [
        ObjectMappingPair.Create<CustomerEntity, CustomerDto>()
    ];

    public bool CanMap(Type sourceType, Type destinationType) =>
        sourceType == typeof(CustomerEntity) && destinationType == typeof(CustomerDto);

    public object? Map(object? source, Type destinationType, IMapper mapper)
    {
        if (source is null)
            return null;

        if (source is CustomerEntity entity && destinationType == typeof(CustomerDto))
        {
            return new CustomerDto(
                secureIds.Encrypt(entity.Id),
                entity.FullName,
                entity.Tier);
        }

        throw new InvalidOperationException($"Unsupported mapping to {destinationType.Name}.");
    }
}
```

Inject `IMapper` anywhere you transform objects at runtime:

```csharp
var dto = mapper.Map<CustomerDto>(customer);
```

## Nested Mappings via `IMapper`

`Map(object? source, Type destinationType, IMapper mapper)` receives the scoped `IMapper` facade so composite rules can delegate child collections or nested objects back through registered rules cleanly without tightly coupling rules together.

## Configuration Options (`MappingOptions`)

Bind settings under the `Mapping` configuration section or via the `configure` callback:

| Property | Default | Purpose |
| --- | --- | --- |
| `ValidateRuleCatalogOnStartup` | `true` | Validates registered rules at startup via `AstraFlowObjectMappingStartupValidator` |
| `RequireDeclaredMappingRules` | `true` | Ensures every registered `IObjectMappingRule` implements `IDeclaredObjectMappingRule` and owns its declared pairs |
| `ValidateProjectionCatalogOnStartup` | `true` | Checks registered query projections for duplicates and translation risks |
| `ProjectionValidationMode` | `Warning` | Controls whether projection findings emit warnings, throw errors, or stay disabled |

When `source` is `null`, `IMapper.Map<TDestination>(null)` returns `default(TDestination)` rather than invoking rules with null inputs.

## Related Guides

- Eliminate handwritten rule boilerplate with [Source-Generated Object Mapping](/docs/generated-mapping).
- Enable profile conventions safely via [Opt-In Convention Mapping](/docs/convention-mapping).
- Translate database queries cleanly in [Query Projections & Parameter Binding](/docs/projections).
