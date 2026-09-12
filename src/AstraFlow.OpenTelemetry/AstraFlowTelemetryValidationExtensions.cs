using System.Diagnostics;
using AstraFlow.Mapper;

namespace AstraFlow.OpenTelemetry;

/// <summary>
/// Telemetry helpers for mapper, projection, and validation diagnostics.
/// </summary>
public static class AstraFlowTelemetryValidationExtensions
{
    /// <summary>
    /// Runs mapper catalog validation inside an AstraFlow telemetry activity.
    /// </summary>
    public static void ValidateWithAstraFlowTelemetry(
        this IObjectMappingValidator validator,
        MappingOptions options,
        AstraFlowTelemetry telemetry)
    {
        if (validator is null)
            throw new ArgumentNullException(nameof(validator));

        if (telemetry is null)
            throw new ArgumentNullException(nameof(telemetry));

        using var activity = telemetry.StartActivity(
            AstraFlowTelemetryNames.MappingValidationActivity,
            "mapping.validate");

        try
        {
            validator.Validate(options);
            activity?.SetStatus(ActivityStatusCode.Ok);
        }
        catch (Exception ex)
        {
            telemetry.RecordRequestFailure(ex);
            activity?.SetStatus(ActivityStatusCode.Error);
            throw;
        }
    }

    /// <summary>
    /// Runs projection validation inside an AstraFlow telemetry activity.
    /// </summary>
    public static ProjectionValidationReport ValidateWithAstraFlowTelemetry(
        this IProjectionValidator validator,
        MappingOptions options,
        AstraFlowTelemetry telemetry)
    {
        if (validator is null)
            throw new ArgumentNullException(nameof(validator));

        if (telemetry is null)
            throw new ArgumentNullException(nameof(telemetry));

        using var activity = telemetry.StartActivity(
            AstraFlowTelemetryNames.ProjectionValidationActivity,
            "projection.validate");

        try
        {
            var report = validator.Validate(options);
            activity?.SetStatus(report.Findings.Count == 0 ? ActivityStatusCode.Ok : ActivityStatusCode.Error);
            return report;
        }
        catch (Exception ex)
        {
            telemetry.RecordRequestFailure(ex);
            activity?.SetStatus(ActivityStatusCode.Error);
            throw;
        }
    }

    /// <summary>
    /// Records validation findings without emitting payload values.
    /// </summary>
    public static void RecordValidationFindings(
        this AstraFlowTelemetry telemetry,
        int findingCount)
    {
        if (telemetry is null)
            throw new ArgumentNullException(nameof(telemetry));

        telemetry.RecordValidationFindings(findingCount);
    }
}
