# AstraFlow Product Roadmap

This file is the long-form planning artifact for AstraFlow after the v1 package extraction. It should be used as the starting context for future package work, public repository setup, and the later NEXORA migration from local project references to published NuGet packages.

For the broader speculative backlog, see [Future Ideas Bank](future-ideas.md). The roadmap is the committed planning document; the ideas bank is where candidates and research topics live before they are promoted.

## Product Positioning

AstraFlow is a MIT-licensed .NET package family for explicit application flow:

- request/response dispatch,
- notification publishing,
- pipeline behaviors,
- source-auditable object mapping,
- declared mapping validation,
- explicit projections,
- secure ID abstraction.

The product direction is not to become a clone of older runtime-magic libraries. AstraFlow should win by being safer, more explicit, easier to audit, easier to validate at startup and build time, and better suited for modular enterprise systems.

## Status Legend

This roadmap uses these labels:

- `Done`: implemented, tested, documented, and intended for release or already released.
- `Active`: the current planned release scope.
- `Patch`: SemVer-safe hardening for a released feature.
- `Planned`: approved direction, not implemented yet.
- `Candidate`: worth considering, but must still pass design review.
- `Rejected`: deliberately not planned because it conflicts with AstraFlow's design.

## Competitive Parity Strategy

AstraFlow should cover the practical capabilities developers expect from established mediator and object-mapping libraries, but it should not inherit their risk profile blindly.

The strategy is:

- cover the common mediator surface first,
- cover the common object-mapping surface next,
- make convention behavior opt-in and inspectable,
- make sensitive-field handling safer than default convention mapping,
- make diagnostics, analyzers, and generators part of the product rather than afterthoughts,
- keep the explicit core first-class forever.

Parity does not mean copying API names. It means a user should be able to solve the same application problems with AstraFlow, with clearer failures and safer defaults.

## Roadmap Operating Principles

The roadmap is intentionally ambitious, but it must stay disciplined. Every new feature must fit at least one of these product goals:

- make application flow easier to understand,
- make runtime behavior safer,
- make mapping and projection behavior more auditable,
- reduce repetitive test setup,
- improve compatibility and adoption,
- improve diagnostics before failures reach production,
- move correctness checks earlier through analyzers or generators,
- provide opt-in productivity without weakening explicit defaults.

Feature rules:

- Core packages stay small.
- Optional packages carry optional dependencies.
- Compatibility work must be proven by build and test matrices.
- Public APIs must be stable, boring, and easy to explain.
- Advanced convenience APIs must produce diagnostics or inspection output.
- Security-sensitive automation must be opt-in and deny-by-default.
- Any feature that logs, serializes, or reports user data must redact by default.
- Any feature that touches database, web, validation, telemetry, cache, or authorization frameworks belongs in an integration package unless it is only an abstraction.

## Release Classification Policy

This section decides where future work belongs before implementation starts. It exists to prevent roadmap drift and accidental feature work in patch releases.

### Patch Releases

Patch releases are SemVer-safe hardening releases for already-shipped behavior.

Patch work may include:

- bug fixes,
- clearer exception messages,
- documentation corrections,
- package metadata fixes,
- CI and publishing hardening,
- compatibility smoke tests,
- dependency vulnerability updates that do not change public behavior,
- additional tests for existing behavior,
- diagnostics finding polish for existing features,
- analyzer false-positive fixes once analyzers exist.

Patch work must not include:

- new required package dependencies,
- new required user code changes,
- behavior changes that make previously-valid applications fail unless the previous behavior was a bug,
- new major public API areas,
- broad feature parity work.

Patch candidates currently worth tracking:

| Candidate | Target | Why |
| --- | --- | --- |
| Direct legacy framework target research result | `v1.2.4` candidate | Only if direct `net462`/`net471` assets prove value beyond `netstandard2.0`. |
| Additional clean-install matrix cases | `v1.2.x` | Add console, class library, test project, and publish-style consumers as needed. |
| Package artifact validation expansion | `v1.2.x` | Verify README, CHANGELOG, icon, XML docs, symbols, dependencies, and target folders consistently. |
| Documentation link validation | `v1.2.x` | Prevent broken GitHub/NuGet docs links. |
| Diagnostics code/message polish | `v1.1.x`/`v1.2.x` | Improve clarity without changing runtime contracts. |
| Projection warning rule polish | `v1.2.x` | Improve existing validation without adding broad new projection features. |

### Minor Releases

Minor releases add optional capabilities without breaking existing applications.

Minor work may include:

- new optional packages,
- new public APIs that are additive,
- new diagnostics/report formats,
- new test helpers,
- new integrations that live outside core packages,
- new convention behavior when disabled by default,
- new analyzers initially shipped as warning/info guidance,
- new generators that preserve runtime fallback unless explicitly documented otherwise.

Minor work must include:

- focused tests,
- API docs,
- scenario docs,
- package selection docs,
- changelog and community release notes,
- acceptance gates in this roadmap.

### Major Releases

Major releases are reserved for breaking changes or large platform shifts.

Major work may include:

- removing obsolete APIs after documented deprecation windows,
- changing defaults that intentionally break unsafe behavior,
- restructuring package boundaries,
- requiring newer runtime baselines,
- generator-first APIs that cannot reasonably preserve old runtime behavior,
- broad public API simplification after migration tooling exists.

Major work must include:

- migration guide,
- analyzer/code-fix support where practical,
- API diff,
- compatibility matrix,
- old/new samples,
- explicit package deprecation notes.

### Future Platform Phases

Platform phases are not single library features. They are ecosystems around AstraFlow:

- visual flow graphs,
- diagnostics explorers,
- migration assistants,
- IDE extensions,
- documentation website,
- benchmark dashboards,
- compatibility dashboards,
- enterprise compliance reports.

These belong after the CLI, analyzers, generators, and diagnostics metadata are stable enough to feed them.

## Release Notes Policy

NuGet's `PackageReleaseNotes` field is usually short plain text. It is normal for the NuGet tab to look minimal because it renders package metadata, not the full changelog.

For every release:

- `PackageReleaseNotes` should contain a concise public summary,
- `CHANGELOG.md` should contain the detailed release notes,
- `docs/community-release-guide.md` should contain the announcement copy,
- README should link users to the detailed docs for new features,
- release tags should point to the changelog section.

For major feature releases, the package release notes should still be more useful than one vague sentence. Prefer a compact list of the main feature groups.

## Package Family

### `AstraFlow.Mediator`

Purpose:

- Dispatch one request to one handler.
- Publish one notification to many handlers.
- Run pipeline behaviors around request handlers.
- Provide clear startup and runtime diagnostics.
- Avoid any dependency on application-specific result types, tenants, permissions, validation frameworks, web frameworks, or database frameworks.

Current v1 public concepts:

- `IRequest<TResponse>`
- `IRequestHandler<TRequest, TResponse>`
- `INotification`
- `INotificationHandler<TNotification>`
- `ISender`
- `IPublisher`
- `IMediator`
- `IPipelineBehavior<TRequest, TResponse>`
- `RequestHandlerDelegate<TResponse>`
- `NotificationPublishOptions`
- `NotificationFailurePolicy`
- `MediatorOptions`
- `AddAstraFlowMediator(...)`

### `AstraFlow.Mapper`

Purpose:

- Map objects only through explicit rules.
- Validate declared mapping ownership at startup.
- Map common collection shapes without hidden conventions.
- Register explicit LINQ projections.
- Provide a secure ID abstraction without owning application cryptography.

Current v1 public concepts:

- `IMapper`
- `IObjectMappingRule`
- `IDeclaredObjectMappingRule`
- `ObjectMappingPair`
- `IObjectMappingValidator`
- `MappingOptions`
- `IProjection<TSource, TDestination>`
- `INamedProjection<TSource, TDestination>`
- `IProjectionRegistry`
- `IProjectionValidator`
- `ProjectionRegistration`
- `ProjectionValidationReport`
- `ProjectionValidationFinding`
- `ProjectionValidationMode`
- `ProjectWith(...)`
- `ISecureIdCodec`
- `SecureIdMapper`
- `AddAstraFlowMapper(...)`

### `AstraFlow.Mapper.EntityFrameworkCore`

Purpose:

- Validate registered AstraFlow projections against EF Core relational query translation.
- Keep EF Core dependencies out of `AstraFlow.Mapper`.
- Report provider/model translation failures without executing application queries.

Current v1.2 public concepts:

- `ValidateProjectionTranslation(...)`
- `ValidateProjectionTranslations(...)`
- `EfCoreProjectionValidationReport`
- `EfCoreProjectionValidationFinding`

### `AstraFlow`

Purpose:

- Convenience package that references mediator and mapper.
- Provides `AddAstraFlow(...)`.
- Adds no hidden runtime behavior by default.

### `AstraFlow.Diagnostics`

Purpose:

- Report registered request handlers.
- Report registered notification handlers.
- Report registered pipeline behaviors.
- Report registered mapping rules.
- Report registered projections.
- Produce stable findings with severity and diagnostic codes.
- Render reports as in-memory objects, JSON, or Markdown.
- Provide a summary object that can be used by health-check-style code without depending on ASP.NET Core.

Current v1.1 public concepts:

- `IAstraFlowDiagnosticsReporter`
- `AstraFlowDiagnosticsOptions`
- `AstraFlowDiagnosticReport`
- `AstraFlowDiagnosticsSummary`
- `AstraFlowDiagnosticFinding`
- `AstraFlowDiagnosticRegistration`
- `DiagnosticSeverity`
- `AddAstraFlowDiagnostics(...)`

### `AstraFlow.Testing`

Purpose:

- Provide fake sender, publisher, and mediator implementations for unit tests.
- Record requests and notifications without a mocking framework.
- Execute handlers, notification handlers, and pipeline behaviors without a full application host.
- Provide framework-neutral assertions for mediator, mapper, projection, diagnostics, exception, mapping-rule, and secure ID tests.
- Provide a deterministic test-only secure ID codec.

Current v1.3 public concepts:

- `FakeSender`
- `FakePublisher`
- `FakeMediator`
- `RecordedRequest`
- `RecordedNotification`
- `HandlerTestHarness<TRequest, TResponse>`
- `PipelineTestHarness<TRequest, TResponse>`
- `NotificationHandlerTestHarness<TNotification>`
- `AstraFlowAssertionException`
- `MediatorAssertions`
- `MapperAssertions`
- `MappingRuleAssertions`
- `ProjectionAssertions`
- `DiagnosticsAssertions`
- `ExceptionAssertions`
- `SecureIdAssertions`
- `TestSecureIdCodec`

