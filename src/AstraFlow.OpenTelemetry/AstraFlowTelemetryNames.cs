namespace AstraFlow.OpenTelemetry;

/// <summary>
/// Stable ActivitySource, Meter, activity, and metric names used by AstraFlow telemetry.
/// </summary>
public static class AstraFlowTelemetryNames
{
    /// <summary>ActivitySource name.</summary>
    public const string ActivitySourceName = "AstraFlow";

    /// <summary>Meter name.</summary>
    public const string MeterName = "AstraFlow";

    /// <summary>Request activity name.</summary>
    public const string RequestActivity = "astraflow.request";

    /// <summary>Void request activity name.</summary>
    public const string VoidRequestActivity = "astraflow.request.void";

    /// <summary>Notification publish activity name.</summary>
    public const string NotificationActivity = "astraflow.notification.publish";

    /// <summary>Mapping validation activity name.</summary>
    public const string MappingValidationActivity = "astraflow.mapping.validate";

    /// <summary>Projection validation activity name.</summary>
    public const string ProjectionValidationActivity = "astraflow.projection.validate";

    /// <summary>Request duration histogram name.</summary>
    public const string RequestDurationMetric = "astraflow.request.duration";

    /// <summary>Request failure counter name.</summary>
    public const string RequestFailureMetric = "astraflow.request.failures";

    /// <summary>Notification duration histogram name.</summary>
    public const string NotificationDurationMetric = "astraflow.notification.duration";

    /// <summary>Notification failure counter name.</summary>
    public const string NotificationFailureMetric = "astraflow.notification.failures";

    /// <summary>Validation finding counter name.</summary>
    public const string ValidationFindingMetric = "astraflow.validation.findings";
}
