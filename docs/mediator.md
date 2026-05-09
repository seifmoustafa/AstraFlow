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

Request dispatch resolves exactly one handler. Missing handlers and duplicate handlers throw clear `InvalidOperationException` messages.

Pipeline behaviors execute in dependency-injection registration order. A behavior can short-circuit by returning a response without calling `next`.

Notifications publish sequentially. Failure handling is controlled by `NotificationPublishOptions.FailurePolicy`: `FailFast`, `Continue`, or `Aggregate`.

Handler scanning is assembly-marker based:

```csharp
services.AddAstraFlowMediator(
    validateRequestCoverage: true,
    assemblyMarkerTypes: typeof(CreateInvoiceCommand));
```

Coverage validation is optional because some applications register generated or conditional handlers later in startup.
