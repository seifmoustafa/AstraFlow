using AstraFlow.Mapper;
using BenchmarkDotNet.Attributes;
using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Benchmarks;

/// <summary>Compares equivalent direct and facade calls for the generated mapper's supported scalar subset.</summary>
[MemoryDiagnoser]
public class GeneratedMappingBenchmarks
{
    private readonly GeneratedBenchmarkSource source = new() { Name = "Ada", Count = 42 };
    private ServiceProvider provider = null!;
    private IServiceScope scope = null!;
    private IMapper mapper = null!;

    [GlobalSetup]
    public void Setup()
    {
        var services = new ServiceCollection();
        services.AddAstraFlowMapper(Array.Empty<Type>());
        services.AddScoped<IObjectMappingRule, GeneratedBenchmarkRule>();
        provider = services.BuildServiceProvider(validateScopes: true);
        scope = provider.CreateScope();
        mapper = scope.ServiceProvider.GetRequiredService<IMapper>();
        var expected = Manual();
        var runtime = Runtime();
        var generated = Generated();
        if (expected.Name != runtime.Name || expected.Count != runtime.Count ||
            expected.Name != generated.Name || expected.Count != generated.Count)
            throw new InvalidOperationException("Mapping benchmark workloads are not equivalent.");
    }

    [GlobalCleanup]
    public void Cleanup()
    {
        scope.Dispose();
        provider.Dispose();
    }

    [Benchmark(Baseline = true)]
    public GeneratedBenchmarkDestination Manual() => MapByHand(source);

    [Benchmark]
    public GeneratedBenchmarkDestination Runtime() => mapper.Map<GeneratedBenchmarkDestination>(source);

    [Benchmark]
    public GeneratedBenchmarkDestination Generated() => GeneratedBenchmarkMaps.Map(source);

    internal static GeneratedBenchmarkDestination MapByHand(GeneratedBenchmarkSource value) =>
        new() { Name = value.Name, Count = value.Count };
}

/// <summary>Source object for the equivalent mapping workload.</summary>
public sealed class GeneratedBenchmarkSource
{
    /// <summary>Sample name.</summary>
    public string Name { get; set; } = "";
    /// <summary>Sample count.</summary>
    public int Count { get; set; }
}

/// <summary>Destination object for the equivalent mapping workload.</summary>
public sealed class GeneratedBenchmarkDestination
{
    /// <summary>Sample name.</summary>
    public string Name { get; set; } = "";
    /// <summary>Sample count.</summary>
    public int Count { get; set; }
}

/// <summary>Explicit runtime mapping rule used in the benchmark.</summary>
public sealed class GeneratedBenchmarkRule : IObjectMappingRule
{
    /// <inheritdoc />
    public bool CanMap(Type sourceType, Type destinationType) =>
        sourceType == typeof(GeneratedBenchmarkSource) && destinationType == typeof(GeneratedBenchmarkDestination);

    /// <inheritdoc />
    public object? Map(object? source, Type destinationType, IMapper mapper) =>
        source is null ? null : GeneratedMappingBenchmarks.MapByHand((GeneratedBenchmarkSource)source);
}

/// <summary>Direct generated mapping used in the benchmark.</summary>
public static partial class GeneratedBenchmarkMaps
{
    /// <summary>Creates a new mapped destination.</summary>
    [AstraGenerateMapping]
    public static partial GeneratedBenchmarkDestination Map(GeneratedBenchmarkSource source);
}
