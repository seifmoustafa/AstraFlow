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

    /// <summary>
    /// Controls how notification handlers are scheduled.
    /// Sequential publishing remains the default because handler ordering and scoped state are often meaningful.
    /// Override with <c>Mediator__Notifications__PublishStrategy</c>.
    /// </summary>
    public NotificationPublishStrategy PublishStrategy { get; set; } =
        NotificationPublishStrategy.Sequential;

    /// <summary>
    /// Maximum number of handlers that may run concurrently when <see cref="PublishStrategy"/>
    /// is <see cref="NotificationPublishStrategy.BoundedParallel"/>.
    /// </summary>
    public int MaxDegreeOfParallelism { get; set; } = Environment.ProcessorCount;
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

/// <summary>
/// Defines scheduling strategies for notification publishing.
/// </summary>
public enum NotificationPublishStrategy
{
    /// <summary>
    /// Run handlers one after another in dependency-injection registration order.
    /// </summary>
    Sequential = 0,

    /// <summary>
    /// Run all handlers concurrently. Use only when handlers do not depend on ordering or shared mutable scoped state.
    /// </summary>
    Parallel = 1,

    /// <summary>
    /// Run handlers concurrently while limiting the maximum number of active handler operations.
    /// </summary>
    BoundedParallel = 2
}
