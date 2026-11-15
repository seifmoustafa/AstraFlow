# AstraFlow CLI

`AstraFlow.Cli` is the command-line package for inspection, reporting, migration assistance, diagnostics diffing, and graph output.

## Install

During local development, run the CLI from source:

```powershell
dotnet run --project src/AstraFlow.Cli -- inspect AstraFlow.slnx
```

After packing and publishing, install it as a .NET tool:

```powershell
dotnet tool install --global AstraFlow.Cli --version 2.3.0
```

## Commands

```powershell
astraflow inspect [path]
astraflow inspect handlers|notifications|mappings|projections [path] --detail
astraflow validate [path] -o json|markdown|sarif|text
astraflow report [path] -o json|markdown|sarif|text
astraflow diff before.json after.json -o json|markdown|text
astraflow graph [path] --style relational|pipeline|events --group-by module|feature -f|--format mermaid|dot|canvas-json --direction TB|LR -o graph.json
astraflow scan [path] -o json|markdown|text
astraflow assertions analyze [C# file|project|solution|directory] --format text|json
```

`assertions analyze` is a read-only migration aid in the 2.4.0 preview. It accepts a `.cs` file, `.csproj`, `.sln`, `.slnx`, or directory and scans C# source without changing it. When a single-target `.csproj` is selected and restored `obj/project.assets.json` exists, the command may read package compile assets for Roslyn symbol binding. JSON output has a versioned schema with `schemaVersion`, `status`, `resolutionContext`, `filesAnalyzed`, and `findings`; each finding has a code, relative source path, one-based line and column, method name when known, classification, and safe suggestion. Text output presents the same findings. Neither output includes source expressions, literal values, or an absolute project path.

The analyzer uses Roslyn symbol resolution for source declarations and the CLI host's .NET framework metadata. For one selected single-target project, it can also read package compile references from an existing restore-assets file; it does not evaluate project properties, imports, conditional symbols, source inclusion rules, or project references. It never invokes MSBuild, restore, project targets, source generators, scripts, or inspected project code. Bound string equality calls with a verified ordinal mapping are identified separately; other bound assertion-like calls need manual review, unrelated `Should()` methods are skipped, and calls that cannot be bound remain unknown. The command never rewrites source. Conditional branches, syntax errors, and incomplete metadata keep results partial.

The command exits with `2` when analysis is partial or contains review-required findings, and `1` for invalid usage or an operational error. Reports remain partial because project build conditions and source inclusion rules are not evaluated, even when a verified mapping is found. Compile and test the consumer after adapting reported calls.

`path` is optional. If omitted, the CLI inspects the current directory. `-o json` and `-o text` are also accepted for compatibility with the other CLI commands.

Inspection and report commands emit a stable JSON envelope by default:

```json
{"command":"inspect","timestamp":"2026-06-02T12:00:00.0000000Z","path":"D:\\repo\\AstraFlow\\AstraFlow.slnx","status":"ok"}
```

## Output Fields

| Field | Meaning |
| --- | --- |
| `command` | The command that produced the report. |
| `timestamp` | UTC timestamp for the report. |
| `path` | Absolute path being inspected. |
| `status` | Current command status, such as `ok`, `empty`, `changed`, `candidates`, or `error`. |

## Developer Checks

```powershell
dotnet build src/AstraFlow.Cli/AstraFlow.Cli.csproj
dotnet test tests/AstraFlow.Cli.Tests/AstraFlow.Cli.Tests.csproj
dotnet run --project src/AstraFlow.Cli -- inspect AstraFlow.slnx
```

## Output Formats

- `json`: structured command reports.
- `markdown`: human-readable report tables.
- `sarif`: SARIF 2.1.0 result envelope for validation findings.
- `mermaid`: flowchart output from `graph`.
- `dot`: Graphviz DOT output from `graph`.
- `canvas-json`: structured graph output with module/feature clusters, request/handler/response nodes, notification handlers, mapping and projection nodes, typed ports, available edges, source locations, and graph counts. Pass `-o ./graph.json` (or `--output-file`) to write graph output to a file.

Mermaid graph output defaults to the relational request → handler → response layout when it can read a closed `IRequestHandler<TRequest, TResponse>` declaration from an inspected source line. `Result<T>` response wrappers are unwrapped for the response node label. `--group-by feature` nests flows by module and source feature directory; `--group-by module` groups flows directly under modules. Other handler forms are omitted from the relational view. `--style pipeline` emits the five conceptual execution stages and includes behaviors, handlers, notifications, and projections found by source scanning. `--style events` shows notification handler relationships. Cluster identifiers use a separate `cluster_` namespace to avoid Mermaid subgraph/node identifier collisions.

JSON report and Canvas JSON output use relaxed JSON escaping for readable C# generic signatures. This is intended for CLI data output, not embedding JSON directly into an HTML document; HTML consumers must apply their normal output encoding.
