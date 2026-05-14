using System.Collections.Concurrent;
using System.Reflection;
using System.Runtime.CompilerServices;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AstraFlow.Mediator;

/// <summary>
/// AstraFlow-owned in-process mediator for requests, stream requests, and notifications.
/// The mediator resolves handlers from the active dependency-injection scope,
/// applies registered pipeline behaviors in registration order, and caches
/// runtime dispatch delegates after the first request type is seen.
/// </summary>
public sealed class AstraFlowMediator : IMediator
{
    private static readonly ConcurrentDictionary<Type, Func<AstraFlowMediator, object, CancellationToken, Task<object?>>> SendCache = new();
    private static readonly ConcurrentDictionary<Type, Func<AstraFlowMediator, object, CancellationToken, object>> StreamCache = new();
    private static readonly ConcurrentDictionary<Type, Func<AstraFlowMediator, object, CancellationToken, Task>> PublishCache = new();

    private readonly IServiceProvider _serviceProvider;
    private readonly NotificationPublishOptions _notificationOptions;
    private readonly ILogger<AstraFlowMediator> _logger;

    /// <summary>
    /// Creates a mediator backed by the current dependency-injection scope.
    /// </summary>
    /// <param name="serviceProvider">The scoped service provider used to resolve handlers and behaviors.</param>
    /// <param name="notificationOptions">The configured notification publishing behavior.</param>
    /// <param name="logger">The logger used for notification handler failures.</param>
    public AstraFlowMediator(
        IServiceProvider serviceProvider,
        IOptions<NotificationPublishOptions> notificationOptions,
        ILogger<AstraFlowMediator> logger)
    {
        _serviceProvider = serviceProvider;
        _notificationOptions = notificationOptions.Value;
        _logger = logger;
    }

