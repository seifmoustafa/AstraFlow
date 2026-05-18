# Diagnostics

`AstraFlow.Diagnostics` adds framework-neutral reporting for AstraFlow registrations and validation findings. It is designed for console apps, workers, ASP.NET Core apps, tests, and CI without taking an ASP.NET Core dependency.

## Install

```powershell
dotnet add package AstraFlow.Diagnostics --version 1.4.1
```

The package references `AstraFlow.Mediator` and `AstraFlow.Mapper` so it can understand the core public contracts.

## Register

Register diagnostics after mediator and mapper services:

```csharp
services.AddAstraFlowMediator(typeof(CreateOrderCommand));
services.AddAstraFlowMapper(typeof(CustomerMappingRule));

services.AddAstraFlowDiagnostics(options =>
{
    options.AssemblyMarkerTypes.Add(typeof(CreateOrderCommand));
    options.AssemblyMarkerTypes.Add(typeof(CustomerMappingRule));
});
```

Diagnostics captures a snapshot of the service collection at registration time. If services are added after `AddAstraFlowDiagnostics`, they will not appear in the report. Put diagnostics registration near the end of service setup.

## Create Reports

```csharp
var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

AstraFlowDiagnosticReport report = reporter.CreateReport();
string json = reporter.CreateJsonReport();
string markdown = reporter.CreateMarkdownReport();
```

Use `CreateReport()` for application decisions or tests. Use JSON for tooling and CI artifacts. Use Markdown for humans, issue reports, pull requests, or startup logs in development.

## What The Report Contains

| Section | Contents |
| --- | --- |
| Summary | Counts for request handlers, notification handlers, mediator cross-cutting registrations, mapping rules, projections, and findings by severity. |
| Findings | Stable diagnostic code, severity, subject, and message. |
| Request handlers | Service type, implementation type, and DI lifetime. |
| Notification handlers | Service type, implementation type, and DI lifetime. |
| Pipeline behaviors | Open or closed behavior registration and lifetime. |
| Mapping rules | Registered `IObjectMappingRule` implementations and lifetimes. |
| Projections | Registered `IProjection<TSource, TDestination>` implementations, optional names, and lifetimes. |

The summary has `HasErrors`, which is suitable for health-check-style decisions without requiring an ASP.NET Core health check dependency.

## Options

| Option | Default | Meaning |
| --- | --- | --- |
| `AssemblyMarkerTypes` | Empty | Extra assemblies to scan for request coverage. Add marker types when request contracts live outside handler assemblies. |
| `ValidateRequestCoverage` | `true` | Reports missing request handlers and request types with multiple `IRequest<TResponse>` contracts. |
| `ValidateMappingCatalog` | `true` | Resolves mapper validation and reports catalog failures. |
| `IncludeInfoFindings` | `true` | Emits informational count findings. |

## Finding Codes

| Code | Severity | Meaning | Fix |
| --- | --- | --- | --- |
| `AFD000` | `Info` | Registration counts were discovered. | No fix required. |
| `AFD101` | `Error` | Multiple request handlers are registered for the same request. | Keep exactly one handler per request/response pair. |
| `AFD102` | `Error` | One request type implements multiple response contracts. | Split the request into separate request types. |
| `AFD103` | `Error` | A scanned request has no registered handler. | Add the handler or include the handler assembly marker. |
| `AFD201` | `Warning` | Handler, behavior, or mapping rule is singleton. | Prefer scoped lifetime unless singleton is deliberate and dependency-safe. |
| `AFD301` | `Error` | Mapper catalog validation failed. | Fix declared mapping ownership, duplicate pairs, or undeclared rules. |
| `AFD302` | `Error` | Projection validation failed unexpectedly while diagnostics were generated. | Fix the thrown validation error or DI configuration. |
| `AFP...` | `Warning` or `Error` | Projection registry or expression validation finding. | See [Projections](projections.md). |

## JSON Output

Default JSON output is indented and camelCase:

```csharp
string json = reporter.CreateJsonReport();
```

Pass custom `JsonSerializerOptions` when a tool needs different formatting:

```csharp
string json = reporter.CreateJsonReport(new JsonSerializerOptions
{
    WriteIndented = false
});
```

## Markdown Output

```csharp
string markdown = reporter.CreateMarkdownReport();
```

Markdown includes:

- summary table,
- findings table,
- request handler table,
- notification handler table,
- mediator cross-cutting table for pipeline behaviors, stream behaviors, processors, exception actions, and exception handlers,
- mapping rule table,
- projection table.

Named projections are shown in the projection service column as `[name: value]`.

## Security Model

Diagnostics reports type names, categories, lifetimes, counts, and validation messages. It does not inspect:

- request payloads,
- notification payloads,
- DTO values,
- encrypted IDs,
- connection strings,
- tokens,
- secrets,
- environment variable values.

Keep validation exception messages free of secret values in application code.

## Recommended Usage

For local development, print Markdown:

```csharp
if (builder.Environment.IsDevelopment())
{
    var reporter = app.Services.GetRequiredService<IAstraFlowDiagnosticsReporter>();
    Console.WriteLine(reporter.CreateMarkdownReport());
}
```

For tests, assert the summary:

```csharp
var report = reporter.CreateReport();
report.Summary.HasErrors.Should().BeFalse();
```

For CI, write JSON or Markdown as an artifact. Do not fail CI on warnings until the team agrees on warning policy.
