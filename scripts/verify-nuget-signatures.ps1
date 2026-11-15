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
                $curlOutput = @(
                    & curl.exe --location --silent --show-error --fail --max-time 30 --output $download --write-out "%{http_code}" $uri 2>&1
                )
                $curlExitCode = $LASTEXITCODE
                $statusCodeText = [string]($curlOutput | Where-Object { "$($_)".Trim() -match '^\d{3}$' } | Select-Object -Last 1)
                $statusCode = 0
                if ($statusCodeText.Trim() -match '^\d{3}$') {
                    $statusCode = [int]$statusCodeText.Trim()
                }
                $curlError = ($curlOutput | Where-Object { "$($_)".Trim() -notmatch '^\d{3}$' } | ForEach-Object { "$($_)".Trim() }) -join " "

                if ($curlExitCode -eq 0 -and $statusCode -eq 200) {
                    $downloaded = $true
                    break
                }

                if ($statusCode -notin @(0, 404, 429) -and $statusCode -lt 500) {
                    $retryable = $false
                    throw "NuGet returned HTTP $statusCode while downloading '$($package.Name)'."
                }

                if ($curlExitCode -ne 0) {
                    $lastDownloadError = "curl.exe exited with code $curlExitCode (HTTP $statusCode): $curlError"
                } else {
                    $lastDownloadError = "NuGet returned HTTP $statusCode."
                }
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
