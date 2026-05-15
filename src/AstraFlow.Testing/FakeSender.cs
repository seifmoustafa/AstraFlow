using AstraFlow.Mediator;

namespace AstraFlow.Testing;

/// <summary>
/// Framework-neutral fake sender for tests that need to record requests without a DI container.
/// </summary>
public class FakeSender : ISender
{
    private readonly List<RecordedRequest> requests = new();
    private readonly Dictionary<Type, Func<object, CancellationToken, Task<object?>>> handlers = new();

    /// <summary>
    /// Gets the requests sent through this fake sender.
    /// </summary>
    public IReadOnlyList<RecordedRequest> Requests => requests;

    /// <summary>
    /// Registers a response factory for a request type.
    /// </summary>
    /// <typeparam name="TRequest">The request type.</typeparam>
    /// <typeparam name="TResponse">The response type.</typeparam>
    /// <param name="handler">The response factory.</param>
    /// <returns>The current fake sender.</returns>
    public FakeSender RespondWith<TRequest, TResponse>(
        Func<TRequest, CancellationToken, Task<TResponse>> handler)
        where TRequest : IRequest<TResponse>
    {
        if (handler is null)
        {
            throw new ArgumentNullException(nameof(handler));
        }

        handlers[typeof(TRequest)] = async (request, cancellationToken) =>
            await handler((TRequest)request, cancellationToken).ConfigureAwait(false);

        return this;
    }

    /// <summary>
    /// Registers a constant response for a request type.
    /// </summary>
    /// <typeparam name="TRequest">The request type.</typeparam>
    /// <typeparam name="TResponse">The response type.</typeparam>
    /// <param name="response">The response returned when the request is sent.</param>
    /// <returns>The current fake sender.</returns>
    public FakeSender RespondWith<TRequest, TResponse>(TResponse response)
        where TRequest : IRequest<TResponse>
    {
        return RespondWith<TRequest, TResponse>((_, _) => Task.FromResult(response));
    }

    /// <summary>
    /// Sends a strongly typed request, records it, and returns the configured fake response.
    /// </summary>
    public async Task<TResponse> Send<TResponse>(
        IRequest<TResponse> request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        requests.Add(new RecordedRequest(request, request.GetType(), typeof(TResponse), cancellationToken));

        if (!handlers.TryGetValue(request.GetType(), out var handler))
        {
            throw new InvalidOperationException(
                $"No fake response was registered for request type '{request.GetType().FullName}'.");
        }

        var response = await handler(request, cancellationToken).ConfigureAwait(false);
        return (TResponse)response!;
    }

    /// <summary>
    /// Sends a runtime request object, records it, and returns the configured fake response.
    /// </summary>
    public async Task<object?> Send(object request, CancellationToken cancellationToken = default)
    {
        var responseType = RuntimeRequestContract.GetSingleResponseType(request);
        requests.Add(new RecordedRequest(request, request.GetType(), responseType, cancellationToken));

        if (!handlers.TryGetValue(request.GetType(), out var handler))
        {
            throw new InvalidOperationException(
                $"No fake response was registered for request type '{request.GetType().FullName}'.");
        }

        return await handler(request, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Clears recorded requests and configured responses.
    /// </summary>
    public void Clear()
    {
        requests.Clear();
        handlers.Clear();
    }
}
