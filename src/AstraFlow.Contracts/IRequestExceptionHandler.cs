namespace AstraFlow.Mediator;

/// <summary>
/// Mutable state used by void request exception handlers to mark an exception as handled.
/// </summary>
public sealed class RequestExceptionHandlerState
{
    /// <summary>
    /// Gets whether the exception has been handled.
    /// </summary>
    public bool Handled { get; private set; }

    /// <summary>
    /// Marks the exception as handled and lets the request complete successfully.
    /// </summary>
    public void SetHandled()
    {
        Handled = true;
    }
}

/// <summary>
/// Mutable state used by response request exception handlers to provide a handled response.
/// </summary>
/// <typeparam name="TResponse">The response type produced by the request.</typeparam>
public sealed class RequestExceptionHandlerState<TResponse>
{
    /// <summary>
    /// Gets whether the exception has been handled.
    /// </summary>
    public bool Handled { get; private set; }

    /// <summary>
    /// Gets the handled response value.
    /// </summary>
    public TResponse? Response { get; private set; }

    /// <summary>
    /// Marks the exception as handled and supplies the response returned to the caller.
    /// </summary>
    /// <param name="response">The response to return to the caller.</param>
    public void SetHandled(TResponse response)
    {
        Handled = true;
        Response = response;
    }
}

/// <summary>
/// Performs side effects when a void request throws. Exception actions never mark exceptions as handled.
/// </summary>
/// <typeparam name="TRequest">The request type being observed.</typeparam>
/// <typeparam name="TException">The exception type being observed.</typeparam>
public interface IRequestExceptionAction<in TRequest, in TException>
    where TRequest : IRequest
    where TException : Exception
{
    /// <summary>
    /// Executes side effects for the exception. The original exception is rethrown after actions complete.
    /// </summary>
    Task Execute(TRequest request, TException exception, CancellationToken cancellationToken);
}

/// <summary>
/// Performs side effects when a response request throws. Exception actions never mark exceptions as handled.
/// </summary>
/// <typeparam name="TRequest">The request type being observed.</typeparam>
/// <typeparam name="TResponse">The response type produced by the request.</typeparam>
/// <typeparam name="TException">The exception type being observed.</typeparam>
public interface IRequestExceptionAction<in TRequest, TResponse, in TException>
    where TRequest : IRequest<TResponse>
    where TException : Exception
{
    /// <summary>
    /// Executes side effects for the exception. The original exception is rethrown after actions complete.
    /// </summary>
    Task Execute(TRequest request, TException exception, CancellationToken cancellationToken);
}

/// <summary>
/// Handles exceptions thrown by a void request pipeline.
/// </summary>
/// <typeparam name="TRequest">The request type being handled.</typeparam>
/// <typeparam name="TException">The exception type being handled.</typeparam>
public interface IRequestExceptionHandler<in TRequest, in TException>
    where TRequest : IRequest
    where TException : Exception
{
    /// <summary>
    /// Handles the exception and may mark the state as handled.
    /// </summary>
    Task Handle(
        TRequest request,
        TException exception,
        RequestExceptionHandlerState state,
        CancellationToken cancellationToken);
}

/// <summary>
/// Handles exceptions thrown by a response request pipeline.
/// </summary>
/// <typeparam name="TRequest">The request type being handled.</typeparam>
/// <typeparam name="TResponse">The response type produced by the request.</typeparam>
/// <typeparam name="TException">The exception type being handled.</typeparam>
public interface IRequestExceptionHandler<in TRequest, TResponse, in TException>
    where TRequest : IRequest<TResponse>
    where TException : Exception
{
    /// <summary>
    /// Handles the exception and may mark the state as handled with a response.
    /// </summary>
    Task Handle(
        TRequest request,
        TException exception,
        RequestExceptionHandlerState<TResponse> state,
        CancellationToken cancellationToken);
}
