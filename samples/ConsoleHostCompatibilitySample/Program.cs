using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddAstraFlowMediator(typeof(Program));

using var provider = services.BuildServiceProvider();
var sender = provider.GetRequiredService<ISender>();

var response = await sender.Send(new ConsolePing("console"));
Console.WriteLine(response);

public sealed record ConsolePing(string Name) : IRequest<string>;

public sealed class ConsolePingHandler : IRequestHandler<ConsolePing, string>
{
    public Task<string> Handle(ConsolePing request, CancellationToken cancellationToken)
    {
        return Task.FromResult($"handled:{request.Name}");
    }
}
