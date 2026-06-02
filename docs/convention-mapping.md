# Convention Mapping

`AstraFlow.Mapper.Conventions` adds opt-in convention mapping on top of the explicit mapper. It is disabled unless the application installs the package and registers convention pairs.

## Install

```powershell
dotnet add package AstraFlow.Mapper --version 1.9.0
dotnet add package AstraFlow.Mapper.Conventions --version 1.9.0
```

## Register

Register the explicit mapper first, then add convention mappings:

```csharp
services.AddAstraFlowMapper(typeof(CustomerProfile));

services.AddAstraFlowConventionMapping(catalog =>
{
    catalog.AddProfile<CustomerProfile>();
});
```

Profiles declare exact source/destination pairs:

```csharp
public sealed class CustomerProfile : ConventionMappingProfile
{
    public CustomerProfile()
    {
        CreateMap<Customer, CustomerResponse>();
    }
}
```

Convention mapping is never enabled globally. A type pair maps only when it is registered in the convention catalog.

## Matching

Exact public property-name matching is the default. Case-insensitive matching is available only when explicitly enabled:

```csharp
CreateMap<Customer, CustomerResponse>()
    .UseCaseInsensitiveMemberMatching();
```

Source properties must be readable. Writable destination properties are assigned after construction. Record and immutable destinations can be created when a single public constructor can be bound from source members or explicit `ForMember` rules.

## Constructor And Record Binding

Constructor binding is automatic for registered convention pairs when the destination has a public constructor whose parameters can all be mapped. AstraFlow chooses the most specific mappable constructor. If two constructors are equally specific, mapping fails with `AFC010`.

```csharp
public sealed record CustomerResponse(Guid Id, string DisplayName);

CreateMap<Customer, CustomerResponse>()
    .ForMember(destination => destination.DisplayName, member => member
        .MapFrom(source => source.Name)
        .Required());
```

Constructor-bound members are reported as `ConstructorBound` in mapping plans. If an immutable destination member cannot be constructor-bound or assigned, mapping fails with `AFC012`.

## Member Configuration

Use `ForMember` when the destination member needs an explicit source, converter, null fallback, condition, or required-member rule.

```csharp
CreateMap<Customer, CustomerResponse>()
    .ForMember(destination => destination.DisplayName, member => member
        .MapFrom(source => source.Name)
        .Required());
```

Member configuration is additive. Unconfigured destination members still use normal convention matching.

## Null Substitution

Use `NullSubstitute` when a nullable source can feed a non-nullable destination member.

```csharp
CreateMap<CustomerStats, CustomerStatsResponse>()
    .ForMember(destination => destination.Score, member => member.NullSubstitute(0));
```

Without a substitute or explicit converter, nullable value types mapped into non-nullable value types produce `AFC006`.

## Value Converters

Use `ConvertUsing` when a member conversion is deliberate and should be visible in the mapping plan.

```csharp
CreateMap<Order, OrderResponse>()
    .ForMember(destination => destination.Total, member => member
        .ConvertUsing(source => source.TotalCents, cents => (cents / 100m).ToString("0.00")));
```

Numeric type changes are not hidden. Unsafe numeric member conversions produce `AFC007` unless a converter is configured.

## Conditional Members

Use `Condition` when a member should only be assigned for some source values, such as patch DTO-style input.

```csharp
CreateMap<CustomerPatch, CustomerPatchResult>()
    .ForMember(destination => destination.Email, member => member
        .Condition(source => source.HasEmail));
```

Conditions are reported in mapping plans as `MappedWhen`. Reports show the rule exists, not source payload values.

## Existing Destination Updates

Existing-destination mapping is separate from read DTO mapping. Enable it per pair, then inject `IConventionMapper` and call `MapInto`.

```csharp
CreateMap<CustomerPatch, Customer>()
    .EnableUpdateMapping()
    .ForMember(destination => destination.Email, member => member
        .Condition(source => source.HasEmail));

var mapper = provider.GetRequiredService<IConventionMapper>();
mapper.MapInto(patch, customer);
```

`MapInto` returns the same destination instance. If the source is null, the destination is left unchanged. If `EnableUpdateMapping` was not configured for the pair, `MapInto` fails clearly.

Update mappings use the same sensitive-member policy as read mappings. Destination members such as tokens, secrets, passwords, API keys, and connection strings are blocked unless `AllowSensitiveMember` is configured for that pair.

## Enum Members

Enum-to-string members are mapped by name:

```csharp
CreateMap<Order, OrderResponse>();
```

Enum-to-enum members map only when every source enum name exists on the destination enum. Missing destination names produce `AFC008`.

## Collection Shapes

Convention mapping can adapt simple collection shapes when the source and destination element type is the same, such as `string[]` to `List<string>`. It does not perform deep graph collection updates or hidden item remapping in `1.6.2`.

## Inheritance And Polymorphic Mapping

Inheritance and polymorphic mapping are explicit. AstraFlow does not scan type hierarchies or infer derived maps globally.

Use `IncludeBase` on a derived pair to make the inheritance relationship visible in the mapping plan:

```csharp
CreateMap<Animal, AnimalResponse>();

CreateMap<Dog, DogResponse>()
    .IncludeBase<Animal, AnimalResponse>();
```

