# Community Release Guide

This guide is for preparing AstraFlow releases for a public repository push and community consumption.

## Current Release: v1.10.0

v1.10.0 adds the first AstraFlow CLI tool package for inspection, validation, reports, diffs, graph output, and migration scanner reports.

Key message:

```text
AstraFlow v1.10.0 adds `AstraFlow.Cli`, a .NET tool package that exposes the `astraflow` command for CI-friendly inspection and migration workflows.
```

## What Changed Since v1.8.4

| Area | Change | Why It Matters |
| --- | --- | --- |
| CLI tool package | Added `AstraFlow.Cli` with `ToolCommandName=astraflow`. | Tooling can ship independently from runtime application packages. |
| Inspection | Added `inspect` plus handler, notification, mapping, and projection categories. | Teams can create lightweight project snapshots. |
| Validation and reports | Added `validate` and `report` with JSON, Markdown, and SARIF output. | CI can consume structured command output. |
| Diff and graph output | Added `diff` plus Mermaid and DOT graph output. | Application-flow changes can be reviewed in pull requests. |
| Migration scanning | Added `scan` for MediatR and AutoMapper migration candidates. | Migration planning gets a repeatable starting report. |
| Verification | Added CLI tests, packaging, and clean tool-install verification. | The release verifies the `astraflow` tool path, not only library packages. |

## Pre-Push Checklist

Run these checks before pushing:

```powershell
$env:DOTNET_CLI_HOME='E:\packages\asp.net_packages\AstraFlow\.dotnet-cli-home'
$env:HUSKY='0'
dotnet build AstraFlow.slnx -c Release --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet test AstraFlow.slnx -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
.\scripts\run-benchmarks.ps1 -Smoke
```

Expected result:

- build succeeds,
- tests pass,
- no warnings,
- diagnostics tests include 10 passing tests,
- EF Core projection tests include 6 passing tests,
- mediator tests include 37 passing tests,
- mapper tests include 23 passing tests,
- convention mapper tests include 38 passing tests,
- integration tests include 1 passing test.
- testing package tests include 20 passing tests.
- analyzer package tests include 3 passing tests.

## Package Verification

Pack all package projects:

```powershell
dotnet pack src\AstraFlow.Contracts\AstraFlow.Contracts.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Mediator\AstraFlow.Mediator.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Mapper\AstraFlow.Mapper.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Mapper.Conventions\AstraFlow.Mapper.Conventions.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Mapper.EntityFrameworkCore\AstraFlow.Mapper.EntityFrameworkCore.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Diagnostics\AstraFlow.Diagnostics.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Testing\AstraFlow.Testing.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Analyzers\AstraFlow.Analyzers.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Generators\AstraFlow.Generators.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow\AstraFlow.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
```

Expected artifacts:

- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.10.0.nupkg`
- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.10.0.snupkg`
- `src/AstraFlow.Contracts/bin/Release/AstraFlow.Contracts.1.10.0.nupkg`
- `src/AstraFlow.Contracts/bin/Release/AstraFlow.Contracts.1.10.0.snupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.10.0.nupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.10.0.snupkg`
- `src/AstraFlow.Mapper.Conventions/bin/Release/AstraFlow.Mapper.Conventions.1.10.0.nupkg`
- `src/AstraFlow.Mapper.Conventions/bin/Release/AstraFlow.Mapper.Conventions.1.10.0.snupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.10.0.nupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.10.0.snupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.10.0.nupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.10.0.snupkg`
- `src/AstraFlow.Testing/bin/Release/AstraFlow.Testing.1.10.0.nupkg`
- `src/AstraFlow.Testing/bin/Release/AstraFlow.Testing.1.10.0.snupkg`
- `src/AstraFlow.Analyzers/bin/Release/AstraFlow.Analyzers.1.10.0.nupkg`
- `src/AstraFlow.Analyzers/bin/Release/AstraFlow.Analyzers.1.10.0.snupkg`
- `src/AstraFlow.Generators/bin/Release/AstraFlow.Generators.1.10.0.nupkg`
- `src/AstraFlow.Generators/bin/Release/AstraFlow.Generators.1.10.0.snupkg`
- `src/AstraFlow.Cli/bin/Release/AstraFlow.Cli.1.10.0.nupkg`
- `src/AstraFlow.Cli/bin/Release/AstraFlow.Cli.1.10.0.snupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.10.0.nupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.10.0.snupkg`

