# Package Selection

This guide explains which AstraFlow package to install.

## Quick Decision Table

| Need | Install |
| --- | --- |
| Shared mediator contracts in a contracts-only project | `AstraFlow.Contracts` |
| Request/response dispatch, void commands, stream requests, notifications, pipeline behaviors, processors, and exception flow | `AstraFlow.Mediator` |
| Explicit object mapping, collection mapping, projections, secure ID abstraction | `AstraFlow.Mapper` |
| Opt-in convention mapping with mapping plans and sensitive-field safeguards | `AstraFlow.Mapper.Conventions` plus `AstraFlow.Mapper` |
| EF Core projection translation checks | `AstraFlow.Mapper.EntityFrameworkCore` plus `AstraFlow.Mapper` |
| JSON/Markdown registration and validation reports | `AstraFlow.Diagnostics` plus the packages you want to inspect |
| Test helpers for mediator, mapper, projection, diagnostics, and secure ID flows | `AstraFlow.Testing` plus the package under test |
| Build-time AstraFlow diagnostics and stable analyzer rule IDs | `AstraFlow.Analyzers` as a private analyzer reference |
| Mediator and mapper together through one convenience registration | `AstraFlow` |

Prefer focused packages when a project needs only one concern. Use the meta package when a project intentionally uses both mediator and mapper.

Target support in `1.8.0`: `AstraFlow.Contracts`, the core packages, `AstraFlow.Mapper.Conventions`, and `AstraFlow.Testing` support `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`. `AstraFlow.Mapper.EntityFrameworkCore` remains `net10.0` because it follows EF Core 10. `AstraFlow.Analyzers` ships Roslyn analyzer assets under `analyzers/dotnet/cs` instead of runtime `lib/` assets.

## `AstraFlow.Contracts`

Install this package in projects that only need shared mediator contract types:

- request contracts,
- notification contracts,
- stream request contracts,
- sender/publisher/mediator abstractions,
- pipeline, processor, and exception-flow contracts.

Example:

```powershell
dotnet add package AstraFlow.Contracts --version 1.8.0
```

Use this in shared contracts, client contract assemblies, Blazor/shared projects, and modular boundaries that should not reference the mediator runtime.

## `AstraFlow.Mediator`

Install this package when you need:

- request/response dispatch,
- void command handling,
- stream request handling,
- command/query handling,
- notification publishing,
- pipeline behaviors,
- request pre/post processors,
- request exception actions and handlers,
- duplicate handler detection,
- missing handler diagnostics,
- optional handler coverage validation.

Example:

```powershell
dotnet add package AstraFlow.Mediator --version 1.8.0
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
dotnet add package AstraFlow.Mapper --version 1.8.0
```

Use this in application or contract-mapping layers that need auditable DTO conversion.

## `AstraFlow.Mapper.Conventions`

Install this package when you need opt-in convention mapping for simple DTOs:

- exact source/destination pair registration,
- profiles and catalogs,
- exact property-name matching,
- opt-in case-insensitive matching,
- include and ignore rules,
- sensitive-field blocking unless explicitly allowed,
- deterministic mapping plan export.

Example:

```powershell
dotnet add package AstraFlow.Mapper.Conventions --version 1.8.0
```

Use this with `AstraFlow.Mapper`. Convention mapping is not enabled by the meta package and is never enabled by default.

## `AstraFlow.Mapper.EntityFrameworkCore`

Install this package only when you need EF Core relational projection validation.

Example:

```powershell
dotnet add package AstraFlow.Mapper.EntityFrameworkCore --version 1.8.0
```

This package references EF Core. Keep it out of projects that do not use EF Core.

## `AstraFlow.Diagnostics`

Install this package when you want registration and validation reports.

Example:

```powershell
dotnet add package AstraFlow.Diagnostics --version 1.8.0
```

Register diagnostics after mediator and mapper registrations so the reporter can inspect those service descriptors.

## `AstraFlow.Testing`

Install this package in test projects when you need:

- fake sender, publisher, or mediator,
- request and notification recording,
- handler harnesses,
- pipeline harnesses,
- notification handler harnesses,
- mapper, projection, and projection plan assertions,
- diagnostics assertions,
- deterministic secure ID test codec.

Example:

```powershell
dotnet add package AstraFlow.Testing --version 1.8.0
```

The package is test-framework-neutral. It does not depend on xUnit, NUnit, MSTest, FluentAssertions, or a mocking framework.

Use this only in test projects unless an application has a deliberate reason to run fake dispatchers.

## `AstraFlow.Analyzers`

Install this package when you want build-time AstraFlow diagnostics.

Example:

```powershell
dotnet add package AstraFlow.Analyzers --version 1.8.0
```

For project files, prefer a private analyzer reference:

```xml
<PackageReference Include="AstraFlow.Analyzers" Version="1.8.0" PrivateAssets="all" />
```

`1.8.0` establishes analyzer infrastructure, stable rule IDs, severity metadata, suppression guidance, and tests. Mediator, mapper, and projection rules expand in later `1.8.x` releases.

## `AstraFlow`

Install the meta package when a project intentionally uses mediator and mapper together.

Example:

```powershell
dotnet add package AstraFlow --version 1.8.0
```

The meta package is convenient, but focused packages keep dependency intent clearer in shared libraries and smaller projects.

## Common App Shapes

| App shape | Recommended packages |
| --- | --- |
| API with CQRS handlers only | `AstraFlow.Mediator` |
| API with handlers and DTO mapping | `AstraFlow` or `AstraFlow.Mediator` plus `AstraFlow.Mapper` |
| API with simple read DTO convention mapping | `AstraFlow.Mapper` plus `AstraFlow.Mapper.Conventions` |
| Read-model project with EF Core projections | `AstraFlow.Mapper` plus `AstraFlow.Mapper.EntityFrameworkCore` |
| Shared contracts project | `AstraFlow.Contracts` |
| Test project | `AstraFlow.Testing` plus the package under test. |
| App or library with build-time guidance | `AstraFlow.Analyzers` as a private analyzer reference. |
| Diagnostics/reporting tool | `AstraFlow.Diagnostics` plus the packages being inspected. |

## Dependency Rules

- Do not install `AstraFlow.Mapper.EntityFrameworkCore` unless the project needs EF Core projection validation.
- Do not install `AstraFlow.Testing` in production projects unless you intentionally need fake dispatchers outside normal tests.
- Keep `AstraFlow.Analyzers` private with `PrivateAssets="all"` when using direct project file references.
- Do not install the meta package in a shared contract project unless both mediator and mapper are intentionally needed.
- Do not install `AstraFlow.Mapper.Conventions` unless convention mapping is deliberately configured.
- Keep integration packages at application boundaries.
- Keep domain projects free from runtime infrastructure packages when possible.


