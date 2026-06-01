# Projections

AstraFlow projections are explicit LINQ expressions used to shape query results into DTOs. They are not runtime object mappings and they do not call `IMapper`.

## Install

```powershell
dotnet add package AstraFlow.Mapper --version 1.8.2
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

## Parameterized Projections

Use `IParameterizedProjection<TSource, TDestination, TParameters>` when the query shape needs explicit runtime values such as tenant ID, current user ID, culture, or a captured clock value.

```csharp
public sealed record CustomerProjectionParameters(string TenantId);

public sealed class TenantCustomerProjection
    : IParameterizedProjection<Customer, CustomerListItem, CustomerProjectionParameters>
{
    public Expression<Func<Customer, CustomerProjectionParameters, CustomerListItem>> Expression =>
        (customer, parameters) => new CustomerListItem(
            customer.Id,
            customer.Name,
            parameters.TenantId);
}
```

Apply it directly:

```csharp
var query = db.Customers.ProjectWith(
    new TenantCustomerProjection(),
    new CustomerProjectionParameters(tenantId));
```

Or resolve it through `IParameterizedProjectionRegistry`:

```csharp
var registry = provider.GetRequiredService<IParameterizedProjectionRegistry>();
var query = db.Customers.ProjectWith<Customer, CustomerListItem, CustomerProjectionParameters>(
    registry,
    new CustomerProjectionParameters(tenantId));
```

Named parameterized projections can implement `INamedParameterizedProjection<TSource, TDestination, TParameters>`.

Parameter values are bound into the expression tree. AstraFlow does not execute the query while applying or validating the projection.

## Projection Plans

`IProjectionPlanProvider` exports deterministic projection plans for CI review:

```csharp
var plans = provider.GetRequiredService<IProjectionPlanProvider>().GetProjectionPlans();
```

Plans include source type, destination type, optional projection name, optional parameter object type, public parameter members, destination member decisions, and projection findings. Plans never print entity values, DTO values, parameter values, connection strings, secrets, or tokens.

Test projects can assert exported plans with `AstraFlow.Testing`:

```csharp
var plan = plans.ShouldHaveParameterizedProjectionPlan<Customer, CustomerListItem, CustomerProjectionParameters>();
plan.ShouldHaveProjectionParameter("TenantId", typeof(Guid).FullName!);
plan.ShouldHaveNonSensitiveProjectionParameter("TenantId");
plan.ShouldHaveProjectionMember("TenantId", "Parameterized");
```

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
| `AFP106` | A projection exposes a raw public ID-shaped `Guid` member. |
| `AFP107` | A projection calls secure ID infrastructure inside the query expression. |

## Rules

- Keep expressions provider-translatable.
- Do not call services or `IMapper` inside projections.
- Use named projections when multiple shapes share the same source/destination pair.
- Use parameterized projections instead of complex closure objects for tenant/user/current-time values.
- Do not rely on registration order to pick a projection.
- Use diagnostics to inspect projection registrations and findings.

## Diagnostics

`AstraFlow.Diagnostics` reports registered projections and projection validation findings. Register diagnostics after mapper registration:

```csharp
services.AddAstraFlowMapper([typeof(CustomerAdminProjection)]);
services.AddAstraFlowDiagnostics();
```

The report includes projection rows and `AFP...` findings without printing entity values, DTO values, query results, connection strings, secrets, or captured object contents.


