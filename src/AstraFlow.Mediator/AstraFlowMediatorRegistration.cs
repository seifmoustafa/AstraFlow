using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Mediator;

/// <summary>
/// Registers the AstraFlow mediator, sender, publisher, request handlers, and notification handlers.
/// </summary>
public static class AstraFlowMediatorRegistration
{
    /// <summary>
    /// Adds AstraFlow mediator services, scans assemblies, and applies explicit registration-builder configuration.
    /// </summary>
    /// <param name="services">The service collection to update.</param>
    /// <param name="configure">Explicit mediator registration configuration.</param>
    /// <param name="assemblyMarkerTypes">Marker types from active modules whose assemblies should be scanned.</param>
    /// <returns>The same service collection for chaining.</returns>
    public static IServiceCollection AddAstraFlowMediator(
        this IServiceCollection services,
        Action<AstraFlowMediatorBuilder> configure,
        params Type[] assemblyMarkerTypes)
    {
        if (configure is null)
            throw new ArgumentNullException(nameof(configure));

        services.AddAstraFlowMediator(false, assemblyMarkerTypes);
        configure(new AstraFlowMediatorBuilder(services));
        return services;
    }

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
        if (services is null)
            throw new ArgumentNullException(nameof(services));

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
        services.AddScoped<IStreamSender>(sp => sp.GetRequiredService<IMediator>());
        services.AddScoped<IPublisher>(sp => sp.GetRequiredService<IMediator>());

        var requestHandlers = RegisterClosedImplementations(
            services,
            assemblies,
            typeof(IRequestHandler<,>),
            allowMultiple: false);
        var voidRequestHandlers = RegisterClosedImplementations(
            services,
            assemblies,
            typeof(IRequestHandler<>),
            allowMultiple: false);
        var streamRequestHandlers = RegisterClosedImplementations(
            services,
            assemblies,
            typeof(IStreamRequestHandler<,>),
            allowMultiple: false);
        RegisterClosedImplementations(services, assemblies, typeof(INotificationHandler<>), allowMultiple: true);

