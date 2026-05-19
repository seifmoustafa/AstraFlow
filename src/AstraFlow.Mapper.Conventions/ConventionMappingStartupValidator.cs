using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace AstraFlow.Mapper.Conventions;

internal sealed class ConventionMappingStartupValidator : IHostedService
{
    private readonly ConventionMappingPlanProvider _planProvider;
    private readonly ConventionMappingOptions _options;

    public ConventionMappingStartupValidator(
        ConventionMappingPlanProvider planProvider,
        IOptions<ConventionMappingOptions> options)
    {
        _planProvider = planProvider;
        _options = options.Value;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        foreach (var plan in _planProvider.GetMappingPlans())
        {
            ConventionMappingPlanBuilder.ThrowIfInvalid(plan, _options);
        }

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
