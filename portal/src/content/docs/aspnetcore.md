# ASP.NET Core Integration

`AstraFlow.AspNetCore` wires mediator requests cleanly to Minimal APIs and MVC controllers, converts validation errors into standard RFC 9457 `ValidationProblemDetails`, and exposes policy-gated diagnostics and health summary endpoints.

## Installation & Setup

Install `AstraFlow.AspNetCore` in your `net10.0` web application project:

```bash
dotnet add package AstraFlow.AspNetCore
```

Register ASP.NET Core options and endpoint filter services alongside your mediator:

```csharp
using AstraFlow;
using AstraFlow.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddAstraFlow(validateRequestCoverage: true, typeof(Program))
    .AddAstraFlowAspNetCore(options =>
    {
        options.DiagnosticsEndpointPath = "/_astraflow/diagnostics";
        options.HealthSummaryPath = "/_astraflow/health";
        options.EnableDiagnosticsOutsideDevelopment = false;
        options.IncludeDiagnosticsFindings = false;
    });
```

## Minimal API Route Helpers

Bind routes directly to `ISender` without repetitive boilerplate using `MapAstraFlowSend` and `MapAstraFlowCommand`:

```csharp
var orders = app.MapGroup("/api/orders")
    .AddEndpointFilter<AstraFlowValidationProblemEndpointFilter>();

orders.MapAstraFlowSend<CreateOrderCommand, OrderCreatedDto>("/");
orders.MapAstraFlowCommand<CancelOrderCommand>("/cancel");
```

- **`MapAstraFlowSend<TRequest, TResponse>(pattern)`** sends `IRequest<TResponse>` via `ISender` and returns `200 OK` with the JSON response payload.
- **`MapAstraFlowCommand<TRequest>(pattern)`** sends void `IRequest` commands via `ISender` and returns `204 NoContent`.
- **`AstraFlowValidationProblemEndpointFilter`** catches validation exceptions (such as `AstraFlowValidationException` from `AstraFlow.FluentValidation`) and maps grouped property errors to `Results.ValidationProblem(errors)`.

## MVC Controller Helpers & `ProblemDetails`

If your API uses MVC controllers, dispatch via `SendAstraFlow`:

```csharp
[ApiController]
[Route("api/customers")]
public sealed class CustomersController(ISender sender) : ControllerBase
{
    [HttpPost]
    public Task<ActionResult<CustomerDto>> Create(CreateCustomerCommand command, CancellationToken ct) =>
        this.SendAstraFlow(sender, command, ct);

    [HttpPost("{id:guid}/deactivate")]
    public Task<IActionResult> Deactivate(Guid id, CancellationToken ct) =>
        this.SendAstraFlow(sender, new DeactivateCustomerCommand(id), ct);
}
```

Use `AstraFlowProblemDetailsMapper.ToValidationProblemDetails(...)` or `AstraFlowProblemDetailsMapper.ToProblemDetails(...)` inside global exception handlers to produce structured `ValidationProblemDetails` and `ProblemDetails` payloads.

## Gated Diagnostics & Health Summary Endpoints

When `AstraFlow.Diagnostics` is also registered, expose inspection routes cleanly with strict production safety defaults:

```csharp
app.MapAstraFlowDiagnostics();
app.MapAstraFlowHealthSummary();
```

By default, `MapAstraFlowDiagnostics()` returns `404 Not Found` outside `Development` unless `EnableDiagnosticsOutsideDevelopment = true` is explicitly configured, and `IncludeDiagnosticsFindings` stays `false` so only aggregate summary counts are returned unless opted in.

## Related Guides

- Pair with [FluentValidation Pipeline Integration](/docs/fluentvalidation).
- Inspect startup data behind `/_astraflow/health` in [Startup Diagnostics](/docs/diagnostics).
