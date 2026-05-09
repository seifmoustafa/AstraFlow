param(
    [Parameter(Mandatory = $true)]
    [string]$ApiKey,

    [string]$Configuration = "Release",

    [switch]$SkipPack
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
    if (-not $SkipPack) {
        & .\scripts\pack.ps1 -Configuration $Configuration
    }

    $packages = Get-ChildItem .\src -Recurse -Filter "*.nupkg"
    if ($packages.Count -eq 0) {
        throw "No .nupkg files found. Run scripts/pack.ps1 first."
    }

    foreach ($package in $packages) {
        Invoke-DotNetStep "Publish $($package.Name)" @(
            "nuget",
            "push",
            $package.FullName,
            "--api-key",
            $ApiKey,
            "--source",
            "https://api.nuget.org/v3/index.json",
            "--skip-duplicate"
        )
    }
}
finally {
    Pop-Location
}
