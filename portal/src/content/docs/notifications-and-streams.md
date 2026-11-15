# Notifications and Async Streams

Publish domain events to zero or many handlers with configurable execution and failure policies, or stream large result sets incrementally with `IStreamRequest<TResponse>`.

## Publishing Notifications

Model events using `INotification` and attach as many `INotificationHandler<TNotification>` implementations as needed across modules:

```csharp
using AstraFlow.Mediator;

public sealed record OrderPaidNotification(Guid OrderId, decimal Amount) : INotification;

public sealed class SendReceiptHandler(IEmailSender emails) : INotificationHandler<OrderPaidNotification>
{
    public Task Handle(OrderPaidNotification notification, CancellationToken cancellationToken) =>
        emails.SendReceiptAsync(notification.OrderId, cancellationToken);
}

public sealed class UpdateLedgerHandler(ILedger ledger) : INotificationHandler<OrderPaidNotification>
{
    public Task Handle(OrderPaidNotification notification, CancellationToken cancellationToken) =>
        ledger.RecordPaymentAsync(notification.OrderId, notification.Amount, cancellationToken);
}
```

Inject `IPublisher` (or `IMediator`) and publish events without coupling handlers to one another:

```csharp
await publisher.Publish(new OrderPaidNotification(orderId, total), cancellationToken);
```

## Notification Publishing Strategies and Failure Policies

Configure `NotificationPublishOptions` in code or via the `Mediator:Notifications` configuration section (`Mediator__Notifications__PublishStrategy`, `Mediator__Notifications__FailurePolicy`):

```json
{
  "Mediator": {
    "Notifications": {
      "PublishStrategy": "BoundedParallel",
      "MaxDegreeOfParallelism": 4,
      "FailurePolicy": "Aggregate"
    }
  }
}
```

| Option | Values | Default | Behavior |
| --- | --- | --- | --- |
| `PublishStrategy` | `Sequential`, `Parallel`, `BoundedParallel` | `Sequential` | `Sequential` preserves handler order and shared scoped services; `BoundedParallel` caps concurrent tasks via `MaxDegreeOfParallelism` |
| `FailurePolicy` | `FailFast`, `Continue`, `Aggregate` | `FailFast` | `FailFast` stops on first throw; `Continue` logs and runs remaining handlers; `Aggregate` runs all handlers then throws `AggregateException` |

> Only enable `Parallel` or `BoundedParallel` when notification handlers do not share mutable non-thread-safe scoped dependencies such as a single EF Core `DbContext`.

## Asynchronous Stream Requests

Use `IStreamRequest<TResponse>`, `IStreamRequestHandler<TRequest, TResponse>`, and `IStreamSender` when yielding paged exports, event tails, or cursor streams without buffering the full collection in memory:

```csharp
using System.Runtime.CompilerServices;
using AstraFlow.Mediator;

public sealed record StreamAuditEventsQuery(DateTimeOffset Since) : IStreamRequest<AuditEntryDto>;

public sealed class StreamAuditEventsHandler(IAuditStore store)
    : IStreamRequestHandler<StreamAuditEventsQuery, AuditEntryDto>
{
    public async IAsyncEnumerable<AuditEntryDto> Handle(
        StreamAuditEventsQuery request,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await foreach (var entry in store.ReadSinceAsync(request.Since, cancellationToken))
        {
            yield return new AuditEntryDto(entry.Id, entry.Action, entry.OccurredAt);
        }
    }
}
```

Consume the stream via `IStreamSender`:

```csharp
await foreach (var item in streamSender.CreateStream(new StreamAuditEventsQuery(since), cancellationToken))
{
    await WriteRowAsync(item, cancellationToken);
}
```

## Stream Pipeline Behaviors

Wrap stream creation and element iteration with `IStreamPipelineBehavior<TRequest, TResponse>` and register it via `mediator.AddStreamBehavior<...>()` or `mediator.AddOpenStreamBehavior(typeof(...))`.

## Related Guides

- Learn request/response mechanics in [Requests, Handlers, and Dispatch](/docs/mediator).
- Trace publish durations in [OpenTelemetry Observability](/docs/opentelemetry).
- Test notification dispatch with `FakeMediator.OnPublish` in [Testing Harnesses](/docs/testing).
