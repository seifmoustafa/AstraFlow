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
| Generated mediator registration and mapper/projection metadata | `AstraFlow.Generators` as a private analyzer/generator reference with `AstraFlow.Mediator` or `AstraFlow.Mapper` |
| Command-line inspection, validation, reporting, diffing, graph output, and migration scanning | `AstraFlow.Cli` as a .NET tool |
| ActivitySource tracing, duration/failure metrics, validation finding counts, redaction, and sampling controls | `AstraFlow.OpenTelemetry` |
| Mediator and mapper together through one convenience registration | `AstraFlow` |

Prefer focused packages when a project needs only one concern. Use the meta package when a project intentionally uses both mediator and mapper.

Target support in `1.13.1`: `AstraFlow.Contracts`, the core packages, `AstraFlow.Mapper.Conventions`, and `AstraFlow.Testing` support `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`. `AstraFlow.OpenTelemetry` and `AstraFlow.FluentValidation` support `net8.0`, `net9.0`, and `net10.0`. `AstraFlow.Mapper.EntityFrameworkCore` and `AstraFlow.AspNetCore` remain `net10.0` integration packages. `AstraFlow.Analyzers` and `AstraFlow.Generators` ship compiler assets under `analyzers/dotnet/cs` instead of runtime `lib/` assets.

`AstraFlow.Cli` targets `net10.0` as a .NET tool package.

## `AstraFlow.Contracts`

Install this package in projects that only need shared mediator contract types:

- request contracts,
- notification contracts,
- stream request contracts,
- sender/publisher/mediator abstractions,
- pipeline, processor, and exception-flow contracts.

Example:

```powershell
dotnet add package AstraFlow.Contracts --version 1.13.1
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
dotnet add package AstraFlow.Mediator --version 1.13.1
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
dotnet add package AstraFlow.Mapper --version 1.13.1
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
dotnet add package AstraFlow.Mapper.Conventions --version 1.13.1
```

Use this with `AstraFlow.Mapper`. Convention mapping is not enabled by the meta package and is never enabled by default.

## `AstraFlow.Mapper.EntityFrameworkCore`

Install this package only when you need EF Core relational projection validation.

Example:

```powershell
dotnet add package AstraFlow.Mapper.EntityFrameworkCore --version 1.13.1
```

This package references EF Core. Keep it out of projects that do not use EF Core.

## `AstraFlow.Diagnostics`

Install this package when you want registration and validation reports.

Example:

```powershell
dotnet add package AstraFlow.Diagnostics --version 1.13.1
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
dotnet add package AstraFlow.Testing --version 1.13.1
```

The package is test-framework-neutral. It does not depend on xUnit, NUnit, MSTest, FluentAssertions, or a mocking framework.

Use this only in test projects unless an application has a deliberate reason to run fake dispatchers.

## `AstraFlow.Analyzers`

Install this package when you want build-time AstraFlow diagnostics.

Example:

```powershell
dotnet add package AstraFlow.Analyzers --version 1.13.1
```

For project files, prefer a private analyzer reference:

```xml
<PackageReference Include="AstraFlow.Analyzers" Version="1.13.1" PrivateAssets="all" />
```

The analyzer package includes analyzer infrastructure, stable rule IDs, severity metadata, suppression guidance, tests, mediator warnings, mapper warnings, and projection warnings. Mapper and projection rules cover undeclared mapping rules, reverse sensitive writes, raw public ID projection shapes, mapper calls inside query expressions, custom projection methods, and complex projection captures.

## `AstraFlow.Generators`

Install this package when you want compile-time generated mediator component registration or mapper/projection metadata for an app or library that already uses `AstraFlow.Mediator` or `AstraFlow.Mapper`.

Example:

```powershell
dotnet add package AstraFlow.Generators --version 1.13.1
```

For project files, prefer a private generator reference:

```xml
<PackageReference Include="AstraFlow.Generators" Version="1.13.1" PrivateAssets="all" />
```

`1.13.1` includes `AddAstraFlowGeneratedMediatorRegistrations` for closed mediator components and adds `AddAstraFlowGeneratedMapperMetadata` plus `GetAstraFlowGeneratedMapperMetadata` for generated mapping rule and projection metadata. Runtime assembly scanning remains available through `AddAstraFlowMediator(...)` and `AddAstraFlowMapper(...)` and should stay as the fallback path.

