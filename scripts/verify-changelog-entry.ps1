$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
[xml]$props = Get-Content -LiteralPath (Join-Path $repositoryRoot "Directory.Build.props")
$version = [string]$props.Project.PropertyGroup.Version
if ([string]::IsNullOrWhiteSpace($version)) {
    throw "Could not determine the package version from Directory.Build.props."
}

$changelogPath = Join-Path $repositoryRoot "CHANGELOG.md"
$changelog = Get-Content -LiteralPath $changelogPath -Raw
$escapedVersion = [regex]::Escape($version)
$match = [regex]::Match($changelog, "(?ms)^##\s+$escapedVersion(?:\s|\().*?(?=^##\s|\z)")
if (-not $match.Success) {
    throw "CHANGELOG.md must have a top-level section for package version $version."
}

$entry = $match.Value -replace "(?m)^##\s+[^\r\n]+", ""
if ([string]::IsNullOrWhiteSpace($entry.Trim())) {
    throw "CHANGELOG.md section for package version $version is empty."
}

Write-Host "CHANGELOG.md contains a non-empty entry for package version $version."
