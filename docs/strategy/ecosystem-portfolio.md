# AstraFlow Ecosystem Portfolio — Big Ambition, Disciplined Boundaries

> **Status: Research and candidates, NOT approved packages or shipped APIs.** The core product is an individually usable family of .NET mediator, mapper, diagnostics, compiler and integration packages.

## Strategic thesis

AstraFlow could become a broad .NET ecosystem because the **same developer pain** repeats in every project: writing reliable application flows, transporting data between boundaries, preventing mistakes, and understanding what the system is doing. But a long list of replacement packages is not a product strategy. The advantage must be **less code and fewer production surprises**, with clean dependency ownership.

**Principle: integrate mature infrastructure by default; build only differentiated reusable capabilities.** Commercial licensing is a possible opportunity but never sufficient justification to reimplement a security-sensitive or mature runtime engine.

## Portfolio map

| Candidate | User's recurring problem | Preferred strategy | Hard failure mode | Promotion priority |
| --- | --- | --- | --- | --- |
| `AstraFlow.Caching` | Repeated read-query work | Adapter to IMemoryCache/HybridCache | Tenant bleed, stampedes, stale invalidation | Candidate, medium-high |
| `AstraFlow.Idempotency` | Duplicate payment/order/webhook command | Storage abstraction + atomic state transitions | Concurrent requests and crash-retry uncertainty | Candidate, high-value/high-risk |
| `AstraFlow.Authorization` | Cross-cutting handler access control | ASP.NET Authorization adapter or explicit policy | Wrong principal/context/scope, bypass | Candidate |
| `AstraFlow.EntityFrameworkCore` | Scoped transaction behavior | EF Core integration, not a new ORM | Nested transactions, ambient scopes, retries | Candidate |
| `AstraFlow.Outbox` | Publish after committed writes | Optional persistence and relay bridge | Delivery duplication, failure recovery | Research |
| `AstraFlow.Resilience` | Network/transient failure policies | Adapter to Polly/.NET resilience | Retrying a non-idempotent action | Candidate |
| `AstraFlow.BackgroundJobs` | Dispatch work later | Hangfire/Quartz/other adapter | Serialized sensitive payload, versioning | Research |
| `AstraFlow.DomainEvents` | Aggregate-to-application event transition | Explicit bridge | Events emitted before transaction commit | Candidate |
| `AstraFlow.Webhooks` | Reliable event delivery | Focused endpoint/client adapter | SSRF, replay, signing keys, retry storm | Research |
| `AstraFlow.Workflows` | Durable multi-step processes | Separate feasibility study | Ownership of state engine and ops burden | Research |
| `AstraFlow.Validation` | Validation needs | Continue FluentValidation integration | Duplicate rule engines and messages | **Do not clone** without new evidence |
| `AstraFlow.Messaging` | Cross-process messages | Adapters to established brokers/MassTransit | Pretend in-process mediator = durable bus | Research only |
| Identity/Auth | Sessions, OAuth/OIDC and easy setup | **Separate prospective product**, reuse .NET standards stack | Critical security maintenance | Separate research |
| Excel/serialization/ORM replacements | Other popular commercial software | Independent products if at all | Diluted scope and loss of focus | Outside AstraFlow |

### Idempotency candidate — do not confuse a cache with correctness

Before approving: define request fingerprint, tenant/user scope, atomic acquire/complete/fail transitions, timeout and recovery semantics, failure response replay policy, request changes and storage adapter guarantees. Test simultaneous requests, crashed owner, expired lease, replayed requests, non-replayable response, cancellation and idempotency-key disclosure. Avoid storing command payloads by default.

### Caching candidate — semantics before API

Use `IMemoryCache`/`HybridCache` instead of new storage. Clarify key partitioning, TTL, invalidation, tenant/user scoping, concurrency stampede protection and stale data. A cache behavior must never accidentally make mutation commands cacheable.

### Outbox candidate — no exactly-once promises

Outbox can improve reliability when storage and message enqueue share a transaction, but consumers must still be idempotent and duplicate deliveries possible. Requires clear persistence adapter, delivery lease/backoff, poison message handling and operational metrics. Do not ship with an application-wide database assumption.

## Separate authentication opportunity: possible AstraAuth

A developer-first .NET identity library with convenient provider configuration, strong integration testing and optional app adapters may be worth researching. But it needs a separate repository, package policy, maintenance ownership, vulnerability disclosure, threat model and security release cadence. Evaluate ASP.NET Core Identity and OpenIddict before inventing identity protocols. Better Auth's TypeScript experience is product inspiration, not a reason to port arbitrary code or assume its runtime contracts fit .NET. Reuse must comply with upstream licenses and notices.

A proposed design research packet should include: session management, passkeys, OAuth/OIDC providers, rate limits, CSRF/state/PKCE, MFA recovery, refresh rotation, audit hooks, migration and database adapters—**as research topics**, not v1 promises.

## Market and competitive research lanes

| Lane | Why investigate | Required verification |
| --- | --- | --- |
| Mediator commercial licensing | Low-friction alternative demand | Current MediatR packages, license eligibility/terms, migration friction |
| Mapping commercial licensing | Alternative value and lock-in | Current AutoMapper terms and migration path |
| Generated mapping leadership | Performance and compiler ergonomics | Mapster/Mapperly current docs, supported shapes, benchmark equivalence |
| FluentValidation/Polly | Integration users, not replacement hypothesis | Actual current open-source licensing and maintained APIs |
| Durable jobs/messaging | Operational ecosystem demand | Hangfire/Quartz/MassTransit/NServiceBus tradeoffs and support cost |
| Identity providers | Potential independent product | ASP.NET Identity, OpenIddict, Duende and Better Auth comparison |

Verify all licensing and release details at **decision time**; do not embed stale version or pricing assertions in a permanent roadmap.

## Admission gate: no feature without an accountable payoff

A candidate moves from Research → Candidate → Planned only when:
1. **Problem:** two distinct real application scenarios or credible independent demand recorded.
2. **Alternatives:** best existing .NET library/adapter and the simplest in-app solution evaluated.
3. **Differentiation:** measurable hours/bugs saved, safer invariant or compelling maintainability gain.
4. **Ownership:** named maintainer; release, security response and test support cost estimated.
5. **Isolation:** no optional provider/framework dependency leaks into `Contracts`, `Mediator` or `Mapper`.
6. **Correctness:** clear state model, concurrency/failure cases, secure defaults and diagnostics.
7. **Evidence:** clean sample consumer, package verification, compatibility and migration guidance.
8. **Exit:** cancellation criteria if adoption and quality expectations aren't met.

**Default decision:** defer. Building the best mapper/mediator is more valuable than maintaining ten superficial integrations.

References: [North Star](north-star.md), [Evidence and gates](evidence-and-gates.md), [Research ledger](research-ledger.md).
