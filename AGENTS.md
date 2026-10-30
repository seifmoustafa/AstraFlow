# AstraFlow Agent Guide

This file and `.agents/` are the repository's canonical agent guidance. `CODEX.md`, `CLAUDE.md`, `.codex/`, and `.claude/` are compatibility entry points only; do not maintain a second set of project rules there.

## Start here

1. Read this file and the applicable guidance in `.agents/rules/` before changing code or documentation.
2. Use the relevant workflow in `.agents/skills/` for package, mapper/projection, mediator, analyzer/generator, feature-planning, or verification work. Skills add task-specific guidance; this file remains the shared baseline.
3. Inspect nearby code, tests, project files, and docs before choosing a pattern. Existing public behavior and explicit user requirements take precedence over assumptions in guidance.
4. Keep changes within the owning package and its tests unless the change requires a cross-package contract update.

## Project at a glance

AstraFlow is a modular .NET library suite for mediator patterns, object mapping and projections, diagnostics, analyzers and source generators, ASP.NET Core integration, security helpers, testing utilities, and related extensions. The solution is `AstraFlow.slnx`; production projects are under `src/`, tests under `tests/`, samples under `samples/`, benchmarks under `benchmarks/`, and user documentation under `docs/`.

## Repository rules

- Preserve package boundaries and optional-dependency boundaries. `AstraFlow.Contracts` is the shared contract layer; integrations should depend only on the packages they need. Do not add a dependency to the core package merely to support an optional integration.
- Treat public APIs as compatibility-sensitive. Prefer additive, minimal changes; check target frameworks, nullable annotations, package metadata, XML documentation, and existing compatibility scripts when public surface changes.
- Keep behavior consistent across supported target frameworks. Check the affected `.csproj` and `Directory.Build.props`; do not assume every package has the same target frameworks.
- Follow existing C# style, naming, cancellation-token flow, diagnostics, and exception behavior in the owning package. Do not impose application-layer patterns such as `Result<T>` or entity conventions on this library.
- Security-sensitive mapping, redaction, diagnostics, and endpoint behavior must preserve the documented safety defaults. Never expose payload values, secrets, or sensitive identifiers in telemetry or diagnostics unless the existing contract explicitly permits it.
- Update the closest documentation and tests when behavior or public contracts change. Avoid unrelated formatting, generated output, and broad rewrites.
- Do not claim verification that was not run. Report commands and outcomes accurately; distinguish a focused check from the full release matrix.

## Useful commands

Run the narrowest relevant checks first, then broaden based on impact:

```powershell
dotnet build AstraFlow.slnx --no-restore
dotnet test AstraFlow.slnx --no-build
dotnet test tests/AstraFlow.Mediator.Tests/AstraFlow.Mediator.Tests.csproj
dotnet test tests/AstraFlow.Mapper.Tests/AstraFlow.Mapper.Tests.csproj
```

For release or package changes, inspect and use the repository scripts as appropriate:

- `scripts/verify-api-compatibility.ps1`
- `scripts/verify-package-install.ps1`
- `scripts/verify-sample-builds.ps1`
- `scripts/verify-upgrade-smoke.ps1`
- `scripts/pack.ps1`
- `scripts/publish-nuget.ps1` (publishing is an external action and requires explicit user authorization)

Read script parameters before invoking a script. Do not publish packages, push commits, or modify external services unless the user explicitly requested that action.

## Canonical guidance map

- `.agents/README.md` — ownership and update policy.
- `.agents/rules/architecture.md` — package boundaries and project structure.
- `.agents/rules/csharp-and-api.md` — code and public API expectations.
- `.agents/rules/verification.md` — verification selection and evidence.
- `.agents/skills/package-development/SKILL.md` — package and public API changes.
- `.agents/skills/mapper-projection-development/SKILL.md` — mapping, projection, generator, and security-sensitive mapping work.
- `.agents/skills/mediator-development/SKILL.md` — mediator dispatch, pipelines, notifications, and integrations.
- `.agents/skills/analyzer-generator-development/SKILL.md` — Roslyn analyzers, source generators, diagnostics, and compiler-facing package validation.
- `.agents/skills/architecture-and-feature-planning/SKILL.md` — package fit, proposal status, ADRs, roadmap decisions, and evidence gates.
- `.agents/skills/verification-and-release/SKILL.md` — focused verification, package validation, and release preparation.

