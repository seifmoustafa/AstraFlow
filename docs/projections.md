# Projections

AstraFlow projections are explicit LINQ expressions used to shape query results into DTOs. They are not runtime object mappings and they do not call `IMapper`.

## Install

```powershell
dotnet add package AstraFlow.Mapper --version 1.4.1
```

## Basic Projection

```csharp
public sealed class CustomerListProjection
    : IProjection<Customer, CustomerListItem>
{
    public Expression<Func<Customer, CustomerListItem>> Expression =>
        customer => new CustomerListItem(customer.Id, customer.Name);
}
```

Register the marker assembly:

```csharp
services.AddAstraFlowMapper([typeof(CustomerListProjection)]);
```

Use it directly:

```csharp
var query = db.Customers.ProjectWith(new CustomerListProjection());
```

Or resolve it from the registry:

```csharp
var registry = provider.GetRequiredService<IProjectionRegistry>();
var query = db.Customers.ProjectWith<Customer, CustomerListItem>(registry);
```

## Named Projections

Use `INamedProjection<TSource, TDestination>` when one source/destination pair needs multiple shapes.

```csharp
public sealed class CustomerAdminProjection
    : INamedProjection<Customer, CustomerListItem>
{
    public string Name => "admin";

    public Expression<Func<Customer, CustomerListItem>> Expression =>
        customer => new CustomerListItem(customer.Id, customer.Name);
}
```

Resolve by name:

```csharp
var query = db.Customers.ProjectWith<Customer, CustomerListItem>(registry, "admin");
```

Names are case-insensitive and trimmed during lookup. Duplicate names for the same source/destination pair are reported by validation.

## Validation

Projection validation is warning-by-default:

```csharp
services.AddAstraFlowMapper(
    [typeof(CustomerAdminProjection)],
    options =>
    {
        options.ValidateProjectionCatalogOnStartup = true;
        options.ProjectionValidationMode = ProjectionValidationMode.Warning;
    });
```

Use strict mode in CI or strict startup checks:

```csharp
options.ProjectionValidationMode = ProjectionValidationMode.Error;
```

Validation findings use stable codes:

| Code | Meaning |
| --- | --- |
| `AFP001` | Multiple unnamed projections share the same source/destination pair. |
| `AFP002` | Multiple named projections share the same source/destination pair and name, or a name is invalid. |
| `AFP004` | A projection returned a null expression. |
| `AFP101` | A projection calls `IMapper` inside the expression. |
| `AFP102` | A projection calls a custom method that a query provider may not translate. |
| `AFP103` | A projection uses non-deterministic values such as `DateTime.UtcNow` or `Guid.NewGuid()`. |
| `AFP104` | A projection captures a complex closure object. |
| `AFP105` | A projection contains an unsupported construction pattern. |

## Rules

- Keep expressions provider-translatable.
- Do not call services or `IMapper` inside projections.
- Use named projections when multiple shapes share the same source/destination pair.
- Do not rely on registration order to pick a projection.
- Use diagnostics to inspect projection registrations and findings.

## Diagnostics

`AstraFlow.Diagnostics` reports registered projections and projection validation findings. Register diagnostics after mapper registration:

```csharp
services.AddAstraFlowMapper([typeof(CustomerAdminProjection)]);
services.AddAstraFlowDiagnostics();
```

The report includes projection rows and `AFP...` findings without printing entity values, DTO values, query results, connection strings, secrets, or captured object contents.
