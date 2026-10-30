---
name: package-development
description: Use when changing AstraFlow package ownership or dependencies, target frameworks, NuGet assets, compatibility, or a public API.
---

# AstraFlow package development

1. Read `AGENTS.md`, `.agents/rules/architecture.md`, and `.agents/rules/csharp-and-api.md`. For a cross-package or new capability proposal, use `architecture-and-feature-planning` before settling ownership.
2. Use `docs/package-selection.md` to locate the intended package, then confirm the owner, references, target frameworks, nullable/build settings, and package assets in the actual `.csproj`, `Directory.Build.props`, and nearby implementation/tests.
3. Keep each behavior in its owning package. Put framework, provider, validation, telemetry, and compiler dependencies in the integration package that needs them; preserve optional integrations and the shared contract boundary.
4. Separate lifecycle claims: source present, tested, packed, clean-consumer validated, tagged/published, and supported are distinct facts. Check current version metadata, Git/tag state, NuGet or release evidence when in scope, and dated evidence records. Do not infer a release from a source version, changelog draft, or successful local build.
5. Treat public APIs, diagnostic IDs/severities, generated contracts, CLI/report schemas, and package assets as compatibility-sensitive. Prefer a minimal additive change; inspect the target-framework matrix and update XML docs, the closest user guide, migration notes, and changelog when the contract or behavior warrants it.
6. Add focused cases to the existing test project for changed behavior and meaningful failure modes. Run the narrowest useful verification, then expand for public API, multi-target, generator/analyzer, package, or cross-package impact. Never generalize one target's result to the full matrix.
7. For public API or package work, inspect the relevant compatibility/package-install/sample/upgrade scripts and their parameters before running them. Report exact commands and observed outcomes; identify remaining release gates.

## Completion notes

Summarize the owning package and why it owns the behavior, public/package surface changes, docs and tests changed, and verification evidence. State source/release status accurately and flag target frameworks or package-consumer scenarios not checked.

