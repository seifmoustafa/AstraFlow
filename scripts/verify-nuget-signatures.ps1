param(
    [Parameter(Mandatory = $true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$packageFiles = @(Get-ChildItem -Path (Join-Path $repositoryRoot "src") -Directory | ForEach-Object {
    Get-ChildItem -Path (Join-Path $_.FullName "bin/Release") -File -Filter "*.nupkg" -ErrorAction SilentlyContinue
} | Where-Object { $_.Name -notlike "*.snupkg" } | Sort-Object Name)

if ($packageFiles.Count -eq 0) {
    throw "No release .nupkg files were found under src/**/bin/Release."
}

$verificationDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ("astraflow-nuget-signatures-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $verificationDirectory | Out-Null

try {
    foreach ($package in $packageFiles) {
        $packageId = $package.BaseName -replace "\.$([regex]::Escape($Version))$", ""
        if ($packageId -eq $package.BaseName) {
            throw "Package '$($package.Name)' does not match requested version '$Version'."
        }

        $flatContainerId = $packageId.ToLowerInvariant()
        $flatContainerVersion = $Version.ToLowerInvariant()
        $uri = "https://api.nuget.org/v3-flatcontainer/$flatContainerId/$flatContainerVersion/$flatContainerId.$flatContainerVersion.nupkg"
        $download = Join-Path $verificationDirectory $package.Name
        Write-Host "Downloading NuGet package for signature verification: $($package.Name)"
        Invoke-WebRequest -Uri $uri -OutFile $download

        & dotnet nuget verify --all $download
        if ($LASTEXITCODE -ne 0) {
            throw "NuGet signature verification failed for '$($package.Name)' with exit code $LASTEXITCODE."
        }
    }
}
finally {
    if (Test-Path -LiteralPath $verificationDirectory) {
        Remove-Item -LiteralPath $verificationDirectory -Recurse -Force
    }
}
