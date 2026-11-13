# AstraFlow CLI Tool

`AstraFlow.Cli` installs the `astraflow` command-line tool for inspecting handlers, validating contracts, diffing snapshots, generating JSON/Markdown/SARIF reports, and exporting architecture graphs from source trees in local workflows and CI pipelines.

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

## Output Formats

- **`text`:** Compact human-readable summary for interactive terminal sessions.
- **`markdown`:** Ready to append to pull request summaries or GitHub Step Summaries.
- **`json`:** Deterministic camelCase JSON payload compatible with `astraflow diff` and custom scripts.
- **`sarif`:** Static Analysis Results Interchange Format (`validate`, `inspect`, `report`) for security and code-quality dashboards.

## Related Guides

- Inspect live DI state at runtime in [Startup Diagnostics & Health Reports](/docs/diagnostics).
- Enforce build-time checks inside your IDE via [Build-Time Roslyn Analyzers](/docs/analyzers).
