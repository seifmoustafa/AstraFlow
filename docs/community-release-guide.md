# Community Release Guide

This guide is for preparing AstraFlow releases for a public repository push and community consumption.

## Current Release: v1.3.0

v1.3.0 is the testing-support release. It adds `AstraFlow.Testing` while keeping the v1.2 target framework support and clean package install verification.

Key message:

```text
AstraFlow v1.3.0 adds framework-neutral testing helpers for fake mediator flows, handler and pipeline harnesses, mapper/projection/diagnostics assertions, and deterministic secure ID tests.
```

## What Changed Since v1.2.3

| Area | Change | Why It Matters |
| --- | --- | --- |
| New package | Added `AstraFlow.Testing`. | Test projects can use AstraFlow helpers without a mocking framework or full host. |
| Mediator testing | Added fake sender, fake publisher, fake mediator, and request/notification recording. | Unit tests can assert dispatch behavior directly. |
| Harnesses | Added handler, notification handler, and pipeline harnesses. | Handler and behavior tests stay small and deterministic. |
| Assertions | Added mapper, projection, diagnostics, exception, mapping-rule, and secure ID assertions. | Common package scenarios have clear assertion messages. |
| Release verification | CI, publish, pack, and install verification now include `AstraFlow.Testing`. | The new package is checked across supported targets before publish. |

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
- testing package tests include 11 passing tests.

## Package Verification

Pack all package projects:

```powershell
dotnet pack src\AstraFlow.Mediator\AstraFlow.Mediator.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Mapper\AstraFlow.Mapper.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Mapper.EntityFrameworkCore\AstraFlow.Mapper.EntityFrameworkCore.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Diagnostics\AstraFlow.Diagnostics.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow.Testing\AstraFlow.Testing.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
dotnet pack src\AstraFlow\AstraFlow.csproj -c Release --no-build --no-restore -v:minimal /m:1 /p:UseSharedCompilation=false
```

Expected artifacts:

- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.3.0.nupkg`
- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.3.0.snupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.3.0.nupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.3.0.snupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.3.0.nupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.3.0.snupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.3.0.nupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.3.0.snupkg`
- `src/AstraFlow.Testing/bin/Release/AstraFlow.Testing.1.3.0.nupkg`
- `src/AstraFlow.Testing/bin/Release/AstraFlow.Testing.1.3.0.snupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.3.0.nupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.3.0.snupkg`

Inspect package contents:

```powershell
tar -tf src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.3.0.nupkg
tar -tf src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.3.0.nupkg
tar -tf src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release\AstraFlow.Mapper.EntityFrameworkCore.1.3.0.nupkg
tar -tf src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.3.0.nupkg
tar -tf src\AstraFlow.Testing\bin\Release\AstraFlow.Testing.1.3.0.nupkg
tar -tf src\AstraFlow\bin\Release\AstraFlow.1.3.0.nupkg
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

Copy-Item '.\src\AstraFlow.Mediator\bin\Release\AstraFlow.Mediator.1.3.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper\bin\Release\AstraFlow.Mapper.1.3.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Mapper.EntityFrameworkCore\bin\Release\AstraFlow.Mapper.EntityFrameworkCore.1.3.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Diagnostics\bin\Release\AstraFlow.Diagnostics.1.3.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow.Testing\bin\Release\AstraFlow.Testing.1.3.0.nupkg' -Destination $localSource -Force
Copy-Item '.\src\AstraFlow\bin\Release\AstraFlow.1.3.0.nupkg' -Destination $localSource -Force

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

$sampleRoot = 'C:\tmp\AstraFlowInstallCheck-1.3.0'
New-Item -ItemType Directory -Force -Path $sampleRoot | Out-Null
$sample = Join-Path $sampleRoot ('AstraFlowInstallCheck-' + [guid]::NewGuid().ToString('N'))
dotnet new console --framework net10.0 --output $sample --no-restore
$project = Get-ChildItem -LiteralPath $sample -Filter '*.csproj' | Select-Object -First 1
dotnet add $project.FullName package AstraFlow.Mediator --version 1.3.0 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper --version 1.3.0 --no-restore
dotnet add $project.FullName package AstraFlow.Mapper.EntityFrameworkCore --version 1.3.0 --no-restore
dotnet add $project.FullName package AstraFlow.Diagnostics --version 1.3.0 --no-restore
dotnet add $project.FullName package AstraFlow.Testing --version 1.3.0 --no-restore
dotnet add $project.FullName package AstraFlow --version 1.3.0 --no-restore
dotnet restore $project.FullName --configfile $config
dotnet build $project.FullName --no-restore
```

Expected result:

- all six packages install,
- the project restores,
- the project builds.

Also create `netstandard2.0`, `net8.0`, and `net9.0` projects and install the core packages only:

```powershell
foreach ($framework in @('netstandard2.0', 'net8.0', 'net9.0')) {
    $sample = Join-Path $sampleRoot ('AstraFlowCoreInstallCheck-' + $framework + '-' + [guid]::NewGuid().ToString('N'))
    $template = if ($framework -eq 'netstandard2.0') { 'classlib' } else { 'console' }
    dotnet new $template --framework $framework --output $sample --no-restore
    $project = Get-ChildItem -LiteralPath $sample -Filter '*.csproj' | Select-Object -First 1
    dotnet add $project.FullName package AstraFlow.Mediator --version 1.3.0 --no-restore
    dotnet add $project.FullName package AstraFlow.Mapper --version 1.3.0 --no-restore
    dotnet add $project.FullName package AstraFlow.Diagnostics --version 1.3.0 --no-restore
    dotnet add $project.FullName package AstraFlow.Testing --version 1.3.0 --no-restore
    dotnet add $project.FullName package AstraFlow --version 1.3.0 --no-restore
    dotnet restore $project.FullName --configfile $config
    dotnet build $project.FullName --no-restore
}
```

## Suggested Git Commit

```powershell
git add .
git commit -m "Release AstraFlow v1.3.0 testing support"
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
git tag v1.3.0
git push origin main
git push origin v1.3.0
```

Only tag after local verification passes.

## Suggested GitHub Release Notes

```markdown
## AstraFlow v1.3.0

This release adds `AstraFlow.Testing`, a framework-neutral test-helper package for mediator, mapper, projection, diagnostics, and secure ID flows.

### Changed

- Add fake sender, fake publisher, and fake mediator helpers.
- Add request and notification recording assertions.
- Add handler, notification handler, and pipeline harnesses.
- Add mapper, projection, diagnostics, exception, mapping-rule, and secure ID assertions.
- Add deterministic `TestSecureIdCodec`.
- Keep the testing package independent of test frameworks and mocking frameworks.

### Verification

- Release build passed.
- Full test suite passed.
- All six packages packed as `1.3.0`.
- Package contents include README, CHANGELOG, LICENSE, icon, XML docs, DLLs for expected target frameworks, nuspec files, and symbol packages.
```

## Community Positioning

Use this positioning consistently:

- AstraFlow is explicit by default.
- It is not a convention-mapping package in v1.
- It is not tied to a web framework, validation framework, ORM, result type, or application-specific encryption.
- It prioritizes clear startup/runtime failures over hidden behavior.
- Future packages may add target-framework compatibility work, testing support, mediator parity features, optional convention mapping, advanced mapping parity, analyzers, CLI/templates, broader provider checks, integrations, and observability, but the explicit core remains first-class.
