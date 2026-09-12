using System.Diagnostics;
using AstraFlow.Mediator;

namespace AstraFlow.OpenTelemetry;

/// <summary>
/// Emits tracing and metrics around response request pipelines.
/// </summary>
public sealed class AstraFlowRequestTelemetryBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly AstraFlowTelemetry telemetry;

    /// <summary>
    /// Initializes a response request telemetry behavior.
    /// </summary>
    public AstraFlowRequestTelemetryBehavior(AstraFlowTelemetry telemetry)
    {
        this.telemetry = telemetry ?? throw new ArgumentNullException(nameof(telemetry));
    }

    /// <inheritdoc />
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (next is null)
            throw new ArgumentNullException(nameof(next));

        using var activity = telemetry.StartActivity(
            AstraFlowTelemetryNames.RequestActivity,
            "request",
            request?.GetType() ?? typeof(TRequest));
        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();
            activity?.SetStatus(ActivityStatusCode.Ok);
            return response;
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
