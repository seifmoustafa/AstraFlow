using AstraFlow.Mediator;

namespace AstraFlow.Testing;

/// <summary>
/// Assertion helpers for fake mediator request and notification recordings.
/// </summary>
public static class MediatorAssertions
{
    /// <summary>
    /// Asserts that exactly one request of the requested type was sent.
    /// </summary>
    /// <typeparam name="TRequest">The request type to find.</typeparam>
    /// <param name="requests">Recorded requests.</param>
    /// <returns>The recorded request.</returns>
    public static RecordedRequest SingleSent<TRequest>(this IReadOnlyList<RecordedRequest> requests)
    {
        if (requests is null)
        {
            throw new ArgumentNullException(nameof(requests));
        }

        var matches = requests.Where(request => request.Request is TRequest).ToArray();
        if (matches.Length != 1)
        {
            throw new AstraFlowAssertionException(
                $"Expected exactly one sent request of type '{typeof(TRequest).FullName}', but found {matches.Length}.");
        }

        return matches[0];
    }

    /// <summary>
    /// Asserts that at least one request of the requested type was sent.
    /// </summary>
    public static void ShouldHaveSent<TRequest>(this IReadOnlyList<RecordedRequest> requests)
    {
        requests.SingleOrMore<TRequest>("sent request");
    }

    /// <summary>
    /// Asserts that no request of the requested type was sent.
    /// </summary>
    public static void ShouldNotHaveSent<TRequest>(this IReadOnlyList<RecordedRequest> requests)
    {
        if (requests is null)
        {
            throw new ArgumentNullException(nameof(requests));
        }

        var count = requests.Count(request => request.Request is TRequest);
        if (count != 0)
        {
            throw new AstraFlowAssertionException(
                $"Expected no sent request of type '{typeof(TRequest).FullName}', but found {count}.");
        }
    }

    /// <summary>
    /// Asserts that exactly one notification of the requested type was published.
    /// </summary>
    /// <typeparam name="TNotification">The notification type to find.</typeparam>
    /// <param name="notifications">Recorded notifications.</param>
    /// <returns>The recorded notification.</returns>
    public static RecordedNotification SinglePublished<TNotification>(
        this IReadOnlyList<RecordedNotification> notifications)
        where TNotification : INotification
    {
        if (notifications is null)
        {
            throw new ArgumentNullException(nameof(notifications));
        }

        var matches = notifications.Where(notification => notification.Notification is TNotification).ToArray();
        if (matches.Length != 1)
        {
            throw new AstraFlowAssertionException(
                $"Expected exactly one published notification of type '{typeof(TNotification).FullName}', but found {matches.Length}.");
        }

        return matches[0];
    }

    /// <summary>
    /// Asserts that at least one notification of the requested type was published.
    /// </summary>
    public static void ShouldHavePublished<TNotification>(
        this IReadOnlyList<RecordedNotification> notifications)
        where TNotification : INotification
    {
        notifications.SingleOrMore<TNotification>("published notification");
    }

    /// <summary>
    /// Asserts that no notification of the requested type was published.
    /// </summary>
    public static void ShouldNotHavePublished<TNotification>(
        this IReadOnlyList<RecordedNotification> notifications)
        where TNotification : INotification
    {
        if (notifications is null)
        {
            throw new ArgumentNullException(nameof(notifications));
        }

        var count = notifications.Count(notification => notification.Notification is TNotification);
        if (count != 0)
        {
            throw new AstraFlowAssertionException(
                $"Expected no published notification of type '{typeof(TNotification).FullName}', but found {count}.");
        }
    }

    private static void SingleOrMore<TItem>(this IReadOnlyList<RecordedRequest> requests, string label)
    {
        if (requests is null)
        {
            throw new ArgumentNullException(nameof(requests));
        }

        var count = requests.Count(request => request.Request is TItem);
        if (count == 0)
        {
            throw new AstraFlowAssertionException(
                $"Expected at least one {label} of type '{typeof(TItem).FullName}', but found none.");
        }
    }

    private static void SingleOrMore<TItem>(this IReadOnlyList<RecordedNotification> notifications, string label)
    {
        if (notifications is null)
        {
            throw new ArgumentNullException(nameof(notifications));
        }

        var count = notifications.Count(notification => notification.Notification is TItem);
        if (count == 0)
        {
            throw new AstraFlowAssertionException(
                $"Expected at least one {label} of type '{typeof(TItem).FullName}', but found none.");
        }
    }
}
