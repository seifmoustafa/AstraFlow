# Community Release Guide

This guide is for preparing AstraFlow v1.0.1 for a public repository push and community consumption.

## What v1.0.1 Is

v1.0.1 is a patch release. It should be presented as a hardening and documentation release, not a feature expansion.

Key message:

```text
AstraFlow v1.0.1 hardens mediator request-contract validation, improves registration robustness, and expands the public documentation so users can understand the package without reading the source.
```

## What Changed Since v1.0.0

| Area | Change | Why It Matters |
| --- | --- | --- |
| Mediator dispatch | Requests implementing multiple `IRequest<TResponse>` contracts now fail clearly. | Prevents ambiguous runtime response selection. |
| Mediator registration | Null service collection and null marker handling are clearer. | Better diagnostics and safer setup. |
| Assembly scanning | Mediator scanning tolerates partially loadable assemblies. | Matches mapper resilience and reduces reflection fragility. |
| Tests | Added focused mediator edge-case tests. | Locks the patch behavior. |
| Docs | Added API reference, architecture, scenario, and troubleshooting docs. | Users can understand behavior without reading every source file. |
| Package metadata | Version and release notes moved to `1.0.1`. | NuGet package identity matches the patch release. |

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
- mediator tests include 14 passing tests,
- mapper tests include 12 passing tests,
- integration tests include 1 passing test.

## Package Verification

Pack all three projects:

```powershell
dotnet pack src\AstraFlow.Mediator\AstraFlow.Mediator.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Mapper\AstraFlow.Mapper.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow\AstraFlow.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
```

Expected artifacts:

- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.0.1.nupkg`
- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.0.1.snupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.0.1.nupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.0.1.snupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.0.1.nupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.0.1.snupkg`

Inspect package contents:

```powershell
tar -tf src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.0.1.nupkg
tar -tf src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.0.1.nupkg
tar -tf src\AstraFlow\bin\Release\AstraFlow.1.0.1.nupkg
```

Each `.nupkg` should include:

- `README.md`,
- `LICENSE`,
- `assets/branding/astraflow-icon.png`,
- `.nuspec`,
- `lib/net10.0/*.dll`,
- `lib/net10.0/*.xml`.

Each `.snupkg` should include:

- `.nuspec`,
- `lib/net10.0/*.pdb`.

## Clean Install Check

Create a temporary `net10.0` console project and install the local packages:

```powershell
$sample = Join-Path '.dotnet-cli-home' ('AstraFlowInstallCheck-' + [guid]::NewGuid().ToString('N'))
dotnet new console --framework net10.0 --output $sample --no-restore
$project = Get-ChildItem -LiteralPath $sample -Filter '*.csproj' | Select-Object -First 1
dotnet add $project.FullName package AstraFlow.Mediator --version 1.0.1 --source '.\src\AstraFlow.Mediator\bin\Release'
dotnet add $project.FullName package AstraFlow.Mapper --version 1.0.1 --source '.\src\AstraFlow.Mapper\bin\Release'
dotnet add $project.FullName package AstraFlow --version 1.0.1 --source '.\src\AstraFlow\bin\Release'
dotnet build $project.FullName
```

Expected result:

- all three packages install,
- the project restores,
- the project builds.

## Suggested Git Commit

```powershell
git add .
git commit -m "Prepare AstraFlow v1.0.1"
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
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

Only tag after local verification passes.

## Suggested GitHub Release Notes

```markdown
## AstraFlow v1.0.1

This patch release hardens the v1 explicit core and expands the public documentation.

### Changed

- Reject request types that implement multiple `IRequest<TResponse>` contracts with a clear mediator diagnostic.
- Harden mediator registration for null service collections, null marker types, and partially loadable assemblies.
- Expand documentation with API reference tables, architecture notes, mediator scenarios, mapper scenarios, troubleshooting, and release guidance.

### Verification

- Release build passed.
- Full test suite passed.
- All three packages packed as `1.0.1`.
- Package contents include README, LICENSE, icon, XML docs, DLLs, nuspec files, and symbol packages.
```

## Community Positioning

Use this positioning consistently:

- AstraFlow is explicit by default.
- It is not a convention-mapping package in v1.
- It is not tied to a web framework, validation framework, ORM, result type, or application-specific encryption.
- It prioritizes clear startup/runtime failures over hidden behavior.
- Future packages may add diagnostics, projection safety, testing support, and optional convention mapping, but the explicit core remains first-class.