        if (validateRequestCoverage)
            ValidateRequestCoverage(assemblies, requestHandlers, voidRequestHandlers, streamRequestHandlers);

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
                    duplicate.Select(r => GetDisplayName(r.ImplementationType)).Distinct());

                throw new InvalidOperationException(
                    $"Multiple request handlers found for '{GetDisplayName(duplicate.Key)}': {implementations}.");
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
    /// <param name="voidRequestHandlers">Closed void request handler registrations discovered for the same assemblies.</param>
    /// <param name="streamRequestHandlers">Closed stream request handler registrations discovered for the same assemblies.</param>
    /// <exception cref="InvalidOperationException">Thrown when a concrete request is missing its handler.</exception>
    private static void ValidateRequestCoverage(
        IReadOnlyCollection<Assembly> assemblies,
        IReadOnlyCollection<ServiceRegistration> requestHandlers,
        IReadOnlyCollection<ServiceRegistration> voidRequestHandlers,
        IReadOnlyCollection<ServiceRegistration> streamRequestHandlers)
    {
        var handlerServiceTypes = new HashSet<Type>(
            requestHandlers
                .Concat(voidRequestHandlers)
                .Concat(streamRequestHandlers)
                .Select(r => r.ServiceType));

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
                    .ToArray(),
                StreamInterfaces = requestType
                    .GetInterfaces()
                    .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IStreamRequest<>))
                    .Distinct()
                    .ToArray(),
                HasVoidRequest = typeof(IRequest).IsAssignableFrom(requestType)
            })
            .Where(r => r.RequestInterfaces.Length != 0 || r.StreamInterfaces.Length != 0 || r.HasVoidRequest)
            .ToArray();

        var ambiguousRequests = requestContracts
            .Where(r => r.RequestInterfaces.Length + r.StreamInterfaces.Length + (r.HasVoidRequest ? 1 : 0) > 1)
            .Select(r =>
            {
                var contracts = string.Join(
                    ", ",
                    r.RequestInterfaces
                        .Concat(r.StreamInterfaces)
                        .Select(GetDisplayName)
                        .Concat(r.HasVoidRequest ? new[] { GetDisplayName(typeof(IRequest)) } : Array.Empty<string>()));
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
                Type handlerType;
                if (r.HasVoidRequest)
                {
                    handlerType = typeof(IRequestHandler<>).MakeGenericType(r.RequestType);
                }
                else if (r.RequestInterfaces.Length == 1)
                {
                    var responseType = r.RequestInterfaces[0].GetGenericArguments()[0];
                    handlerType = typeof(IRequestHandler<,>).MakeGenericType(r.RequestType, responseType);
                }
                else
                {
                    var responseType = r.StreamInterfaces[0].GetGenericArguments()[0];
                    handlerType = typeof(IStreamRequestHandler<,>).MakeGenericType(r.RequestType, responseType);
                }

                return new { r.RequestType, HandlerType = handlerType };
            })
            .Where(r => !handlerServiceTypes.Contains(r.HandlerType))
            .Select(r => GetDisplayName(r.RequestType))
            .OrderBy(name => name)
            .ToArray();

        if (missingRequests.Length == 0)
            return;

        throw new InvalidOperationException(
            "AstraFlow mediator request handler coverage validation failed. Missing handlers: "
            + string.Join(", ", missingRequests));
    }

    private static string GetDisplayName(Type type)
    {
        return type.FullName ?? type.Name;
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

/// <summary>
/// Explicit registration builder for mediator behaviors, processors, exception handlers, and notification options.
/// </summary>
public sealed class AstraFlowMediatorBuilder
{
    internal AstraFlowMediatorBuilder(IServiceCollection services)
    {
        Services = services;
    }

    /// <summary>
    /// Gets the service collection being configured.
    /// </summary>
    public IServiceCollection Services { get; }

    /// <summary>
    /// Adds a closed response pipeline behavior.
    /// </summary>
    public AstraFlowMediatorBuilder AddBehavior<TRequest, TResponse, TBehavior>()
        where TRequest : IRequest<TResponse>
        where TBehavior : class, IPipelineBehavior<TRequest, TResponse>
    {
        Services.AddScoped<IPipelineBehavior<TRequest, TResponse>, TBehavior>();
        return this;
    }

    /// <summary>
    /// Adds an open response pipeline behavior type such as <c>ValidationBehavior&lt;,&gt;</c>.
    /// </summary>
    public AstraFlowMediatorBuilder AddOpenBehavior(Type behaviorType)
    {
        Services.AddScoped(typeof(IPipelineBehavior<,>), behaviorType);
        return this;
    }

    /// <summary>
    /// Adds a closed void request pipeline behavior.
    /// </summary>
    public AstraFlowMediatorBuilder AddVoidBehavior<TRequest, TBehavior>()
        where TRequest : IRequest
        where TBehavior : class, IRequestPipelineBehavior<TRequest>
    {
        Services.AddScoped<IRequestPipelineBehavior<TRequest>, TBehavior>();
        return this;
    }

    /// <summary>
    /// Adds a closed stream pipeline behavior.
    /// </summary>
    public AstraFlowMediatorBuilder AddStreamBehavior<TRequest, TResponse, TBehavior>()
        where TRequest : IStreamRequest<TResponse>
        where TBehavior : class, IStreamPipelineBehavior<TRequest, TResponse>
    {
        Services.AddScoped<IStreamPipelineBehavior<TRequest, TResponse>, TBehavior>();
        return this;
    }

    /// <summary>
    /// Adds an open stream pipeline behavior type such as <c>StreamMetricsBehavior&lt;,&gt;</c>.
    /// </summary>
    public AstraFlowMediatorBuilder AddOpenStreamBehavior(Type behaviorType)
    {
        Services.AddScoped(typeof(IStreamPipelineBehavior<,>), behaviorType);
        return this;
    }

    /// <summary>
    /// Adds a closed request pre-processor.
    /// </summary>
    public AstraFlowMediatorBuilder AddPreProcessor<TRequest, TProcessor>()
        where TRequest : notnull
        where TProcessor : class, IRequestPreProcessor<TRequest>
    {
        Services.AddScoped<IRequestPreProcessor<TRequest>, TProcessor>();
        return this;
    }

    /// <summary>
    /// Adds a closed response request post-processor.
    /// </summary>
    public AstraFlowMediatorBuilder AddPostProcessor<TRequest, TResponse, TProcessor>()
        where TRequest : IRequest<TResponse>
        where TProcessor : class, IRequestPostProcessor<TRequest, TResponse>
    {
        Services.AddScoped<IRequestPostProcessor<TRequest, TResponse>, TProcessor>();
        return this;
    }

    /// <summary>
    /// Adds a closed void request post-processor.
    /// </summary>
    public AstraFlowMediatorBuilder AddVoidPostProcessor<TRequest, TProcessor>()
        where TRequest : IRequest
        where TProcessor : class, IRequestPostProcessor<TRequest>
    {
        Services.AddScoped<IRequestPostProcessor<TRequest>, TProcessor>();
        return this;
    }

    /// <summary>
    /// Adds a closed response request exception action.
    /// </summary>
    public AstraFlowMediatorBuilder AddExceptionAction<TRequest, TResponse, TException, TAction>()
        where TRequest : IRequest<TResponse>
        where TException : Exception
        where TAction : class, IRequestExceptionAction<TRequest, TResponse, TException>
    {
        Services.AddScoped<IRequestExceptionAction<TRequest, TResponse, TException>, TAction>();
        return this;
    }

    /// <summary>
    /// Adds a closed response request exception handler.
    /// </summary>
    public AstraFlowMediatorBuilder AddExceptionHandler<TRequest, TResponse, TException, THandler>()
        where TRequest : IRequest<TResponse>
        where TException : Exception
        where THandler : class, IRequestExceptionHandler<TRequest, TResponse, TException>
    {
        Services.AddScoped<IRequestExceptionHandler<TRequest, TResponse, TException>, THandler>();
        return this;
    }

    /// <summary>
    /// Adds a closed void request exception action.
    /// </summary>
    public AstraFlowMediatorBuilder AddVoidExceptionAction<TRequest, TException, TAction>()
        where TRequest : IRequest
        where TException : Exception
        where TAction : class, IRequestExceptionAction<TRequest, TException>
    {
        Services.AddScoped<IRequestExceptionAction<TRequest, TException>, TAction>();
        return this;
    }

    /// <summary>
    /// Adds a closed void request exception handler.
    /// </summary>
    public AstraFlowMediatorBuilder AddVoidExceptionHandler<TRequest, TException, THandler>()
        where TRequest : IRequest
        where TException : Exception
        where THandler : class, IRequestExceptionHandler<TRequest, TException>
    {
        Services.AddScoped<IRequestExceptionHandler<TRequest, TException>, THandler>();
        return this;
    }
}
