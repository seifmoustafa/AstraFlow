param(
    [string]$Configuration = "Release",
    [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")),
    [string]$BaselineRoot = "docs/api-baselines",
    [switch]$UpdateBaseline
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path -LiteralPath $RepositoryRoot).Path
$baselineDirectory = Join-Path $repoRoot $BaselineRoot
$failures = [System.Collections.Generic.List[string]]::new()
$expectedBaselines = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$verified = 0

function Get-OrdinalUniqueLines {
    param([string[]]$Lines)

    $unique = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
    foreach ($line in $Lines) {
        if (-not [string]::IsNullOrWhiteSpace($line)) {
            [void]$unique.Add($line.Trim())
        }
    }

    $result = [string[]]@($unique | ForEach-Object { $_ })
    [Array]::Sort($result, [System.StringComparer]::Ordinal)
    return $result
}

foreach ($projectFile in Get-ChildItem -LiteralPath (Join-Path $repoRoot "src") -Filter "*.csproj" -Recurse | Sort-Object FullName) {
    [xml]$project = Get-Content -LiteralPath $projectFile.FullName -Raw
    $generatesDocumentation = $project.Project.PropertyGroup.GenerateDocumentationFile |
        Where-Object { $null -ne $_ } |
        Select-Object -Last 1
    if ($generatesDocumentation -eq "false") {
        Write-Host "Skipping $($project.Project.PropertyGroup.PackageId): project does not expose a documented library API."
        continue
    }
    $frameworks = @(
        $project.Project.PropertyGroup.TargetFrameworks |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
            Select-Object -First 1
    )
    if ($frameworks.Count -eq 0) {
        $frameworks = @(
            $project.Project.PropertyGroup.TargetFramework |
                Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
                Select-Object -First 1
        )
    }
    if ($frameworks.Count -ne 1) {
        $failures.Add("Could not determine target frameworks for $($projectFile.FullName).")
        continue
    }

    foreach ($framework in ($frameworks[0] -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ })) {
        $assemblyName = $project.Project.PropertyGroup.AssemblyName | Where-Object { $_ } | Select-Object -First 1
        if ([string]::IsNullOrWhiteSpace($assemblyName)) {
            $assemblyName = [System.IO.Path]::GetFileNameWithoutExtension($projectFile.Name)
        }

        $xmlPath = Join-Path $projectFile.DirectoryName "bin/$Configuration/$framework/$assemblyName.xml"
        $relativeProject = [System.IO.Path]::GetRelativePath($repoRoot, $projectFile.DirectoryName).Replace('\', '/')
        $baselinePath = Join-Path $repoRoot "$BaselineRoot/$($projectFile.BaseName)/$framework.txt"
        [void]$expectedBaselines.Add([System.IO.Path]::GetFullPath($baselinePath))
        if (-not (Test-Path -LiteralPath $xmlPath)) {
            $failures.Add("Built XML documentation is missing for $relativeProject ($framework): $xmlPath")
            continue
        }

        [xml]$xml = Get-Content -LiteralPath $xmlPath -Raw
        $currentMembers = @(Get-OrdinalUniqueLines -Lines @(
            $xml.doc.members.member |
                ForEach-Object { $_.name }
        ))
        $baselineRelative = [System.IO.Path]::GetRelativePath($repoRoot, $baselinePath).Replace('\', '/')

        if ($UpdateBaseline) {
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $baselinePath) | Out-Null
            $header = "# Public XML documentation member IDs for $assemblyName ($framework)."
            Set-Content -LiteralPath $baselinePath -Value @($header, $currentMembers) -Encoding utf8NoBOM
            $verified++
            continue
        }

        if (-not (Test-Path -LiteralPath $baselinePath)) {
            $failures.Add("API baseline is missing: $baselineRelative. Run scripts/update-public-api-baselines.ps1 and review the diff.")
            continue
        }

        $baselineMembers = @(Get-OrdinalUniqueLines -Lines @(
            Get-Content -LiteralPath $baselinePath |
                Where-Object { $_ -and -not $_.StartsWith('#') }
        ))
        $baselineSet = [System.Collections.Generic.HashSet[string]]::new([string[]]$baselineMembers, [System.StringComparer]::Ordinal)
        $currentSet = [System.Collections.Generic.HashSet[string]]::new([string[]]$currentMembers, [System.StringComparer]::Ordinal)
        $added = @($currentMembers | Where-Object { -not $baselineSet.Contains($_) })
        $removed = @($baselineMembers | Where-Object { -not $currentSet.Contains($_) })
        if ($added.Count -gt 0 -or $removed.Count -gt 0) {
            $changeLines = @()
            $changeLines += $added | ForEach-Object { "+ $_" }
            $changeLines += $removed | ForEach-Object { "- $_" }
            $failures.Add("Public API baseline differs for $relativeProject ($framework) in ${baselineRelative}:`n  $($changeLines -join "`n  ")`nReview the API change, then run scripts/update-public-api-baselines.ps1 if it is intentional.")
            continue
        }

        $verified++
    }
}

if (Test-Path -LiteralPath $baselineDirectory) {
    foreach ($baselineFile in Get-ChildItem -LiteralPath $baselineDirectory -Filter "*.txt" -Recurse | Sort-Object FullName) {
        if (-not $expectedBaselines.Contains([System.IO.Path]::GetFullPath($baselineFile.FullName))) {
            $relativePath = [System.IO.Path]::GetRelativePath($repoRoot, $baselineFile.FullName).Replace('\', '/')
            if ($UpdateBaseline) {
                Remove-Item -LiteralPath $baselineFile.FullName -Force
                Write-Host "Removed stale API baseline $relativePath. Review the target-framework removal."
            }
            else {
                $failures.Add("Stale API baseline has no matching library target: $relativePath")
            }
        }
    }
}

if ($failures.Count -gt 0) {
    throw "Public API baseline verification failed:`n$($failures -join "`n`n")"
}

if ($UpdateBaseline) {
    Write-Host "Updated $verified target-specific public API baselines. Review the complete diff before committing."
}
else {
    Write-Host "Public API baseline verification passed for $verified package/target combinations."
}
