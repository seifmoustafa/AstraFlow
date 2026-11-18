param(
    [string]$Configuration = "Release",
    [string]$Version
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

[xml]$props = Get-Content -LiteralPath (Join-Path $repoRoot "Directory.Build.props")
$expectedVersion = [string]$props.Project.PropertyGroup.Version
if ([string]::IsNullOrWhiteSpace($expectedVersion)) {
    throw "Could not determine package version from Directory.Build.props."
}
if ([string]::IsNullOrWhiteSpace($Version)) {
    $Version = $expectedVersion
}
if ($Version -ne $expectedVersion) {
    throw "Requested package version $Version does not match Directory.Build.props version $expectedVersion."
}

$packageIds = @(
    "AstraFlow",
    "AstraFlow.Analyzers",
    "AstraFlow.AspNetCore",
    "AstraFlow.Assertions",
    "AstraFlow.Cli",
    "AstraFlow.Contracts",
    "AstraFlow.Diagnostics",
    "AstraFlow.FluentValidation",
    "AstraFlow.Generators",
    "AstraFlow.Mapper",
    "AstraFlow.Mapper.Conventions",
    "AstraFlow.Mapper.EntityFrameworkCore",
    "AstraFlow.Mediator",
    "AstraFlow.OpenTelemetry",
    "AstraFlow.Security",
    "AstraFlow.Testing"
)

# These older pins are intentional examples in migration history, not current install guidance.
$historicalPins = @{
    "docs/migration-cookbook.md" = @("1.13.1")
    "docs/version-upgrade-guide.md" = @("2.3.0")
}

function Assert-FamilyPin {
    param(
        [Parameter(Mandatory = $true)][string]$PackageId,
        [Parameter(Mandatory = $true)][string]$PinnedVersion,
        [Parameter(Mandatory = $true)][string]$DocumentPath
    )

    if ($PinnedVersion -eq $expectedVersion) {
        return
    }

    if ($historicalPins.ContainsKey($DocumentPath) -and $historicalPins[$DocumentPath] -contains $PinnedVersion) {
        return
    }

    throw "$DocumentPath in package content pins $PackageId to $PinnedVersion; expected $expectedVersion or a versionless PackageReference."
}

$packageCount = 0
$documentCount = 0
foreach ($packageId in $packageIds) {
    $packagePath = Join-Path $repoRoot "src/$packageId/bin/$Configuration/$packageId.$Version.nupkg"
    if (-not (Test-Path -LiteralPath $packagePath)) {
        throw "Expected packed family package does not exist: $packagePath"
    }

    $archive = [System.IO.Compression.ZipFile]::OpenRead($packagePath)
    try {
        $documents = @($archive.Entries | Where-Object {
            $_.FullName -match '^(docs/[^/]+\.md|README\.md|CHANGELOG\.md)$'
        })
        $docEntries = @($documents | Where-Object { $_.FullName -like "docs/*.md" })
        if ($docEntries.Count -eq 0) {
            throw "$packageId.$Version.nupkg contains no bundled docs/*.md files."
        }

        foreach ($entry in $documents) {
            $stream = $entry.Open()
            try {
                $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::UTF8, $true)
                try {
                    $content = $reader.ReadToEnd()
                }
                finally {
                    $reader.Dispose()
                }
            }
            finally {
                $stream.Dispose()
            }

            $documentPath = $entry.FullName
            $dotnetPackagePins = [regex]::Matches(
                $content,
                '(?im)\bdotnet\s+add\s+package\s+(?<id>AstraFlow(?:\.[A-Za-z0-9]+)*)\s+--version\s+(?<version>[^\s<]+)')
            foreach ($pin in $dotnetPackagePins) {
                Assert-FamilyPin -PackageId $pin.Groups["id"].Value -PinnedVersion $pin.Groups["version"].Value -DocumentPath $documentPath
            }

            $dotnetToolPins = [regex]::Matches(
                $content,
                '(?im)\bdotnet\s+tool\s+install[^\r\n]*?\b(?<id>AstraFlow\.Cli)\s+--version\s+(?<version>[^\s<]+)')
            foreach ($pin in $dotnetToolPins) {
                Assert-FamilyPin -PackageId $pin.Groups["id"].Value -PinnedVersion $pin.Groups["version"].Value -DocumentPath $documentPath
            }

            $packageTags = [regex]::Matches($content, '(?is)<(?:PackageReference|PackageVersion)\b[^>]*>')
            foreach ($tag in $packageTags) {
                $includeMatch = [regex]::Match($tag.Value, '\bInclude\s*=\s*"(?<id>AstraFlow(?:\.[A-Za-z0-9]+)*)"')
                if (-not $includeMatch.Success) {
                    continue
                }

                $kind = ([regex]::Match($tag.Value, '^<(?<kind>PackageReference|PackageVersion)\b')).Groups["kind"].Value
                $versionMatch = [regex]::Match($tag.Value, '\bVersion\s*=\s*"(?<version>[^"]+)"')
                if (-not $versionMatch.Success) {
                    if ($kind -eq "PackageVersion") {
                        throw "$documentPath in $packageId.$Version.nupkg has a PackageVersion entry without a version."
                    }
                    continue
                }

                Assert-FamilyPin -PackageId $includeMatch.Groups["id"].Value -PinnedVersion $versionMatch.Groups["version"].Value -DocumentPath $documentPath
            }
            $documentCount++
        }
    }
    finally {
        $archive.Dispose()
    }

    $packageCount++
    Write-Host "Verified documentation pins in $packageId.$Version.nupkg"
}

Write-Host "Packaged family documentation version pins passed for $packageCount packages and $documentCount Markdown files at version $Version."
