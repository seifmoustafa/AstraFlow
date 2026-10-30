---
name: mapper-projection-development
description: Use when changing AstraFlow explicit or convention mapping, projections, generated mapper semantics, EF translation, or secure-ID mapping. Use analyzer-generator-development for compiler infrastructure itself.
---

# AstraFlow mapper and projection development

1. Read `AGENTS.md`, `.agents/rules/architecture.md`, and `.agents/rules/csharp-and-api.md`. Then read the relevant contracts and scenarios: `docs/mapper.md`, `docs/mapper-scenarios.md`, `docs/convention-mapping.md`, `docs/projections.md`, `docs/projection-scenarios.md`, `docs/security.md`, `docs/generators.md`, or `docs/entity-framework-core.md`.
2. Locate the owner in source and project references: `AstraFlow.Mapper` for explicit rules and runtime mapping; `AstraFlow.Mapper.Conventions` for opt-in convention plans; `AstraFlow.Mapper.EntityFrameworkCore` for provider translation validation; `AstraFlow.Generators` for compiler output; `AstraFlow.Security` for secure-ID primitives. Use `docs/package-selection.md` as a guide, not a substitute for checking current source.
3. Preserve explicit mapping as the predictable baseline. Conventions remain opt-in, plans/finding codes remain inspectable, projections remain expression trees for provider translation, and secure-ID encryption/keys remain application-owned. Do not silently add fallback mapping or change precedence.
4. Treat runtime mapping, generator output, conventions, and EF validation as distinct paths. Generated metadata is not generated execution; experimental execution is not evidence of runtime parity or release support. Read `docs/roadmap.md`, the relevant ADR/plan, and `docs/decisions/` evidence before describing the current stage or claiming equivalence.
5. Preserve diagnostics and compatibility contracts: verify the actual `AFP...`/`AFC...`/`AFM...` identifiers and tests rather than inventing a prefix or reusing an ID. Validate duplicates, missing/unsupported shapes, null behavior, collections, update semantics, provider translation, and fallback behavior as applicable.
6. Treat sensitive-member detection as defense in depth, not authorization or complete classification. Reuse the shared policy; test both sensitive-read and sensitive-write cases. Never place raw IDs, mapped values, payloads, or secrets in findings, generated literals, reports, or telemetry.
7. Update the closest guide and scenario page when user-visible behavior changes. Add focused cases to the owning test project; verify affected target frameworks and use generator, provider, clean-package-consumer, or API checks when the change crosses those boundaries. Report provider/runtime/shape limits explicitly.

