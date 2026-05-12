# AstraFlow Future Ideas Bank

This file is the broad idea bank for AstraFlow. It is intentionally larger and more speculative than the main roadmap.

Use this file when:

- a feature is useful but not ready for the public roadmap,
- a feature needs design review before it becomes planned,
- a feature belongs to a possible future package,
- a feature is a competitive parity idea but not yet prioritized,
- a feature is an AstraFlow-only advantage that needs validation.

Status labels:

- `Planned`: approved for the main roadmap.
- `Candidate`: worth designing, not yet approved.
- `Research`: needs technical or market validation.
- `Rejected`: deliberately avoided.

## Product North Star

AstraFlow should become a package family for explicit, inspectable application flow:

- mediator dispatch,
- notifications,
- pipeline behaviors,
- object mapping,
- query projections,
- diagnostics,
- testing,
- analyzers,
- generators,
- CLI inspection,
- platform integration,
- secure DTO policy,
- enterprise release quality.

The core promise remains: users can understand what happens in their app without trusting hidden runtime magic.

## Adoption And Compatibility Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Multi-target support for `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` | Planned | Add only after compatibility audit and test matrix. |
| Direct .NET Framework target such as `net462` or `net471` | Research | Add only if it gives value beyond `netstandard2.0`. |
| `AstraFlow.Contracts` | Planned | Shared contracts without DI/runtime packages. |
| Package compatibility matrix | Planned | Document package, TFM, dependency, and integration support. |
| API compatibility baselines | Planned | Prevent accidental breaking changes. |
| Old-version compatibility test suite | Candidate | Restore previous package versions and verify upgrade paths. |
| Migration guides from popular mediator/mapping approaches | Planned | Keep public docs capability-focused rather than competitor-centered. |
| Package selector guide | Planned | Help users choose focused packages instead of always using meta package. |
| Offline package verification script | Candidate | Validate `.nupkg` contents, README, icon, docs, symbols, and dependencies. |
| Local install smoke-test template | Candidate | Create clean sample app and install packed packages. |

## Mediator Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Void requests | Planned | Commands without response values. |
| Stream requests | Planned | `IAsyncEnumerable<T>` responses. |
| Stream pipeline behaviors | Planned | Dedicated behavior contract for streams. |
| Request pre-processors | Planned | Lightweight before-handler hooks. |
| Request post-processors | Planned | Lightweight after-handler hooks. |
| Request exception handlers | Planned | Typed exception recovery with explicit handled state. |
| Request exception actions | Planned | Side effects that rethrow. |
| Fluent registration builder | Planned | Deterministic registration API. |
| Open-generic behavior registration helpers | Planned | Cleaner behavior setup. |
| Parallel notification publishing | Planned | Opt-in only. |
| Bounded-parallel notification publishing | Planned | Safer fan-out for many handlers. |
| Notification ordering metadata | Candidate | Use only if diagnostics reveal coupling. |
| Handler priority ordering | Candidate | Risky because it can hide architecture coupling. |
| Request envelopes | Candidate | Correlation, causation, tenant, user context without payload logging. |
| Correlation context abstraction | Candidate | Could support observability and logs. |
| Cancellation enforcement diagnostics | Candidate | Runtime docs first, analyzer later. |
| Handler timeout behavior | Candidate | Optional package, not core. |
| Retry behavior | Candidate | Integrate with established resilience primitives. |
| Circuit breaker behavior | Candidate | Optional package. |
| Idempotency behavior | Candidate | Requires pluggable persistence. |
| Transaction behavior | Candidate | Integration package only. |
| Outbox bridge | Candidate | Infrastructure-specific. |
| Inbox bridge | Candidate | Infrastructure-specific. |
| Domain event to notification bridge | Candidate | No forced base entity. |
| Saga/process manager helpers | Research | Powerful but can become a workflow engine. |
| Workflow orchestration package | Research | Probably out of core scope. |
| Request batching | Research | Useful for some apps but can complicate semantics. |
| Request deduplication | Research | Needs idempotency and persistence policy. |

