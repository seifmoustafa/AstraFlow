namespace AstraFlow.Mediator;

/// <summary>
/// Marker interface for an AstraFlow mediator request that returns an asynchronous stream.
/// </summary>
/// <typeparam name="TResponse">The element type produced by the stream handler.</typeparam>
public interface IStreamRequest<out TResponse>
{
}

/// <summary>
/// Handles one AstraFlow stream request type and produces an asynchronous stream.
/// </summary>
/// <typeparam name="TRequest">The stream request type handled by this handler.</typeparam>
/// <typeparam name="TResponse">The stream element type.</typeparam>
public interface IStreamRequestHandler<in TRequest, TResponse>
    where TRequest : IStreamRequest<TResponse>
{
    /// <summary>
    /// Executes the stream request.
    /// </summary>
    /// <param name="request">The stream request instance.</param>
    /// <param name="cancellationToken">Cancellation token for the stream operation.</param>
    /// <returns>The response stream.</returns>
    IAsyncEnumerable<TResponse> Handle(TRequest request, CancellationToken cancellationToken);
}

/// <summary>
/// Represents the next stage in a stream request pipeline.
/// </summary>
/// <typeparam name="TResponse">The stream element type.</typeparam>
/// <returns>The response stream from the next behavior or final handler.</returns>
public delegate IAsyncEnumerable<TResponse> StreamHandlerDelegate<TResponse>();

/// <summary>
/// Wraps stream request handling with cross-cutting behavior such as logging,
/// validation, feature gating, caching, or stream shaping.
/// </summary>
/// <typeparam name="TRequest">The stream request type being handled.</typeparam>
/// <typeparam name="TResponse">The stream element type.</typeparam>
public interface IStreamPipelineBehavior<in TRequest, TResponse>
    where TRequest : IStreamRequest<TResponse>
{
    /// <summary>
    /// Handles a stream request before and/or after the next stream pipeline stage.
    /// </summary>
    /// <param name="request">The stream request being processed.</param>
    /// <param name="next">Delegate for the next behavior or final stream handler.</param>
    /// <param name="cancellationToken">Cancellation token for the stream operation.</param>
    /// <returns>The response stream.</returns>
    IAsyncEnumerable<TResponse> Handle(
        TRequest request,
        StreamHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken);
}
