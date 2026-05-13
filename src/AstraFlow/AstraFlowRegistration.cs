using AstraFlow.Mapper;
using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow;

/// <summary>
/// Convenience registration methods for the full AstraFlow package family.
/// </summary>
public static class AstraFlowRegistration
{
    /// <summary>
    /// Adds AstraFlow mediator and mapper services.
    /// </summary>
    /// <param name="services">The service collection to update.</param>
    /// <param name="validateRequestCoverage">Whether request handler coverage should be validated during registration.</param>
    /// <param name="assemblyMarkerTypes">Marker types whose assemblies should be scanned for handlers.</param>
    /// <returns>The same service collection for chaining.</returns>
    public static IServiceCollection AddAstraFlow(
        this IServiceCollection services,
        bool validateRequestCoverage = false,
        params Type[] assemblyMarkerTypes)
    {
        if (services is null)
            throw new ArgumentNullException(nameof(services));

        services.AddAstraFlowMediator(validateRequestCoverage, assemblyMarkerTypes);
        services.AddAstraFlowMapper(assemblyMarkerTypes);

        return services;
    }
}