## `AstraFlow.Cli`

Install this package as a .NET tool when you want command-line inspection and reporting.

Example:

```powershell
dotnet tool install --global AstraFlow.Cli --version 1.13.1
```

`1.13.1` includes:

- `astraflow inspect [path]`,
- `astraflow inspect handlers|notifications|mappings|projections`,
- `astraflow validate`,
- `astraflow report`,
- `astraflow diff`,
- `astraflow graph`,
- `astraflow scan`,
- JSON, Markdown, SARIF, Mermaid, and DOT output paths.

Use this outside application runtime projects. Application code should reference the runtime packages it needs directly.

## `AstraFlow.AspNetCore`

Install this package in ASP.NET Core applications that want AstraFlow minimal API helpers, controller helpers, endpoint filters, problem-details mapping, diagnostics endpoints, or health summaries.

Example:

```powershell
dotnet add package AstraFlow.AspNetCore --version 1.13.1
```

Use this at the web application boundary. Core/domain projects should not reference it.

## `AstraFlow.FluentValidation`

Install this package when you want FluentValidation validators to run through AstraFlow mediator pipeline behaviors.

Example:

```powershell
dotnet add package AstraFlow.FluentValidation --version 1.13.1
```

Register validators separately as `IValidator<TRequest>`. The package provides the pipeline behavior and validation diagnostics, not automatic assembly scanning.

## `AstraFlow.OpenTelemetry`

Install this package when you want opt-in AstraFlow tracing and metrics without adding observability dependencies to the core runtime packages.

Example:

```powershell
dotnet add package AstraFlow.OpenTelemetry --version 1.13.1
```

Register it after mediator registration:

```csharp
services.AddAstraFlowMediator(typeof(Program).Assembly);
services.AddAstraFlowOpenTelemetry();
```

The package emits payload-free `ActivitySource` spans and `Meter` metrics for request dispatch, void requests, notification publishing, mapper validation, and projection validation. Type-name tags are opt-in. Telemetry can be disabled globally and request tracing can be sampled by operation name.

## `AstraFlow`

Install the meta package when a project intentionally uses mediator and mapper together.

Example:

```powershell
dotnet add package AstraFlow --version 1.13.1
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
| AOT/trimming-conscious mediator or mapper app | `AstraFlow.Mediator` or `AstraFlow.Mapper` plus `AstraFlow.Generators` as a private generator reference. |
| Diagnostics/reporting tool | `AstraFlow.Diagnostics` plus the packages being inspected. |
| Command-line inspection/reporting | `AstraFlow.Cli` as a .NET tool. |
| ASP.NET Core API | `AstraFlow.AspNetCore` plus the runtime packages used by the app. |
| FluentValidation request validation | `AstraFlow.FluentValidation` plus registered `IValidator<TRequest>` validators. |
| App observability | `AstraFlow.OpenTelemetry` plus the runtime packages being observed. |

## Dependency Rules

- Do not install `AstraFlow.Mapper.EntityFrameworkCore` unless the project needs EF Core projection validation.
- Do not install `AstraFlow.Testing` in production projects unless you intentionally need fake dispatchers outside normal tests.
- Keep `AstraFlow.Analyzers` private with `PrivateAssets="all"` when using direct project file references.
- Keep `AstraFlow.Generators` private with `PrivateAssets="all"` and keep runtime scanning available until you have validated generated output in your app.
- Install `AstraFlow.Cli` as a .NET tool, not as an application runtime dependency.
- Install `AstraFlow.AspNetCore` only in ASP.NET Core boundary projects.
- Install `AstraFlow.FluentValidation` only where validators should participate in mediator pipelines.
- Install `AstraFlow.OpenTelemetry` only in application or host projects that configure observability.
- Do not install the meta package in a shared contract project unless both mediator and mapper are intentionally needed.
- Do not install `AstraFlow.Mapper.Conventions` unless convention mapping is deliberately configured.
- Keep integration packages at application boundaries.
- Keep domain projects free from runtime infrastructure packages when possible.


