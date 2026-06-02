using AstraFlow.Mapper;
using BenchmarkDotNet.Attributes;
using Microsoft.Extensions.DependencyInjection;

namespace AstraFlow.Benchmarks;

[MemoryDiagnoser]
public class GeneratedMetadataBenchmarks
{
    [Benchmark(Baseline = true)]
    public GeneratedMapperMetadata DirectStaticMetadataBaseline()
    {
        return AstraFlowGeneratedMapperMetadataRegistration.GetAstraFlowGeneratedMapperMetadata();
    }

    [Benchmark]
    public GeneratedMapperMetadata GeneratedMapperMetadataLookup()
    {
        var services = new ServiceCollection();
        services.AddAstraFlowGeneratedMapperMetadata();
        using var provider = services.BuildServiceProvider();

        return provider
            .GetRequiredService<IGeneratedMapperMetadataProvider>()
            .GetMetadata();
    }
}
