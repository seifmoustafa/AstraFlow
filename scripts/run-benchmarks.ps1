param(
    [string]$Configuration = "Release",
    [switch]$Smoke,
    [string[]]$BenchmarkArgs = @()
)

$ErrorActionPreference = "Stop"

$project = Join-Path $PSScriptRoot "..\benchmarks\AstraFlow.Benchmarks\AstraFlow.Benchmarks.csproj"
$arguments = @("run", "--project", $project, "--configuration", $Configuration, "--")

if ($Smoke) {
    $arguments += "--smoke"
} else {
    $arguments += $BenchmarkArgs
}

dotnet @arguments
