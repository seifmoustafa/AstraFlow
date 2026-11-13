# Getting Started with AstraFlow

Install AstraFlow, define a typed request and handler, configure dependency injection, and verify your application wiring in minutes. This guide walks through a complete end-to-end setup for a modern .NET application.

## Installation

Add `AstraFlow` to your application host project (or install `AstraFlow.Mediator` and `AstraFlow.Mapper` individually):

```bash
dotnet add package AstraFlow
```

If your solution separates contracts and handlers into a class library that avoids DI container dependencies, install `AstraFlow.Contracts` in that core library and keep `AstraFlow` in the composition root.

## 1. Define Requests and Handlers

Model commands and queries as immutable records implementing `IRequest` (void) or `IRequest<TResponse>` (with a response value):

```csharp
using AstraFlow.Mediator;

public sealed record CreateOrderCommand(string CustomerEmail, decimal Total) : IRequest<Guid>;

public sealed class CreateOrderHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    public Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var orderId = Guid.NewGuid();
        return Task.FromResult(orderId);
    }
}
```

## 2. Add Explicit Object Mapping (Optional)

When transforming domain entities into response DTOs, implement `IDeclaredObjectMappingRule` so every mapping pair is declared and validated when your host starts:

```csharp
using AstraFlow.Mapper;

public sealed record Order(Guid Id, string CustomerEmail, decimal Total);
public sealed record OrderSummaryDto(string CustomerEmail, decimal Total);

public sealed class OrderMappingRule : IDeclaredObjectMappingRule
{
    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
    [
        ObjectMappingPair.Create<Order, OrderSummaryDto>()
    ];

    public bool CanMap(Type sourceType, Type destinationType) =>
        sourceType == typeof(Order) && destinationType == typeof(OrderSummaryDto);

    public object? Map(object? source, Type destinationType, IMapper mapper)
    {
        if (source is Order order && destinationType == typeof(OrderSummaryDto))
        {
            return new OrderSummaryDto(order.CustomerEmail, order.Total);
        }

        throw new InvalidOperationException($"Unsupported mapping from {source?.GetType().Name} to {destinationType.Name}.");
    }
}
```

For zero-boilerplate compile-time mapping methods, see [Source-Generated Mapping](/docs/generated-mapping).

## 3. Register Services and Send Requests

Call `AddAstraFlow` in `Program.cs` with assembly marker types from the assemblies containing your handlers and mapping rules:

```csharp
using AstraFlow;
using AstraFlow.Mediator;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAstraFlow(
    validateRequestCoverage: true,
    typeof(CreateOrderHandler));

var app = builder.Build();

app.MapPost("/orders", async (CreateOrderCommand command, ISender sender, CancellationToken ct) =>
{
    var orderId = await sender.Send(command, ct);
    return Results.Created($"/orders/{orderId}", new { id = orderId });
});

app.Run();
```

Setting `validateRequestCoverage: true` ensures startup fails immediately if any concrete `IRequest` or `IRequest<TResponse>` lacks an unambiguous handler.

## 4. Enable Compile-Time Guardrails

Pair your runtime setup with `AstraFlow.Analyzers` so missing handlers, duplicate registrations, or risky query projections surface right inside your IDE and CI builds:

```bash
dotnet add package AstraFlow.Analyzers
```

In your `.csproj`, keep the analyzer dependency build-time only:

```xml
<PackageReference Include="AstraFlow.Analyzers" Version="*" PrivateAssets="all" />
```

## Next Steps

- Learn how to add logging, caching, and validation stages in [Pipeline Behaviors](/docs/pipelines).
- Compare all 16 packages in the [Package Selection Guide](/docs/package-selection).
- Write fast unit tests without a container using [Testing Harnesses](/docs/testing).
