# AstraFlow North Star — 2026 strategy proposal

**Status: proposed; not a shipped-feature claim.** This strategy complements [the roadmap](../roadmap.md), [engineering blueprint](../engineering-blueprint.md) and [release gates](evidence-and-gates.md).

## Mission
Build an independently adoptable MIT-licensed .NET application-flow ecosystem that saves measurable developer time through **predictable execution, inspectable mapping, compile-time feedback and optional integration**. Compete on verified utility, not package counts or unsubstantiated superlatives.

## Product pillars
1. **Mapper:** explicit mapping stays the default; opt-in conventions remain isolated. Add real, deterministic generated *runtime conversion*, not just generated metadata; disclose generated and runtime paths.
2. **Mediator:** preserve all existing request, notification, stream and pipeline semantics. Investigate generated closed-type dispatch only after measuring the current runtime; DI scoping and behavior equivalence are nonnegotiable.
3. **Intelligence:** reuse diagnostics/analyzers/CLI metadata to explain registrations, mapping plans, changes and statically demonstrable flow links. Mark inferred/dynamic relationships explicitly.
4. **Trust:** secure-field policy, no payload logging, compatibility, SourceLink, provenance, benchmark reproducibility, redaction and upgrade tests.
5. **Ecosystem:** optional integrations address specific adopted use cases. Do not force EF, ASP.NET, validation, telemetry or distributed infrastructure into the core.

## Engineering invariants
- No unreviewed breaking public API changes; no implicit reversed or convention mapping.
- No duplicate registration silently wins; no generated-only mode silently falls back to reflection.
- No generator implementation claims to understand arbitrary runtime delegates, resolvers or DI configuration.
- No silent security bypass, default payload capture or source-generated embedded secrets.
- Deterministic generated output; diagnostics with actionable source locations; bounded compile-time overhead.
- Package owners maintain a test matrix, API baseline, migration notes, security model and explicit exclusion list.
- A new extension point must solve a documented concrete scenario; customization does not mean unbounded switches.

## What changes our mind?
Negative benchmarks, unacceptable incremental build time, AOT warnings, more support burden than user value, or failed independent consumer pilots trigger a reduced-scope implementation or cancellation—not marketing spin.

## Success measures
Time to first working handler/map; minutes to migrate a representative consumer; correctly diagnosed regressions; runtime latency/allocations **and** build-time cost; AOT publish/run; independent-user retention and issue resolution. Record baselines before claiming improvement.

## Package admission
Two real use cases or documented recurring demand, a maintainer, isolated dependencies, security and failure-mode analysis, clean sample consumer, and support cost. Authentication is a distinct product feasibility study, not an AstraFlow core feature.
