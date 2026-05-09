using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace AstraFlow.Mapper;

/// <summary>
/// Runs mapper catalog validation during host startup.
/// This catches ambiguous or incomplete DTO mappings before the first API request reaches a handler.
/// </summary>
public sealed class AstraFlowObjectMappingStartupValidator : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptions<MappingOptions> _options;

    /// <summary>
    /// Creates the hosted startup validator.
    /// </summary>
    /// <param name="scopeFactory">Factory used to resolve scoped mapping rules safely.</param>
    /// <param name="options">Mapper validation options.</param>
    public AstraFlowObjectMappingStartupValidator(
        IServiceScopeFactory scopeFactory,
        IOptions<MappingOptions> options)
    {
        _scopeFactory = scopeFactory;
        _options = options;
    }

    /// <summary>
    /// Validates registered mapper rules when startup validation is enabled.
    /// </summary>
    /// <param name="cancellationToken">Startup cancellation token.</param>
    /// <returns>A completed task after validation finishes.</returns>
    public Task StartAsync(CancellationToken cancellationToken)
    {
        if (!_options.Value.ValidateRuleCatalogOnStartup)
            return Task.CompletedTask;

        using var scope = _scopeFactory.CreateScope();
        var validator = scope.ServiceProvider.GetRequiredService<IObjectMappingValidator>();
        validator.Validate(_options.Value);

        return Task.CompletedTask;
    }

    /// <summary>
    /// Stops the validator. No work is required because validation is startup-only.
    /// </summary>
    /// <param name="cancellationToken">Shutdown cancellation token.</param>
    /// <returns>A completed task.</returns>
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
