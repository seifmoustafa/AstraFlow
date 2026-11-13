# AstraFlow Overview

AstraFlow is a modular .NET library suite for in-process request dispatch, explicit object mapping, compile-time source generation, Roslyn diagnostics, and test verification. Every package keeps dependencies minimal and isolates application contracts inside a lightweight `AstraFlow.Contracts` layer so your domain and application code stay clean and testable.

## Quick Start

Install the convenience package to bring in the mediator, explicit mapper, and shared contracts together, or pick only the individual modules your solution needs:

```bash
dotnet add package AstraFlow
```

Register AstraFlow in `Program.cs` and point it at an assembly marker from your application layer:

```csharp
using AstraFlow;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAstraFlow(
    validateRequestCoverage: true,
    typeof(Program));

var app = builder.Build();
```

Dispatch requests through `ISender` or `IMediator` and project or map objects explicitly with `IMapper`:

```csharp
using AstraFlow.Mapper;
using AstraFlow.Mediator;

public sealed record GetInvoiceQuery(Guid InvoiceId) : IRequest<InvoiceDto>;

public sealed class GetInvoiceHandler(IInvoiceStore store, IMapper mapper)
    : IRequestHandler<GetInvoiceQuery, InvoiceDto>
{
    public async Task<InvoiceDto> Handle(GetInvoiceQuery request, CancellationToken cancellationToken)
    {
        var invoice = await store.FindAsync(request.InvoiceId, cancellationToken);
        return mapper.Map<InvoiceDto>(invoice);
    }
}
```

## Package Suite at a Glance

AstraFlow ships 16 focused packages organized by responsibility:

| Layer | Packages | Primary Role |
| --- | --- | --- |
| **Contracts & Bundle** | `AstraFlow`, `AstraFlow.Contracts` | Zero-dependency mediator interfaces and the combined Mediator + Mapper convenience bundle |
| **Mediator** | `AstraFlow.Mediator` | Request/response, void commands, async streams, pipeline behaviors, notifications |
| **Mapping & Projections** | `AstraFlow.Mapper`, `AstraFlow.Mapper.Conventions`, `AstraFlow.Mapper.EntityFrameworkCore` | Explicit mapping rules, EF Core-translatable query projections, opt-in conventions |
| **Security & Diagnostics** | `AstraFlow.Security`, `AstraFlow.Diagnostics` | Sensitive-field classification/redaction and startup health/coverage reporting |
| **Integrations** | `AstraFlow.AspNetCore`, `AstraFlow.FluentValidation`, `AstraFlow.OpenTelemetry` | Minimal APIs & ProblemDetails, validation pipeline behaviors, traces & metrics |
| **Build-Time & CLI** | `AstraFlow.Analyzers`, `AstraFlow.Generators`, `AstraFlow.Cli` | Roslyn compile-time checks, incremental source generators, `astraflow` CLI tool |
| **Testing & Verification** | `AstraFlow.Testing`, `AstraFlow.Assertions` | Fake mediator, handler/pipeline harnesses, assertions for any test runner |

## Design Principles

- **Explicit over magic:** Mappings, query projections, and handler coverage validate at startup and build time rather than failing unexpectedly at runtime.
- **Boundary-preserving contracts:** Keep `AstraFlow.Contracts` in your core application project without pulling ASP.NET Core, Entity Framework Core, or DI implementations into domain libraries.
- **Pay-for-what-you-use modularity:** Add `AstraFlow.FluentValidation`, `AstraFlow.OpenTelemetry`, `AstraFlow.AspNetCore`, or `AstraFlow.Mapper.Conventions` only in the projects where those capabilities belong.
- **Security by default:** Sensitive member detection (`AstraFlow.Security`), strict reverse-map checks, opaque transit ID helpers (`ISecureIdCodec`), and safe telemetry/assertion redaction protect secrets and PII automatically.

## Documentation Tracks

Explore the documentation by workflow track:

- **Getting Started:** Start with [Getting Started](/docs/getting-started), review the [Package Selection Guide](/docs/package-selection), inspect [Modular Architecture](/docs/architecture), or check [Target Frameworks & Compatibility](/docs/compatibility).
- **Mediator & Pipelines:** Learn [Requests & Handlers](/docs/mediator), [Pipeline Behaviors & Exception Handling](/docs/pipelines), [Notifications & Streams](/docs/notifications-and-streams), and [Compile-Time Registration](/docs/generated-dispatch).
- **Mapping & Projections:** Read [Explicit Object Mapping](/docs/mapper), [Opt-In Convention Mapping](/docs/convention-mapping), [Query Projections](/docs/projections), [Source-Generated Mapping](/docs/generated-mapping), and [Secure Identifiers](/docs/secure-ids).
- **Framework Integrations:** Wire [ASP.NET Core](/docs/aspnetcore), [Entity Framework Core](/docs/entity-framework-core), [FluentValidation](/docs/fluentvalidation), and [OpenTelemetry](/docs/opentelemetry).
- **Testing & Tooling:** Adopt [Testing Harnesses](/docs/testing), [Standalone Fluent Assertions](/docs/assertions), [Startup Diagnostics](/docs/diagnostics), [Roslyn Analyzers](/docs/analyzers), [AstraFlow CLI](/docs/cli), and [Migration & Troubleshooting](/docs/migration-and-troubleshooting).
