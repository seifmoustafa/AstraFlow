# ADR-0002 — Executable Generated Mediator Dispatch

**Status: Candidate, not shipped, and not approved for implementation until feasibility evidence.** Potential roadmap slot v2.4 (after existing v2.2 and v2.3 commitments).

## The gap we must prove

Current generator documentation describes generated **DI registrations** for handlers/processors; this is not generated **execution** of a request. The actual runtime may already use efficient wrappers/caches. Adding generated code without profiling could increase build and operational cost with negligible end-to-end benefit.

### User-visible outcome
For a known request type a developer can see which handler is selected, what pipeline participates, which parts run through generated invocation, and why unsupported paths use an explicitly selected alternative (or fail strict mode). Existing mediator callers keep working unchanged.

## Feasibility questions before choosing technology

1. What is the current typed `Send` path? What does object-based `Send` do?
2. How are closed/generic handlers registered and resolved? Which caches already exist?
3. Where are pre/post processors, exception handlers/actions and pipeline order applied?
4. How do streaming cancellation and disposal work? How are notification policies implemented?
5. Can generated invokers preserve scoped resolution without retaining a handler in a singleton?
6. Is the dominant cost handler work/DI/behaviors rather than dispatch lookup?
7. What does compiler generation add to cold/incremental build, binary size and AOT?
8. How do split assemblies and plugin handlers affect static discovery?

Do **not** pick a switch/dictionary/delegate table before these answers.

## Options to prototype

| Option | Strength | Risk |
| --- | --- | --- |
| Optimize current cached runtime path | Smallest change | No generated AOT path |
| Closed typed generated invoker | Static call and easy attribution | DI/behavior composition and generic constraints |
| Generated dispatch table | Central lookup | Static discovery, object dispatch boxing/allocations |
| Generated switch | Readability for small sets | Large output and code size |

The first experiment is **one closed typed `IRequest<TResponse>`**. Void, streams, notifications, open generics and cross-assembly discovery are *separate* decisions, not all part of a giant release.

## Semantic invariants

- The same request with the same registrations produces the same response and failure, barring explicitly documented differences.
- Pipeline behaviors run in documented DI order and may short-circuit.
- Pre/post processors and exception actions/handlers retain their existing ordering, suppression/rethrow and explicit handled-state contracts.
- CancellationToken reaches handlers and behaviors unchanged; exception cancellation is not silently swallowed.
- Scoped services are resolved from the actual execution scope; no captive dependencies or cached disposed handlers.
- Registration diagnostics remain available; generated paths do not hide duplicates.
- Strict generated-only mode rejects unknown/unsupported requests, not a silent reflection fallback.
- Existing runtime dispatch remains supported forever unless a separately reviewed breaking proposal is made.
- Trace/metric behavior remains opt-in/redacted; dispatch code does not log payload values.

## Acceptance test matrix

| Area | Required proof |
| --- | --- |
| Typed request | Matching responses, cancellation, exceptions, duplicate/missing handlers |
| DI lifecycle | Scoped/transient/singleton interaction, concurrent scopes, disposal |
| Pipeline | 0/1/N behaviors; order, short-circuit, pre/post processors |
| Exceptions | Actions rethrow; handlers explicitly handle or propagate |
| Dispatch modes | Generated route provenance, unsupported type failure, no silent fallback |
| Compiler | Stable generation, incremental edits, cross-assembly symbol discovery |
| AOT | Clean consumer publish **and run**; review trim warnings |
| Perf | Direct handler, current runtime, generated with equal handlers/behaviors; cold/warm, allocation/build/size |
| Compatibility | No changes when generator absent; public API diff and upgrade smoke |

## Non-goals and boundaries

No durable messaging, broker adapters, outbox/inbox transaction semantics, retry/circuit-breaker engine, background scheduler, workflow orchestration, or artificial `IRequestContext` abstraction without a concrete requirement. Those belong to optional packages or different products.

## Decision and exit gate

After code audit and benchmark spike, choose **optimize runtime**, **ship narrow generated dispatch**, or **defer**. Document rejected alternatives and numbers. Do not automatically promote the candidate because code generation sounds impressive. See [candidate plan](../plans/v2.4-generated-mediator.md).
