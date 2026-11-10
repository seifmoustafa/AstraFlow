# AstraFlow CLI

`AstraFlow.Cli` is the command-line package for inspection, reporting, migration assistance, diagnostics diffing, and graph output.

## Install

During local development, run the CLI from source:

```powershell
dotnet run --project src/AstraFlow.Cli -- inspect AstraFlow.slnx
```

After packing and publishing, install it as a .NET tool:

```powershell
dotnet tool install --global AstraFlow.Cli --version 1.13.1
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
```

`path` is optional. It can point at a project, solution, configuration file, or directory. If omitted, the CLI inspects the current directory.

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
