using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AstraFlow.Cli;

public static class Program
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public static int Main(string[] args)
    {
        return Execute(args, Console.Out, Console.Error, DateTimeOffset.UtcNow);
    }

    public static int Execute(string[] args, TextWriter output, TextWriter error, DateTimeOffset timestamp)
    {
        if (args.Length == 0 || IsHelp(args[0]))
        {
            output.WriteLine(CliHelp.Text);
            return 0;
        }

        var command = args[0].ToLowerInvariant();
        var arguments = CliArguments.Parse(args.Skip(1));

        if (arguments.Help)
        {
            output.WriteLine(CliHelp.For(command));
            return 0;
        }

        try
        {
            var result = command switch
            {
                "inspect" => RunInspect(arguments, timestamp),
                "validate" => RunValidate(arguments, timestamp),
                "report" => RunReport(arguments, timestamp),
                "diff" => RunDiff(arguments, timestamp),
                "graph" => RunGraph(arguments, timestamp),
                "scan" => RunScan(arguments, timestamp),
                _ => CliResult.Fail($"Unknown command '{args[0]}'.")
            };

            if (!string.IsNullOrWhiteSpace(result.Error))
            {
                error.WriteLine(result.Error);
                return result.ExitCode;
            }

            output.WriteLine(result.Output);
            return result.ExitCode;
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException or JsonException or InvalidOperationException)
        {
            error.WriteLine(exception.Message);
            return 1;
        }
    }

    public static string CreateInspectReport(string? path, DateTimeOffset timestamp)
    {
        var report = CreateInspectionReport("inspect", "all", path, includeDetail: false, timestamp);
        return FormatReport(report, OutputFormat.Json);
    }

    public static CliReport CreateInspectionReport(
        string command,
        string category,
        string? path,
        bool includeDetail,
        DateTimeOffset timestamp)
    {
        var target = ResolveReportPath(path);
        var sections = AstraFlowScanner.Inspect(target, category, includeDetail);
        var findings = sections.Count == 0
            ? [new CliFinding("AFCLI0001", "info", target, "No matching AstraFlow registrations or migration candidates were found.")]
            : Array.Empty<CliFinding>();

        return new CliReport(
            command,
            timestamp.UtcDateTime.ToString("O"),
            target,
            sections.Count == 0 ? "empty" : "ok",
            sections,
            findings);
    }

    public static string FormatReport(CliReport report, OutputFormat format)
    {
        return format switch
        {
            OutputFormat.Json => JsonSerializer.Serialize(report, JsonOptions),
            OutputFormat.Markdown => MarkdownFormatter.Format(report),
            OutputFormat.Sarif => SarifFormatter.Format(report),
            _ => TextFormatter.Format(report)
        };
    }

    public static string CreateGraph(string? path, GraphFormat format, string direction, bool cluster)
    {
        var target = ResolveReportPath(path);
        var report = CreateInspectionReport("graph", "all", target, includeDetail: true, DateTimeOffset.UtcNow);
        return format == GraphFormat.Dot
            ? GraphFormatter.ToDot(report, cluster)
            : GraphFormatter.ToMermaid(report, direction, cluster);
    }

    private static CliResult RunInspect(CliArguments arguments, DateTimeOffset timestamp)
    {
        var category = "all";
        string? path = null;

        if (arguments.Positionals.Count > 0 && IsInspectCategory(arguments.Positionals[0]))
        {
            category = arguments.Positionals[0].ToLowerInvariant();
            path = arguments.Positionals.Count > 1 ? arguments.Positionals[1] : null;
        }
        else
        {
            path = arguments.Positionals.Count > 0 ? arguments.Positionals[0] : null;
        }

        if (arguments.Positionals.Count > (IsInspectCategory(arguments.Positionals.FirstOrDefault()) ? 2 : 1))
        {
            return CliResult.Fail("The inspect command accepts an optional category and one optional path.");
        }

        var report = CreateInspectionReport("inspect", category, path, arguments.Detail, timestamp);
        return CliResult.Success(FormatReport(report, arguments.Output));
    }

    private static CliResult RunValidate(CliArguments arguments, DateTimeOffset timestamp)
    {
        var path = arguments.Positionals.FirstOrDefault();
        var target = ResolveReportPath(path);
        var findings = new List<CliFinding>();

        if (!File.Exists(target) && !Directory.Exists(target))
        {
            findings.Add(new CliFinding("AFCLI1001", "error", target, "Target path does not exist."));
        }
        else if (Path.GetExtension(target).Equals(".json", StringComparison.OrdinalIgnoreCase))
        {
            using var stream = File.OpenRead(target);
            using var _ = JsonDocument.Parse(stream);
        }

        var report = new CliReport(
            "validate",
            timestamp.UtcDateTime.ToString("O"),
            target,
            findings.Any(f => f.Severity is "error" or "fatal") ? "error" : "ok",
            [],
            findings);

        return CliResult.Success(FormatReport(report, arguments.Output), report.Status == "ok" ? 0 : 1);
    }

    private static CliResult RunReport(CliArguments arguments, DateTimeOffset timestamp)
    {
        var path = arguments.Positionals.FirstOrDefault();
        var report = CreateInspectionReport("report", "all", path, includeDetail: true, timestamp);
        return CliResult.Success(FormatReport(report, arguments.Output));
    }

    private static CliResult RunDiff(CliArguments arguments, DateTimeOffset timestamp)
    {
        if (arguments.Positionals.Count != 2)
        {
            return CliResult.Fail("The diff command requires before and after JSON report paths.");
        }

        var beforePath = ResolveReportPath(arguments.Positionals[0]);
        var afterPath = ResolveReportPath(arguments.Positionals[1]);
        var before = ReportSnapshot.Load(beforePath);
        var after = ReportSnapshot.Load(afterPath);
        var beforeItems = before.Items;
        var afterItems = after.Items;
        var added = afterItems.Except(beforeItems, StringComparer.Ordinal).Order(StringComparer.Ordinal).ToArray();
        var removed = beforeItems.Except(afterItems, StringComparer.Ordinal).Order(StringComparer.Ordinal).ToArray();
        var sections = new[]
        {
            new CliSection("added", added.Select(item => new CliItem(item, "added", afterPath, null)).ToArray()),
            new CliSection("removed", removed.Select(item => new CliItem(item, "removed", beforePath, null)).ToArray())
        };
        var report = new CliReport(
            "diff",
            timestamp.UtcDateTime.ToString("O"),
            $"{beforePath} -> {afterPath}",
            added.Length == 0 && removed.Length == 0 ? "ok" : "changed",
            sections,
            []);

        return CliResult.Success(FormatReport(report, arguments.Output));
    }

    private static CliResult RunGraph(CliArguments arguments, DateTimeOffset timestamp)
    {
        var path = arguments.Positionals.FirstOrDefault();
        var target = ResolveReportPath(path);
        var report = CreateInspectionReport("graph", "all", target, includeDetail: true, timestamp);
        var graph = arguments.GraphFormat == GraphFormat.Dot
            ? GraphFormatter.ToDot(report, arguments.Cluster)
            : GraphFormatter.ToMermaid(report, arguments.Direction, arguments.Cluster);

        return CliResult.Success(graph);
    }

    private static CliResult RunScan(CliArguments arguments, DateTimeOffset timestamp)
    {
        var path = arguments.Positionals.FirstOrDefault();
        var target = ResolveReportPath(path);
        var sections = AstraFlowScanner.ScanMigrationCandidates(target);
        var report = new CliReport(
            "scan",
            timestamp.UtcDateTime.ToString("O"),
            target,
            sections.Count == 0 ? "ok" : "candidates",
            sections,
            []);

        return CliResult.Success(FormatReport(report, arguments.Output));
    }

    private static bool IsInspectCategory(string? value)
    {
        return value is "handlers" or "notifications" or "mappings" or "projections";
    }

    private static bool IsHelp(string argument)
    {
        return argument is "-h" or "--help" or "help";
    }

    private static string ResolveReportPath(string? path)
    {
        var candidate = string.IsNullOrWhiteSpace(path) ? Directory.GetCurrentDirectory() : path;
        return Path.GetFullPath(candidate);
    }
}

