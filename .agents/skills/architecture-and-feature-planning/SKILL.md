---
name: architecture-and-feature-planning
description: Use when evaluating a new AstraFlow capability, making a cross-package architectural decision, or promoting, deferring, or rejecting roadmap work.
---

# AstraFlow architecture and feature planning

Use this workflow for design, prioritization, and roadmap decisions. For implementation, continue with the relevant package or domain skill.

1. Read `AGENTS.md`, `.agents/rules/architecture.md`, `docs/strategy/north-star.md`, `docs/architecture.md`, `docs/package-selection.md`, and the relevant product/API guides. For roadmap work, also read `docs/roadmap.md`, `docs/future-ideas.md`, `docs/strategy/decision-log.md`, and the applicable ADR, plan, evidence, or research record.
2. State the user problem and desired outcome. Establish the actual baseline from source, tests, package references and release evidence; distinguish present, tested, packed, published, proposed, research, and rejected work. Treat vision and candidate lists as direction, not commitments.
3. Find the smallest package owner and public contract. Compare reuse/adaptation of established .NET infrastructure with building new capability. Preserve standalone package usefulness, optional integration boundaries, explicit behavior, compatibility, and the ability to remove an integration without rewriting core code.
4. Make semantics reviewable before API shape: runtime and failure behavior, lifetime/concurrency, cancellation, ordering, security/privacy, supported targets, diagnostics, migration, and operational ownership. Identify failure modes and alternatives; avoid “exactly once,” universal security, AOT, performance, or parity claims without scoped evidence.
5. Define measurable acceptance criteria, negative cases, verification/release gates, exclusions, and a stop condition. For high-risk or uncertain work, propose a feasibility spike before a broad implementation commitment.
6. Record durable choices and conditions for reopening in the appropriate ADR or `docs/strategy/decision-log.md`; update roadmap/future-ideas status only when the decision actually changes it. Keep candidate, approved, implemented, validated, and released states explicit.
7. Route implementation to `package-development`, `mapper-projection-development`, `mediator-development`, or `analyzer-generator-development` and verification to `verification-and-release`. Do not turn a planning artifact into implementation authorization or a release claim.
