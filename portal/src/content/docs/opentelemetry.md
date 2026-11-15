# OpenTelemetry Observability & Redaction

`AstraFlow.OpenTelemetry` instruments request dispatch, void commands, notification publishing, and startup validation using standard .NET `ActivitySource` and `Meter` APIs while protecting sensitive data by default.

## Installation & Registration

Install `AstraFlow.OpenTelemetry` in your host service (`net8.0`, `net9.0`, or `net10.0`):

```bash
dotnet add package AstraFlow.OpenTelemetry
```

Call `AddAstraFlowOpenTelemetry` **after** `AddAstraFlowMediator` so `AstraFlowTelemetryPublisher` decorates `IPublisher` cleanly:

```csharp
using AstraFlow.Mediator;
using AstraFlow.OpenTelemetry;

builder.Services
    .AddAstraFlowMediator(typeof(Program))
    .AddAstraFlowOpenTelemetry(options =>
    {
        options.Enabled = true;
        options.IncludeOperationTypeNames = false;
        options.IncludeExceptionTypeNames = true;
    });

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(AstraFlowTelemetryNames.ActivitySourceName))
    .WithMetrics(metrics => metrics.AddMeter(AstraFlowTelemetryNames.MeterName));
```

## Emitted Activities and Metrics

`AstraFlowTelemetryNames` defines the stable `ActivitySource` (`"AstraFlow"`), `Meter` (`"AstraFlow"`), activity names, and metric instruments:

| Signal Kind | Instrument Name | Role |
| --- | --- | --- |
| **Activity** | `astraflow.request` | Trace span for `IPipelineBehavior<TRequest, TResponse>` execution |
| **Activity** | `astraflow.request.void` | Trace span for void `IRequestPipelineBehavior<TRequest>` execution |
| **Activity** | `astraflow.notification.publish` | Trace span for `IPublisher.Publish` via `AstraFlowTelemetryPublisher` |
| **Activity** | `astraflow.mapping.validate` | Trace span for `ValidateWithAstraFlowTelemetry` mapping checks |
| **Activity** | `astraflow.projection.validate` | Trace span for `ValidateWithAstraFlowTelemetry` projection checks |
| **Histogram** | `astraflow.request.duration` | Request duration in milliseconds (`ms`) |
| **Counter** | `astraflow.request.failures` | Count of failed request pipelines |
| **Histogram** | `astraflow.notification.duration` | Notification publish duration in milliseconds (`ms`) |
| **Counter** | `astraflow.notification.failures` | Count of failed notification publishes |
| **Counter** | `astraflow.validation.findings` | Count of validation findings |

## High-Cardinality Protection & Custom Redaction

To keep metric series and spans safe in high-throughput production workloads:

- **`IncludeOperationTypeNames` (default `false`):** Avoids attaching concrete CLR type names unless explicitly enabled for diagnostics.
- **`ShouldTraceOperation`:** Supply a `Func<string, bool>` filter on `AstraFlowTelemetryOptions` to sample out noisy internal operations while retaining metrics.
- **`IAstraFlowTelemetryRedactor`:** `AstraFlowDefaultTelemetryRedactor` applies `AstraFlow.Security` redaction rules so sensitive field tags resolve to `[redacted]`. Override `IAstraFlowTelemetryRedactor` in DI to customize redaction rules.

## Tracing Startup Validation

Use extension helpers on `IObjectMappingValidator` and `IProjectionValidator` to emit spans during startup or health checks:

```csharp
mappingValidator.ValidateWithAstraFlowTelemetry(mappingOptions, telemetry);
projectionValidator.ValidateWithAstraFlowTelemetry(mappingOptions, telemetry);
```

## Related Guides

- Learn sensitive pattern detection in [Secure Identifiers & Sensitive Data Policies](/docs/secure-ids).
- Wire host health reports in [Startup Diagnostics](/docs/diagnostics).
