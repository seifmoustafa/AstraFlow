# AstraFlow — Engineering North Star & Product Architecture Blueprint

> **Status: Strategic proposal for review — not a released capability or an approved API contract.** Updated 2026-10-29. This document defines the ambition, technical boundaries, engineering proof and sequence of decisions. The canonical shipped/planned release history remains in [roadmap.md](roadmap.md).

## 1. The ambition: a category-defining .NET development experience

**AstraFlow should be the application-flow toolkit developers choose because it makes important code easier to write, understand, validate, evolve and operate—not because it contains the most packages.**

The five-part product promise:

1. **Design with intent:** explicit requests, typed handlers, mapping rules and declared security policy; opt-in conventions only where useful.
2. **Execute efficiently:** compiler-generated paths for proven static shapes, well-designed runtime paths for legitimately dynamic shapes.
3. **Explain every decision:** inspect handler ownership, pipeline order, mapping member provenance, projection limitations and relevant diagnostics.
4. **Catch mistakes early:** compile-time diagnostics, startup validation and upgrade-time diffs; report uncertainty rather than pretending analysis is omniscient.
5. **Adopt without lock-in:** individually usable MIT packages, predictable APIs, no license keys, framework-specific integrations only when requested.

The aspirational experience is: *a developer declares the intent, gets reliable execution, can inspect exactly what will happen, sees unsafe or unsupported changes in CI, and can migrate an existing application with minimal surprises.*

### Experiences that would make AstraFlow remarkable

| Developer moment | Intended experience | What would prove it |
| --- | --- | --- |
| Create a DTO mapper | Declare a typed map; inspect generated readable C# and diagnostics | Clean package consumer runs mapping; source snapshots and negative tests |
| Change a sensitive DTO | Understand which members changed and why they are allowed | Security policy report and deterministic mapping-plan diff |
| Add a request handler | Get early missing/duplicate/ambiguous-handler feedback | Analyzer + runtime validation parity tests |
| Debug unexpected behavior | See actual registered order, origin and limitations | CLI report with source-of-truth links and no payloads |
| Publish Native AOT | Know exactly which route is generated, and what isn't | Clean app publish **and execute** with evaluated trim warnings |
| Upgrade AstraFlow | Know whether behavior or public APIs changed | Versioned migration guide, API baseline and consumer upgrade tests |
| Evaluate performance | See equal-workload benchmarks including build costs | Reproducible raw results, current baselines and caveats |

This is a **north star**, not a claim that all the experiences exist now.

## 2. Reality baseline and missing capabilities

Repository documentation describes a substantial existing foundation: mediator request/void/stream flows, notifications, pipeline behaviors, explicit mapper, opt-in conventions, projections/EF validation, diagnostics, testing, analyzers, generators, CLI, OpenTelemetry and shared security governance.

**Crucial distinction:** generated *mediator registrations* are not generated *dispatch*. Generated mapping/projection *metadata* is not executable generated object mapping. A BenchmarkDotNet project is not evidence that AstraFlow leads competitors. A v2.0.0 source version is not proof of identical NuGet and GitHub Release publication states.

Priorities are therefore:
- **P0:** real generated mapping execution with specified behavior, a small supported subset, diagnostics and measured cost.
- **P1:** production-confidence work continuously: backwards compatibility, supply chain, security and clean install/AOT checks.
- **P2 candidate:** generated closed-request mediator dispatch, only if source-level investigation and benchmarks support it.
- **P3 candidate:** versioned, explainable flow manifest and actionable diffs.
- **P4 research:** justified integration ecosystem and separate authentication product.

Unverified by this documentation PR: end-to-end compile/test/pack status, generator engine internals, benchmark outcomes, true AOT compatibility or independent adoption.

## 3. Architecture: generated where provable, runtime where necessary

```text
Developer intent (explicit contracts, mapping declarations, opt-in policies)
                          |
        +-----------------+------------------+
        |                                    |
    Compile-time                           Runtime
 Roslyn analyzers / generators       Explicit registrations / opt-in conventions
        |                                    |
 Generated typed execution           Safe dynamic execution
        |                                    |
        +-----------------+------------------+
                          |
             Registration / execution provenance
                          |
          Diagnostics, plans, manifests, tests, CI
                          |
                 Optional integrations
       ASP.NET / EF / validation / telemetry / other adapters
```

**Single semantic contract is the target, not one universal implementation.** Where generated and runtime routes claim the *same* supported mapping or dispatch semantics, differential tests must prove observational equivalence: value, exceptions, cancellation, ordering, scoping and policy checks. When semantics differ, make the difference explicit in APIs and documentation.

### Capability ownership

