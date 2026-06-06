using System.Diagnostics;
using AstraFlow.Mediator;

namespace AstraFlow.OpenTelemetry;

/// <summary>
/// Publisher wrapper that emits AstraFlow notification publish telemetry before delegating to the mediator.
/// </summary>
public sealed class AstraFlowTelemetryPublisher : IPublisher
{
    private readonly IMediator mediator;
    private readonly AstraFlowTelemetry telemetry;

    /// <summary>
    /// Initializes a telemetry publisher wrapper.
    /// </summary>
    public AstraFlowTelemetryPublisher(IMediator mediator, AstraFlowTelemetry telemetry)
    {
        this.mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        this.telemetry = telemetry ?? throw new ArgumentNullException(nameof(telemetry));
    }

    /// <inheritdoc />
    public async Task Publish<TNotification>(
        TNotification notification,
        CancellationToken cancellationToken = default)
        where TNotification : INotification
    {
        if (notification is null)
            throw new ArgumentNullException(nameof(notification));

        using var activity = telemetry.StartActivity(
            AstraFlowTelemetryNames.NotificationActivity,
            "notification.publish",
            notification.GetType());
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await mediator.Publish(notification, cancellationToken);
            activity?.SetStatus(ActivityStatusCode.Ok);
        }
        catch (Exception ex)
        {
            telemetry.RecordNotificationFailure(ex);
            activity?.SetStatus(ActivityStatusCode.Error);
            throw;
        }
        finally
        {
            stopwatch.Stop();
            telemetry.RecordNotificationDuration(stopwatch.Elapsed.TotalMilliseconds);
        }
    }

    /// <inheritdoc />
    public async Task Publish(object notification, CancellationToken cancellationToken = default)
    {
        if (notification is null)
            throw new ArgumentNullException(nameof(notification));

        using var activity = telemetry.StartActivity(
            AstraFlowTelemetryNames.NotificationActivity,
            "notification.publish",
            notification.GetType());
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await mediator.Publish(notification, cancellationToken);
            activity?.SetStatus(ActivityStatusCode.Ok);
        }
        catch (Exception ex)
        {
            telemetry.RecordNotificationFailure(ex);
            activity?.SetStatus(ActivityStatusCode.Error);
            throw;
        }
        finally
        {
            stopwatch.Stop();
            telemetry.RecordNotificationDuration(stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
