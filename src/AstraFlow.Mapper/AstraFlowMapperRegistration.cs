using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Mapper;

/// <summary>
/// Registers AstraFlow mapper services with Microsoft.Extensions.DependencyInjection.
/// </summary>
public static class AstraFlowMapperRegistration
{
    /// <summary>
    /// Adds AstraFlow mapper services.
    /// </summary>
    /// <param name="services">The service collection to update.</param>
    /// <param name="assemblyMarkerTypes">Marker types whose assemblies should be scanned for mapping rules.</param>
    /// <returns>The same service collection for chaining.</returns>
    public static IServiceCollection AddAstraFlowMapper(
        this IServiceCollection services,
        params Type[] assemblyMarkerTypes)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddOptions<MappingOptions>();
        services.AddScoped<SecureIdMapper>();
        services.AddScoped<IMapper, AstraFlowObjectMapper>();
        services.AddScoped<IObjectMappingValidator, AstraFlowObjectMappingValidator>();
        services.AddHostedService<AstraFlowObjectMappingStartupValidator>();

        foreach (var ruleType in DiscoverMappingRuleTypes(assemblyMarkerTypes))
        {
            services.AddScoped(typeof(IObjectMappingRule), ruleType);
        }

        return services;
    }

    private static IEnumerable<Type> DiscoverMappingRuleTypes(IEnumerable<Type> assemblyMarkerTypes)
    {
        return assemblyMarkerTypes
            .Where(type => type is not null)
            .Select(type => type.Assembly)
            .Distinct()
            .SelectMany(GetLoadableTypes)
            .Where(type =>
                type is { IsAbstract: false, IsInterface: false } &&
                typeof(IObjectMappingRule).IsAssignableFrom(type));
    }

    private static IEnumerable<Type> GetLoadableTypes(Assembly assembly)
    {
        try
        {
            return assembly.GetTypes();
        }
        catch (ReflectionTypeLoadException ex)
        {
            return ex.Types.Where(type => type is not null)!;
        }
    }
}
