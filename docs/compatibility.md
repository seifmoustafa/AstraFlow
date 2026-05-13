# Compatibility

This guide documents AstraFlow target framework support, compatibility goals, and the audit path for future multi-target releases.

## Current Support

AstraFlow `1.2.1` currently targets:

| Package | Current target |
| --- | --- |
| `AstraFlow` | `net10.0` |
| `AstraFlow.Mediator` | `net10.0` |
| `AstraFlow.Mapper` | `net10.0` |
| `AstraFlow.Diagnostics` | `net10.0` |
| `AstraFlow.Mapper.EntityFrameworkCore` | `net10.0` |

This means consuming applications must be able to reference `net10.0` packages today.

## Compatibility Goal

The roadmap goal is broader package reach without weakening the current explicit-core behavior.

Candidate future targets:

| Package | Candidate targets | Notes |
| --- | --- | --- |
| `AstraFlow.Mediator` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Core mediator contracts and runtime services are good candidates for broad support after API audit fixes. |
| `AstraFlow.Mapper` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Explicit mapping and projection abstractions are good candidates after API audit fixes. |
| `AstraFlow.Diagnostics` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Requires confirming `System.Text.Json` packaging for older targets. |
| `AstraFlow` | intersection of mediator and mapper targets | The meta package should not be broader than its dependencies. |
| `AstraFlow.Mapper.EntityFrameworkCore` | provider/version dependent | EF Core target support depends on EF Core package versions and should be validated separately. |

Direct .NET Framework targets such as `net462` or `net471` are candidates only after testing proves they add value beyond `netstandard2.0` consumption.

## Compatibility Audit Findings

The current codebase has known items to resolve before true multi-targeting:

| Area | Finding | Impact |
| --- | --- | --- |
| Project targets | Source, tests, and samples currently use `net10.0`. | Multi-targeting requires project file changes and CI matrix updates. |
| Guard APIs | Code uses `ArgumentNullException.ThrowIfNull` and `ArgumentException.ThrowIfNullOrWhiteSpace`. | Older target reference assemblies may require conditional helpers or direct guard code. |
| Diagnostics JSON | Diagnostics uses `System.Text.Json`. | Older targets may need explicit package references and dependency review. |
| EF Core package | EF validation package references EF Core `10.0.2`. | Older runtime targets may require conditional EF Core package versions or narrower support. |
| Samples/tests | Samples and tests target `net10.0`. | Compatibility claims need target-specific test coverage. |

## Release Rules For Target Expansion

Do not add a target framework to package metadata until all of these are true:

- the package builds for that target,
- relevant tests pass for that target,
- dependencies support that target,
- a clean sample app can install and run the package,
- package contents show the expected `lib/<tfm>/` assets,
- docs list the target accurately,
- CI blocks regressions for the target.

## Consumer Guidance

Use AstraFlow `1.2.1` today when your application can consume `net10.0`.

If your application targets `net8.0`, `net9.0`, .NET Framework, or a `netstandard2.0` shared library, wait for a future compatibility release that explicitly lists those targets.

Do not rely on roadmap candidate targets as published package support.

## EF Core Guidance

`AstraFlow.Mapper.EntityFrameworkCore` is intentionally separate from `AstraFlow.Mapper`.

Use it only in projects that need EF Core projection translation checks. The core mapper package does not require EF Core.

Future EF Core target expansion must account for EF Core major-version compatibility. It should not silently pin applications to an incompatible EF Core version.

## Verification Commands

Current release verification:

```powershell
dotnet build AstraFlow.slnx -c Release
dotnet test AstraFlow.slnx -c Release
.\scripts\pack.ps1
```

Future multi-target verification should add target-specific build and test commands once the targets are implemented.

