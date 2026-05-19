using AstraFlow.Mapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace AstraFlow.Mapper.Conventions;

/// <summary>
/// Registers opt-in AstraFlow convention mapping services.
/// </summary>
public static class AstraFlowConventionMapperRegistration
{
    /// <summary>
    /// Adds convention mapping rules to the AstraFlow mapper.
    /// Call this after <c>AddAstraFlowMapper</c>; convention mapping is never enabled by default.
    /// </summary>
    /// <param name="services">The service collection to update.</param>
    /// <param name="configureCatalog">The convention mapping catalog configuration.</param>
    /// <param name="configureOptions">Optional convention mapping options.</param>
    /// <returns>The same service collection for chaining.</returns>
    public static IServiceCollection AddAstraFlowConventionMapping(
        this IServiceCollection services,
        Action<ConventionMappingCatalog> configureCatalog,
        Action<ConventionMappingOptions>? configureOptions = null)
    {
        if (services is null)
            throw new ArgumentNullException(nameof(services));
        if (configureCatalog is null)
            throw new ArgumentNullException(nameof(configureCatalog));

        services.AddOptions<ConventionMappingOptions>();
        if (configureOptions is not null)
            services.Configure(configureOptions);

        var catalog = new ConventionMappingCatalog();
        configureCatalog(catalog);

        services.TryAddSingleton(catalog);
        services.TryAddSingleton<ConventionMappingPlanProvider>();
        services.AddSingleton<IMappingPlanProvider>(provider => provider.GetRequiredService<ConventionMappingPlanProvider>());
        services.AddScoped<IObjectMappingRule, ConventionObjectMappingRule>();
        services.AddHostedService<ConventionMappingStartupValidator>();

        return services;
    }
}
