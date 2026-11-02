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
        for ($iteration = 1; $iteration -le 3; $iteration++) {
            $watch = [Diagnostics.Stopwatch]::StartNew()
            & dotnet build (Join-Path $dir 'Scale.csproj') -c Release --no-restore /m:1 /p:UseSharedCompilation=false -v:q
            $exit = $LASTEXITCODE
            $watch.Stop()
            if ($exit -ne 0) { throw "No-op incremental build failed: $dir" }
            "INCREMENTAL count=$count mode=$mode kind=noop iteration=$iteration ms=$($watch.ElapsedMilliseconds)"
        }

        $mapsPath = Join-Path $dir 'Maps.cs'
        $original = [IO.File]::ReadAllText($mapsPath)
        try {
            for ($iteration = 1; $iteration -le 3; $iteration++) {
                $edited = [Text.RegularExpressions.Regex]::Replace(
                    $original,
                    'Convert\(Input0 source\)',
                    "Convert(Input0 source$iteration)",
                    1)
                if ($edited -eq $original) { throw "Could not isolate the first mapping declaration: $dir" }
                $edited = [Text.RegularExpressions.Regex]::Replace(
                    $edited,
                    'Output0 \{ Value = source\.Value \}',
                    "Output0 { Value = source$iteration.Value }",
                    1)
                [IO.File]::WriteAllText($mapsPath, $edited, [Text.UTF8Encoding]::new($false))
                $watch = [Diagnostics.Stopwatch]::StartNew()
                & dotnet build (Join-Path $dir 'Scale.csproj') -c Release --no-restore /m:1 /p:UseSharedCompilation=false -v:q
                $exit = $LASTEXITCODE
                $watch.Stop()
                if ($exit -ne 0) { throw "Single-declaration incremental build failed: $dir" }
                "INCREMENTAL count=$count mode=$mode kind=one-declaration-edit iteration=$iteration ms=$($watch.ElapsedMilliseconds)"
            }
        }
        finally {
            [IO.File]::WriteAllText($mapsPath, $original, [Text.UTF8Encoding]::new($false))
            & dotnet build (Join-Path $dir 'Scale.csproj') -c Release --no-restore /m:1 /p:UseSharedCompilation=false -v:q
            if ($LASTEXITCODE -ne 0) { throw "Could not restore baseline build state: $dir" }
        }
        if ($mode -eq 'generated') {
            $files = @(Get-ChildItem (Join-Path $dir 'obj\Release\net10.0\generated') -Recurse -Filter '*.g.cs')
            "SOURCES count=$count files=$($files.Count) bytes=$(($files | Measure-Object Length -Sum).Sum)"
        }
    }
}
