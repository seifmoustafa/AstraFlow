using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.OpenTelemetry;

/// <summary>
/// Registers AstraFlow observability instrumentation.
/// </summary>
public static class AstraFlowOpenTelemetryRegistration
{
    /// <summary>
    /// Adds ActivitySource and Meter instrumentation for AstraFlow.
    /// Call this after <c>AddAstraFlowMediator</c> when notification publish tracing should replace the default IPublisher service.
    /// </summary>
    public static IServiceCollection AddAstraFlowOpenTelemetry(
        this IServiceCollection services,
        Action<AstraFlowTelemetryOptions>? configure = null)
    {
        if (services is null)
            throw new ArgumentNullException(nameof(services));

        services.AddOptions<AstraFlowTelemetryOptions>();
        if (configure is not null)
            services.Configure(configure);

        services.AddSingleton<IAstraFlowTelemetryRedactor, AstraFlowDefaultTelemetryRedactor>();
        services.AddSingleton<AstraFlowTelemetry>();
        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(AstraFlowRequestTelemetryBehavior<,>));
        services.AddScoped(typeof(IRequestPipelineBehavior<>), typeof(AstraFlowVoidRequestTelemetryBehavior<>));
        services.AddScoped<IPublisher, AstraFlowTelemetryPublisher>();
        return services;
    }
}
