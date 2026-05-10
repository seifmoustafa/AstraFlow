# Mediator Scenarios

This guide describes what should happen in common and edge-case mediator scenarios.

## Scenario Matrix

| Scenario | Setup | What Happens | Expected Outcome |
| --- | --- | --- | --- |
| Send request with one handler | Request implements one `IRequest<TResponse>` and one matching handler is registered. | Behaviors run, then handler runs. | Response is returned. |
| Send request without handler | Request is scanned or sent, but no matching handler is registered. | Handler lookup returns zero handlers. | `InvalidOperationException` says no request handler is registered. |
| Send request with duplicate handlers | More than one implementation exists for the same closed handler type. | Registration or runtime lookup detects multiple handlers. | `InvalidOperationException` says multiple handlers exist. |
| Send object request | Caller uses `Send(object)`. | AstraFlow discovers the request response type from `IRequest<TResponse>`. | Same behavior as typed send. |
| Send non-request object | Caller uses `Send(object)` with an object that does not implement `IRequest<TResponse>`. | AstraFlow cannot find a request contract. | `InvalidOperationException` says the type must implement `IRequest<>`. |
| Send ambiguous request | One request type implements multiple `IRequest<TResponse>` contracts. | AstraFlow refuses to pick a response type. | `InvalidOperationException` says the request implements multiple contracts. |
| Pipeline behavior calls `next` | Behavior wraps the next stage. | Execution continues to later behaviors and handler. | Before/after logic runs around the handler. |
| Pipeline behavior does not call `next` | Behavior returns a response directly. | Later behaviors and handler are skipped. | Short-circuit response is returned. |
| Publish notification with handlers | Notification implements `INotification`; handlers exist. | Handlers run sequentially. | Publish completes if policy permits. |
| Publish notification with no handlers | Notification implements `INotification`; no handlers exist. | Empty handler list runs. | Publish completes successfully. |
| Publish object that is not notification | Caller uses `Publish(object)` with a non-notification object. | AstraFlow validates the marker interface. | `InvalidOperationException` says the object must implement `INotification`. |

## Request/Response Dispatch

Use requests for operations that have exactly one owner and exactly one response.

```csharp
public sealed record CreateOrderCommand(string Number) : IRequest<Guid>;

public sealed class CreateOrderCommandHandler
    : IRequestHandler<CreateOrderCommand, Guid>
{
    public Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        return Task.FromResult(Guid.NewGuid());
    }
}
```

Expected behavior:

- `sender.Send(new CreateOrderCommand("ORD-1"))` returns a `Guid`.
- The handler is resolved from the current DI scope.
- The request type must declare one response type through `IRequest<Guid>`.
- If the handler is missing, the send fails clearly.

## Runtime Request Dispatch

Use `Send(object)` when the request instance comes from a runtime source such as a plugin boundary, command registry, or generic application shell.

```csharp
object request = new CreateOrderCommand("ORD-1");
object? response = await sender.Send(request);
```

Expected behavior:

- AstraFlow inspects the runtime type.
- The runtime type must implement exactly one `IRequest<TResponse>`.
- The returned value is boxed as `object?`.

Do not use `Send(object)` when normal generic typing is available. The generic overload gives clearer compile-time intent.

## Ambiguous Request Contracts

This is invalid:

```csharp
public sealed record BadRequest : IRequest<string>, IRequest<int>;
```

AstraFlow v1.0.1 rejects this. It cannot safely know whether the caller intended the string response or the integer response. Split the request into two distinct request types instead.

## Handler Registration

Register mediator services with marker types:

```csharp
services.AddAstraFlowMediator(typeof(CreateOrderCommand));
```

The marker type's assembly is scanned for concrete classes implementing closed forms of:

- `IRequestHandler<TRequest, TResponse>`
- `INotificationHandler<TNotification>`

Request handlers are single-owner by design. Notification handlers allow multiple owners.

## Coverage Validation

Use coverage validation when your scanned assemblies should contain every request handler:

```csharp
services.AddAstraFlowMediator(
    validateRequestCoverage: true,
    assemblyMarkerTypes: typeof(CreateOrderCommand));
```

Expected behavior:

- Every concrete scanned request type must have exactly one matching handler.
- A concrete scanned request type with no handler fails registration.
- A concrete scanned request type with multiple request contracts fails registration.

Keep coverage validation off when some handlers are generated, registered conditionally, or intentionally registered later outside the scanned assemblies.

## Pipeline Behaviors

Pipeline behaviors run in the order they are registered:

```csharp
services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
services.AddScoped(typeof(IPipelineBehavior<,>), typeof(FeatureGateBehavior<,>));
```

Expected order:

1. `LoggingBehavior` before
2. `ValidationBehavior` before
3. `FeatureGateBehavior` before
4. Handler
5. `FeatureGateBehavior` after
6. `ValidationBehavior` after
7. `LoggingBehavior` after

Short-circuiting is allowed:

```csharp
public Task<TResponse> Handle(
    TRequest request,
    RequestHandlerDelegate<TResponse> next,
    CancellationToken cancellationToken)
{
    return Task.FromResult(cachedResponse);
}
```

When a behavior returns without calling `next`, later behaviors and the handler do not run.

## Notification Publishing

Use notifications for in-process fan-out side effects:

```csharp
public sealed record OrderCreated(Guid OrderId) : INotification;

public sealed class SendEmailHandler : INotificationHandler<OrderCreated>
{
    public Task Handle(OrderCreated notification, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
```

Notifications are sequential in v1.0.1. AstraFlow does not run handlers in parallel.

## Notification Failure Policies

Configure failure handling through options:

```csharp
services.Configure<NotificationPublishOptions>(options =>
{
    options.FailurePolicy = NotificationFailurePolicy.Aggregate;
});
```

| Policy | First Handler Fails | Later Handlers Run? | Publish Throws? |
| --- | --- | --- | --- |
| `FailFast` | Exception is rethrown immediately. | No. | Yes, original exception. |
| `Continue` | Exception is logged. | Yes. | No. |
| `Aggregate` | Exception is logged and stored. | Yes. | Yes, `AggregateException` after all handlers run. |

## Choosing `ISender`, `IPublisher`, Or `IMediator`

| Inject | Use When |
| --- | --- |
| `ISender` | A class sends commands/queries but does not publish notifications. |
| `IPublisher` | A class publishes notifications but does not send requests. |
| `IMediator` | Composition code genuinely needs both roles. |

Prefer the narrowest interface. It makes dependencies easier to read and test.