## Mapper Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Safe convention mapping | Planned | Disabled by default. |
| Mapping profiles/catalogs | Planned | Organize large applications. |
| Fluent member configuration | Planned | Include, ignore, source, destination, converter, condition, null rules. |
| Exact name matching | Planned | First convention mode. |
| Case-insensitive matching | Planned | Opt-in. |
| Sensitive-field deny list | Planned | Required for convention mapping. |
| Unmapped destination validation | Planned | Catch missing DTO members. |
| Unmapped source validation | Planned | Useful in strict mode. |
| Nullable compatibility diagnostics | Planned | Warn about unsafe null flows. |
| Numeric conversion diagnostics | Planned | Warn about precision loss and narrowing. |
| Enum mapping helpers | Planned | Enum-to-enum and enum-to-string validation. |
| Constructor/record binding | Planned | Ambiguity checked. |
| Existing destination mapping | Planned | Update/patch scenarios. |
| Null substitution | Planned | Per-member explicit config. |
| Value converters | Planned | Explicit converter objects. |
| Value resolvers | Planned | DI-aware and lifetime-diagnosed. |
| Conditional mapping | Planned | Patch/update DTOs. |
| Flattening | Planned | Opt-in and diagnostic-heavy. |
| Reverse mapping | Planned | Explicit only. |
| Unflattening | Planned | Protect domain-owned nested objects. |
| Include members | Planned | Controlled composition mapping. |
| Mapping plan export | Planned | Show every member decision. |
| Mapping diff | Candidate | Compare mapping plan between commits. |
| Value transformers | Candidate | Risky if global and hidden. |
| Before/after map hooks | Candidate | Must be visible in diagnostics. |
| Polymorphic mapping | Candidate | After profiles are stable. |
| Inheritance mapping | Candidate | After profiles are stable. |
| Circular reference controls | Candidate | Only if deep graph mapping becomes supported. |
| Max-depth controls | Candidate | Same as circular references. |
| Dynamic/dictionary mapping | Research | Useful for integrations, risky for auditability. |
| DataReader mapping | Research | Likely data integration package. |
| JSON mapping helpers | Research | Should not replace serializers. |
| Compile-time mapping plan generation | Planned | Source generator phase. |
| Mapping analyzer code fixes | Candidate | Generate missing declared mappings or fix drift. |

## Projection And Query Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Projection parameters | Planned | Avoid unsafe closure captures. |
| Provider matrix | Planned | SQLite, SQL Server, PostgreSQL, MySQL where practical. |
| Provider-specific warning codes | Planned | Stable diagnostics. |
| Projection plan export | Planned | Source/destination member and expression-risk report. |
| Projection diffing | Candidate | Review read-model changes in CI. |
| Query tagging helpers | Candidate | EF integration. |
| Projection performance benchmarks | Candidate | Compare registry lookup and expression use. |
| Projection analyzer code fixes | Candidate | Suggest replacing mapper calls or custom method calls. |
| Expression simplification helpers | Research | Risky, may hide provider behavior. |
| Async projection helpers | Research | Usually provider-owned, avoid hiding `IQueryable`. |

## Diagnostics And Reporting Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Diagnostics diffing | Planned | Compare two reports. |
| SARIF output | Planned | Useful for CI/code scanning. |
| Mermaid graph output | Planned | Request/mapping/projection visualization. |
| DOT graph output | Planned | Tool-compatible graph output. |
| HTML diagnostics report | Candidate | Useful for humans. |
| Diagnostics baseline approval | Candidate | CI fails when app flow changes unexpectedly. |
| Redaction policy report | Planned | Explain what is emitted and redacted. |
| Dependency lifetime graph | Candidate | Show unsafe singleton/scoped patterns. |
| Handler/mapping/projection ownership report | Candidate | Useful in large modular apps. |
| Module boundary report | Candidate | Needs architecture metadata. |
| Startup health summary | Planned | ASP.NET Core integration. |

## Testing Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Fake sender/publisher/mediator | Planned | No mocking framework dependency. |
| Request recording assertions | Planned | Verify requests sent in tests. |
| Notification recording assertions | Planned | Verify events published in tests. |
| Handler harness | Planned | Focused handler tests. |
| Pipeline harness | Planned | Order and short-circuit tests. |
| Stream handler harness | Planned | After stream support. |
| Exception handler harness | Planned | After exception support. |
| Mapper rule assertions | Planned | Verify rule ownership and output. |
| Mapping snapshot helper | Planned | Deterministic output snapshots. |
| Projection assertion helper | Planned | Expression/validation assertions. |
| EF projection test helpers | Planned | Provider translation checks. |
| Secure ID test codec | Planned | Stable tests without real keys. |
| Diagnostics snapshot helper | Candidate | Golden report tests. |
| Test fixture builders | Candidate | Useful if minimal and optional. |
| Compatibility smoke-test harness | Candidate | Install packed packages into clean sample apps. |

