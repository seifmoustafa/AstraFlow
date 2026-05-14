namespace AstraFlow.Mediator;

/// <summary>
/// Handles one AstraFlow mediator request type that completes without a response value.
/// </summary>
/// <typeparam name="TRequest">The request type handled by this handler.</typeparam>
public interface IRequestHandler<in TRequest>
    where TRequest : IRequest
{
    /// <summary>
    /// Executes the request.
    /// </summary>
    /// <param name="request">The request instance.</param>
    /// <param name="cancellationToken">Cancellation token for the handler operation.</param>
    Task Handle(TRequest request, CancellationToken cancellationToken);
}

/// <summary>
/// Handles one AstraFlow mediator request type and produces its response.
/// </summary>
/// <typeparam name="TRequest">The request type handled by this handler.</typeparam>
/// <typeparam name="TResponse">The response type produced by this handler.</typeparam>
public interface IRequestHandler<in TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    /// <summary>
    /// Executes the request.
    /// </summary>
    /// <param name="request">The request instance.</param>
    /// <param name="cancellationToken">Cancellation token for the handler operation.</param>
    /// <returns>The handler response.</returns>
    Task<TResponse> Handle(TRequest request, CancellationToken cancellationToken);
}
