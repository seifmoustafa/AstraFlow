---
name: mediator-development
description: Use when changing AstraFlow request/stream dispatch, handler or pipeline semantics, notifications, generated mediator support, or mediator integrations.
---

# AstraFlow mediator development

1. Read `AGENTS.md`, `.agents/rules/architecture.md`, and `.agents/rules/csharp-and-api.md`. Read the relevant contract/scenario docs: `docs/mediator.md`, `docs/mediator-scenarios.md`, `docs/generators.md`, `docs/fluentvalidation.md`, and `docs/observability.md`.
2. Confirm the owner in current source: shared abstractions in `AstraFlow.Contracts`; runtime dispatch, handlers, pipelines, streams, and notification publishing in `AstraFlow.Mediator`; generated registration/dispatch in `AstraFlow.Generators`; adapters in their optional integration packages.
3. Preserve observable semantics: typed and runtime resolution, zero/one/multiple handler cases, DI scope and disposal, pipeline ordering, stream laziness and cancellation, notification strategy/order/failure policy, and pre/post/exception flow. Follow scenario docs and neighboring tests; do not infer undocumented behavior.
4. Treat generated registration metadata and executable generated dispatch as different capabilities. Before changing or describing a generated path, inspect its implementation, the v2.4 plan/ADR, and evidence; proposal or generated registrations do not establish runtime dispatch parity or a shipped optimization.
5. Keep optional behavior opt-in and integration dependencies out of core. Propagate cancellation through sender, behaviors, handlers, publisher, and async enumeration; preserve exception behavior unless the documented contract intentionally changes.
6. Add focused cases in the owning mediator/integration/generator test project for the changed behavior and adjacent failure conditions. Update the scenario guide when an application-visible contract changes.
7. Build and run the narrowest affected checks. For generator, API, or package changes, select generated-output, multi-target, package, sample, and compatibility checks according to risk; report exact evidence and unverified semantics.

