namespace AstraFlow.Mediator;

/// <summary>
/// Represents the next stage in the request pipeline.
/// </summary>
/// <typeparam name="TResponse">The response type produced by the pipeline.</typeparam>
/// <returns>The response from the next behavior or final handler.</returns>
public delegate Task<TResponse> RequestHandlerDelegate<TResponse>();

/// <summary>
/// Wraps request handling with cross-cutting behavior such as logging,
/// validation, feature gating, caching, or webhook dispatch.
/// </summary>
/// <typeparam name="TRequest">The request type being handled.</typeparam>
/// <typeparam name="TResponse">The response type produced by the request.</typeparam>
public interface IPipelineBehavior<in TRequest, TResponse>
    where TRequest : notnull
{
    /// <summary>
    /// Handles a request before and/or after the next pipeline stage.
    /// A behavior may short-circuit by returning without calling <paramref name="next"/>.
    /// </summary>
    /// <param name="request">The request being processed.</param>
    /// <param name="next">Delegate for the next behavior or final handler.</param>
    /// <param name="cancellationToken">Cancellation token for the pipeline operation.</param>
    /// <returns>The pipeline response.</returns>
    Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken);
}