## v1 Status

v1 is the stable explicit core. The implementation is intentionally focused and production-oriented. The current active roadmap baseline is `v1.4.0`.

### v1 Mediator Features

- Status: `Done` for the current explicit mediator core.
- Request/response dispatch.
- Exactly one request handler per request type.
- Clear error for missing request handlers.
- Clear error for duplicate request handlers.
- Clear error for request types that implement multiple response contracts.
- Sequential notification publishing by default.
- Configurable notification failure policies:
  - `FailFast`
  - `Continue`
  - `Aggregate`
- Pipeline behaviors in registration order.
- Behavior short-circuiting.
- Assembly scanning from marker types.
- Optional request handler coverage validation.
- Scoped dispatcher registration by default.
- Package tests for dispatch, missing handlers, duplicate handlers, pipeline order, short-circuiting, and notification behavior.

### v1 Mapper Features

- Status: `Done` for explicit object mapping and `Done` for v1.2 projection safety.
- Explicit rule-based mapping.
- Declared mapping pairs.
- Startup validation.
- Duplicate mapping pair detection.
- Undeclared rule detection in strict mode.
- Single object mapping.
- Null source mapping.
- Collection mapping for common collection shapes.
- Explicit projection registration and execution.
- Named projection registration and lookup.
- Projection validation with warning and error modes.
- EF Core relational projection validation through the optional EF Core package.
- Secure ID codec abstraction.
- Secure ID helper service.
- Clear errors for missing mappings and duplicate mappings.
- Package tests for mapping, validation, collection handling, projection handling, and secure ID behavior.

### v1 Package Quality

- Status: `Done` for the published package baseline; continue improving in patch releases.
- MIT license.
- NuGet metadata.
- XML documentation for public APIs.
- Nullable reference types.
- Warnings treated seriously.
- README files included in packages.
- Symbol package generation.
- CI workflow.
- Gated publish workflow.
- Security policy.
- Contributing guide.
- Release checklist.
- Local pack script.
- Samples for mediator, mapper, and ASP.NET Core integration.
- Diagnostics reporting and diagnostics sample.

## v1 Non-Goals

These are deliberately excluded from v1:

- automatic convention mapping,
- automatic flattening,
- reverse-map generation,
- deep graph runtime magic,
- arbitrary runtime SQL projection generation,
- compatibility shims,
- source generators,
- Roslyn analyzers,
- benchmark leadership claims,
- web-framework-specific behavior,
- validation-framework-specific behavior,
- application-specific result types,
- application-specific ID encryption.

Reason:

v1 must first be stable, auditable, secure, and proven in NEXORA. Advanced behavior should be opt-in and separately testable.

These are not rejected forever. They move into later roadmap phases only after the explicit core, diagnostics, projection safety, and testing support are proven.

## Competitive Parity Inventory

This inventory tracks capabilities common in mature mediator and mapper libraries. It is deliberately capability-based so public docs do not become competitor marketing.

### Mediator Capability Inventory

| Capability | Status | AstraFlow Direction |
| --- | --- | --- |
| Request/response dispatch | Done | Keep core API small and clear. |
| Command/query modeling through request contracts | Done | Continue documenting CQRS and non-CQRS usage. |
| Single handler per request | Done | Keep duplicate-handler failures explicit. |
| Runtime object send | Done | Keep ambiguous request-contract detection. |
| Notifications/events | Done | Keep zero-handler publish behavior valid. |
| Multiple notification handlers | Done | Keep failure policy configurable. |
| Pipeline behaviors | Done | Add richer registration and order diagnostics later. |
| Pipeline short-circuiting | Done | Keep behavior contract simple. |
| Assembly scanning | Done | Improve AOT/trimming through generators later. |
| Handler coverage validation | Done | Add analyzer version later. |
| Diagnostics report | Done | Expand findings as features grow. |
| Void requests | Done | Non-response request contracts are supported without forcing `Unit` into user code. |
| Stream requests | Done | `IAsyncEnumerable<T>` request handling is supported through stream sender APIs. |
| Stream pipeline behaviors | Done | Stream-specific pipeline behaviors wrap stream execution. |
| Request pre-processors | Done | Explicit pre-processor contracts and registration helpers exist. |
| Request post-processors | Done | Explicit post-processor contracts and registration helpers exist. |
| Request exception handlers | Done | Typed exception handlers can mark exceptions handled. |
| Request exception actions | Done | Typed exception actions run side effects and rethrow. |
| Contracts-only package | Done | `AstraFlow.Contracts` provides shared mediator contracts without runtime packages. |
| Fluent registration builder | Done | `AstraFlowMediatorBuilder` exposes behavior, stream behavior, processor, and exception-flow registration helpers. |
| Parallel notification publishing | Done | Opt-in parallel and bounded-parallel publish strategies are available with aggregate failure handling. |
| Notification ordering policy | Candidate | Consider explicit ordering metadata only if it does not hide coupling. |
| Retry/circuit-breaker pipeline helpers | Candidate | Likely belongs in integration packages rather than core. |
| License-key runtime behavior | Rejected | Keep MIT package behavior free from runtime license checks. |

### Mapper Capability Inventory

| Capability | Status | AstraFlow Direction |
| --- | --- | --- |
| Explicit object mapping | Done | Keep as the recommended enterprise default. |
| Declared mapping ownership | Done | Keep startup validation strict and actionable. |
| Runtime mapping by destination type | Done | Keep clear missing/duplicate rule errors. |
| Collection mapping | Done | Expand shape coverage and benchmark later. |
| Null source behavior | Done | Keep documented and predictable. |
| Nested mapping | Done | Supported only when rules explicitly call the mapper. |
| Secure ID abstraction | Done | Expand into policy diagnostics and analyzers later. |
| Explicit query projections | Done | Keep projection expressions separate from runtime object mapping. |
| Named projections | Done | Keep multiple read models deterministic. |
| Projection registry | Done | Expand with generated metadata later. |
| Projection validation | Done | Add more expression-risk rules over time. |
| EF Core projection validation | Done | Add provider matrix later. |
| Convention mapping | Planned | Add optional package, disabled by default. |
| Exact property-name matching | Planned | First convention mode; safest productivity layer. |
| Case-insensitive matching | Planned | Opt-in only. |
| Include/ignore member rules | Planned | Required before convention mapping is useful. |
| Sensitive-field deny list | Planned | Mandatory for convention mapping. |
| Convention diagnostics | Planned | Every convention-mapped member must be inspectable. |
| Mapping profiles/catalogs | Planned | Organize large apps without hiding behavior. |
| Fluent member configuration | Planned | Add explicit member options without making reflection magic the default. |
| Flattening | Planned | Opt-in with diagnostics and sensitive-field checks. |
| Reverse mapping | Planned | Opt-in; never assume public DTO-to-domain updates are safe. |
| Unflattening | Planned | Opt-in and validation-heavy. |
| Constructor parameter binding | Planned | Opt-in with ambiguity diagnostics. |
| Null substitution | Planned | Add per-member rules and diagnostics. |
| Value converters | Planned | Prefer explicit converter objects registered through DI. |
| Value resolvers | Planned | Add only with clear lifetime and payload-safety rules. |
| Value transformers | Candidate | Useful but can hide global behavior; design later. |
| Conditional member mapping | Planned | Useful for patch/update flows. |
| Existing destination mapping | Planned | Required for update commands and tracked entities. |
| Polymorphic mapping | Candidate | Add after convention mapping is stable. |
| Inheritance mapping | Candidate | Add after profiles/catalogs exist. |
| Max-depth/circular-reference controls | Candidate | Only if deep graph mapping becomes a supported scenario. |
| Projection parameterization | Planned | Support tenant/user/request parameters without unsafe closure captures. |
| Query-provider-specific projection warnings | Planned | Expand beyond the initial EF Core relational checks. |
| Source-generated fast paths | Planned | v2 generator work. |
| Analyzer rule catalog | Planned | v2 analyzer work. |

### Capability Gaps That Must Be Added To The Roadmap

These were not explicit enough before and are now promoted into planned roadmap items:

- void requests,
- stream requests,
- stream pipeline behaviors,
- request pre-processors,
- request post-processors,
- request exception handlers,
- request exception actions,
- contracts-only package,
- fluent mediator registration builder,
- parallel notification publishing strategy,
- mapping profiles/catalogs,
- fluent member mapping configuration,
- reverse mapping,
- unflattening,
- null substitution,
- value converters,
- value resolvers,
- conditional member mapping,
- existing destination mapping,
- projection parameterization,
- provider-specific projection validation matrix.

## Expanded Feature Opportunity Inventory

This section is deliberately broad. It exists so future work can be compared against a known opportunity list instead of being rediscovered every few months.

### Compatibility And Adoption

| Opportunity | Status | Direction |
| --- | --- | --- |
| Multi-targeting | Done | Core packages ship `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`; EF Core remains `net10.0`. |
| Contracts-only package | Done | Shared projects can reference mediator contracts without runtime DI packages. |
| API compatibility checks | Planned | Compare public APIs against a baseline before release. |
| Version support policy | Planned | Document which package versions get patches. |
| Public API baseline files | Planned | Store reviewed public API snapshots for CI comparison. |
| Old-version upgrade tests | Planned | Verify representative apps can upgrade from previous package versions without source changes when SemVer requires it. |
| Migration guides | Planned | Explain migration from established mediator and mapper libraries without making public docs competitor-centered. |
| Migration scanner | Planned | Detect common mediator/mapper usage patterns and report suggested AstraFlow replacements. |
| Compatibility samples | Planned | Add console, worker, ASP.NET Core, class library, and test-project examples. |
| DI container compatibility tests | Candidate | Verify behavior against common Microsoft.Extensions.DependencyInjection-compatible containers where practical. |
| Host compatibility samples | Candidate | Console, worker, ASP.NET Core, test project, Blazor/shared contract, and library-only consumers. |
| NativeAOT/trimming validation | Planned | Make reflection-heavy paths explicit and generator-backed where needed. |
| Package split guidance | Planned | Document when to install meta package versus focused packages. |
| Package deprecation process | Planned | Define how old packages or APIs are deprecated without surprising consumers. |
| Versioned documentation | Planned | Keep docs for older package versions once the API surface grows. |

