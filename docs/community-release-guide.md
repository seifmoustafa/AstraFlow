# Community Release Guide

This guide is for preparing AstraFlow releases for a public repository push and community consumption.

## Current Release: v1.8.2

v1.8.2 builds on the analyzer foundation with mapper and projection analyzer warnings for undeclared mapping rules, reverse sensitive writes, raw public IDs, mapper calls inside query expressions, custom projection methods, and complex projection captures.

Key message:

```text
AstraFlow v1.8.2 adds mapper and projection build-time diagnostics to `AstraFlow.Analyzers` while staying source-only, generator-free, code-fix-free, and conservative about provider translation limits.
```

## What Changed Since v1.8.1

| Area | Change | Why It Matters |
| --- | --- | --- |
| Mapper analyzers | Added `AFAN0201` and `AFAN0202`. | Mapping declaration and sensitive reverse-write risks now surface during build. |
| Projection analyzers | Added `AFAN0301` through `AFAN0304`. | Common provider-translation and raw-ID risks become visible before runtime validation. |
| Static limits | Documented that analyzer warnings do not replace EF provider validation. | Users get early guidance without overclaiming full translation proof. |
| Tests | Added analyzer tests for mapper and projection warning paths. | CI verifies the first mapper/projection rule set. |

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
dotnet pack src\AstraFlow\AstraFlow.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
```

Expected artifacts:

- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.8.2.nupkg`
- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.8.2.snupkg`
- `src/AstraFlow.Contracts/bin/Release/AstraFlow.Contracts.1.8.2.nupkg`
- `src/AstraFlow.Contracts/bin/Release/AstraFlow.Contracts.1.8.2.snupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.8.2.nupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.8.2.snupkg`
- `src/AstraFlow.Mapper.Conventions/bin/Release/AstraFlow.Mapper.Conventions.1.8.2.nupkg`
- `src/AstraFlow.Mapper.Conventions/bin/Release/AstraFlow.Mapper.Conventions.1.8.2.snupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.8.2.nupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.8.2.snupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.8.2.nupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.8.2.snupkg`
- `src/AstraFlow.Testing/bin/Release/AstraFlow.Testing.1.8.2.nupkg`
- `src/AstraFlow.Testing/bin/Release/AstraFlow.Testing.1.8.2.snupkg`
- `src/AstraFlow.Analyzers/bin/Release/AstraFlow.Analyzers.1.8.2.nupkg`
- `src/AstraFlow.Analyzers/bin/Release/AstraFlow.Analyzers.1.8.2.snupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.8.2.nupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.8.2.snupkg`

Inspect package contents:

```powershell
tar -tf src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.8.2.nupkg
tar -tf src\AstraFlow.Contracts\bin\Release\AstraFlow.Contracts.1.8.2.nupkg
tar -tf src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.8.2.nupkg
tar -tf src\AstraFlow.Mapper.Conventions\bin\Release\AstraFlow.Mapper.Conventions.1.8.2.nupkg
tar -tf src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release\AstraFlow.Mapper.EntityFrameworkCore.1.8.2.nupkg
tar -tf src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.8.2.nupkg
tar -tf src\AstraFlow.Testing\bin\Release\AstraFlow.Testing.1.8.2.nupkg
tar -tf src\AstraFlow.Analyzers\bin\Release\AstraFlow.Analyzers.1.8.2.nupkg
tar -tf src\AstraFlow\bin\Release\AstraFlow.1.8.2.nupkg
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

Copy-Item '.\src\AstraFlow.Contracts\bin\Release\AstraFlow.Contracts.1.8.2.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.8.2.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.8.2.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper.Conventions\bin\Release\AstraFlow.Mapper.Conventions.1.8.2.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release\AstraFlow.Mapper.EntityFrameworkCore.1.8.2.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.8.2.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Testing\bin\Release\AstraFlow.Testing.1.8.2.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Analyzers\bin\Release\AstraFlow.Analyzers.1.8.2.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow\bin\Release\AstraFlow.1.8.2.nupkg' -Destination $localSource -Force

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

