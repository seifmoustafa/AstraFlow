$ErrorActionPreference = "Stop"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) "AstraFlowApiBaselineTest-$([guid]::NewGuid().ToString('N'))"
$verifier = Join-Path (Split-Path -Parent $PSScriptRoot) "verify-public-api-baselines.ps1"
$obsoleteVerifier = Join-Path (Split-Path -Parent $PSScriptRoot) "verify-obsolete-guidance.ps1"
$changelogVerifier = Join-Path (Split-Path -Parent $PSScriptRoot) "verify-changelog-entry.ps1"

try {
    $projectDirectory = Join-Path $tempRoot "src/Fixture"
    $xmlDirectory = Join-Path $projectDirectory "bin/Release/net10.0"
    $baselineDirectory = Join-Path $tempRoot "docs/api-baselines/Fixture"
    New-Item -ItemType Directory -Force -Path $xmlDirectory, $baselineDirectory | Out-Null
    Set-Content -LiteralPath (Join-Path $projectDirectory "Fixture.csproj") -Value '<Project><PropertyGroup><TargetFramework>net10.0</TargetFramework><AssemblyName>Fixture</AssemblyName></PropertyGroup></Project>'
    Set-Content -LiteralPath (Join-Path $xmlDirectory "Fixture.xml") -Value '<doc><members><member name="T:Fixture.Type" /><member name="M:Fixture.Type.Run" /></members></doc>'
    Set-Content -LiteralPath (Join-Path $baselineDirectory "net10.0.txt") -Value @("# Fixture API baseline", "M:Fixture.Type.Run", "T:Fixture.Type")

    & $verifier -RepositoryRoot $tempRoot

    Set-Content -LiteralPath (Join-Path $baselineDirectory "net8.0.txt") -Value @("# Stale baseline")
    $detectedStaleBaseline = $false
    try { & $verifier -RepositoryRoot $tempRoot } catch { $detectedStaleBaseline = $_.Exception.Message -match 'Stale API baseline' }
    if (-not $detectedStaleBaseline) { throw "The verifier did not reject a stale target baseline." }
    Remove-Item -LiteralPath (Join-Path $baselineDirectory "net8.0.txt") -Force

    Set-Content -LiteralPath (Join-Path $xmlDirectory "Fixture.xml") -Value '<doc><members><member name="T:Fixture.Type" /><member name="M:Fixture.Type.Run" /><member name="M:Fixture.Type.Added" /></members></doc>'
    $detectedChange = $false
    try { & $verifier -RepositoryRoot $tempRoot } catch { $detectedChange = $_.Exception.Message -match 'M:Fixture.Type.Added' }
    if (-not $detectedChange) { throw "The verifier did not fail with the added public API ID." }

    Set-Content -LiteralPath (Join-Path $xmlDirectory "Fixture.xml") -Value '<doc><members><member name="T:Fixture.Type" /></members></doc>'
    $detectedRemoval = $false
    try { & $verifier -RepositoryRoot $tempRoot } catch { $detectedRemoval = $_.Exception.Message -match '- M:Fixture.Type.Run' }
    if (-not $detectedRemoval) { throw "The verifier did not fail with the removed public API ID." }

    Set-Content -LiteralPath (Join-Path $xmlDirectory "Fixture.xml") -Value '<doc><members><member name="T:Fixture.Type" /><member name="M:Fixture.Type.Run" /><member name="M:Fixture.Type.Added" /></members></doc>'
    & $verifier -RepositoryRoot $tempRoot -UpdateBaseline
    & $verifier -RepositoryRoot $tempRoot

    $sourceDirectory = Join-Path $tempRoot "source"
    New-Item -ItemType Directory -Force -Path $sourceDirectory | Out-Null
    Set-Content -LiteralPath (Join-Path $sourceDirectory "Good.cs") -Value '[Obsolete("Use NewMethod instead.")] public void OldMethod() { }'
    & $obsoleteVerifier -SourceRoot $sourceDirectory
    Set-Content -LiteralPath (Join-Path $sourceDirectory "Bad.cs") -Value '[Obsolete("This method is obsolete.")] public void OldMethod() { }'
    $detectedMissingGuidance = $false
    try { & $obsoleteVerifier -SourceRoot $sourceDirectory } catch { $detectedMissingGuidance = $true }
    if (-not $detectedMissingGuidance) { throw "The obsolete guidance verifier did not reject an attribute without replacement guidance." }

    Set-Content -LiteralPath (Join-Path $tempRoot "Directory.Build.props") -Value '<Project><PropertyGroup><Version>3.0.0</Version></PropertyGroup></Project>'
    $changelogPath = Join-Path $tempRoot "CHANGELOG.md"
    Set-Content -LiteralPath $changelogPath -Value @'
## 3.0.0

### Breaking Changes
- None.

### Added
- None.

### Changed
- None.

### Fixed
- None.

### Deprecated
- None.

### Removed
- None.

### Security
- None.
'@
    & $changelogVerifier -RepositoryRoot $tempRoot
    Set-Content -LiteralPath $changelogPath -Value @'
## 3.0.0

### Breaking Changes
- None.
'@
    $detectedMissingCategories = $false
    try { & $changelogVerifier -RepositoryRoot $tempRoot } catch { $detectedMissingCategories = $true }
    if (-not $detectedMissingCategories) { throw "The changelog verifier did not reject missing categories." }

    Write-Host "Public API baseline, obsolete guidance, and changelog script tests passed."
}
finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
}