### Mediator Feature Surface

| Opportunity | Status | Direction |
| --- | --- | --- |
| Void requests | Done | Commands that return no value without forcing application-specific result types. |
| Stream requests | Done | `IAsyncEnumerable<T>` request/response flows. |
| Stream behaviors | Done | Pipeline behavior model for streamed responses. |
| Pre/post processors | Done | Lightweight extension points around handlers. |
| Exception handlers/actions | Done | Explicit exception recovery and side-effect hooks. |
| Rich registration builder | Done | Discoverable registration methods with deterministic behavior order. |
| Publish strategies | Done | Sequential default, parallel and bounded-parallel opt-in. |
| Cancellation diagnostics | Planned | Report handlers/processors that ignore cancellation tokens where detectable. |
| Timeout behavior package | Candidate | Likely an optional pipeline helper, not core. |
| Idempotency behavior package | Candidate | Useful for command handling, but requires application persistence policy. |
| Retry/resilience behavior package | Candidate | Should integrate with established resilience primitives rather than inventing policy engines. |
| Transaction behavior package | Candidate | Belongs in EF/database integration package. |
| Outbox/inbox integration | Candidate | Valuable for domain events; should remain infrastructure-specific and opt-in. |
| Domain event bridge | Candidate | Bridge domain events to notifications without forcing a domain model. |
| Request envelopes | Candidate | Add correlation, causation, tenant, and user context without logging payloads. |
| Request context accessor | Candidate | Payload-free metadata for correlation, causation, tenant, user, clock, and locale concerns. |
| Command idempotency contract | Candidate | Explicit operation keys for command retry safety without storing payloads. |
| Request result adapters | Candidate | Optional adapters only; core must not own application result types. |
| Handler lifetime diagnostics | Planned | Detect singleton/scoped/transient risks for handlers, behaviors, processors, and exception handlers. |
| Open generic notification handlers | Candidate | Support only if duplicate invocation behavior remains deterministic and diagnosable. |
| Ordered notifications | Candidate | Only if diagnostics make coupling obvious. |
| Handler decorators | Candidate | Pipeline behaviors may already cover most cases. |

### Mapper Feature Surface

| Opportunity | Status | Direction |
| --- | --- | --- |
| Safe convention mapping | Planned | Disabled by default and fully inspectable. |
| Mapping profiles/catalogs | Planned | Organize mapping configuration at scale. |
| Fluent member config | Planned | Member-specific include, ignore, source, destination, null, converter, and condition rules. |
| Flattening/unflattening | Planned | Explicit, diagnostic-heavy, and sensitive-field-aware. |
| Reverse mapping | Planned | Explicit only; never auto-generated silently. |
| Existing destination mapping | Planned | Support update/patch flows without forcing entity tracking assumptions. |
| Value converters/resolvers | Planned | DI-aware, lifetime-diagnosed, and inspectable. |
| Value transformers | Candidate | Useful but risky because global transforms can hide behavior. |
| Before/after map hooks | Candidate | Useful but must be diagnostics-visible. |
| Polymorphic mapping | Candidate | Add after profiles and strict validation exist. |
| Inheritance mapping | Candidate | Add after profiles and strict validation exist. |
| Enum mapping helpers | Planned | Explicit enum-to-enum and enum-to-string support with validation. |
| Nullable compatibility diagnostics | Planned | Warn when nullable source/destination shapes are unsafe. |
| Numeric conversion diagnostics | Planned | Warn about narrowing conversions and precision loss. |
| Record/constructor binding | Planned | Opt-in binding with ambiguity diagnostics. |
| Dictionary/dynamic mapping | Candidate | Useful for integrations but risky; keep out of core until justified. |
| DataReader mapping | Candidate | Likely belongs in data integration packages. |
| JSON mapping helpers | Candidate | Useful for APIs but should not replace serializers. |
| Mapping plan export | Planned | Export inspected member maps for docs, CI, and review. |
| Mapping plan diff | Planned | Compare member-level mapping decisions between commits or package versions. |
| Safe update mapping policy | Planned | Separate create, update, patch, and public-input DTO rules. |
| Sensitive destination write policy | Planned | Block or warn on writes into password/token/key/secret-style members. |
| Collection update strategy | Candidate | Explicit replace, merge, preserve, and key-based update behavior for existing destinations. |
| Immutable destination support | Planned | Constructor/record mapping with clear ambiguity and required-member diagnostics. |
| Required member validation | Planned | Detect destination required members that cannot be populated safely. |
| Naming convention profiles | Candidate | Optional source/destination naming rules with diagnostics-visible output. |

### Projection And Query Safety

| Opportunity | Status | Direction |
| --- | --- | --- |
| Projection registry | Done | Current v1.2 feature. |
| Named projections | Done | Current v1.2 feature. |
| Static projection validation | Done | Current v1.2 feature. |
| EF Core relational validation | Done | Current v1.2 optional package. |
| Projection parameters | Planned | Safe tenant/user/current-time parameters without complex closure capture. |
| Provider matrix | Planned | SQLite, SQL Server, PostgreSQL, MySQL where practical. |
| Provider-specific warnings | Planned | Stable codes for provider/model translation risks. |
| Query tagging helpers | Candidate | Useful in EF integrations. |
| Projection plan export | Planned | List source/destination members and high-risk expression nodes. |
| Projection diffing | Candidate | Useful in CLI to show read-model shape changes across commits. |
| Projection parameter object model | Planned | Pass explicit query parameters without capturing complex runtime state. |
| Projection raw-ID policy checks | Planned | Warn when public read models expose raw IDs while secure ID policy is enabled. |
| Projection provider baseline tests | Planned | Store expected provider validation outcomes for common providers. |
| Projection SQL snapshot helper | Candidate | Review generated SQL shape without executing queries. |
| Async projection helpers | Candidate | Usually provider-owned; avoid hiding `IQueryable` behavior. |

### Diagnostics, Reports, And Tooling

| Opportunity | Status | Direction |
| --- | --- | --- |
| JSON diagnostics | Done | Current v1.1 feature. |
| Markdown diagnostics | Done | Current v1.1 feature. |
| HTML diagnostics report | Candidate | Useful for humans, but keep JSON/Markdown first. |
| SARIF output | Planned | Enables code-scanning style reports for analyzers/CLI. |
| Diagnostics baseline/diff | Planned | Compare registration/mapping/projection changes in CI. |
| Redaction policy diagnostics | Planned | Report what can be emitted and what is redacted. |
| Health-check integration | Planned | ASP.NET Core package should expose development-safe summaries. |
| Diagnostics endpoint | Planned | Development-only ASP.NET Core endpoint with redaction. |
| Visual graph export | Planned | DOT/Mermaid/JSON graph of requests, handlers, mappings, and projections. |
| Report baseline approval | Planned | CI can fail when flow/mapping/projection shape changes without approval. |
| Report redaction audit | Planned | Show which categories are emitted, summarized, or redacted. |
| Module ownership metadata | Candidate | Attribute or configuration model for teams/modules that own handlers, mappings, and projections. |
| Dependency graph report | Candidate | Show service lifetimes and known unsafe dependency chains without resolving request payloads. |

### Testing And Verification

| Opportunity | Status | Direction |
| --- | --- | --- |
| Fake sender/publisher/mediator | Planned | No mocking framework dependency. |
| Handler harness | Planned | Test handlers without full DI host. |
| Pipeline harness | Planned | Test order and short-circuit behavior. |
| Notification harness | Planned | Test multi-handler behavior and failure policies. |
| Mapper assertions | Planned | Assert mapping rule ownership and output. |
| Projection assertions | Planned | Assert expression shape, validation findings, and provider checks. |
| Secure ID test codec | Planned | Stable round-trip test helper without real secrets. |
| Golden diagnostics snapshots | Planned | Deterministic diagnostics snapshot testing. |
| Upgrade smoke-test harness | Planned | Restore previous packages, upgrade, and verify build/test behavior. |
| Package install verification harness | Done | `scripts/verify-package-install.ps1` verifies supported target combinations before release. |
| Public API approval tests | Planned | Detect accidental public API changes before publish. |
| Analyzer/generator snapshot helpers | Planned | Required once compile-time packages exist. |
| Fixture builders | Candidate | Useful if they do not become a test framework. |

### Observability And Operations

| Opportunity | Status | Direction |
| --- | --- | --- |
| ActivitySource tracing | Planned | Trace request dispatch, notification fan-out, and mapping/projection validation. |
| Metrics | Planned | Durations, counts, failure rates, validation findings. |
| Logging hooks | Planned | Redacted by default and logger-framework-neutral where possible. |
| Correlation/causation propagation | Candidate | Useful if it stays payload-free. |
| Sampling controls | Candidate | Avoid high-cardinality metric and trace output. |
| Production diagnostics command | Candidate | CLI can generate reports from an app host. |
| Slow handler diagnostics | Candidate | Observability package can report timings without logging payloads. |
| Notification fan-out topology metrics | Candidate | Count handler fan-out and failures without exposing notification values. |
| Projection validation metrics | Candidate | Count provider validation failures by code and projection name. |

### Security And Policy

| Opportunity | Status | Direction |
| --- | --- | --- |
| Secure ID abstraction | Done | Current core feature. |
| Sensitive-field deny lists | Planned | Required for convention mapping and analyzers. |
| Public DTO raw-ID analyzer | Planned | Warn or fail when secure ID policy is enabled. |
| Secret field mapping analyzer | Planned | Flag password/token/key/secret-style members. |
| Redaction policy | Planned | Central policy for diagnostics and reports. |
| Threat model doc | Planned | Explain what AstraFlow protects and what apps must own. |
| Secure defaults test suite | Planned | Tests proving risky automation is off by default. |
| Security advisory process | Planned | Private reporting path and release procedure. |
| Secret scanning release gate | Planned | Prevent publishing package artifacts or screenshots that contain tokens or keys. |
| Dependency vulnerability gate | Planned | Fail release workflow on known high-severity dependency advisories where practical. |
| Secure analyzer suppression policy | Planned | Require documented reasons for suppressing sensitive-field or raw-ID findings. |
| Redaction test fixtures | Planned | Shared tests proving diagnostics, CLI, and observability do not emit payload values. |

### Developer Experience And Documentation

