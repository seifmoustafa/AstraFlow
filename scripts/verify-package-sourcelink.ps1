param(
    [string]$Configuration = "Release",
    [string]$PackageRoot,
    [switch]$VerifyRemoteSources
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$propsPath = Join-Path $repositoryRoot "Directory.Build.props"
[xml]$props = Get-Content -LiteralPath $propsPath
$version = [string]$props.Project.PropertyGroup.Version
if ([string]::IsNullOrWhiteSpace($version)) {
    throw "Could not read package Version from '$propsPath'."
}
$packageRootPath = if ([string]::IsNullOrWhiteSpace($PackageRoot)) {
    Join-Path $repositoryRoot "src"
} else {
    (Resolve-Path -LiteralPath $PackageRoot).Path
}
$packages = if ([string]::IsNullOrWhiteSpace($PackageRoot)) {
    @(Get-ChildItem -Path $packageRootPath -Directory | ForEach-Object {
        Get-ChildItem -Path (Join-Path $_.FullName "bin/$Configuration") -File -Filter "*.$version.snupkg" -ErrorAction SilentlyContinue
    } | Sort-Object FullName)
} else {
    @(Get-ChildItem -Path $packageRootPath -Recurse -File -Filter "*.$version.snupkg" | Sort-Object FullName)
}

if ($packages.Count -eq 0) {
    throw "No symbol packages were found under src/**/bin/$Configuration."
}

$manifest = Join-Path $repositoryRoot ".config/dotnet-tools.json"
if (-not (Test-Path -LiteralPath $manifest -PathType Leaf)) {
    throw "The local .NET tool manifest is missing: $manifest"
}

& dotnet tool restore --tool-manifest $manifest
if ($LASTEXITCODE -ne 0) {
    throw "Restoring the SourceLink verification tool failed with exit code $LASTEXITCODE."
}

$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("astraflow-sourcelink-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $temporaryRoot | Out-Null

try {
    foreach ($package in $packages) {
        $extractionDirectory = Join-Path $temporaryRoot ([System.IO.Path]::GetFileNameWithoutExtension($package.Name))
        [System.IO.Compression.ZipFile]::ExtractToDirectory($package.FullName, $extractionDirectory)
        $pdbFiles = @(Get-ChildItem -Path $extractionDirectory -Recurse -File -Filter "*.pdb")
        if ($pdbFiles.Count -eq 0) {
            throw "Symbol package '$($package.Name)' contains no PDB files."
        }

        foreach ($pdb in $pdbFiles) {
            $command = if ($VerifyRemoteSources) { "test" } else { "print-json" }
            Write-Host "Checking Source Link metadata in $($package.Name) / $($pdb.Name) ($command)"
            $output = (& dotnet tool run sourcelink -- $command $pdb.FullName 2>&1 | Out-String)
            if ($LASTEXITCODE -ne 0) {
                throw "SourceLink '$command' failed for '$($package.Name)' / '$($pdb.Name)' with exit code $LASTEXITCODE.`n$output"
            }

            if (-not $VerifyRemoteSources) {
                $commit = (& git -C $repositoryRoot rev-parse HEAD).Trim()
                try {
                    $sourceLinkMetadata = $output | ConvertFrom-Json
                    $sourceUrls = @($sourceLinkMetadata.documents.PSObject.Properties | ForEach-Object { [string]$_.Value })
                } catch {
                    throw "Could not parse SourceLink metadata in '$($package.Name)' / '$($pdb.Name)'. Output:`n$output"
                }

                $expectedSourcePrefix = "https://raw.githubusercontent.com/seifmoustafa/AstraFlow/$commit/"
                $hasCommitPinnedSource = @($sourceUrls | Where-Object {
                    $_.StartsWith($expectedSourcePrefix, [System.StringComparison]::OrdinalIgnoreCase)
                }).Count -gt 0
                if (-not $hasCommitPinnedSource) {
                    throw "SourceLink metadata in '$($package.Name)' / '$($pdb.Name)' must map to the AstraFlow repository and exact source commit '$commit'. Output:`n$output"
                }
            }
        }
    }
}
finally {
    if (Test-Path -LiteralPath $temporaryRoot) {
        Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
    }
}
