param(
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$sampleRoot = Join-Path $repoRoot "samples"
$projects = Get-ChildItem -LiteralPath $sampleRoot -Recurse -Filter "*.csproj" |
    Sort-Object FullName

if ($projects.Count -eq 0) {
    throw "No sample projects were found under $sampleRoot."
}

foreach ($project in $projects) {
    Write-Host "==> Building sample $($project.FullName)"
    dotnet build $project.FullName -c $Configuration --no-restore /m:1 /p:UseSharedCompilation=false
    if ($LASTEXITCODE -ne 0) {
        throw "Sample build failed: $($project.FullName)"
    }
}

Write-Host "AstraFlow sample build verification passed for $($projects.Count) sample projects."
