using System.Linq.Expressions;
using AstraFlow.Mapper;
using BenchmarkDotNet.Attributes;
using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Benchmarks;

[MemoryDiagnoser]
public class ProjectionBenchmarks
{
    private IProjectionRegistry _registry = default!;
    private ServiceProvider? _provider;
    private static readonly Expression<Func<BenchmarkCustomer, BenchmarkCustomerDto>> ManualProjection =
        customer => new BenchmarkCustomerDto(customer.Id, customer.Name, customer.Email, customer.Orders);

    [GlobalSetup]
    public void Setup()
    {
        var services = new ServiceCollection();
        services.AddAstraFlowMapper(typeof(ProjectionBenchmarks));
        _provider?.Dispose();
        _provider = services.BuildServiceProvider();
        _registry = _provider.GetRequiredService<IProjectionRegistry>();
    }

    [GlobalCleanup]
    public void Cleanup()
    {
        _provider?.Dispose();
    }

    [Benchmark(Baseline = true)]
    public Expression<Func<BenchmarkCustomer, BenchmarkCustomerDto>> ManualProjectionExpression()
    {
        return ManualProjection;
    }

    [Benchmark]
    public IProjection<BenchmarkCustomer, BenchmarkCustomerDto> ProjectionRegistryLookup()
    {
        return _registry.Get<BenchmarkCustomer, BenchmarkCustomerDto>();
    }
}
