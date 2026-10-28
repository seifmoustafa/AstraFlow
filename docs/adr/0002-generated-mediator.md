# ADR-0002 — Generated mediator dispatch (candidate)

**Status: candidate, not scheduled implementation.**

Generated **handler registrations** do not equal generated **dispatch execution**. Investigate current handler wrapper cache, DI resolution, processor order, pipelines and exception handling before selecting a source-generated dispatch strategy.

First experiment should target a closed request/response type only; add void, stream and notifications in separate reviewed slices if justified. Keep existing runtime mediator fully supported. Never cache scoped handlers in singleton generated delegates. Preserve cancellation, pipeline short-circuiting, exception policies and ordering. In strict/generated-only mode, unknown types fail explicitly.

Possible implementations (not selected): generated typed invokers, a closed-request dispatch table, or a compile-time switch. Compare against optimizing existing runtime path first. Benchmark direct handler calls, current AstraFlow and generated dispatch with identical behaviors and DI scopes. Evaluate AOT publish/run, IL size, build time and unsupported generic shapes.

**No bundled message broker, distributed transaction, retries, saga engine or background scheduler.** Those have separate ownership and failure semantics.
