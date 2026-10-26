param(
    [string]$Configuration = "Release",
    [string]$PreviousVersion = "1.13.0",
    [string]$CurrentVersion,
    [string]$WorkRoot = (Join-Path ([System.IO.Path]::GetTempPath()) "AstraFlowUpgradeSmoke")
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

if ([string]::IsNullOrWhiteSpace($CurrentVersion)) {
    [xml]$props = Get-Content -LiteralPath (Join-Path $repoRoot "Directory.Build.props")
    $CurrentVersion = $props.Project.PropertyGroup.Version
}

if ([string]::IsNullOrWhiteSpace($CurrentVersion)) {
    throw "Could not determine current package version from Directory.Build.props."
}

$packages = @(
    "AstraFlow.Contracts",
    "AstraFlow.Mediator",
    "AstraFlow.Mapper",
    "AstraFlow.Mapper.Conventions",
    "AstraFlow.Mapper.EntityFrameworkCore",
    "AstraFlow.Diagnostics",
    "AstraFlow.AspNetCore",
    "AstraFlow.FluentValidation",
    "AstraFlow.OpenTelemetry",
    "AstraFlow.Testing",
    "AstraFlow.Analyzers",
    "AstraFlow.Generators",
    "AstraFlow"
)

$runRoot = Join-Path $WorkRoot "$PreviousVersion-to-$CurrentVersion-$([guid]::NewGuid().ToString("N"))"
$localSource = Join-Path $runRoot "local-packages"
$restorePackages = Join-Path $runRoot "packages"
$sample = Join-Path $runRoot "consumer"
$config = Join-Path $runRoot "nuget.config"

function Invoke-DotNetStep {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    Write-Host "==> $Name"
    & dotnet @Arguments | ForEach-Object { Write-Host $_ }
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE."
    }
}

function Copy-CurrentPackage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageId
    )

    $packagePath = Join-Path $repoRoot "src\$PackageId\bin\$Configuration\$PackageId.$CurrentVersion.nupkg"
    if (-not (Test-Path -LiteralPath $packagePath)) {
        throw "Current package is missing. Pack first: $packagePath"
    }

    Copy-Item -LiteralPath $packagePath -Destination $localSource -Force
}

function Add-AstraFlowPackageVersion {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageId,

        [Parameter(Mandatory = $true)]
        [string]$Version
    )

    Invoke-DotNetStep "Add $PackageId $Version" @(
        "add",
        $project.FullName,
        "package",
        $PackageId,
        "--version",
        $Version,
        "--no-restore"
    )
}

if (Test-Path -LiteralPath $runRoot) {
    Remove-Item -LiteralPath $runRoot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $localSource | Out-Null
New-Item -ItemType Directory -Force -Path $restorePackages | Out-Null

foreach ($packageId in $packages) {
    Copy-CurrentPackage -PackageId $packageId
}

$nugetConfig = @(
    '<?xml version="1.0" encoding="utf-8"?>',
    '<configuration>',
    '  <packageSources>',
    '    <clear />',
    "    <add key=""local"" value=""$localSource"" />",
    '    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />',
    '  </packageSources>',
    '</configuration>'
)
Set-Content -LiteralPath $config -Value $nugetConfig -Encoding UTF8

Invoke-DotNetStep "Create upgrade smoke consumer" @("new", "console", "--framework", "net10.0", "--output", $sample, "--no-restore")
$project = Get-ChildItem -LiteralPath $sample -Filter "*.csproj" | Select-Object -First 1
if ($null -eq $project) {
    throw "Could not find generated project in $sample."
}

$programPath = Join-Path $sample "Program.cs"
$program = @'
using AstraFlow.Mediator;
using AstraFlow.OpenTelemetry;
using Microsoft.Extensions.DependencyInjection;
using System.Runtime.CompilerServices;

var services = new ServiceCollection();
services.AddAstraFlowMediator(typeof(Program));
services.AddAstraFlowOpenTelemetry(options => options.Enabled = false);
using var provider = services.BuildServiceProvider();

var mediator = provider.GetRequiredService<IMediator>();
var response = await mediator.Send(new UpgradeQuery("ok"));
if (response != "handled:ok")
{
    throw new InvalidOperationException("Response request failed.");
}

await mediator.Send(new UpgradeCommand());

var values = new List<int>();
await foreach (var value in mediator.CreateStream(new UpgradeStream(2)))
{
    values.Add(value);
}

if (!values.SequenceEqual(new[] { 0, 1 }))
{
    throw new InvalidOperationException("Stream request failed.");
}

await mediator.Publish(new UpgradeNotification());
Console.WriteLine("AstraFlow upgrade smoke passed.");

public sealed record UpgradeQuery(string Value) : IRequest<string>;

public sealed class UpgradeQueryHandler : IRequestHandler<UpgradeQuery, string>
{
    public Task<string> Handle(UpgradeQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult($"handled:{request.Value}");
    }
}

public sealed record UpgradeCommand : IRequest;

public sealed class UpgradeCommandHandler : IRequestHandler<UpgradeCommand>
{
    public Task Handle(UpgradeCommand request, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}

public sealed record UpgradeStream(int Count) : IStreamRequest<int>;

public sealed class UpgradeStreamHandler : IStreamRequestHandler<UpgradeStream, int>
{
    public async IAsyncEnumerable<int> Handle(
        UpgradeStream request,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        for (var i = 0; i < request.Count; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            await Task.Yield();
            yield return i;
        }
    }
}

public sealed record UpgradeNotification : INotification;

public sealed class UpgradeNotificationHandler : INotificationHandler<UpgradeNotification>
{
    public Task Handle(UpgradeNotification notification, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
'@
Set-Content -LiteralPath $programPath -Value $program -Encoding UTF8

foreach ($packageId in $packages) {
    Add-AstraFlowPackageVersion -PackageId $packageId -Version $PreviousVersion
}

Invoke-DotNetStep "Restore previous-version consumer" @("restore", $project.FullName, "--configfile", $config, "--disable-parallel", "-v:minimal", "/p:RestorePackagesPath=$restorePackages")
Invoke-DotNetStep "Build previous-version consumer" @("build", $project.FullName, "--no-restore", "-v:minimal", "/m:1", "/p:UseSharedCompilation=false")
Invoke-DotNetStep "Run previous-version consumer" @("run", "--project", $project.FullName, "--no-build")

foreach ($packageId in $packages) {
    Add-AstraFlowPackageVersion -PackageId $packageId -Version $CurrentVersion
}

Invoke-DotNetStep "Restore upgraded consumer" @("restore", $project.FullName, "--configfile", $config, "--disable-parallel", "-v:minimal", "/p:RestorePackagesPath=$restorePackages")
Invoke-DotNetStep "Build upgraded consumer" @("build", $project.FullName, "--no-restore", "-v:minimal", "/m:1", "/p:UseSharedCompilation=false")
Invoke-DotNetStep "Run upgraded consumer" @("run", "--project", $project.FullName, "--no-build")

Write-Host "AstraFlow upgrade smoke passed from $PreviousVersion to $CurrentVersion."
