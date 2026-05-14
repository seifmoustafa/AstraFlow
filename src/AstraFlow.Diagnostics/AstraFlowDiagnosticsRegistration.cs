using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Diagnostics;

/// <summary>
/// Registers AstraFlow diagnostics services.
/// </summary>
public static class AstraFlowDiagnosticsRegistration
{
    /// <summary>
    /// Adds framework-neutral AstraFlow diagnostics reporting.
    /// Call this after registering AstraFlow mediator and/or mapper services so diagnostics can inspect them.
    /// </summary>
    /// <param name="services">The service collection to update.</param>
    /// <param name="configure">Optional diagnostics configuration.</param>
    /// <returns>The same service collection for chaining.</returns>
    public static IServiceCollection AddAstraFlowDiagnostics(
        this IServiceCollection services,
        Action<AstraFlowDiagnosticsOptions>? configure = null)
    {
        if (services is null)
            throw new ArgumentNullException(nameof(services));

        var options = new AstraFlowDiagnosticsOptions();
        configure?.Invoke(options);

        services.AddSingleton(options);
        services.AddSingleton(new AstraFlowDiagnosticsSnapshot(services));
        services.AddSingleton<IAstraFlowDiagnosticsReporter, AstraFlowDiagnosticsReporter>();

        return services;
    }
}
