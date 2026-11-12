# AstraFlow

AstraFlow is a set of .NET packages for explicit request dispatch, object mapping, diagnostics, and test workflows. Each capability is a separate package, so applications can depend on the parts they use.

**Current release:** `2.3.0` (reported published by the maintainer)

**Next release work:** `2.4.0` is in development. It is not available from NuGet yet.

The 2.4.0 assertion foundation is implemented and migrated through AstraFlow's test suite. A second approved phase expands generated mapping for inherited entity properties, nullable scalars, and immutable record DTOs; implementation is in progress. The assertion foundation's Release build, 301 tests, package install smoke checks, API comparison, upgrade smoke, and package reproducibility passed locally before this new phase; the final release matrix must be repeated after Phase 2. The 2.4.0 package remains unpublished. Generated mediator dispatch is a separate roadmap candidate, not committed release scope.

## What AstraFlow provides

- **Mediator** — route requests to one handler; compose pipelines, processors, streams, and notifications.
- **Mapper** — map through declared rules and explicit projections; validate registrations before serving traffic.
- **Optional conventions** — use pair-by-pair convention mapping with visible plans and sensitive-member safeguards.
- **Diagnostics and tooling** — inspect registrations and mapping metadata through reports, analyzers, generators, and the CLI.
- **Testing support** — use AstraFlow-specific fakes and harnesses with `AstraFlow.Testing`; the 2.4.0 source adds the general-purpose `AstraFlow.Assertions` package for any .NET test project.

AstraFlow does not choose an application architecture, add background work, or require optional integrations such as ASP.NET Core, EF Core, validation, or OpenTelemetry in the core packages.

## Install the current release

For an application that uses both mediator and explicit mapper:

```powershell
dotnet add package AstraFlow --version 2.3.0
```

For focused dependencies, install only the package needed. For example, use `AstraFlow.Mediator` without the mapper, or `AstraFlow.Mapper` without the mediator. The [package selection guide](docs/package-selection.md) lists all package boundaries and target frameworks.

## Quick start: dispatch a request

The convenience package includes mediator and mapper. Register a marker type from the assembly that contains your handlers:

```csharp
using AstraFlow.Mediator;
using AstraFlow;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddAstraFlow(assemblyMarkerTypes: typeof(CreateOrderHandler));

await using var serviceProvider = services.BuildServiceProvider();
var sender = serviceProvider.GetRequiredService<ISender>();
var result = await sender.Send(new CreateOrder("ORD-1042"), cancellationToken);
```

Define the request and its handler with ordinary .NET types:

```csharp
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

The mediator resolves the handler from the active dependency-injection scope. Missing or duplicate handlers fail clearly. Use `ISender`, `IPublisher`, or `IStreamSender` when a component needs only that part of the mediator API.

For full setup, mapping, and notification examples, start with [Getting Started](docs/getting-started.md).

## Choose packages by responsibility

| Need | Package |
| --- | --- |
| Shared request and notification contracts | `AstraFlow.Contracts` |
| Request, stream, and notification dispatch | `AstraFlow.Mediator` |
| Explicit object mapping and projections | `AstraFlow.Mapper` |
| Opt-in convention mapping | `AstraFlow.Mapper.Conventions` |
| EF Core projection translation checks | `AstraFlow.Mapper.EntityFrameworkCore` |
| Registration and validation reports | `AstraFlow.Diagnostics` |
| Shared sensitive-name and redaction policies | `AstraFlow.Security` |
| AstraFlow-specific fakes and test harnesses | `AstraFlow.Testing` |
| General-purpose test assertions | `AstraFlow.Assertions` — 2.4.0 source, not published |
| Build-time diagnostics and generated source | `AstraFlow.Analyzers`, `AstraFlow.Generators` |
| Command-line inspection and graph/report exports | `AstraFlow.Cli` |
| ASP.NET Core integration | `AstraFlow.AspNetCore` |
| FluentValidation pipeline integration | `AstraFlow.FluentValidation` |
| OpenTelemetry traces and metrics | `AstraFlow.OpenTelemetry` |
| Mediator and mapper together | `AstraFlow` convenience package |

Integrations are optional. For example, `AstraFlow.Mapper` does not require EF Core, and the core mediator does not require a validation framework.

## Testing and the 2.4.0 assertion package

`AstraFlow.Testing` helps test applications that use AstraFlow. Its fakes record mediator calls; its harnesses exercise handlers and pipelines; its specialized assertions inspect AstraFlow mapping, projection, and diagnostics behavior.

`AstraFlow.Assertions` has a different job: assert on any application's values and observable behavior. The 2.4.0 source includes equality, nullability, type, string, sequence, dictionary, enum, GUID, range, and synchronous/asynchronous exception assertions. Its shipping project has no package dependencies and does not require a particular test runner.

```csharp
using AstraFlow.Assertions;

