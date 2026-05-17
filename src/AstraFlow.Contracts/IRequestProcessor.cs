namespace AstraFlow.Mediator;

/// <summary>
/// Runs before a request handler and pipeline complete.
/// </summary>
/// <typeparam name="TRequest">The request type being processed.</typeparam>
public interface IRequestPreProcessor<in TRequest>
    where TRequest : notnull
{
    /// <summary>
    /// Processes the request before the handler pipeline runs.
    /// </summary>
    /// <param name="request">The request instance.</param>
    /// <param name="cancellationToken">Cancellation token for the processor operation.</param>
    Task Process(TRequest request, CancellationToken cancellationToken);
}

/// <summary>
/// Runs after a void request handler completes successfully.
/// </summary>
/// <typeparam name="TRequest">The request type being processed.</typeparam>
public interface IRequestPostProcessor<in TRequest>
    where TRequest : IRequest
{
    /// <summary>
    /// Processes the request after the handler pipeline completes successfully.
    /// </summary>
    /// <param name="request">The request instance.</param>
    /// <param name="cancellationToken">Cancellation token for the processor operation.</param>
    Task Process(TRequest request, CancellationToken cancellationToken);
}

/// <summary>
/// Runs after a response request handler completes successfully.
/// </summary>
/// <typeparam name="TRequest">The request type being processed.</typeparam>
/// <typeparam name="TResponse">The response type produced by the request.</typeparam>
public interface IRequestPostProcessor<in TRequest, in TResponse>
    where TRequest : IRequest<TResponse>
{
    /// <summary>
    /// Processes the request and response after the handler pipeline completes successfully.
    /// </summary>
    /// <param name="request">The request instance.</param>
    /// <param name="response">The handler response.</param>
    /// <param name="cancellationToken">Cancellation token for the processor operation.</param>
    Task Process(TRequest request, TResponse response, CancellationToken cancellationToken);
}
