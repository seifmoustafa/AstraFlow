using AstraFlow.Mediator;

namespace AstraFlow.Testing;

/// <summary>
/// Executes a notification handler directly in tests.
/// </summary>
/// <typeparam name="TNotification">The notification type.</typeparam>
public sealed class NotificationHandlerTestHarness<TNotification>
    where TNotification : INotification
{
    private readonly INotificationHandler<TNotification> handler;

    /// <summary>
    /// Initializes a new notification handler harness.
    /// </summary>
    public NotificationHandlerTestHarness(INotificationHandler<TNotification> handler)
    {
        this.handler = handler ?? throw new ArgumentNullException(nameof(handler));
    }

    /// <summary>
    /// Executes the handler.
    /// </summary>
    public Task Handle(
        TNotification notification,
        CancellationToken cancellationToken = default)
    {
        if (notification is null)
        {
            throw new ArgumentNullException(nameof(notification));
        }

        return handler.Handle(notification, cancellationToken);
    }
}
