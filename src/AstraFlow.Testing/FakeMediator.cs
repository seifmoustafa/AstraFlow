using AstraFlow.Mediator;

namespace AstraFlow.Testing;

/// <summary>
/// Framework-neutral fake mediator that records sent requests and published notifications.
/// </summary>
public sealed class FakeMediator : IMediator
{
    private readonly FakeSender sender = new();
    private readonly FakePublisher publisher = new();

    /// <summary>
    /// Gets the requests sent through this fake mediator.
    /// </summary>
    public IReadOnlyList<RecordedRequest> Requests => sender.Requests;

    /// <summary>
    /// Gets the notifications published through this fake mediator.
    /// </summary>
    public IReadOnlyList<RecordedNotification> Notifications => publisher.Notifications;

    /// <summary>
    /// Registers a response factory for a request type.
    /// </summary>
    public FakeMediator RespondWith<TRequest, TResponse>(
        Func<TRequest, CancellationToken, Task<TResponse>> handler)
        where TRequest : IRequest<TResponse>
    {
        sender.RespondWith(handler);
        return this;
    }

    /// <summary>
    /// Registers a constant response for a request type.
    /// </summary>
    public FakeMediator RespondWith<TRequest, TResponse>(TResponse response)
        where TRequest : IRequest<TResponse>
    {
        sender.RespondWith<TRequest, TResponse>(response);
        return this;
    }

    /// <summary>
    /// Registers a fake notification handler.
    /// </summary>
    public FakeMediator OnPublish<TNotification>(
        Func<TNotification, CancellationToken, Task> handler)
        where TNotification : INotification
    {
        publisher.OnPublish(handler);
        return this;
    }

    /// <summary>
    /// Sends a strongly typed request through the fake mediator.
    /// </summary>
    public Task<TResponse> Send<TResponse>(
        IRequest<TResponse> request,
        CancellationToken cancellationToken = default)
    {
        return sender.Send(request, cancellationToken);
    }

    /// <summary>
    /// Sends a runtime request object through the fake mediator.
    /// </summary>
    public Task<object?> Send(object request, CancellationToken cancellationToken = default)
    {
        return sender.Send(request, cancellationToken);
    }

    /// <summary>
    /// Publishes a strongly typed notification through the fake mediator.
    /// </summary>
    public Task Publish<TNotification>(
        TNotification notification,
        CancellationToken cancellationToken = default)
        where TNotification : INotification
    {
        return publisher.Publish(notification, cancellationToken);
    }

    /// <summary>
    /// Publishes a runtime notification object through the fake mediator.
    /// </summary>
    public Task Publish(object notification, CancellationToken cancellationToken = default)
    {
        return publisher.Publish(notification, cancellationToken);
    }

    /// <summary>
    /// Clears recorded requests, recorded notifications, and configured fake behavior.
    /// </summary>
    public void Clear()
    {
        sender.Clear();
        publisher.Clear();
    }
}