Inspect package contents:

```powershell
tar -tf src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.10.0.nupkg
tar -tf src\AstraFlow.Contracts\bin\Release\AstraFlow.Contracts.1.10.0.nupkg
tar -tf src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.10.0.nupkg
tar -tf src\AstraFlow.Mapper.Conventions\bin\Release\AstraFlow.Mapper.Conventions.1.10.0.nupkg
tar -tf src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release\AstraFlow.Mapper.EntityFrameworkCore.1.10.0.nupkg
tar -tf src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.10.0.nupkg
tar -tf src\AstraFlow.Testing\bin\Release\AstraFlow.Testing.1.10.0.nupkg
tar -tf src\AstraFlow.Analyzers\bin\Release\AstraFlow.Analyzers.1.10.0.nupkg
tar -tf src\AstraFlow.Generators\bin\Release\AstraFlow.Generators.1.10.0.nupkg
tar -tf src\AstraFlow.Cli\bin\Release\AstraFlow.Cli.1.10.0.nupkg
tar -tf src\AstraFlow\bin\Release\AstraFlow.1.10.0.nupkg
```

Each `.nupkg` should include:

- `README.md`,
- `CHANGELOG.md`,
- `LICENSE`,
- `assets/branding/astraflow-icon.png`,
- `.nuspec`,
- `.dll` and `.xml` files under the expected framework folders.

Core packages should include:

- `lib/netstandard2.0/`,
- `lib/net8.0/`,
- `lib/net9.0/`,
- `lib/net10.0/`.

`AstraFlow.Mapper.EntityFrameworkCore` should include only:

- `lib/net10.0/`.

`AstraFlow.Analyzers` should include:

- `analyzers/dotnet/cs/AstraFlow.Analyzers.dll`,
- no runtime `lib/` assets.

`AstraFlow.Generators` should include:

- `analyzers/dotnet/cs/AstraFlow.Generators.dll`,
- no runtime `lib/` assets.

The NuGet README should use absolute GitHub URLs for images and documentation links. NuGet displays `PackageIcon` separately, but README images do not render from packaged relative paths such as `assets/branding/astraflow-icon.png`. Publish after the README target branch contains the referenced docs, or change those links to the final release tag before packing.

Each `.snupkg` should include:

- `.nuspec`,
- matching `.pdb` files under the same framework folders as the `.nupkg`.

## Clean Install Check

Create temporary projects and install the local packages:

```powershell
$root = Resolve-Path '.'
$localSource = Join-Path $root '.dotnet-cli-home\local-packages'
New-Item -ItemType Directory -Force -Path $localSource | Out-Null

Copy-Item '.\src\AstraFlow.Contracts\bin\Release\AstraFlow.Contracts.1.10.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.10.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.10.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper.Conventions\bin\Release\AstraFlow.Mapper.Conventions.1.10.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release\AstraFlow.Mapper.EntityFrameworkCore.1.10.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.10.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Testing\bin\Release\AstraFlow.Testing.1.10.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Analyzers\bin\Release\AstraFlow.Analyzers.1.10.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Generators\bin\Release\AstraFlow.Generators.1.10.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Cli\bin\Release\AstraFlow.Cli.1.10.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow\bin\Release\AstraFlow.1.10.0.nupkg' -Destination $localSource -Force

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

$sampleRoot = 'C:\tmp\AstraFlowInstallCheck-1.10.0'
New-Item -ItemType Directory -Force -Path $sampleRoot | Out-Null
$sample = Join-Path $sampleRoot ('AstraFlowInstallCheck-' + [guid]::NewGuid().ToString('N'))
dotnet new console --framework net10.0 --output $sample --no-restore
$project = Get-ChildItem -LiteralPath $sample -Filter '*.csproj' | Select-Object -First 1
dotnet add $project.FullName package AstraFlow.Contracts --version 1.10.0 --no-restore
dotnet add $project.FullName package AstraFlow.Mediator --version 1.10.0 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper --version 1.10.0 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper.Conventions --version 1.10.0 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper.EntityFrameworkCore --version 1.10.0 --no-restore
dotnet add $project.FullName package AstraFlow.Diagnostics --version 1.10.0 --no-restore
dotnet add $project.FullName package AstraFlow.Testing --version 1.10.0 --no-restore
dotnet add $project.FullName package AstraFlow.Analyzers --version 1.10.0 --no-restore
dotnet add $project.FullName package AstraFlow.Generators --version 1.10.0 --no-restore
dotnet add $project.FullName package AstraFlow --version 1.10.0 --no-restore
dotnet restore $project.FullName --configfile $config
dotnet build $project.FullName --no-restore
```

