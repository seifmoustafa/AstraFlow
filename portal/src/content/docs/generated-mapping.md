# Source-Generated Object Mapping

`AstraFlow.Generators` turns `static partial` methods marked with `[AstraGenerateMapping]` into direct, zero-reflection C# assignments during compilation. Property mismatches, missing constructors, and duplicate source-to-destination declarations surface immediately as compiler errors.

## Setup

Add `AstraFlow.Generators` alongside `AstraFlow.Mapper`:

```xml
<ItemGroup>
  <PackageReference Include="AstraFlow.Mapper" Version="2.4.0" />
  <PackageReference Include="AstraFlow.Generators" Version="2.4.0" PrivateAssets="all" />
</ItemGroup>
```

Declare a `static partial` mapping class and annotate mapping methods with `[AstraGenerateMapping]`:

```csharp
using AstraFlow.Mapper;

public sealed record AccountEntity(Guid Id, string Email, AccountPlan Plan);
public sealed record AccountDto(Guid Id, string Email, string Plan);

public static partial class AccountMappings
{
    [AstraGenerateMapping]
    public static partial AccountDto ToDto(AccountEntity source);
}
```

At build time, `AstraFlowExecutableMapperGenerator` emits the implementation directly inside your assembly—calling `AccountMappings.ToDto(entity)` incurs zero boxing or reflection overhead.

## Supported Shapes & Type Conversions

The executable mapper generator supports:

- **Records and primary-constructor DTOs:** Matches constructor parameters and `init` / writable properties accurately.
- **Inherited entity & DTO properties:** Walks the inheritance hierarchy cleanly to map base properties alongside derived properties.
- **Nullable scalar values:** Safely propagates `T?` -> `T?` conversions and standard enum/numeric/string projections.
- **Nested & collection properties:** Generates inline element projections for collections (`List<T>`, arrays, `IReadOnlyList<T>`, `IEnumerable<T>`) and nested objects when matching target types or generated mappings exist.

## Custom Converters with `[AstraValueConverter]`

When a property needs custom formatting or parsing—such as formatting a timestamp or encoding an identifier—attach `[AstraValueConverter]` to the destination property:

```csharp
using AstraFlow.Mapper;

public static class CurrencyFormatting
{
    public static string FormatCents(int cents) => $"${cents / 100m:F2}";
}

public sealed record InvoiceLineDto(
    string Sku,
    [property: AstraValueConverter(typeof(CurrencyFormatting), nameof(CurrencyFormatting.FormatCents))]
    string DisplayAmount);
```

## Polymorphic Collections with `[AstraDerivedMapping]`

Map abstract or base element collections into concrete derived DTOs using `[AstraDerivedMapping]` on the destination collection property:

```csharp
using AstraFlow.Mapper;

public sealed class ActivityFeedDto
{
    [AstraDerivedMapping(typeof(PaymentEvent), typeof(PaymentEventDto))]
    [AstraDerivedMapping(typeof(RefundEvent), typeof(RefundEventDto))]
    public IReadOnlyList<FeedEventDto> Events { get; init; } = [];
}
```

## Compile-Time Constraints & Metadata

- Declare only one `[AstraGenerateMapping]` method per unique `(TSource, TDestination)` pair so generated dispatch stays unambiguous.
- If a shape requires DI-injected services or complex business rules, keep using `IDeclaredObjectMappingRule` or wrap a generated call inside an explicit rule class.
- `AstraFlowMapperMetadataGenerator` also emits compile-time metadata for registered mapping rules and projections to power diagnostics and CLI inspection.

## Related Guides

- Combine generated mappings with runtime DI rules in [Explicit Object Mapping](/docs/mapper).
- Enable compile-time handler registration via [Compile-Time Mediator Registration](/docs/generated-dispatch).
