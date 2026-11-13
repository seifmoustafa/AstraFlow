# Package Selection Guide

Choose the smallest set of AstraFlow packages that covers your application boundaries. Core runtime modules avoid pulling in web frameworks, ORM providers, or test dependencies unless you opt into the matching integration package.

## Quick Selection Command

Pick modular packages explicitly or start with the convenience bundle:

```bash
# Core bundle (Contracts + Mediator + Mapper)
dotnet add package AstraFlow

# Or compose only the layers you need
dotnet add package AstraFlow.Contracts
dotnet add package AstraFlow.Mediator
dotnet add package AstraFlow.Mapper
```

## Complete Package Catalog

| Package | Targets | Dependencies | When to Install |
| --- | --- | --- | --- |
| `AstraFlow` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | `Contracts`, `Mediator`, `Mapper` | Quickest setup when your service uses both mediator dispatch and mapping |
| `AstraFlow.Contracts` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Minimal (`Microsoft.Bcl.AsyncInterfaces` on `netstandard2.0`) | Domain or Application contract assemblies that define requests, notifications, and behaviors |
| `AstraFlow.Mediator` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | `Contracts`, DI Abstractions, Logging, Options | Composition root and modules executing requests, streams, pipelines, and notifications |
| `AstraFlow.Mapper` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | DI Abstractions, Hosting Abstractions, Options | Explicit `IDeclaredObjectMappingRule`, `IProjection<,>`, startup validators, and `[AstraGenerateMapping]` |
| `AstraFlow.Mapper.Conventions` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | `Mapper`, `Security`, DI/Hosting/Options | Opt-in profile conventions (`ConventionMappingProfile`) with strict unmapped/sensitive guards |
| `AstraFlow.Mapper.EntityFrameworkCore` | `net10.0` | `Mapper`, `Microsoft.EntityFrameworkCore.Relational` | Generating SQL and validating provider translation for `IProjection<,>` against `DbContext` |
| `AstraFlow.Diagnostics` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | `Contracts`, `Mediator`, `Mapper`, `System.Text.Json` | Inspecting handler coverage, mapping catalogs, and projections as JSON or Markdown reports |
| `AstraFlow.Security` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | None | Zero-dependency sensitive field detection (`password`, `token`, `secret`) and `[redacted]` helpers |
| `AstraFlow.AspNetCore` | `net10.0` | `Contracts`, `Diagnostics`, `Mediator` | Minimal API `MapAstraFlowSend`/`MapAstraFlowCommand`, `ProblemDetails`, and diagnostics endpoints |
| `AstraFlow.FluentValidation` | `net8.0`, `net9.0`, `net10.0` | `Contracts`, `Mediator`, `FluentValidation` | Automatic validation pipeline behaviors for `IRequest` and `IRequest<TResponse>` |
| `AstraFlow.OpenTelemetry` | `net8.0`, `net9.0`, `net10.0` | `Contracts`, `Mapper`, `Mediator`, `Security` | `ActivitySource` spans, `Meter` histograms/counters, and redacted operation tagging |
| `AstraFlow.Analyzers` | `netstandard2.0` | Roslyn compiler package (`PrivateAssets="all"`) | Build-time static analysis for missing handlers, duplicate registrations, and risky projections |
| `AstraFlow.Generators` | `netstandard2.0` | Roslyn compiler package (`PrivateAssets="all"`) | Compile-time DI registration for mediator types and executable mapping implementations |
| `AstraFlow.Cli` | `net10.0` (.NET tool) | Self-contained tool | Local or CI inspection, validation, SARIF reporting, diffing, and architecture graph exports |
| `AstraFlow.Testing` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | `Contracts`, `Diagnostics`, `Mediator`, `Mapper` | Test projects needing `FakeMediator`, pipeline/handler harnesses, and test assertions |
| `AstraFlow.Assertions` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | None | Any test project wanting runner-neutral `.Should()` assertions with safe failure messages |

## Analyzer and Generator Packaging (`PrivateAssets="all"`)

Compiler packages run during build and should not flow transitively into downstream library consumers:

```xml
<ItemGroup>
  <PackageReference Include="AstraFlow.Analyzers" Version="2.4.0" PrivateAssets="all" />
  <PackageReference Include="AstraFlow.Generators" Version="2.4.0" PrivateAssets="all" />
</ItemGroup>
```

## Choosing Mapping Approaches

AstraFlow offers three complementary mapping tiers:

1. **Compile-time generated (`AstraFlow.Generators` + `[AstraGenerateMapping]`):** Zero runtime reflection and instant compiler errors on unmapped fields. See [Source-Generated Mapping](/docs/generated-mapping).
2. **Explicit declared rules (`IDeclaredObjectMappingRule`):** Handwritten mapping logic with startup pair coverage checks. See [Explicit Object Mapping](/docs/mapper).
3. **Opt-in conventions (`AstraFlow.Mapper.Conventions`):** Explicit `CreateMap<TSource, TDestination>()` profiles with strict checks against sensitive members. See [Opt-In Convention Mapping](/docs/convention-mapping).

## Related Guides

- Understand solution layering in [Modular Architecture](/docs/architecture).
- Check project target alignment in [Target Frameworks & Compatibility](/docs/compatibility).
