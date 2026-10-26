# Compatibility

This guide documents AstraFlow target framework support, compatibility goals, and the rules for future target expansion.

## Current Support

AstraFlow `1.13.1` currently targets:

| Package | Current targets |
| --- | --- |
| `AstraFlow` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Contracts` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Mediator` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Mapper` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Mapper.Conventions` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Diagnostics` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Testing` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Mapper.EntityFrameworkCore` | `net10.0` |
| `AstraFlow.AspNetCore` | `net10.0` |
| `AstraFlow.FluentValidation` | `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.OpenTelemetry` | `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Analyzers` | Roslyn analyzer assets under `analyzers/dotnet/cs` |
| `AstraFlow.Generators` | Roslyn source generator assets under `analyzers/dotnet/cs` |

This means applications, shared libraries, contracts projects, and test projects on `net8.0`, `net9.0`, `net10.0`, and compatible `netstandard2.0` consumers can reference the contracts package, core packages, `AstraFlow.Mapper.Conventions`, and `AstraFlow.Testing`. EF Core projection translation validation and ASP.NET Core helpers require a `net10.0` project. FluentValidation and OpenTelemetry integration packages support `net8.0`, `net9.0`, and `net10.0`. Analyzer and generator assets are consumed by the compiler rather than referenced as runtime libraries.

## Compatibility Goal

The roadmap goal is broader package reach without weakening the current explicit-core behavior.

Current target policy:

| Package | Policy | Notes |
| --- | --- | --- |
| Contracts, core, conventions, and testing packages | Keep `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` while tests and dependencies remain healthy. | Core means mediator, mapper, conventions, diagnostics, testing, and meta package. |
| EF Core package | Keep target support aligned with the referenced EF Core major version. | Do not broaden EF support by silently pinning consumers to an incompatible EF Core line. |
| ASP.NET Core package | Keep target support aligned with the referenced ASP.NET Core major version. | Do not broaden ASP.NET Core support by silently pinning consumers to an incompatible framework line. |
| FluentValidation and OpenTelemetry packages | Keep `net8.0`, `net9.0`, and `net10.0` while dependencies remain healthy. | Integration dependencies stay out of core packages. |
| Analyzer package | Ship compiler analyzer assets under `analyzers/dotnet/cs`. | Do not add runtime `lib/` assets unless the package gains a separate runtime API. |

Direct .NET Framework targets such as `net462` or `net471` are candidates only after testing proves they add value beyond `netstandard2.0` consumption.

## Consumer Confidence Gates

`1.13.1` keeps the two compatibility gates introduced in `1.13.0` and adds sample-build coverage:

- `scripts/verify-api-compatibility.ps1` compares public XML documentation member IDs from the previous published package version to the current packed packages.
- `scripts/verify-upgrade-smoke.ps1` creates a clean consumer, builds it against the previous package version, upgrades it to the current locally packed version, and runs the same smoke flow again.
- `scripts/verify-sample-builds.ps1` builds every sample project, including host compatibility and migration cookbook samples.

These checks are intentionally conservative. They do not replace human review, but they make accidental public API removals and basic upgrade failures visible before publishing.

## Host Compatibility Samples

`1.13.1` includes compile-checked samples for the consumer shapes named in the roadmap:

| Consumer shape | Sample |
| --- | --- |
| Console host | `samples/ConsoleHostCompatibilitySample` |
| Worker-style host | `samples/WorkerHostCompatibilitySample` |
| ASP.NET Core host | `samples/AspNetCoreSample` |
| Class library | `samples/ClassLibraryCompatibilitySample` |
| Test project | `samples/TestProjectCompatibilitySample` |
| Shared contracts project | `samples/SharedContractsCompatibilitySample` |
| Shared client project | `samples/SharedClientCompatibilitySample` |

The integration test suite also validates the combined `AddAstraFlow(...)` registration path through a scoped Microsoft.Extensions.DependencyInjection consumer. Third-party container adapters remain candidate work until a specific container compatibility matrix is selected.

## Version Support Policy

AstraFlow supports the latest published minor version for normal package adoption, documentation, and release verification.

Patch releases should be applied within the same minor line when they are available. Minor releases should preserve source compatibility unless a breaking change is explicitly documented and moved to a major version.

Older minor versions remain installable from NuGet, but active validation, upgrade smoke testing, and API compatibility comparison focus on the previous stable published version and the current release candidate.

Security fixes should be released on the latest stable line first. Backporting to older minor lines is discretionary and depends on severity, compatibility risk, and maintainer capacity.

## Compatibility Audit Findings

The `1.2.1` audit found these items. `1.2.2` resolved the core package blockers, `1.2.3` added automated clean-install verification, `1.3.0` extended the matrix to `AstraFlow.Testing`, and `1.4.0` extends it to `AstraFlow.Contracts`.

| Area | Finding | Impact |
| --- | --- | --- |
| Project targets | Core packages now multi-target. | Done for `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`. |
| Guard APIs | Newer guard helpers were replaced in core code. | Done for supported core targets. |
| Diagnostics JSON | `System.Text.Json` is added for the `netstandard2.0` diagnostics asset. | Done. |
| EF Core package | EF validation package references EF Core `10.0.2`. | Still `net10.0`; broader EF Core support needs a separate versioning design. |
| Analyzer package | Analyzer assets ship separately from runtime libraries. | Done through `AstraFlow.Analyzers` package assets under `analyzers/dotnet/cs`. |
| Generator package | Source generator assets ship separately from runtime libraries. | Done in `1.8.4` through `AstraFlow.Generators` package assets under `analyzers/dotnet/cs`. |
| Clean install checks | `scripts/verify-package-install.ps1` installs packed packages into external consumer projects. | Done for `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` package combinations, including `AstraFlow.Testing`, `AstraFlow.Analyzers`, and `AstraFlow.Generators`. |

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

Use AstraFlow `1.13.1` packages from `net8.0`, `net9.0`, `net10.0`, or compatible `netstandard2.0` consumers.

Use `AstraFlow.Mapper.EntityFrameworkCore` only from `net10.0` projects in this release.

Use `AstraFlow.AspNetCore` only from `net10.0` ASP.NET Core projects in this release.

Use `AstraFlow.FluentValidation` and `AstraFlow.OpenTelemetry` from `net8.0`, `net9.0`, or `net10.0` application projects.

Use `AstraFlow.Analyzers` as a private analyzer reference. It does not provide runtime APIs.

Use `AstraFlow.Generators` as a private generator reference. It emits source into the consuming compilation and does not provide runtime APIs.

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

For `1.13.1`, inspect the `.nupkg` files and confirm `AstraFlow.Contracts`, the core packages, `AstraFlow.Mapper.Conventions`, and `AstraFlow.Testing` include `lib/netstandard2.0/`, `lib/net8.0/`, `lib/net9.0/`, and `lib/net10.0/`. Confirm `AstraFlow.Mapper.EntityFrameworkCore` and `AstraFlow.AspNetCore` include only `lib/net10.0/`. Confirm `AstraFlow.FluentValidation` and `AstraFlow.OpenTelemetry` include `lib/net8.0/`, `lib/net9.0/`, and `lib/net10.0/`. Confirm `AstraFlow.Analyzers` and `AstraFlow.Generators` include `analyzers/dotnet/cs/*.dll` and no runtime `lib/` assets.

Then run:

```powershell
.\scripts\verify-package-install.ps1 -Version 1.13.1
.\scripts\verify-api-compatibility.ps1 -PreviousVersion 1.13.0 -CurrentVersion 1.13.1
.\scripts\verify-upgrade-smoke.ps1 -PreviousVersion 1.13.0 -CurrentVersion 1.13.1
.\scripts\verify-sample-builds.ps1 -Configuration Release
```


