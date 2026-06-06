using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.FluentValidation;

/// <summary>
/// Registers FluentValidation pipeline behaviors for AstraFlow mediator requests.
/// </summary>
public static class AstraFlowFluentValidationRegistration
{
    /// <summary>
    /// Adds open validation behaviors for response and void AstraFlow requests.
    /// Validators should be registered separately as <c>IValidator&lt;TRequest&gt;</c>.
    /// </summary>
    public static IServiceCollection AddAstraFlowFluentValidation(
        this IServiceCollection services,
        Action<AstraFlowValidationOptions>? configure = null)
    {
        if (services is null)
            throw new ArgumentNullException(nameof(services));

        services.AddOptions<AstraFlowValidationOptions>();
        if (configure is not null)
            services.Configure(configure);

        services.AddScoped(typeof(IPipelineBehavior<,>), typeof(AstraFlowValidationBehavior<,>));
        services.AddScoped(typeof(IRequestPipelineBehavior<>), typeof(AstraFlowVoidValidationBehavior<>));
        return services;
    }
}
