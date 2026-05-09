using System.Collections.Concurrent;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AstraFlow.Mediator;

/// <summary>
/// AstraFlow-owned in-process mediator for CQRS requests and notifications.
/// The mediator resolves handlers from the active dependency-injection scope,
/// applies registered pipeline behaviors in registration order, and caches
/// runtime dispatch delegates after the first request type is seen.
/// </summary>
public sealed class AstraFlowMediator : IMediator
{
    private static readonly ConcurrentDictionary<Type, Func<AstraFlowMediator, object, CancellationToken, Task<object?>>> SendCache = new();
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
    public async Task<TResponse> Send<TResponse>(
        IRequest<TResponse> request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var sender = SendCache.GetOrAdd(request.GetType(), CreateSendDelegate);
        var response = await sender(this, request, cancellationToken);
        return (TResponse)response!;
    }

    /// <inheritdoc />
    public Task<object?> Send(object request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var requestType = request.GetType();
        var sender = SendCache.GetOrAdd(requestType, CreateSendDelegate);
        return sender(this, request, cancellationToken);
    }

    /// <inheritdoc />
    public async Task Publish<TNotification>(
        TNotification notification,
        CancellationToken cancellationToken = default)
        where TNotification : INotification
    {
        ArgumentNullException.ThrowIfNull(notification);

        var handlers = _serviceProvider
            .GetServices<INotificationHandler<TNotification>>()
            .ToArray();

        if (_notificationOptions.FailurePolicy == NotificationFailurePolicy.FailFast)
        {
            foreach (var handler in handlers)
            {
                await handler.Handle(notification, cancellationToken);
            }

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
                _logger.LogError(
                    ex,
                    "Notification handler {HandlerType} failed for {NotificationType}",
                    handler.GetType().FullName,
                    typeof(TNotification).FullName);
            }
        }

        if (_notificationOptions.FailurePolicy == NotificationFailurePolicy.Aggregate && failures.Count != 0)
        {
            throw new AggregateException(
                $"One or more notification handlers failed for '{typeof(TNotification).FullName}'.",
                failures);
        }
    }

    /// <inheritdoc />
    public Task Publish(object notification, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(notification);

        if (notification is not INotification)
        {
            throw new InvalidOperationException(
                $"Notification '{notification.GetType().FullName}' must implement {nameof(INotification)}.");
        }

        var notificationType = notification.GetType();
        var publisher = PublishCache.GetOrAdd(notificationType, CreatePublishDelegate);
        return publisher(this, notification, cancellationToken);
    }

    /// <summary>
    /// Executes a typed request by resolving its single handler and wrapping it with
    /// all registered pipeline behaviors.
    /// </summary>
    /// <typeparam name="TRequest">The concrete request type.</typeparam>
    /// <typeparam name="TResponse">The response type declared by the request.</typeparam>
    /// <param name="requestObject">The request object supplied to the mediator.</param>
    /// <param name="cancellationToken">Cancellation token for the request pipeline.</param>
    /// <returns>The request response boxed as an object.</returns>
    /// <exception cref="InvalidOperationException">
    /// Thrown when no handler or multiple handlers are registered for the request.
    /// </exception>
    private async Task<object?> SendTypedCore<TRequest, TResponse>(
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

        return await handlerDelegate();
    }

    /// <summary>
    /// Creates and caches a typed send delegate for a runtime request type.
    /// </summary>
    /// <param name="requestType">The concrete request type.</param>
    /// <returns>A delegate that dispatches the request through <see cref="SendTypedCore{TRequest,TResponse}"/>.</returns>
    private static Func<AstraFlowMediator, object, CancellationToken, Task<object?>> CreateSendDelegate(Type requestType)
    {
        var responseType = requestType
            .GetInterfaces()
            .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IRequest<>))
            .Select(i => i.GetGenericArguments()[0])
            .FirstOrDefault();

        if (responseType is null)
        {
            throw new InvalidOperationException(
                $"Request '{requestType.FullName}' must implement {typeof(IRequest<>).FullName}.");
        }

        var method = typeof(AstraFlowMediator)
            .GetMethod(nameof(SendTypedCore), BindingFlags.Instance | BindingFlags.NonPublic)!
            .MakeGenericMethod(requestType, responseType);

        return method.CreateDelegate<Func<AstraFlowMediator, object, CancellationToken, Task<object?>>>();
    }

    /// <summary>
    /// Creates and caches a typed publish delegate for a runtime notification type.
    /// </summary>
    /// <param name="notificationType">The concrete notification type.</param>
    /// <returns>A delegate that publishes the notification through <see cref="PublishObjectCore{TNotification}"/>.</returns>
    private static Func<AstraFlowMediator, object, CancellationToken, Task> CreatePublishDelegate(Type notificationType)
    {
        var method = typeof(AstraFlowMediator)
            .GetMethod(nameof(PublishObjectCore), BindingFlags.Instance | BindingFlags.NonPublic)!
            .MakeGenericMethod(notificationType);

        return method.CreateDelegate<Func<AstraFlowMediator, object, CancellationToken, Task>>();
    }

    /// <summary>
    /// Publishes a runtime notification through the strongly typed publish path.
    /// </summary>
    /// <typeparam name="TNotification">The concrete notification type.</typeparam>
    /// <param name="notification">The notification object supplied to the mediator.</param>
    /// <param name="cancellationToken">Cancellation token for notification handlers.</param>
    private Task PublishObjectCore<TNotification>(object notification, CancellationToken cancellationToken)
        where TNotification : INotification
    {
        return Publish((TNotification)notification, cancellationToken);
    }
}
