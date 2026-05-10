namespace AstraFlow.Mediator;

/// <summary>
/// Runtime options for AstraFlow notification publishing.
/// Values are loaded from <c>Mediator:Notifications</c> in appsettings, user secrets, or environment variables.
/// </summary>
public sealed class NotificationPublishOptions
{
    /// <summary>
    /// Configuration section name used for notification publishing options.
    /// </summary>
    public const string SectionName = "Mediator:Notifications";

    /// <summary>
    /// Controls how the mediator behaves when one notification handler throws.
    /// Override with <c>Mediator__Notifications__FailurePolicy</c>.
    /// </summary>
    public NotificationFailurePolicy FailurePolicy { get; set; } =
        NotificationFailurePolicy.FailFast;
}

/// <summary>
/// Defines failure handling strategies for sequential notification publishing.
/// </summary>
public enum NotificationFailurePolicy
{
    /// <summary>
    /// Stop immediately and rethrow the first handler exception.
    /// </summary>
    FailFast = 0,

    /// <summary>
    /// Log handler exceptions and continue publishing to remaining handlers.
    /// </summary>
    Continue = 1,

    /// <summary>
    /// Run all handlers, then throw an <see cref="AggregateException"/> when any handler failed.
    /// </summary>
    Aggregate = 2
}
