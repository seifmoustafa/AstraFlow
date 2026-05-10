# Mediator

`AstraFlow.Mediator` provides the minimum production surface needed for modular CQRS:

- `IRequest<TResponse>`
- `IRequestHandler<TRequest, TResponse>`
- `INotification`
- `INotificationHandler<TNotification>`
- `ISender`
- `IPublisher`
- `IMediator`
- `IPipelineBehavior<TRequest, TResponse>`

For every method and option, see [API Reference](api-reference.md). For expected behavior across success and failure cases, see [Mediator Scenarios](mediator-scenarios.md) and [Troubleshooting](troubleshooting.md).

Request dispatch resolves exactly one handler. Missing handlers, duplicate handlers, and request types that implement multiple `IRequest<TResponse>` contracts throw clear `InvalidOperationException` messages.

Pipeline behaviors execute in dependency-injection registration order. A behavior can short-circuit by returning a response without calling `next`.

Notifications publish sequentially. Failure handling is controlled by `NotificationPublishOptions.FailurePolicy`: `FailFast`, `Continue`, or `Aggregate`.

Handler scanning is assembly-marker based:

```csharp
services.AddAstraFlowMediator(
    validateRequestCoverage: true,
    assemblyMarkerTypes: typeof(CreateInvoiceCommand));
```

Coverage validation is optional because some applications register generated or conditional handlers later in startup.

## Recommended Handler Shape

```csharp
public sealed record GetInvoiceQuery(Guid Id) : IRequest<InvoiceResponse>;

public sealed class GetInvoiceQueryHandler
    : IRequestHandler<GetInvoiceQuery, InvoiceResponse>
{
    public Task<InvoiceResponse> Handle(GetInvoiceQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(new InvoiceResponse(request.Id, "INV-1001"));
    }
}
```

One request type should have one response type and one handler. If the same operation needs a different response shape, create a different request type.

## Recommended Injection Shape

| Interface | Recommended Consumer |
| --- | --- |
| `ISender` | Endpoints, controllers, services, and jobs that send commands or queries. |
| `IPublisher` | Handlers or services that publish notifications. |
| `IMediator` | Composition code that genuinely needs both sending and publishing. |

Prefer the narrowest interface to keep dependencies easy to review.
