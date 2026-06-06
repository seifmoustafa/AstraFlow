# Entity Framework Core

`AstraFlow.Mapper.EntityFrameworkCore` is an optional package for applications that want EF Core projection translation checks. It keeps EF Core dependencies out of `AstraFlow.Mapper`.

## Install

```powershell
dotnet add package AstraFlow.Mapper.EntityFrameworkCore --version 1.11.0
```

## Validate One Projection

```csharp
using AstraFlow.Mapper.EntityFrameworkCore;

var sql = dbContext.ValidateProjectionTranslation(new OrderListProjection());
```

The helper asks EF Core to generate SQL through the relational provider. It does not execute the query.

## Validate Registered Projections

```csharp
var registry = provider.GetRequiredService<IProjectionRegistry>();
var report = dbContext.ValidateProjectionTranslations(registry);

if (report.HasFindings)
{
    foreach (var finding in report.Findings)
    {
        Console.WriteLine($"{finding.Code}: {finding.Message}");
    }
}
```

Findings use `AFPEF...` codes. In `1.11.0`:

| Code | Meaning |
| --- | --- |
| `AFPEF001` | EF Core could not translate or prepare the projection against the current `DbContext`. |
| `AFPEF002` | The projection source type is not mapped as an EF Core entity in the current `DbContext`. |
| `AFPEF003` | A parameterized projection needs a sample parameter object for EF Core provider validation. |

Reports include provider metadata:

```csharp
Console.WriteLine(report.ProviderName);
Console.WriteLine(report.ValidatedProjectionCount);
```

## Validate Parameterized Projections

Parameterized projections require sample parameter objects for provider validation:

```csharp
var report = dbContext.ValidateProjectionTranslations(
    registry,
    new Dictionary<Type, object>
    {
        [typeof(OrderProjectionParameters)] = new OrderProjectionParameters(tenantId)
    });
```

The helper uses the sample object to bind the expression tree and ask EF Core for SQL. It still does not execute the query.

## What EF Core Validation Proves

EF Core validation proves:

- the projection source type is part of the `DbContext` model,
- the relational provider can generate SQL for the query shape,
- the expression can be applied to `DbSet<TSource>`.

It does not execute the query, read data, print payloads, or validate every provider-specific runtime edge case.

## Static Validation Still Matters

EF Core can allow some client-side work in the final projection while still generating SQL for the source query. AstraFlow's static projection validator is still responsible for warning about high-risk expression patterns such as custom method calls, `IMapper.Map`, `DateTime.UtcNow`, and `Guid.NewGuid()`.

Use both layers:

```csharp
var staticReport = projectionValidator.Validate(mappingOptions);
var efReport = dbContext.ValidateProjectionTranslations(registry);
```

## Recommended Test Pattern

Use SQLite in integration tests:

```csharp
using var connection = new SqliteConnection("DataSource=:memory:");
connection.Open();

var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseSqlite(connection)
    .Options;

using var db = new AppDbContext(options);
db.Database.EnsureCreated();

var report = db.ValidateProjectionTranslations(registry);
report.Findings.Should().BeEmpty();
```

SQLite is the recommended `1.11.0` baseline because it exercises a real relational provider without Docker or external database services.

## Provider Matrix

| Provider | Dependency location | Current `1.11.0` status |
| --- | --- | --- |
| SQLite | EF Core test project only | Covered by automated translation tests. |
| SQL Server | Future provider-specific test project or optional package | Not required for `1.11.0`; dependency must stay isolated. |
| PostgreSQL | Future provider-specific test project or optional package | Not required for `1.11.0`; dependency must stay isolated. |
| MySQL | Future provider-specific test project or optional package | Not required for `1.11.0`; dependency must stay isolated. |


