using System.Diagnostics;
using AstraFlow.Mediator;

namespace AstraFlow.OpenTelemetry;

/// <summary>
/// Emits tracing and metrics around void request pipelines.
/// </summary>
public sealed class AstraFlowVoidRequestTelemetryBehavior<TRequest> : IRequestPipelineBehavior<TRequest>
    where TRequest : IRequest
{
    private readonly AstraFlowTelemetry telemetry;

    /// <summary>
    /// Initializes a void request telemetry behavior.
    /// </summary>
    public AstraFlowVoidRequestTelemetryBehavior(AstraFlowTelemetry telemetry)
    {
        this.telemetry = telemetry ?? throw new ArgumentNullException(nameof(telemetry));
    }

    /// <inheritdoc />
    public async Task Handle(
        TRequest request,
        RequestHandlerDelegate next,
        CancellationToken cancellationToken)
    {
        if (next is null)
            throw new ArgumentNullException(nameof(next));

        using var activity = telemetry.StartActivity(
            AstraFlowTelemetryNames.VoidRequestActivity,
            "request.void",
            request?.GetType() ?? typeof(TRequest));
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await next();
            activity?.SetStatus(ActivityStatusCode.Ok);
        }
        catch (Exception ex)
        {
            telemetry.RecordRequestFailure(ex);
            activity?.SetStatus(ActivityStatusCode.Error);
            throw;
        }
        finally
        {
            stopwatch.Stop();
            telemetry.RecordRequestDuration(stopwatch.Elapsed.TotalMilliseconds);
        }
    }
}
