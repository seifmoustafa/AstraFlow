# Requests, Handlers, and Dispatch

`AstraFlow.Mediator` provides deterministic, scoped in-process dispatch for commands, queries, void operations, notifications, and asynchronous streams backed by `Microsoft.Extensions.DependencyInjection`.

## Installation & Setup

Install `AstraFlow.Mediator` (or `AstraFlow.Contracts` inside contract-only class libraries):

```bash
dotnet add package AstraFlow.Mediator
```

Register handlers from one or more assemblies using marker types:

```csharp
using AstraFlow.Mediator;

builder.Services.AddAstraFlowMediator(
    validateRequestCoverage: true,
    typeof(CreateUserHandler),
    typeof(BillingModuleMarker));
```

## Request Contracts

Choose between response-returning queries/commands and void commands:

| Contract | Handler Interface | Dispatch Return Type |
| --- | --- | --- |
| `IRequest<TResponse>` | `IRequestHandler<TRequest, TResponse>` | `Task<TResponse>` |
| `IRequest` | `IRequestHandler<TRequest>` | `Task` |
| `IStreamRequest<TResponse>` | `IStreamRequestHandler<TRequest, TResponse>` | `IAsyncEnumerable<TResponse>` |

```csharp
using AstraFlow.Mediator;

// Query returning a value
public sealed record GetOrderByIdQuery(Guid OrderId) : IRequest<OrderDetailsDto?>;

public sealed class GetOrderByIdHandler(IOrderQueries queries)
    : IRequestHandler<GetOrderByIdQuery, OrderDetailsDto?>
{
    public Task<OrderDetailsDto?> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken) =>
        queries.GetByIdAsync(request.OrderId, cancellationToken);
}

// Void command completing with no payload
public sealed record ArchiveOrderCommand(Guid OrderId) : IRequest;

public sealed class ArchiveOrderHandler(IOrderRepository orders)
    : IRequestHandler<ArchiveOrderCommand>
{
    public Task Handle(ArchiveOrderCommand request, CancellationToken cancellationToken) =>
        orders.ArchiveAsync(request.OrderId, cancellationToken);
}
```

## Injecting `ISender` vs `IMediator`

Prefer the narrowest interface each consumer needs:

- **`ISender`:** Send typed or runtime `IRequest` / `IRequest<TResponse>` instances without exposing notification publishing or streaming capabilities (`sender.Send(request, cancellationToken)`).
- **`IStreamSender`:** Enumerate `IAsyncEnumerable<TResponse>` streams (`streamSender.CreateStream(request, cancellationToken)`).
- **`IPublisher`:** Publish `INotification` domain events to multiple handlers.
- **`IMediator`:** Combines `ISender`, `IStreamSender`, and `IPublisher` for orchestrators that invoke all three.

Runtime-typed dispatch (`ISender.Send(object request, CancellationToken)` and `IStreamSender.CreateStream(object request, CancellationToken)`) is also supported when integrating generic background workers or message brokers, throwing clearly if an object implements zero or multiple request contracts.

## Handler Registration & Coverage Validation

By default, `AddAstraFlowMediator` scans the supplied marker assemblies and registers every non-abstract handler type as `Scoped` (aligned with DbContext and HTTP request scopes). It rejects duplicate single-handler registrations for the same closed request type immediately at startup.

Use `validateRequestCoverage: true` (also reflected in `MediatorOptions.ValidateRequestHandlerCoverage`) to verify that every concrete `IRequest` and `IRequest<TResponse>` type in the scanned assemblies has a matching registered handler before serving traffic.

## Explicit Builder Configuration

Pass a builder delegate to wire custom pipeline behaviors, processors, or exception handlers directly alongside assembly scanning:

```csharp
builder.Services.AddAstraFlowMediator(mediator =>
{
    mediator
        .AddOpenBehavior(typeof(LoggingBehavior<,>))
        .AddBehavior<CreateOrderCommand, Guid, IdempotencyBehavior>()
        .AddVoidBehavior<ArchiveOrderCommand, AuditCommandBehavior>()
        .AddPreProcessor<CreateOrderCommand, TenantValidationPreProcessor>()
        .AddPostProcessor<GetOrderByIdQuery, OrderDetailsDto?, CachePopulatePostProcessor>();
}, typeof(CreateOrderHandler));
```

## Related Guides

- Add cross-cutting stages with [Pipeline Behaviors & Exception Handling](/docs/pipelines).
- Publish events and async streams via [Notifications & Async Streams](/docs/notifications-and-streams).
- Replace reflection scanning using [Compile-Time Mediator Registration](/docs/generated-dispatch).
