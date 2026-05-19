# Convention Mapping

`AstraFlow.Mapper.Conventions` adds opt-in convention mapping on top of the explicit mapper. It is disabled unless the application installs the package and registers convention pairs.

## Install

```powershell
dotnet add package AstraFlow.Mapper --version 1.5.0
dotnet add package AstraFlow.Mapper.Conventions --version 1.5.0
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

Destination properties must be writable. Source properties must be readable. Constructor and record binding are not part of `1.5.0`.

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
