# Community Release Guide

This guide is for preparing AstraFlow releases for a public repository push and community consumption.

## Current Release: v1.1.0

v1.1.0 adds the optional `AstraFlow.Diagnostics` package. It should be presented as a production-ergonomics release that makes AstraFlow registrations and validation findings visible without adding web-framework coupling.

Key message:

```text
AstraFlow v1.1.0 adds framework-neutral diagnostics reports for handlers, behaviors, mappings, projections, findings, JSON output, Markdown output, and health-check-ready summaries.
```

## What Changed Since v1.0.1

| Area | Change | Why It Matters |
| --- | --- | --- |
| Diagnostics package | Added `AstraFlow.Diagnostics`. | Users can inspect what AstraFlow sees without reading source. |
| Report model | Added registrations, findings, and summary. | Reports are useful for tests, CI, and health-check style decisions. |
| Output formats | Added JSON and Markdown output. | Reports work for machines and humans. |
| Findings | Added stable severity-coded diagnostics. | Issues can be tracked consistently. |
| Tests | Added diagnostics test coverage. | Locks the new package behavior. |
| Docs | Added diagnostics guide and API reference updates. | Community users know how to adopt the package. |

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
- diagnostics tests include 7 passing tests,
- mediator tests include 14 passing tests,
- mapper tests include 12 passing tests,
- integration tests include 1 passing test.

## Package Verification

Pack all package projects:

```powershell
dotnet pack src\AstraFlow.Mediator\AstraFlow.Mediator.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Mapper\AstraFlow.Mapper.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Diagnostics\AstraFlow.Diagnostics.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow\AstraFlow.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
```

Expected artifacts:

- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.1.0.nupkg`
- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.1.0.snupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.1.0.nupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.1.0.snupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.1.0.nupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.1.0.snupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.1.0.nupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.1.0.snupkg`

Inspect package contents:

```powershell
tar -tf src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.1.0.nupkg
tar -tf src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.1.0.nupkg
tar -tf src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.1.0.nupkg
tar -tf src\AstraFlow\bin\Release\AstraFlow.1.1.0.nupkg
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
dotnet add $project.FullName package AstraFlow.Mediator --version 1.1.0 --source '.\src\AstraFlow.Mediator\bin\Release'
dotnet add $project.FullName package AstraFlow.Mapper --version 1.1.0 --source '.\src\AstraFlow.Mapper\bin\Release'
dotnet add $project.FullName package AstraFlow.Diagnostics --version 1.1.0 --source '.\src\AstraFlow.Diagnostics\bin\Release'
dotnet add $project.FullName package AstraFlow --version 1.1.0 --source '.\src\AstraFlow\bin\Release'
dotnet build $project.FullName
```

Expected result:

- all four packages install,
- the project restores,
- the project builds.

## Suggested Git Commit

```powershell
git add .
git commit -m "Prepare AstraFlow v1.1.0 diagnostics"
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
git tag v1.1.0
git push origin main
git push origin v1.1.0
```

Only tag after local verification passes.

## Suggested GitHub Release Notes

```markdown
## AstraFlow v1.1.0

This release adds framework-neutral diagnostics reporting for the AstraFlow package family.

### Changed

- Add `AstraFlow.Diagnostics`.
- Report request handlers, notification handlers, pipeline behaviors, mapping rules, and projections.
- Add severity-coded findings for duplicate request handlers, missing request handlers, ambiguous request contracts, singleton lifetime warnings, and mapper validation failures.
- Add in-memory, JSON, and Markdown report output.

### Verification

- Release build passed.
- Full test suite passed.
- All four packages packed as `1.1.0`.
- Package contents include README, LICENSE, icon, XML docs, DLLs, nuspec files, and symbol packages.
```

## Community Positioning

Use this positioning consistently:

- AstraFlow is explicit by default.
- It is not a convention-mapping package in v1.
- It is not tied to a web framework, validation framework, ORM, result type, or application-specific encryption.
- It prioritizes clear startup/runtime failures over hidden behavior.
- Future packages may add diagnostics, projection safety, testing support, and optional convention mapping, but the explicit core remains first-class.
