using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Mediator;

/// <summary>
/// Registers the AstraFlow mediator, sender, publisher, request handlers, and notification handlers.
/// </summary>
public static class AstraFlowMediatorRegistration
{
    /// <summary>
    /// Adds AstraFlow mediator services and scans the supplied assemblies for closed handler implementations.
    /// </summary>
    /// <param name="services">The service collection to update.</param>
    /// <param name="assemblyMarkerTypes">
    /// Marker types from active modules whose assemblies should be scanned for handlers.
    /// </param>
    /// <returns>The same service collection for chaining.</returns>
    public static IServiceCollection AddAstraFlowMediator(
        this IServiceCollection services,
        params Type[] assemblyMarkerTypes)
    {
        return services.AddAstraFlowMediator(false, assemblyMarkerTypes);
    }

    /// <summary>
    /// Adds AstraFlow mediator services and optionally validates request handler coverage at startup.
    /// </summary>
    /// <param name="services">The service collection to update.</param>
    /// <param name="validateRequestCoverage">
    /// When true, every concrete scanned <see cref="IRequest{TResponse}"/> type must have exactly one handler.
    /// </param>
    /// <param name="assemblyMarkerTypes">
    /// Marker types from active modules whose assemblies should be scanned for handlers and request contracts.
    /// </param>
    /// <returns>The same service collection for chaining.</returns>
    public static IServiceCollection AddAstraFlowMediator(
        this IServiceCollection services,
        bool validateRequestCoverage,
        params Type[] assemblyMarkerTypes)
    {
        ArgumentNullException.ThrowIfNull(services);

        var assemblies = (assemblyMarkerTypes ?? [])
            .Where(t => t is not null)
            .Select(t => t.Assembly)
            .Append(typeof(AstraFlowMediatorRegistration).Assembly)
            .Distinct()
            .ToArray();

        services.AddLogging();
        services.AddOptions<NotificationPublishOptions>();
        services.AddScoped<IMediator, AstraFlowMediator>();
        services.AddScoped<ISender>(sp => sp.GetRequiredService<IMediator>());
        services.AddScoped<IPublisher>(sp => sp.GetRequiredService<IMediator>());

        var requestHandlers = RegisterClosedImplementations(
            services,
            assemblies,
            typeof(IRequestHandler<,>),
            allowMultiple: false);
        RegisterClosedImplementations(services, assemblies, typeof(INotificationHandler<>), allowMultiple: true);

        if (validateRequestCoverage)
            ValidateRequestCoverage(assemblies, requestHandlers);

        return services;
    }

    /// <summary>
    /// Registers all concrete types that implement a closed form of the requested open generic service type.
    /// </summary>
    /// <param name="services">The service collection to update.</param>
    /// <param name="assemblies">Assemblies to scan.</param>
    /// <param name="openServiceType">The open generic service type, such as <c>IRequestHandler&lt;,&gt;</c>.</param>
    /// <param name="allowMultiple">Whether multiple implementations may be registered for the same closed service type.</param>
    /// <exception cref="InvalidOperationException">
    /// Thrown when duplicate single-handler request registrations are discovered.
    /// </exception>
    private static IReadOnlyList<ServiceRegistration> RegisterClosedImplementations(
        IServiceCollection services,
        IReadOnlyCollection<Assembly> assemblies,
        Type openServiceType,
        bool allowMultiple)
    {
        var registrations = assemblies
            .SelectMany(GetLoadableTypes)
            .Where(t => t is { IsAbstract: false, IsInterface: false })
            .SelectMany(implementationType =>
                implementationType
                    .GetInterfaces()
                    .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == openServiceType)
                    .Distinct()
                    .Select(serviceType => new { ServiceType = serviceType, ImplementationType = implementationType }))
            .ToArray();

        if (!allowMultiple)
        {
            var duplicate = registrations
                .GroupBy(r => r.ServiceType)
                .FirstOrDefault(g => g.Select(r => r.ImplementationType).Distinct().Skip(1).Any());

            if (duplicate is not null)
            {
                var implementations = string.Join(
                    ", ",
                    duplicate.Select(r => r.ImplementationType.FullName).Distinct());

                throw new InvalidOperationException(
                    $"Multiple request handlers found for '{duplicate.Key.FullName}': {implementations}.");
            }
        }

        foreach (var registration in registrations)
        {
            services.AddScoped(registration.ServiceType, registration.ImplementationType);
        }

        return registrations
            .Select(r => new ServiceRegistration(r.ServiceType, r.ImplementationType))
            .ToArray();
    }

    /// <summary>
    /// Verifies that every concrete request contract in the scanned assemblies has a handler.
    /// </summary>
    /// <param name="assemblies">Assemblies scanned for request contracts.</param>
    /// <param name="requestHandlers">Closed request handler registrations discovered for the same assemblies.</param>
    /// <exception cref="InvalidOperationException">Thrown when a concrete request is missing its handler.</exception>
    private static void ValidateRequestCoverage(
        IReadOnlyCollection<Assembly> assemblies,
        IReadOnlyCollection<ServiceRegistration> requestHandlers)
    {
        var handlerServiceTypes = requestHandlers
            .Select(r => r.ServiceType)
            .ToHashSet();

        var requestContracts = assemblies
            .SelectMany(GetLoadableTypes)
            .Where(t => t is { IsAbstract: false, IsInterface: false, ContainsGenericParameters: false })
            .Select(requestType => new
            {
                RequestType = requestType,
                RequestInterfaces = requestType
                    .GetInterfaces()
                    .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IRequest<>))
                    .Distinct()
                    .ToArray()
            })
            .Where(r => r.RequestInterfaces.Length != 0)
            .ToArray();

        var ambiguousRequests = requestContracts
            .Where(r => r.RequestInterfaces.Length > 1)
            .Select(r =>
            {
                var contracts = string.Join(", ", r.RequestInterfaces.Select(i => i.FullName));
                return $"{r.RequestType.FullName} ({contracts})";
            })
            .OrderBy(message => message)
            .ToArray();

        if (ambiguousRequests.Length != 0)
        {
            throw new InvalidOperationException(
                "AstraFlow mediator request handler coverage validation failed. Ambiguous request contracts: "
                + string.Join(", ", ambiguousRequests));
        }

        var missingRequests = requestContracts
            .Select(r =>
            {
                var responseType = r.RequestInterfaces[0].GetGenericArguments()[0];
                var handlerType = typeof(IRequestHandler<,>).MakeGenericType(r.RequestType, responseType);
                return new { r.RequestType, HandlerType = handlerType };
            })
            .Where(r => !handlerServiceTypes.Contains(r.HandlerType))
            .Select(r => r.RequestType.FullName)
            .OrderBy(name => name)
            .ToArray();

        if (missingRequests.Length == 0)
            return;

        throw new InvalidOperationException(
            "AstraFlow mediator request handler coverage validation failed. Missing handlers: "
            + string.Join(", ", missingRequests));
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

    /// <summary>
    /// Represents one closed service-to-implementation registration discovered during assembly scanning.
    /// </summary>
    private sealed record ServiceRegistration(Type ServiceType, Type ImplementationType);
}
