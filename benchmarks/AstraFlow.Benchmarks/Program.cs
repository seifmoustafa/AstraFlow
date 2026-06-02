using AstraFlow.Benchmarks;
using BenchmarkDotNet.Running;

if (args.Any(static arg => string.Equals(arg, "--smoke", StringComparison.OrdinalIgnoreCase)))
{
    BenchmarkSmokeRunner.Run();
    return;
}

BenchmarkSwitcher.FromAssembly(typeof(Program).Assembly).Run(args);
