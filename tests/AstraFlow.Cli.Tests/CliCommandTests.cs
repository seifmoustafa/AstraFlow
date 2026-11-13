using System.Diagnostics;
using System.Text.Json;
using AstraFlow.Cli;
using AstraFlow.Assertions;
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
        output.Should().Contain("request_");
        output.Should().Contain("handler_");
    }

    [Fact]
    public void GraphMermaid_Builds_relational_chains_and_cycle_free_clusters()
    {
        using var temp = new TempDirectory();
        File.WriteAllText(Path.Combine(temp.Path, "ConfirmReservationCommandHandler.cs"),
            "public sealed class ConfirmReservationCommandHandler : IRequestHandler<ConfirmReservationCommand, Result<ConfirmReservationResult>> { }");

        var output = Run("graph", temp.Path, "--format", "mermaid");

        output.Should().Contain("subgraph cluster_module_Core_feature_");
        output.Should().Contain("CMD: ConfirmReservationCommand");
        output.Should().Contain("ConfirmReservationResult");
        output.Should().Contain("ConfirmReservationCommandHandler");
        output.Should().NotContain("subgraph handlers");
    }

    [Fact]
    public void GraphMermaid_Can_group_relational_chains_by_module()
    {
        using var temp = new TempDirectory();
        File.WriteAllText(Path.Combine(temp.Path, "Handler.cs"),
            "public sealed class Handler : IRequestHandler<Request, Result<Response>> { }");

        var output = Run("graph", temp.Path, "--style", "relational", "--group-by", "module");

        output.Should().Contain("cluster_module_Core");
        output.Should().Contain("request_");
        output.Should().NotContain("Operations");
    }

    [Fact]
    public void GraphMermaid_Parses_handler_contracts_split_across_lines()
    {
        using var temp = new TempDirectory();
        File.WriteAllText(Path.Combine(temp.Path, "Handler.cs"),
            "public sealed class Handler : IRequestHandler<\n    ConfirmRequest,\n    Result<ConfirmResponse>> { }");

        var output = Run("graph", temp.Path, "--style", "relational");

        output.Should().Contain("ConfirmRequest");
        output.Should().Contain("ConfirmResponse");
    }

    [Fact]
    public void GraphCanvasJson_Contains_nodes_edges_ports_and_unescaped_generic_text()
    {
        using var temp = new TempDirectory();
        File.WriteAllText(Path.Combine(temp.Path, "ConfirmReservationCommandHandler.cs"),
            "public sealed class ConfirmReservationCommandHandler : IRequestHandler<ConfirmReservationCommand, Result<ConfirmReservationResult>> { }");

        var output = Run("graph", temp.Path, "--format", "canvas-json");

        using var document = JsonDocument.Parse(output);
        var root = document.RootElement;
        root.GetProperty("version").GetString().Should().Be("2.3.0");
        root.GetProperty("nodes").GetArrayLength().Should().Be(3);
        root.GetProperty("edges").GetArrayLength().Should().Be(2);
        root.GetProperty("nodes")[1].GetProperty("ports").GetProperty("in").GetArrayLength().Should().Be(1);
        output.Should().Contain("ConfirmReservationResult");
        output.Should().Contain("IRequestHandler<ConfirmReservationCommand");
    }

    [Fact]
    public void MarkdownReport_escapes_pipes_and_wraps_signatures_as_inline_code()
    {
        var report = new CliReport("report", FixedTimestamp.ToString("O"), "scope", "ok",
            [new CliSection("handlers", [new CliItem("Handler", "request-handler", "Handler.cs", "IRequestHandler<Request, Result<Response>> | detail")])], []);

        var output = Program.FormatReport(report, OutputFormat.Markdown);

        output.Should().Contain("`IRequestHandler<Request, Result<Response>> \\| detail`");
    }

    [Fact]
    public void GraphPipelineStyle_Emits_five_stages()
    {
        using var temp = new TempDirectory();
        File.WriteAllText(Path.Combine(temp.Path, "Handler.cs"), "public sealed class Handler : IRequestHandler<Request, Result<Response>> { }");

        var output = Run("graph", temp.Path, "--style", "pipeline", "--format", "mermaid");

        output.Should().Contain("1. Inbound Dispatch");
        output.Should().Contain("2. Pipeline Behaviors");
        output.Should().Contain("3. Core Execution");
        output.Should().Contain("4. Domain Events / Outbox");
        output.Should().Contain("5. Projections &amp; Mappers");
    }

    [Fact]
    public void GraphCanvasJson_Includes_notification_mapping_and_projection_nodes()
    {
        using var temp = new TempDirectory();
        File.WriteAllText(Path.Combine(temp.Path, "RequestHandler.cs"),
            "public sealed class RequestHandler : IRequestHandler<Request, Result<Response>> { }");
        File.WriteAllText(Path.Combine(temp.Path, "EventHandler.cs"),
            "public sealed class EventHandler : INotificationHandler<ReservationConfirmed> { }");
        File.WriteAllText(Path.Combine(temp.Path, "MapRule.cs"),
            "public sealed class MapRule : IObjectMappingRule { }");
        File.WriteAllText(Path.Combine(temp.Path, "ReservationProjection.cs"),
            "public sealed class ReservationProjection : IProjection<Reservation, ReservationDto> { }");

        using var document = JsonDocument.Parse(Run("graph", temp.Path, "--format", "canvas-json"));
        var root = document.RootElement;
        var nodes = root.GetProperty("nodes").EnumerateArray().ToArray();

        nodes.Should().Contain(node => node.GetProperty("type").GetString() == "event");
        nodes.Should().Contain(node => node.GetProperty("type").GetString() == "notification-handler");
        nodes.Should().Contain(node => node.GetProperty("type").GetString() == "mapping");
        nodes.Should().Contain(node => node.GetProperty("type").GetString() == "projection");
        root.GetProperty("stats").GetProperty("events").GetInt32().Should().Be(1);
        root.GetProperty("stats").GetProperty("mappings").GetInt32().Should().Be(2);
        root.GetProperty("edges").GetArrayLength().Should().Be(5);
    }

    [Fact]
    public void GraphCanvasJson_Can_write_to_requested_file()
    {
        using var temp = new TempDirectory();
        var source = Path.Combine(temp.Path, "Handler.cs");
        var outputPath = Path.Combine(temp.Path, "graph.json");
        File.WriteAllText(source, "public sealed class Handler : IRequestHandler<Request, Result<Response>> { }");

        var exitCode = Execute(["graph", temp.Path, "-f", "canvas-json", "-o", outputPath], out _, out var error, FixedTimestamp);

        exitCode.Should().Be(0);
        error.Should().BeEmpty();
        JsonDocument.Parse(File.ReadAllText(outputPath)).RootElement.GetProperty("nodes").GetArrayLength().Should().Be(3);
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
