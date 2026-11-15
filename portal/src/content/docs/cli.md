# AstraFlow CLI Tool

`AstraFlow.Cli` installs the `astraflow` command-line tool for inspecting handlers, validating contracts, diffing snapshots, generating JSON/Markdown/SARIF reports, exporting architecture graphs, and reviewing assertion migration candidates from source trees in local workflows and CI pipelines.

The 2.4.0 release adds read-only assertion migration review through `astraflow assertions analyze`. Results include relative locations, method names, behavior-verified mappings where available, review candidates, and syntax warnings; the command never modifies source files.

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
| `assertions analyze` | `astraflow assertions analyze [path] [--format text\|json]` | Read-only Roslyn migration review with optional project compile metadata; reports verified mappings and review-required candidates without editing source |

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

## Assertion migration analysis

The 2.4.0 release adds `astraflow assertions analyze`, a read-only analysis of fluent assertion calls in C# source. It scans one C# file, a `.csproj`, `.sln`, `.slnx`, or a directory recursively. If `path` is omitted, it scans the current directory.

```bash
astraflow assertions analyze
astraflow assertions analyze ./src/Checkout
astraflow assertions analyze ./src/Checkout/PaymentTests.cs --format json
```

Reports include a schema version, relative locations, method names, classifications, and safe suggestions. When a single-target project is selected and its existing restore assets are available, the command reads package compile metadata for Roslyn binding. A small set of string equality calls has a behavior-verified AstraFlow mapping; other bound calls require manual review and unresolved calls remain unknown. The command never runs MSBuild, restore, project targets, generators, scripts, or inspected project code, and it never edits source files. Syntax errors, conditional branches, and unevaluated project settings keep results partial. Output omits source expressions and literal values.

| Exit code | Meaning |
| --- | --- |
| `0` | Reserved for a complete analysis; current reports remain partial. |
| `2` | Analysis is partial or at least one finding needs review. |
| `1` | The command, path, output option, or scan encountered a usage or operational error. |

The Roslyn analysis dependency is confined to `AstraFlow.Cli`; `AstraFlow.Assertions` remains dependency-free.

## Output Formats

- **`text`:** Compact human-readable summary for interactive terminal sessions.
- **`markdown`:** Ready to append to pull request summaries or GitHub Step Summaries.
- **`json`:** Deterministic camelCase JSON payload compatible with `astraflow diff` and custom scripts.
- **`sarif`:** Static Analysis Results Interchange Format (`validate`, `inspect`, `report`) for security and code-quality dashboards.

## Related Guides

- Inspect live DI state at runtime in [Startup Diagnostics & Health Reports](/docs/diagnostics).
- Enforce build-time checks inside your IDE via [Build-Time Roslyn Analyzers](/docs/analyzers).