| Opportunity | Status | Direction |
| --- | --- | --- |
| API reference | Done | Current docs have public API tables. |
| Scenario guides | Done | Current mediator/mapper/projection scenarios exist. |
| Migration guides | Planned | From manual dispatch, established mediator libraries, and established mapper libraries. |
| Recipe gallery | Planned | Focused examples for common application patterns. |
| Package selection guide | Planned | Tell users which package to install and why. |
| Compatibility guide | Planned | Document target frameworks and supported dependency versions. |
| Analyzer rule catalog | Planned | Required when analyzers ship. |
| Generator design docs | Planned | Required when generators ship. |
| Benchmark methodology | Planned | Required before performance claims. |
| Documentation website | Planned | Later platform milestone. |
| Versioned docs | Planned | Keep docs aligned with package versions after public API growth. |
| Migration cookbook | Planned | Show before/after examples for manual dispatch, mediator usage, and mapper usage. |
| Failure message catalog | Planned | Map known exceptions and diagnostic codes to causes and fixes. |
| API compatibility policy | Planned | Explain what is stable, experimental, obsolete, or candidate. |

### Integrations And Ecosystem

| Opportunity | Status | Direction |
| --- | --- | --- |
| ASP.NET Core helpers | Planned | Minimal API/controller helpers, problem details, diagnostics endpoint. |
| FluentValidation integration | Planned | Validation behavior, result adapter, localization hooks. |
| EF Core integration | Planned | Projection checks, query tags, outbox/transaction candidates. |
| OpenTelemetry integration | Planned | Dedicated package if core hooks are not enough. |
| Caching integration | Candidate | Pipeline helpers with explicit cache keys and invalidation contracts. |
| Authorization integration | Candidate | Pipeline helpers without forcing one permission model. |
| Idempotency integration | Candidate | Requires persistence and operation-key policies. |
| Resilience integration | Candidate | Timeout/retry/circuit-breaker helpers in optional package. |
| Background job integration | Candidate | Dispatch requests from worker/job systems without owning the scheduler. |
| Webhook integration | Candidate | Event publication helpers with signing and redaction policy. |
| CLI tooling | Planned | Inspect, validate, diff, scaffold, release-check, migrate. |
| Templates | Planned | `dotnet new` templates for console, worker, ASP.NET Core, modular monolith. |
| Blazor/shared-contract guidance | Planned | Use contracts-only package without pulling runtime DI into client projects. |
| Worker/background service guidance | Planned | Safe dispatch, cancellation, and diagnostics in hosted services. |
| Modular monolith guidance | Planned | Module ownership, boundaries, and diagnostics reports. |

## v1.0 Acceptance Gates

Before first public publish:

- `dotnet build packages/AstraFlow/AstraFlow.slnx -c Release` passes.
- `dotnet test packages/AstraFlow/AstraFlow.slnx -c Release` passes.
- `dotnet pack` works for all package projects.
- Generated packages contain DLL, PDB, XML docs, README, LICENSE, and `.nuspec`.
- GitHub Actions CI passes on the public repository.
- Publish workflow requires manual confirmation.
- Trusted Publishing is configured, or a scoped GitHub Actions secret named `NUGET_API_KEY` exists.
- No real secret values exist in source, markdown, workflow YAML, shell history committed to the repository, package artifacts, or screenshots.
- NEXORA builds against the package projects before switching to NuGet.
- NEXORA backend focused tests pass.
- CLI templates generate AstraFlow namespaces.
- Retired package guard remains active in NEXORA.

## v1.0 Publish Steps

1. Finish local verification with `scripts/pack.ps1`.
2. Commit the package repository.
3. Push to the dedicated public repository.
4. Confirm CI passes on `main`.
5. Create tag `v1.0.0`.
6. Run the gated publish workflow.
7. Type `PUBLISH` in the workflow input.
8. Verify all package projects appear on NuGet:
   - `AstraFlow`
   - `AstraFlow.Mediator`
   - `AstraFlow.Mapper`
   - `AstraFlow.Diagnostics`
9. Install each package into a clean sample project.
10. Only then migrate NEXORA from local project references to package references.

## NEXORA Migration After Publish

Do not delete `packages/AstraFlow` from the NEXORA monorepo until the published packages are verified and NEXORA builds against them.

### Step 1: Replace Project References

In NEXORA backend projects that currently reference local AstraFlow projects, replace project references with package references:

```xml
<PackageReference Include="AstraFlow.Mediator" Version="1.4.0" />
<PackageReference Include="AstraFlow.Mapper" Version="1.4.0" />
<PackageReference Include="AstraFlow.Mapper.EntityFrameworkCore" Version="1.4.0" />
<PackageReference Include="AstraFlow.Diagnostics" Version="1.4.0" />
```

Use the meta-package only where both are intentionally needed:

```xml
<PackageReference Include="AstraFlow" Version="1.4.0" />
```

### Step 2: Restore And Build

Run:

```powershell
$env:DOTNET_CLI_HOME='C:\tmp\dotnet-cli-home'
dotnet restore NEXORA-Backend/NEXORA-Backend.sln
dotnet build NEXORA-Backend/NEXORA-Backend.sln --no-restore
```

### Step 3: Run Tests

Run focused backend tests first, then the full suite:

```powershell
dotnet test NEXORA-Backend/tests/Core.Application.Tests/Core.Application.Tests.csproj -c Release --no-restore
dotnet test NEXORA-Backend/tests/Identity.Application.Tests/Identity.Application.Tests.csproj -c Release --no-restore
dotnet test NEXORA-Backend/tests/Entitlements.Application.Tests/Entitlements.Application.Tests.csproj -c Release --no-restore
dotnet test NEXORA-Backend/tests/API.IntegrationTests/API.IntegrationTests.csproj -c Release --no-restore
dotnet test NEXORA-Backend/NEXORA-Backend.sln -c Release --no-restore
```

### Step 4: Scan For Local Coupling

Verify NEXORA does not depend on package source folders:

```powershell
rg -n "packages/AstraFlow|AstraFlow.Mediator.csproj|AstraFlow.Mapper.csproj|AstraFlow.csproj" NEXORA-Backend
```

Verify retired package families are still blocked:

```powershell
rg -n "<retired-package-namespace>|<retired-package-reference>" NEXORA-Backend tools/nexora-cli -g "*.cs" -g "*.csproj" -g "*.ts" -g "*.hbs"
```

Any match must be either an intentional guard message, an architectural scanner warning, or release documentation.

### Step 5: Delete Local Package Folder

Only after restore, build, tests, and scans pass:

```powershell
Remove-Item -LiteralPath .\packages\AstraFlow -Recurse -Force
```

If `packages/` becomes empty, remove it too:

```powershell
Remove-Item -LiteralPath .\packages -Force
```

### Step 6: Commit NEXORA Package Migration

Commit NEXORA separately from the package repository:

```powershell
git add NEXORA-Backend tools NEXORA-Frontend
git commit -m "Use published AstraFlow packages"
```

## v1.0.1 Roadmap: Patch Hardening

Status: `Done`.

Goal:

Ship a SemVer-safe patch release before new packages are added.

Features:

- reject request types that implement multiple `IRequest<TResponse>` contracts with a clear diagnostic,
- keep object-based and generic request dispatch behavior covered by tests,
- tolerate null mediator marker types during registration,
- throw `ArgumentNullException` for null mediator service collections,
- tolerate partially loadable assemblies during mediator scanning,
- clarify `MediatorOptions` documentation without adding a new options API,
- document the `net10.0` target and Microsoft support window.

Acceptance gates:

- no breaking public API changes,
- Release build passes,
- package tests pass,
- all three packages pack as version `1.0.1`,
- package artifacts contain README, LICENSE, icon, XML docs, DLL, PDB, `.nuspec`, `.nupkg`, and `.snupkg`.

## v1.1 Roadmap: Diagnostics And Production Ergonomics

Status: `Done`.

Goal:

Make operational failures easier to understand before adding advanced mapping or generation.

Status:

Implemented in `AstraFlow.Diagnostics` v1.1.0.

Planned package:

- `AstraFlow.Diagnostics`

Features:

- startup report of request handlers,
- startup report of notification handlers,
- startup report of pipeline behaviors by closed request type,
- startup report of mapping rules,
- startup report of projections,
- duplicate registration report,
- missing handler report,
- missing mapping report,
- dependency lifetime report for known unsafe patterns,
- optional JSON diagnostics output,
- optional markdown diagnostics output,
- optional health-check-ready summary object,
- diagnostics severity model:
  - `Info`
  - `Warning`
  - `Error`
  - `Fatal`
- package extension:
  - `services.AddAstraFlowDiagnostics(...)`
- no hard dependency on ASP.NET Core.

Implemented finding codes:

- `AFD000`: registration counts discovered,
- `AFD101`: duplicate request handlers,
- `AFD102`: request type has multiple request contracts,
- `AFD103`: scanned request type has no handler,
- `AFD201`: singleton lifetime warning for handlers, behaviors, or mapping rules,
- `AFD301`: mapper catalog validation failure.

Acceptance gates:

- diagnostics work in console apps,
- diagnostics work in ASP.NET Core apps,
- diagnostics are deterministic for tests,
- diagnostics never print secret values,
- NEXORA can generate a startup flow report in development.

## v1.2 Roadmap: Safer Projection Layer

Status: `Done`.

Implemented in `AstraFlow.Mapper` and `AstraFlow.Mapper.EntityFrameworkCore` v1.2.0.

Goal:

Make query projection explicit, reusable, and provider-aware without converting object mappers into hidden SQL translators.

Packages:

- `AstraFlow.Mapper`
- `AstraFlow.Mapper.EntityFrameworkCore`

Features:

- projection registry,
- named projections,
- warning-by-default projection validation,
- EF Core relational validation helpers,
- SQLite EF Core integration tests,
- projection warnings for unsupported methods,
- projection warnings for non-deterministic expression values,
- `IQueryable<TSource>.ProjectWith<TSource, TDestination>(...)`,
- diagnostics integration.

Acceptance gates:

- projection expressions remain explicit,
- unsupported expressions fail clearly when validation is enabled,
- NEXORA read models can use projections without leaking raw IDs,
- SQLite EF Core tests cover provider translation behavior without Docker or external database services.

## v1.2.1 Roadmap: Compatibility And Adoption Hardening

Status: `Done`.

Goal:

Make AstraFlow easier to adopt in more real applications without changing the current public behavior.

This was the compatibility audit gate before changing package target frameworks.

Planned packages:

