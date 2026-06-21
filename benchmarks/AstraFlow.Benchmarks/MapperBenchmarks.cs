using AstraFlow.Mapper;
using BenchmarkDotNet.Attributes;
using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Benchmarks;

[MemoryDiagnoser]
[GroupBenchmarksBy(BenchmarkDotNet.Configs.BenchmarkLogicalGroupRule.ByCategory)]
[CategoriesColumn]
public class MapperBenchmarks
{
    private BenchmarkCustomer _customer = default!;
    private BenchmarkCustomer[] _customers = [];
    private IMapper _mapper = default!;
    private ServiceProvider? _provider;

    [Params(100, 1_000, 100_000)]
    public int CollectionSize { get; set; }

    [GlobalSetup]
    public void Setup()
    {
        _customer = new BenchmarkCustomer(Guid.Parse("11111111-1111-1111-1111-111111111111"), "Ada", "ada@example.test", 42);
        _customers = Enumerable.Range(0, CollectionSize)
            .Select(index => new BenchmarkCustomer(
                Guid.Parse("11111111-1111-1111-1111-111111111111"),
                "Customer " + index,
                $"customer{index}@example.test",
                index))
            .ToArray();

        var services = new ServiceCollection();
        services.AddAstraFlowMapper(typeof(MapperBenchmarks));
        _provider?.Dispose();
        _provider = services.BuildServiceProvider();
        _mapper = _provider.GetRequiredService<IMapper>();
    }

    [GlobalCleanup]
    public void Cleanup()
    {
        _provider?.Dispose();
    }

    [Benchmark(Baseline = true)]
    [BenchmarkCategory("single-object")]
    public BenchmarkCustomerDto ManualSingleObjectMapping()
    {
        return ManualMapping.Map(_customer);
    }

    [Benchmark]
    [BenchmarkCategory("single-object")]
    public BenchmarkCustomerDto AstraFlowSingleObjectMapping()
    {
        return _mapper.Map<BenchmarkCustomerDto>(_customer);
    }

    [Benchmark(Baseline = true)]
    [BenchmarkCategory("collection")]
    public IReadOnlyList<BenchmarkCustomerDto> ManualCollectionMapping()
    {
        return _customers.Select(ManualMapping.Map).ToArray();
    }

    [Benchmark]
    [BenchmarkCategory("collection")]
    public IReadOnlyList<BenchmarkCustomerDto> AstraFlowCollectionMapping()
    {
        return _mapper.Map<IReadOnlyList<BenchmarkCustomerDto>>(_customers);
    }
}
