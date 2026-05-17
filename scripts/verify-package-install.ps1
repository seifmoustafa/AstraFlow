param(
    [string]$Configuration = "Release",
    [string]$Version,
    [string]$WorkRoot = (Join-Path ([System.IO.Path]::GetTempPath()) "AstraFlowInstallCheck"),
    [switch]$NoRestore
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

if ([string]::IsNullOrWhiteSpace($Version)) {
    [xml]$props = Get-Content -LiteralPath (Join-Path $repoRoot "Directory.Build.props")
    $Version = $props.Project.PropertyGroup.Version
}

if ([string]::IsNullOrWhiteSpace($Version)) {
    throw "Could not determine package version from Directory.Build.props."
}

$localSource = Join-Path $repoRoot ".dotnet-cli-home\local-packages\$Version"
$checkRoot = Join-Path $WorkRoot $Version
$restorePackages = Join-Path $checkRoot "packages"
$config = Join-Path $checkRoot "nuget.config"

function Invoke-DotNetStep {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    Write-Host "==> $Name"
    & dotnet @Arguments | ForEach-Object { Write-Host $_ }
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE."
    }
}

function Copy-Package {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageId
    )

    $packagePath = Join-Path $repoRoot "src\$PackageId\bin\$Configuration\$PackageId.$Version.nupkg"
    if (-not (Test-Path -LiteralPath $packagePath)) {
        throw "Expected package does not exist: $packagePath"
    }

    Copy-Item -LiteralPath $packagePath -Destination $localSource -Force
}

function Initialize-LocalSource {
    if (Test-Path -LiteralPath $checkRoot) {
        Remove-Item -LiteralPath $checkRoot -Recurse -Force
    }

    if (Test-Path -LiteralPath $localSource) {
        Remove-Item -LiteralPath $localSource -Recurse -Force
    }

    New-Item -ItemType Directory -Force -Path $localSource | Out-Null
    New-Item -ItemType Directory -Force -Path $checkRoot | Out-Null
    New-Item -ItemType Directory -Force -Path $restorePackages | Out-Null

    Copy-Package "AstraFlow.Contracts"
    Copy-Package "AstraFlow.Mediator"
    Copy-Package "AstraFlow.Mapper"
    Copy-Package "AstraFlow.Mapper.EntityFrameworkCore"
    Copy-Package "AstraFlow.Diagnostics"
    Copy-Package "AstraFlow.Testing"
    Copy-Package "AstraFlow"

    $lines = @(
        '<?xml version="1.0" encoding="utf-8"?>',
        '<configuration>',
        '  <packageSources>',
        '    <clear />',
        "    <add key=""local"" value=""$localSource"" />",
        '    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />',
        '  </packageSources>',
        '</configuration>'
    )

    Set-Content -LiteralPath $config -Value $lines -Encoding UTF8
}

function New-ConsumerProject {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Framework,

        [Parameter(Mandatory = $true)]
        [string]$Template
    )

    $sample = Join-Path $checkRoot ("AstraFlowInstallCheck-$Framework-" + [guid]::NewGuid().ToString("N"))
    Invoke-DotNetStep "Create $Framework $Template sample" @("new", $Template, "--framework", $Framework, "--output", $sample, "--no-restore")

    $project = Get-ChildItem -LiteralPath $sample -Filter "*.csproj" | Select-Object -First 1
    if ($null -eq $project) {
        throw "Could not find generated project in $sample."
    }

    return $project.FullName
}

function Add-AstraFlowPackage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Project,

        [Parameter(Mandatory = $true)]
        [string]$PackageId
    )

    Invoke-DotNetStep "Add $PackageId to $(Split-Path -Leaf $Project)" @("add", $Project, "package", $PackageId, "--version", $Version, "--no-restore")
}

function Test-CoreConsumer {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Framework,

        [Parameter(Mandatory = $true)]
        [string]$Template
    )

    $project = New-ConsumerProject -Framework $Framework -Template $Template

    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Contracts"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mediator"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mapper"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Diagnostics"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Testing"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow"

    Invoke-DotNetStep "Restore $Framework core consumer" @("restore", $project, "--configfile", $config, "--disable-parallel", "-v:minimal", "/p:RestorePackagesPath=$restorePackages")
    Invoke-DotNetStep "Build $Framework core consumer" @("build", $project, "--no-restore", "-v:minimal", "/m:1", "/p:UseSharedCompilation=false")
}

function Test-AllConsumer {
    $project = New-ConsumerProject -Framework "net10.0" -Template "console"

    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Contracts"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mediator"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mapper"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Diagnostics"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Testing"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mapper.EntityFrameworkCore"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow"

    Invoke-DotNetStep "Restore net10.0 all-package consumer" @("restore", $project, "--configfile", $config, "--disable-parallel", "-v:minimal", "/p:RestorePackagesPath=$restorePackages")
    Invoke-DotNetStep "Build net10.0 all-package consumer" @("build", $project, "--no-restore", "-v:minimal", "/m:1", "/p:UseSharedCompilation=false")
}

if (-not $NoRestore) {
    Initialize-LocalSource
}

Test-CoreConsumer -Framework "netstandard2.0" -Template "classlib"
Test-CoreConsumer -Framework "net8.0" -Template "console"
Test-CoreConsumer -Framework "net9.0" -Template "console"
Test-AllConsumer

Write-Host "AstraFlow package install verification passed for version $Version."