- `AstraFlow`
- `AstraFlow.Mediator`
- `AstraFlow.Mapper`
- `AstraFlow.Diagnostics`
- `AstraFlow.Mapper.EntityFrameworkCore`

Target framework strategy:

| Package | Candidate targets | Notes |
| --- | --- | --- |
| `AstraFlow.Mediator` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Direct `net462`/`net471` targets are candidates only after test proof. |
| `AstraFlow.Mapper` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Requires replacing APIs unavailable on older targets or conditional compilation. |
| `AstraFlow.Diagnostics` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | JSON support must be dependency-compatible on older targets. |
| `AstraFlow` | same as mediator/mapper intersection | Meta package should not force a narrower target than its dependencies. |
| `AstraFlow.Mapper.EntityFrameworkCore` | `net8.0`, `net9.0`, `net10.0` candidate | May require conditional EF Core package versions per target. No `netstandard2.0` promise until EF support is proven. |
| `AstraFlow.Contracts` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Contracts should have the broadest practical reach. |
| Future analyzers/generators | `netstandard2.0` where required by Roslyn packaging | Analyzer package conventions differ from runtime packages. |

Compatibility work items:

- audit all public APIs for target-framework-specific types,
- remove or conditionally polyfill APIs unavailable on older targets,
- decide whether direct .NET Framework targets add value beyond `netstandard2.0`,
- add CI matrix for every supported TFM,
- run tests for every supported TFM,
- run pack inspection for every supported TFM,
- document dependency versions per TFM,
- document which targets are first-class and which are compatibility targets,
- add API compatibility baseline checks,
- add package compatibility smoke tests with clean sample apps,
- keep `net10.0` as the newest optimized target.

Design rules:

- do not add old target support if it forces insecure or unreliable behavior,
- do not broaden EF Core targets by pinning users to mismatched EF versions silently,
- if an integration package cannot support an older TFM honestly, document that instead of pretending,
- no feature should require users on modern .NET to accept legacy compromises.

Acceptance gates:

- Release build passes for every supported TFM,
- tests pass for every supported TFM where tests are applicable,
- packages include correct framework folders,
- README and docs show target framework support accurately,
- CI blocks unsupported target regressions,
- clean install succeeds for each supported package combination,
- no public API is removed.

Patch sequence:

- `v1.2.1`: metadata, docs, API compatibility baseline, and compatibility feasibility report,
- `v1.2.2`: first real multi-target support for core packages,
- `v1.2.3`: automated clean-install verification for supported package targets,
- `v1.2.4`: direct legacy framework target if proven valuable and safe.

## v1.2.2 Roadmap: Core Multi-Target Support

Status: `Done`.

Goal:

Ship actual package assets for broader consumers after the v1.2.1 compatibility audit.

Implemented package target support:

| Package | Targets |
| --- | --- |
| `AstraFlow` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Mediator` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Mapper` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Diagnostics` | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` |
| `AstraFlow.Mapper.EntityFrameworkCore` | `net10.0` |

Implementation notes:

- core package project files multi-target the supported TFMs,
- `IsExternalInit` is linked only for `netstandard2.0`,
- newer guard/helper APIs were replaced with compatibility-safe equivalents,
- diagnostics adds `System.Text.Json` only for the `netstandard2.0` asset,
- EF Core projection validation stays `net10.0` because the package references EF Core 10.

Acceptance gates:

- Release build passes for all projects,
- package tests pass,
- core `.nupkg` files include `lib/netstandard2.0`, `lib/net8.0`, `lib/net9.0`, and `lib/net10.0`,
- EF Core `.nupkg` includes `lib/net10.0`,
- docs accurately separate core package target support from EF Core package target support.

## v1.2.3 Roadmap: Package Install Verification

Status: `Done`.

Goal:

Make the package target support from v1.2.2 mechanically verifiable before every release.

Implemented:

- added `scripts/verify-package-install.ps1`,
- installs packed core packages into a clean external `netstandard2.0` class library,
- installs packed core packages into clean external `net8.0` and `net9.0` console apps,
- installs all packed packages, including `AstraFlow.Mapper.EntityFrameworkCore`, into a clean external `net10.0` console app,
- uses a local package source plus NuGet.org for dependencies,
- runs outside the repo tree so sample projects do not inherit repository `Directory.Build.props`,
- local `scripts/pack.ps1` runs install verification after packing,
- CI and publish workflows run install verification before uploading or publishing artifacts.

Acceptance gates:

- Release build passes,
- package tests pass,
- all package projects pack,
- package target assets are inspected,
- clean install verification passes for all supported target combinations.

## v1.3 Roadmap: Testing Support

Status: `Done`.

Goal:

Make request handlers, notification handlers, pipeline behaviors, mapping rules, projections, diagnostics, and secure-ID flows easy to test without a full application host.

Implemented package:

- `AstraFlow.Testing`

Features:

- fake sender,
- fake publisher,
- fake mediator,
- request recording,
- notification recording,
- request assertion helpers,
- notification assertion helpers,
- handler test harness,
- pipeline test harness,
- notification handler harness,
- pipeline behavior order and short-circuit support through the pipeline harness,
- exception-flow assertion helper,
- mapper validation assertions,
- mapper rule assertion helper,
- projection assertion helper,
- projection validation assertion helper,
- diagnostics assertion helper,
- secure ID test codec,
- secure ID round-trip assertion helper.

Acceptance gates:

- no mocking framework dependency,
- easy integration with xUnit, NUnit, and MSTest,
- deterministic assertion messages,
- no test helper logs request or DTO payload values by default,
- tests cover mediator, mapper, projection, diagnostics, and secure ID helpers,
- docs show CQRS, mapping, projection, diagnostics, secure ID, and pipeline testing patterns,
- clean package install verification includes `AstraFlow.Testing`.

## v1.4 Roadmap: Mediator Parity And Ergonomics

Status: `Done`.

Verification note:

The code, tests, package metadata, scripts, and docs have been updated for this milestone. The release gate must pass before publishing:

```powershell
.\scripts\pack.ps1 -Configuration Release
```

Goal:

Cover the common mediator features users expect while preserving AstraFlow's clearer errors, explicit registration, and no-license-check positioning.

Planned packages:

- `AstraFlow.Mediator`
- `AstraFlow.Contracts`

Features:

- contracts-only package with request, notification, stream request, sender/publisher abstractions where appropriate,
- void request contract for commands that do not return a value,
- void request handler contract,
- stream request contract based on `IAsyncEnumerable<TResponse>`,
- stream request handler contract,
- stream sender API,
- stream pipeline behavior contract,
- request pre-processor contract,
- request post-processor contract,
- request exception handler contract,
- request exception action contract,
- explicit registration builder for:
  - request handlers,
  - notification handlers,
  - stream handlers,
  - pipeline behaviors,
  - stream pipeline behaviors,
  - pre-processors,
  - post-processors,
  - exception handlers,
  - exception actions,
- open-generic behavior registration helpers,
- closed behavior registration helpers,
- deterministic behavior order diagnostics,
- object-based send support for void requests,
- object-based stream send support where type discovery is unambiguous,
- startup validation for stream handlers,
- diagnostics for missing stream handlers,
- diagnostics for duplicate stream handlers,
- diagnostics for ambiguous void/response/stream request contracts.

Notification publishing enhancements:

- sequential publish remains default,
- opt-in parallel publish strategy,
- opt-in bounded-parallel publish strategy,
- deterministic aggregate exception behavior,
- diagnostics show configured publish strategy,
- docs explain when parallel publish is unsafe because handlers depend on ordering or shared scoped state.

Design rules:

- void requests must not force users to reference an application-specific `Unit` type,
- streams must preserve cancellation and disposal behavior,
- exception handlers must not hide failures unless the handler explicitly marks the exception handled,
- exception actions must always rethrow,
- registration order must be deterministic and inspectable,
- contracts-only package must not depend on Microsoft.Extensions.DependencyInjection.

Acceptance gates:

- full test coverage for void request success, missing handler, duplicate handler, object send, and pipeline behavior,
- full test coverage for stream request success, cancellation, duplicate handlers, missing handlers, and stream behaviors,
- full test coverage for pre/post processors and order,
- full test coverage for exception handlers and exception actions,
- diagnostics report all new mediator registrations and findings,
- docs include migration notes for users coming from established mediator libraries,
- no runtime license checks.

Patch candidates after v1.4:

- `v1.4.1`: registration builder polish and docs fixes,
- `v1.4.2`: stream cancellation edge-case hardening,
- `v1.4.3`: diagnostics finding expansion for processor and exception-handler ordering.

## v1.5 Roadmap: Safe Convention Mapping And Profiles

Status: `Planned`.

Goal:

Add productivity for low-risk DTOs while preserving secure defaults.

Planned package:

- `AstraFlow.Mapper.Conventions`

Features:

- convention mapping disabled by default,
- opt-in per mapping profile/catalog,
- exact source/destination type-pair registration,
- mapping profile abstraction,
- mapping catalog abstraction,
- exact property-name matching,
- case-insensitive option,
- explicit ignore rules,
- explicit include rules,
- explicit required destination member rules,
- unmapped destination member diagnostics,
- unmapped source member diagnostics,
- sensitive-field deny list,
- sensitive-field require-allow option,
- ambiguity detection,
- nullable member compatibility checks,
- numeric conversion checks,
- enum conversion checks,
- nested object mapping only when explicitly enabled,
- collection property mapping only when explicitly enabled,
- constructor parameter binding only when explicitly enabled,
- null substitution per destination member,
- value converter hook per member,
- conditional member mapping per member,
- existing destination mapping for update scenarios,
- diagnostics for fields mapped by convention,
- generated preview report for convention output,
- strict mode that rejects undeclared convention output.

Security rules:

- never convention-map members named like password, secret, token, key, salt, hash, private, credential, recovery, seed, or raw identifier unless explicitly allowed,
- never convention-map from domain entity to public DTO if secure ID policy says IDs must be encoded,
- convention output must be inspectable through diagnostics.

Acceptance gates:

- explicit rules continue to be the recommended enterprise default,
- convention mapping is opt-in and auditable,
- every convention-created member mapping appears in diagnostics,
- strict mode can fail startup when convention output changes,
- docs show safe internal DTO conventions and unsafe public DTO examples,
- tests cover exact names, case-insensitive names, ignored members, included members, sensitive fields, null substitution, converters, conditions, constructor binding, and existing destination mapping,
- NEXORA uses convention mapping only for internal non-sensitive DTOs if at all.

