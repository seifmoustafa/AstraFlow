param(
    [string]$Configuration = "Release",
    [string]$PreviousVersion = "1.13.1",
    [string]$CurrentVersion,
    [string]$WorkRoot = (Join-Path ([System.IO.Path]::GetTempPath()) "AstraFlowApiCompatibility"),
    [switch]$AllowMissingPreviousPackages
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

if ([string]::IsNullOrWhiteSpace($CurrentVersion)) {
    [xml]$props = Get-Content -LiteralPath (Join-Path $repoRoot "Directory.Build.props")
    $CurrentVersion = $props.Project.PropertyGroup.Version
}

if ([string]::IsNullOrWhiteSpace($CurrentVersion)) {
    throw "Could not determine current package version from Directory.Build.props."
}

$packages = @(
    "AstraFlow.Contracts",
    "AstraFlow.Mediator",
    "AstraFlow.Mapper",
    "AstraFlow.Security",
    "AstraFlow.Mapper.Conventions",
    "AstraFlow.Mapper.EntityFrameworkCore",
    "AstraFlow.Diagnostics",
    "AstraFlow.AspNetCore",
    "AstraFlow.FluentValidation",
    "AstraFlow.OpenTelemetry",
    "AstraFlow.Testing",
    "AstraFlow.Assertions",
    "AstraFlow.Analyzers",
    "AstraFlow.Generators",
    "AstraFlow"
)

$newInCurrentVersionPackages = @(
    "AstraFlow.Assertions"
)

function Expand-NuGetPackage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackagePath,

        [Parameter(Mandatory = $true)]
        [string]$Destination
    )

    if (Test-Path -LiteralPath $Destination) {
        Remove-Item -LiteralPath $Destination -Recurse -Force
    }

    $destinationRoot = [System.IO.Path]::GetFullPath($Destination)
    New-Item -ItemType Directory -Force -Path $destinationRoot | Out-Null
    $archive = [System.IO.Compression.ZipFile]::OpenRead($PackagePath)
    try {
        foreach ($entry in $archive.Entries | Where-Object {
            $_.FullName -match '^(lib|analyzers|tools)/.+\.xml$' -and
            $_.FullName -notmatch '\.deps\.json$'
        }) {
            $relativePath = $entry.FullName.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $targetPath = [System.IO.Path]::GetFullPath((Join-Path $destinationRoot $relativePath))
            if (-not $targetPath.StartsWith($destinationRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
                throw "Package entry resolves outside the extraction directory: $($entry.FullName)"
            }

            $targetDirectory = [System.IO.Path]::GetDirectoryName($targetPath)
            New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null
            $entryStream = $entry.Open()
            $fileStream = [System.IO.File]::Open($targetPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
            try {
                $entryStream.CopyTo($fileStream)
            }
            finally {
                $fileStream.Dispose()
                $entryStream.Dispose()
            }
        }
    }
    finally {
        $archive.Dispose()
    }
}

function Get-PackageXmlDocs {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageDirectory
    )

    Get-ChildItem -LiteralPath $PackageDirectory -Recurse -Filter "*.xml" |
        Where-Object {
            $_.FullName -match "\\(lib|analyzers|tools)\\" -and
            $_.Name -notmatch "\.deps\.json$"
        } |
        Sort-Object FullName
}

function Get-PublicMemberIds {
    param(
        [Parameter(Mandatory = $true)]
        [System.IO.FileInfo[]]$XmlDocs
    )

    $members = New-Object "System.Collections.Generic.HashSet[string]"

    foreach ($xmlDoc in $XmlDocs) {
        [xml]$xml = Get-Content -LiteralPath $xmlDoc.FullName -Raw
        foreach ($member in $xml.doc.members.member) {
            if ($null -ne $member.name -and -not [string]::IsNullOrWhiteSpace($member.name)) {
                [void]$members.Add($member.name.Trim())
            }
        }
    }

    return ,$members
}

$runRoot = Join-Path $WorkRoot "$PreviousVersion-to-$CurrentVersion"
if (Test-Path -LiteralPath $runRoot) {
    Remove-Item -LiteralPath $runRoot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $runRoot | Out-Null

$failures = New-Object "System.Collections.Generic.List[string]"
$verifiedPackages = New-Object "System.Collections.Generic.List[string]"

foreach ($packageId in $packages) {
    $currentPackage = Join-Path $repoRoot "src\$packageId\bin\$Configuration\$packageId.$CurrentVersion.nupkg"
    if (-not (Test-Path -LiteralPath $currentPackage)) {
        throw "Current package is missing. Pack first: $currentPackage"
    }

    $previousPackage = Join-Path $runRoot "$packageId.$PreviousVersion.nupkg"
    $cachedPreviousPackage = Join-Path $env:USERPROFILE ".nuget\packages\$($packageId.ToLowerInvariant())\$PreviousVersion\$($packageId.ToLowerInvariant()).$PreviousVersion.nupkg"

    if (Test-Path -LiteralPath $cachedPreviousPackage) {
        Copy-Item -LiteralPath $cachedPreviousPackage -Destination $previousPackage
        Write-Host "Using cached previous package: $packageId $PreviousVersion"
    } else {
        $downloadUri = "https://www.nuget.org/api/v2/package/$packageId/$PreviousVersion"

        try {
            Invoke-WebRequest -Uri $downloadUri -OutFile $previousPackage -UseBasicParsing
        }
        catch {
            if ($AllowMissingPreviousPackages -or $newInCurrentVersionPackages -contains $packageId) {
                Write-Warning "Skipping $packageId because previous package $PreviousVersion could not be downloaded or found in the local NuGet cache."
                continue
            }

            throw "Could not download $packageId $PreviousVersion from NuGet or find it in the local NuGet cache. $($_.Exception.Message)"
        }
    }

    $previousExtract = Join-Path $runRoot "$packageId.previous"
    $currentExtract = Join-Path $runRoot "$packageId.current"
    Expand-NuGetPackage -PackagePath $previousPackage -Destination $previousExtract
    Expand-NuGetPackage -PackagePath $currentPackage -Destination $currentExtract

    $previousDocs = @(Get-PackageXmlDocs -PackageDirectory $previousExtract)
    $currentDocs = @(Get-PackageXmlDocs -PackageDirectory $currentExtract)

    if ($previousDocs.Count -eq 0) {
        Write-Warning "Skipping $packageId because $PreviousVersion has no XML docs to compare."
        continue
    }

    if ($currentDocs.Count -eq 0) {
        $failures.Add("$packageId has no XML docs in $CurrentVersion.")
        continue
    }

    $previousMembers = Get-PublicMemberIds -XmlDocs $previousDocs
    $currentMembers = Get-PublicMemberIds -XmlDocs $currentDocs
    $missingMembers = @($previousMembers | Where-Object { -not $currentMembers.Contains($_) } | Sort-Object)

    if ($missingMembers.Count -gt 0) {
        $preview = ($missingMembers | Select-Object -First 25) -join "`n  "
        $failures.Add("$packageId removed public XML member IDs from $PreviousVersion to ${CurrentVersion}:`n  $preview")
    }

    $verifiedPackages.Add($packageId)
}

if ($failures.Count -gt 0) {
    throw "Public API compatibility check failed:`n$($failures -join "`n`n")"
}

Write-Host "AstraFlow public API compatibility check passed for $($verifiedPackages.Count) package APIs from $PreviousVersion to ${CurrentVersion}: $($verifiedPackages -join ', ')."
