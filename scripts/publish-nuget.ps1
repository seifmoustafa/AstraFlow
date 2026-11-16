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
    Write-Host "==> Verify release changelog"
    & .\scripts\verify-changelog-entry.ps1

    if (-not $SkipPack) {
        & .\scripts\pack.ps1 -Configuration $Configuration
    }

    [xml]$props = Get-Content -LiteralPath ".\Directory.Build.props"
    $version = [string]$props.Project.PropertyGroup.Version
    if ([string]::IsNullOrWhiteSpace($version)) {
        throw "Could not determine the package version from Directory.Build.props."
    }

    $packages = Get-ChildItem .\src -Recurse -Filter "*.$version.nupkg"
    if ($packages.Count -eq 0) {
        throw "No .nupkg files found for version $version. Run scripts/pack.ps1 first."
    }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $expectedChangelog = [System.IO.File]::ReadAllText((Join-Path $repoRoot.Path "CHANGELOG.md")) -replace "\r\n?", "`n"

    foreach ($package in $packages) {
        $archive = [System.IO.Compression.ZipFile]::OpenRead($package.FullName)
        try {
            $changelogEntry = $archive.GetEntry("CHANGELOG.md")
            if ($null -eq $changelogEntry) {
                throw "$($package.Name) does not contain CHANGELOG.md."
            }

            $reader = [System.IO.StreamReader]::new($changelogEntry.Open())
            try {
                $packagedChangelog = $reader.ReadToEnd() -replace "\r\n?", "`n"
            }
            finally {
                $reader.Dispose()
            }

            if ($packagedChangelog -cne $expectedChangelog) {
                throw "$($package.Name) contains a stale CHANGELOG.md. Re-run scripts/pack.ps1 before publishing."
            }
        }
        finally {
            $archive.Dispose()
        }

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
