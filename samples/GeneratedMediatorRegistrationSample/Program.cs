using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddAstraFlowMediator();
services.AddAstraFlowGeneratedMediatorRegistrations();

using var provider = services.BuildServiceProvider();
var sender = provider.GetRequiredService<ISender>();

var result = await sender.Send(new GeneratedPing("hello"));
Console.WriteLine(result);

public sealed record GeneratedPing(string Value) : IRequest<string>;

public sealed class GeneratedPingHandler : IRequestHandler<GeneratedPing, string>
{
    public Task<string> Handle(GeneratedPing request, CancellationToken cancellationToken)
    {
        return Task.FromResult($"generated:{request.Value}");
    }
}
