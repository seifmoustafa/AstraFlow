# Package Selection

This guide explains which AstraFlow package to install.

## Quick Decision Table

| Need | Install |
| --- | --- |
| Request/response dispatch, notifications, pipeline behaviors | `AstraFlow.Mediator` |
| Explicit object mapping, collection mapping, projections, secure ID abstraction | `AstraFlow.Mapper` |
| EF Core projection translation checks | `AstraFlow.Mapper.EntityFrameworkCore` plus `AstraFlow.Mapper` |
| JSON/Markdown registration and validation reports | `AstraFlow.Diagnostics` plus the packages you want to inspect |
| Mediator and mapper together through one convenience registration | `AstraFlow` |

Prefer focused packages when a project needs only one concern. Use the meta package when a project intentionally uses both mediator and mapper.

## `AstraFlow.Mediator`

Install this package when you need:

- request/response dispatch,
- command/query handling,
- notification publishing,
- pipeline behaviors,
- duplicate handler detection,
- missing handler diagnostics,
- optional handler coverage validation.

Example:

```powershell
dotnet add package AstraFlow.Mediator --version 1.2.1
```

Use this in application layers, worker services, APIs, and modular monolith modules that own request handling.

## `AstraFlow.Mapper`

Install this package when you need:

- explicit object mapping rules,
- declared mapping validation,
- collection mapping,
- explicit query projections,
- named projection registry,
- projection validation,
- secure ID mapping abstractions.

Example:

```powershell
dotnet add package AstraFlow.Mapper --version 1.2.1
```

Use this in application or contract-mapping layers that need auditable DTO conversion.

## `AstraFlow.Mapper.EntityFrameworkCore`

Install this package only when you need EF Core relational projection validation.

Example:

```powershell
dotnet add package AstraFlow.Mapper.EntityFrameworkCore --version 1.2.1
```

This package references EF Core. Keep it out of projects that do not use EF Core.

## `AstraFlow.Diagnostics`

Install this package when you want registration and validation reports.

Example:

```powershell
dotnet add package AstraFlow.Diagnostics --version 1.2.1
```

Register diagnostics after mediator and mapper registrations so the reporter can inspect those service descriptors.

## `AstraFlow`

Install the meta package when a project intentionally uses mediator and mapper together.

Example:

```powershell
dotnet add package AstraFlow --version 1.2.1
```

The meta package is convenient, but focused packages keep dependency intent clearer in shared libraries and smaller projects.

## Common App Shapes

| App shape | Recommended packages |
| --- | --- |
| API with CQRS handlers only | `AstraFlow.Mediator` |
| API with handlers and DTO mapping | `AstraFlow` or `AstraFlow.Mediator` plus `AstraFlow.Mapper` |
| Read-model project with EF Core projections | `AstraFlow.Mapper` plus `AstraFlow.Mapper.EntityFrameworkCore` |
| Shared contracts project | Today: focused package only if needed. Future: `AstraFlow.Contracts` is planned. |
| Test project | Today: reference the package under test. Future: `AstraFlow.Testing` is planned. |
| Diagnostics/reporting tool | `AstraFlow.Diagnostics` plus the packages being inspected. |

## Dependency Rules

- Do not install `AstraFlow.Mapper.EntityFrameworkCore` unless the project needs EF Core projection validation.
- Do not install the meta package in a shared contract project unless both mediator and mapper are intentionally needed.
- Keep integration packages at application boundaries.
- Keep domain projects free from runtime infrastructure packages when possible.

