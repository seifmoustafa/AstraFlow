using System.Diagnostics;
using System.Text.Json;
using AstraFlow.Cli;
using FluentAssertions;
using Xunit;

namespace AstraFlow.Cli.Tests;

public sealed class CliCommandTests
{
    private static readonly DateTimeOffset FixedTimestamp = new(2026, 6, 2, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public void CreateInspectReport_ReturnsExpectedJsonShape()
    {
        var json = Program.CreateInspectReport("AstraFlow.slnx", FixedTimestamp);

        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        root.GetProperty("command").GetString().Should().Be("inspect");
        root.GetProperty("timestamp").GetString().Should().Be("2026-06-02T12:00:00.0000000Z");
        root.GetProperty("path").GetString().Should().EndWith("AstraFlow.slnx");
        root.GetProperty("status").GetString().Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void InspectHandlers_ReturnsHandlerSection()
    {
        var output = Run("inspect", "handlers", FindRepoDirectory("src"), "--detail");

        using var document = JsonDocument.Parse(output);
        var section = document.RootElement.GetProperty("sections").EnumerateArray().Single();
        section.GetProperty("name").GetString().Should().Be("handlers");
        section.GetProperty("items").GetArrayLength().Should().BeGreaterThan(0);
    }

    [Fact]
    public void ValidateMissingPath_ReturnsErrorExitAndFinding()
    {
        var exitCode = Execute(
            ["validate", "missing-file.json"],
            out var output,
            out var error,
            FixedTimestamp);

        exitCode.Should().Be(1);
        error.Should().BeEmpty();

        using var document = JsonDocument.Parse(output);
        document.RootElement.GetProperty("status").GetString().Should().Be("error");
        document.RootElement.GetProperty("findings").GetArrayLength().Should().Be(1);
    }

    [Fact]
    public void ReportMarkdown_ReturnsMarkdown()
    {
        var output = Run("report", FindRepoDirectory("src"), "-o", "markdown");

        output.Should().StartWith("# AstraFlow report report");
        output.Should().Contain("## handlers");
    }

    [Fact]
    public void ReportSarif_ReturnsSarifEnvelope()
    {
        var exitCode = Execute(
            ["validate", "missing-file.json", "-o", "sarif"],
            out var output,
            out var error,
            FixedTimestamp);

        exitCode.Should().Be(1);
        error.Should().BeEmpty();
        using var document = JsonDocument.Parse(output);
        document.RootElement.GetProperty("version").GetString().Should().Be("2.1.0");
        document.RootElement.GetProperty("runs").GetArrayLength().Should().Be(1);
    }

    [Fact]
    public void Diff_ReturnsAddedAndRemovedItems()
    {
        using var temp = new TempDirectory();
        var beforePath = Path.Combine(temp.Path, "before.json");
        var afterPath = Path.Combine(temp.Path, "after.json");
        File.WriteAllText(beforePath, ReportJson("handlers", "A"));
        File.WriteAllText(afterPath, ReportJson("handlers", "B"));

        var output = Run("diff", beforePath, afterPath);

        using var document = JsonDocument.Parse(output);
        document.RootElement.GetProperty("status").GetString().Should().Be("changed");
        document.RootElement.GetProperty("sections").GetArrayLength().Should().Be(2);
    }

    [Fact]
    public void GraphDot_ReturnsDotGraph()
    {
        var output = Run("graph", FindRepoDirectory("src"), "--format", "dot", "--cluster");

        output.Should().StartWith("digraph AstraFlow");
        output.Should().Contain("root ->");
    }

    [Fact]
    public void GraphMermaid_ReturnsMermaidGraph()
    {
        var output = Run("graph", FindRepoDirectory("src"), "--format", "mermaid", "--direction", "LR");

        output.Should().StartWith("flowchart LR");
        output.Should().Contain("root -->");
    }

    [Fact]
    public void Scan_FindsMigrationCandidates()
    {
        using var temp = new TempDirectory();
        File.WriteAllText(Path.Combine(temp.Path, "Sample.cs"), "using MediatR; using AutoMapper;");

        var output = Run("scan", temp.Path);

        using var document = JsonDocument.Parse(output);
        document.RootElement.GetProperty("status").GetString().Should().Be("candidates");
        document.RootElement.GetProperty("sections")[0].GetProperty("items").GetArrayLength().Should().Be(2);
    }

    [Fact]
    public async Task InspectCommand_ExitsZeroAndPrintsJson()
    {
        var projectPath = FindRepoFile("src", "AstraFlow.Cli", "AstraFlow.Cli.csproj");
        var samplePath = FindRepoFile("AstraFlow.slnx");
        using var process = new Process();

        process.StartInfo = new ProcessStartInfo
        {
            FileName = "dotnet",
            Arguments = $"run --project \"{projectPath}\" -- inspect \"{samplePath}\"",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false
        };

        process.Start();
        var output = await process.StandardOutput.ReadToEndAsync();
        var error = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        process.ExitCode.Should().Be(0, error);

        using var document = JsonDocument.Parse(output);
        document.RootElement.GetProperty("command").GetString().Should().Be("inspect");
        document.RootElement.GetProperty("path").GetString().Should().Be(Path.GetFullPath(samplePath));
    }

    private static string Run(params string[] args)
    {
        var exitCode = Execute(args, out var output, out var error, FixedTimestamp);

        exitCode.Should().Be(0, error);
        error.Should().BeEmpty();
        return output;
    }

    private static int Execute(
        string[] args,
        out string output,
        out string error,
        DateTimeOffset timestamp)
    {
        using var outputWriter = new StringWriter();
        using var errorWriter = new StringWriter();
        var exitCode = Program.Execute(args, outputWriter, errorWriter, timestamp);
        output = outputWriter.ToString().Trim();
        error = errorWriter.ToString().Trim();
        return exitCode;
    }

    private static string ReportJson(string section, string id)
    {
        return $$"""
            {"command":"inspect","timestamp":"2026-06-02T12:00:00.0000000Z","path":"sample","status":"ok","sections":[{"name":"{{section}}","items":[{"id":"{{id}}","type":"sample","source":"sample","detail":null}]}],"findings":[]}
            """;
    }

    private static string FindRepoFile(params string[] pathParts)
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);

        while (directory is not null)
        {
            var candidate = Path.Combine(new[] { directory.FullName }.Concat(pathParts).ToArray());

            if (File.Exists(candidate))
            {
                return candidate;
            }

            directory = directory.Parent;
        }

        throw new FileNotFoundException($"Could not find repository file '{Path.Combine(pathParts)}'.");
    }

    private static string FindRepoDirectory(params string[] pathParts)
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);

        while (directory is not null)
        {
            var candidate = Path.Combine(new[] { directory.FullName }.Concat(pathParts).ToArray());

            if (Directory.Exists(candidate))
            {
                return candidate;
            }

            directory = directory.Parent;
        }

        throw new DirectoryNotFoundException($"Could not find repository directory '{Path.Combine(pathParts)}'.");
    }

    private sealed class TempDirectory : IDisposable
    {
        public TempDirectory()
        {
            Path = System.IO.Path.Combine(System.IO.Path.GetTempPath(), "AstraFlowCliTests", Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(Path);
        }

        public string Path { get; }

        public void Dispose()
        {
            if (Directory.Exists(Path))
            {
                Directory.Delete(Path, recursive: true);
            }
        }
    }
}
