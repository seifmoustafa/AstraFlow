using System.Diagnostics;
using System.Diagnostics.Metrics;
using Microsoft.Extensions.Options;

namespace AstraFlow.OpenTelemetry;

/// <summary>
/// Shared AstraFlow ActivitySource and Meter facade.
/// </summary>
public sealed class AstraFlowTelemetry : IDisposable
{
    private readonly AstraFlowTelemetryOptions options;
    private readonly IAstraFlowTelemetryRedactor redactor;
    private readonly Histogram<double> requestDuration;
    private readonly Counter<long> requestFailures;
    private readonly Histogram<double> notificationDuration;
    private readonly Counter<long> notificationFailures;
    private readonly Counter<long> validationFindings;

    /// <summary>
    /// Initializes AstraFlow telemetry instruments.
    /// </summary>
    public AstraFlowTelemetry(
        IOptions<AstraFlowTelemetryOptions> options,
        IAstraFlowTelemetryRedactor redactor)
    {
        this.options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        this.redactor = redactor ?? throw new ArgumentNullException(nameof(redactor));

        ActivitySource = new ActivitySource(AstraFlowTelemetryNames.ActivitySourceName);
        Meter = new Meter(AstraFlowTelemetryNames.MeterName);
        requestDuration = Meter.CreateHistogram<double>(
            AstraFlowTelemetryNames.RequestDurationMetric,
            unit: "ms",
            description: "AstraFlow request pipeline duration in milliseconds.");
        requestFailures = Meter.CreateCounter<long>(
            AstraFlowTelemetryNames.RequestFailureMetric,
            unit: "{failure}",
            description: "AstraFlow request pipeline failures.");
        notificationDuration = Meter.CreateHistogram<double>(
            AstraFlowTelemetryNames.NotificationDurationMetric,
            unit: "ms",
            description: "AstraFlow notification publish duration in milliseconds.");
        notificationFailures = Meter.CreateCounter<long>(
            AstraFlowTelemetryNames.NotificationFailureMetric,
            unit: "{failure}",
            description: "AstraFlow notification publish failures.");
        validationFindings = Meter.CreateCounter<long>(
            AstraFlowTelemetryNames.ValidationFindingMetric,
            unit: "{finding}",
            description: "AstraFlow validation findings.");
    }

    /// <summary>
    /// Gets the AstraFlow ActivitySource.
    /// </summary>
    public ActivitySource ActivitySource { get; }

    /// <summary>
    /// Gets the AstraFlow Meter.
    /// </summary>
    public Meter Meter { get; }

    /// <summary>
    /// Starts an activity when telemetry and sampling allow it.
    /// </summary>
    public Activity? StartActivity(string name, string operationKind, Type? operationType = null)
    {
        if (!options.Enabled || options.ShouldTraceOperation?.Invoke(name) == false)
            return null;

        var activity = ActivitySource.StartActivity(name, ActivityKind.Internal);
        if (activity is null)
            return null;

        activity.SetTag("astraflow.operation", operationKind);
        if (options.IncludeOperationTypeNames && operationType is not null)
            activity.SetTag("astraflow.operation.type", redactor.Redact("astraflow.operation.type", GetDisplayName(operationType)));

        return activity;
    }

    /// <summary>
    /// Records request duration.
    /// </summary>
    public void RecordRequestDuration(double milliseconds)
    {
        if (options.Enabled)
            requestDuration.Record(milliseconds);
    }

    /// <summary>
    /// Records a request failure.
    /// </summary>
    public void RecordRequestFailure(Exception exception)
    {
        if (!options.Enabled)
            return;

        if (options.IncludeExceptionTypeNames)
        {
            requestFailures.Add(
                1,
                new KeyValuePair<string, object?>("exception.type", redactor.Redact("exception.type", exception.GetType().FullName ?? exception.GetType().Name)));
            return;
        }

        requestFailures.Add(1);
    }

    /// <summary>
    /// Records notification publish duration.
    /// </summary>
    public void RecordNotificationDuration(double milliseconds)
    {
        if (options.Enabled)
            notificationDuration.Record(milliseconds);
    }

    /// <summary>
    /// Records a notification publish failure.
    /// </summary>
    public void RecordNotificationFailure(Exception exception)
    {
        if (!options.Enabled)
            return;

        if (options.IncludeExceptionTypeNames)
        {
            notificationFailures.Add(
                1,
                new KeyValuePair<string, object?>("exception.type", redactor.Redact("exception.type", exception.GetType().FullName ?? exception.GetType().Name)));
            return;
        }

        notificationFailures.Add(1);
    }

    /// <summary>
    /// Records validation finding count.
    /// </summary>
    public void RecordValidationFindings(long count)
    {
        if (options.Enabled && count > 0)
            validationFindings.Add(count);
    }

    /// <inheritdoc />
    public void Dispose()
    {
        ActivitySource.Dispose();
        Meter.Dispose();
    }

    private static string GetDisplayName(Type type)
    {
        return type.FullName ?? type.Name;
    }
}
