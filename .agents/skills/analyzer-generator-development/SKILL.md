---
name: analyzer-generator-development
description: Use when changing AstraFlow Roslyn analyzers, compiler diagnostics, source-generator infrastructure, or NuGet analyzer assets. Use mapper or mediator skills for their generated behavior contracts.
---

# AstraFlow analyzer and generator development

1. Read `AGENTS.md`, `.agents/rules/architecture.md`, `.agents/rules/csharp-and-api.md`, and the relevant sections of `docs/analyzers.md`, `docs/generators.md`, `docs/api-governance.md`, and `docs/compatibility.md`.
2. Confirm the compiler-facing project, test project, target frameworks, Roslyn versions, and NuGet analyzer asset layout from the current `.csproj`, tests, and package scripts. Keep compiler dependencies isolated from runtime packages.
3. Preserve diagnostic ID, category, severity, message, location, suppression, and versioning contracts. Reuse established IDs only for the same rule; use source locations and actionable messages where supported. Check `src/AstraFlow.Generators/AnalyzerReleases.Unshipped.md` for release tracking.
4. For generators, define supported and rejected syntax/semantic shapes, deterministic hint names/output, duplicate behavior, and diagnostics before implementation. Preserve incremental behavior: avoid unnecessary compilation-wide scans or collection-wide invalidation, and profile cost when scale or build performance is part of the claim.
5. Test valid output and compilation, invalid/unsupported inputs, duplicate declarations, nullable and language-version cases, deterministic regeneration, incremental edits, and target-framework/package consumption as relevant. Generated code must compile without hidden runtime dependencies and must preserve nullable and cancellation contracts where applicable.
6. Treat generated metadata, generated registrations, and executable generated paths as different product capabilities. Read the relevant ADR/plan and current evidence before describing maturity. For mapping execution, read `docs/adr/0001-generated-mapper.md`, `docs/plans/v2.1-generated-mapping.md`, and `docs/decisions/`; for mediator generation, read `docs/adr/0002-generated-mediator.md` and `docs/plans/v2.4-generated-mediator.md`.
7. Preserve privacy and security boundaries: no payloads, secrets, or raw sensitive values in diagnostics/output; naming heuristics are not authorization and compile-time checks cannot silently claim knowledge of runtime-configured policy.
8. Update the closest analyzer/generator guide, rule catalog or migration note when user-visible contracts change. Validate generator/analyzer tests, package assets, clean consumers, supported compiler/TFM matrix, and compatibility surfaces in proportion to the change; report exact scope.
