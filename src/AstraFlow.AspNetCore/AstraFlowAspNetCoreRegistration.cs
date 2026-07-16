using AstraFlow.Diagnostics;
using AstraFlow.Mediator;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace AstraFlow.AspNetCore;

/// <summary>
/// Registers ASP.NET Core integration helpers for AstraFlow.
/// </summary>
public static class AstraFlowAspNetCoreRegistration
{
    /// <summary>
    /// Adds AstraFlow ASP.NET Core options and endpoint-filter services.
    /// </summary>
    public static IServiceCollection AddAstraFlowAspNetCore(
        this IServiceCollection services,
        Action<AstraFlowAspNetCoreOptions>? configure = null)
    {
        if (services is null)
            throw new ArgumentNullException(nameof(services));

        services.AddOptions<AstraFlowAspNetCoreOptions>();
        if (configure is not null)
            services.Configure(configure);

        services.AddSingleton<AstraFlowValidationProblemEndpointFilter>();
        return services;
    }

    /// <summary>
    /// Maps a POST endpoint that sends the request through <see cref="ISender"/> and returns OK.
    /// </summary>
    public static RouteHandlerBuilder MapAstraFlowSend<TRequest, TResponse>(
        this IEndpointRouteBuilder endpoints,
        string pattern)
        where TRequest : IRequest<TResponse>
    {
        if (endpoints is null)
            throw new ArgumentNullException(nameof(endpoints));

        return endpoints.MapPost(
            pattern,
            async (TRequest request, ISender sender, CancellationToken cancellationToken) =>
                Results.Ok(await sender.Send<TResponse>(request, cancellationToken)));
    }

    /// <summary>
    /// Maps a POST endpoint that sends a void request through <see cref="ISender"/> and returns NoContent.
    /// </summary>
    public static RouteHandlerBuilder MapAstraFlowCommand<TRequest>(
        this IEndpointRouteBuilder endpoints,
        string pattern)
        where TRequest : IRequest
    {
        if (endpoints is null)
            throw new ArgumentNullException(nameof(endpoints));

        return endpoints.MapPost(
            pattern,
            async (TRequest request, ISender sender, CancellationToken cancellationToken) =>
            {
                await sender.Send(request, cancellationToken);
                return Results.NoContent();
            });
    }

    /// <summary>
    /// Maps the redacted AstraFlow diagnostics endpoint.
    /// </summary>
    public static IEndpointRouteBuilder MapAstraFlowDiagnostics(
        this IEndpointRouteBuilder endpoints)
    {
        if (endpoints is null)
            throw new ArgumentNullException(nameof(endpoints));

        endpoints.MapGet(
            GetOptions(endpoints).DiagnosticsEndpointPath,
            (
                IAstraFlowDiagnosticsReporter reporter,
                IOptions<AstraFlowAspNetCoreOptions> options,
                IHostEnvironment environment) =>
            {
                if (!AstraFlowDiagnosticsEndpointPolicy.IsEnabled(environment, options.Value))
                    return Results.NotFound();

                var report = reporter.CreateReport();
                var response = new AstraFlowDiagnosticsHttpReport(
                    report.Summary,
                    options.Value.IncludeDiagnosticsFindings ? report.Findings : null);

                return Results.Ok(response);
            });

        return endpoints;
    }

    /// <summary>
    /// Maps a health-summary endpoint backed by AstraFlow diagnostics.
    /// </summary>
    public static IEndpointRouteBuilder MapAstraFlowHealthSummary(
        this IEndpointRouteBuilder endpoints)
    {
        if (endpoints is null)
            throw new ArgumentNullException(nameof(endpoints));

        endpoints.MapGet(
            GetOptions(endpoints).HealthSummaryPath,
            (IAstraFlowDiagnosticsReporter reporter) => Results.Ok(AstraFlowHealthSummary.FromReport(reporter.CreateReport())));

        return endpoints;
    }

    /// <summary>
    /// Sends an AstraFlow request from a controller and returns OK with the response.
    /// </summary>
    public static async Task<ActionResult<TResponse>> SendAstraFlow<TResponse>(
        this ControllerBase controller,
        ISender sender,
        IRequest<TResponse> request,
        CancellationToken cancellationToken = default)
    {
        if (controller is null)
            throw new ArgumentNullException(nameof(controller));

        if (sender is null)
            throw new ArgumentNullException(nameof(sender));

        var response = await sender.Send(request, cancellationToken);
        return controller.Ok(response);
    }

    /// <summary>
    /// Sends a void AstraFlow request from a controller and returns NoContent.
    /// </summary>
    public static async Task<IActionResult> SendAstraFlow(
        this ControllerBase controller,
        ISender sender,
        IRequest request,
        CancellationToken cancellationToken = default)
    {
        if (controller is null)
            throw new ArgumentNullException(nameof(controller));

        if (sender is null)
            throw new ArgumentNullException(nameof(sender));

        await sender.Send(request, cancellationToken);
        return controller.NoContent();
    }

    private static AstraFlowAspNetCoreOptions GetOptions(IEndpointRouteBuilder endpoints)
    {
        return endpoints.ServiceProvider.GetService<IOptions<AstraFlowAspNetCoreOptions>>()?.Value
            ?? new AstraFlowAspNetCoreOptions();
    }
}
