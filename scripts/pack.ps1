param(
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $repoRoot

function Invoke-DotNetStep {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    Write-Host "==> $Name"
    & dotnet @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE."
    }
}

try {
    Invoke-DotNetStep "Restore" @("restore", ".\AstraFlow.slnx", "--configfile", ".\NuGet.Config", "--disable-parallel")
    Invoke-DotNetStep "Build" @("build", ".\AstraFlow.slnx", "-c", $Configuration, "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Test" @("test", ".\AstraFlow.slnx", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")

    Invoke-DotNetStep "Pack AstraFlow.Contracts" @("pack", ".\src\AstraFlow.Contracts\AstraFlow.Contracts.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.Mediator" @("pack", ".\src\AstraFlow.Mediator\AstraFlow.Mediator.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.Mapper" @("pack", ".\src\AstraFlow.Mapper\AstraFlow.Mapper.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.Mapper.Conventions" @("pack", ".\src\AstraFlow.Mapper.Conventions\AstraFlow.Mapper.Conventions.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.Mapper.EntityFrameworkCore" @("pack", ".\src\AstraFlow.Mapper.EntityFrameworkCore\AstraFlow.Mapper.EntityFrameworkCore.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.Diagnostics" @("pack", ".\src\AstraFlow.Diagnostics\AstraFlow.Diagnostics.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.AspNetCore" @("pack", ".\src\AstraFlow.AspNetCore\AstraFlow.AspNetCore.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.FluentValidation" @("pack", ".\src\AstraFlow.FluentValidation\AstraFlow.FluentValidation.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.OpenTelemetry" @("pack", ".\src\AstraFlow.OpenTelemetry\AstraFlow.OpenTelemetry.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.Testing" @("pack", ".\src\AstraFlow.Testing\AstraFlow.Testing.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.Analyzers" @("pack", ".\src\AstraFlow.Analyzers\AstraFlow.Analyzers.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.Generators" @("pack", ".\src\AstraFlow.Generators\AstraFlow.Generators.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow.Cli" @("pack", ".\src\AstraFlow.Cli\AstraFlow.Cli.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Pack AstraFlow" @("pack", ".\src\AstraFlow\AstraFlow.csproj", "-c", $Configuration, "--no-build", "--no-restore", "/m:1", "/p:UseSharedCompilation=false")

    Write-Host "==> Verify package install"
    & .\scripts\verify-package-install.ps1 -Configuration $Configuration
    if ($LASTEXITCODE -ne 0) {
        throw "Verify package install failed with exit code $LASTEXITCODE."
    }

    Write-Host "Packages created:"
    [xml]$props = Get-Content -LiteralPath ".\Directory.Build.props"
    $version = $props.Project.PropertyGroup.Version
    Get-ChildItem .\src -Recurse -Filter "*.$version.nupkg" | Select-Object -ExpandProperty FullName
}
finally {
    Pop-Location
}
