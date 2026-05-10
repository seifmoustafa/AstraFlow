# Community Release Guide

This guide is for preparing AstraFlow releases for a public repository push and community consumption.

## Current Release: v1.2.0

v1.2.0 adds projection safety: registry lookup, named projections, static projection validation, diagnostics findings, and optional EF Core translation checks without adding EF Core to the mapper core.

Key message:

```text
AstraFlow v1.2.0 makes query projections explicit, discoverable, named, validated, and EF Core-ready while keeping the mapper core framework-neutral.
```

## What Changed Since v1.1.0

| Area | Change | Why It Matters |
| --- | --- | --- |
| Projection registry | Added deterministic projection lookup. | Users can resolve projections without scanning source. |
| Named projections | Added `INamedProjection<TSource, TDestination>`. | Multiple read-model shapes no longer rely on registration order. |
| Projection validation | Added `AFP...` findings. | Risky expressions are visible before production query failures. |
| EF Core package | Added `AstraFlow.Mapper.EntityFrameworkCore`. | EF users get translation checks without coupling the core mapper to EF. |
| Diagnostics | Projection names and projection validation findings are reported. | CI and issue reports show projection health. |
| Tests | Added registry, validation, and SQLite EF Core tests. | Locks the new projection behavior. |

## Pre-Push Checklist

Run these checks before pushing:

```powershell
$env:DOTNET_CLI_HOME='E:\packages\asp.net_packages\AstraFlow\.dotnet-cli-home'
$env:HUSKY='0'
dotnet build AstraFlow.slnx -c Release --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet test AstraFlow.slnx -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
```

Expected result:

- build succeeds,
- tests pass,
- no warnings,
- diagnostics tests include 8 passing tests,
- EF Core projection tests include 3 passing tests,
- mediator tests include 14 passing tests,
- mapper tests include 19 passing tests,
- integration tests include 1 passing test.

## Package Verification

Pack all package projects:

```powershell
dotnet pack src\AstraFlow.Mediator\AstraFlow.Mediator.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Mapper\AstraFlow.Mapper.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Mapper.EntityFrameworkCore\AstraFlow.Mapper.EntityFrameworkCore.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Diagnostics\AstraFlow.Diagnostics.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow\AstraFlow.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
```

Expected artifacts:

- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.2.0.nupkg`
- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.2.0.snupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.2.0.nupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.2.0.snupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.2.0.nupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.2.0.snupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.2.0.nupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.2.0.snupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.2.0.nupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.2.0.snupkg`

Inspect package contents:

```powershell
tar -tf src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.2.0.nupkg
tar -tf src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.2.0.nupkg
tar -tf src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release\AstraFlow.Mapper.EntityFrameworkCore.1.2.0.nupkg
tar -tf src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.2.0.nupkg
tar -tf src\AstraFlow\bin\Release\AstraFlow.1.2.0.nupkg
```

Each `.nupkg` should include:

- `README.md`,
- `LICENSE`,
- `assets/branding/astraflow-icon.png`,
- `.nuspec`,
- `lib/net10.0/*.dll`,
- `lib/net10.0/*.xml`.

The NuGet README should use absolute GitHub URLs for images and documentation links. NuGet displays `PackageIcon` separately, but README images do not render from packaged relative paths such as `assets/branding/astraflow-icon.png`. Publish after the README target branch contains the referenced docs, or change those links to the final release tag before packing.

Each `.snupkg` should include:

- `.nuspec`,
- `lib/net10.0/*.pdb`.

## Clean Install Check

Create a temporary `net10.0` console project and install the local packages:

```powershell
$sample = Join-Path '.dotnet-cli-home' ('AstraFlowInstallCheck-' + [guid]::NewGuid().ToString('N'))
dotnet new console --framework net10.0 --output $sample --no-restore
$project = Get-ChildItem -LiteralPath $sample -Filter '*.csproj' | Select-Object -First 1
dotnet add $project.FullName package AstraFlow.Mediator --version 1.2.0 --source '.\src\AstraFlow.Mediator\bin\Release'
dotnet add $project.FullName package AstraFlow.Mapper --version 1.2.0 --source '.\src\AstraFlow.Mapper\bin\Release'
dotnet add $project.FullName package AstraFlow.Mapper.EntityFrameworkCore --version 1.2.0 --source '.\src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release'
dotnet add $project.FullName package AstraFlow.Diagnostics --version 1.2.0 --source '.\src\AstraFlow.Diagnostics\bin\Release'
dotnet add $project.FullName package AstraFlow --version 1.2.0 --source '.\src\AstraFlow\bin\Release'
dotnet build $project.FullName
```

Expected result:

- all five packages install,
- the project restores,
- the project builds.

## Suggested Git Commit

```powershell
git add .
git commit -m "Prepare AstraFlow v1.2.0 projection safety"
```

Before committing, confirm no package artifacts are staged:

```powershell
git status --short
```

Do not commit:

- `bin/`,
- `obj/`,
- `.nupkg`,
- `.snupkg`,
- `.dotnet-cli-home/`,
- temporary logs.

## Suggested Tag

```powershell
git tag v1.2.0
git push origin main
git push origin v1.2.0
```

Only tag after local verification passes.

## Suggested GitHub Release Notes

```markdown
## AstraFlow v1.2.0

This release adds projection safety for the AstraFlow package family.

### Changed

- Add projection registry and named projection support.
- Add warning-by-default projection validation with stable `AFP...` finding codes.
- Add projection findings to diagnostics reports.
- Add optional `AstraFlow.Mapper.EntityFrameworkCore` package with EF Core relational translation checks.
- Add SQLite EF Core integration tests.

### Verification

- Release build passed.
- Full test suite passed.
- All five packages packed as `1.2.0`.
- Package contents include README, LICENSE, icon, XML docs, DLLs, nuspec files, and symbol packages.
```

## Community Positioning

Use this positioning consistently:

- AstraFlow is explicit by default.
- It is not a convention-mapping package in v1.
- It is not tied to a web framework, validation framework, ORM, result type, or application-specific encryption.
- It prioritizes clear startup/runtime failures over hidden behavior.
- Future packages may add testing support, optional convention mapping, analyzers, broader provider checks, and observability, but the explicit core remains first-class.
