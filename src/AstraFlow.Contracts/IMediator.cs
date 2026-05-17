namespace AstraFlow.Mediator;

/// <summary>
/// Dispatches AstraFlow requests to exactly one matching request handler.
/// </summary>
public interface ISender
{
    /// <summary>
    /// Sends a strongly typed request that completes without a response value.
    /// </summary>
    /// <param name="request">The request to dispatch.</param>
    /// <param name="cancellationToken">Cancellation token for the request pipeline.</param>
    Task Send(IRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a strongly typed request through the AstraFlow mediator pipeline.
    /// </summary>
    /// <typeparam name="TResponse">The response type produced by the request handler.</typeparam>
    /// <param name="request">The request to dispatch.</param>
    /// <param name="cancellationToken">Cancellation token for the request pipeline.</param>
    /// <returns>The handler response.</returns>
    Task<TResponse> Send<TResponse>(
        IRequest<TResponse> request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a request when the request type is known only at runtime.
    /// </summary>
    /// <param name="request">The request object. It must implement exactly one request contract.</param>
    /// <param name="cancellationToken">Cancellation token for the request pipeline.</param>
    /// <returns>The handler response as an object, or null for void requests.</returns>
    Task<object?> Send(object request, CancellationToken cancellationToken = default);
}

/// <summary>
/// Creates asynchronous streams from stream request handlers.
/// </summary>
public interface IStreamSender
{
    /// <summary>
    /// Creates a strongly typed response stream for the supplied request.
    /// </summary>
    /// <typeparam name="TResponse">The stream element type.</typeparam>
    /// <param name="request">The stream request to dispatch.</param>
    /// <param name="cancellationToken">Cancellation token for stream creation and enumeration.</param>
    /// <returns>An asynchronous stream produced by the matching stream handler.</returns>
    IAsyncEnumerable<TResponse> CreateStream<TResponse>(
        IStreamRequest<TResponse> request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates an object stream when the request type is known only at runtime.
    /// </summary>
    /// <param name="request">The stream request object. It must implement exactly one stream request contract.</param>
    /// <param name="cancellationToken">Cancellation token for stream creation and enumeration.</param>
    /// <returns>An asynchronous stream whose elements are boxed as objects.</returns>
    IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default);
}

/// <summary>
/// Publishes in-process notifications to all matching notification handlers.
/// </summary>
public interface IPublisher
{
    /// <summary>
    /// Publishes a strongly typed notification to all registered handlers.
    /// </summary>
    /// <typeparam name="TNotification">The notification type.</typeparam>
    /// <param name="notification">The notification instance.</param>
    /// <param name="cancellationToken">Cancellation token for notification handlers.</param>
    Task Publish<TNotification>(
        TNotification notification,
        CancellationToken cancellationToken = default)
        where TNotification : INotification;

    /// <summary>
    /// Publishes a notification when the notification type is known only at runtime.
    /// </summary>
    /// <param name="notification">The notification object. It must implement <see cref="INotification"/>.</param>
    /// <param name="cancellationToken">Cancellation token for notification handlers.</param>
    Task Publish(object notification, CancellationToken cancellationToken = default);
}

/// <summary>
/// Combines request sending, stream request sending, and notification publishing for application workflows.
/// </summary>
public interface IMediator : ISender, IStreamSender, IPublisher
{
}
