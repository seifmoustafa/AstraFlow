using AstraFlow.Mediator;

namespace AstraFlow.Testing;

/// <summary>
/// Framework-neutral fake publisher for tests that need to record notifications without a DI container.
/// </summary>
public class FakePublisher : IPublisher
{
    private readonly List<RecordedNotification> notifications = new();
    private readonly Dictionary<Type, List<Func<INotification, CancellationToken, Task>>> handlers = new();

    /// <summary>
    /// Gets the notifications published through this fake publisher.
    /// </summary>
    public IReadOnlyList<RecordedNotification> Notifications => notifications;

    /// <summary>
    /// Registers a fake notification handler.
    /// </summary>
    /// <typeparam name="TNotification">The notification type.</typeparam>
    /// <param name="handler">The handler to run when the notification is published.</param>
    /// <returns>The current fake publisher.</returns>
    public FakePublisher OnPublish<TNotification>(
        Func<TNotification, CancellationToken, Task> handler)
        where TNotification : INotification
    {
        if (handler is null)
        {
            throw new ArgumentNullException(nameof(handler));
        }

        var notificationType = typeof(TNotification);
        if (!handlers.TryGetValue(notificationType, out var registeredHandlers))
        {
            registeredHandlers = new List<Func<INotification, CancellationToken, Task>>();
            handlers[notificationType] = registeredHandlers;
        }

        registeredHandlers.Add((notification, cancellationToken) =>
            handler((TNotification)notification, cancellationToken));

        return this;
    }

    /// <summary>
    /// Publishes a strongly typed notification and records it.
    /// </summary>
    public async Task Publish<TNotification>(
        TNotification notification,
        CancellationToken cancellationToken = default)
        where TNotification : INotification
    {
        if (notification is null)
        {
            throw new ArgumentNullException(nameof(notification));
        }

        notifications.Add(new RecordedNotification(notification, notification.GetType(), cancellationToken));
        await RunHandlers(notification, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Publishes a runtime notification object and records it.
    /// </summary>
    public async Task Publish(object notification, CancellationToken cancellationToken = default)
    {
        if (notification is null)
        {
            throw new ArgumentNullException(nameof(notification));
        }

        if (notification is not INotification typedNotification)
        {
            throw new InvalidOperationException(
                $"Notification type '{notification.GetType().FullName}' must implement INotification.");
        }

        notifications.Add(new RecordedNotification(typedNotification, notification.GetType(), cancellationToken));
        await RunHandlers(typedNotification, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Clears recorded notifications and configured handlers.
    /// </summary>
    public void Clear()
    {
        notifications.Clear();
        handlers.Clear();
    }

    private async Task RunHandlers(INotification notification, CancellationToken cancellationToken)
    {
        if (!handlers.TryGetValue(notification.GetType(), out var registeredHandlers))
        {
            return;
        }

        foreach (var handler in registeredHandlers)
        {
            await handler(notification, cancellationToken).ConfigureAwait(false);
        }
    }
}
