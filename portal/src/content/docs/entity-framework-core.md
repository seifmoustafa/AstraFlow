# Entity Framework Core Projections

`AstraFlow.Mapper.EntityFrameworkCore` bridges `IProjection<TSource, TDestination>` and `IParameterizedProjection<TSource, TDestination, TParameters>` with EF Core relational providers so you can verify SQL translation across your entire projection catalog in unit and integration tests without executing queries against live rows.

## Installation

Install `AstraFlow.Mapper.EntityFrameworkCore` in your persistence or integration test project (`net10.0`):

```bash
dotnet add package AstraFlow.Mapper.EntityFrameworkCore
```

## Validating a Single Projection Translation

Call `ValidateProjectionTranslation` on any `DbContext` to compile the `Select` expression to relational SQL via `.ToQueryString()` without hitting the database:

```csharp
using AstraFlow.Mapper.EntityFrameworkCore;

string sql = dbContext.ValidateProjectionTranslation(new OrderSummaryProjection());
```

For parameterized projections, pass a representative parameter object:

```csharp
string parameterizedSql = dbContext.ValidateProjectionTranslation(
    new ActiveOfferProjection(),
    new PricingContext(0.10m, DateTimeOffset.UtcNow));
```

If any expression inside `IProjection<,>.Expression` cannot be translated by your configured EF Core database provider (such as PostgreSQL, SQL Server, or SQLite), EF Core throws a translation error immediately inside the validation call.

## Validating All Registered Projections in CI

Run `ValidateProjectionTranslations` against your application's `IProjectionRegistry` in a single test to audit every projection across your solution:

```csharp
using AstraFlow.Mapper;
using AstraFlow.Mapper.EntityFrameworkCore;
using AstraFlow.Assertions;

var parameterSamples = new Dictionary<Type, object>
{
    [typeof(PricingContext)] = new PricingContext(0.10m, DateTimeOffset.UtcNow)
};

EfCoreProjectionValidationReport report =
    dbContext.ValidateProjectionTranslations(projectionRegistry, parameterSamples);

report.HasFindings.Should().BeFalse();
```

Each finding inside `EfCoreProjectionValidationReport` reports:

- Missing sample parameter objects for parameterized projections so parameterizable queries are never silently skipped.
- Entities missing from the `DbContext` model or provider translation failures with the underlying EF Core exception detail.
- Source type, destination type, projection name (for named projections), and the active EF Core provider name.

## Best Practices for Translatable Projections

- Keep projection expressions free of DI service calls, runtime `IMapper.Map(...)` invocations, and non-translatable C# helper methods.
- Avoid capturing mutable objects or complex service instances inside expression trees—pass scalar inputs explicitly via `IParameterizedProjection<,,>`.
- Keep raw `Guid` keys internal or transform identifiers after query materialization when public opaque IDs are required.

## Related Guides

- Learn `ProjectWith` and parameterized projection authoring in [Query Projections & Parameter Binding](/docs/projections).
- Catch un-translatable query patterns before running tests in [Build-Time Roslyn Analyzers](/docs/analyzers).
