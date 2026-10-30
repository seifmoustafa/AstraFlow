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

## v2.1 draft: executable generated mapping

`GeneratedMappingBenchmarks` compares equivalent two-property mapping calls over the same non-null input: handwritten construction, an explicitly registered runtime `IMapper` rule, the generated typed method, and Mapperly 4.3.1. Setup checks that all four produce the same values. Mapperly is a benchmark-only, private dependency; it is not added to AstraFlow runtime or generator packages. This does not compare null behavior or interface dispatch parity for the generated method; the generated path deliberately has its own direct typed call contract.

The final-source BenchmarkDotNet short run used 3 warmups and 3 measured iterations on Windows 11 10.0.26300.9818, SDK 10.0.400, .NET 10.0.13 x64 AVX2, BenchmarkDotNet 0.14.0. It measured Manual 5.641 ns / 32 B, AstraFlow Runtime 133.820 ns / 264 B, AstraFlow Generated 11.987 ns / 32 B, and MapperlyGenerated 11.645 ns / 32 B. The 99.9% confidence intervals are broad (respectively ±2.864, ±42.319, ±5.535 and ±5.955 ns); the direct-call means are too close to the uncertainty to support a speed ranking. Ten cold process launches measured the first mapping invocation after setup at 746.6 μs manual, 691.4 μs AstraFlow generated, 530.9 μs Mapperly, and 1,708.2 μs runtime mapper. These measurements have broad 99.9% intervals, and BenchmarkDotNet warned that each sub-2 ms iteration is below its recommended 100 ms minimum. They are exploratory startup/JIT observations, not reliable comparative cold-start proof. The [warm raw CSV](benchmark-results/v2.1-draft/generated-mapping-bdn-mapperly-short.csv), [warm BenchmarkDotNet summary](benchmark-results/v2.1-draft/generated-mapping-bdn-mapperly-short.md), [cold raw CSV](benchmark-results/v2.1-draft/generated-mapping-first-call-cold.csv), [cold summary](benchmark-results/v2.1-draft/generated-mapping-first-call-cold.md), and [full release evidence](decisions/v2.1-draft-evidence.md) retain results and limitations.

The synthetic [map-scale experiment](benchmark-results/v2.1-draft/map-scale-experiment.ps1) records three-run Release rebuild, no-op incremental build, and one-declaration-edit build times for 25, 100, and 400 simple pairs. The [raw output](benchmark-results/v2.1-draft/map-scale-incremental-results-final.log) and release evidence report the samples. These are end-to-end wall times that include process startup, compiler time, and all generators; they are not an isolated generator profile or a general scaling claim.

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


## Future competitive benchmarking: decision-quality evidence

The existing benchmark groups are the **baseline harness**, not a proof that any variant outperforms established packages. For the proposed generated mapping and mediator tracks, expand the harness *only after code supports the exact scenario*. Document any unfair or unavailable comparison instead of manufacturing parity.

### Mapper comparison matrix (proposed)

| Workload | Baselines | Important controls |
| --- | --- | --- |
| Simple DTO | Manual; existing AstraFlow explicit; optional conventions; generated typed; peer libraries | Same members/nullability and compile target |
| Record/immutable DTO | Only libraries that implement the same construction semantics | Equivalent constructors, required-member behavior |
| Collections | Handwritten and supported generated/runtime routes | Same count, allocation profile, no different object graphs |
| Cold start | First mapping including necessary configuration | Setup cost separated from warmed calls |
| Runtime `IMapper` adapter | Runtime and generated adapter only if implemented | Same dispatch API, separate from direct typed call |
| EF projection | Only provider-comparable query shapes | Validate SQL/provider behavior, no query execution in validation |

Possible comparison libraries include AutoMapper, Mapster and Mapperly, with exact package versions and selected API modes recorded.

### Mediator comparison matrix (proposed)

Compare direct handler invocation, current AstraFlow request dispatch, and generated dispatch **if it exists**. Keep handler work, behavior count, exception policy, DI lifetime and cancellation semantics equal. Measure first call, warmed call, 0/1/5/10 behaviors, allocations and registration cost. Competing mediator results are informative only if semantics and configuration match.

### Reproducibility rules

- Fix commit SHA, package versions, SDK/runtime/compiler, OS, CPU, GC and Release configuration.
- Capture raw BenchmarkDotNet reports, repeated-run variance and output paths.
- Separately record clean build time, incremental build time after a relevant source edit, generated source bytes and executable/package size.
- Report workloads where generated execution **loses**, or where building is slower even if dispatch is faster.
- AOT claims require publishing **and executing** a clean consumer and reviewing trimming warnings.
- No blanket “fastest”, “zero allocation”, or “fully AOT” claims from a favorable single benchmark.

The [evidence policy](strategy/evidence-and-gates.md) is the release/claims gate. The [v2.1 plan](plans/v2.1-generated-mapping.md) defines first proposed comparison scenarios.