$sampleRoot = 'C:\tmp\AstraFlowInstallCheck-1.8.2'
New-Item -ItemType Directory -Force -Path $sampleRoot | Out-Null
$sample = Join-Path $sampleRoot ('AstraFlowInstallCheck-' + [guid]::NewGuid().ToString('N'))
dotnet new console --framework net10.0 --output $sample --no-restore
$project = Get-ChildItem -LiteralPath $sample -Filter '*.csproj' | Select-Object -First 1
dotnet add $project.FullName package AstraFlow.Contracts --version 1.8.2 --no-restore
dotnet add $project.FullName package AstraFlow.Mediator --version 1.8.2 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper --version 1.8.2 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper.Conventions --version 1.8.2 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper.EntityFrameworkCore --version 1.8.2 --no-restore
dotnet add $project.FullName package AstraFlow.Diagnostics --version 1.8.2 --no-restore
dotnet add $project.FullName package AstraFlow.Testing --version 1.8.2 --no-restore
dotnet add $project.FullName package AstraFlow.Analyzers --version 1.8.2 --no-restore
dotnet add $project.FullName package AstraFlow --version 1.8.2 --no-restore
dotnet restore $project.FullName --configfile $config
dotnet build $project.FullName --no-restore
```

Expected result:

- All nine packages install,
- the project restores,
- the project builds.

Also create `netstandard2.0`, `net8.0`, and `net9.0` projects and install the core packages only:

```powershell
foreach ($framework in @('netstandard2.0', 'net8.0', 'net9.0')) {
    $sample = Join-Path $sampleRoot ('AstraFlowCoreInstallCheck-' + $framework + '-' + [guid]::NewGuid().ToString('N'))
    $template = if ($framework -eq 'netstandard2.0') { 'classlib' } else { 'console' }
    dotnet new $template --framework $framework --output $sample --no-restore
    $project = Get-ChildItem -LiteralPath $sample -Filter '*.csproj' | Select-Object -First 1
    dotnet add $project.FullName package AstraFlow.Contracts --version 1.8.2 --no-restore
    dotnet add $project.FullName package AstraFlow.Mediator --version 1.8.2 --no-restore
    dotnet add $project.FullName package AstraFlow.Mapper --version 1.8.2 --no-restore
    dotnet add $project.FullName package AstraFlow.Mapper.Conventions --version 1.8.2 --no-restore
    dotnet add $project.FullName package AstraFlow.Diagnostics --version 1.8.2 --no-restore
    dotnet add $project.FullName package AstraFlow.Testing --version 1.8.2 --no-restore
    dotnet add $project.FullName package AstraFlow.Analyzers --version 1.8.2 --no-restore
    dotnet add $project.FullName package AstraFlow --version 1.8.2 --no-restore
    dotnet restore $project.FullName --configfile $config
    dotnet build $project.FullName --no-restore
}
```

## Suggested Git Commit

```powershell
git add .
git commit -m "Release AstraFlow v1.8.2 mapper projection analyzers"
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
git tag v1.8.2
git push origin main
git push origin v1.8.2
```

Only tag after local verification passes.

## Suggested GitHub Release Notes

```markdown
## AstraFlow v1.8.2

This patch adds mapper and projection analyzer warnings for the v1.8.x analyzer lane while preserving source-only analyzer packaging and avoiding code fixes or generator dependencies.

### Changed

- Add `AFAN0201` undeclared mapping rule diagnostics.
- Add `AFAN0202` reverse convention mapping sensitive-write diagnostics.
- Add `AFAN0301` raw public ID projection shape diagnostics.
- Add `AFAN0302` mapper-call-inside-query diagnostics.
- Add `AFAN0303` custom projection method diagnostics.
- Add `AFAN0304` complex projection capture diagnostics.
- Update docs, package metadata, tests, and clean-install verification for `1.8.2`.

### Verification

- Release build passed.
- Full test suite passed.
- All nine packages packed as `1.8.2`.
- Package contents include README, CHANGELOG, LICENSE, icon, XML docs, DLLs for expected target frameworks, nuspec files, and symbol packages.
```

## Community Positioning

Use this positioning consistently:

- AstraFlow is explicit by default.
- It is not a convention-mapping package in v1.
- It is not tied to a web framework, validation framework, ORM, result type, or application-specific encryption.
- It prioritizes clear startup/runtime failures over hidden behavior.
- Future packages may add target-framework compatibility work, testing support, mediator parity features, optional convention mapping, advanced mapping parity, analyzers, CLI/templates, broader provider checks, integrations, and observability, but the explicit core remains first-class.




