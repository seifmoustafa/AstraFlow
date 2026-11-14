# AstraFlow CLI Tool

`AstraFlow.Cli` installs the `astraflow` command-line tool for inspecting handlers, validating contracts, diffing snapshots, generating JSON/Markdown/SARIF reports, exporting architecture graphs, and reviewing assertion migration candidates from source trees in local workflows and CI pipelines.

The planned 2.4.0 release adds read-only, syntax-only assertion migration review through `astraflow assertions analyze`. Results include relative locations, method names, same-name review candidates, and syntax warnings; they do not claim semantic equivalence or modify source files.

## Installation

Install `AstraFlow.Cli` locally in your repository tool manifest or globally:

```bash
# Local repository tool (recommended for CI reproducibility)
dotnet new tool-manifest
dotnet tool install AstraFlow.Cli

# Or global installation
dotnet tool install -g AstraFlow.Cli
```

Invoke the CLI locally with `dotnet tool run astraflow` (or `astraflow` when installed globally):

```bash
astraflow inspect ./src
```

## Available Commands

| Command | Usage | Purpose |
| --- | --- | --- |
| `inspect` | `astraflow inspect [handlers\|notifications\|mappings\|projections] [path] [--detail] [-o json\|markdown\|sarif\|text]` | Lists discovered AstraFlow registrations and candidates across modules |
| `validate` | `astraflow validate [path] [-o json\|markdown\|sarif\|text]` | Audits wiring and emits structured validation findings for CI gates |
| `report` | `astraflow report [path] [-o json\|markdown\|sarif\|text]` | Generates a full architectural inspection report |
| `diff` | `astraflow diff <before.json> <after.json> [-o json\|markdown\|text]` | Compares two saved JSON inspection reports to surface added/removed contracts |
| `graph` | `astraflow graph [path] [--style relational\|pipeline\|events] [--group-by module\|feature] [-f\|--format mermaid\|dot\|canvas-json] [--direction TB\|LR] [-o graph.json]` | Exports dependency and flow diagrams in Mermaid, Graphviz DOT, or Canvas JSON |
| `scan` | `astraflow scan [path] [-o json\|markdown\|text]` | Scans repositories for AstraFlow conventions and migration opportunities |
| `assertions analyze` | `astraflow assertions analyze [path] [-o json\|markdown\|sarif\|text]` | Read-only syntax scan for assertion-call migration review candidates |

## CI Pipeline & SARIF Integration

Generate SARIF reports for GitHub Code Scanning or pull-request review artifacts, or track structural contract changes across releases with `diff`:

```bash
# Export SARIF validation findings
astraflow validate ./src -o sarif > astraflow.sarif

# Export a Mermaid architecture graph grouped by module
astraflow graph ./src --style pipeline --group-by module -f mermaid --direction LR
```

```bash
# Snapshot baseline and compare against current branch
astraflow report ./src -o json > baseline.json
astraflow diff baseline.json current.json -o markdown
```

## Assertion migration review (syntax only)

Planned for AstraFlow 2.4.0, `astraflow assertions analyze` scans one C# source file, a `.csproj` file, or a directory recursively. If `path` is omitted, it scans the current directory.

```bash
astraflow assertions analyze
astraflow assertions analyze ./src/Checkout
astraflow assertions analyze ./src/Checkout/PaymentTests.cs -o sarif > assertions.sarif
```

The report contains relative source locations, method names, same-name review candidates, and warnings when C# syntax errors may make the results incomplete. It is read-only and syntax-only: it does not resolve symbols or confirm that a candidate has equivalent behavior, and it never edits source files. Report output omits source expressions and literal values. Review each candidate manually.

| Exit code | Meaning |
| --- | --- |
| `0` | No review candidates or syntax warnings were found. |
| `2` | Review is required because candidates or syntax warnings were found. |
| `1` | The command, path, output option, or scan encountered a usage or operational error. |

The syntax-analysis dependency is confined to `AstraFlow.Cli`; `AstraFlow.Assertions` remains dependency-free.

## Output Formats

- **`text`:** Compact human-readable summary for interactive terminal sessions.
- **`markdown`:** Ready to append to pull request summaries or GitHub Step Summaries.
- **`json`:** Deterministic camelCase JSON payload compatible with `astraflow diff` and custom scripts.
- **`sarif`:** Static Analysis Results Interchange Format (`validate`, `inspect`, `report`) for security and code-quality dashboards.

## Related Guides

- Inspect live DI state at runtime in [Startup Diagnostics & Health Reports](/docs/diagnostics).
- Enforce build-time checks inside your IDE via [Build-Time Roslyn Analyzers](/docs/analyzers).
