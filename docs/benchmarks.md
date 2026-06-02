# AstraFlow Benchmarks

AstraFlow `1.9.0` introduces a benchmark project so performance work starts from repeatable evidence instead of release-note claims.

## Run Locally

Use the smoke mode before publishing or after changing benchmark code:

```powershell
.\scripts\run-benchmarks.ps1 -Smoke
```

Run the full BenchmarkDotNet suite when you need numbers:

```powershell
.\scripts\run-benchmarks.ps1 -BenchmarkArgs @("--filter", "*")
```

You can also run the project directly:

```powershell
dotnet run --project benchmarks\AstraFlow.Benchmarks\AstraFlow.Benchmarks.csproj --configuration Release -- --smoke
```

## Methodology

- Run benchmarks in `Release`.
- Close unrelated CPU-heavy processes before recording baseline numbers.
- Record the exact Git commit, SDK version, runtime version, OS, CPU, memory, and power profile.
- Keep BenchmarkDotNet artifacts with the release evidence when numbers influence a roadmap or release note.
- Compare AstraFlow methods against the manual baseline in the same benchmark group.
- Treat the smoke run as a compile and allocation-capture check only, not as a performance result.

## Benchmark Groups

The `AstraFlow.Benchmarks` project covers:

- mediator cold start and service registration,
- first request dispatch and cached request dispatch,
- direct handler invocation baseline,
- pipeline depths `0`, `1`, `5`, and `10`,
- notification fan-out counts `1`, `5`, `25`, and `100`,
- single object mapping,
- collection mapping for `100`, `1,000`, and `100,000` items,
- projection registry lookup,
- generated mapper/projection metadata lookup,
- allocation measurements through BenchmarkDotNet `MemoryDiagnoser` and smoke-run allocation capture.

## Environment Template

Copy this block into release notes, GitHub releases, or benchmark evidence files:

```text
Benchmark date:
Git commit:
Command:
.NET SDK:
.NET runtime:
OS:
CPU:
Memory:
Power profile:
BenchmarkDotNet version:
Artifacts path:
Notes:
```

## Claim Policy

AstraFlow release notes must not make speed claims until repeatable numbers exist. A valid claim needs:

- a committed benchmark scenario,
- a manual baseline in the same benchmark group,
- at least two comparable local runs,
- the environment template filled out,
- allocation data included when allocation changes are part of the claim,
- the raw BenchmarkDotNet artifacts kept with release evidence.

Prefer neutral wording such as "adds benchmark coverage for cached request dispatch" until the evidence is ready. Do not use phrases like "faster", "zero allocation", or "optimized" unless the benchmark artifacts support them.
