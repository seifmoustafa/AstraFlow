```

BenchmarkDotNet v0.14.0, Windows 11 (10.0.26300.9818)
Unknown processor
.NET SDK 10.0.400
  [Host]   : .NET 10.0.13 (10.0.1326.50504), X64 RyuJIT AVX2
  ShortRun : .NET 10.0.13 (10.0.1326.50504), X64 RyuJIT AVX2

Job=ShortRun  IterationCount=3  LaunchCount=1
WarmupCount=3

```
| Method    | Mean      | Error     | StdDev    | Ratio | RatioSD | Gen0   | Allocated | Alloc Ratio |
|---------- |----------:|----------:|----------:|------:|--------:|-------:|----------:|------------:|
| Manual    |  4.808 ns |  3.584 ns | 0.1965 ns |  1.00 |    0.05 | 0.0051 |      32 B |        1.00 |
| Runtime   | 63.849 ns | 16.207 ns | 0.8883 ns | 13.29 |    0.50 | 0.0421 |     264 B |        8.25 |
| Generated |  5.056 ns |  2.774 ns | 0.1521 ns |  1.05 |    0.05 | 0.0051 |      32 B |        1.00 |