Patch candidates after v1.5:

- `v1.5.1`: convention diagnostics polish,
- `v1.5.2`: additional safe conversion coverage,
- `v1.5.3`: profile organization helpers.

## v1.6 Roadmap: Advanced Mapping Parity

Status: `Planned`.

Goal:

Cover advanced mapper productivity features without compromising explicit auditability.

Planned package:

- `AstraFlow.Mapper.Conventions`

Features:

- flattening with explicit enablement,
- include-member mapping from nested source objects,
- reverse mapping with explicit enablement,
- unflattening with explicit enablement,
- reverse-map diagnostics that show every reversed member path,
- reverse-map deny rules for domain-owned or security-sensitive members,
- per-member custom source expressions,
- per-member custom destination path configuration,
- value resolver objects with DI lifetime diagnostics,
- value transformer pipeline with opt-in scope,
- conditional mapping for patch/update DTOs,
- before-map and after-map hooks only when explicitly enabled,
- polymorphic mapping candidate support,
- inheritance mapping candidate support,
- collection element polymorphism candidate support,
- max-depth and circular-reference candidate support for deep graph scenarios.

Design rules:

- reverse mapping must never be generated implicitly,
- unflattening into domain entities must be opt-in and diagnostics-heavy,
- public DTO input should not update sensitive domain members without explicit allow rules,
- hooks and resolvers must be visible in diagnostics,
- convention and advanced mapping must not change explicit rule behavior.

Acceptance gates:

- tests cover flattening, reverse mapping, unflattening, include members, custom member source, custom destination path, value resolvers, value transformers, and conditional mapping,
- strict diagnostics identify every advanced mapping decision,
- docs separate safe read DTO mapping from risky write DTO/domain update mapping,
- analyzers have planned rules for suspicious reverse-map and sensitive-field output.

Patch candidates after v1.6:

- `v1.6.1`: reverse-map edge cases,
- `v1.6.2`: inheritance/polymorphism hardening if accepted,
- `v1.6.3`: deep graph safety controls if accepted.

## v1.7 Roadmap: Projection Provider Matrix

Status: `Planned`.

Goal:

Make projection safety stronger across real query providers while keeping expression projections explicit.

Planned packages:

- `AstraFlow.Mapper.EntityFrameworkCore`
- provider-specific test packages if needed

Features:

- projection parameterization without unsafe closure capture,
- tenant/user/current-time parameter examples,
- provider matrix tests for SQLite, SQL Server, PostgreSQL, and MySQL where practical,
- query tagging helper candidate,
- provider-specific warning codes,
- stricter expression analyzer for non-translatable calls,
- projection registry metadata export,
- CI-friendly projection report command candidate.

Acceptance gates:

- projection parameters do not leak secrets in diagnostics,
- validation does not execute queries,
- provider test matrix is documented and repeatable,
- docs explain static validation versus provider translation validation.

## v1.8 Roadmap: Observability Hooks

Status: `Planned`.

Goal:

Add production observability without forcing any one logging or telemetry stack.

Planned package:

- `AstraFlow.Observability`

Features:

- OpenTelemetry Activity support,
- request name tags,
- handler name tags,
- success/failure tags,
- duration metrics,
- notification fan-out metrics,
- notification handler failure metrics,
- mapping failure metrics,
- validation failure metrics from diagnostics,
- logging hooks without taking a hard dependency on a specific logger,
- opt-in redaction for request data,
- no payload logging by default.

Acceptance gates:

- no secret or DTO payload logging by default,
- telemetry can be disabled globally,
- NEXORA can trace request dispatch and notification fan-out in development.

## v1.9 Roadmap: Web And Validation Integration

Status: `Planned`.

Goal:

Provide first-class application integration for common web and validation scenarios while keeping core packages framework-neutral.

Planned packages:

- `AstraFlow.AspNetCore`
- `AstraFlow.FluentValidation`

`AstraFlow.AspNetCore` features:

- minimal API request dispatch helpers,
- controller request dispatch helpers,
- problem-details mapping for known AstraFlow failures,
- development-only diagnostics endpoint,
- diagnostics health-check integration,
- request/notification registration summary endpoint for local development,
- endpoint filters that dispatch requests without hiding model binding,
- safe examples for result mapping without forcing a specific result type,
- OpenAPI example guidance without taking ownership of API documentation.

`AstraFlow.FluentValidation` features:

- validation pipeline behavior,
- fail-fast validation mode,
- aggregate-error validation mode,
- validation result adapter,
- localization hook,
- severity mapping,
- validation diagnostics that list validators without printing request payloads,
- test helpers through `AstraFlow.Testing` once both packages exist.

Design rules:

- ASP.NET Core helpers must not force MVC, minimal APIs, or a specific result wrapper,
- validation integration must not make FluentValidation a core dependency,
- diagnostics endpoints must be disabled or development-only by default,
- no HTTP helper logs request bodies by default.

Acceptance gates:

- ASP.NET Core sample app covers minimal APIs and controllers,
- validation sample covers success, fail-fast, aggregate errors, and localization hooks,
- diagnostics endpoint redacts by default,
- tests cover problem-details mapping and validation behavior ordering,
- docs explain package boundaries clearly.

## v1.10 Roadmap: CLI, Templates, And Migration Tooling

Status: `Planned`.

Goal:

Make AstraFlow easy to inspect, adopt, and maintain from the command line.

Planned packages/tools:

- `AstraFlow.Cli`
- `AstraFlow.Templates`

CLI features:

- inspect registered handlers,
- inspect notification handlers,
- inspect pipeline behaviors,
- inspect mapping rules,
- inspect projections,
- validate mapping catalogs,
- validate projection catalogs,
- generate diagnostics reports,
- output JSON, Markdown, SARIF, and Mermaid/DOT graph formats,
- diff diagnostics reports between commits,
- check package references and target-framework support,
- prepare release checklist,
- inspect `.nupkg` contents,
- validate README links for package publishing,
- scaffold request/handler pairs,
- scaffold mapping rules,
- scaffold projections,
- scaffold test harnesses,
- candidate migration scanner from established mediator libraries,
- candidate migration scanner from established mapper libraries.

Template features:

- console app template,
- worker service template,
- ASP.NET Core minimal API template,
- ASP.NET Core controller template,
- modular monolith template,
- package authoring sample,
- diagnostics sample,
- projection/EF Core sample,
- secure ID mapping sample.

Design rules:

- CLI must never require app secrets,
- CLI must support offline analysis where possible,
- generated code must be explicit and readable,
- migration scanners should report suggestions, not silently rewrite application behavior.

Acceptance gates:

- CLI commands have deterministic output,
- CLI can run in CI,
- templates build immediately after creation,
- generated samples use current package versions,
- docs include copy-paste commands for every CLI command.

## v1.11 Roadmap: Reliability, Caching, Authorization, And Resilience Integrations

Status: `Candidate`.

Goal:

Provide optional building blocks for common pipeline concerns without forcing one application architecture.

Candidate packages:

- `AstraFlow.Caching`
- `AstraFlow.Authorization`
- `AstraFlow.Idempotency`
- `AstraFlow.Resilience`
- `AstraFlow.EntityFrameworkCore`

Candidate features:

- cache behavior with explicit cache-key contract,
- cache invalidation notification helpers,
- authorization behavior with pluggable policy evaluator,
- idempotency behavior with pluggable operation store,
- timeout behavior,
- retry behavior,
- circuit-breaker behavior,
- EF Core transaction behavior,
- EF Core outbox candidate,
- EF Core inbox candidate,
- query tagging helpers,
- domain event dispatch bridge candidate.

Design rules:

- no package may assume a tenant, user, permission, cache, database, or result model,
- caching must require explicit cache keys,
- authorization must not hide failed policy details from diagnostics,
- idempotency must not store request payloads by default,
- resilience helpers should integrate with established .NET primitives where practical.

Acceptance gates:

- each integration package has narrow dependencies,
- each package has sample apps,
- each package has failure-mode docs,
- each package works independently of the meta package,
- every helper can be disabled or replaced.

## v1.12 Roadmap: Documentation Website And Recipe Gallery

Status: `Planned`.

Goal:

Make AstraFlow understandable without requiring users to read source code or long roadmap files.

Features:

- documentation website,
- install/package decision guide,
- quick-start paths by app type,
- request/handler recipes,
- notification recipes,
- pipeline behavior recipes,
- mapping recipes,
- projection recipes,
- EF Core projection recipes,
- testing recipes,
- diagnostics recipes,
- secure ID recipes,
- migration recipes,
- compatibility matrix page,
- release notes page,
- analyzer rule catalog page,
- generator design page,
- benchmark methodology page,
- security model page.

Acceptance gates:

- docs site can be built in CI,
- README links to the docs site when available,
- docs site does not replace packed Markdown docs,
- examples compile against published packages,
- docs clearly separate stable APIs from candidate roadmap items.

## v1.13 Roadmap: Compatibility, Migration, And Consumer Confidence

Status: `Planned`.

Goal:

Make upgrades, adoption, and ecosystem compatibility credible before the v2 compile-time packages expand the public surface.

Planned work:

- public API baseline files,
- API diff report in CI,
- old-version upgrade smoke tests,
- package compatibility matrix,
- DI container compatibility tests where practical,
- host compatibility samples:
  - console,
  - worker service,
  - ASP.NET Core,
  - class library,
  - test project,
  - shared contracts/client project once `AstraFlow.Contracts` exists,
- migration cookbook from manual dispatch patterns,
- migration cookbook from established mediator patterns,
- migration cookbook from established mapper patterns,
- migration scanner report in `AstraFlow.Cli`,
- package deprecation guidance,
- version support policy,
- versioned documentation strategy,
- release branch strategy.

Design rules:

- migration tools report suggestions before they ever rewrite code,
- compatibility samples must use published packages, not local project references,
- public API changes must be classified as added, changed, deprecated, removed, or breaking,
- docs must be honest about supported target frameworks and integration package dependency versions,
- direct .NET Framework targets remain optional and evidence-driven.

Acceptance gates:

- CI can produce a public API diff,
- representative old-version upgrade tests pass,
- compatibility matrix is linked from README,
- migration cookbook examples compile,
- package deprecation policy is documented,
- release checklist includes API compatibility and upgrade verification.

## v2 Roadmap: Compile-Time Superiority

Status: `Planned`.

Goal:

Move high-value correctness checks and fast paths from runtime to compile time.

Planned packages:

