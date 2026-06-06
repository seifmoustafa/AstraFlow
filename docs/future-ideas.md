# AstraFlow Future Ideas Bank

This file is the broad idea bank for AstraFlow. It is intentionally larger and more speculative than the main roadmap.

Use this file when:

- a feature is useful but not ready for the public roadmap,
- a feature needs design review before it becomes planned,
- a feature belongs to a possible future package,
- a feature is a competitive parity idea but not yet prioritized,
- a feature is an AstraFlow-only advantage that needs validation.

Status labels:

- `Done`: implemented, tested, documented, and intended for release or already released.
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

## Release Classification Ideas

Use this section when deciding where an idea belongs before promoting it to `roadmap.md`.

| Idea Type | Classification | Notes |
| --- | --- | --- |
| Bug fix for existing behavior | Patch | Must be SemVer-safe and covered by tests. |
| Error message or diagnostics wording improvement | Patch | Safe when diagnostic codes and public contracts remain compatible. |
| Package metadata, README, icon, changelog, release notes, or publishing fix | Patch | Useful for public credibility without changing runtime behavior. |
| CI, pack, publish, or clean-install verification improvement | Patch | Should harden release confidence. |
| Additional tests for existing behavior | Patch | No runtime contract change. |
| New optional helper API | Minor | Additive only, documented, and tested. |
| New optional package | Minor | Dependencies stay outside core packages. |
| New convention behavior | Minor | Must be disabled by default and diagnostics-visible. |
| New analyzer warning | Minor | Start as info/warning unless it protects security-sensitive behavior. |
| New source generator with runtime fallback | Minor | Generated output must be deterministic and testable. |
| Breaking API removal or default behavior change | Major | Requires migration guide and deprecation history. |
| Runtime baseline increase | Major | Requires compatibility policy update. |
| Package split or package boundary change | Major | Requires package deprecation and migration docs. |
| Visual tooling, dashboards, IDE integration, or hosted docs platform | Future platform | Build after CLI/analyzer/generator metadata exists. |

## Adoption And Compatibility Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Multi-target support for core packages on `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` | Done | Shipped in `1.2.2`; EF Core remains version-aligned with EF Core 10. |
| Direct .NET Framework target such as `net462` or `net471` | Research | Add only if it gives value beyond `netstandard2.0`. |
| `AstraFlow.Contracts` | Done | Shared contracts without DI/runtime packages, shipped in `1.4.0`. |
| Package compatibility matrix | Planned | Document package, TFM, dependency, and integration support. |
| API compatibility baselines | Planned | Prevent accidental breaking changes. |
| Public API diff in CI | Planned | Review API changes before publish. |
| Old-version compatibility test suite | Candidate | Restore previous package versions and verify upgrade paths. |
| Old-version upgrade smoke tests | Planned | Prove patch/minor upgrades do not require source changes unless documented. |
| Migration guides from popular mediator/mapping approaches | Planned | Keep public docs capability-focused rather than competitor-centered. |
| Migration cookbook | Planned | Before/after examples for manual dispatch, mediator usage, mapper usage, and projection usage. |
| Migration scanner report | Planned | CLI report that suggests replacements without rewriting code by default. |
| Package selector guide | Planned | Help users choose focused packages instead of always using meta package. |
| Offline package verification script | Candidate | Validate `.nupkg` contents, README, icon, docs, symbols, and dependencies. |
| Local install smoke-test template | Done | Shipped as `scripts/verify-package-install.ps1` in `1.2.3`. |
| DI container compatibility matrix | Candidate | Test Microsoft.Extensions.DependencyInjection-compatible containers where practical. |
| Host compatibility samples | Planned | Console, worker, ASP.NET Core, class library, test project, shared contracts/client project. |
| Versioned documentation | Planned | Keep older package docs available after APIs expand. |
| Package deprecation process | Planned | Define when and how packages/APIs are marked obsolete or deprecated. |

