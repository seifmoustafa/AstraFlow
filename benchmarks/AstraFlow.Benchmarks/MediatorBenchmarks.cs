using BenchmarkDotNet.Attributes;
using Microsoft.Extensions.DependencyInjection;
using AstraFlow.Mediator;

namespace AstraFlow.Benchmarks;

[MemoryDiagnoser]
[GroupBenchmarksBy(BenchmarkDotNet.Configs.BenchmarkLogicalGroupRule.ByCategory)]
[CategoriesColumn]
public class MediatorBenchmarks
{
    private static readonly BenchmarkRequest Request = new("benchmark");
    private static readonly BenchmarkNotification Notification = new("benchmark");

    private ServiceProvider? _provider;
    private ISender? _sender;
    private IPublisher? _publisher;
    private BenchmarkRequestHandler? _handler;

    [Params(0, 1, 5, 10)]
    public int PipelineDepth { get; set; }

    [Params(1, 5, 25, 100)]
    public int FanOut { get; set; }

    [GlobalSetup]
    public void Setup()
    {
        _provider?.Dispose();
        _provider = CreateServiceProvider(PipelineDepth, FanOut);
        _sender = _provider.GetRequiredService<ISender>();
        _publisher = _provider.GetRequiredService<IPublisher>();
        _handler = new BenchmarkRequestHandler();
    }

    [GlobalCleanup]
    public void Cleanup()
    {
        _provider?.Dispose();
    }

    [Benchmark(Baseline = true)]
    [BenchmarkCategory("request")]
    public Task<string> DirectHandlerInvocation()
    {
        return _handler!.Handle(Request, CancellationToken.None);
    }

    [Benchmark]
    [BenchmarkCategory("request")]
    public async Task<string> FirstRequestDispatch()
    {
        await using var provider = CreateServiceProvider(PipelineDepth, fanOut: 1);
        var sender = provider.GetRequiredService<ISender>();
        return await sender.Send(Request);
    }

    [Benchmark]
    [BenchmarkCategory("request")]
    public Task<string> CachedRequestDispatch()
    {
        return _sender!.Send(Request);
    }

    [Benchmark]
    [BenchmarkCategory("registration")]
    public ServiceProvider ServiceRegistration()
    {
        return CreateServiceProvider(PipelineDepth, FanOut);
    }

    [Benchmark]
    [BenchmarkCategory("registration")]
    public ServiceProvider ColdStart()
    {
        var provider = CreateServiceProvider(PipelineDepth, FanOut);
        _ = provider.GetRequiredService<ISender>();
        return provider;
    }

    [Benchmark(Baseline = true)]
    [BenchmarkCategory("notification")]
    public Task ManualNotificationFanOutBaseline()
    {
        var handlers = Enumerable.Range(0, FanOut).Select(static _ => new NoOpNotificationHandler()).ToArray();
        foreach (var handler in handlers)
            handler.Handle(Notification, CancellationToken.None).GetAwaiter().GetResult();

        return Task.CompletedTask;
    }

    [Benchmark]
    [BenchmarkCategory("notification")]
    public Task NotificationFanOut()
    {
        return _publisher!.Publish(Notification);
    }

    private static ServiceProvider CreateServiceProvider(int pipelineDepth, int fanOut)
    {
        var services = new ServiceCollection();
        services.AddAstraFlowMediator(typeof(MediatorBenchmarks));

        for (var i = 0; i < pipelineDepth; i++)
            services.AddScoped<IPipelineBehavior<BenchmarkRequest, string>, PassThroughBehavior>();

        for (var i = 1; i < fanOut; i++)
            services.AddScoped<INotificationHandler<BenchmarkNotification>, NoOpNotificationHandler>();

        return services.BuildServiceProvider();
    }
}
