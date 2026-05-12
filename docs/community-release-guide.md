# Community Release Guide

This guide is for preparing AstraFlow releases for a public repository push and community consumption.

## Current Release: v1.2.1

v1.2.1 is a compatibility and adoption hardening release. It keeps the v1.2 projection safety behavior and adds clearer compatibility guidance, package selection guidance, release checklist hardening, and a documented audit path for future multi-target support.

Key message:

```text
AstraFlow v1.2.1 makes the v1.2 projection safety release easier to adopt and verify by documenting target support, package selection, clean install checks, and future compatibility gates.
```

## What Changed Since v1.2.0

| Area | Change | Why It Matters |
| --- | --- | --- |
| Compatibility docs | Added `docs/compatibility.md`. | Users can see current `net10.0` support and the future multi-target audit plan. |
| Package selection docs | Added `docs/package-selection.md`. | Users can choose focused packages instead of defaulting to the meta package. |
| Release checklist | Added compatibility and clean install gates. | Future target support cannot be claimed without package assets and tests. |
| Package metadata | Updated version and release notes to `1.2.1`. | NuGet release notes describe the adoption-hardening scope. |
| Runtime behavior | No behavior changes. | Existing `1.2.0` users can update without code changes. |

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

- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.2.1.nupkg`
- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.2.1.snupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.2.1.nupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.2.1.snupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.2.1.nupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.2.1.snupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.2.1.nupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.2.1.snupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.2.1.nupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.2.1.snupkg`

Inspect package contents:

```powershell
tar -tf src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.2.1.nupkg
tar -tf src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.2.1.nupkg
tar -tf src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release\AstraFlow.Mapper.EntityFrameworkCore.1.2.1.nupkg
tar -tf src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.2.1.nupkg
tar -tf src\AstraFlow\bin\Release\AstraFlow.1.2.1.nupkg
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
$root = Resolve-Path '.'
$localSource = Join-Path $root '.dotnet-cli-home\local-packages'
New-Item -ItemType Directory -Force -Path $localSource | Out-Null

Copy-Item '.\src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.2.1.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.2.1.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release\AstraFlow.Mapper.EntityFrameworkCore.1.2.1.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.2.1.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow\bin\Release\AstraFlow.1.2.1.nupkg' -Destination $localSource -Force

$config = Join-Path $root '.dotnet-cli-home\installcheck.nuget.config'
@"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="local" value="$localSource" />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
  </packageSources>
</configuration>
"@ | Set-Content -LiteralPath $config -Encoding UTF8

$sample = Join-Path '.dotnet-cli-home' ('AstraFlowInstallCheck-' + [guid]::NewGuid().ToString('N'))
dotnet new console --framework net10.0 --output $sample --no-restore
$project = Get-ChildItem -LiteralPath $sample -Filter '*.csproj' | Select-Object -First 1
dotnet add $project.FullName package AstraFlow.Mediator --version 1.2.1 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper --version 1.2.1 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper.EntityFrameworkCore --version 1.2.1 --no-restore
dotnet add $project.FullName package AstraFlow.Diagnostics --version 1.2.1 --no-restore
dotnet add $project.FullName package AstraFlow --version 1.2.1 --no-restore
dotnet restore $project.FullName --configfile $config
dotnet build $project.FullName --no-restore
```

Expected result:

- all five packages install,
- the project restores,
- the project builds.

## Suggested Git Commit

```powershell
git add .
git commit -m "Prepare AstraFlow v1.2.1 compatibility hardening"
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
git tag v1.2.1
git push origin main
git push origin v1.2.1
```

Only tag after local verification passes.

## Suggested GitHub Release Notes

```markdown
## AstraFlow v1.2.1

This release hardens AstraFlow compatibility and adoption guidance after the v1.2 projection safety release.

### Changed

- Add compatibility guidance for current `net10.0` support and future multi-target expansion.
- Add package selection guidance for choosing focused packages or the meta package.
- Add release checklist gates for target framework verification and clean install checks.
- Document compatibility audit findings for future target expansion.
- Keep runtime behavior unchanged from v1.2.0.

### Verification

- Release build passed.
- Full test suite passed.
- All five packages packed as `1.2.1`.
- Package contents include README, LICENSE, icon, XML docs, DLLs, nuspec files, and symbol packages.
```

## Community Positioning

Use this positioning consistently:

- AstraFlow is explicit by default.
- It is not a convention-mapping package in v1.
- It is not tied to a web framework, validation framework, ORM, result type, or application-specific encryption.
- It prioritizes clear startup/runtime failures over hidden behavior.
- Future packages may add target-framework compatibility work, testing support, mediator parity features, optional convention mapping, advanced mapping parity, analyzers, CLI/templates, broader provider checks, integrations, and observability, but the explicit core remains first-class.