public sealed record CliReport(
    [property: JsonPropertyName("command")] string Command,
    [property: JsonPropertyName("timestamp")] string Timestamp,
    [property: JsonPropertyName("path")] string Path,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("sections")] IReadOnlyList<CliSection> Sections,
    [property: JsonPropertyName("findings")] IReadOnlyList<CliFinding> Findings);

public sealed record CliSection(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("items")] IReadOnlyList<CliItem> Items);

public sealed record CliItem(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("source")] string Source,
    [property: JsonPropertyName("detail")] string? Detail);

public sealed record CliFinding(
    [property: JsonPropertyName("code")] string Code,
    [property: JsonPropertyName("severity")] string Severity,
    [property: JsonPropertyName("subject")] string Subject,
    [property: JsonPropertyName("message")] string Message);

public enum OutputFormat
{
    Text,
    Json,
    Markdown,
    Sarif
}

public enum GraphFormat
{
    Mermaid,
    Dot
}

internal sealed class CliArguments
{
    private CliArguments()
    {
    }

    public List<string> Positionals { get; } = [];

    public OutputFormat Output { get; private set; } = OutputFormat.Json;

    public GraphFormat GraphFormat { get; private set; } = GraphFormat.Mermaid;

    public string Direction { get; private set; } = "TB";