| Owner | Responsibilities | Not allowed to own |
| --- | --- | --- |
| `Contracts` | Stable request/notification contracts | DI or web host |
| `Mediator` | Dispatch, pipeline semantics, notification policies | Broker, workflow engine, scheduler |
| `Mapper` | Explicit rules, mapping/projection contracts | Implicit conventions or EF provider dependencies |
| `Mapper.Conventions` | Deliberate runtime mapping automation | Default mapping behavior |
| `Generators` / `Analyzers` | Static generated code, actionable diagnostics | Undocumented runtime policy inference |
| `Diagnostics` / `Cli` | Explainable metadata, reports, diff, graph | Request payload store |
| `Security` | Shared redaction/classification primitives | Application cryptography, authorization decisions |
| Integration packages | Adapters to framework/infrastructure | Core dependency leakage |

## 4. Mapper engine: a deliberate two-route execution model

### The v2.1 hypothesis
Compiler-visible, explicitly declared, simple object mappings can execute as readable generated C# with useful static errors and potentially lower runtime overhead. Generated mapper metadata exists already; executable mapping is the new work.

**Possible declaration only—not shipped:**

```csharp
public static partial class OrderMaps
{
    [AstraGenerateMapping] // illustrative proposal
    public static partial OrderDto ToDto(Order source);
}
```

Compare the method shape with a pair-registration model against current `IObjectMappingRule`, `IDeclaredObjectMappingRule`, mapper registration and DI ownership before selecting a public API. One additive, comprehensible surface is preferable to a second complete DSL.

#### Execution-mode contract (proposed)

| Mode | Source of truth | Appropriate scenario | Failure behavior |
| --- | --- | --- | --- |
| Existing explicit runtime mapping | User-authored rule | High-risk, custom or dynamic mapping | Existing startup/runtime validation |
| Existing opted-in conventions | Explicitly registered profile | Productivity for runtime-configured DTOs | Mapping plan + policy warnings/errors |
| Generated typed mapping | Compiler-visible declaration | Known static DTO shape | Compile-time unsupported-shape diagnostic; no hidden fallback |
| Future optional generated adapter | Generated method + DI-safe mapping rule | Existing `IMapper` consumer ergonomics | Duplicate ownership error by default |

**Customization principle:** allow explicit member expressions, converters and resolvers in later slices only when they can be represented, validated and explained without hiding runtime dependencies. The first slice does **not** promise deep graph traversal, arbitrary runtime service resolution or implicit reverse mapping.

#### Correctness and security checklist
- Source null and nullable member semantics defined, not guessed.
- Required/init-only/immutable construction is either demonstrably correct or explicitly unsupported.
- Sensitive destination writes never happen simply because a name happens to match; classification is heuristic, not an authorization oracle.
- No implicit numeric narrowing or enum conversions.
- Duplicate generated/generated and generated/runtime pair ownership is visible and deterministic.
- Stable diagnostic IDs, compiler source location, short fix guidance and suppression policy.
- Deterministic output with bounded incremental-build overhead and clear generated source provenance.
- Clean consumers, multi-target compatibility and AOT publish/run evidence.

See [ADR-0001](adr/0001-generated-mapper.md) and [v2.1 plan](plans/v2.1-generated-mapping.md).

## 5. Mediator: prove a generated dispatch path—not more metadata

Source-level spike: examine current handler-wrapper caching, generic/object Send, service scopes, processor and behavior composition, exception handling, streams and notification publishers. Compare improving the existing runtime path with a generated closed-request invoker. Do not assume code generation wins.

Proposed progression: closed typed request/response → verify pipelines and exceptions → optional void path → streams/notification candidates. Every step must preserve per-dispatch service resolution, scoped lifetimes and ordering. Generated-only unknown types fail transparently. Existing runtime dispatch stays independently supported. No broker, retry engine, saga, outbox or implicit distributed transaction in mediator core.

**Performance must compare equal behavior counts**: direct handler, current AstraFlow and generated AstraFlow with matching DI scopes and pipelines; measure allocations, latency distributions, startup, generated assembly size and build-time overhead. See [ADR-0002](adr/0002-generated-mediator.md).

## 6. Flow Intelligence: inspectability as a competitive advantage

Build on existing analyzer/CLI/diagnostics/graph tools: versioned JSON manifest → deterministic semantic diff → SARIF/PR annotation → optional visual explorer **only if demanded**. Types of edges:
- `Declared`: source-owned explicit contract.
- `Generated`: verified generated registration/execution metadata.
- `RuntimeObserved`: captured under an explicit sampling/run scope.
- `Potential`: static relationship that may execute conditionally.
- `Unknown` / `Incomplete`: analysis lacks proof.

A missing edge does **not** mean impossible behavior. No secrets, DTO values, unbounded identifiers or host credentials in artifacts. Source provenance and schema versioning are essential. See [ADR-0003](adr/0003-flow-manifest.md).

