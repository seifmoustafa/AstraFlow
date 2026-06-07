using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddAstraFlowMediator(typeof(Program));
builder.Services.AddHostedService<Worker>();

using var host = builder.Build();
var sender = host.Services.GetRequiredService<ISender>();

var response = await sender.Send(new WorkerPing("worker"));
Console.WriteLine(response);

public sealed record WorkerPing(string Name) : IRequest<string>;

public sealed class WorkerPingHandler : IRequestHandler<WorkerPing, string>
{
    public Task<string> Handle(WorkerPing request, CancellationToken cancellationToken)
    {
        return Task.FromResult($"handled:{request.Name}");
    }
}

public sealed class Worker(ISender sender) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await sender.Send(new WorkerPing("background-service"), stoppingToken).ConfigureAwait(false);
    }
}
