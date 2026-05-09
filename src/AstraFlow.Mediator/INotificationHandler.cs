namespace AstraFlow.Mediator;

/// <summary>
/// Handles a published AstraFlow mediator notification.
/// </summary>
/// <typeparam name="TNotification">The notification type handled by this handler.</typeparam>
public interface INotificationHandler<in TNotification>
    where TNotification : INotification
{
    /// <summary>
    /// Executes notification handling logic.
    /// </summary>
    /// <param name="notification">The published notification.</param>
    /// <param name="cancellationToken">Cancellation token for the handler operation.</param>
    Task Handle(TNotification notification, CancellationToken cancellationToken);
}
