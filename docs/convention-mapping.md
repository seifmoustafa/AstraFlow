# Convention Mapping

`AstraFlow.Mapper.Conventions` adds opt-in convention mapping on top of the explicit mapper. It is disabled unless the application installs the package and registers convention pairs.

## Install

```powershell
dotnet add package AstraFlow.Mapper --version 1.5.1
dotnet add package AstraFlow.Mapper.Conventions --version 1.5.1
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

Destination properties must be writable. Source properties must be readable. Constructor and record binding are not part of `1.5.1`.

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

## Enum Members

Enum-to-string members are mapped by name:

```csharp
CreateMap<Order, OrderResponse>();
```

Enum-to-enum members map only when every source enum name exists on the destination enum. Missing destination names produce `AFC008`.

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

Member-level decisions include `Converted`, `MappedWhen`, `MappedWithNullSubstitute`, `EnumToEnum`, and `EnumToString` when those rules are used.
