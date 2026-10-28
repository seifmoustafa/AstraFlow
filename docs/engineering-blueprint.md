# AstraFlow v2 — Engineering blueprint

**Status:** Strategy proposal for maintainer review. Not a code implementation or release announcement. **Date:** 2026-10-29.

## Objective
Turn an existing explicit, diagnostics-first .NET package family into a demonstrably productive and high-performance application-flow toolkit. Prioritize correct generated mapper execution and generated mediator dispatch, preserve runtime extensibility and package independence, and promote optional integrations only when verified user problems justify them.

## Source baseline
The repository already contains request/notification/stream dispatch, pipelines, explicit and opt-in convention mapping, projection validation, analyzer foundations, generated mediator *registrations*, generated mapper/projection *metadata*, diagnostics/CLI, security primitives, benchmarks, and consumer tests. **Generated metadata is not generated object mapping execution. Generated registration is not generated request dispatch.**

The full local engineering blueprint used in this review is a *proposal* and should be kept distinct from implementation evidence. Consult the focused ADRs and the release plan linked below; do not treat an API sketch as public API.

## Architecture decisions
- **Mapper:** generated, typed object conversions from compiler-visible declarations; a narrow supported subset first. Preserve IMapper runtime rules. Document unsupported constructs; no silent generated-only fallback. Evaluate generated DI adapter only if duplicate mapping ownership and lifetime behavior remain correct.
- **Mediator:** investigate closed-request generated invokers and compare them with current runtime optimizations before picking an approach. Preserve behavior ordering, cancellation, exception handling, short circuiting and scoped DI resolution.
- **Security:** apply sensitive-property policy and redaction consistently across diagnostics, generated output and conventions; name heuristics do not prove data safety.
- **Intelligence:** deterministic versioned manifest and diff via existing CLI tools with confidence labels. Do not misrepresent inferred runtime edges as a precise execution graph.
- **Ecosystem:** independently optional adapters to established .NET infrastructure; separate authentication research, never an auth dependency of core.

## Engineering acceptance
For each release: current SHA and NuGet verification, API compatibility review, clean consumer, complete tests, package verification, AOT publish/run where claimed, source generator snapshots, reproducible performance including build/size overhead, migration docs, failure cases and redaction tests. Do one release at a time and stop for maintainer approval.

## Decision records
- [Generated mapping](adr/0001-generated-mapper.md) — [v2.1 implementation plan](plans/v2.1-generated-mapping.md)
- [Generated mediator](adr/0002-generated-mediator.md)
- [Flow manifest](adr/0003-flow-manifest.md)
- [North star](strategy/north-star.md)
- [Evidence and gates](strategy/evidence-and-gates.md)
- [Ecosystem portfolio](strategy/ecosystem-portfolio.md)
- [Decision log](strategy/decision-log.md)

## Failure conditions
Abandon or reduce a planned optimization if generated code increases build complexity without meaningful user value, changes mapping semantics, creates unknown AOT/trim behavior, weakens confidentiality, or cannot be measured fairly. Never claim fastest, complete replacement, production proven or enterprise ready without published evidence.