## Mediator Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Void requests | Done | Shipped in `1.4.0` for commands without response values. |
| Stream requests | Done | Shipped in `1.4.0` for `IAsyncEnumerable<T>` responses. |
| Stream pipeline behaviors | Done | Shipped in `1.4.0` through a dedicated stream behavior contract. |
| Request pre-processors | Done | Shipped in `1.4.0` as lightweight before-handler hooks. |
| Request post-processors | Done | Shipped in `1.4.0` as lightweight after-handler hooks. |
| Request exception handlers | Done | Shipped in `1.4.0` with explicit handled state. |
| Request exception actions | Done | Shipped in `1.4.0`; actions run side effects and rethrow. |
| Fluent registration builder | Done | Shipped in `1.4.0` for deterministic registration. |
| Open-generic behavior registration helpers | Done | Shipped in `1.4.0` for cleaner behavior setup. |
| Parallel notification publishing | Done | Shipped in `1.4.0`; opt-in only. |
| Bounded-parallel notification publishing | Done | Shipped in `1.4.0` for safer fan-out with a maximum degree of parallelism. |
| Notification ordering metadata | Candidate | Use only if diagnostics reveal coupling. |
| Handler priority ordering | Candidate | Risky because it can hide architecture coupling. |
| Request envelopes | Candidate | Correlation, causation, tenant, user context without payload logging. |
| Correlation context abstraction | Candidate | Could support observability and logs. |
| Request context accessor | Candidate | Payload-free metadata for correlation, causation, tenant, user, clock, and locale. |
| Cancellation enforcement diagnostics | Candidate | Runtime docs first, analyzer later. |
| Handler timeout behavior | Candidate | Optional package, not core. |
| Retry behavior | Candidate | Integrate with established resilience primitives. |
| Circuit breaker behavior | Candidate | Optional package. |
| Idempotency behavior | Candidate | Requires pluggable persistence. |
| Command idempotency contract | Candidate | Explicit operation keys without request payload storage. |
| Transaction behavior | Candidate | Integration package only. |
| Outbox bridge | Candidate | Infrastructure-specific. |
| Inbox bridge | Candidate | Infrastructure-specific. |
| Domain event to notification bridge | Candidate | No forced base entity. |
| Open generic notification handler support | Candidate | Must avoid duplicate invocation and produce clear diagnostics. |
| Handler lifetime diagnostics | Planned | Detect singleton/scoped/transient risks. |
| Saga/process manager helpers | Research | Powerful but can become a workflow engine. |
| Workflow orchestration package | Research | Probably out of core scope. |
| Request batching | Research | Useful for some apps but can complicate semantics. |
| Request deduplication | Research | Needs idempotency and persistence policy. |

## Mapper Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Safe convention mapping | Done | Disabled by default. |
| Mapping profiles/catalogs | Done | Organize large applications. |
| Fluent member configuration | Done | Include, ignore, source, destination, converter, condition, null rules. |
| Exact name matching | Done | First convention mode. |
| Case-insensitive matching | Done | Opt-in. |
| Sensitive-field deny list | Done | Required for convention mapping. |
| Unmapped destination validation | Done | Catch missing DTO members. |
| Unmapped source validation | Done | Useful in strict mode. |
| Nullable compatibility diagnostics | Done | Warn about unsafe null flows. |
| Numeric conversion diagnostics | Done | Warn about precision loss and narrowing. |
| Enum mapping helpers | Done | Enum-to-enum and enum-to-string validation. |
| Constructor/record binding | Done | Ambiguity checked. |
| Existing destination mapping | Done | Update/patch scenarios. |
| Null substitution | Done | Per-member explicit config. |
| Value converters | Done | Explicit converter objects. |
| Value resolvers | Planned | DI-aware and lifetime-diagnosed. |
| Conditional mapping | Done | Patch/update DTOs. |
| Flattening | Planned | Opt-in and diagnostic-heavy. |
| Reverse mapping | Planned | Explicit only. |
| Unflattening | Planned | Protect domain-owned nested objects. |
| Include members | Planned | Controlled composition mapping. |
| Mapping plan export | Done | Show every member decision. |
| Mapping diff | Planned | Compare mapping plan between commits. |
| Safe update mapping policy | Planned | Separate create, update, patch, and public-input DTO rules. |
| Sensitive destination write policy | Planned | Block or warn on writes into password/token/key/secret-style members. |
| Required member validation | Planned | Detect destination required members that cannot be populated safely. |
| Immutable destination support | Planned | Constructor/record mapping with diagnostics. |
| Collection update strategies | Candidate | Replace, merge, preserve, and key-based update behavior for existing destinations. |
| Naming convention profiles | Candidate | Optional naming conventions with diagnostics-visible output. |
| Value transformers | Candidate | Risky if global and hidden. |
| Before/after map hooks | Candidate | Must be visible in diagnostics. |
| Polymorphic mapping | Done | Shipped in `1.6.2` with explicit `IncludeDerived`. |
| Inheritance mapping | Done | Shipped in `1.6.2` with explicit `IncludeBase`. |
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
| Projection parameters | Done | Shipped in `1.7.0` through explicit parameter object projections. |
| Provider matrix | Planned | SQLite, SQL Server, PostgreSQL, MySQL where practical. |
| Provider-specific warning codes | Planned | Stable diagnostics. |
| Projection plan export | Done | Shipped in `1.7.0` through `IProjectionPlanProvider`. |
| Projection plan assertions | Done | Shipped in `1.7.1` through `AstraFlow.Testing`. |
| Projection diffing | Candidate | Review read-model changes in CI. |
| Projection parameter object model | Planned | Pass explicit query parameters without complex closure captures. |
| Projection raw-ID policy checks | Planned | Warn when public read models expose raw IDs while secure ID policy is enabled. |
| Projection provider baseline tests | Planned | Store expected validation outcomes for common providers. |
| Projection SQL snapshot helper | Candidate | Review generated SQL shape without executing queries. |
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
| Report baseline approval workflow | Planned | CI can require approval when diagnostics shape changes. |
| Report redaction audit | Planned | Show emitted, summarized, and redacted categories. |
| Module ownership metadata | Candidate | Attribute or configuration model for team/module ownership. |
| Module boundary report | Candidate | Needs architecture metadata. |
| Startup health summary | Planned | ASP.NET Core integration. |

