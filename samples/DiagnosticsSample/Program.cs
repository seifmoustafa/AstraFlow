using AstraFlow.Diagnostics;
using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddAstraFlowMediator(typeof(Program));
services.AddAstraFlowDiagnostics(options =>
{
    options.AssemblyMarkerTypes.Add(typeof(Program));
});

using var provider = services.BuildServiceProvider();
var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();

Console.WriteLine(reporter.CreateMarkdownReport());

public sealed record CreateOrderCommand(string Number) : IRequest<Guid>;

public sealed class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    public Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        return Task.FromResult(Guid.NewGuid());
    }
}
