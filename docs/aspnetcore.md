# ASP.NET Core Integration

`AstraFlow.AspNetCore` keeps web-specific behavior at the application boundary. It does not add ASP.NET Core dependencies to `AstraFlow.Contracts`, `AstraFlow.Mediator`, `AstraFlow.Mapper`, or `AstraFlow.Diagnostics`.

## Install

```powershell
dotnet add package AstraFlow.AspNetCore --version 1.13.0
```

Register AstraFlow, diagnostics, and ASP.NET Core integration in the web app:

```csharp
using AstraFlow;
using AstraFlow.AspNetCore;
using AstraFlow.Diagnostics;

builder.Services.AddAstraFlow(
    validateRequestCoverage: true,
    assemblyMarkerTypes: typeof(Program));

builder.Services.AddAstraFlowDiagnostics(options =>
{
    options.AssemblyMarkerTypes.Add(typeof(Program));
});

builder.Services.AddAstraFlowAspNetCore();
```

## Minimal API Send

Use `MapAstraFlowSend<TRequest, TResponse>` for request/response flows:

```csharp
app.MapAstraFlowSend<CreateOrderCommand, CreateOrderResponse>("/orders");

public sealed record CreateOrderCommand(string Number) : IRequest<CreateOrderResponse>;
public sealed record CreateOrderResponse(Guid Id, string Number);
```

The helper maps a POST endpoint, sends the request through `ISender`, and returns `200 OK` with the response.

Use `MapAstraFlowCommand<TRequest>` for void commands:

```csharp
app.MapAstraFlowCommand<CancelOrderCommand>("/orders/cancel");

public sealed record CancelOrderCommand(Guid Id) : IRequest;
```

The helper returns `204 No Content` after the command completes.

## Controller Send

Controller helpers are extension methods on `ControllerBase`:

```csharp
[ApiController]
[Route("orders")]
public sealed class OrdersController(ISender sender) : ControllerBase
{
    [HttpPost]
    public Task<ActionResult<CreateOrderResponse>> Create(CreateOrderCommand command)
    {
        return this.SendAstraFlow(sender, command);
    }
}
```

Void requests return `NoContent`:

```csharp
public Task<IActionResult> Cancel(CancelOrderCommand command)
{
    return this.SendAstraFlow(sender, command);
}
```

## Endpoint Filters And Problem Details

`AstraFlowValidationProblemEndpointFilter` converts validation exceptions with an `Errors` property into `Results.ValidationProblem(...)`.

```csharp
app.MapAstraFlowSend<CreateOrderCommand, CreateOrderResponse>("/orders")
    .AddEndpointFilter<AstraFlowValidationProblemEndpointFilter>();
```

For direct mapping, use `AstraFlowProblemDetailsMapper`:

```csharp
var problem = AstraFlowProblemDetailsMapper.ToValidationProblemDetails(
    new Dictionary<string, string[]>
    {
        ["Number"] = ["Required"]
    });
```

## Diagnostics Endpoint Safety

Diagnostics endpoints are development-only by default:

```csharp
app.MapAstraFlowDiagnostics();
```

By default, the HTTP payload includes only aggregate counts. Finding details are omitted unless explicitly enabled:

```csharp
builder.Services.AddAstraFlowAspNetCore(options =>
{
    options.IncludeDiagnosticsFindings = true;
});
```

Production diagnostics require explicit opt-in:

```csharp
builder.Services.AddAstraFlowAspNetCore(options =>
{
    options.EnableDiagnosticsOutsideDevelopment = true;
});
```

Never expose production diagnostics without normal application authentication, authorization, and network controls. AstraFlow does not log request payloads, DTO payloads, secrets, tokens, or connection strings by default.

## Health Summary

Map the health summary endpoint:

```csharp
app.MapAstraFlowHealthSummary();
```

The endpoint returns `Healthy` when diagnostics contain no error or fatal findings. It returns `Unhealthy` when diagnostics contain errors or fatal findings.
