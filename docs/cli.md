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
astraflow graph [path] --format mermaid|dot --direction TB|LR --cluster
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
