# Mediator

`AstraFlow.Mediator` provides the production surface needed for modular request flow:

- `IRequest`
- `IRequest<TResponse>`
- `IRequestHandler<TRequest>`
- `IRequestHandler<TRequest, TResponse>`
- `IStreamRequest<TResponse>`
- `IStreamRequestHandler<TRequest, TResponse>`
- `INotification`
- `INotificationHandler<TNotification>`
- `ISender`
- `IStreamSender`
- `IPublisher`
- `IMediator`
- `IPipelineBehavior<TRequest, TResponse>`
- `IRequestPipelineBehavior<TRequest>`
- `IStreamPipelineBehavior<TRequest, TResponse>`
- `IRequestPreProcessor<TRequest>`
- `IRequestPostProcessor<TRequest, TResponse>`
- `IRequestExceptionAction<...>`
- `IRequestExceptionHandler<...>`

For every method and option, see [API Reference](api-reference.md). For expected behavior across success and failure cases, see [Mediator Scenarios](mediator-scenarios.md) and [Troubleshooting](troubleshooting.md).

Request dispatch resolves exactly one handler. Missing handlers, duplicate handlers, and request types that implement multiple void, response, or stream request contracts throw clear `InvalidOperationException` messages.

Pipeline behaviors execute in dependency-injection registration order. A behavior can short-circuit by returning a response without calling `next`.

Notifications publish sequentially by default. Failure handling is controlled by `NotificationPublishOptions.FailurePolicy`: `FailFast`, `Continue`, or `Aggregate`. Scheduling is controlled by `NotificationPublishOptions.PublishStrategy`: `Sequential`, `Parallel`, or `BoundedParallel`.

Diagnostics report handler, notification handler, pipeline behavior, stream behavior, processor, and exception-flow registration types and lifetimes. Order-sensitive mediator registration tables preserve DI registration order. Reports do not inspect request, response, notification, or DTO payload values.

Handler scanning is assembly-marker based:

```csharp
services.AddAstraFlowMediator(
    validateRequestCoverage: true,
    assemblyMarkerTypes: typeof(CreateInvoiceCommand));
```

Coverage validation is optional because some applications register generated or conditional handlers later in startup.

## Contracts-Only Projects

Use `AstraFlow.Contracts` in shared assemblies that define requests and notifications but should not reference the mediator runtime:

```powershell
dotnet add package AstraFlow.Contracts --version 1.13.0
```

The contracts keep the `AstraFlow.Mediator` namespace so application code can use the same imports when it later references `AstraFlow.Mediator`.

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

## Void Requests

Use `IRequest` when a command has no response value:

```csharp
public sealed record RebuildSearchIndexCommand(string TenantId) : IRequest;

public sealed class RebuildSearchIndexCommandHandler
    : IRequestHandler<RebuildSearchIndexCommand>
{
    public Task Handle(RebuildSearchIndexCommand request, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
```

`Send(object)` returns `null` for void requests.

## Stream Requests

Use `IStreamRequest<TResponse>` when the handler should return an async stream:

```csharp
public sealed record ExportInvoicesQuery(Guid TenantId) : IStreamRequest<InvoiceRow>;

public sealed class ExportInvoicesQueryHandler
    : IStreamRequestHandler<ExportInvoicesQuery, InvoiceRow>
{
    public async IAsyncEnumerable<InvoiceRow> Handle(
        ExportInvoicesQuery request,
        CancellationToken cancellationToken)
    {
        yield return new InvoiceRow("INV-1001");
        await Task.CompletedTask;
    }
}
```

Inject `IStreamSender` or `IMediator` and call `CreateStream(...)`. Use `IStreamPipelineBehavior<TRequest, TResponse>` for stream-specific cross-cutting behavior.

The `CancellationToken` passed to `CreateStream(...)` is forwarded to the handler and stream behaviors. Consumers should still enumerate with the same token when possible:

```csharp
await foreach (var row in streamSender
    .CreateStream(new ExportInvoicesQuery(tenantId), cancellationToken)
    .WithCancellation(cancellationToken))
{
    // Write the row to the caller.
}
```

If enumeration stops early, normal async-iterator disposal runs for the handler and stream behaviors.

## Processors And Exception Flow

Use pre/post processors for simple before/after work. Use pipeline behaviors when the component needs to wrap or short-circuit the handler.

Pre-processors run before the handler pipeline. Post-processors run only after successful handler pipeline completion.

Exception actions observe failures and rethrow. Exception handlers must explicitly mark an exception handled through `RequestExceptionHandlerState` or `RequestExceptionHandlerState<TResponse>`. When multiple exception actions or handlers are registered for the same exception type, they run in DI registration order. More specific exception types are evaluated before base exception types.

```csharp
public sealed class RecoverCreateInvoiceFailure
    : IRequestExceptionHandler<CreateInvoiceCommand, Guid, TimeoutException>
{
    public Task Handle(
        CreateInvoiceCommand request,
        TimeoutException exception,
        RequestExceptionHandlerState<Guid> state,
        CancellationToken cancellationToken)
    {
        state.SetHandled(Guid.Empty);
        return Task.CompletedTask;
    }
}
```

## Recommended Injection Shape

| Interface | Recommended Consumer |
| --- | --- |
| `ISender` | Endpoints, controllers, services, and jobs that send commands or queries. |
| `IStreamSender` | Endpoints, jobs, or export services that dispatch stream requests. |
| `IPublisher` | Handlers or services that publish notifications. |
| `IMediator` | Composition code that genuinely needs sending, streaming, and publishing. |

Prefer the narrowest interface to keep dependencies easy to review.