    public bool Cluster { get; private set; }

    public bool Detail { get; private set; }

    public bool Help { get; private set; }

    public static CliArguments Parse(IEnumerable<string> rawArguments)
    {
        var arguments = new CliArguments();
        var values = rawArguments.ToArray();

        for (var index = 0; index < values.Length; index++)
        {
            var value = values[index];

            switch (value)
            {
                case "-h":
                case "--help":
                    arguments.Help = true;
                    break;
                case "--detail":
                    arguments.Detail = true;
                    break;
                case "--cluster":
                    arguments.Cluster = true;
                    break;
                case "-o":
                case "--output":
                    arguments.Output = ParseOutput(NextValue(values, ref index, value));
                    break;
                case "--format":
                    arguments.GraphFormat = ParseGraphFormat(NextValue(values, ref index, value));
                    break;
                case "--direction":
                    arguments.Direction = ParseDirection(NextValue(values, ref index, value));
                    break;
                default:
                    arguments.Positionals.Add(value);
                    break;
            }
        }

        return arguments;
    }

    private static string NextValue(string[] values, ref int index, string option)
    {
        if (index + 1 >= values.Length)
        {
            throw new InvalidOperationException($"{option} requires a value.");
        }

        index++;
        return values[index];
    }

    private static OutputFormat ParseOutput(string value)
    {
        return value.ToLowerInvariant() switch
        {
            "text" => OutputFormat.Text,
            "json" => OutputFormat.Json,
            "markdown" or "md" => OutputFormat.Markdown,
            "sarif" => OutputFormat.Sarif,
            _ => throw new InvalidOperationException($"Unknown output format '{value}'.")
        };
    }

    private static GraphFormat ParseGraphFormat(string value)
    {
        return value.ToLowerInvariant() switch
        {
            "mermaid" => GraphFormat.Mermaid,
            "dot" => GraphFormat.Dot,
            _ => throw new InvalidOperationException($"Unknown graph format '{value}'.")
        };
    }

    private static string ParseDirection(string value)
    {
        return value.ToUpperInvariant() switch
        {
            "TB" => "TB",
            "LR" => "LR",
            _ => throw new InvalidOperationException("--direction accepts TB or LR.")
        };
    }
}