The derived mapping still uses normal convention member matching for inherited public properties. The plan reports `AFC017`.

Use `IncludeDerived` on a base pair when a base destination request may receive a derived destination:

```csharp
CreateMap<Animal, AnimalResponse>()
    .IncludeDerived<Dog, DogResponse>();

AnimalResponse response = mapper.Map<AnimalResponse>(new Dog());
```

The result can be `DogResponse` because the derived pair was explicitly included and `DogResponse` is assignable to `AnimalResponse`. The base plan reports `AFC018`; the derived plan reports `AFC019`.

Collection element polymorphism remains outside `1.6.2` scope.

## Value Transformers

Use value transformers when a value type should be normalized across convention mappings and the behavior should still be visible in diagnostics.

```csharp
services.AddAstraFlowConventionMapping(catalog =>
{
    catalog.AddValueTransformer<string>(value => value?.Trim());
    catalog.CreateMap<Customer, CustomerResponse>();
});
```

Transformers are explicit and convention-only. A transformed member is reported as `Transformed` when no higher-priority decision already describes it, and `AFC014` identifies the transformed destination member.

## Before And After Map Hooks

Use per-pair hooks for small side effects around convention member assignment.

```csharp
CreateMap<CustomerPatch, Customer>()
    .EnableUpdateMapping()
    .BeforeMap((source, destination) => destination.MarkChanging())
    .AfterMap((source, destination) => destination.MarkChanged());
```

Before hooks run after destination construction and before member assignment. After hooks run after member assignment. Existing destination updates run the same hooks around `MapInto`.

Hook usage is reported with `AFC015` for before-map hooks and `AFC016` for after-map hooks. Reports show hook presence, not source or destination payload values.

## Advanced Mapping

Advanced convention mapping remains opt-in per mapping pair. Flattening, unflattening, and reverse mapping are never enabled globally.

Enable flattening when a flat read DTO should receive a nested source value:

```csharp
CreateMap<Customer, CustomerResponse>()
    .EnableFlattening();
```

`Customer.Address.City` can map to `CustomerResponse.AddressCity`. The mapping plan reports the decision as `Flattened`.

Enable unflattening when flat input should write into an explicit nested destination path:

```csharp
CreateMap<CustomerPatch, Customer>()
    .EnableUnflattening();
```

`CustomerPatch.AddressCity` can map to `Customer.Address.City`. The mapping plan reports the decision as `Unflattened`. Sensitive destination write protection still applies.

Reverse mapping must be registered explicitly:

```csharp
CreateMap<Customer, CustomerResponse>()
    .ReverseMap();
```

Use `IncludeMembers` to compose destination members from selected child source members:

```csharp
CreateMap<CustomerEnvelope, CustomerResponse>()
    .IncludeMembers(source => source.Customer);
```

Use `ForPath` for a custom nested destination path:

```csharp
CreateMap<CustomerPatch, Customer>()
    .ForPath(destination => destination.Address.City, member => member
        .MapFrom(source => source.City));
```

Use `MapFrom` for custom source expressions:

```csharp
CreateMap<Person, PersonResponse>()
    .ForMember(destination => destination.FullName, member => member
        .MapFrom(source => source.FirstName + " " + source.LastName));
```

Use a resolver when member logic should live in a named type:

```csharp
public sealed class FullNameResolver : IConventionValueResolver<Person, string>
{
    public string Resolve(Person source)
    {
        return source.FirstName + " " + source.LastName;
    }
}

CreateMap<Person, PersonResponse>()
    .ForMember(destination => destination.FullName, member => member
        .ResolveUsing<FullNameResolver>());
```

Resolvers are reported in mapping plans as `Resolved` and produce `AFC013` diagnostics so resolver usage is visible.

## Include And Ignore

Use `Include` as a destination member allow list. When at least one member is included, only included destination members are mapped.

```csharp
CreateMap<Customer, CustomerSummary>()
    .Include(nameof(CustomerSummary.Name))
    .Ignore(nameof(CustomerSummary.InternalNote));
```

## Sensitive Fields

Members whose names contain fragments such as `password`, `secret`, `token`, `apiKey`, or `connectionString` are blocked by default. Allow them only when the mapping is deliberate:

```csharp
CreateMap<AuthResult, AuthResponse>()
    .AllowSensitiveMember(nameof(AuthResponse.AccessToken));
```

## Strict Mode

Strict mode is enabled by default. Warnings and errors in the convention plan fail mapping validation and runtime mapping. Disable it only when a transition needs warnings without failure:

```csharp
services.AddAstraFlowConventionMapping(
    catalog => catalog.CreateMap<Customer, CustomerResponse>(),
    options => options.StrictMode = false);
```

## Mapping Plans

Convention mappings export deterministic plans through `IMappingPlanProvider`. Diagnostics includes these plans in JSON and Markdown reports.

```csharp
var plans = provider.GetRequiredService<IMappingPlanProvider>().GetMappingPlans();
```

Each convention-created member is reported with its destination member, source member, decision, and reason.

Member-level decisions include `Converted`, `MappedWhen`, `MappedWithNullSubstitute`, `EnumToEnum`, `EnumToString`, `ConstructorBound`, `Collection`, `Flattened`, `Unflattened`, `IncludedMember`, `Resolved`, and `Transformed` when those rules are used.


