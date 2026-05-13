using AstraFlow.Mediator;

namespace AstraFlow.Testing;

/// <summary>
/// Executes a request handler directly in tests.
/// </summary>
/// <typeparam name="TRequest">The request type.</typeparam>
/// <typeparam name="TResponse">The response type.</typeparam>
public sealed class HandlerTestHarness<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IRequestHandler<TRequest, TResponse> handler;

    /// <summary>
    /// Initializes a new handler harness.
    /// </summary>
    /// <param name="handler">The handler under test.</param>
    public HandlerTestHarness(IRequestHandler<TRequest, TResponse> handler)
    {
        this.handler = handler ?? throw new ArgumentNullException(nameof(handler));
    }

    /// <summary>
    /// Executes the handler.
    /// </summary>
    /// <param name="request">The request to handle.</param>
    /// <param name="cancellationToken">Cancellation token for the handler.</param>
    public Task<TResponse> Handle(
        TRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        return handler.Handle(request, cancellationToken);
    }
}
