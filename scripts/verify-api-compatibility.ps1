param(
    [string]$Configuration = "Release",
    [string]$PreviousVersion = "1.13.0",
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
    "AstraFlow.Mapper.Conventions",
    "AstraFlow.Mapper.EntityFrameworkCore",
    "AstraFlow.Diagnostics",
    "AstraFlow.AspNetCore",
    "AstraFlow.FluentValidation",
    "AstraFlow.OpenTelemetry",
    "AstraFlow.Testing",
    "AstraFlow.Analyzers",
    "AstraFlow.Generators",
    "AstraFlow.Cli",
    "AstraFlow"
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

    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    Expand-Archive -LiteralPath $PackagePath -DestinationPath $Destination -Force
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

foreach ($packageId in $packages) {
    $currentPackage = Join-Path $repoRoot "src\$packageId\bin\$Configuration\$packageId.$CurrentVersion.nupkg"
    if (-not (Test-Path -LiteralPath $currentPackage)) {
        throw "Current package is missing. Pack first: $currentPackage"
    }

    $previousPackage = Join-Path $runRoot "$packageId.$PreviousVersion.nupkg"
    $downloadUri = "https://www.nuget.org/api/v2/package/$packageId/$PreviousVersion"

    try {
        Invoke-WebRequest -Uri $downloadUri -OutFile $previousPackage -UseBasicParsing
    }
    catch {
        if ($AllowMissingPreviousPackages) {
            Write-Warning "Skipping $packageId because previous package $PreviousVersion could not be downloaded."
            continue
        }

        throw "Could not download $packageId $PreviousVersion from NuGet. $($_.Exception.Message)"
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
}

if ($failures.Count -gt 0) {
    throw "Public API compatibility check failed:`n$($failures -join "`n`n")"
}

Write-Host "AstraFlow public API compatibility check passed from $PreviousVersion to $CurrentVersion."