internal static class AstraFlowScanner
{
    private static readonly (string Section, string Type, string Token)[] InspectionRules =
    [
        ("handlers", "request-handler", "IRequestHandler<"),
        ("handlers", "stream-handler", "IStreamRequestHandler<"),
        ("notifications", "notification-handler", "INotificationHandler<"),
        ("mappings", "mapping-rule", "IObjectMappingRule"),
        ("projections", "projection", "IProjection<")
    ];

    private static readonly (string Type, string Token, string Message)[] MigrationRules =
    [
        ("mediatr", "MediatR", "MediatR usage can usually migrate toward AstraFlow.Mediator explicit handlers and contracts."),
        ("automapper", "AutoMapper", "AutoMapper usage can usually migrate toward AstraFlow.Mapper rules or opt-in convention mapping.")
    ];

    public static IReadOnlyList<CliSection> Inspect(string target, string category, bool includeDetail)
    {
        var files = EnumerateSourceFiles(target).ToArray();
        var rules = InspectionRules
            .Where(rule => category == "all" || rule.Section == category)
            .ToArray();

        return rules
            .GroupBy(rule => rule.Section)
            .Select(group =>
            {
                var items = files
                    .SelectMany(file => FindItems(file, group, includeDetail))
                    .OrderBy(item => item.Id, StringComparer.Ordinal)
                    .ToArray();

                return new CliSection(group.Key, items);
            })
            .Where(section => section.Items.Count > 0)
            .ToArray();
    }

    public static IReadOnlyList<CliSection> ScanMigrationCandidates(string target)
    {
        var files = EnumerateSourceFiles(target).Concat(EnumerateProjectFiles(target)).Distinct(StringComparer.Ordinal).ToArray();
        var items = files
            .SelectMany(file => FindMigrationItems(file))
            .OrderBy(item => item.Id, StringComparer.Ordinal)
            .ToArray();

        return items.Length == 0 ? [] : [new CliSection("migration-candidates", items)];
    }

    private static IEnumerable<CliItem> FindItems(
        string file,
        IEnumerable<(string Section, string Type, string Token)> rules,
        bool includeDetail)
    {
        var lines = File.ReadLines(file).Select((text, index) => (Text: text, Line: index + 1));

        foreach (var line in lines)
        {
            foreach (var rule in rules)
            {
                if (line.Text.Contains(rule.Token, StringComparison.Ordinal))
                {
                    var id = $"{Path.GetFileName(file)}:{line.Line}:{rule.Type}";
                    var detail = includeDetail ? line.Text.Trim() : null;
                    yield return new CliItem(id, rule.Type, file, detail);
                }
            }
        }
    }

    private static IEnumerable<CliItem> FindMigrationItems(string file)
    {
        var text = File.ReadAllText(file);

        foreach (var rule in MigrationRules)
        {
            if (text.Contains(rule.Token, StringComparison.OrdinalIgnoreCase))
            {
                yield return new CliItem(Path.GetFileName(file), rule.Type, file, rule.Message);
            }
        }
    }

    private static IEnumerable<string> EnumerateSourceFiles(string target)
    {
        return EnumerateFiles(target, "*.cs");
    }

    private static IEnumerable<string> EnumerateProjectFiles(string target)
    {
        return EnumerateFiles(target, "*.csproj");
    }

    private static IEnumerable<string> EnumerateFiles(string target, string pattern)
    {
        if (File.Exists(target))
        {
            return Path.GetExtension(target).Equals(Path.GetExtension(pattern.Replace("*", "x")), StringComparison.OrdinalIgnoreCase)
                ? [target]
                : [];
        }

        if (!Directory.Exists(target))
        {
            return [];
        }

        return Directory.EnumerateFiles(target, pattern, SearchOption.AllDirectories)
            .Where(file => !file.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
                && !file.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase));
    }
}

