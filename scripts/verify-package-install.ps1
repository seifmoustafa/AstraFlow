param(
    [string]$Configuration = "Release",
    [string]$Version,
    [string]$WorkRoot = (Join-Path ([System.IO.Path]::GetTempPath()) "AstraFlowInstallCheck"),
    [switch]$NoRestore
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

if ([string]::IsNullOrWhiteSpace($Version)) {
    [xml]$props = Get-Content -LiteralPath (Join-Path $repoRoot "Directory.Build.props")
    $Version = $props.Project.PropertyGroup.Version
}

if ([string]::IsNullOrWhiteSpace($Version)) {
    throw "Could not determine package version from Directory.Build.props."
}

$localSource = Join-Path $repoRoot ".dotnet-cli-home\local-packages\$Version"
$checkRootName = if ($NoRestore) { $Version } else { "$Version-$([guid]::NewGuid().ToString("N"))" }
$checkRoot = Join-Path $WorkRoot $checkRootName
$restorePackages = Join-Path $checkRoot "packages"
$config = Join-Path $checkRoot "nuget.config"

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

function Copy-Package {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageId
    )

    $packagePath = Join-Path $repoRoot "src\$PackageId\bin\$Configuration\$PackageId.$Version.nupkg"
    if (-not (Test-Path -LiteralPath $packagePath)) {
        throw "Expected package does not exist: $packagePath"
    }

    Copy-Item -LiteralPath $packagePath -Destination $localSource -Force
}

function Initialize-LocalSource {
    if (Test-Path -LiteralPath $checkRoot) {
        Remove-Item -LiteralPath $checkRoot -Recurse -Force
    }

    if (Test-Path -LiteralPath $localSource) {
        Remove-Item -LiteralPath $localSource -Recurse -Force
    }

    New-Item -ItemType Directory -Force -Path $localSource | Out-Null
    New-Item -ItemType Directory -Force -Path $checkRoot | Out-Null
    New-Item -ItemType Directory -Force -Path $restorePackages | Out-Null

    Copy-Package "AstraFlow.Contracts"
    Copy-Package "AstraFlow.Mediator"
    Copy-Package "AstraFlow.Mapper"
    Copy-Package "AstraFlow.Mapper.Conventions"
    Copy-Package "AstraFlow.Mapper.EntityFrameworkCore"
    Copy-Package "AstraFlow.Diagnostics"
    Copy-Package "AstraFlow.AspNetCore"
    Copy-Package "AstraFlow.FluentValidation"
    Copy-Package "AstraFlow.Testing"
    Copy-Package "AstraFlow.Analyzers"
    Copy-Package "AstraFlow.Generators"
    Copy-Package "AstraFlow.Cli"
    Copy-Package "AstraFlow"

    $lines = @(
        '<?xml version="1.0" encoding="utf-8"?>',
        '<configuration>',
        '  <packageSources>',
        '    <clear />',
        "    <add key=""local"" value=""$localSource"" />",
        '    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />',
        '  </packageSources>',
        '</configuration>'
    )

    Set-Content -LiteralPath $config -Value $lines -Encoding UTF8
}

function New-ConsumerProject {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Framework,

        [Parameter(Mandatory = $true)]
        [string]$Template
    )

    $frameworkName = $Framework.Replace(".", "")
    $sample = Join-Path $checkRoot ("af-$frameworkName-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
    Invoke-DotNetStep "Create $Framework $Template sample" @("new", $Template, "--output", $sample, "--no-restore")

    $project = Get-ChildItem -LiteralPath $sample -Filter "*.csproj" | Select-Object -First 1
    if ($null -eq $project) {
        throw "Could not find generated project in $sample."
    }

    [xml]$projectXml = Get-Content -LiteralPath $project.FullName
    $propertyGroup = $projectXml.SelectSingleNode("/Project/PropertyGroup")
    if ($null -eq $propertyGroup) {
        $propertyGroup = $projectXml.CreateElement("PropertyGroup")
        [void]$projectXml.Project.AppendChild($propertyGroup)
    }

    $targetFrameworkNode = $projectXml.SelectSingleNode("/Project/PropertyGroup/TargetFramework")
    if ($null -eq $targetFrameworkNode) {
        $targetFrameworkNode = $projectXml.CreateElement("TargetFramework")
        [void]$propertyGroup.AppendChild($targetFrameworkNode)
    }

    $targetFrameworkNode.InnerText = $Framework

    $langVersionNode = $projectXml.SelectSingleNode("/Project/PropertyGroup/LangVersion")
    if ($null -eq $langVersionNode) {
        $langVersionNode = $projectXml.CreateElement("LangVersion")
        [void]$propertyGroup.AppendChild($langVersionNode)
    }

    $langVersionNode.InnerText = "latest"
    $projectXml.Save($project.FullName)

    return $project.FullName
}

function Add-AstraFlowPackage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Project,

        [Parameter(Mandatory = $true)]
        [string]$PackageId
    )

    Invoke-DotNetStep "Add $PackageId to $(Split-Path -Leaf $Project)" @("add", $Project, "package", $PackageId, "--version", $Version, "--no-restore")
}

function Add-NuGetPackage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Project,

        [Parameter(Mandatory = $true)]
        [string]$PackageId,

        [Parameter(Mandatory = $true)]
        [string]$PackageVersion
    )

    Invoke-DotNetStep "Add $PackageId to $(Split-Path -Leaf $Project)" @("add", $Project, "package", $PackageId, "--version", $PackageVersion, "--no-restore")
}

