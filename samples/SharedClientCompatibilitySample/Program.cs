using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;
using SharedContractsCompatibilitySample;

var services = new ServiceCollection();
services.AddAstraFlowMediator(typeof(Program));

using var provider = services.BuildServiceProvider();
var sender = provider.GetRequiredService<ISender>();
var publisher = provider.GetRequiredService<IPublisher>();

var result = await sender.Send(new SharedLookup("client"));
await publisher.Publish(new SharedLookupObserved(result.Key));

Console.WriteLine($"{result.Key}:{result.Value}");

public sealed class SharedLookupHandler : IRequestHandler<SharedLookup, SharedLookupResult>
{
    public Task<SharedLookupResult> Handle(SharedLookup request, CancellationToken cancellationToken)
    {
        return Task.FromResult(new SharedLookupResult(request.Key, "from-shared-contract"));
    }
}

public sealed class SharedLookupObservedHandler : INotificationHandler<SharedLookupObserved>
{
    public Task Handle(SharedLookupObserved notification, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
