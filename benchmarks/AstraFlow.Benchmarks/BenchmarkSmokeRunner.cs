namespace AstraFlow.Benchmarks;

internal static class BenchmarkSmokeRunner
{
    public static void Run()
    {
        Console.WriteLine("AstraFlow benchmark smoke run");
        Measure("mediator.direct", () =>
        {
            var benchmark = new MediatorBenchmarks { PipelineDepth = 1, FanOut = 5 };
            benchmark.Setup();
            return benchmark.DirectHandlerInvocation().GetAwaiter().GetResult().Length;
        });
        Measure("mediator.cached", () =>
        {
            var benchmark = new MediatorBenchmarks { PipelineDepth = 1, FanOut = 5 };
            benchmark.Setup();
            return benchmark.CachedRequestDispatch().GetAwaiter().GetResult().Length;
        });
        Measure("mediator.notificationFanOut", () =>
        {
            var benchmark = new MediatorBenchmarks { PipelineDepth = 1, FanOut = 5 };
            benchmark.Setup();
            benchmark.NotificationFanOut().GetAwaiter().GetResult();
            return 5;
        });
        Measure("mapper.single", () =>
        {
            var benchmark = new MapperBenchmarks { CollectionSize = 100 };
            benchmark.Setup();
            return benchmark.AstraFlowSingleObjectMapping().Id.GetHashCode();
        });
        Measure("mapper.collection", () =>
        {
            var benchmark = new MapperBenchmarks { CollectionSize = 100 };
            benchmark.Setup();
            return benchmark.AstraFlowCollectionMapping().Count;
        });
        Measure("projection.lookup", () =>
        {
            var benchmark = new ProjectionBenchmarks();
            benchmark.Setup();
            return benchmark.ProjectionRegistryLookup().Expression.Body.NodeType.GetHashCode();
        });
        Measure("generator.metadata", () =>
        {
            var benchmark = new GeneratedMetadataBenchmarks();
            return benchmark.GeneratedMapperMetadataLookup().MappingRules.Count;
        });
    }

    private static void Measure(string name, Func<int> action)
    {
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();

        var before = GC.GetAllocatedBytesForCurrentThread();
        var result = action();
        var allocated = GC.GetAllocatedBytesForCurrentThread() - before;

        Console.WriteLine($"{name}: result={result}; allocatedBytes={allocated}");
    }
}
