# Community Release Guide

This guide is for preparing AstraFlow releases for a public repository push and community consumption.

## Current Release: v1.2.3

v1.2.3 is a compatibility verification hardening release. It keeps the v1.2.2 target framework support and adds automated clean-install checks for the packed packages.

Key message:

```text
AstraFlow v1.2.3 locks in the v1.2.2 multi-target promise by verifying clean external installs for `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` consumers before publish.
```

## What Changed Since v1.2.2

| Area | Change | Why It Matters |
| --- | --- | --- |
| Install verification script | Added `scripts/verify-package-install.ps1`. | Release owners can prove packed packages install in clean consumer projects. |
| CI verification | CI now runs clean package install checks after packing. | Target support cannot drift silently. |
| Publish verification | The publish workflow runs clean package install checks before pushing to NuGet. | Broken packages are blocked before publication. |
| Local pack verification | `scripts/pack.ps1` now runs package install verification. | Local release checks match CI/publish behavior. |
| Package metadata | Updated version and release notes to `1.2.3`. | NuGet release notes describe the verification hardening scope. |

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

- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.2.3.nupkg`
- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.2.3.snupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.2.3.nupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.2.3.snupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.2.3.nupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.2.3.snupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.2.3.nupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.2.3.snupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.2.3.nupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.2.3.snupkg`

Inspect package contents:

```powershell
tar -tf src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.2.3.nupkg
tar -tf src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.2.3.nupkg
tar -tf src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release\AstraFlow.Mapper.EntityFrameworkCore.1.2.3.nupkg
tar -tf src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.2.3.nupkg
tar -tf src\AstraFlow\bin\Release\AstraFlow.1.2.3.nupkg
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

Copy-Item '.\src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.2.3.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.2.3.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release\AstraFlow.Mapper.EntityFrameworkCore.1.2.3.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.2.3.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow\bin\Release\AstraFlow.1.2.3.nupkg' -Destination $localSource -Force

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

$sampleRoot = 'C:\tmp\AstraFlowInstallCheck-1.2.3'
New-Item -ItemType Directory -Force -Path $sampleRoot | Out-Null
$sample = Join-Path $sampleRoot ('AstraFlowInstallCheck-' + [guid]::NewGuid().ToString('N'))
dotnet new console --framework net10.0 --output $sample --no-restore
$project = Get-ChildItem -LiteralPath $sample -Filter '*.csproj' | Select-Object -First 1
dotnet add $project.FullName package AstraFlow.Mediator --version 1.2.3 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper --version 1.2.3 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper.EntityFrameworkCore --version 1.2.3 --no-restore
dotnet add $project.FullName package AstraFlow.Diagnostics --version 1.2.3 --no-restore
dotnet add $project.FullName package AstraFlow --version 1.2.3 --no-restore
dotnet restore $project.FullName --configfile $config
dotnet build $project.FullName --no-restore
```

Expected result:

- all five packages install,
- the project restores,
- the project builds.

Also create `netstandard2.0`, `net8.0`, and `net9.0` projects and install the core packages only:

```powershell
foreach ($framework in @('netstandard2.0', 'net8.0', 'net9.0')) {
    $sample = Join-Path $sampleRoot ('AstraFlowCoreInstallCheck-' + $framework + '-' + [guid]::NewGuid().ToString('N'))
    $template = if ($framework -eq 'netstandard2.0') { 'classlib' } else { 'console' }
    dotnet new $template --framework $framework --output $sample --no-restore
    $project = Get-ChildItem -LiteralPath $sample -Filter '*.csproj' | Select-Object -First 1
    dotnet add $project.FullName package AstraFlow.Mediator --version 1.2.3 --no-restore
    dotnet add $project.FullName package AstraFlow.Mapper --version 1.2.3 --no-restore
    dotnet add $project.FullName package AstraFlow.Diagnostics --version 1.2.3 --no-restore
    dotnet add $project.FullName package AstraFlow --version 1.2.3 --no-restore
    dotnet restore $project.FullName --configfile $config
    dotnet build $project.FullName --no-restore
}
```

## Suggested Git Commit

```powershell
git add .
git commit -m "Prepare AstraFlow v1.2.3 install verification"
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
git tag v1.2.3
git push origin main
git push origin v1.2.3
```

Only tag after local verification passes.

## Suggested GitHub Release Notes

```markdown
## AstraFlow v1.2.3

This release adds automated clean-install verification for the package target support introduced in v1.2.2.

### Changed

- Add `scripts/verify-package-install.ps1`.
- Verify core packages in clean `netstandard2.0`, `net8.0`, and `net9.0` consumer projects.
- Verify all packages, including `AstraFlow.Mapper.EntityFrameworkCore`, in a clean `net10.0` consumer project.
- Run clean install verification from local packing, CI, and the publish workflow.
- Update compatibility, release, publishing, and package-selection docs.

### Verification

- Release build passed.
- Full test suite passed.
- All five packages packed as `1.2.3`.
- Package contents include README, CHANGELOG, LICENSE, icon, XML docs, DLLs for expected target frameworks, nuspec files, and symbol packages.
```

## Community Positioning

Use this positioning consistently:

- AstraFlow is explicit by default.
- It is not a convention-mapping package in v1.
- It is not tied to a web framework, validation framework, ORM, result type, or application-specific encryption.
- It prioritizes clear startup/runtime failures over hidden behavior.
- Future packages may add target-framework compatibility work, testing support, mediator parity features, optional convention mapping, advanced mapping parity, analyzers, CLI/templates, broader provider checks, integrations, and observability, but the explicit core remains first-class.
