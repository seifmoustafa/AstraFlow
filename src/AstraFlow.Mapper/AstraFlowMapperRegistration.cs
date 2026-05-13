using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

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
        return services.AddAstraFlowMapper(assemblyMarkerTypes, configure: null);
    }

    /// <summary>
    /// Adds AstraFlow mapper services.
    /// </summary>
    /// <param name="services">The service collection to update.</param>
    /// <param name="assemblyMarkerTypes">Marker types whose assemblies should be scanned for mapping rules and projections.</param>
    /// <param name="configure">Optional mapper configuration.</param>
    /// <returns>The same service collection for chaining.</returns>
    public static IServiceCollection AddAstraFlowMapper(
        this IServiceCollection services,
        IEnumerable<Type> assemblyMarkerTypes,
        Action<MappingOptions>? configure = null)
    {
        if (services is null)
            throw new ArgumentNullException(nameof(services));
        if (assemblyMarkerTypes is null)
            throw new ArgumentNullException(nameof(assemblyMarkerTypes));

        var markerTypes = assemblyMarkerTypes
            .Where(type => type is not null)
            .ToArray();

        services.AddOptions<MappingOptions>();
        if (configure is not null)
            services.Configure(configure);

        services.AddScoped<SecureIdMapper>();
        services.AddScoped<IMapper, AstraFlowObjectMapper>();
        services.AddScoped<IObjectMappingValidator, AstraFlowObjectMappingValidator>();
        services.AddScoped<IProjectionRegistry, AstraFlowProjectionRegistry>();
        services.AddScoped<IProjectionValidator, AstraFlowProjectionValidator>();
        services.AddHostedService<AstraFlowObjectMappingStartupValidator>();

        foreach (var ruleType in DiscoverMappingRuleTypes(markerTypes))
        {
            services.AddScoped(typeof(IObjectMappingRule), ruleType);
        }

        foreach (var projection in DiscoverProjectionDescriptors(markerTypes))
        {
            services.TryAddScoped(projection.ImplementationType);
            services.AddScoped(projection.ServiceType, provider => provider.GetRequiredService(projection.ImplementationType));
            services.AddSingleton(projection);
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

    private static IEnumerable<ProjectionDescriptor> DiscoverProjectionDescriptors(IEnumerable<Type> assemblyMarkerTypes)
    {
        return assemblyMarkerTypes
            .Where(type => type is not null)
            .Select(type => type.Assembly)
            .Distinct()
            .SelectMany(GetLoadableTypes)
            .Where(type => type is { IsAbstract: false, IsInterface: false })
            .SelectMany(type => type
                .GetInterfaces()
                .Where(interfaceType =>
                    interfaceType.IsGenericType &&
                    interfaceType.GetGenericTypeDefinition() == typeof(IProjection<,>))
                .Distinct()
                .Select(interfaceType =>
                {
                    var arguments = interfaceType.GetGenericArguments();
                    return new ProjectionDescriptor(
                        arguments[0],
                        arguments[1],
                        interfaceType,
                        type,
                        ServiceLifetime.Scoped);
                }));
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
