# Ecosystem portfolio — candidates, not commitments

AstraFlow is a **family of independent packages**, not a monolithic everything-library. Before promoting a candidate require two concrete use cases, named owner, sustainable testing/security burden, migration guide and a demonstrated advantage over existing .NET packages.

| Domain | Candidate direction | Build vs integrate | Gate / major risk |
| --- | --- | --- | --- |
| Request caching | Opt-in query caching behavior | Integrate IMemoryCache / HybridCache | Tenant isolation, invalidation, stampede control |
| Idempotency | Explicit command idempotency contract + adapters | Integration-first | Concurrent requests, crash recovery, fingerprinting |
| Authorization | Mediator authorization behavior | Integrate ASP.NET authorization | Identity/context ownership, policy order |
| Transactions | EF Core scoped transaction behavior | Integrate EF | Lifetime, nested transaction semantics |
| Outbox/inbox | Optional persistence/message bridge | Research | Exactly-once myths, replay, atomicity |
| Resilience | Pipeline adapter | Integrate Polly | Retrying non-idempotent commands |
| Background jobs | Explicit handler-to-job adapter | Integrate Hangfire/Quartz/other | Scheduling semantics, serialization/privacy |
| Webhooks | Delivery adapter | Research | Signing, retries, SSRF, keys |
| Workflow/sagas | Separate feasibility investigation | Defer | Long-running state, operational cost |
| Identity/authentication | Separate prospective AstraAuth product | Study ASP.NET Identity, OpenIddict, Better Auth UX | Protocol correctness and ongoing security response |
| Spreadsheet/Excel | Not related to application flow | Separate product only if independently justified | Scope dilution |

**Authentication boundary:** A Better Auth fork is not a .NET port or proof of product-market fit. Do not transplant TypeScript source blindly; evaluate standards-compliant .NET components and licensing before deciding on a separate repository.

Prefer adapters to mature open-source technology; do not own cryptography, OAuth/OIDC standards implementation, storage engines, schedulers or circuit-breakers without a compelling demonstrable gap. No ecosystem admission can block mapper/mediator trust work.