    /// <inheritdoc />
    public Task Send(IRequest request, CancellationToken cancellationToken = default)
    {
        if (request is null)
            throw new ArgumentNullException(nameof(request));

        var sender = SendCache.GetOrAdd(request.GetType(), CreateSendDelegate);
        return sender(this, request, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<TResponse> Send<TResponse>(
        IRequest<TResponse> request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
            throw new ArgumentNullException(nameof(request));

        var sender = SendCache.GetOrAdd(request.GetType(), CreateSendDelegate);
        var response = await sender(this, request, cancellationToken);
        return (TResponse)response!;
    }

    /// <inheritdoc />
    public Task<object?> Send(object request, CancellationToken cancellationToken = default)
    {
        if (request is null)
            throw new ArgumentNullException(nameof(request));

        var sender = SendCache.GetOrAdd(request.GetType(), CreateSendDelegate);
        return sender(this, request, cancellationToken);
    }

    /// <inheritdoc />
    public IAsyncEnumerable<TResponse> CreateStream<TResponse>(
        IStreamRequest<TResponse> request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
            throw new ArgumentNullException(nameof(request));

        var streamer = StreamCache.GetOrAdd(request.GetType(), CreateStreamDelegate);
        return (IAsyncEnumerable<TResponse>)streamer(this, request, cancellationToken);
    }

    /// <inheritdoc />
    public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default)
    {
        if (request is null)
            throw new ArgumentNullException(nameof(request));

        var descriptor = GetRequestContract(request.GetType());
        if (descriptor.Kind != RequestContractKind.Stream)
        {
            throw new InvalidOperationException(
                $"Request '{request.GetType().FullName}' is not a stream request. Use Send for non-stream requests.");
        }

        var method = typeof(AstraFlowMediator)
            .GetMethod(nameof(CreateObjectStreamCore), BindingFlags.Instance | BindingFlags.NonPublic)!
            .MakeGenericMethod(request.GetType(), descriptor.ResponseType!);

        return (IAsyncEnumerable<object?>)method.Invoke(this, new[] { request, cancellationToken })!;
    }

    /// <inheritdoc />
    public Task Publish<TNotification>(
        TNotification notification,
        CancellationToken cancellationToken = default)
        where TNotification : INotification
    {
        if (notification is null)
            throw new ArgumentNullException(nameof(notification));

        var handlers = _serviceProvider
            .GetServices<INotificationHandler<TNotification>>()
            .ToArray();

        return _notificationOptions.PublishStrategy switch
        {
            NotificationPublishStrategy.Sequential => PublishSequential(notification, handlers, cancellationToken),
            NotificationPublishStrategy.Parallel => PublishParallel(notification, handlers, cancellationToken),
            NotificationPublishStrategy.BoundedParallel => PublishBoundedParallel(notification, handlers, cancellationToken),
            _ => throw new InvalidOperationException(
                $"Unknown notification publish strategy '{_notificationOptions.PublishStrategy}'.")
        };
    }

    /// <inheritdoc />
    public Task Publish(object notification, CancellationToken cancellationToken = default)
    {
        if (notification is null)
            throw new ArgumentNullException(nameof(notification));

        if (notification is not INotification)
        {
            throw new InvalidOperationException(
                $"Notification '{notification.GetType().FullName}' must implement {nameof(INotification)}.");
        }

        var publisher = PublishCache.GetOrAdd(notification.GetType(), CreatePublishDelegate);
        return publisher(this, notification, cancellationToken);
    }

    private async Task<object?> SendResponseTypedCore<TRequest, TResponse>(
        object requestObject,
        CancellationToken cancellationToken)
        where TRequest : IRequest<TResponse>
    {
        var request = (TRequest)requestObject;
        var handlers = _serviceProvider
            .GetServices<IRequestHandler<TRequest, TResponse>>()
            .Take(2)
            .ToArray();

        if (handlers.Length == 0)
        {
            throw new InvalidOperationException(
                $"No request handler registered for '{typeof(TRequest).FullName}' returning '{typeof(TResponse).FullName}'.");
        }

        if (handlers.Length > 1)
        {
            throw new InvalidOperationException(
                $"Multiple request handlers registered for '{typeof(TRequest).FullName}' returning '{typeof(TResponse).FullName}'.");
        }

        try
        {
            foreach (var processor in _serviceProvider.GetServices<IRequestPreProcessor<TRequest>>())
                await processor.Process(request, cancellationToken);

            var handler = handlers[0];
            RequestHandlerDelegate<TResponse> handlerDelegate =
                () => handler.Handle(request, cancellationToken);

            var behaviors = _serviceProvider
                .GetServices<IPipelineBehavior<TRequest, TResponse>>()
                .Reverse()
                .ToArray();

            foreach (var behavior in behaviors)
            {
                var next = handlerDelegate;
                handlerDelegate = () => behavior.Handle(request, next, cancellationToken);
            }

            var response = await handlerDelegate();

            foreach (var processor in _serviceProvider.GetServices<IRequestPostProcessor<TRequest, TResponse>>())
                await processor.Process(request, response, cancellationToken);

            return response;
        }
        catch (Exception ex)
        {
            await ExecuteResponseExceptionActions<TRequest, TResponse>(request, ex, cancellationToken);

            var state = await ExecuteResponseExceptionHandlers<TRequest, TResponse>(request, ex, cancellationToken);
            if (state.Handled)
                return state.Response;

            throw;
        }
    }

    private async Task<object?> SendVoidTypedCore<TRequest>(
        object requestObject,
        CancellationToken cancellationToken)
        where TRequest : IRequest
    {
        var request = (TRequest)requestObject;
        var handlers = _serviceProvider
            .GetServices<IRequestHandler<TRequest>>()
            .Take(2)
            .ToArray();

        if (handlers.Length == 0)
        {
            throw new InvalidOperationException(
                $"No void request handler registered for '{typeof(TRequest).FullName}'.");
        }

        if (handlers.Length > 1)
        {
            throw new InvalidOperationException(
                $"Multiple void request handlers registered for '{typeof(TRequest).FullName}'.");
        }

        try
        {
            foreach (var processor in _serviceProvider.GetServices<IRequestPreProcessor<TRequest>>())
                await processor.Process(request, cancellationToken);

            var handler = handlers[0];
            RequestHandlerDelegate handlerDelegate =
                () => handler.Handle(request, cancellationToken);

            var behaviors = _serviceProvider
                .GetServices<IRequestPipelineBehavior<TRequest>>()
                .Reverse()
                .ToArray();

            foreach (var behavior in behaviors)
            {
                var next = handlerDelegate;
                handlerDelegate = () => behavior.Handle(request, next, cancellationToken);
            }

            await handlerDelegate();

            foreach (var processor in _serviceProvider.GetServices<IRequestPostProcessor<TRequest>>())
                await processor.Process(request, cancellationToken);

            return null;
        }
        catch (Exception ex)
        {
            await ExecuteVoidExceptionActions(request, ex, cancellationToken);

            var state = await ExecuteVoidExceptionHandlers(request, ex, cancellationToken);
            if (state.Handled)
                return null;

            throw;
        }
    }

    private IAsyncEnumerable<TResponse> CreateStreamTypedCore<TRequest, TResponse>(
        object requestObject,
        CancellationToken cancellationToken)
        where TRequest : IStreamRequest<TResponse>
    {
        var request = (TRequest)requestObject;
        var handlers = _serviceProvider
            .GetServices<IStreamRequestHandler<TRequest, TResponse>>()
            .Take(2)
            .ToArray();

        if (handlers.Length == 0)
        {
            throw new InvalidOperationException(
                $"No stream request handler registered for '{typeof(TRequest).FullName}' returning '{typeof(TResponse).FullName}'.");
        }

        if (handlers.Length > 1)
        {
            throw new InvalidOperationException(
                $"Multiple stream request handlers registered for '{typeof(TRequest).FullName}' returning '{typeof(TResponse).FullName}'.");
        }

        var handler = handlers[0];
        StreamHandlerDelegate<TResponse> handlerDelegate =
            () => handler.Handle(request, cancellationToken);

        var behaviors = _serviceProvider
            .GetServices<IStreamPipelineBehavior<TRequest, TResponse>>()
            .Reverse()
            .ToArray();

        foreach (var behavior in behaviors)
        {
            var next = handlerDelegate;
            handlerDelegate = () => behavior.Handle(request, next, cancellationToken);
        }

        return handlerDelegate();
    }

    private object CreateStreamBoxedCore<TRequest, TResponse>(
        object requestObject,
        CancellationToken cancellationToken)
        where TRequest : IStreamRequest<TResponse>
    {
        return CreateStreamTypedCore<TRequest, TResponse>(requestObject, cancellationToken);
    }

    private async IAsyncEnumerable<object?> CreateObjectStreamCore<TRequest, TResponse>(
        object requestObject,
        [EnumeratorCancellation] CancellationToken cancellationToken)
        where TRequest : IStreamRequest<TResponse>
    {
        var stream = CreateStreamTypedCore<TRequest, TResponse>(requestObject, cancellationToken);
        await foreach (var item in stream.WithCancellation(cancellationToken))
            yield return item;
    }

    private async Task PublishSequential<TNotification>(
        TNotification notification,
        IReadOnlyList<INotificationHandler<TNotification>> handlers,
        CancellationToken cancellationToken)
        where TNotification : INotification
    {
        if (_notificationOptions.FailurePolicy == NotificationFailurePolicy.FailFast)
        {
            foreach (var handler in handlers)
                await handler.Handle(notification, cancellationToken);

            return;
        }

        var failures = new List<Exception>();
        foreach (var handler in handlers)
        {
            try
            {
                await handler.Handle(notification, cancellationToken);
            }
            catch (Exception ex)
            {
                failures.Add(ex);
                LogNotificationFailure(handler, typeof(TNotification), ex);
            }
        }

        ThrowAggregateIfNeeded<TNotification>(failures);
    }

    private async Task PublishParallel<TNotification>(
        TNotification notification,
        IReadOnlyList<INotificationHandler<TNotification>> handlers,
        CancellationToken cancellationToken)
        where TNotification : INotification
    {
        if (_notificationOptions.FailurePolicy == NotificationFailurePolicy.FailFast)
        {
            await Task.WhenAll(handlers.Select(handler => handler.Handle(notification, cancellationToken)));
            return;
        }

        var results = await Task.WhenAll(handlers.Select(
            (handler, index) => CaptureNotificationFailure(notification, handler, index, cancellationToken)));
        var failures = results
            .Where(result => result.Exception is not null)
            .OrderBy(result => result.Index)
            .Select(result => result.Exception!)
            .ToArray();

        ThrowAggregateIfNeeded<TNotification>(failures);
    }

    private async Task PublishBoundedParallel<TNotification>(
        TNotification notification,
        IReadOnlyList<INotificationHandler<TNotification>> handlers,
        CancellationToken cancellationToken)
        where TNotification : INotification
    {
        var maxDegreeOfParallelism = _notificationOptions.MaxDegreeOfParallelism <= 0
            ? Environment.ProcessorCount
            : _notificationOptions.MaxDegreeOfParallelism;

        using var gate = new SemaphoreSlim(maxDegreeOfParallelism);

        if (_notificationOptions.FailurePolicy == NotificationFailurePolicy.FailFast)
        {
            await Task.WhenAll(handlers.Select(async handler =>
            {
                await gate.WaitAsync(cancellationToken);
                try
                {
                    await handler.Handle(notification, cancellationToken);
                }
                finally
                {
                    gate.Release();
                }
            }));
            return;
        }

        var results = await Task.WhenAll(handlers.Select(async (handler, index) =>
        {
            await gate.WaitAsync(cancellationToken);
            try
            {
                return await CaptureNotificationFailure(notification, handler, index, cancellationToken);
            }
            finally
            {
                gate.Release();
            }
        }));

        var failures = results
            .Where(result => result.Exception is not null)
            .OrderBy(result => result.Index)
            .Select(result => result.Exception!)
            .ToArray();

        ThrowAggregateIfNeeded<TNotification>(failures);
    }

    private async Task<NotificationFailure> CaptureNotificationFailure<TNotification>(
        TNotification notification,
        INotificationHandler<TNotification> handler,
        int index,
        CancellationToken cancellationToken)
        where TNotification : INotification
    {
        try
        {
            await handler.Handle(notification, cancellationToken);
            return new NotificationFailure(index, null);
        }
        catch (Exception ex)
        {
            LogNotificationFailure(handler, typeof(TNotification), ex);
            return new NotificationFailure(index, ex);
        }
    }

    private void LogNotificationFailure(object handler, Type notificationType, Exception exception)
    {
        _logger.LogError(
            exception,
            "Notification handler {HandlerType} failed for {NotificationType}",
            handler.GetType().FullName,
            notificationType.FullName);
    }

    private void ThrowAggregateIfNeeded<TNotification>(IReadOnlyCollection<Exception> failures)
    {
        if (_notificationOptions.FailurePolicy == NotificationFailurePolicy.Aggregate && failures.Count != 0)
        {
            throw new AggregateException(
                $"One or more notification handlers failed for '{typeof(TNotification).FullName}'.",
                failures);
        }
    }

    private async Task ExecuteResponseExceptionActions<TRequest, TResponse>(
        TRequest request,
        Exception exception,
        CancellationToken cancellationToken)
        where TRequest : IRequest<TResponse>
    {
        foreach (var exceptionType in GetExceptionTypes(exception.GetType()))
        {
            var serviceType = typeof(IRequestExceptionAction<,,>)
                .MakeGenericType(typeof(TRequest), typeof(TResponse), exceptionType);

            foreach (var action in _serviceProvider.GetServices(serviceType))
            {
                var task = (Task)serviceType
                    .GetMethod(nameof(IRequestExceptionAction<IRequest<TResponse>, TResponse, Exception>.Execute))!
                    .Invoke(action, new object[] { request, exception, cancellationToken })!;
                await task;
            }
        }
    }

    private async Task<RequestExceptionHandlerState<TResponse>> ExecuteResponseExceptionHandlers<TRequest, TResponse>(
        TRequest request,
        Exception exception,
        CancellationToken cancellationToken)
        where TRequest : IRequest<TResponse>
    {
        var state = new RequestExceptionHandlerState<TResponse>();

        foreach (var exceptionType in GetExceptionTypes(exception.GetType()))
        {
            var serviceType = typeof(IRequestExceptionHandler<,,>)
                .MakeGenericType(typeof(TRequest), typeof(TResponse), exceptionType);

            foreach (var handler in _serviceProvider.GetServices(serviceType))
            {
                var task = (Task)serviceType
                    .GetMethod(nameof(IRequestExceptionHandler<IRequest<TResponse>, TResponse, Exception>.Handle))!
                    .Invoke(handler, new object[] { request, exception, state, cancellationToken })!;
                await task;

                if (state.Handled)
                    return state;
            }
        }

        return state;
    }

    private async Task ExecuteVoidExceptionActions<TRequest>(
        TRequest request,
        Exception exception,
        CancellationToken cancellationToken)
        where TRequest : IRequest
    {
        foreach (var exceptionType in GetExceptionTypes(exception.GetType()))
        {
            var serviceType = typeof(IRequestExceptionAction<,>)
                .MakeGenericType(typeof(TRequest), exceptionType);

            foreach (var action in _serviceProvider.GetServices(serviceType))
            {
                var task = (Task)serviceType
                    .GetMethod(nameof(IRequestExceptionAction<IRequest, Exception>.Execute))!
                    .Invoke(action, new object[] { request, exception, cancellationToken })!;
                await task;
            }
        }
    }

    private async Task<RequestExceptionHandlerState> ExecuteVoidExceptionHandlers<TRequest>(
        TRequest request,
        Exception exception,
        CancellationToken cancellationToken)
        where TRequest : IRequest
    {
        var state = new RequestExceptionHandlerState();

        foreach (var exceptionType in GetExceptionTypes(exception.GetType()))
        {
            var serviceType = typeof(IRequestExceptionHandler<,>)
                .MakeGenericType(typeof(TRequest), exceptionType);

            foreach (var handler in _serviceProvider.GetServices(serviceType))
            {
                var task = (Task)serviceType
                    .GetMethod(nameof(IRequestExceptionHandler<IRequest, Exception>.Handle))!
                    .Invoke(handler, new object[] { request, exception, state, cancellationToken })!;
                await task;

                if (state.Handled)
                    return state;
            }
        }

        return state;
    }

    private static IEnumerable<Type> GetExceptionTypes(Type exceptionType)
    {
        for (var current = exceptionType; current is not null && current != typeof(object); current = current.BaseType)
            yield return current;
    }

    private static Func<AstraFlowMediator, object, CancellationToken, Task<object?>> CreateSendDelegate(Type requestType)
    {
        var descriptor = GetRequestContract(requestType);

        if (descriptor.Kind == RequestContractKind.Stream)
        {
            return (_, _, _) => throw new InvalidOperationException(
                $"Stream request '{requestType.FullName}' must be dispatched with CreateStream, not Send.");
        }

        var methodName = descriptor.Kind == RequestContractKind.Void
            ? nameof(SendVoidTypedCore)
            : nameof(SendResponseTypedCore);

        var method = typeof(AstraFlowMediator)
            .GetMethod(methodName, BindingFlags.Instance | BindingFlags.NonPublic)!;

        var typedMethod = descriptor.Kind == RequestContractKind.Void
            ? method.MakeGenericMethod(requestType)
            : method.MakeGenericMethod(requestType, descriptor.ResponseType!);

        return (Func<AstraFlowMediator, object, CancellationToken, Task<object?>>)typedMethod.CreateDelegate(
            typeof(Func<AstraFlowMediator, object, CancellationToken, Task<object?>>));
    }

    private static Func<AstraFlowMediator, object, CancellationToken, object> CreateStreamDelegate(Type requestType)
    {
        var descriptor = GetRequestContract(requestType);
        if (descriptor.Kind != RequestContractKind.Stream)
        {
            return (_, _, _) => throw new InvalidOperationException(
                $"Request '{requestType.FullName}' is not a stream request. Use Send for non-stream requests.");
        }

        var method = typeof(AstraFlowMediator)
            .GetMethod(nameof(CreateStreamBoxedCore), BindingFlags.Instance | BindingFlags.NonPublic)!
            .MakeGenericMethod(requestType, descriptor.ResponseType!);

        return (Func<AstraFlowMediator, object, CancellationToken, object>)method.CreateDelegate(
            typeof(Func<AstraFlowMediator, object, CancellationToken, object>));
    }

    private static Func<AstraFlowMediator, object, CancellationToken, Task> CreatePublishDelegate(Type notificationType)
    {
        var method = typeof(AstraFlowMediator)
            .GetMethod(nameof(PublishObjectCore), BindingFlags.Instance | BindingFlags.NonPublic)!
            .MakeGenericMethod(notificationType);

        return (Func<AstraFlowMediator, object, CancellationToken, Task>)method.CreateDelegate(
            typeof(Func<AstraFlowMediator, object, CancellationToken, Task>));
    }

    private Task PublishObjectCore<TNotification>(object notification, CancellationToken cancellationToken)
        where TNotification : INotification
    {
        return Publish((TNotification)notification, cancellationToken);
    }

    private static RequestContractDescriptor GetRequestContract(Type requestType)
    {
        var responseInterfaces = requestType
            .GetInterfaces()
            .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IRequest<>))
            .Distinct()
            .ToArray();

