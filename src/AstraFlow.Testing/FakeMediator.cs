using AstraFlow.Mediator;
using System.Reflection;
using System.Runtime.CompilerServices;

namespace AstraFlow.Testing;

/// <summary>
/// Framework-neutral fake mediator that records sent requests and published notifications.
/// </summary>
public sealed class FakeMediator : IMediator
{
    private readonly FakeSender sender = new();
    private readonly FakePublisher publisher = new();
    private readonly Dictionary<Type, Func<object, CancellationToken, object>> streamHandlers = new();

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
    /// Registers completion behavior for a void request type.
    /// </summary>
    public FakeMediator CompleteWith<TRequest>(Func<TRequest, CancellationToken, Task> handler)
        where TRequest : IRequest
    {
        sender.CompleteWith(handler);
        return this;
    }

    /// <summary>
    /// Registers a stream factory for a stream request type.
    /// </summary>
    public FakeMediator StreamWith<TRequest, TResponse>(
        Func<TRequest, CancellationToken, IAsyncEnumerable<TResponse>> handler)
        where TRequest : IStreamRequest<TResponse>
    {
        if (handler is null)
        {
            throw new ArgumentNullException(nameof(handler));
        }

        streamHandlers[typeof(TRequest)] = (request, cancellationToken) =>
            handler((TRequest)request, cancellationToken);
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
    /// Sends a strongly typed void request through the fake mediator.
    /// </summary>
    public Task Send(IRequest request, CancellationToken cancellationToken = default)
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
    /// Creates a configured fake stream and records the stream request.
    /// </summary>
    public IAsyncEnumerable<TResponse> CreateStream<TResponse>(
        IStreamRequest<TResponse> request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        sender.Record(request, typeof(TResponse), cancellationToken);

        if (!streamHandlers.TryGetValue(request.GetType(), out var handler))
        {
            throw new InvalidOperationException(
                $"No fake stream was registered for request type '{request.GetType().FullName}'.");
        }

        return (IAsyncEnumerable<TResponse>)handler(request, cancellationToken);
    }

    /// <summary>
    /// Creates a configured fake stream when the request type is known only at runtime.
    /// </summary>
    public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default)
    {
        var responseType = RuntimeRequestContract.GetSingleStreamResponseType(request);
        var method = typeof(FakeMediator)
            .GetMethod(nameof(CreateObjectStreamCore), BindingFlags.Instance | BindingFlags.NonPublic)!
            .MakeGenericMethod(request.GetType(), responseType);

        return (IAsyncEnumerable<object?>)method.Invoke(this, new[] { request, cancellationToken })!;
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
        streamHandlers.Clear();
    }

    private async IAsyncEnumerable<object?> CreateObjectStreamCore<TRequest, TResponse>(
        object request,
        [EnumeratorCancellation] CancellationToken cancellationToken)
        where TRequest : IStreamRequest<TResponse>
    {
        await foreach (var item in CreateStream((TRequest)request, cancellationToken).WithCancellation(cancellationToken))
            yield return item;
    }
}
