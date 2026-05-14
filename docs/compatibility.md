# Compatibility

This guide documents AstraFlow target framework support, compatibility goals, and the rules for future target expansion.

## Current Support

AstraFlow `1.2.2` currently targets:

| Package | Current targets |
| --- | --- |
| `AstraFlow` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Mediator` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Mapper` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Diagnostics` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Mapper.EntityFrameworkCore` | `net10.0` |

This means applications and shared libraries on `net8.0`, `net9.0`, `net10.0`, and compatible `netstandard2.0` consumers can reference the core packages. EF Core projection translation validation still requires a `net10.0` project.

## Compatibility Goal

The roadmap goal is broader package reach without weakening the current explicit-core behavior.

Current target policy:

| Package | Policy | Notes |
| --- | --- | --- |
| Core packages | Keep `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` while tests and dependencies remain healthy. | Core means mediator, mapper, diagnostics, and meta package. |
| EF Core package | Keep target support aligned with the referenced EF Core major version. | Do not broaden EF support by silently pinning consumers to an incompatible EF Core line. |
| Future contracts package | Prefer the broadest practical target set. | Shared contracts should be easy to use from clients and modular boundaries. |

Direct .NET Framework targets such as `net462` or `net471` are candidates only after testing proves they add value beyond `netstandard2.0` consumption.

## Compatibility Audit Findings

The `1.2.1` audit found these items. `1.2.2` resolved the core package blockers and left EF Core target expansion separate:

| Area | Finding | Impact |
| --- | --- | --- |
| Project targets | Core packages now multi-target. | Done for `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`. |
| Guard APIs | Newer guard helpers were replaced in core code. | Done for supported core targets. |
| Diagnostics JSON | `System.Text.Json` is added for the `netstandard2.0` diagnostics asset. | Done. |
| EF Core package | EF validation package references EF Core `10.0.2`. | Still `net10.0`; broader EF Core support needs a separate versioning design. |
| Samples/tests | Samples and tests target `net10.0`. | Clean-install smoke tests should cover every shipped package target before release promotion. |

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

Use AstraFlow `1.2.2` core packages from `net8.0`, `net9.0`, `net10.0`, or compatible `netstandard2.0` consumers.

Use `AstraFlow.Mapper.EntityFrameworkCore` only from `net10.0` projects in this release.

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

For `1.2.2`, inspect the `.nupkg` files and confirm the core packages include `lib/netstandard2.0/`, `lib/net8.0/`, `lib/net9.0/`, and `lib/net10.0/`. Confirm `AstraFlow.Mapper.EntityFrameworkCore` includes only `lib/net10.0/`.