        var streamInterfaces = requestType
            .GetInterfaces()
            .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IStreamRequest<>))
            .Distinct()
            .ToArray();

        var implementsVoidRequest = typeof(IRequest).IsAssignableFrom(requestType);
        var contractCount = responseInterfaces.Length + streamInterfaces.Length + (implementsVoidRequest ? 1 : 0);

        if (contractCount == 0)
        {
            throw new InvalidOperationException(
                $"Request '{requestType.FullName}' must implement {typeof(IRequest<>).FullName}, {typeof(IRequest).FullName}, or {typeof(IStreamRequest<>).FullName}.");
        }

        if (contractCount > 1)
        {
            var contracts = responseInterfaces
                .Concat(streamInterfaces)
                .Select(GetDisplayName)
                .Concat(implementsVoidRequest ? new[] { GetDisplayName(typeof(IRequest)) } : Array.Empty<string>())
                .OrderBy(name => name)
                .ToArray();

            throw new InvalidOperationException(
                $"Request '{requestType.FullName}' implements multiple AstraFlow request contracts: {string.Join(", ", contracts)}. AstraFlow requests must declare exactly one void, response, or stream contract.");
        }

        if (implementsVoidRequest)
            return new RequestContractDescriptor(RequestContractKind.Void, null);

        if (responseInterfaces.Length == 1)
            return new RequestContractDescriptor(RequestContractKind.Response, responseInterfaces[0].GetGenericArguments()[0]);

        return new RequestContractDescriptor(RequestContractKind.Stream, streamInterfaces[0].GetGenericArguments()[0]);
    }

    private sealed class RequestContractDescriptor
    {
        public RequestContractDescriptor(RequestContractKind kind, Type? responseType)
        {
            Kind = kind;
            ResponseType = responseType;
        }

        public RequestContractKind Kind { get; }

        public Type? ResponseType { get; }
    }

    private sealed class NotificationFailure
    {
        public NotificationFailure(int index, Exception? exception)
        {
            Index = index;
            Exception = exception;
        }

        public int Index { get; }

        public Exception? Exception { get; }
    }

    private enum RequestContractKind
    {
        Void,
        Response,
        Stream
    }

    private static string GetDisplayName(Type type)
    {
        return type.FullName ?? type.Name;
    }
}