response.StatusCode.Should().Be(201);
items.Should().ContainSingle(item => item.Id == expectedId);

Func<Task> save = () => service.SaveAsync();
await save.Should().NotThrowAsync();
```

The `2.4.0` API is under release review and has not been published. This is an original AstraFlow API; it does not promise drop-in source compatibility with another assertion library. See the [Assertions guide](docs/assertions.md) for current behavior, safe failure messages, and known gaps.

The 2.4.0 generator phase also targets direct mapping from inherited entity properties to positional records and init-only DTOs, including `Guid`, date, and safe nullable scalar flow. It is opt-in per mapping method and remains unreleased until the focused generator and clean-package-consumer gates pass; see [Generators](docs/generators.md) and the [2.4 release work plan](docs/plans/v2.4-release.md).

## What changes for a 2.3.0 application?

The current 2.4.0 plan is additive. A consumer that stays with the existing 2.3.0 packages does not receive new behavior automatically. A consumer that updates existing AstraFlow package references to 2.4.0 should restore, build, and run its tests; the release must pass API and upgrade checks before compatibility is claimed. No application database migration is part of the current scope.

To use the new assertion package, add it to the **test project only** after it is published. Existing 2.3.0 mediator, mapper, and integration code does not need to be rewritten just to keep using those packages. Adopting assertions is a separate test-code migration: update the assertion namespace and methods you choose to use, then compile and run that test suite. The initial API does not claim complete compatibility with another library.

The exact 2.3.0-to-2.4.0 feature comparison and migration guidance are in the [Version and Upgrade Guide](docs/version-upgrade-guide.md). The [2.4 roadmap](docs/roadmap.md) records which planned features pass their release gates.

## Compatibility and package targets

Target frameworks vary by package. Core libraries generally support `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`; ASP.NET Core and EF Core integrations are target-limited. Check the [compatibility table](docs/compatibility.md) for the exact package before changing a project's target framework.

## Documentation

- [Getting Started](docs/getting-started.md) — install, register, send a request, and add a mapping.
- [Package Selection](docs/package-selection.md) — choose the smallest package set for your project.
- [Mediator Guide](docs/mediator.md) and [Mediator Scenarios](docs/mediator-scenarios.md) — dispatch and failure behavior.
- [Mapper Guide](docs/mapper.md), [Projection Guide](docs/projections.md), and [Mapper Scenarios](docs/mapper-scenarios.md) — rules, projections, and validation.
- [Testing Guide](docs/testing.md) and [Assertions Guide](docs/assertions.md) — AstraFlow test helpers and general assertions.
- [Version and Upgrade Guide](docs/version-upgrade-guide.md) — release history, compatibility, and migration impact.
- [API Reference](docs/api-reference.md) — public API by package.
- [Roadmap](docs/roadmap.md) and [Decision Log](docs/strategy/decision-log.md) — scope, status, and acceptance evidence.
- [Security](SECURITY.md), [Contributing](CONTRIBUTING.md), and [MIT License](LICENSE).

## Build and test from source

```powershell
dotnet build AstraFlow.slnx --configuration Release
dotnet test AstraFlow.slnx --configuration Release --no-build
```

For package verification and publishing requirements, see the [release checklist](docs/release-checklist.md) and [publishing guide](docs/publishing.md). Package publishing is a separate release action.