function Set-MediatorSmokeProgram {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Project
    )

    $projectDirectory = Split-Path -Parent $Project
    $programPath = Join-Path $projectDirectory "Program.cs"
    $program = @'
using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;
using System.Runtime.CompilerServices;

var services = new ServiceCollection();
services.AddAstraFlowMediator(typeof(Program));
using var provider = services.BuildServiceProvider();

var mediator = provider.GetRequiredService<IMediator>();

var response = await mediator.Send(new SmokeQuery("response"));
if (response != "handled:response")
{
    throw new InvalidOperationException("Response request failed.");
}

await mediator.Send(new SmokeCommand("void"));

var streamValues = new List<int>();
await foreach (var value in mediator.CreateStream(new SmokeStream(3)))
{
    streamValues.Add(value);
}

if (!streamValues.SequenceEqual(new[] { 0, 1, 2 }))
{
    throw new InvalidOperationException("Stream request failed.");
}

await mediator.Publish(new SmokeNotification("notification"));

Console.WriteLine("AstraFlow mediator package smoke passed.");

public sealed record SmokeQuery(string Value) : IRequest<string>;

public sealed class SmokeQueryHandler : IRequestHandler<SmokeQuery, string>
{
    public Task<string> Handle(SmokeQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult($"handled:{request.Value}");
    }
}

public sealed record SmokeCommand(string Value) : IRequest;

public sealed class SmokeCommandHandler : IRequestHandler<SmokeCommand>
{
    public Task Handle(SmokeCommand request, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}

public sealed record SmokeStream(int Count) : IStreamRequest<int>;

public sealed class SmokeStreamHandler : IStreamRequestHandler<SmokeStream, int>
{
    public async IAsyncEnumerable<int> Handle(
        SmokeStream request,
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

public sealed record SmokeNotification(string Value) : INotification;

public sealed class SmokeNotificationHandler : INotificationHandler<SmokeNotification>
{
    public Task Handle(SmokeNotification notification, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
'@

    Set-Content -LiteralPath $programPath -Value $program -Encoding UTF8
}

function Test-CoreConsumer {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Framework,

        [Parameter(Mandatory = $true)]
        [string]$Template
    )

    $project = New-ConsumerProject -Framework $Framework -Template $Template

    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Contracts"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mediator"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mapper"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mapper.Conventions"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Diagnostics"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Testing"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Analyzers"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Generators"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow"

    Invoke-DotNetStep "Restore $Framework core consumer" @("restore", $project, "--configfile", $config, "--disable-parallel", "-v:minimal", "/p:RestorePackagesPath=$restorePackages")
    Invoke-DotNetStep "Build $Framework core consumer" @("build", $project, "--no-restore", "-v:minimal", "/m:1", "/p:UseSharedCompilation=false")
}

function Test-AllConsumer {
    $project = New-ConsumerProject -Framework "net10.0" -Template "console"

    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Contracts"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mediator"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mapper"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mapper.Conventions"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Diagnostics"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.AspNetCore"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.FluentValidation"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Testing"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Analyzers"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Generators"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow.Mapper.EntityFrameworkCore"
    Add-AstraFlowPackage -Project $project -PackageId "AstraFlow"
    Add-NuGetPackage -Project $project -PackageId "Microsoft.Extensions.DependencyInjection" -PackageVersion "10.0.2"

    Set-MediatorSmokeProgram -Project $project

    Invoke-DotNetStep "Restore net10.0 all-package consumer" @("restore", $project, "--configfile", $config, "--disable-parallel", "-v:minimal", "/p:RestorePackagesPath=$restorePackages")
    Invoke-DotNetStep "Build net10.0 all-package consumer" @("build", $project, "--no-restore", "-v:minimal", "/m:1", "/p:UseSharedCompilation=false")
    Invoke-DotNetStep "Run net10.0 all-package consumer" @("run", "--project", $project, "--no-build")
}

function Test-CliTool {
    $toolPath = Join-Path $checkRoot "tools"
    New-Item -ItemType Directory -Force -Path $toolPath | Out-Null

    Invoke-DotNetStep "Install AstraFlow.Cli tool" @(
        "tool",
        "install",
        "AstraFlow.Cli",
        "--version",
        $Version,
        "--tool-path",
        $toolPath,
        "--configfile",
        $config,
        "--add-source",
        $localSource
    )

    $command = Join-Path $toolPath "astraflow.exe"
    if (-not (Test-Path -LiteralPath $command)) {
        $command = Join-Path $toolPath "astraflow"
    }

    if (-not (Test-Path -LiteralPath $command)) {
        throw "Could not find installed astraflow tool in $toolPath."
    }

    Write-Host "==> Run AstraFlow.Cli inspect smoke"
    & $command inspect $repoRoot
    if ($LASTEXITCODE -ne 0) {
        throw "AstraFlow.Cli inspect smoke failed with exit code $LASTEXITCODE."
    }
}

if (-not $NoRestore) {
    Initialize-LocalSource
}

Test-CoreConsumer -Framework "netstandard2.0" -Template "classlib"
Test-CoreConsumer -Framework "net8.0" -Template "console"
Test-CoreConsumer -Framework "net9.0" -Template "console"
Test-AllConsumer
Test-CliTool

Write-Host "AstraFlow package install verification passed for version $Version."
