# Observability

`AstraFlow.OpenTelemetry` adds production-safe tracing and metrics without adding OpenTelemetry dependencies to core packages. It uses .NET `ActivitySource` and `Meter`, so applications can connect those instruments to OpenTelemetry or another observability backend.

## Install

```powershell
dotnet add package AstraFlow.OpenTelemetry --version 1.13.1
```

Register it after mediator registration:

```csharp
using AstraFlow.OpenTelemetry;

builder.Services.AddAstraFlowMediator(typeof(Program));
builder.Services.AddAstraFlowOpenTelemetry();
```

## Activity And Metric Names

Activity source:

- `AstraFlow`

Meter:

- `AstraFlow`

Activities:

- `astraflow.request`
- `astraflow.request.void`
- `astraflow.notification.publish`
- `astraflow.mapping.validate`
- `astraflow.projection.validate`

Metrics:

- `astraflow.request.duration`
- `astraflow.request.failures`
- `astraflow.notification.duration`
- `astraflow.notification.failures`
- `astraflow.validation.findings`

## Payload Safety

By default AstraFlow telemetry does not emit request payload values, DTO payload values, secrets, tokens, connection strings, or object contents.

Type names are omitted by default to avoid high-cardinality tags:

```csharp
builder.Services.AddAstraFlowOpenTelemetry(options =>
{
    options.IncludeOperationTypeNames = false;
});
```

Opt in only when your telemetry backend and cardinality budget allow it:

```csharp
builder.Services.AddAstraFlowOpenTelemetry(options =>
{
    options.IncludeOperationTypeNames = true;
});
```

## Disable Switch

Disable AstraFlow telemetry at runtime configuration boundaries:

```csharp
builder.Services.AddAstraFlowOpenTelemetry(options =>
{
    options.Enabled = false;
});
```

When disabled, AstraFlow does not create activities and does not record metrics.

## Sampling

Use `ShouldTraceOperation` to skip selected activities while keeping metrics enabled:

```csharp
builder.Services.AddAstraFlowOpenTelemetry(options =>
{
    options.ShouldTraceOperation = name => name != AstraFlowTelemetryNames.NotificationActivity;
});
```

## OpenTelemetry Setup

Configure OpenTelemetry in the application and add AstraFlow's source and meter:

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(AstraFlowTelemetryNames.ActivitySourceName))
    .WithMetrics(metrics => metrics.AddMeter(AstraFlowTelemetryNames.MeterName));
```

The `AstraFlow.OpenTelemetry` package itself does not reference the OpenTelemetry SDK. Your app owns exporter choices, sampling policy, processors, and resource metadata.

## Validation Finding Metrics

Record validation finding counts without payloads:

```csharp
telemetry.RecordValidationFindings(findingCount);
```

This records only a count. It does not record invalid values or validation payloads.

## Mapping And Projection Validation

Wrap mapper and projection validation in telemetry activities:

```csharp
validator.ValidateWithAstraFlowTelemetry(mappingOptions, telemetry);
var report = projectionValidator.ValidateWithAstraFlowTelemetry(mappingOptions, telemetry);
```

The activities report success or error status. They do not attach mapping source values or DTO payloads.
