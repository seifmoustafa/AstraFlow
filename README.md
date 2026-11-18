# AstraFlow

![AstraFlow — Engineered Clarity](https://raw.githubusercontent.com/seifmoustafa/AstraFlow/main/assets/astraflow-readme.png)

A modular .NET suite of **16 focused packages** for explicit request dispatch, object mapping, query projections, compile-time analyzers, source generators, diagnostics, observability, and test workflows. Install only the packages your application needs and keep optional integrations isolated.

[Getting Started](docs/getting-started.md) · [Package Selection](docs/package-selection.md) · [Version & Upgrade Guide](docs/version-upgrade-guide.md) · [Compatibility](docs/compatibility.md) · [Changelog](CHANGELOG.md) · [Branding](docs/branding.md)

> **Release status & support policy:** The 2.4.x line includes the standalone `AstraFlow.Assertions` package, expanded compile-time mapping generation, and read-only CLI assertion migration analysis. The 2.4.1 patch fixed the package README image on NuGet.org; 2.4.2 through 2.4.5 add compile-tested assertion migration compatibility. The upcoming 2.4.6 patch adds formatted context to non-nullable comparisons and dictionary null checks. The 2.4.4 release adds formatted failure reasons across more assertion families and case-insensitive string containment checks; the published 2.4.5 patch adds formatted reasons to string, nullable, reference, and GUID assertions. Check NuGet.org for the latest package version before pinning it. All **`1.x`** packages are **deprecated** — use the **`2.x`** line.

---

## Packages (16)

| Category | Package | Targets | Role |
| --- | --- | --- | --- |
| **Core** | `AstraFlow` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Convenience umbrella for `AstraFlow.Contracts`, `AstraFlow.Mediator`, and `AstraFlow.Mapper` |
| **Core** | `AstraFlow.Contracts` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Lightweight mediator abstractions (`IRequest`, `INotification`, streams, pipelines) with zero runtime dependencies |
| **Core** | `AstraFlow.Mediator` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Request/command/stream dispatch, notifications, pipeline behaviors, processors, scanning, and handler coverage validation |
| **Core** | `AstraFlow.Mapper` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Explicit object mapping catalogs, startup validation, named projections, and secure ID abstractions |
| **Core** | `AstraFlow.Mapper.Conventions` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Opt-in convention mapping with deterministic plans, strict validation, and sensitive-field safeguards |
| **Core** | `AstraFlow.Security` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Shared sensitive-name classification and redaction policy primitives |
| **Core** | `AstraFlow.Diagnostics` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Framework-neutral JSON and Markdown registration and validation reports |
| **Tooling** | `AstraFlow.Analyzers` | `netstandard2.0` *(analyzer)* | Build-time Roslyn diagnostics for mediator, mapper, and projection contracts |
| **Tooling** | `AstraFlow.Generators` | `netstandard2.0` *(generator)* | Compile-time mediator/mapper metadata plus opt-in typed mapping generation (`[AstraGenerateMapping]`) |
| **Tooling** | `AstraFlow.Cli` | `net10.0` *(.NET tool)* | CLI inspect, validate, report, diff, Mermaid/Canvas graphs, and read-only assertion migration scan *(expanded in `2.4.0`)* |
| **Integrations** | `AstraFlow.AspNetCore` | `net10.0` | Minimal APIs, controllers, problem details, diagnostics endpoints, and health summaries |
| **Integrations** | `AstraFlow.FluentValidation` | `net8.0`, `net9.0`, `net10.0` | Validation pipeline behaviors (fail-fast and aggregate errors), localization hooks, and diagnostics |
| **Integrations** | `AstraFlow.OpenTelemetry` | `net8.0`, `net9.0`, `net10.0` | Production-safe `ActivitySource` tracing and `Meter` metrics with default redaction |
| **Integrations** | `AstraFlow.Mapper.EntityFrameworkCore` | `net10.0` | Optional EF Core queryable projection translation validation |
| **Testing** | `AstraFlow.Testing` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Framework-neutral test fakes, recording harnesses, and flow test helpers |
| **Testing** | `AstraFlow.Assertions` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Standalone, runner-neutral general-purpose assertions with zero production package dependencies |

See the [Package Selection Guide](docs/package-selection.md) for boundary rules and dependency isolation guarantees (`AstraFlow.Mapper` never pulls EF Core; `AstraFlow.Mediator` never pulls FluentValidation or OpenTelemetry).

---

## Install AstraFlow

Install the umbrella convenience package when a project uses both mediator and explicit mapping:

```powershell
dotnet add package AstraFlow
```

For cleaner layer boundaries, reference only what each assembly needs:

```powershell
# Shared domain/API contracts library (no runtime dependency)
dotnet add package AstraFlow.Contracts

# Application layer packages
dotnet add package AstraFlow.Mediator
dotnet add package AstraFlow.Mapper
```

> `AstraFlow.Assertions` ships as a standalone package starting in **`2.4.0`**. Add it to test projects that need general-purpose assertions; it is not included by the `AstraFlow` convenience package.

---

## Dispatch a request

Register the assembly containing your handlers, resolve `ISender`, and dispatch typed requests with explicit cancellation flow:

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;
using AstraFlow;
using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddAstraFlow(assemblyMarkerTypes: typeof(CreateOrderHandler));

await using var serviceProvider = services.BuildServiceProvider();
var sender = serviceProvider.GetRequiredService<ISender>();
using var cancellationTokenSource = new CancellationTokenSource();

OrderCreated result = await sender.Send(
    new CreateOrder("ORD-1042"),
    cancellationTokenSource.Token);

public sealed record CreateOrder(string Number) : IRequest<OrderCreated>;

public sealed record OrderCreated(Guid Id, string Number);

public sealed class CreateOrderHandler : IRequestHandler<CreateOrder, OrderCreated>
{
    public Task<OrderCreated> Handle(
        CreateOrder request,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(new OrderCreated(Guid.NewGuid(), request.Number));
    }
}
```

Use `ISender`, `IPublisher`, or `IStreamSender` when a consumer needs only one slice of the mediator contract. Missing or duplicate request handlers fail explicitly during startup validation.

See [Getting Started](docs/getting-started.md), the [Mediator Guide](docs/mediator.md), and [Mediator Scenarios](docs/mediator-scenarios.md).

---

## Mapping, projections, and source generation

- **Explicit runtime mapping (`AstraFlow.Mapper`):** Declared mapping catalogs, deterministic startup validation, named query projections, and secure ID encoding abstractions.
- **Opt-in conventions (`AstraFlow.Mapper.Conventions`):** Never active by default; generates inspectable mapping plans with sensitive-member write safeguards backed by `AstraFlow.Security`.
- **EF Core projection checks (`AstraFlow.Mapper.EntityFrameworkCore`):** Validates queryable projections against the configured EF Core provider.
- **Compile-time mappings (`AstraFlow.Generators`):** Opt-in `[AstraGenerateMapping]` methods supporting typed scalar, collection, `[AstraValueConverter]`, and `[AstraDerivedMapping]` shapes in `2.3.0`. Version `2.4.0` expands generation to inherited public source properties, `Guid`/temporal scalars, safe nullable scalar flows (`T -> T?`, `T? -> T?`), positional records, primary-constructor DTOs, and public `init`-only initializers.

See the [Mapper Guide](docs/mapper.md), [Projection Guide](docs/projections.md), [Convention Mapping Guide](docs/convention-mapping.md), [Generators Guide](docs/generators.md), and [Analyzers Guide](docs/analyzers.md).

---

## Testing and assertions

`AstraFlow.Testing` ships test fakes and harnesses for mediator pipelines, mapping catalogs, projections, diagnostics, and secure ID codecs on `2.3.0`.

`AstraFlow.Assertions` (targeting `2.4.0`) adds a zero-dependency, test-runner-neutral assertion package covering:

- **Values, nullables, numbers & temporals:** Equality/inequality, reference identity, runtime types, typed nullable assertions, ranges, enums, GUIDs, strict sign/precision/NaN/finite checks, and `DateTime`/`DateTimeOffset`/`TimeSpan`/`DateOnly`/`TimeOnly` comparisons.
- **Strings, exceptions & async execution:** Ordinal and explicit `StringComparison` checks, `*`/`?` wildcards, timeout-bounded regex, `WithInnerException` chaining, sync/async `ArgumentException` parameter-name checks, deferred `Invoking`/`Awaiting`/`Enumerating` helpers, finite-timeout async delegate and `TaskCompletionSource` completion/non-completion checks, one-run sync/async and subject-method execution-time measurement, and explicit `AssertionScope` multi-failure aggregation.
- **Sequences, `IAsyncEnumerable<T>` & dictionaries:** Single-pass enumeration, indexed-item and immediate-neighbor checks, ordered prefix/suffix checks, positive and negative ordered/consecutive matching for synchronous and asynchronous sequences, key-selected ascending/descending order, structural-equivalency membership/all-item checks, uniqueness and multiset checks, exact and assignable item-type checks with typed chaining, async stream assertions on `net8.0`/`net9.0`/`net10.0`, and comparer-aware dictionary entry checks, including negative pair and predicate checks.
- **Structural object-graph equivalency:** Cycle-tracked comparison of readable public properties, opt-in public instance fields (`IncludingFields()`), ordered or order-independent collections, path-based member selection, per-call exclusions, custom comparers, and recursion limits.
- **XML, HTTP & streams:** Namespace-aware `XDocument`/`XElement` structural equivalence, non-consuming `XmlReader` cursor checks, `HttpResponseMessage` status/header assertions plus buffered async text body checks, and stream mode and position/length assertions; buffered-size checks are available on `net8.0` and later without reading or disposing streams.
- **Assemblies & type reflection:** Assembly reference-boundary and declared-type checks plus exact runtime type equality and metadata-only type, inheritance, interface, constructor, and member assertions without invoking user code.
- **Runtime event monitoring:** Observe selected standard .NET events, assert raise counts and cross-event order, check `INotifyPropertyChanged` notifications, inspect captured sender/arguments, and automatically unsubscribe when the monitor is disposed.
- **Type reflection & safe diagnostics:** Metadata-only type, inheritance, interface, constructor, and member assertions without invoking user code; typed property-value selection for reference subjects; failure output omits raw object values, string literals, GUIDs, HTTP header/body text, XML values, and exception messages by default.

```csharp
using AstraFlow.Assertions; // Available in 2.4.0

response.StatusCode.Should().Be(201);
items.Should().ContainSingle(item => item.Id == expectedId);

Func<Task> save = () => service.SaveAsync();
await save.Should().NotThrowAsync();
```

See the [Testing Guide](docs/testing.md) and [Assertions Guide](docs/assertions.md) for full signatures, target matrix, and caveats.

---

## Upgrading and `1.x` deprecation policy

- **All `1.x` releases are deprecated on NuGet.org.** New projects and existing consumers should use the **`2.x`** line. Check NuGet.org for availability of the exact package version before upgrading.
- Upgrading within `2.x` preserves existing package boundaries and mediator/mapper entry points: update the AstraFlow package versions in your `.csproj` or `Directory.Packages.props`, restore, build, and run tests.
- Adopting `AstraFlow.Assertions` or `2.4.0` generated mapping expansions is optional per test project or mapping declaration.

See the [Version and Upgrade Guide](docs/version-upgrade-guide.md), [Migration Cookbook](docs/migration-cookbook.md), and [Changelog](CHANGELOG.md).

---

## Target frameworks

- **Core, security, conventions, testing & assertions:** `netstandard2.0`, `net8.0`, `net9.0`, `net10.0`
- **FluentValidation & OpenTelemetry:** `net8.0`, `net9.0`, `net10.0`
- **ASP.NET Core & EF Core:** `net10.0`
- **Analyzers & Generators:** `netstandard2.0` compiler assets (`analyzers/dotnet/cs`, no runtime `lib/` dependency)
- **CLI tool:** `net10.0` .NET tool

Check [Compatibility](docs/compatibility.md) before installing integration packages into multi-targeted libraries.

---

## Documentation map

| Topic | Guides |
| --- | --- |
| **Onboarding & Packages** | [Getting Started](docs/getting-started.md) · [Package Selection](docs/package-selection.md) · [Architecture](docs/architecture.md) · [API Reference](docs/api-reference.md) · [Compatibility](docs/compatibility.md) |
| **Mediator & Integrations** | [Mediator](docs/mediator.md) · [Mediator Scenarios](docs/mediator-scenarios.md) · [ASP.NET Core](docs/aspnetcore.md) · [FluentValidation](docs/fluentvalidation.md) · [OpenTelemetry](docs/observability.md) |
| **Mapper, Generators & CLI** | [Mapper](docs/mapper.md) · [Mapper Scenarios](docs/mapper-scenarios.md) · [Projections](docs/projections.md) · [Projection Scenarios](docs/projection-scenarios.md) · [Conventions](docs/convention-mapping.md) · [EF Core](docs/entity-framework-core.md) · [Generators](docs/generators.md) · [Analyzers](docs/analyzers.md) · [CLI](docs/cli.md) |
| **Diagnostics, Security & Tests** | [Diagnostics](docs/diagnostics.md) · [Endpoint Safety](docs/diagnostics-endpoint-safety.md) · [Security](docs/security.md) · [Testing](docs/testing.md) · [Assertions (`2.4.0`)](docs/assertions.md) · [Benchmarks](docs/benchmarks.md) |
| **Upgrades & Troubleshooting** | [Version & Upgrade Guide](docs/version-upgrade-guide.md) · [Migration Cookbook](docs/migration-cookbook.md) · [Troubleshooting](docs/troubleshooting.md) · [Branding](docs/branding.md) |
| **Roadmap & Governance** | [Roadmap](docs/roadmap.md) · [Decision Log](docs/strategy/decision-log.md) · [API Governance](docs/api-governance.md) · [Security & Supply Chain](docs/security-and-supply-chain.md) · [Security Policy](SECURITY.md) · [Contributing](CONTRIBUTING.md) · [Support](SUPPORT.md) · [MIT License](LICENSE) |

---

## Build, test, and pack from source

```powershell
dotnet build AstraFlow.slnx --configuration Release
dotnet test AstraFlow.slnx --configuration Release --no-build
.\scripts\pack.ps1
```

For release verification, SourceLink, reproducibility, and NuGet publishing rules, see the [Release Checklist](docs/release-checklist.md), [Publishing Guide](docs/publishing.md), and [Community Release Guide](docs/community-release-guide.md). Note that NuGet package READMEs require absolute raw GitHub URLs matching the target release tag/branch before packing for NuGet.org.
