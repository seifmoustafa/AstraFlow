```

BenchmarkDotNet v0.14.0, Windows 11 (10.0.26300.9818)
Unknown processor
.NET SDK 10.0.400
  [Host]     : .NET 10.0.13 (10.0.1326.50504), X64 RyuJIT AVX2
  Job-VBFSGS : .NET 10.0.13 (10.0.1326.50504), X64 RyuJIT AVX2

IterationCount=1  LaunchCount=10  RunStrategy=ColdStart
WarmupCount=0

```
| Method                      | Mean       | Error    | StdDev   | Ratio | RatioSD | Allocated | Alloc Ratio |
|---------------------------- |-----------:|---------:|---------:|------:|--------:|----------:|------------:|
| ManualFirstCall             |   746.6 μs | 296.4 μs | 196.0 μs |  1.07 |    0.40 |         - |          NA |
| AstraFlowGeneratedFirstCall |   691.4 μs | 275.3 μs | 182.1 μs |  0.99 |    0.37 |         - |          NA |
| MapperlyFirstCall           |   530.9 μs | 209.0 μs | 138.2 μs |  0.76 |    0.28 |         - |          NA |
| RuntimeMapperFirstCall      | 1,708.2 μs | 417.5 μs | 276.2 μs |  2.45 |    0.76 |         - |          NA |
