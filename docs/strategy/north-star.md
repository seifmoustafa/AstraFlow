# AstraFlow North Star — The Developer Experience We Intend to Build

> **Proposal (not a list of shipped features)** · Updated 2026-10-29 · Standalone MIT-licensed .NET package family.

## The vision

AstraFlow aims to become a **default-quality foundation for .NET application flow**: code that is straightforward to author, exceptionally inspectable, measured for execution cost, and safer to evolve. The long-term ambition is category-defining developer productivity with rigorous, explainable engineering—not a monolith that implements every popular library.

> **Product promise:** Declare intent clearly. Execute predictably. Inspect exactly what can be known. Catch mistakes before production. Keep the freedom to choose your stack.

### The differentiating combination

1. **Best-in-class *clarity* as a product feature:** a request's handler, pipeline sequence and mapping members should be discoverable without debugging internals.
2. **Generated when possible, extensible when needed:** generated, type-safe execution for statically understood shapes; compatible explicit runtime paths for hard or dynamic cases; no silent mode changes.
3. **Security that can be examined:** redacted diagnostics, sensitive-write policy, plain-language findings, explicit exceptions and documented classifier limitations.
4. **Excellent adoption mechanics:** predictable licensing, stable APIs, clean package boundaries, migration examples and working consumers.
5. **Evidence-backed performance:** correctness first, then latency, allocations, build time, binary size and AOT behavior; comparisons published with reproducibility details.
6. **Community-shaped expansion:** optional packages solve repeat problems and remain useful individually; no feature-count vanity.

## What exceptional feels like

A developer should be able to:
- Register a typed request and diagnose missing/duplicate handlers at build or startup as appropriate.
- Read **ordered** pipeline composition and distinguish static registration from runtime behavior.
- Declare a simple mapping and inspect readable, generated assignments, with unsupported cases called out.
- Understand why a sensitive member was included/excluded, and whether the policy used a heuristic or explicit declaration.
- Review a CI mapping/flow diff before an unintended contract change ships.
- Publish AOT and know which execution path was tested rather than trusting a blanket claim.
- Upgrade within documented SemVer/support guarantees without rewriting application architecture.
- Remove an optional integration without rewriting core requests or mappings.

None of those should require a hosted service, product license key, proprietary UI, or private application.

## Ground rules that protect the vision

| Invariant | Decision consequence |
| --- | --- |
| Explicit mapping remains the base | Conventions never become default |
| One behavior, one provable meaning | Generated/runtime parity tested on shared supported semantics |
| Source generator output is an implementation | Metadata generation alone cannot be marketed as a fast path |
| Diagnostics are part of correctness | No performance shortcut that silently removes diagnostics/policy |
| Failure is readable | Clear diagnostic IDs, source locations and fixes; no opaque silent fallback |
| Safe information flow | No request/DTO payload logging, secret-bearing reports or generated literals |
| Compatibility is a feature | Public API review and clean upgrade smoke are release gates |
| Loose coupling beats all-in-one | Framework/provider dependencies stay in optional packages |
| Cost matters | Runtime, build, binary, support and adoption costs reported |
| Customization has boundaries | Small composable extension points, explicit precedence, no global behavior magic |

## Strategic map

| Horizon | Technical bet | Distinguishing value |
| --- | --- | --- |
| Now → v2.1 | Generated object mapper execution | First end-to-end generated conversion with actionable safety diagnostics |
| Existing v2.2–v2.3 | Supply chain and API governance | Enterprise-grade trust *evidence*, not an unproven marketing label |
| Candidate v2.4 | Generated mediator invocation | Faster, inspectable dispatch without breaking DI/pipelines |
| Candidate v2.5 | Explainable flow manifest | Reviewable application-flow changes with confidence labels |
| v2.6+ research | Adoption and reliability | Independent pilots proving time saved and maintainable migration |
| v3+ candidates | Optional integrations | Idempotency/caching/authz/EF/resilience where they cut boilerplate |
| v4+ research | Visual workflow/tooling | Only after a stable metadata schema and user demand |
| Independent product | Identity/Auth | Separate security lifecycle and standards foundation |

Keep [the canonical roadmap](../roadmap.md) and [the decision log](decision-log.md) as the source of planning truth. These horizons are not promises or shipped capabilities.

## Metrics that matter

| Dimension | Measured signal | Unacceptable shortcut |
| --- | --- | --- |
| Developer productivity | Time from clean install to working feature, migrations, debugging minutes | Assuming code volume = time saved |
| Correctness | Contract tests, parity tests, deterministic generation, negative/failure tests | Demo-only success |
| Safety | Sensitive-write negatives, policy bypass prevention, no payload leakage | Name classifier claimed as complete security |
| Runtime | Median + tail distribution where relevant, allocated bytes, startup | Favorable warm microbench only |
| Build | Clean/incremental build cost, generator stability, binary size | Hiding source generation overhead |
| Compatibility | API baseline, supported TFM consumer tests, upgrade smoke | Version bumps without migration proof |
| Adoption | Independent repeat consumers, reported friction and issue resolution | Treating downloads/stars as production adoption |

## How decisions are made

A candidate advances through **Explore → Feasibility spike → Evidence → Approve → Implement one release → Validate → Maintain/Retire**. Each one needs an owner, user problem, minimal alternative considered, testable acceptance criteria, risks, exit evidence and explicit exclusions. If the evidence contradicts the hypothesis, scope shrinks or the feature is shelved.

### What we refuse to become

A giant package that reimplements FluentValidation, Polly, OpenIddict, EF and every message broker; a generator that silently changes meaning; a mapper that leaks secrets by convention; a hosted dependency required by local code; a rapid-release project with unstable public APIs; or a benchmark brand without reproducible numbers.

## Navigation

- [Architecture blueprint](../engineering-blueprint.md)
- [Current release roadmap](../roadmap.md)
- [Generated mapper decision](../adr/0001-generated-mapper.md) and [v2.1 plan](../plans/v2.1-generated-mapping.md)
- [Mediator decision](../adr/0002-generated-mediator.md)
- [Flow intelligence decision](../adr/0003-flow-manifest.md)
- [Evidence/release gates](evidence-and-gates.md)
- [Ecosystem admission rules](ecosystem-portfolio.md)
- [Open decisions](decision-log.md)
