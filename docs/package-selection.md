# Package Selection

This guide explains which AstraFlow package to install.

## Quick Decision Table

| Need | Install |
| --- | --- |
| Request/response dispatch, notifications, pipeline behaviors | `AstraFlow.Mediator` |
| Explicit object mapping, collection mapping, projections, secure ID abstraction | `AstraFlow.Mapper` |
| EF Core projection translation checks | `AstraFlow.Mapper.EntityFrameworkCore` plus `AstraFlow.Mapper` |
| JSON/Markdown registration and validation reports | `AstraFlow.Diagnostics` plus the packages you want to inspect |
| Test helpers for mediator, mapper, projection, diagnostics, and secure ID flows | `AstraFlow.Testing` plus the package under test |
| Mediator and mapper together through one convenience registration | `AstraFlow` |

Prefer focused packages when a project needs only one concern. Use the meta package when a project intentionally uses both mediator and mapper.

Target support in `1.3.0`: the core packages and `AstraFlow.Testing` support `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`. `AstraFlow.Mapper.EntityFrameworkCore` remains `net10.0` because it follows EF Core 10.

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
dotnet add package AstraFlow.Mediator --version 1.3.0
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
dotnet add package AstraFlow.Mapper --version 1.3.0
```

Use this in application or contract-mapping layers that need auditable DTO conversion.

## `AstraFlow.Mapper.EntityFrameworkCore`

Install this package only when you need EF Core relational projection validation.

Example:

```powershell
dotnet add package AstraFlow.Mapper.EntityFrameworkCore --version 1.3.0
```

This package references EF Core. Keep it out of projects that do not use EF Core.

## `AstraFlow.Diagnostics`

Install this package when you want registration and validation reports.

Example:

```powershell
dotnet add package AstraFlow.Diagnostics --version 1.3.0
```

Register diagnostics after mediator and mapper registrations so the reporter can inspect those service descriptors.

## `AstraFlow.Testing`

Install this package in test projects when you need:

- fake sender, publisher, or mediator,
- request and notification recording,
- handler harnesses,
- pipeline harnesses,
- notification handler harnesses,
- mapper and projection assertions,
- diagnostics assertions,
- deterministic secure ID test codec.

Example:

```powershell
dotnet add package AstraFlow.Testing --version 1.3.0
```

The package is test-framework-neutral. It does not depend on xUnit, NUnit, MSTest, FluentAssertions, or a mocking framework.

Use this only in test projects unless an application has a deliberate reason to run fake dispatchers.

## `AstraFlow`

Install the meta package when a project intentionally uses mediator and mapper together.

Example:

```powershell
dotnet add package AstraFlow --version 1.3.0
```

The meta package is convenient, but focused packages keep dependency intent clearer in shared libraries and smaller projects.

## Common App Shapes

| App shape | Recommended packages |
| --- | --- |
| API with CQRS handlers only | `AstraFlow.Mediator` |
| API with handlers and DTO mapping | `AstraFlow` or `AstraFlow.Mediator` plus `AstraFlow.Mapper` |
| Read-model project with EF Core projections | `AstraFlow.Mapper` plus `AstraFlow.Mapper.EntityFrameworkCore` |
| Shared contracts project | Today: focused package only if needed. Future: `AstraFlow.Contracts` is planned. |
| Test project | `AstraFlow.Testing` plus the package under test. |
| Diagnostics/reporting tool | `AstraFlow.Diagnostics` plus the packages being inspected. |

## Dependency Rules

- Do not install `AstraFlow.Mapper.EntityFrameworkCore` unless the project needs EF Core projection validation.
- Do not install `AstraFlow.Testing` in production projects unless you intentionally need fake dispatchers outside normal tests.
- Do not install the meta package in a shared contract project unless both mediator and mapper are intentionally needed.
- Keep integration packages at application boundaries.
- Keep domain projects free from runtime infrastructure packages when possible.
