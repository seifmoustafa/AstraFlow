# Pipeline Behaviors, Processors, and Exception Handling

AstraFlow executes request pipelines cleanly in deterministic stages: request pre-processors run before behaviors wrap the handler, post-processors run after successful completion, and exception actions/handlers intercept failures consistently.

## Registering a Pipeline Behavior

Implement `IPipelineBehavior<TRequest, TResponse>` for response requests or `IRequestPipelineBehavior<TRequest>` for void commands:

```csharp
using System.Diagnostics;
using AstraFlow.Mediator;
using Microsoft.Extensions.Logging;

public sealed class TimingBehavior<TRequest, TResponse>(ILogger<TimingBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var started = Stopwatch.GetTimestamp();
        var response = await next();
        var elapsed = Stopwatch.GetElapsedTime(started);

        logger.LogInformation("Handled {RequestName} in {ElapsedMs}ms", typeof(TRequest).Name, elapsed.TotalMilliseconds);
        return response;
    }
}
```

Register open behaviors explicitly on `AddAstraFlowMediator` (or directly on `IServiceCollection` as `Scoped`):

```csharp
builder.Services.AddAstraFlowMediator(mediator =>
{
    mediator.AddOpenBehavior(typeof(TimingBehavior<,>));
}, typeof(Program));
```

## Execution Order

When sending a request through `ISender.Send`, AstraFlow runs components in this order:

1. **Pre-processors** (`IRequestPreProcessor<TRequest>`) execute in DI registration order before entering the behavior chain.
2. **Pipeline behaviors** (`IPipelineBehavior<TRequest, TResponse>` or `IRequestPipelineBehavior<TRequest>`) wrap from outermost (first registered) to innermost (last registered). A behavior may short-circuit by returning early without invoking `next()`.
3. **Request handler** (`IRequestHandler<,>` or `IRequestHandler<>`) produces the response or completes the command.
4. **Post-processors** (`IRequestPostProcessor<TRequest, TResponse>` or `IRequestPostProcessor<TRequest>`) execute only when no unhandled exception occurred.
5. **Exception actions & handlers** run if any pre-processor, behavior, handler, or post-processor throws.

## Request Pre- and Post-Processors

Use `IRequestPreProcessor<TRequest>` and `IRequestPostProcessor<TRequest, TResponse>` when you only need a before or after hook without wrapping a `next()` delegate:

```csharp
using AstraFlow.Mediator;

public sealed class NormalizeOrderPreProcessor : IRequestPreProcessor<CreateOrderCommand>
{
    public Task Process(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // Enforce invariants or attach context prior to validation/execution
        return Task.CompletedTask;
    }
}

public sealed class OrderAuditPostProcessor(IAuditLog auditLog)
    : IRequestPostProcessor<CreateOrderCommand, Guid>
{
    public Task Process(CreateOrderCommand request, Guid response, CancellationToken cancellationToken) =>
        auditLog.RecordAsync("OrderCreated", response, cancellationToken);
}
```

## Exception Actions and Exception Handlers

Distinguish side-effect observers from recovery handlers:

- **`IRequestExceptionAction<TRequest, TException>` / `IRequestExceptionAction<TRequest, TResponse, TException>`:** Runs side effects such as metric counters or incident alerts. Actions never suppress or swallow the exception; the exception continues propagating.
- **`IRequestExceptionHandler<TRequest, TException>` / `IRequestExceptionHandler<TRequest, TResponse, TException>`:** Inspects the exception and optionally calls `state.SetHandled(fallbackResponse)` (or `state.SetHandled()` for void requests) to recover cleanly and return a fallback value to the caller.

```csharp
using AstraFlow.Mediator;

public sealed class FallbackOrderHandler
    : IRequestExceptionHandler<GetOrderByIdQuery, OrderDetailsDto?, KeyNotFoundException>
{
    public Task Handle(
        GetOrderByIdQuery request,
        KeyNotFoundException exception,
        RequestExceptionHandlerState<OrderDetailsDto?> state,
        CancellationToken cancellationToken)
    {
        state.SetHandled(null);
        return Task.CompletedTask;
    }
}
```

Register processors, exception actions, and exception handlers cleanly with `AstraFlowMediatorBuilder` (`AddPreProcessor`, `AddPostProcessor`, `AddVoidPostProcessor`, `AddExceptionAction`, `AddExceptionHandler`, `AddVoidExceptionAction`, `AddVoidExceptionHandler`).

## Related Guides

- Combine validation cleanly with [FluentValidation Integration](/docs/fluentvalidation).
- Instrument pipeline timings automatically with [OpenTelemetry Observability](/docs/opentelemetry).
- Unit-test behavior ordering in isolation with [Testing Harnesses](/docs/testing).