internal sealed record ReportSnapshot(IReadOnlySet<string> Items)
{
    public static ReportSnapshot Load(string path)
    {
        using var document = JsonDocument.Parse(File.ReadAllText(path));
        var items = new SortedSet<string>(StringComparer.Ordinal);

        if (document.RootElement.TryGetProperty("sections", out var sections))
        {
            foreach (var section in sections.EnumerateArray())
            {
                var sectionName = section.GetProperty("name").GetString() ?? "unknown";

                foreach (var item in section.GetProperty("items").EnumerateArray())
                {
                    var id = item.GetProperty("id").GetString() ?? "unknown";
                    items.Add($"{sectionName}:{id}");
                }
            }
        }

        return new ReportSnapshot(items);
    }
}

internal static class TextFormatter
{
    public static string Format(CliReport report)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"{report.Command}: {report.Status}");
        builder.AppendLine($"path: {report.Path}");

        foreach (var section in report.Sections)
        {
            builder.AppendLine($"{section.Name}: {section.Items.Count}");
        }

        foreach (var finding in report.Findings)
        {
            builder.AppendLine($"{finding.Severity} {finding.Code}: {finding.Message}");
        }

        return builder.ToString().TrimEnd();
    }
}

internal static class MarkdownFormatter
{
    public static string Format(CliReport report)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"# AstraFlow {report.Command} report");
        builder.AppendLine();
        builder.AppendLine($"- Status: `{report.Status}`");
        builder.AppendLine($"- Path: `{report.Path}`");
        builder.AppendLine($"- Timestamp: `{report.Timestamp}`");
        builder.AppendLine();

        foreach (var section in report.Sections)
        {
            builder.AppendLine($"## {section.Name}");
            builder.AppendLine();
            builder.AppendLine("| Type | Source | Detail |");
            builder.AppendLine("| --- | --- | --- |");

            foreach (var item in section.Items)
            {
                builder.AppendLine($"| `{item.Type}` | `{item.Source}` | {EscapeMarkdown(item.Detail ?? item.Id)} |");
            }

            builder.AppendLine();
        }

        if (report.Findings.Count > 0)
        {
            builder.AppendLine("## Findings");
            builder.AppendLine();
            builder.AppendLine("| Severity | Code | Subject | Message |");
            builder.AppendLine("| --- | --- | --- | --- |");

            foreach (var finding in report.Findings)
            {
                builder.AppendLine($"| `{finding.Severity}` | `{finding.Code}` | `{finding.Subject}` | {EscapeMarkdown(finding.Message)} |");
            }
        }

        return builder.ToString().TrimEnd();
    }

    private static string EscapeMarkdown(string value)
    {
        return value.Replace("|", "\\|", StringComparison.Ordinal);
    }
}

internal static class SarifFormatter
{
    public static string Format(CliReport report)
    {
        var rules = report.Findings
            .Select(finding => new
            {
                id = finding.Code,
                name = finding.Code,
                shortDescription = new { text = finding.Message }
            })
            .DistinctBy(rule => rule.id)
            .ToArray();
        var results = report.Findings.Select(finding => new
        {
            ruleId = finding.Code,
            level = ToSarifLevel(finding.Severity),
            message = new { text = finding.Message },
            locations = new[]
            {
                new
                {
                    physicalLocation = new
                    {
                        artifactLocation = new { uri = finding.Subject }
                    }
                }
            }
        });
        var sarif = new
        {
            version = "2.1.0",
            runs = new[]
            {
                new
                {
                    tool = new
                    {
                        driver = new
                        {
                            name = "AstraFlow.Cli",
                            informationUri = "https://github.com/seifmoustafa/AstraFlow",
                            rules
                        }
                    },
                    results
                }
            }
        };

        return JsonSerializer.Serialize(sarif, ProgramJson.Options);
    }

    private static string ToSarifLevel(string severity)
    {
        return severity switch
        {
            "fatal" or "error" => "error",
            "warning" => "warning",
            _ => "note"
        };
    }
}

