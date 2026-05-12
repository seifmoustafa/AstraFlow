# Projection Scenarios

This guide describes expected behavior for projection registration, lookup, validation, and diagnostics.

| Scenario | Expected Behavior | Fix |
| --- | --- | --- |
| One unnamed projection exists for a pair | `registry.Get<TSource, TDestination>()` returns it. | No fix needed. |
| No projection exists for a pair | `Get` throws clearly; `TryGet` returns `false`. | Register an `IProjection<TSource, TDestination>`. |
| Two unnamed projections exist for a pair | Validation reports `AFP001`; `Get` throws ambiguity. | Make the projections named. |
| One named projection exists | `registry.Get<TSource, TDestination>("name")` returns it case-insensitively. | No fix needed. |
| Two named projections use the same name | Validation reports `AFP002`; named `Get` throws ambiguity. | Rename one projection. |
| Projection expression is null | Validation reports `AFP004`. | Return a real expression. |
| Projection calls `IMapper.Map` | Validation reports `AFP101`. | Replace runtime mapping with explicit expression members. |
| Projection calls a custom method | Validation reports `AFP102`. | Inline provider-translatable expression logic or validate with provider-specific tests. |
| Projection uses `DateTime.UtcNow` or `Guid.NewGuid()` | Validation reports `AFP103`. | Capture scalar values outside the query or assign values after materialization. |
| Projection captures a complex object | Validation reports `AFP104`. | Capture scalar values only. |
| Strict mode is enabled | Startup validation throws when findings exist. | Fix findings or lower mode to `Warning`. |

## Multiple Shapes

Use named projections for multiple read models:

```csharp
public sealed class UserListProjection
    : INamedProjection<User, UserDto>
{
    public string Name => "list";

    public Expression<Func<User, UserDto>> Expression =>
        user => new UserDto(user.Id, user.UserName);
}

public sealed class UserAdminProjection
    : INamedProjection<User, UserDto>
{
    public string Name => "admin";

    public Expression<Func<User, UserDto>> Expression =>
        user => new UserDto(user.Id, user.UserName);
}
```

Resolve explicitly:

```csharp
var list = db.Users.ProjectWith<User, UserDto>(registry, "list");
var admin = db.Users.ProjectWith<User, UserDto>(registry, "admin");
```

## Warning Mode

Warning mode is the default. It reports findings through `IProjectionValidator` and diagnostics without failing startup.

```csharp
options.ProjectionValidationMode = ProjectionValidationMode.Warning;
```

Use this mode for normal application adoption.

## Error Mode

Error mode turns findings into startup failures when the mapper startup validator runs.

```csharp
options.ProjectionValidationMode = ProjectionValidationMode.Error;
```

Use this mode in CI, test hosts, or applications that require projection catalogs to be clean before serving traffic.

## EF Core

Static projection validation catches expression risks. EF Core validation checks whether the `DbContext` model and relational provider can generate SQL for registered projections. See [Entity Framework Core](entity-framework-core.md).