## Analyzer Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Missing request handler analyzer | Planned | Compile-time warning. |
| Duplicate request handler analyzer | Planned | Compile-time warning where discoverable. |
| Ambiguous request contract analyzer | Planned | Request implements conflicting contracts. |
| Missing stream handler analyzer | Planned | After stream support. |
| Behavior ordering analyzer | Planned | Configurable order rules. |
| Unsafe singleton lifetime analyzer | Planned | Handler/behavior/mapper lifetime risks. |
| Controller injects full mediator but only sends | Planned | Encourage narrow interfaces. |
| Mapper declaration drift analyzer | Planned | Declared pairs versus implemented pairs. |
| Sensitive field mapping analyzer | Planned | Convention and explicit mapping checks. |
| Raw public ID analyzer | Planned | Secure DTO policy. |
| Mapper call inside query analyzer | Planned | Suggest projections. |
| Non-translatable projection analyzer | Planned | Static expression risk detection. |
| Service locator in mapping rule analyzer | Planned | Maintainability rule. |
| Broad exception catch in mapping rule analyzer | Candidate | Avoid hiding mapping failures. |
| Analyzer suppression policy | Candidate | Require reasons for sensitive suppressions. |
| Analyzer code fixes | Candidate | Only where fix is safe and obvious. |

## Source Generator Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Handler registration generator | Planned | AOT/trimming support. |
| Notification registration generator | Planned | AOT/trimming support. |
| Stream registration generator | Planned | After streams. |
| Processor/exception registration generator | Planned | After mediator parity. |
| Mapping dispatch table generator | Planned | Faster explicit mapping lookup. |
| Convention mapping plan generator | Planned | Safer convention output. |
| Collection mapping fast-path generator | Planned | Performance phase. |
| Projection registry metadata generator | Planned | Faster registry and AOT support. |
| Diagnostics metadata generator | Candidate | Avoid runtime reflection. |
| Incremental generator diagnostics | Planned | Stable build messages. |
| Generator snapshot tests | Planned | Deterministic output. |

## CLI And Template Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| `astraflow inspect handlers` | Planned | Show request handlers. |
| `astraflow inspect notifications` | Planned | Show notification handlers. |
| `astraflow inspect mappings` | Planned | Show mapping plans. |
| `astraflow inspect projections` | Planned | Show projection registry. |
| `astraflow validate` | Planned | Run catalog checks. |
| `astraflow report` | Planned | JSON/Markdown/SARIF output. |
| `astraflow graph` | Planned | Mermaid/DOT graph output. |
| `astraflow diff` | Planned | Compare reports. |
| `astraflow pack-check` | Planned | Inspect `.nupkg` contents. |
| `astraflow scaffold request` | Planned | Generate request and handler. |
| `astraflow scaffold mapping` | Planned | Generate mapping rule. |
| `astraflow scaffold projection` | Planned | Generate projection. |
| `astraflow scaffold test` | Planned | Generate test harness. |
| `dotnet new astraflow-console` | Planned | Console template. |
| `dotnet new astraflow-worker` | Planned | Worker template. |
| `dotnet new astraflow-api` | Planned | ASP.NET Core template. |
| `dotnet new astraflow-modular-monolith` | Candidate | Larger reference architecture. |

## Integration Package Ideas