Expected result:

- All ten runtime/compiler packages install,
- the `AstraFlow.Cli` tool installs and `astraflow inspect` runs,
- the project restores,
- the project builds.

Also create `netstandard2.0`, `net8.0`, and `net9.0` projects and install the core packages only:

```powershell
foreach ($framework in @('netstandard2.0', 'net8.0', 'net9.0')) {
    $sample = Join-Path $sampleRoot ('AstraFlowCoreInstallCheck-' + $framework + '-' + [guid]::NewGuid().ToString('N'))
    $template = if ($framework -eq 'netstandard2.0') { 'classlib' } else { 'console' }
    dotnet new $template --framework $framework --output $sample --no-restore
    $project = Get-ChildItem -LiteralPath $sample -Filter '*.csproj' | Select-Object -First 1
    dotnet add $project.FullName package AstraFlow.Contracts --version 1.10.0 --no-restore
    dotnet add $project.FullName package AstraFlow.Mediator --version 1.10.0 --no-restore
    dotnet add $project.FullName package AstraFlow.Mapper --version 1.10.0 --no-restore
    dotnet add $project.FullName package AstraFlow.Mapper.Conventions --version 1.10.0 --no-restore
    dotnet add $project.FullName package AstraFlow.Diagnostics --version 1.10.0 --no-restore
    dotnet add $project.FullName package AstraFlow.Testing --version 1.10.0 --no-restore
    dotnet add $project.FullName package AstraFlow.Analyzers --version 1.10.0 --no-restore
    dotnet add $project.FullName package AstraFlow.Generators --version 1.10.0 --no-restore
    dotnet add $project.FullName package AstraFlow --version 1.10.0 --no-restore
    dotnet restore $project.FullName --configfile $config
    dotnet build $project.FullName --no-restore
}
```

## Suggested Git Commit

```powershell
git add .
git commit -m "Release AstraFlow v1.10.0 CLI"
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
git tag v1.10.0
git push origin main
git push origin v1.10.0
```

Only tag after local verification passes.

## Suggested GitHub Release Notes

```markdown
## AstraFlow v1.10.0

This release adds the first AstraFlow CLI tool package for inspection, validation, reports, diffs, graph output, and migration scanner reports.

### Changed

- Add `AstraFlow.Cli` as a .NET tool package with `astraflow` command name.
- Add `inspect`, `validate`, `report`, `diff`, `graph`, and `scan` commands.
- Add JSON, Markdown, SARIF, Mermaid, and DOT output paths.
- Add migration candidate scanning for MediatR and AutoMapper references.
- Update docs, package metadata, CLI verification, and clean-install verification for `1.10.0`.

### Verification

- Release build passed.
- Full test suite passed.
- CLI command tests passed.
- CLI tool install smoke passed.
- All eleven packages packed as `1.10.0`.
- Package contents include README, CHANGELOG, LICENSE, icon, XML docs, DLLs for expected target frameworks, nuspec files, and symbol packages.
```

## Community Positioning

Use this positioning consistently:

- AstraFlow is explicit by default.
- It is not a convention-mapping package in v1.
- It is not tied to a web framework, validation framework, ORM, result type, or application-specific encryption.
- It prioritizes clear startup/runtime failures over hidden behavior.
- Future packages may add target-framework compatibility work, testing support, mediator parity features, optional convention mapping, advanced mapping parity, analyzers, CLI/templates, broader provider checks, integrations, and observability, but the explicit core remains first-class.




