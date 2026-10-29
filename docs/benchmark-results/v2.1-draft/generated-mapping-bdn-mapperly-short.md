```

BenchmarkDotNet v0.14.0, Windows 11 (10.0.26300.9818)
Unknown processor
.NET SDK 10.0.400
  [Host]   : .NET 10.0.13 (10.0.1326.50504), X64 RyuJIT AVX2
  ShortRun : .NET 10.0.13 (10.0.1326.50504), X64 RyuJIT AVX2

Job=ShortRun  IterationCount=3  LaunchCount=1
WarmupCount=3

```
| Method            | Mean       | Error     | StdDev    | Ratio | RatioSD | Gen0   | Allocated | Alloc Ratio |
|------------------ |-----------:|----------:|----------:|------:|--------:|-------:|----------:|------------:|
| Manual            |   5.641 ns |  2.864 ns | 0.1570 ns |  1.00 |    0.03 | 0.0051 |      32 B |        1.00 |
| Runtime           | 133.820 ns | 42.319 ns | 2.3196 ns | 23.73 |    0.67 | 0.0421 |     264 B |        8.25 |
| Generated         |  11.987 ns |  5.535 ns | 0.3034 ns |  2.13 |    0.07 | 0.0051 |      32 B |        1.00 |
| MapperlyGenerated |  11.645 ns |  5.955 ns | 0.3264 ns |  2.07 |    0.07 | 0.0051 |      32 B |        1.00 |