| Package | Status | Candidate Features |
| --- | --- | --- |
| `AstraFlow.AspNetCore` | Planned | Minimal API helpers, controller helpers, problem details, diagnostics endpoint, health checks. |
| `AstraFlow.FluentValidation` | Planned | Validation behavior, adapters, localization, severity mapping. |
| `AstraFlow.EntityFrameworkCore` | Planned | Transaction behavior, outbox/inbox candidates, query tags, provider matrix. |
| `AstraFlow.OpenTelemetry` | Planned | Tracing and metrics hooks if core observability is not enough. |
| `AstraFlow.Caching` | Candidate | Cache behavior, explicit keys, invalidation notifications. |
| `AstraFlow.Authorization` | Candidate | Policy behavior and diagnostics. |
| `AstraFlow.Idempotency` | Candidate | Idempotency key contracts and stores. |
| `AstraFlow.Resilience` | Candidate | Timeout, retry, circuit-breaker helpers. |
| `AstraFlow.BackgroundJobs` | Candidate | Dispatch requests from job systems without scheduler lock-in. |
| `AstraFlow.DomainEvents` | Candidate | Domain event bridge without forced base classes. |
| `AstraFlow.Webhooks` | Candidate | Signed event publishing helpers and redaction. |

## Security And Privacy Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Secure DTO policy | Planned | Enforce raw-ID and sensitive-field rules. |
| Redaction policy | Planned | Shared by diagnostics, CLI, and observability. |
| Security threat model | Planned | Package responsibilities and app responsibilities. |
| Private security advisory process | Planned | Enterprise readiness. |
| Sensitive field taxonomy | Planned | Passwords, tokens, keys, secrets, hashes, salts, credentials, recovery codes. |
| Secure defaults test suite | Planned | Prove risky automation is off by default. |
| Dependency review workflow | Planned | Supply-chain phase. |
| SBOM generation | Planned | Enterprise supply chain. |
| Package signing | Planned | Enterprise supply chain. |
| Release provenance | Planned | Enterprise supply chain. |

## Observability Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| ActivitySource tracing | Planned | Request, notification, mapping, projection validation spans. |
| Metrics | Planned | Counts, durations, failures, validation findings. |
| Redacted logging hooks | Planned | No payload values by default. |
| Correlation and causation IDs | Candidate | Needs payload-free context model. |
| Sampling controls | Candidate | Avoid high-cardinality noise. |
| Development diagnostics endpoint | Planned | ASP.NET Core integration. |
| Production-safe health summary | Candidate | Summary only, no secrets. |

## Enterprise And Governance Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| API governance | Planned | Public API baselines and diff checks. |
| Version support policy | Planned | Patch windows and support expectations. |
| Deprecation policy | Planned | Obsolete APIs with replacement guidance. |
| Signed tags | Planned | Release integrity. |
| Branch protection guide | Planned | Contributor/release safety. |
| Changelog automation | Planned | Consistent release notes. |
| Release dashboard | Candidate | Later platform tooling. |
| Benchmark dashboard | Candidate | Later platform tooling. |
| Compatibility dashboard | Candidate | Later platform tooling. |

## Platform Vision Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Visual request graph | Planned | Show request to handler to behavior path. |
| Visual notification graph | Planned | Show event fan-out. |
| Visual mapping graph | Planned | Show source/destination/member paths. |
| Visual projection graph | Planned | Show query DTO shapes. |
| Modular architecture scanner | Planned | Detect cross-module coupling. |
| Migration assistant | Planned | Suggest package migration steps. |
| Analyzer suppression manager | Candidate | Manage suppressions with reasons. |
| Secure DTO policy editor | Candidate | Later tool for security rules. |
| IDE extension | Candidate | Only after CLI/analyzers stabilize. |
| Interactive diagnostics explorer | Candidate | Useful for large teams. |
| Documentation website | Planned | Public docs and recipes. |

## Rejected Or Avoided Ideas

| Idea | Status | Reason |
| --- | --- | --- |
| Runtime license key checks | Rejected | Conflicts with MIT/no-runtime-license positioning. |
| Payload logging by default | Rejected | Security and privacy risk. |
| Convention mapping enabled by default | Rejected | Conflicts with explicit secure core. |
| Hidden deep graph magic by default | Rejected | Hard to audit and debug. |
| Framework-specific behavior in core packages | Rejected | Belongs in integration packages. |
| Owning application encryption algorithms | Rejected | Applications must own keys, algorithms, rotation, and policy. |
| Claiming benchmark leadership without repeatable data | Rejected | Misleading and not credible. |

## Promotion Rules

Move an idea from this file into `roadmap.md` only when:

- the user problem is clear,
- package ownership is clear,
- dependency impact is understood,
- security/privacy impact is documented,
- compatibility impact is documented,
- acceptance gates can be written,
- it does not weaken the explicit core by default.

