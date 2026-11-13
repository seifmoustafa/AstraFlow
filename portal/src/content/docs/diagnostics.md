# Startup Diagnostics & Health Reports

`AstraFlow.Diagnostics` inspects your registered AstraFlow services at startup or on demand, producing deterministic in-memory snapshots, JSON reports, and Markdown summaries covering handlers, pipelines, mapping rules, and query projections.

## Installation & Setup

Install `AstraFlow.Diagnostics` alongside your core mediator or mapper setup:

```bash
dotnet add package AstraFlow.Diagnostics
```

Register `AddAstraFlowDiagnostics` **after** all mediator, mapper, convention, and pipeline registrations so its captured `AstraFlowDiagnosticsSnapshot` reflects the complete container configuration:

```csharp
using AstraFlow;
using AstraFlow.Diagnostics;

builder.Services
    .AddAstraFlow(validateRequestCoverage: false, typeof(Program))
    .AddAstraFlowDiagnostics(options =>
    {
        options.AssemblyMarkerTypes.Add(typeof(Program));
        options.ValidateRequestCoverage = true;
        options.ValidateMappingCatalog = true;
        options.IncludeInfoFindings = true;
    });
```

## Generating Reports via `IAstraFlowDiagnosticsReporter`

Resolve `IAstraFlowDiagnosticsReporter` at startup, in health checks, or inside integration tests to render structured diagnostics in three formats:

```csharp
using AstraFlow.Diagnostics;

var reporter = app.Services.GetRequiredService<IAstraFlowDiagnosticsReporter>();

AstraFlowDiagnosticReport report = reporter.CreateReport();
string json = reporter.CreateJsonReport();
string markdown = reporter.CreateMarkdownReport();

if (report.Summary.HasErrors)
{
    throw new InvalidOperationException(
        $"AstraFlow detected {report.Summary.ErrorCount} diagnostic errors.");
}
```

## Report Contents & Health Summary (`AstraFlowDiagnosticsSummary`)

Each `AstraFlowDiagnosticReport` organizes discovered metadata deterministically:

- **`RequestHandlers`, `NotificationHandlers`, and `PipelineBehaviors`:** Lists registered contracts and implementations.
- **`MappingRules`, `MappingPlans`, and `Projections`:** Inventories explicit rules, convention plans, and registered `IProjection<,>` shapes.
- **`Findings`:** Aggregates coverage gaps, catalog validation failures, projection risk warnings, and registration counts sorted cleanly without exposing sensitive payload data.
- **`Summary`:** Provides aggregate counts (`RequestHandlerCount`, `NotificationHandlerCount`, `PipelineBehaviorCount`, `MappingRuleCount`, `MappingPlanCount`, `ProjectionCount`, `InfoCount`, `WarningCount`, `ErrorCount`, `FatalCount`) and a `HasErrors` helper suitable for readiness probes.

## Configuration Options (`AstraFlowDiagnosticsOptions`)

| Option | Default | Effect |
| --- | --- | --- |
| `AssemblyMarkerTypes` | `[]` | Additional assemblies scanned for request contracts missing handlers |
| `ValidateRequestCoverage` | `true` | Reports scanned requests lacking unambiguous request handlers |
| `ValidateMappingCatalog` | `true` | Runs mapper & projection catalog validators and surfaces errors/warnings |
| `IncludeInfoFindings` | `true` | Includes informational registration summary entries in `Findings` |

## Safe HTTP Exposure

Pair `AstraFlow.Diagnostics` with `AstraFlow.AspNetCore` (`MapAstraFlowDiagnostics()` and `MapAstraFlowHealthSummary()`) to expose redacted aggregate counts under `/_astraflow/health` and development-gated diagnostic views under `/_astraflow/diagnostics`.

## Related Guides

- Wire endpoints in [ASP.NET Core Integration](/docs/aspnetcore).
- Assert healthy startup wiring in [Testing Harnesses](/docs/testing).
- Audit solutions offline with [AstraFlow CLI Tool](/docs/cli).