- `AstraFlow.Mediator.Generators`
- `AstraFlow.Mapper.Generators`
- `AstraFlow.Analyzers`
- `AstraFlow.Mediator.Analyzers`
- `AstraFlow.Mapper.Analyzers`

### Source Generator Features

- generated handler registration,
- generated notification handler registration,
- generated void request registration,
- generated stream request registration,
- generated pre/post processor registration,
- generated exception handler/action registration,
- generated mapping dispatch tables,
- generated convention mapping plans,
- generated collection mapping fast paths,
- generated projection registry metadata,
- generated diagnostics metadata,
- generated service registration extension candidate,
- trimming-friendly registration,
- AOT-friendly registration,
- compile-time request metadata,
- compile-time mapping metadata.

### Analyzer Rules

- request has no handler,
- request has multiple handlers,
- request implements ambiguous void/response/stream contracts,
- stream request has no stream handler,
- stream handler performs suspicious blocking work,
- notification handler has suspicious blocking call,
- controller injects full mediator but only sends requests,
- pipeline behavior order violates configured policy,
- pipeline behavior registered with unsafe lifetime,
- request pre/post processor order is ambiguous,
- exception handler swallows failures without explicit handled state,
- mapping rule declares pair but does not implement it,
- mapping rule implements pair but does not declare it,
- mapping rule maps suspicious sensitive field,
- convention profile maps a sensitive field without explicit allow,
- reverse map writes into a sensitive destination member,
- unflattening writes into a domain-owned nested object without explicit allow,
- public DTO exposes raw `Guid` when secure ID policy is enabled,
- mapper call is used inside `IQueryable.Select` where expression projection is required,
- projection expression uses likely non-translatable members,
- projection captures complex runtime state instead of explicit parameters,
- rule catches broad `Exception` and hides mapping failure details,
- package consumer uses service locator inside mapping rules.

Generator design rules:

- generated code must be deterministic,
- generated code must be readable enough for debugging,
- generator output must not depend on build-machine paths except SourceLink metadata,
- generator features must have runtime fallback unless the package explicitly documents generator-only behavior,
- generated mapping plans must match diagnostics output.

Analyzer severity strategy:

- new analyzer rules start as `Info` or `Warning`,
- security-sensitive rules may offer `Error` mode,
- docs must explain how to suppress a rule responsibly,
- suppressions should require an explicit reason where possible,
- analyzer IDs must be stable and documented.

Acceptance gates:

- analyzers produce actionable messages and code locations,
- generators are deterministic,
- generated code is readable enough for debugging,
- generator output is covered by snapshot tests,
- analyzers have code-fix candidates where safe,
- AOT/trimming sample builds with generator-backed registration,
- NEXORA can enable analyzers in warning mode first, then error mode.

## v2.1 Roadmap: Performance And Benchmarks

Status: `Planned`.

Goal:

Measure real performance honestly and improve where it matters.

Planned project:

- `AstraFlow.Benchmarks`

Benchmark categories:

- cold start,
- service registration,
- first request dispatch,
- cached request dispatch,
- direct handler invocation baseline,
- pipeline depth 0, 1, 5, 10,
- notification fan-out 1, 5, 25, 100,
- single object mapping,
- collection mapping 100, 1,000, 100,000,
- projection expression lookup,
- allocations per dispatch,
- allocations per map,
- source-generated fast paths when v2 generators exist.

Rules:

- publish benchmark environment,
- do not claim leadership without repeatable numbers,
- keep manual baseline in every benchmark group,
- track performance regressions in CI once stable.

Acceptance gates:

- benchmark project runs locally and in CI on demand,
- benchmark output is committed or published as release artifact,
- benchmark docs explain hardware/runtime settings,
- regressions are tracked by category,
- performance optimizations do not weaken diagnostics or safety defaults.

## v2.2 Roadmap: Enterprise Supply Chain

Status: `Planned`.

Goal:

Make the package family suitable for enterprise review.

Features:

- package signing,
- SourceLink verification,
- deterministic builds,
- SBOM generation,
- dependency review workflow,
- API compatibility checks,
- public security advisory workflow,
- release provenance,
- changelog automation,
- signed git tags,
- branch protection guidance,
- package deprecation process,
- version support policy.

Acceptance gates:

- public release artifacts are reproducible where practical,
- every release has a changelog entry,
- security reports have a documented private path,
- package signing does not block local development.

## v2.3 Roadmap: Public API Governance

Status: `Planned`.

Goal:

Expand the v1.13 compatibility foundation into enforceable long-term API governance after analyzers, generators, and ecosystem packages increase the public surface.

Features:

- required public API baseline approvals,
- automated API diff enforcement in CI,
- SemVer classification guidance for runtime, analyzer, generator, CLI, and template packages,
- obsolete API policy,
- compatibility test suite for old package versions and older release branches,
- package deprecation guidance,
- release branch strategy,
- support window policy,
- package ownership and API review rules,
- docs for adding new public APIs.

Acceptance gates:

- CI fails on unreviewed public API changes,
- changelog labels breaking, added, changed, fixed, deprecated, removed, and security items,
- obsolete APIs include replacement guidance,
- release checklist includes API compatibility review.

## v2.4 Roadmap: Security Policy And DTO Governance

Status: `Planned`.

Goal:

Make AstraFlow safer for public API DTOs, secure identifiers, diagnostics, and generated/convention behavior.

Features:

- secure DTO policy abstraction,
- public raw-ID analyzer,
- sensitive member analyzer,
- secure ID mapping diagnostics,
- convention mapping sensitive-field gates,
- redaction policy shared by diagnostics, CLI, and observability,
- security threat model document,
- secure defaults verification tests,
- private security advisory workflow,
- package vulnerability response guide.

Acceptance gates:

- sensitive member rules are documented,
- secure DTO policy can be enabled without forcing one ID codec,
- diagnostics and CLI use the same redaction policy,
- tests prove payload values are not emitted by default.

## v3 Roadmap: Ecosystem Packages

Status: `Planned`.

Goal:

Provide first-class integrations while keeping the core packages small.

Planned packages:

- `AstraFlow.AspNetCore`
- `AstraFlow.EntityFrameworkCore`
- `AstraFlow.FluentValidation`
- `AstraFlow.OpenTelemetry`
- `AstraFlow.Caching`
- `AstraFlow.Authorization`
- `AstraFlow.Webhooks`
- `AstraFlow.Cli`
- `AstraFlow.Templates`
- `AstraFlow.Idempotency`
- `AstraFlow.Resilience`
- `AstraFlow.BackgroundJobs`
- `AstraFlow.DomainEvents`

### `AstraFlow.AspNetCore`

Features:

- endpoint helpers,
- request binding helpers,
- problem-details integration,
- minimal API examples,
- controller examples,
- health-check integration for diagnostics,
- development-only diagnostics endpoint,
- endpoint filter helpers,
- safe response mapping examples,
- OpenAPI guidance.

### `AstraFlow.EntityFrameworkCore`

Features:

- EF Core projection validation,
- provider-specific test matrix,
- query tagging helpers,
- projection translation diagnostics,
- safe ID projection examples,
- transaction behavior candidate,
- outbox candidate,
- inbox candidate,
- domain-event dispatch bridge candidate.

### `AstraFlow.FluentValidation`

Features:

- validation pipeline behavior,
- validation result adapter,
- fail-fast option,
- aggregate-errors option,
- localization hook.

### `AstraFlow.Caching`

Features:

- cache behavior,
- explicit cache-key contract,
- cache invalidation notification helpers,
- cache diagnostics,
- cache test helpers.

### `AstraFlow.Authorization`

Features:

- authorization behavior,
- pluggable policy evaluator,
- diagnostics for missing policies,
- test helpers for allowed/denied flows.

### `AstraFlow.Idempotency`

Features:

- idempotency behavior,
- pluggable operation store,
- explicit idempotency key contract,
- duplicate command behavior tests,
- no payload storage by default.

### `AstraFlow.Resilience`

Features:

- timeout behavior,
- retry behavior candidate,
- circuit-breaker behavior candidate,
- cancellation diagnostics,
- integration with established .NET resilience primitives where practical.

### `AstraFlow.BackgroundJobs`

Features:

- dispatch requests from worker/job systems,
- serialize only explicit job contracts,
- avoid scheduler lock-in,
- diagnostics for missing handlers at worker startup.

### `AstraFlow.DomainEvents`

Features:

- domain event collection abstraction candidate,
- domain event to notification bridge,
- transactional dispatch guidance,
- outbox integration hooks,
- no forced domain base class.

### `AstraFlow.Cli`

Features:

- inspect handlers,
- inspect mappings,
- inspect projections,
- generate diagnostics report,
- check package references,
- validate public API docs,
- prepare release checklist,
- generate graph output,
- scaffold request/handler/mapping/projection/test files,
- inspect package artifacts,
- validate release metadata.

## v4 Roadmap: Platform-Level Tooling

Status: `Planned`.

Goal:

Turn AstraFlow into a full application-flow platform for modular systems.

Features:

- visual request flow graph,
- visual pipeline graph,
- visual mapping graph,
- visual projection graph,
- diagnostics diff viewer,
- modular architecture scanner,
- package migration assistant,
- analyzer suppression management,
- secure DTO policy editor,
- benchmark dashboard,
- documentation website,
- recipe gallery,
- enterprise templates,
- sample modular monolith,
- sample microservice deployment,
- sample serverless worker deployment,
- IDE extension candidate,
- interactive diagnostics explorer candidate,
- release health dashboard candidate.

## Design Guardrails For Every Version

- Secure defaults stay secure.
- Magic remains opt-in.
- Explicit mapping stays first-class forever.
- No package may require NEXORA.
- No package may require a web framework unless its name says so.
- No package may log request payloads by default.
- No package may store secrets.
- Diagnostics must redact by default.
- Error messages must explain what failed and how to fix it.
- Breaking changes require a major version.
- New features require tests, docs, samples, and package metadata updates.

## Public Documentation Backlog

Add or expand these docs before broader public promotion:

- architecture overview,
- package design principles,
- mediator deep dive,
- mapper deep dive,
- pipeline behavior guide,
- notification failure policy guide,
- mapping validation guide,
- secure ID mapping guide,
- projection guide,
- ASP.NET Core sample guide,
- package release process,
- security model,
- versioning policy,
- compatibility policy,
- contribution guide with code style,
- analyzer rule catalog when analyzers exist,
- generator design notes when generators exist,
- benchmark methodology when benchmarks exist.

