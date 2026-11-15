# Modular Architecture & Package Boundaries

AstraFlow separates lightweight interfaces, runtime implementations, security primitives, framework adapters, and build-time tooling into independent packages. This prevents domain assemblies from taking unwanted dependencies on ASP.NET Core, Entity Framework Core, or telemetry libraries.

## Core Dependency Flow

Place contracts in your core modules and wire runtime implementations only at your host composition root:

```csharp
// Application / Domain project (references only AstraFlow.Contracts)
using AstraFlow.Mediator;

public sealed record IssueRefundCommand(Guid PaymentId, decimal Amount) : IRequest;

// Host / Composition Root (references AstraFlow, AstraFlow.AspNetCore, AstraFlow.OpenTelemetry)
builder.Services
    .AddAstraFlowMediator(validateRequestCoverage: true, typeof(IssueRefundCommand))
    .AddAstraFlowMapper(typeof(IssueRefundCommand))
    .AddAstraFlowFluentValidation()
    .AddAstraFlowAspNetCore()
    .AddAstraFlowOpenTelemetry()
    .AddAstraFlowDiagnostics();
```

## Layer Separation

| Architectural Layer | Recommended Packages | Kept Out of Layer |
| --- | --- | --- |
| **Domain / Contracts Assembly** | `AstraFlow.Contracts` | DI container abstractions, EF Core, ASP.NET Core |
| **Application Handlers & Maps** | `AstraFlow.Contracts`, `AstraFlow.Mapper`, `AstraFlow.Analyzers`, `AstraFlow.Generators` | HTTP status codes, database context specifics |
| **Infrastructure / Persistence** | `AstraFlow.Mapper.EntityFrameworkCore`, `AstraFlow.Mapper.Conventions` | Web endpoints, test fakes |
| **API Host / Composition Root** | `AstraFlow`, `AstraFlow.AspNetCore`, `AstraFlow.FluentValidation`, `AstraFlow.OpenTelemetry`, `AstraFlow.Diagnostics` | Domain entity mutation rules |
| **Test Projects** | `AstraFlow.Testing`, `AstraFlow.Assertions` | Production DI runtime overhead |

## Why Packages Stay Independent

- **Mediator and Mapper are decoupled:** You can adopt `AstraFlow.Mediator` without adopting `AstraFlow.Mapper`, or use `AstraFlow.Mapper` and `AstraFlow.Mapper.EntityFrameworkCore` purely for DTO mapping and SQL query projections.
- **Security primitives have zero dependencies:** `AstraFlow.Security` contains `AstraFlowSensitiveDataPolicy` and `AstraFlowRedactionPolicy` with zero external references so convention mapping, telemetry redaction, and your own code share consistent sensitive-field protection.
- **Standalone Assertions need zero AstraFlow runtime:** `AstraFlow.Assertions` references no other AstraFlow package, making it safe to adopt across shared unit test libraries and runner-agnostic suites.
- **Generated dispatch mirrors runtime contracts:** `AstraFlow.Generators` emits deterministic `IServiceCollection` registrations implementing `AstraFlow.Contracts` interfaces so generated wiring works seamlessly alongside `AstraFlow.Mediator`.

## Registration Ordering Rules

When chaining integration packages on `IServiceCollection`, follow this order so decorators and open behaviors compose reliably:

1. Register `AddAstraFlowMediator(...)` (or `AddAstraFlowGeneratedMediatorRegistrations()`) first so `IMediator`, `ISender`, `IStreamSender`, and `IPublisher` exist.
2. Add pipeline integrations such as `AddAstraFlowFluentValidation()` and `AddAstraFlowOpenTelemetry()` afterward—`AddAstraFlowOpenTelemetry()` decorates `IPublisher` with `AstraFlowTelemetryPublisher`.
3. Register `AddAstraFlowMapper(...)` before `AddAstraFlowConventionMapping(...)` so convention providers plug into the core `IMapper` and startup validators.
4. Register `AddAstraFlowDiagnostics(...)` last so its startup snapshot sees every registered mediator handler, pipeline behavior, mapping rule, and projection.

## Related Guides

- Review the full matrix in [Package Selection Guide](/docs/package-selection).
- Inspect startup reports in [Startup Diagnostics](/docs/diagnostics).
- Configure HTTP endpoints in [ASP.NET Core Integration](/docs/aspnetcore).