internal static class GraphFormatter
{
    public static string ToMermaid(CliReport report, string direction, bool cluster)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"flowchart {direction}");
        builder.AppendLine("  root[AstraFlow]");

        foreach (var section in report.Sections)
        {
            var sectionId = Sanitize(section.Name);

            if (cluster)
            {
                builder.AppendLine($"  subgraph {sectionId}[{section.Name}]");
            }

            builder.AppendLine($"  root --> {sectionId}");

            foreach (var item in section.Items)
            {
                builder.AppendLine($"  {sectionId} --> {Sanitize(item.Id)}[{EscapeLabel(item.Type)}]");
            }

            if (cluster)
            {
                builder.AppendLine("  end");
            }
        }

        return builder.ToString().TrimEnd();
    }

    public static string ToDot(CliReport report, bool cluster)
    {
        var builder = new StringBuilder();
        builder.AppendLine("digraph AstraFlow {");
        builder.AppendLine("  root [label=\"AstraFlow\"];");

        foreach (var section in report.Sections)
        {
            var sectionId = Sanitize(section.Name);

            if (cluster)
            {
                builder.AppendLine($"  subgraph cluster_{sectionId} {{");
                builder.AppendLine($"    label=\"{EscapeLabel(section.Name)}\";");
            }

            builder.AppendLine($"  {sectionId} [label=\"{EscapeLabel(section.Name)}\"];");
            builder.AppendLine($"  root -> {sectionId};");

            foreach (var item in section.Items)
            {
                var itemId = Sanitize(item.Id);
                builder.AppendLine($"  {itemId} [label=\"{EscapeLabel(item.Type)}\"];");
                builder.AppendLine($"  {sectionId} -> {itemId};");
            }

            if (cluster)
            {
                builder.AppendLine("  }");
            }
        }

        builder.AppendLine("}");
        return builder.ToString().TrimEnd();
    }

    private static string Sanitize(string value)
    {
        var builder = new StringBuilder();

        foreach (var character in value)
        {
            builder.Append(char.IsLetterOrDigit(character) ? character : '_');
        }

        return builder.ToString();
    }

    private static string EscapeLabel(string value)
    {
        return value.Replace("\"", "\\\"", StringComparison.Ordinal);
    }
}

internal static class ProgramJson
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };
}

internal sealed record CliResult(int ExitCode, string Output, string? Error)
{
    public static CliResult Success(string output, int exitCode = 0)
    {
        return new CliResult(exitCode, output, null);
    }

    public static CliResult Fail(string error)
    {
        return new CliResult(1, string.Empty, error);
    }
}

internal static class CliHelp
{
    public const string Text = """
        AstraFlow CLI

        Usage:
          astraflow inspect [handlers|notifications|mappings|projections] [path] [--detail] [-o json|markdown|sarif|text]
          astraflow validate [path] [-o json|markdown|sarif|text]
          astraflow report [path] [-o json|markdown|sarif|text]
          astraflow diff <before.json> <after.json> [-o json|markdown|text]
          astraflow graph [path] [--format mermaid|dot] [--direction TB|LR] [--cluster]
          astraflow scan [path] [-o json|markdown|text]
        """;

    public static string For(string command)
    {
        return command switch
        {
            "inspect" => "Usage: astraflow inspect [handlers|notifications|mappings|projections] [path] [--detail] [-o json|markdown|sarif|text]",
            "validate" => "Usage: astraflow validate [path] [-o json|markdown|sarif|text]",
            "report" => "Usage: astraflow report [path] [-o json|markdown|sarif|text]",
            "diff" => "Usage: astraflow diff <before.json> <after.json> [-o json|markdown|text]",
            "graph" => "Usage: astraflow graph [path] [--format mermaid|dot] [--direction TB|LR] [--cluster]",
            "scan" => "Usage: astraflow scan [path] [-o json|markdown|text]",
            _ => Text
        };
    }
}
