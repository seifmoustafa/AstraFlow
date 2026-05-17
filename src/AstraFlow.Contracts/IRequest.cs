namespace AstraFlow.Mediator;

/// <summary>
/// Marker interface for an AstraFlow mediator request that completes without a response value.
/// </summary>
public interface IRequest
{
}

/// <summary>
/// Marker interface for an AstraFlow mediator request that returns a response.
/// </summary>
/// <typeparam name="TResponse">The response type produced by the matching request handler.</typeparam>
public interface IRequest<out TResponse>
{
}
