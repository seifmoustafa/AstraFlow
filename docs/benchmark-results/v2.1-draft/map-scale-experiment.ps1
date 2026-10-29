$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path
$work = Join-Path $root '.artifacts\map-scale'
New-Item -ItemType Directory -Force -Path $work | Out-Null
$mapper = Join-Path $root 'src\AstraFlow.Mapper\bin\Release\net10.0\AstraFlow.Mapper.dll'
$generator = Join-Path $root 'src\AstraFlow.Generators\bin\Release\netstandard2.0\AstraFlow.Generators.dll'
foreach ($count in @(25, 100, 400)) {
    foreach ($mode in @('manual', 'generated')) {
        $dir = Join-Path $work "$count-$mode"
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        $analyzer = if ($mode -eq 'generated') { "<Analyzer Include=`"$generator`" />" } else { '' }
        @"
<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><TargetFramework>net10.0</TargetFramework><EmitCompilerGeneratedFiles>true</EmitCompilerGeneratedFiles></PropertyGroup><ItemGroup><Reference Include="AstraFlow.Mapper"><HintPath>$mapper</HintPath></Reference>$analyzer</ItemGroup></Project>
"@ | Set-Content -Encoding utf8 (Join-Path $dir 'Scale.csproj')
        $lines = [System.Collections.Generic.List[string]]::new()
        $lines.Add('using AstraFlow.Mapper;')
        for ($i = 0; $i -lt $count; $i++) {
            $lines.Add("internal class Input$i { public int Value { get; set; } }")
            $lines.Add("internal class Output$i { public int Value { get; set; } }")
            if ($mode -eq 'generated') { $lines.Add("internal static partial class Maps$i { [AstraGenerateMapping] public static partial Output$i Convert(Input$i source); }") }
            else { $lines.Add("internal static class Maps$i { public static Output$i Convert(Input$i source) => new Output$i { Value = source.Value }; }") }
        }
        [IO.File]::WriteAllLines((Join-Path $dir 'Maps.cs'), $lines)
        & dotnet restore (Join-Path $dir 'Scale.csproj') --configfile (Join-Path $root 'NuGet.Config') --disable-parallel --verbosity quiet
        if ($LASTEXITCODE -ne 0) { throw "Restore failed: $dir" }
        for ($iteration = 1; $iteration -le 3; $iteration++) {
            $watch = [Diagnostics.Stopwatch]::StartNew()
            & dotnet build (Join-Path $dir 'Scale.csproj') -c Release --no-restore -t:Rebuild /m:1 /p:UseSharedCompilation=false -v:q
            $exit = $LASTEXITCODE
            $watch.Stop()
            if ($exit -ne 0) { throw "Build failed: $dir" }
            "RESULT count=$count mode=$mode iteration=$iteration ms=$($watch.ElapsedMilliseconds)"
        }
        if ($mode -eq 'generated') {
            $files = @(Get-ChildItem (Join-Path $dir 'obj\Release\net10.0\generated') -Recurse -Filter '*.g.cs')
            "SOURCES count=$count files=$($files.Count) bytes=$(($files | Measure-Object Length -Sum).Sum)"
        }
    }
}
