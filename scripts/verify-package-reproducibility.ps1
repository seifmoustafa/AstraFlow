param(
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $repositoryRoot "src"
$propsPath = Join-Path $repositoryRoot "Directory.Build.props"
[xml]$props = Get-Content -LiteralPath $propsPath
$version = [string]$props.Project.PropertyGroup.Version
if ([string]::IsNullOrWhiteSpace($version)) {
    throw "Could not read package Version from '$propsPath'."
}
$sourceDateEpoch = (& git -C $repositoryRoot log -1 --format=%ct).Trim()
if ($LASTEXITCODE -ne 0 -or $sourceDateEpoch -notmatch '^\d+$') {
    throw "Could not determine a reproducible SOURCE_DATE_EPOCH from the checked out commit."
}
$previousSourceDateEpoch = $env:SOURCE_DATE_EPOCH
$env:SOURCE_DATE_EPOCH = $sourceDateEpoch
$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("astraflow-repack-" + [guid]::NewGuid().ToString("N"))

try {
    New-Item -ItemType Directory -Path $temporaryRoot | Out-Null
    $projects = @(Get-ChildItem -Path $sourceRoot -Directory | ForEach-Object {
        Get-ChildItem -Path $_.FullName -Filter "*.csproj" -File
    })

    if ($projects.Count -eq 0) {
        throw "No package projects were found under '$sourceRoot'."
    }

    foreach ($project in $projects) {
        $projectName = [System.IO.Path]::GetFileNameWithoutExtension($project.Name)
        $baselineDirectory = Join-Path $project.DirectoryName "bin/$Configuration"
        $secondPackDirectory = Join-Path $temporaryRoot $projectName
        New-Item -ItemType Directory -Path $secondPackDirectory | Out-Null

        $baselinePackages = @(
            Get-ChildItem -Path $baselineDirectory -File -Filter "$projectName.$version.nupkg"
            Get-ChildItem -Path $baselineDirectory -File -Filter "$projectName.$version.snupkg"
        )
        if ($baselinePackages.Count -eq 0) {
            throw "No baseline NuGet package was found for '$projectName' in '$baselineDirectory'."
        }

        & dotnet pack $project.FullName -c $Configuration --no-build --no-restore /m:1 /p:UseSharedCompilation=false /p:CI=true -o $secondPackDirectory
        if ($LASTEXITCODE -ne 0) {
            throw "Second pack failed for '$projectName' with exit code $LASTEXITCODE."
        }

        foreach ($baseline in $baselinePackages) {
            $secondPack = Join-Path $secondPackDirectory $baseline.Name
            if (-not (Test-Path -LiteralPath $secondPack -PathType Leaf)) {
                throw "The second pack did not produce '$($baseline.Name)' for '$projectName'."
            }

            $baselineHash = (Get-FileHash -LiteralPath $baseline.FullName -Algorithm SHA256).Hash
            $secondHash = (Get-FileHash -LiteralPath $secondPack -Algorithm SHA256).Hash
            if ($baselineHash -ne $secondHash) {
                throw "Package output is not reproducible: '$($baseline.Name)' hashes differ ($baselineHash != $secondHash)."
            }

            Write-Host "Reproducible: $($baseline.Name) SHA256 $baselineHash"
        }
    }
}
finally {
    if ($null -eq $previousSourceDateEpoch) {
        Remove-Item Env:\SOURCE_DATE_EPOCH -ErrorAction SilentlyContinue
    } else {
        $env:SOURCE_DATE_EPOCH = $previousSourceDateEpoch
    }
    if (Test-Path -LiteralPath $temporaryRoot) {
        Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
    }
}
