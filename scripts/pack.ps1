param(
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $repoRoot

try {
    dotnet restore .\AstraFlow.slnx --configfile .\NuGet.Config --disable-parallel
    dotnet build .\AstraFlow.slnx -c $Configuration --no-restore /m:1 /p:UseSharedCompilation=false
    dotnet test .\AstraFlow.slnx -c $Configuration --no-build --no-restore /m:1 /p:UseSharedCompilation=false

    dotnet pack .\src\AstraFlow.Mediator\AstraFlow.Mediator.csproj -c $Configuration --no-build --no-restore /m:1 /p:UseSharedCompilation=false
    dotnet pack .\src\AstraFlow.Mapper\AstraFlow.Mapper.csproj -c $Configuration --no-build --no-restore /m:1 /p:UseSharedCompilation=false
    dotnet pack .\src\AstraFlow\AstraFlow.csproj -c $Configuration --no-build --no-restore /m:1 /p:UseSharedCompilation=false

    Write-Host "Packages created:"
    Get-ChildItem .\src -Recurse -Filter "*.nupkg" | Select-Object -ExpandProperty FullName
}
finally {
    Pop-Location
}