## 7. Release sequence with evidence, not hype

| Version / track | Status | Principal deliverable | Exit evidence |
| --- | --- | --- | --- |
| v2.0.x | Patch when needed | Shared security foundation hardening | Redaction, classification, consumer tests |
| **v2.1** | Proposed priority | **Real generated typed mapping execution** | Clean consumer, unsupported diagnostics, AOT and reproducible benchmarks |
| v2.2 | Existing planned lane | Enterprise supply chain | SBOM, provenance, SourceLink verification |
| v2.3 | Existing planned lane | Public API governance | Baselines, compatibility and upgrade checks |
| v2.4 | Candidate | Generated closed-request dispatch | Pipeline/DI parity + measured wins + AOT |
| v2.5 | Candidate | Versioned flow manifest / CI diff | Stable schema, provenance, useful review diff |
| v2.6+ | Research | Adoption and reliability feedback loop | Two independent pilots and measured onboarding |
| v3+ | Per-package candidate | Optional, demand-driven ecosystem | Admission policy, isolation, maintenance owner |
| v4+ | Research | Visual and developer platform | Validated manifest and user demand |
| Separate track | Research | Better Auth-inspired .NET auth concept | Threat model + standards component evaluation |

Do not silently move v2.2/v2.3 commitments. Ship **one version at a time** with tests/docs/API check/changelog and stop for review.

## 8. The competitive bar, without unreliable claims

We investigate AutoMapper, Mapster, Mapperly and manual mapping as distinct mapping baselines; MediatR, generated mediators and direct handler calls as mediator comparisons. Compare:
- Same semantics and equivalent validation/security behavior.
- Cold start **and** warmed throughput.
- Typed generated invocation **separately** from interface dispatch.
- Allocated bytes, P95 when meaningful, binary size, clean and incremental build time.
- AOT warnings/publish/run, correctness and coverage.
- Setup time, diagnostic usability and migration cost.

This is a **multi-dimensional scorecard**. A raw benchmark win that breaks behavior or doubles build time may not improve developer outcomes. Publish losses alongside wins; reproducible artifacts are mandatory before marketing performance leadership.

## 9. Ecosystem: ambitious portfolio, strict admission

Candidate family: request caching, idempotency, authorization adapters, EF transactions/outbox bridges, resilience via Polly, background-job adapters, webhook delivery and eventually workflow research. Own integration semantics, not mature open-source infrastructure gratuitously. No EF/ASP.NET/auth dependencies in core.

A potential **AstraAuth** should have its own repository, release cadence, maintainers, threat model and standards-compliant .NET foundation; the Better Auth fork is inspiration for developer experience, not a mechanical TypeScript-to-C# conversion or a reason to import it into the mapper/mediator package.

Each candidate must have recurring demand, measured benefit, a named owner, migration and support plan, failure-mode model, no dependency leakage and clean consumer tests. See [ecosystem portfolio](strategy/ecosystem-portfolio.md).

## 10. Pre-mortem and stop conditions

| Realistic failure | Early signal | Response |
| --- | --- | --- |
| The generator becomes a second unmaintainable mapper | More DSL/API than correctness tests | Reduce supported subset; prioritize shared semantic tests |
| Security policy is marketed as infallible | False negatives in heuristic names | Explicit allow/deny declarations, threat model and honest limits |
| Generated dispatch changes pipeline behavior | Scope/order/exception regression | Block release and retain runtime path |
| Performance looks good only in microbenchmarks | Poor startup/build/payload real-world results | Report complete scorecard; optimize only the bottleneck |
| Releases create compatibility debt | Frequent consumer upgrade failures | API governance gates and versioned migration guides |
| Ecosystem outgrows maintenance | Many packages, few independent users | Freeze low-value areas; focus on two strong engines |
| Flow diagrams create false certainty | Dynamic edges labeled definitive | Add provenance, unknown states and static-analysis limits |
| No adoption despite expanding code | Few real pilots, rising support cost | Run independent user research before expanding scope |

## 11. Exact next action: one-release implementation decision

1. Capture current Git SHA, SDK, NuGet publication state and full test/pack/install baseline.
2. Inspect actual mapper/generator classes and DI behavior—not just documentation.
3. Update [ADR-0001](adr/0001-generated-mapper.md) with a chosen minimal public declaration and rejection evidence.
4. Execute only the [v2.1 generated mapping plan](plans/v2.1-generated-mapping.md), including negative tests, one working clean consumer and AOT.
5. Publish results with source hash, commands, known failures, benchmarks, migration guidance and security limitations.
6. **Stop for maintainer review** before taking on generated mediator work.

**We earn ambition by delivering independently verifiable breakthroughs, not by declaring ourselves the greatest.**
