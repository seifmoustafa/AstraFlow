param(
    [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path -LiteralPath $RepositoryRoot).Path
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

$requiredCategories = @("Breaking Changes", "Added", "Changed", "Fixed", "Deprecated", "Removed", "Security")
foreach ($category in $requiredCategories) {
    $escapedCategory = [regex]::Escape($category)
    if (-not [regex]::IsMatch($entry, "(?m)^###\s+$escapedCategory\s*$")) {
        throw "CHANGELOG.md section for $version must include a '### $category' category. Use 'None.' when there are no entries."
    }

    $categoryMatch = [regex]::Match($entry, "(?ms)^###\s+$escapedCategory\s*\r?\n(?<content>.*?)(?=^###\s|\z)")
    if (-not $categoryMatch.Success -or [string]::IsNullOrWhiteSpace($categoryMatch.Groups["content"].Value.Trim())) {
        throw "CHANGELOG.md category '$category' for $version must contain an entry or 'None.'."
    }
}

Write-Host "CHANGELOG.md contains all required release categories for version $version."