## Testing Ideas

| Idea | Status | Notes |
| --- | --- | --- |
| Fake sender/publisher/mediator | Done | Shipped in `1.3.0`; no mocking framework dependency. |
| Request recording assertions | Done | Shipped in `1.3.0`; verifies requests sent in tests. |
| Notification recording assertions | Done | Shipped in `1.3.0`; verifies events published in tests. |
| Handler harness | Done | Shipped in `1.3.0`; focused handler tests. |
| Pipeline harness | Done | Shipped in `1.3.0`; order and short-circuit tests. |
| Stream handler harness | Planned | After stream support. |
| Exception handler harness | Planned | After exception support. |
| Mapper rule assertions | Done | Shipped in `1.3.0`; verifies rule ownership. |
| Mapping snapshot helper | Candidate | Deterministic output snapshots. |
| Projection assertion helper | Done | Shipped in `1.3.0`; expression/validation assertions. |
| EF projection test helpers | Planned | Provider translation checks. |
| Secure ID test codec | Done | Shipped in `1.3.0`; stable tests without real keys. |
| Diagnostics assertions | Done | Shipped in `1.3.0`; report error and finding assertions. |
| Diagnostics snapshot helper | Candidate | Golden report tests. |
| Upgrade smoke-test harness | Planned | Restore previous packages, upgrade, then build/test representative consumers. |
| Public API approval tests | Planned | Detect accidental public API changes before publish. |
| Analyzer/generator snapshot helpers | Planned | Required once compile-time packages exist. |
| Test fixture builders | Candidate | Useful if minimal and optional. |
| Compatibility smoke-test harness | Done | `scripts/verify-package-install.ps1` verifies supported target combinations before release. |

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
| Slow handler diagnostics | Candidate | Report timing without payload logging. |
| Notification fan-out topology metrics | Candidate | Count fan-out and failures by handler type. |
| Projection validation metrics | Candidate | Count provider validation failures by code and projection name. |
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
| Versioned documentation strategy | Planned | Keep docs aligned to package versions. |
| Release branch strategy | Planned | Support patching old release lines. |
| Package deprecation process | Planned | Responsible retirement of APIs/packages. |
| Secret scanning release gate | Planned | Prevent publishing tokens, keys, or secret screenshots. |
| Dependency vulnerability gate | Planned | Block high-severity known vulnerable dependencies where practical. |
| Secure analyzer suppression policy | Planned | Require reasons for suppressing sensitive findings. |
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
| Versioned docs site | Planned | Public documentation per major/minor release once API growth requires it. |
| API compatibility dashboard | Candidate | Visualize API changes and support windows. |
| Package health dashboard | Candidate | Release status, package contents, downloads, vulnerabilities, docs links. |

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
