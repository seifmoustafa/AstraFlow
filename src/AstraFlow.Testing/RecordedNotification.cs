using AstraFlow.Mediator;

namespace AstraFlow.Testing;

/// <summary>
/// Captures a notification published through a fake AstraFlow publisher or mediator.
/// </summary>
/// <param name="Notification">The notification object.</param>
/// <param name="NotificationType">The runtime notification type.</param>
/// <param name="CancellationToken">The cancellation token used for publishing.</param>
public sealed record RecordedNotification(
    INotification Notification,
    Type NotificationType,
    CancellationToken CancellationToken);