## Reference Feature Matrix

This matrix describes feature classes AstraFlow should cover over time. It avoids naming any competitor in package documentation and instead tracks product capability categories.

| Capability | Now `v1.4.0` | Planned `v1.5-v1.13` | Planned `v2` | Planned `v3+` |
| --- | --- | --- | --- | --- |
| Target frameworks | Core packages and testing package multi-target; EF Core package `net10.0` | Direct legacy target research and EF provider target expansion | API compatibility governance | Enterprise compatibility policy |
| Request dispatch | Done, including void requests and object dispatch | More ergonomics and diagnostics | Generated registration, analyzer checks | Visual request graph |
| Stream requests | Stream request and stream behavior support done | Cancellation and diagnostics polish | Stream analyzers | Streaming templates |
| Notification publish | Sequential, parallel, and bounded-parallel strategies done | Ordering diagnostics and strategy polish | Handler-risk analyzers | Observability dashboards |
| Pipeline behaviors | Response, void, stream, pre/post, exception actions/handlers done | Order diagnostics and helper polish | Order analyzers | Visual pipeline graph |
| Contracts-only package | `AstraFlow.Contracts` done | Compatibility polish | API compatibility checks | Shared contract templates |
| Explicit object mapping | Done | More assertions and diagnostics | Generated fast paths | Visual mapping graph |
| Collection mapping | Done | More shape coverage | Generated collection fast paths | Benchmark dashboard |
| Secure ID abstraction | Done | Test codec and policy diagnostics | DTO raw ID analyzer | Secure DTO policy tooling |
| Projections | Done | Parameters and provider matrix | Projection analyzers, generated metadata | Query diagnostics tooling |
| EF Core projection validation | Done | Provider matrix expansion | Provider-specific analyzer hints | EF helper ecosystem package |
| Convention mapping | Not included | Opt-in package | Analyzer guarded | Visual diagnostics |
| Mapping profiles/catalogs | Not included | Opt-in profile/catalog package | Compile-time metadata | Mapping design tools |
| Flattening | Not included | Opt-in advanced mapping | Analyzer guarded | Visual diagnostics |
| Reverse mapping | Not included | Opt-in advanced mapping | Sensitive-write analyzers | DTO policy tooling |
| Unflattening | Not included | Opt-in advanced mapping | Domain-write analyzers | Visual mapping graph |
| Existing destination mapping | Not included | Update/patch mapping support | Analyzer guarded | Entity update recipes |
| Startup diagnostics | Done | Expanded finding coverage | Analyzer metadata | Health endpoints |
| Testing support | `AstraFlow.Testing` done | More harnesses as new mediator/mapping features ship | Analyzer-friendly test helpers | Test templates |
| Observability | Not included | OpenTelemetry/logging hooks | Metrics tests | Dashboards |
| ASP.NET Core integration | Sample only | Dedicated helper package | Analyzer hints | Templates and diagnostics endpoint |
| Validation integration | Not included | Dedicated validation package | Analyzer hints | Recipe gallery |
| CLI/templates | Not included | CLI and templates | Analyzer/generator integration | Migration assistant |
| Migration and upgrade confidence | Basic docs | API diff, old-version smoke tests, migration cookbook, compatibility matrix | Analyzer/code-fix assisted migration | Platform migration assistant |
| AOT/trimming | Basic-friendly design | Registration diagnostics | Generator support | Templates |
| Enterprise supply chain | Basic metadata | Release hardening | SBOM/signing | Compliance reports |

## Detailed Parity Backlog

### Compatibility Backlog

| Item | Priority | Target | Notes |
| --- | --- | --- | --- |
| Multi-target feasibility audit | Done | `v1.2.1` | Identified API/dependency blockers before changing package targets. |
| Core `netstandard2.0` support | Done | `v1.2.2` | Enables broad class library and older app adoption for core packages. |
| Core `net8.0`/`net9.0`/`net10.0` targets | Done | `v1.2.2` | Modern supported runtime coverage for core packages. |
| Direct legacy framework target | Medium | Candidate | Only add if direct target provides value beyond `netstandard2.0`. |
| EF Core conditional targets | Medium | `v1.7` | Requires matching EF Core major versions per TFM. |
| API compatibility baseline | High | `v2.3` | Blocks accidental breaking public API changes. |
| Public API diff in CI | High | `v1.13` | Gives immediate review signal before v2 expands the surface. |
| Old-version upgrade smoke tests | High | `v1.13` | Proves SemVer-safe releases are actually upgradeable. |
| DI container compatibility matrix | Medium | `v1.13` | Verifies common container behavior where practical without owning every DI provider. |
| Host compatibility sample matrix | Medium | `v1.13` | Shows package use in console, worker, ASP.NET Core, class library, and test projects. |
| Versioned docs strategy | Medium | `v1.13` | Prevents docs for latest APIs from confusing older package consumers. |
| Package deprecation policy | Medium | `v1.13` | Defines how packages or APIs are retired responsibly. |
| Compatibility docs | Done | `v1.2.1` and `v1.2.2` | Explains supported TFMs accurately and separates core package support from EF Core support. |

### Mediator Backlog

| Item | Priority | Target | Notes |
| --- | --- | --- | --- |
| Void request contract | Done | `v1.4` | Needed for command handlers with no response. |
| Void request object dispatch | Done | `v1.4` | Must preserve clear ambiguous-contract errors. |
| Stream request contract | Done | `v1.4` | Use `IAsyncEnumerable<T>` and cancellation-safe execution. |
| Stream pipeline behavior | Done | `v1.4` | Separate contract from normal request pipeline. |
| Pre-processors | Done | `v1.4` | Useful for validation/logging setup; behavior remains more powerful. |
| Post-processors | Done | `v1.4` | Useful for auditing/cleanup after handlers. |
| Exception handlers | Done | `v1.4` | Must require explicit handled state. |
| Exception actions | Done | `v1.4` | Must always rethrow after side effects. |
| Contracts-only package | Done | `v1.4` | Important for shared API contracts, Blazor, clients, and modular boundaries. |
| Fluent registration builder | Done | `v1.4` | Needed for predictable behavior registration and discoverability. |
| Parallel notification strategy | Done | `v1.4` | Opt-in because ordering and scoped state can be risky. |
| Cancellation diagnostics | Medium | `v1.4`/`v2` | Runtime docs first, analyzer later. |
| Request envelope/correlation support | Low | Candidate | Useful for observability but must not log payloads. |
| Timeout/idempotency/resilience behaviors | Medium | `v1.11` candidate | Optional packages only. |
| Transaction/outbox bridge | Medium | `v1.11`/`v3` candidate | Integration package only. |
| Notification ordering metadata | Low | Candidate | Avoid unless real apps need it. |

### Mapper Backlog

| Item | Priority | Target | Notes |
| --- | --- | --- | --- |
| Mapping profiles/catalogs | High | `v1.5` | Organizes convention and explicit config for large apps. |
| Exact convention mapping | High | `v1.5` | First convention feature because it is easiest to audit. |
| Ignore/include rules | High | `v1.5` | Required for safe convention mapping. |
| Sensitive-field deny list | High | `v1.5` | Non-negotiable security gate. |
| Unmapped member validation | High | `v1.5` | Equivalent practical value to configuration validation. |
| Null substitution | Medium | `v1.5` | Common DTO cleanup feature. |
| Value converters | Medium | `v1.5` | Prefer explicit converter classes. |
| Conditional member mapping | Medium | `v1.5` | Useful for update/patch flows. |
| Existing destination mapping | Medium | `v1.5` | Useful for tracked entities and command updates. |
| Enum mapping validation | Medium | `v1.5` | Useful and low-risk if explicit. |
| Nullable/numeric conversion diagnostics | Medium | `v1.5` | Prevents silent lossy mappings. |
| Record/constructor binding | Medium | `v1.5` | Must be ambiguity-checked. |
| Flattening | High | `v1.6` | Must be opt-in and diagnostic-heavy. |
| Reverse mapping | High | `v1.6` | Must never be implicit. |
| Unflattening | High | `v1.6` | Must protect domain-owned nested objects. |
| Include members | Medium | `v1.6` | Needed for controlled composition mapping. |
| Value resolvers | Medium | `v1.6` | Add lifetime diagnostics. |
| Mapping plan export | High | `v1.5`/`v1.6` | Key AstraFlow differentiator for auditability. |
| Value transformers | Low | Candidate | Can hide global behavior, needs careful design. |
| Polymorphic mapping | Low | Candidate | Add only after core conventions stabilize. |
| Inheritance mapping | Low | Candidate | Add only after profile/catalog model is stable. |
| Circular reference controls | Low | Candidate | Only if deep graph mapping becomes a supported scenario. |

### AstraFlow-Only Advantage Backlog

| Item | Priority | Target | Why It Makes AstraFlow Stronger |
| --- | --- | --- | --- |
| Diagnostics-first registration report | Done | `v1.1` | Makes app wiring inspectable. |
| Projection validation findings | Done | `v1.2` | Catches query risks before production. |
| EF Core translation checks | Done | `v1.2` | Validates provider/model translation without executing queries. |
| Secure ID abstraction | Done | `v1.0` | Keeps raw IDs and encryption policy explicit. |
| Safe convention diagnostics | High | `v1.5` | Makes automatic mapping auditable. |
| Diagnostics diffing | High | `v1.10` | Lets teams review flow/mapping/projection changes in CI. |
| SARIF output | Medium | `v1.10`/`v2` | Helps code scanning and enterprise review. |
| Sensitive DTO policy analyzers | High | `v2` | Prevents accidental public raw IDs and secret-field leaks. |
| Secure DTO policy | High | `v2.4` | Turns secure ID guidance into enforceable package behavior. |
| Visual request/mapping graph | Medium | `v4` | Helps large teams understand flow without reading all source. |

## Next Chat Bootstrap

Use this prompt to continue in a new chat:

```text
We are working on AstraFlow, a MIT-licensed .NET package family extracted from NEXORA. The package folder is packages/AstraFlow. Read packages/AstraFlow/docs/roadmap.md first. Current goal: finish publishing v1, verify NuGet packages, then migrate NEXORA from local AstraFlow project references to PackageReference entries. Do not delete packages/AstraFlow until NuGet packages are verified and NEXORA builds/tests against published packages. Keep package docs competitor-name-free and never commit secrets.
```
