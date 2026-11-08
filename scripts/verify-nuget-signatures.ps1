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
        $downloaded = $false
        $lastDownloadError = $null
        for ($attempt = 1; $attempt -le 30; $attempt++) {
            Remove-Item -LiteralPath $download -Force -ErrorAction SilentlyContinue
            $retryable = $true
            try {
                $response = Invoke-WebRequest -Uri $uri -OutFile $download -TimeoutSec 30 -SkipHttpErrorCheck
                if ([int]$response.StatusCode -eq 200) {
                    $downloaded = $true
                    break
                }

                if ([int]$response.StatusCode -notin @(0, 404, 429) -and [int]$response.StatusCode -lt 500) {
                    $retryable = $false
                    throw "NuGet returned HTTP $([int]$response.StatusCode) while downloading '$($package.Name)'."
                }

                $lastDownloadError = "NuGet returned HTTP $([int]$response.StatusCode)."
            } catch {
                if (-not $retryable) {
                    throw
                }
                $lastDownloadError = $_.Exception.Message
            }

            if ($attempt -lt 30) {
                Write-Host "Package $($package.Name) is not available for signature verification yet (attempt $attempt/30): $lastDownloadError Retrying in 30 seconds."
                Start-Sleep -Seconds 30
            }
        }

        if (-not $downloaded) {
            throw "NuGet package '$($package.Name)' did not become available for signature verification after 30 attempts. Last error: $lastDownloadError"
        }

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
