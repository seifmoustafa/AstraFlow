# AstraFlow Product Roadmap

## Executive Summary

AstraFlow is a MIT-licensed standalone .NET package family for explicit, inspectable, secure, and diagnosable application flow.

The completed `v1.0.0` through `v1.4.0` roadmap is the fixed baseline. Those releases are not being removed, downgraded, reordered, or rewritten as if the project is starting over. Any follow-up work against that baseline belongs in patch-safe `v1.4.x` releases.

This revised plan starts after `v1.4.0` and moves practical MediatR-style and AutoMapper-style capability parity earlier. The sequence is:

- `v1.4.x`: patch-only stabilization.
- `v1.5` through `v1.8`: core mapping parity, projection parity, and early compile-time safety.
- `v1.9` through `v1.13`: benchmarks, CLI, integrations, observability, and consumer confidence.
- `v2+`: compile-time superiority, security governance, generated fast paths, and enterprise supply-chain controls.
- `v3+` and `v4+`: optional ecosystem packages and platform-level tooling.

AstraFlow is not a code fork, API clone, documentation clone, or branding clone of any competitor. Capability parity means solving the same developer problems with AstraFlow's own package architecture, APIs, implementation, diagnostics, tests, and documentation.

NEXORA-specific references are removed or rewritten as generic package-consumer validation. AstraFlow must stand on its own through clean sample consumers, package install verification, public tests, compatibility matrices, sample applications, and documented release gates.

## Standalone Package Cleanup Report

Status: `Implemented candidate`.

The cleanup target is every private-project-specific reference in public package materials. Useful AstraFlow validation ideas are kept, but the language must be generic.

Search terms:

```powershell
rg -n "NEXORA|Nexora|nexora|NEXORA-Backend|NEXORA-Frontend|nexora-cli|tools/nexora-cli"
rg -n "private product|internal application|monorepo|host system|project-specific"
rg -n "packages/AstraFlow|E:\\Projects|local project references"
```

Files found before cleanup:

| File | References found | Classification | Required action |
| --- | --- | --- | --- |
| `CONTRIBUTING.md` | Private local `DOTNET_CLI_HOME` path and nested `packages/AstraFlow` commands. | Rewrite generically. | Use repository-root commands and a local workspace cache path. |
| `README.md` | NEXORA non-lock-in example and release validation gate. | Rewrite generically. | Say no private product lock-in and require representative consumer validation. |
| `docs/roadmap.md` | Private migration, private build/test commands, private validation gates, and private bootstrap prompt. | Rewrite or remove. | Replace with standalone roadmap and generic sample-consumer gates. |
| `docs/release-checklist.md` | Private consumer validation and post-publish migration section. | Rewrite generically. | Validate clean sample consumers and package references only. |
| `docs/publishing.md` | Private release repository warning, private migration step, private consumption commands. | Rewrite generically. | Publish from standalone repository and validate clean consumers. |

Rewrite examples:

| Before | After |
| --- | --- |
| "NEXORA backend tests pass." | "Representative consumer application tests pass." |
| "NEXORA builds against the package projects." | "Clean sample consumer applications build against package projects or packed packages." |
| "Migrate NEXORA from local project references." | "Verify migration from local project references to published NuGet `PackageReference` entries in a clean sample consumer." |
| "NEXORA can generate a startup flow report." | "A sample consumer application can generate a startup flow report." |
| "NEXORA read models." | "Consumer application read models." |
| `tools/nexora-cli` | `AstraFlow.Cli` |
| `NEXORA-Backend/...` | `samples/...`, `tests/...`, or `sample-consumer/...` |

Cleanup acceptance gates:

- `rg -n -i "nexora" .` returns no operational references outside this cleanup report, policy language, and scan-command examples.
- No package metadata, README, docs, samples, tests, scripts, templates, or workflows require knowledge of a private product.
- Public release validation uses clean sample consumers, package install checks, and public test projects.
- Migration guidance uses generic local project reference to NuGet `PackageReference` flows.
- Any private adoption story is kept outside this repository.

## Standalone Package Independence Policy

Status: `Implemented candidate`.

AstraFlow is not tied to any private product, internal system, monorepo, or host application.

No package may require NEXORA or any application-specific dependency.

No public documentation may say or imply that AstraFlow depends on a private product for validation, testing, migration, or adoption.

Public validation must be demonstrated through:

- clean sample consumers,
- package install verification,
- public package tests,
- compatibility matrices,
- generic sample applications,
- package artifact checks,
- migration examples that compile in this repository.

Project-specific migration notes must not appear in the public roadmap.

Private product references must stay out of public docs, package metadata, samples, release notes, tests, scripts, templates, and CI workflows.

Any private adoption story must be kept outside the public package repository.

## Status Legend

- `Done`: implemented, tested, documented, and intended for release or already released.
- `Implemented candidate`: implemented or edited in the repository but still requires final maintainer review.
- `Patch`: SemVer-safe hardening for an existing released feature.
- `Planned`: approved direction, not implemented yet.
- `Candidate`: useful but still requires design review.
- `Research`: requires technical or market validation.
- `Rejected`: deliberately not planned.
- `Moved earlier`: intentionally advanced because it is required for practical parity.
- `Moved later`: retained but delayed behind parity and confidence work.

## Fixed Baseline: v1.0-v1.4

Status: `Done`.

The `v1.0.0` through `v1.4.0` releases are the fixed historical and current working baseline. Do not remove, reorder, downgrade, or rewrite this sequence in future roadmap edits. Patch releases may harden the baseline but must not move baseline features into later versions.

### v1.0.0

Status: `Done`.

Completed scope:

- `AstraFlow.Mediator` request/response dispatch.
- Notification publishing.
- Pipeline behaviors.
- Assembly scanning.
- Duplicate handler detection.
- Missing handler diagnostics.
- Optional handler coverage validation.
- `AstraFlow.Mapper` explicit mapping rules.
- Declared mapping validation.
- Collection mapping.
- Explicit query projection helpers.
- Secure ID abstractions.
- `AstraFlow` convenience registration package.
- Package tests, integration tests, samples, NuGet metadata, XML documentation, symbols, SourceLink-ready metadata, and MIT license.

### v1.0.1

Status: `Done`.

Completed scope:

- Clear failure for request types implementing multiple response contracts.
- Hardened mediator registration for null services, null marker types, and partial assembly-load failures.
- Registration options documentation polish.
- XML documentation polish.
- Current .NET target documentation.
- Expanded public docs for API reference, architecture, mediator scenarios, mapper scenarios, troubleshooting, and publishing.

### v1.1.0

Status: `Done`.

Completed scope:

- `AstraFlow.Diagnostics`.
- Framework-neutral registration reports for handlers, notifications, pipeline behaviors, mapping rules, and projections.
- Severity-coded findings.
- Duplicate request handler findings.
- Ambiguous request contract findings.
- Missing request handler findings.
- Singleton lifetime warnings.
- Mapper catalog validation failures.
- In-memory diagnostics reports.
- JSON output.
- Markdown output.
- Health-check-ready summary object.
- Diagnostics tests, diagnostics sample, CI packing, publish workflow support, and documentation.

### v1.2.0

Status: `Done`.

Completed scope:

- Projection registry.
- Deterministic unnamed and named projection lookup.
- `INamedProjection<TSource, TDestination>`.
- Projection validation warning-by-default findings.
- Duplicate projection detection.
- Null expression findings.
- Mapper-call, custom-method, non-deterministic-value, complex-closure, and unsupported-construction findings.
- Diagnostics integration for projection names and validation findings.
- `AstraFlow.Mapper.EntityFrameworkCore`.
- EF Core relational translation validation helpers.
- SQLite EF Core integration tests.
- Expanded projection registry tests.

### v1.2.1

Status: `Done`.

Completed scope:

- Compatibility guidance for current target support and future target expansion.
- Package selection guidance.
- Release checklist gates for target framework verification, dependency review, and clean install smoke tests.
- Compatibility audit findings for future `netstandard2.0`, `net8.0`, `net9.0`, and direct legacy framework support.
- Package release notes update.
- No runtime behavior changes.

### v1.2.2

Status: `Done`.

Completed scope:

- Multi-target support for `AstraFlow`, `AstraFlow.Mediator`, `AstraFlow.Mapper`, and `AstraFlow.Diagnostics`.
- Core package assets for `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`.
- `AstraFlow.Mapper.EntityFrameworkCore` remains `net10.0` because it follows the EF Core 10 package line.
- Compatibility-safe source changes for older target assets.
- `System.Text.Json` package dependency for the `netstandard2.0` diagnostics asset.
- Compatibility, release, publishing, and package-selection docs updated for actual target frameworks.

### v1.2.3

Status: `Done`.

Completed scope:

- `scripts/verify-package-install.ps1`.
- Clean external consumer install verification.
- Core package verification in `netstandard2.0`, `net8.0`, and `net9.0` consumer projects.
- Full package verification, including EF Core package, in a `net10.0` consumer project.
- Clean package install verification wired into local packing, CI, and publish workflow.
- Release documentation updated so target framework support must be proven by automated package install checks.

### v1.3.0

Status: `Done`.

Completed scope:

- `AstraFlow.Testing`.
- Fake sender, fake publisher, and fake mediator helpers.
- Request and notification recording.
- Handler, notification handler, and pipeline test harnesses.
- Mediator, mapper, projection, diagnostics, exception, mapping-rule, and secure ID assertion helpers.
- Deterministic `TestSecureIdCodec`.
- No dependency on xUnit, NUnit, MSTest, FluentAssertions, or mocking frameworks.
- `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` assets.
- CI, publish, pack, and clean-install verification updated for `AstraFlow.Testing`.

### v1.4.0

Status: `Done`.

Completed scope:

- `AstraFlow.Contracts` shared contracts package.
- Mediator contracts moved to `AstraFlow.Contracts` with source-compatible namespace forwarding where applicable.
- Void request support through `IRequest`, `IRequestHandler<TRequest>`, and `ISender.Send(IRequest, ...)`.
- Runtime `Send(object)` support for void requests.
- Stream request support through `IStreamRequest<TResponse>`, `IStreamRequestHandler<TRequest, TResponse>`, `IStreamSender`, and mediator stream dispatch.
- Stream pipeline behaviors.
- Void request pipeline behaviors.
- Request pre-processors and post-processors.
- Request exception actions that rethrow.
- Request exception handlers that must explicitly mark failures as handled.
- Opt-in `Parallel` and `BoundedParallel` notification publish strategies.
- Sequential notification publishing remains default.
- `AstraFlowMediatorBuilder` registration helpers for behavior, processor, stream behavior, and exception-flow registration.
- Pack, publish, CI, and clean-install verification updated for `AstraFlow.Contracts`.

## v1.4.x Stabilization Plan

Status: `Patch`.

Goal:

Harden the `v1.4.0` mediator-parity baseline without introducing broad new public surfaces or breaking API changes.

Why this exists:

`v1.4.0` introduces the broadest mediator surface so far. Patch releases should reduce adoption friction and clarify diagnostics before the roadmap shifts into mapping parity.

Packages affected:

- `AstraFlow.Contracts`
- `AstraFlow.Mediator`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`
- `AstraFlow`
- docs, samples, scripts, and CI

Features included:

- Registration builder polish.
- Documentation corrections.
- Clearer diagnostics for existing stream, processor, exception-flow, and notification registration behavior.
- Stream cancellation hardening.
- Stream disposal behavior tests.
- Processor and exception-handler ordering diagnostics for existing contracts.
- Install verification expansion.
- Clean sample consumer checks.
- Package metadata polish.
- CI/package artifact verification improvements.
- Test coverage expansion for existing `v1.4.0` APIs.

Competitor parity covered:

- Mature mediator stabilization: predictable registration, cancellation, stream handling, diagnostics, and package verification.

AstraFlow advantage beyond parity:

- Public diagnostics and package verification remain first-class release gates rather than afterthoughts.

Acceptance gates:

- All package builds pass.
- All tests pass in Release.
- Clean package install verification passes.
- A clean sample consumer can send response requests, void requests, stream requests, and notifications.
- Diagnostics report existing `v1.4.0` mediator registrations without leaking payloads.
- No private-product validation dependency references remain outside cleanup report and policy language.

Test requirements:

- Stream cancellation and disposal tests.
- Exception action always-rethrows tests.
- Exception handler explicit-handled-state tests.
- Processor order tests.
- Bounded parallel notification failure aggregation tests.
- Package install smoke tests.

Documentation requirements:

- Mediator guide updates.
- Testing guide updates for existing helpers.
- Troubleshooting entries for stream, processor, and exception-flow failures.
- Release checklist and publishing docs must use generic sample consumers.

Migration examples required:

- Local project reference to NuGet `PackageReference` migration in a clean sample consumer.
- Response request, void request, notification, stream request, and pipeline examples.

Risk level:

- Low to medium. Patch-safe only.

What must NOT be included:

- Broad new mapping parity.
- New major public API areas.
- Breaking changes.
- Moving `v1.4.0` features to later versions.
- Private-product validation gates.

## Fast-Track Post-v1.4 Roadmap

### v1.5 AutoMapper Core Parity

Status: `Moved earlier` and `Planned`.

Goal:

Make AstraFlow usable for common DTO mapping scenarios while keeping convention mapping opt-in, safe, and inspectable.

Why this version exists:

The largest practical adoption gap after `v1.4.0` is AutoMapper-style productivity for common read DTOs and simple write/update DTOs. This cannot wait behind dashboards, websites, or broad integrations.

Packages affected:

- `AstraFlow.Mapper`
- candidate `AstraFlow.Mapper.Conventions` if package split is needed
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`
- docs and samples

Features included:

- Safe convention mapping disabled by default.
- Mapping profiles and catalogs.
- Exact source/destination type-pair registration.
- Exact property-name matching.
- Case-insensitive matching as opt-in.
- Fluent member configuration.
- Include and ignore rules.
- Required destination member rules.
- Unmapped destination diagnostics.
- Unmapped source diagnostics.
- Ambiguity detection.
- Strict mode that rejects undeclared convention output.
- Diagnostics for every convention-created member.
- Generated preview report for convention output.
- Nullable compatibility diagnostics.
- Numeric conversion diagnostics.
- Enum mapping validation and enum-to-string support.
- Constructor and record binding.
- Immutable destination support.
- Null substitution.
- Value converters.
- Conditional member mapping.
- Existing destination mapping.
- Mapping plan export.
- Sensitive-field deny list.
- Sensitive destination write policy.

Competitor parity covered:

- Common object-to-object mapping productivity.
- Profile/catalog organization.
- Member-level configuration.
- Configuration validation.
- Existing destination update scenarios.

AstraFlow advantage beyond parity:

- Convention mapping is never default.
- Every convention-created member is diagnosable.
- Sensitive fields are denied by default unless explicitly allowed.
- Strict mode can fail startup when convention output changes.

Acceptance gates:

- Explicit mapping remains first-class and unchanged.
- Convention mapping must be opt-in.
- Startup validation detects missing, duplicate, ambiguous, unmapped, unsafe nullable, unsafe numeric, and sensitive-field mappings.
- Mapping plan export lists every member decision.
- Strict mode fails on undeclared convention output.
- Package samples build.

Test requirements:

- Exact-match convention tests.
- Case-insensitive opt-in tests.
- Include/ignore tests.
- Required destination member tests.
- Unmapped source and destination tests.
- Nullable/numeric/enum diagnostics tests.
- Constructor/record/immutable destination tests.
- Sensitive-field deny-list tests.
- Existing destination mapping tests.
- Mapping plan snapshot-style tests.

Documentation requirements:

- Safe convention mapping guide.
- Mapping profile/catalog guide.
- Member configuration reference.
- Sensitive-field policy guide.
- Strict mode guide.
- Troubleshooting entries for unmapped, ambiguous, and sensitive-field failures.

Migration examples required:

- AutoMapper-style read DTO mapping to AstraFlow explicit mapping.
- AutoMapper-style read DTO mapping to AstraFlow opt-in convention mapping.
- Existing destination update mapping.
- Ignoring sensitive fields.
- Replacing implicit convention assumptions with diagnostics-visible rules.

Risk level:

- High. This is a major capability expansion and must not weaken the explicit core.

What must NOT be included:

- Convention mapping enabled by default.
- Hidden deep graph mapping.
- Implicit reverse mapping.
- Sensitive field mapping by convention.
- Framework dependencies in mapper core.
- Claims of complete AutoMapper replacement.

### v1.6 Advanced AutoMapper Parity

Status: `Moved earlier` and `Planned`.

Goal:

Cover advanced mapping scenarios without compromising explicit auditability.

Why this version exists:

Core convention mapping is not enough for real applications. Advanced member shape changes, flattening, reverse mapping, and controlled update flows are common enough to become early roadmap work.

Packages affected:

- `AstraFlow.Mapper`
- optional convention/advanced mapping package if split is needed
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`

Features included:

- Flattening.
- Unflattening.
- Explicit reverse mapping.
- Include members.
- Custom source expressions.
- Custom destination paths.
- Value resolvers.
- Value transformers if safe.
- Before-map hooks if diagnostics-visible.
- After-map hooks if diagnostics-visible.
- Inheritance mapping if design is stable.
- Polymorphic mapping if design is stable.
- Collection element polymorphism if design is stable.
- Collection update strategies if required for real update flows.
- Required member validation expansion.
- Strict diagnostics for every advanced mapping decision.

Competitor parity covered:

- Flattened DTOs.
- Explicit reverse maps.
- Member composition.
- Resolver and transformer scenarios.
- Controlled update/patch flows.

AstraFlow advantage beyond parity:

- Reverse mapping is never implicit.
- Unflattening into domain entities is opt-in and diagnostics-heavy.
- Public DTO input must not update sensitive domain members without explicit allow rules.

Acceptance gates:

- Every advanced mapping decision appears in diagnostics.
- Reverse maps require explicit declaration.
- Unflattening has domain-write safety diagnostics.
- Sensitive destination writes are blocked or reported.
- No deep graph traversal is enabled by default.

Test requirements:

- Flattening tests.
- Unflattening tests.
- Reverse mapping tests.
- Include-member tests.
- Resolver and transformer tests.
- Before/after hook diagnostics tests.
- Sensitive destination update tests.
- Collection update strategy tests if implemented.

Documentation requirements:

- Advanced mapping guide.
- Reverse mapping safety guide.
- Unflattening and domain update guide.
- Resolver and transformer reference.

Migration examples required:

- Flattened read DTO.
- Explicit reverse map with allow rules.
- Patch/update DTO with sensitive destination protection.

Risk level:

- High.

What must NOT be included:

- Implicit reverse mapping.
- Automatic unflattening into domain-owned nested objects.
- Global value transformers that are hidden from diagnostics.
- Circular-reference or max-depth behavior unless deep graph mapping is explicitly designed.

### v1.7 Projection and EF Provider Parity

Status: `Moved earlier` and `Planned`.

Goal:

Make AstraFlow projections credible for real EF Core read models and safer than hidden runtime SQL translation assumptions.

Why this version exists:

Projection support exists, but real consumer confidence requires parameters, provider-specific validation, stable warning codes, and CI-friendly reports.

Packages affected:

- `AstraFlow.Mapper`
- `AstraFlow.Mapper.EntityFrameworkCore`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`

Features included:

- Projection parameters.
- Explicit parameter object model.
- Tenant/user/current-time parameter examples.
- No unsafe closure capture.
- Provider matrix: SQLite, SQL Server, PostgreSQL, and MySQL where practical.
- Provider-specific warning codes.
- Expression translation warnings.
- Non-translatable method warnings.
- Non-deterministic expression warnings.
- Stricter mapper-call-in-query detection.
- Projection plan export.
- Projection diffing if useful.
- Raw public ID and secure ID projection checks.
- SQL snapshot helper if safe.
- CI-friendly projection reports.

Competitor parity covered:

- Project-to-query DTO scenarios.
- Provider translation validation.
- Projection parameterization.
- Projection configuration validation.

AstraFlow advantage beyond parity:

- Validation must not execute application queries.
- Provider-specific findings are stable and reviewable.
- Projection plans can be exported and compared in CI.

Acceptance gates:

- Provider validation runs without executing application queries.
- SQLite provider tests pass.
- SQL Server, PostgreSQL, and MySQL provider tests exist where practical.
- Unsafe closure capture produces a finding.
- Projection plan export is deterministic.
- Raw public ID checks integrate with secure ID policy where enabled.

Test requirements:

- Projection parameter tests.
- Provider-specific validation tests.
- Translation warning tests.
- Non-translatable method tests.
- Closure capture tests.
- Projection plan export tests.
- SQL snapshot helper tests if implemented.

Documentation requirements:

- Projection parameter guide.
- EF provider validation matrix.
- Projection diagnostics code catalog.
- CI projection report guide.

Migration examples required:

- AutoMapper-style query projection to AstraFlow projection.
- Parameterized tenant/user/time projection.
- Provider validation in a clean sample consumer.

Risk level:

- Medium to high.

What must NOT be included:

- Executing application queries during validation.
- Hiding provider translation behavior.
- Async query abstraction that obscures `IQueryable` provider ownership.

### v1.8 Early Analyzers and Source Generators

Status: `Moved earlier` and `Planned`.

Goal:

Move correctness earlier and make AstraFlow stronger than runtime-only libraries.

Why this version exists:

Runtime diagnostics are useful, but missing handlers, duplicate handlers, unsafe mapping, and risky projections should be caught during build whenever possible.

Packages affected:

- `AstraFlow.Analyzers`
- `AstraFlow.Generators`
- `AstraFlow.Contracts`
- `AstraFlow.Mediator`
- `AstraFlow.Mapper`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`

Features included:

- Missing handler analyzer.
- Duplicate handler analyzer.
- Ambiguous request contract analyzer.
- Missing stream handler analyzer.
- Behavior order analyzer.
- Unsafe lifetime analyzer.
- Mapping declaration drift analyzer.
- Sensitive field mapping analyzer.
- Raw public ID analyzer.
- Mapper call inside `IQueryable` analyzer.
- Non-translatable projection analyzer.
- Projection captures complex runtime state analyzer.
- Generated handler registration.
- Generated notification registration.
- Generated stream registration.
- Generated mapping dispatch tables.
- Generated convention mapping plans.
- Generated projection metadata.
- AOT/trimming-friendly registration.

Competitor parity covered:

- Registration and mapping correctness checks before runtime.
- AOT/trimming-friendly setup.

AstraFlow advantage beyond parity:

- Analyzer and generator metadata feeds diagnostics, CLI, and future visual tooling.
- Generated code must be deterministic and readable.

Acceptance gates:

- Analyzers have stable IDs and actionable messages.
- Generators are deterministic.
- Generated code is readable enough for debugging.
- Runtime fallback remains unless explicitly documented otherwise.
- AOT/trimming sample builds.
- Analyzer suppressions for security-sensitive rules require documented justification where practical.

Test requirements:

- Analyzer unit tests.
- Generator snapshot tests.
- AOT/trimming sample test.
- Diagnostics metadata tests.
- False-positive regression tests.

Documentation requirements:

- Analyzer rule catalog.
- Generator design notes.
- AOT/trimming registration guide.
- Suppression policy guide.

Migration examples required:

- Enabling analyzers in warning mode.
- Moving from reflection scanning to generated registration.
- Fixing missing handler and mapping drift findings.

Risk level:

- High.

What must NOT be included:

- Unsafe automatic rewrites.
- Code fixes that change behavior silently.
- Generator-only runtime behavior without migration guidance.

### v1.9 Performance and Benchmarks

Status: `Moved earlier` and `Planned`.

Goal:

Measure real performance honestly before making performance claims or optimizations.

Why this version exists:

AstraFlow should not claim speed without repeatable evidence. Benchmarks must exist before marketing claims and before generated fast paths are optimized.

Packages affected:

- `AstraFlow.Benchmarks`
- all runtime packages as benchmark subjects

Features included:

- BenchmarkDotNet project or equivalent benchmark project.
- Cold start benchmark.
- Service registration benchmark.
- First request dispatch benchmark.
- Cached request dispatch benchmark.
- Direct handler invocation baseline.
- Pipeline depth benchmarks: 0, 1, 5, 10.
- Notification fan-out benchmarks: 1, 5, 25, 100.
- Single object mapping benchmark.
- Collection mapping benchmarks: 100, 1,000, 100,000.
- Projection lookup benchmark.
- Generated fast-path benchmarks where generators exist.
- Allocation measurements.

Competitor parity covered:

- Credible performance comparison methodology.

AstraFlow advantage beyond parity:

- Safety and diagnostics are not weakened to gain speed.
- Manual baseline exists in every benchmark group.

Acceptance gates:

- Benchmarks run locally and in CI on demand.
- Benchmark environment is published.
- Baseline and AstraFlow measurements are separated.
- No performance superiority claim is made without repeatable numbers.
- Regression tracking starts after stable baseline is established.

Test requirements:

- Benchmark project compiles.
- Smoke benchmark run succeeds.
- Allocation measurements are captured.

Documentation requirements:

- Benchmark methodology.
- Hardware/runtime environment template.
- Rules for interpreting results.

Migration examples required:

- None required, but benchmark samples should be understandable and reproducible.

Risk level:

- Medium.

What must NOT be included:

- "Faster than MediatR" claims.
- "Faster than AutoMapper" claims.
- Optimizations that remove diagnostics or weaken safety defaults.

### v1.10 CLI, Migration, Diagnostics Diffing, and Graph Output

Status: `Moved earlier` and `Planned`.

Goal:

Make AstraFlow inspectable, adoptable, and maintainable from the command line.

Why this version exists:

Diagnostics are already part of the product. The CLI turns diagnostics into a workflow for reviews, CI, migration, package checks, and scaffolding.

Packages affected:

- `AstraFlow.Cli`
- `AstraFlow.Diagnostics`
- `AstraFlow.Mapper`
- `AstraFlow.Mediator`
- `AstraFlow.Analyzers`
- `AstraFlow.Generators`

Features included:

- `astraflow inspect handlers`
- `astraflow inspect notifications`
- `astraflow inspect mappings`
- `astraflow inspect projections`
- `astraflow validate`
- `astraflow report`
- JSON, Markdown, and SARIF output.
- Diagnostics diff.
- Mermaid and DOT graph output.
- Migration scanner from MediatR-style usage.
- Migration scanner from AutoMapper-style usage.
- Scaffold request.
- Scaffold handler.
- Scaffold mapping.
- Scaffold projection.
- Scaffold test.
- Package reference checker.
- Package artifact checker.

Competitor parity covered:

- Migration support and inspection workflows that common runtime libraries do not consistently provide.

AstraFlow advantage beyond parity:

- Diagnostics diffing and graph output make behavior reviewable in CI.
- Migration scanners report suggestions and avoid unsafe automatic rewrites.

Acceptance gates:

- CLI commands work against clean sample consumers.
- Reports redact payloads and secrets by default.
- SARIF output validates.
- Diagnostics diff is deterministic.
- Graph output is stable enough for CI artifacts.
- Migration scanners produce suggestions without rewriting code by default.

Test requirements:

- CLI command tests.
- Report golden-output tests.
- SARIF validation tests.
- Graph output tests.
- Migration scanner fixture tests.

Documentation requirements:

- CLI reference.
- CI usage guide.
- Diagnostics diff guide.
- Migration scanner guide.
- Scaffold command guide.

Migration examples required:

- MediatR-style usage scan report.
- AutoMapper-style usage scan report.
- Manual before/after examples.

Risk level:

- Medium.

What must NOT be included:

- Silent mass rewrites.
- IDE extension work.
- Visual dashboard UI.
- Hosted service dependency.

### v1.11 Web and Validation Integrations

Status: `Moved later` from earlier parity path and `Planned`.

Goal:

Support common application integration without polluting core packages.

Why this version exists:

ASP.NET Core and validation integration are common adoption needs, but they should land after core mediator, mapping, projection, analyzer, and CLI parity work.

Packages affected:

- `AstraFlow.AspNetCore`
- `AstraFlow.FluentValidation`
- `AstraFlow.Testing`
- docs and samples

Features included:

- Minimal API helpers.
- Controller helpers.
- Endpoint filters.
- Problem-details mapping.
- Development-only diagnostics endpoint.
- Health-check summary.
- Validation pipeline behavior.
- Fail-fast validation.
- Aggregate validation errors.
- Localization hook.
- Validation diagnostics.
- Test helpers for validation behavior.

Competitor parity covered:

- Common web and validation setup around mediator flows.

AstraFlow advantage beyond parity:

- Framework-specific behavior stays out of core.
- Diagnostics endpoint is development-only by default.
- Payload logging remains off by default.

Acceptance gates:

- Core packages do not gain ASP.NET Core or FluentValidation dependencies.
- Sample API builds.
- Validation behavior tests pass.
- Diagnostics endpoint redacts by default and is development-only unless explicitly enabled.

Test requirements:

- Minimal API tests.
- Controller helper tests where practical.
- Validation behavior tests.
- Problem-details mapping tests.
- Health-check summary tests.

Documentation requirements:

- ASP.NET Core guide.
- FluentValidation integration guide.
- Diagnostics endpoint safety guide.
- Validation troubleshooting.

Migration examples required:

- Minimal API send example.
- Controller send example.
- Validation behavior example.

Risk level:

- Medium.

What must NOT be included:

- ASP.NET Core dependency in core packages.
- FluentValidation dependency in mediator core.
- Production diagnostics endpoint enabled by default.
- Payload logging by default.

### v1.12 Observability and Operational Hooks

Status: `Moved later` and `Planned`.

Goal:

Make production operation visible without leaking sensitive data.

Why this version exists:

Operational visibility matters, but it should use the stable mediator, mapper, projection, diagnostics, and integration surfaces from earlier releases.

Packages affected:

- `AstraFlow.OpenTelemetry` or core observability abstractions if dependency-free
- `AstraFlow.Diagnostics`
- `AstraFlow.AspNetCore`

Features included:

- `ActivitySource` tracing.
- OpenTelemetry support.
- Request dispatch spans.
- Notification fan-out spans.
- Mapping validation spans.
- Projection validation spans.
- Duration metrics.
- Failure metrics.
- Validation finding metrics.
- Redacted logging hooks.
- Telemetry disable switch.
- Sampling controls if needed.

Competitor parity covered:

- Production tracing and metrics around application flow.

AstraFlow advantage beyond parity:

- No request payload logging by default.
- No DTO payload logging by default.
- Redaction policy is shared with diagnostics and CLI.

Acceptance gates:

- Telemetry can be disabled.
- No payload values are emitted by default.
- Span names and metric names are documented.
- High-cardinality values are avoided.

Test requirements:

- ActivitySource tests.
- Metrics tests.
- Redaction tests.
- Telemetry disable-switch tests.

Documentation requirements:

- Observability guide.
- OpenTelemetry setup guide.
- Redaction and payload-safety guide.

Migration examples required:

- Add tracing to a sample API.
- Add validation finding metrics to a sample consumer.

Risk level:

- Medium.

What must NOT be included:

- Logging payloads by default.
- Storing secrets.
- Requiring OpenTelemetry in core packages unless design explicitly supports a dependency-free abstraction.

### v1.13 Compatibility, Migration, and Consumer Confidence

Status: `Planned`.

Goal:

Make adoption and upgrades credible before larger v2/v3 platform work.

Why this version exists:

After parity features land, consumer confidence becomes the blocker. API compatibility, upgrade tests, matrices, and samples need to be in place before bigger package expansion.

Packages affected:

- all packages
- CI
- samples
- docs

Features included:

- Public API diff in CI.
- Old-version upgrade smoke tests.
- Compatibility matrix.
- DI container compatibility tests where practical.
- Host compatibility samples.
- Console sample.
- Worker sample.
- ASP.NET Core sample.
- Class library sample.
- Test project sample.
- Shared contracts/client sample.
- Migration cookbook.
- Package deprecation guidance.
- Version support policy.
- Versioned docs strategy.

Competitor parity covered:

- Upgrade confidence and adoption documentation.

AstraFlow advantage beyond parity:

- Package confidence is treated as a product feature, not release housekeeping.

Acceptance gates:

- API diff runs in CI.
- Upgrade smoke tests restore old package versions, upgrade, build, and test.
- Compatibility matrix is current.
- Samples compile.
- Migration cookbook examples compile.

Test requirements:

- API compatibility test.
- Upgrade smoke tests.
- Sample build tests.
- Package install tests.

Documentation requirements:

- Compatibility matrix.
- Migration cookbook.
- Version support policy.
- Package deprecation process.
- Versioned docs strategy.

Migration examples required:

- Local project reference to package reference.
- Manual mediator usage to AstraFlow mediator.
- Established mediator-style usage to AstraFlow.
- Established mapper-style usage to AstraFlow.

Risk level:

- Medium.

What must NOT be included:

- Large new feature work.
- Platform dashboard work.
- Broad ecosystem package expansion.

### v2 Compile-Time Superiority and Security Governance

Status: `Planned`.

Goal:

Make AstraFlow stronger than runtime-only alternatives through compile-time safety and enforceable secure defaults.

Why this version exists:

The early analyzer/generator release should be expanded into a mature governance layer once parity features are stable.

Packages affected:

- `AstraFlow.Analyzers`
- `AstraFlow.Generators`
- `AstraFlow.Security` if a separate policy package is justified
- `AstraFlow.Diagnostics`
- `AstraFlow.Cli`
- `AstraFlow.Testing`

Features included:

- Full analyzer packages.
- Full generator packages.
- Secure DTO policy.
- Analyzer code fixes where safe.
- Deterministic generated code.
- Generator snapshot tests.
- AOT/trimming sample.
- Raw public ID enforcement.
- Sensitive-field enforcement.
- Secure analyzer suppression policy.
- Redaction policy shared by diagnostics, CLI, and observability.
- Threat model document.
- Secure defaults test suite.

Competitor parity covered:

- Compile-time validation and generated registration/mapping support.

AstraFlow advantage beyond parity:

- Security-sensitive DTO and mapping policies are enforceable.

Acceptance gates:

- Analyzer rule catalog is complete.
- Generator outputs are deterministic.
- Secure DTO policy has tests.
- Redaction policy is shared across diagnostics, CLI, and observability.
- Threat model is published.

Test requirements:

- Analyzer tests.
- Code fix tests where implemented.
- Generator snapshot tests.
- Secure policy tests.
- Redaction tests.
- AOT/trimming sample tests.

Documentation requirements:

- Security model.
- Analyzer rule catalog.
- Generator guide.
- Secure DTO policy guide.
- Suppression policy.

Migration examples required:

- Enabling secure DTO policy.
- Fixing raw public ID findings.
- Moving to generated registration.

Risk level:

- High.

What must NOT be included:

- Runtime license-key checks.
- Owning application encryption algorithms.
- Unsafe code fixes.
- Marketing claims without evidence.

### v2.1 Performance Optimization and Generated Fast Paths

Status: `Planned`.

Goal:

Improve performance only after measurement.

Why this version exists:

`v1.9` provides evidence. `v2.1` acts on it without weakening diagnostics or safety.

Packages affected:

- `AstraFlow.Generators`
- runtime packages
- benchmark project

Features included:

- Optimization based on `v1.9` benchmarks.
- Generated mapping fast paths.
- Generated collection fast paths.
- Generated registration paths.
- Allocation reductions.
- CI performance regression checks.

Competitor parity covered:

- Performance-sensitive mediator and mapping scenarios.

AstraFlow advantage beyond parity:

- Performance claims must be evidence-backed and reproducible.

Acceptance gates:

- Benchmarks show before/after numbers.
- Manual baselines remain.
- CI regression checks exist for stable benchmark groups.
- Diagnostics and safety defaults remain intact.

Test requirements:

- Benchmark regression smoke tests.
- Generated fast-path correctness tests.
- Allocation checks where stable.

Documentation requirements:

- Benchmark results.
- Optimization notes.
- Limitations and environment details.

Migration examples required:

- Enabling generated fast paths where optional.

Risk level:

- Medium.

What must NOT be included:

- Speed claims without repeatable numbers.
- Optimizations that reduce correctness checks by default.

### v2.2 Enterprise Supply Chain

Status: `Planned`.

Goal:

Make AstraFlow credible for enterprise package review.

Why this version exists:

Enterprise adoption requires more than features. Reviewers need signing, provenance, SBOMs, dependency review, and documented security handling.

Packages affected:

- all packages
- CI/release workflows
- docs

Features included:

- Package signing.
- SourceLink verification.
- Deterministic builds.
- SBOM generation.
- Dependency review workflow.
- Release provenance.
- Signed git tags.
- Security advisory workflow.
- Changelog automation.
- Branch protection guidance.

Competitor parity covered:

- Enterprise supply-chain expectations.

AstraFlow advantage beyond parity:

- Release governance is documented and testable.

Acceptance gates:

- Release artifacts have provenance where practical.
- SBOM is generated.
- SourceLink verifies.
- Dependency review runs.
- Security advisory path is documented.

Test requirements:

- Package verification tests.
- SourceLink verification.
- SBOM generation check.

Documentation requirements:

- Enterprise release guide.
- Security advisory guide.
- Branch protection guide.
- Changelog automation guide.

Migration examples required:

- None.

Risk level:

- Medium.

What must NOT be included:

- Workflow changes that block local development.
- Secret values in docs or logs.

### v2.3 Public API Governance

Status: `Planned`.

Goal:

Protect consumers from accidental breaking changes.

Why this version exists:

The package surface grows after parity. Public API governance must become enforceable before the ecosystem expands further.

Packages affected:

- all packages
- CI
- docs

Features included:

- Public API baselines.
- API diff enforcement.
- SemVer classification guidance.
- Obsolete API policy.
- Compatibility test suite.
- Release branch strategy.
- Support window policy.
- API review rules.

Competitor parity covered:

- Stable public API management.

AstraFlow advantage beyond parity:

- API governance is explicit, documented, and enforced in CI.

Acceptance gates:

- CI fails on unreviewed public API changes.
- Obsolete APIs include replacement guidance.
- Changelog classifies breaking, added, changed, fixed, deprecated, removed, and security items.

Test requirements:

- API baseline tests.
- Compatibility tests.

Documentation requirements:

- API review rules.
- SemVer classification guide.
- Obsolete API policy.
- Release branch strategy.

Migration examples required:

- Obsolete API replacement example when applicable.

Risk level:

- Medium.

What must NOT be included:

- Breaking changes without major version and migration guide.

### v3 Ecosystem Packages

Status: `Moved later` and `Planned`.

Goal:

Provide optional ecosystem packages without bloating core.

Why this version exists:

Caching, authorization, idempotency, resilience, background jobs, domain events, and webhooks are useful, but they should not delay practical MediatR and AutoMapper parity.

Packages affected:

- `AstraFlow.EntityFrameworkCore`
- `AstraFlow.OpenTelemetry`
- `AstraFlow.Caching`
- `AstraFlow.Authorization`
- `AstraFlow.Idempotency`
- `AstraFlow.Resilience`
- `AstraFlow.BackgroundJobs`
- `AstraFlow.DomainEvents`
- `AstraFlow.Webhooks`

Features included:

- Transaction behavior.
- Outbox/inbox candidates.
- Cache behavior.
- Authorization behavior.
- Idempotency behavior.
- Resilience behavior.
- Background job dispatch.
- Domain event bridge.
- Webhook helpers.

Competitor parity covered:

- Common application-flow ecosystem concerns.

AstraFlow advantage beyond parity:

- Optional packages keep core small and dependency-clean.

Acceptance gates:

- No ecosystem package dependency leaks into core.
- Each package has focused tests, docs, and samples.
- Persistence-backed features use pluggable abstractions.
- No payload storage by default for idempotency or jobs.

Test requirements:

- Package-specific behavior tests.
- Integration smoke tests.
- Sample builds.

Documentation requirements:

- Package selection guide updates.
- Integration package guides.
- Security notes for each package.

Migration examples required:

- Add optional behavior package to a sample consumer.

Risk level:

- Medium to high per package.

What must NOT be included:

- Framework-specific behavior in core.
- Scheduler lock-in.
- Persistence lock-in.
- Payload storage by default.

### v4 Platform-Level Tooling

Status: `Moved later` and `Planned`.

Goal:

Turn AstraFlow into a full application-flow platform after the core is already competitive.

Why this version exists:

Visual tooling is valuable only after the CLI, diagnostics metadata, analyzers, generators, mappings, projections, and compatibility foundations are stable.

Packages/tools affected:

- `AstraFlow.Cli`
- IDE extension candidate
- diagnostics viewer candidate
- docs website
- dashboards

Features included:

- Visual request graph.
- Visual notification graph.
- Visual pipeline graph.
- Visual mapping graph.
- Visual projection graph.
- Diagnostics diff viewer.
- Modular architecture scanner.
- Package migration assistant.
- Analyzer suppression manager.
- Secure DTO policy editor.
- Benchmark dashboard.
- Compatibility dashboard.
- Release dashboard.
- IDE extension candidate.
- Interactive diagnostics explorer.
- Documentation website.
- Recipe gallery.
- Enterprise templates.

Competitor parity covered:

- Platform-level inspection and governance tooling beyond common runtime libraries.

AstraFlow advantage beyond parity:

- Flow, mapping, projection, and diagnostic changes become reviewable by teams that cannot read every source file manually.

Acceptance gates:

- Tooling consumes stable CLI/diagnostics/analyzer/generator metadata.
- No dashboard becomes required for package use.
- Docs website is versioned.
- Visual outputs redact by default.

Test requirements:

- Metadata compatibility tests.
- Snapshot tests for graph outputs.
- UI tests where a UI exists.

Documentation requirements:

- Tooling guides.
- Versioned docs.
- Recipe gallery.

Migration examples required:

- Package migration assistant examples.

Risk level:

- High.

What must NOT be included:

- Platform tooling before parity.
- Hosted dependency required for local package use.
- Private-product assumptions.

## Gap Analysis

### What AstraFlow Already Has

Status: `Done`.

- Request/response dispatch.
- Commands and queries through request contracts.
- Void requests.
- Typed request handlers.
- Sender, publisher, and mediator abstractions.
- Contracts-only package.
- Object-based dispatch with ambiguous contract detection.
- Cancellation token support for request flows.
- Missing and duplicate handler errors.
- Assembly scanning.
- Explicit registration and fluent registration builder.
- Pipeline behaviors, stream pipeline behaviors, processors, exception handlers, and exception actions.
- Sequential, parallel, and bounded-parallel notification publishing.
- Explicit mapping rules.
- Declared mapping pairs.
- Mapping startup validation.
- Collection mapping.
- Null source behavior.
- Explicit projections and named projections.
- Projection registry and validation.
- EF Core relational projection validation.
- Diagnostics reports with JSON and Markdown.
- Testing package with fake sender, fake publisher, fake mediator, harnesses, and assertions.
- Package install verification.
- Multi-target core package assets.

### What Is Missing For MediatR Parity

Status: `Planned` or `Patch`.

- Richer diagnostics for processor/order/exception behavior.
- Stream cancellation and disposal hardening.
- Public stream handler test harness if not already covered by existing harnesses.
- Notification handler diagnostics expansion.
- Compile-time analyzers for missing, duplicate, ambiguous, stream, behavior-order, and lifetime risks.
- Generated registration for handlers, notifications, streams, processors, and exception-flow components.
- AOT/trimming-friendly registration.
- Migration guide and scanner from MediatR-style usage.

### What Is Missing For AutoMapper Parity

Status: `Moved earlier`.

- Opt-in convention mapping.
- Profiles/catalogs.
- Member configuration.
- Include/ignore rules.
- Required destination member rules.
- Unmapped source/destination diagnostics.
- Nullable/numeric/enum diagnostics.
- Constructor/record binding.
- Immutable destination support.
- Null substitution.
- Value converters/resolvers/transformers.
- Conditional mapping.
- Existing destination mapping.
- Flattening, unflattening, and explicit reverse mapping.
- Inheritance/polymorphic mapping if stable.
- Mapping plan export and diffing.
- Mapping analyzers and generated mapping plans.

### What Was Planned But Too Late

Status: `Moved earlier`.

- AutoMapper core parity.
- Convention mapping.
- Profiles/catalogs.
- Member configuration.
- Ignore/include rules.
- Unmapped member diagnostics.
- Nullable/numeric/enum diagnostics.
- Constructor/record binding.
- Null substitution.
- Value converters.
- Existing destination mapping.
- Flattening.
- Reverse mapping.
- Unflattening.
- Value resolvers.
- Projection parameters.
- EF provider matrix.
- Analyzer essentials.
- Generator essentials.
- Mapping plan export.
- Diagnostics diffing.
- Migration scanner.
- Benchmarks.

### What Should Move Later

Status: `Moved later`.

- Visual dashboard UI.
- IDE extension.
- Interactive diagnostics explorer.
- Workflow orchestration.
- Saga/process manager helpers.
- Broad ecosystem packages.
- Background jobs.
- Webhooks.
- Caching.
- Authorization.
- Idempotency.
- Resilience.
- Package health dashboard.
- Compatibility dashboard.
- Release dashboard.
- Documentation website.
- Enterprise templates.

### What Should Remain Candidate Or Research

Status: `Candidate` or `Research`.

- Notification ordering metadata.
- Handler priority ordering.
- Request envelopes and context accessor.
- Dynamic/dictionary mapping.
- DataReader mapping.
- JSON mapping helpers.
- Expression simplification helpers.
- Async projection helpers.
- Diagnostics baseline approval workflow.
- Module ownership metadata.
- Module boundary report.
- Analyzer suppression manager.
- Secure DTO policy editor.
- Saga/process manager helpers.
- Workflow orchestration package.
- Request batching.
- Request deduplication.

### What Should Remain Rejected

Status: `Rejected`.

- Runtime license-key checks.
- Payload logging by default.
- Convention mapping enabled by default.
- Hidden deep graph magic by default.
- Framework-specific behavior in core packages.
- Owning application encryption algorithms.
- Claiming benchmark leadership without repeatable data.
- Copying competitor code, private implementation details, documentation text, branding, trademarks, or exact API shapes.

## MediatR Parity Checklist

| Required feature | Current status | Target version | Package | Priority | Diagnostics requirement | Test requirement |
| --- | --- | --- | --- | --- | --- | --- |
| Request/response dispatch | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Missing/duplicate/ambiguous errors | Dispatch tests |
| Commands and queries | Done | v1.0.0 | `AstraFlow.Contracts` | P0 | Contract report | Request tests |
| Void requests | Done | v1.4.0 | `AstraFlow.Contracts` | P0 | Missing/duplicate void handler errors | Void dispatch tests |
| Typed request handlers | Done | v1.0.0 | `AstraFlow.Contracts` | P0 | Handler registration report | Handler tests |
| Sender abstraction | Done | v1.0.0 | `AstraFlow.Contracts` | P0 | Registration report | Fake sender tests |
| Publisher abstraction | Done | v1.0.0 | `AstraFlow.Contracts` | P0 | Registration report | Fake publisher tests |
| Mediator abstraction | Done | v1.0.0 | `AstraFlow.Contracts` | P0 | Registration report | Fake mediator tests |
| Contracts-only package | Done | v1.4.0 | `AstraFlow.Contracts` | P0 | Package metadata report | Package install tests |
| Object-based dispatch | Done | v1.0.1/v1.4.0 | `AstraFlow.Mediator` | P0 | Ambiguous contract detection | Runtime dispatch tests |
| Cancellation token support | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Cancellation guidance | Cancellation tests |
| Missing handler errors | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Clear diagnostic code/message | Missing handler tests |
| Duplicate handler errors | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Clear diagnostic code/message | Duplicate handler tests |
| Ambiguous request contract detection | Done | v1.0.1 | `AstraFlow.Mediator` | P0 | Clear diagnostic code/message | Ambiguity tests |
| Assembly scanning | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Registration report | Scanning tests |
| Explicit registration | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Registration report | DI tests |
| Fluent registration builder | Done | v1.4.0 | `AstraFlow.Mediator` | P0 | Builder order report | Builder tests |
| Open generic behavior registration | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Behavior report | Behavior registration tests |
| Closed behavior registration | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Behavior report | Behavior registration tests |
| Deterministic registration order | Done | v1.4.0 | `AstraFlow.Mediator` | P0 | Order report | Order tests |
| Handler coverage validation | Done | v1.0.0 | `AstraFlow.Mediator` | P1 | Missing handler report | Coverage tests |
| Registration diagnostics | Done, expand | v1.4.x | `AstraFlow.Diagnostics` | P1 | JSON/Markdown findings | Diagnostics tests |
| Notifications/events | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Notification report | Publish tests |
| Multiple notification handlers | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Handler list report | Fan-out tests |
| Zero-handler publish | Done | v1.0.0 | `AstraFlow.Mediator` | P1 | Info-level report | Zero-handler tests |
| Sequential publishing | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Strategy report | Sequential tests |
| Failure policies | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Failure policy report | Fail-fast/continue/aggregate tests |
| Parallel publishing | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Unsafe ordering warning docs | Parallel tests |
| Bounded parallel publishing | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Degree report | Bounded tests |
| Aggregate exception behavior | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Deterministic failure report | Aggregate tests |
| Pipeline behaviors | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Behavior report | Pipeline tests |
| Behavior ordering | Done, expand | v1.4.x/v1.8 | `AstraFlow.Mediator` | P1 | Runtime report plus analyzer | Order tests |
| Short-circuiting | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Behavior report | Short-circuit tests |
| Stream requests | Done | v1.4.0 | `AstraFlow.Contracts` | P0 | Stream handler report | Stream tests |
| Stream pipeline behaviors | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Stream behavior report | Stream behavior tests |
| Pre-processors | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Processor report | Processor tests |
| Post-processors | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Processor report | Processor tests |
| Exception handlers | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Explicit handled-state report | Exception tests |
| Exception actions | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Always-rethrow docs | Rethrow tests |
| Stream cancellation/disposal hardening | Patch | v1.4.x | `AstraFlow.Mediator` | P0 | Cancellation findings | Stream cancellation tests |
| Fake sender/publisher/mediator | Done | v1.3.0 | `AstraFlow.Testing` | P1 | No payload logs | Fake tests |
| Harnesses and assertions | Done, expand | v1.3.0/v1.8 | `AstraFlow.Testing` | P1 | Deterministic messages | Harness tests |
| Essential analyzers | Planned | v1.8 | `AstraFlow.Analyzers` | P0 | Stable rule IDs | Analyzer tests |
| Generated registrations | Planned | v1.8 | `AstraFlow.Generators` | P0 | Generated metadata report | Generator tests |
| Migration guide/scanner | Planned | v1.10 | `AstraFlow.Cli` | P1 | Suggestion report | Fixture tests |

## AutoMapper Parity Checklist

| Required feature | Current status | Target version | Package | Priority | Diagnostics requirement | Test requirement |
| --- | --- | --- | --- | --- | --- | --- |
| Explicit object mapping | Done | v1.0.0 | `AstraFlow.Mapper` | P0 | Missing/duplicate mapping errors | Mapping tests |
| Declared mapping pairs | Done | v1.0.0 | `AstraFlow.Mapper` | P0 | Ownership report | Validation tests |
| Mapping startup validation | Done | v1.0.0 | `AstraFlow.Mapper` | P0 | Startup findings | Startup tests |
| Duplicate mapping detection | Done | v1.0.0 | `AstraFlow.Mapper` | P0 | Duplicate report | Duplicate tests |
| Missing mapping detection | Done | v1.0.0 | `AstraFlow.Mapper` | P0 | Missing report | Missing tests |
| Strict mode | Done for explicit mappings, expand | v1.5 | `AstraFlow.Mapper` | P0 | Strict convention findings | Strict tests |
| Null source behavior | Done | v1.0.0 | `AstraFlow.Mapper` | P1 | Documented behavior | Null tests |
| Nested explicit mapping | Done | v1.0.0 | `AstraFlow.Mapper` | P1 | Rule path report | Nested tests |
| Collection mapping | Done | v1.0.0 | `AstraFlow.Mapper` | P1 | Collection diagnostics | Collection tests |
| Mapping diagnostics | Done, expand | v1.5 | `AstraFlow.Diagnostics` | P0 | Mapping plan export | Diagnostics tests |
| Convention mapping opt-in | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Every member reported | Convention tests |
| Exact pair registration | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Pair report | Pair tests |
| Exact property-name matching | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Member report | Match tests |
| Case-insensitive option | Planned | v1.5 | `AstraFlow.Mapper` | P1 | Option report | Option tests |
| Profiles/catalogs | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Profile report | Profile tests |
| Fluent member config | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Member rule report | Config tests |
| Include/ignore rules | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Include/ignore report | Rule tests |
| Required destination rules | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Required member findings | Required tests |
| Unmapped destination diagnostics | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Error/warning modes | Validation tests |
| Unmapped source diagnostics | Planned | v1.5 | `AstraFlow.Mapper` | P1 | Strict mode findings | Validation tests |
| Ambiguity detection | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Ambiguity report | Ambiguity tests |
| Sensitive-field deny list | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Security finding | Sensitive tests |
| Secure DTO policy | Planned | v2 | `AstraFlow.Analyzers` | P0 | Policy findings | Policy tests |
| Custom source expressions | Planned | v1.6 | `AstraFlow.Mapper` | P1 | Expression report | Expression tests |
| Custom destination paths | Planned | v1.6 | `AstraFlow.Mapper` | P1 | Path report | Path tests |
| Null substitution | Planned | v1.5 | `AstraFlow.Mapper` | P1 | Member rule report | Null substitution tests |
| Value converters | Planned | v1.5 | `AstraFlow.Mapper` | P1 | Converter report | Converter tests |
| Value resolvers | Planned | v1.6 | `AstraFlow.Mapper` | P1 | Resolver lifetime report | Resolver tests |
| Value transformers | Candidate | v1.6 if safe | `AstraFlow.Mapper` | P2 | Transformer report | Transformer tests |
| Conditional mapping | Planned | v1.5 | `AstraFlow.Mapper` | P1 | Condition report | Condition tests |
| Before/after hooks | Candidate | v1.6 if visible | `AstraFlow.Mapper` | P2 | Hook report | Hook tests |
| Enum mapping helpers | Planned | v1.5 | `AstraFlow.Mapper` | P1 | Enum findings | Enum tests |
| Nullable diagnostics | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Nullable findings | Nullable tests |
| Numeric diagnostics | Planned | v1.5 | `AstraFlow.Mapper` | P0 | Numeric findings | Numeric tests |
| Constructor/record binding | Planned | v1.5 | `AstraFlow.Mapper` | P1 | Binding report | Binding tests |
| Existing destination mapping | Planned | v1.5 | `AstraFlow.Mapper` | P1 | Update report | Update tests |
| Collection update strategies | Candidate | v1.6 if needed | `AstraFlow.Mapper` | P2 | Strategy report | Strategy tests |
| Flattening | Planned | v1.6 | `AstraFlow.Mapper` | P0 | Flattening report | Flattening tests |
| Unflattening | Planned | v1.6 | `AstraFlow.Mapper` | P0 | Domain-write findings | Unflattening tests |
| Reverse mapping | Planned | v1.6 | `AstraFlow.Mapper` | P0 | Explicit reverse report | Reverse tests |
| Include members | Planned | v1.6 | `AstraFlow.Mapper` | P1 | Include member report | Include tests |
| Inheritance/polymorphism | Candidate | v1.6 if stable | `AstraFlow.Mapper` | P2 | Type decision report | Polymorphism tests |
| Explicit projections | Done | v1.2.0 | `AstraFlow.Mapper` | P0 | Projection report | Projection tests |
| Projection parameters | Planned | v1.7 | `AstraFlow.Mapper` | P0 | Parameter report | Parameter tests |
| EF provider matrix | Planned | v1.7 | `AstraFlow.Mapper.EntityFrameworkCore` | P0 | Provider findings | Provider tests |
| Projection plan export | Planned | v1.7 | `AstraFlow.Mapper` | P1 | Plan export | Export tests |
| SQL snapshot helper | Candidate | v1.7 if safe | `AstraFlow.Mapper.EntityFrameworkCore` | P2 | Snapshot metadata | Snapshot tests |
| Mapping analyzers/generators | Planned | v1.8/v2 | `AstraFlow.Analyzers`/`AstraFlow.Generators` | P0 | Rule IDs and metadata | Analyzer/generator tests |
| Migration guide/scanner | Planned | v1.10 | `AstraFlow.Cli` | P1 | Suggestion report | Fixture tests |

## AstraFlow Differentiator Matrix

| Differentiator | Why it matters | Target version | Package/tooling | Evidence required before marketing claim |
| --- | --- | --- | --- | --- |
| Convention mapping disabled by default | Prevents hidden DTO leaks and silent member drift | v1.5 | `AstraFlow.Mapper` | Tests proving convention mapping is opt-in |
| Sensitive-field deny list | Reduces accidental password/token/secret mapping | v1.5 | `AstraFlow.Mapper` | Security tests and diagnostics examples |
| Mapping plan export | Makes automatic mapping inspectable | v1.5 | `AstraFlow.Mapper`/CLI | Deterministic export tests |
| Projection provider validation | Catches provider translation risks before production | v1.7 | EF Core package | Provider matrix results |
| Analyzer-backed correctness | Moves missing handlers and unsafe mappings to build time | v1.8/v2 | Analyzers | Analyzer test suite and rule catalog |
| Generated registration | Improves AOT/trimming posture | v1.8/v2 | Generators | AOT/trimming sample builds |
| Diagnostics diffing | Lets teams review behavior changes in CI | v1.10 | CLI/Diagnostics | Stable diff tests |
| SARIF output | Integrates with enterprise code scanning | v1.10 | CLI | SARIF validation |
| Redaction policy | Prevents secrets and payloads in reports/logs | v1.12/v2 | Diagnostics/CLI/Observability | Redaction tests |
| Secure DTO policy | Enforces raw ID and sensitive DTO rules | v2 | Analyzers/Security | Policy tests and threat model |
| Enterprise supply chain | Supports package review and governance | v2.2 | CI/release | SBOM, signing, provenance checks |
| Public API governance | Prevents accidental breaking changes | v2.3 | CI | API diff enforcement |

## Feature Matrix

| Capability | Current status | Target version | Priority | Required package | Parity target | Safety/diagnostics requirement | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mediator dispatch | Done | v1.0.0 | P0 | `AstraFlow.Mediator` | MediatR-style | Missing/duplicate diagnostics | Preserve |
| Void requests | Done | v1.4.0 | P0 | `AstraFlow.Contracts` | MediatR-style | Void handler diagnostics | Preserve |
| Stream requests | Done | v1.4.0 | P0 | `AstraFlow.Contracts` | MediatR-style | Stream handler diagnostics | Patch harden |
| Notification fan-out | Done | v1.4.0 | P0 | `AstraFlow.Mediator` | MediatR-style | Failure policy report | Preserve |
| Pipeline behaviors | Done | v1.4.0 | P0 | `AstraFlow.Mediator` | MediatR-style | Order report | Patch expand |
| Explicit mapping | Done | v1.0.0 | P0 | `AstraFlow.Mapper` | AutoMapper problem domain | Missing/duplicate mapping diagnostics | Preserve |
| Convention mapping | Planned | v1.5 | P0 | `AstraFlow.Mapper` | AutoMapper-style | Opt-in and inspectable | Moved earlier |
| Member config | Planned | v1.5 | P0 | `AstraFlow.Mapper` | AutoMapper-style | Per-member diagnostics | Moved earlier |
| Flattening/reverse/unflattening | Planned | v1.6 | P0 | `AstraFlow.Mapper` | AutoMapper-style | Explicit and security-gated | Moved earlier |
| Projections | Done, expand | v1.7 | P0 | `AstraFlow.Mapper` | AutoMapper-style query projection | Provider warnings | Moved earlier |
| Analyzers | Planned | v1.8/v2 | P0 | `AstraFlow.Analyzers` | Compile-time parity | Stable rule IDs | Moved earlier |
| Generators | Planned | v1.8/v2 | P0 | `AstraFlow.Generators` | AOT/trimming parity | Deterministic output | Moved earlier |
| Benchmarks | Planned | v1.9 | P1 | `AstraFlow.Benchmarks` | Credible comparisons | Repeatable evidence | Moved earlier |
| CLI inspection | Planned | v1.10 | P1 | `AstraFlow.Cli` | Adoption tooling | Redacted reports | Moved earlier |
| ASP.NET Core integration | Planned | v1.11 | P1 | `AstraFlow.AspNetCore` | Common app integration | Dev-only diagnostics endpoint | Moved later behind parity |
| FluentValidation integration | Planned | v1.11 | P1 | `AstraFlow.FluentValidation` | Common validation flow | Validation diagnostics | Moved later behind parity |
| Observability | Planned | v1.12 | P1 | `AstraFlow.OpenTelemetry` | Operational parity | No payload logging | Moved later |
| Compatibility confidence | Planned | v1.13 | P1 | all | Adoption confidence | API diff and matrix | Required before v2 expansion |
| Enterprise supply chain | Planned | v2.2 | P1 | CI/release | Enterprise review | SBOM/provenance/signing | Later |
| Ecosystem packages | Planned | v3 | P2 | optional packages | Broader app flow | No core dependency leaks | Later |
| Platform tooling | Planned | v4 | P2 | CLI/UI/docs | Differentiation | Redacted visual output | Later |

## Promote From Future Ideas Bank

Status: `Moved earlier`.

Promote these into the main roadmap:

- Safe convention mapping.
- Mapping profiles/catalogs.
- Fluent member configuration.
- Exact name matching.
- Case-insensitive option.
- Sensitive-field deny list.
- Unmapped source/destination validation.
- Nullable compatibility diagnostics.
- Numeric conversion diagnostics.
- Enum mapping helpers.
- Constructor/record binding.
- Existing destination mapping.
- Null substitution.
- Value converters.
- Conditional mapping.
- Flattening.
- Reverse mapping.
- Unflattening.
- Include members.
- Mapping plan export.
- Projection parameters.
- Provider matrix.
- Provider-specific warning codes.
- Projection plan export.
- Projection raw-ID policy checks.
- Missing/duplicate/ambiguous handler analyzers.
- Mapping drift analyzer.
- Sensitive field mapping analyzer.
- Raw public ID analyzer.
- Mapper call inside query analyzer.
- Non-translatable projection analyzer.
- Handler, notification, stream, mapping, and projection generators.
- Diagnostics diffing.
- SARIF output.
- Mermaid/DOT graph output.
- CLI inspect/validate/report/scaffold commands.
- Migration scanner reports.
- Benchmark project.

## Keep Candidate / Research

Status: `Candidate` or `Research`.

Keep these outside the committed parity path until they pass design review:

- Notification ordering metadata.
- Handler priority ordering.
- Request envelopes.
- Correlation context abstraction.
- Request context accessor.
- Handler timeout behavior.
- Retry and circuit-breaker behavior.
- Transaction/outbox/inbox bridge.
- Domain event to notification bridge.
- Open generic notification handler support.
- Saga/process manager helpers.
- Workflow orchestration package.
- Request batching.
- Request deduplication.
- Naming convention profiles beyond exact/case-insensitive matching.
- Value transformers if global behavior cannot be made diagnosable.
- Before/after map hooks if they obscure mapping behavior.
- Polymorphic and inheritance mapping until profile/catalog model is stable.
- Circular-reference and max-depth controls unless deep graph mapping becomes explicit scope.
- Dynamic/dictionary mapping.
- DataReader mapping.
- JSON mapping helpers.
- Projection SQL snapshot helper.
- Query tagging helpers.
- Expression simplification helpers.
- Async projection helpers.
- HTML diagnostics report.
- Diagnostics baseline approval.
- Module ownership metadata.
- Module boundary report.
- Analyzer code fixes beyond safe obvious fixes.
- Diagnostics metadata generator.
- Large templates and reference architectures.
- Dashboards and IDE extension.

## Keep Rejected

Status: `Rejected`.

| Rejected idea | Why |
| --- | --- |
| Runtime license-key checks | Conflicts with MIT/no-runtime-license positioning. |
| Payload logging by default | Security and privacy risk. |
| DTO payload logging by default | Security and privacy risk. |
| Convention mapping enabled by default | Conflicts with explicit secure core. |
| Hidden deep graph magic by default | Hard to audit and debug. |
| Implicit reverse mapping | Unsafe for public DTO to domain writes. |
| Framework-specific behavior in core packages | Belongs in integration packages. |
| Owning application encryption algorithms | Applications must own keys, algorithms, rotation, and policy. |
| Claiming benchmark leadership without repeatable data | Misleading and not credible. |
| Copying competitor code or documentation | Legal, ethical, and product-design risk. |
| Exact competitor API clone | Creates unnecessary legal and design risk. |

## Do Not Claim Yet

Status: `Rejected until proven`.

Do not claim:

- faster than MediatR,
- faster than AutoMapper,
- complete replacement,
- production-proven,
- enterprise-ready,
- best-in-class,
- benchmark leader,
- fully AOT-ready,
- fully secure by default,
- drop-in replacement,
- exact AutoMapper clone,
- exact MediatR clone.

These claims require evidence. Until that evidence exists, use precise wording such as "planned", "supports common scenarios after version X", "validated by package tests", or "designed for".

## Must-Have Before Public Promotion

Before claiming common MediatR replacement:

- `v1.4.x` stabilization completed.
- Stream cancellation and exception-flow hardening completed.
- Migration guide and before/after examples completed.
- Handler/notification/stream diagnostics completed.
- Clean sample consumer passes.

Before claiming common AutoMapper replacement:

- `v1.5` and `v1.6` completed.
- Convention mapping opt-in and tested.
- Mapping profiles/catalogs completed.
- Member config, include/ignore, null substitution, value converters, conditionals, constructor/record binding completed.
- Flattening, unflattening, and explicit reverse mapping completed.
- Sensitive-field deny list and mapping plan export completed.
- Migration examples compile.

Before claiming safer than both:

- Sensitive-field deny list completed.
- Secure DTO policy completed.
- Redaction policy completed.
- Analyzer coverage for raw public IDs and sensitive mapping completed.
- Threat model and secure defaults test suite completed.

Before claiming faster than both:

- `v1.9` benchmark project completed.
- Benchmark environment published.
- Manual baselines included.
- Repeatable numbers available.
- Results reproduced across more than one run.

Before claiming enterprise-ready:

- Package signing or documented equivalent completed.
- SBOM generation completed.
- SourceLink verification completed.
- Dependency review completed.
- Security advisory workflow completed.
- Public API compatibility checks completed.
- Version support policy completed.
- Release provenance completed.

## 30-60 Day Execution Plan

Status: `Planned`.

1. Cleanup first.
   - Run repository scans for private-product references.
   - Rewrite public docs to standalone package language.
   - Verify `rg -n -i "nexora" .` returns no operational references outside cleanup report, policy language, and scan-command examples.

2. Baseline verification first.
   - Restore, build, test, pack, and run package install verification.
   - Confirm `v1.0.0` through `v1.4.0` docs remain preserved as fixed history.

3. Patch hardening first.
   - Implement `v1.4.x` stream cancellation/disposal tests.
   - Expand diagnostics for processor and exception-flow order.
   - Polish registration builder docs and troubleshooting.

4. Packages first for mapping parity.
   - Decide whether safe convention mapping stays in `AstraFlow.Mapper` or an optional `AstraFlow.Mapper.Conventions` package.
   - Keep explicit mapping unchanged.

5. APIs first for `v1.5`.
   - Design profile/catalog model.
   - Design fluent member configuration.
   - Design strict mode and mapping plan export shape.

6. Tests first for `v1.5`.
   - Write failing tests for exact matching, ignore/include, unmapped members, sensitive fields, nullable/numeric diagnostics, constructor binding, value converters, and existing destination mapping.

7. Docs first alongside APIs.
   - Add convention mapping guide.
   - Add sensitive-field policy guide.
   - Add migration examples from common mapper usage.

8. Projections next.
   - Design projection parameter model.
   - Add provider matrix tests.
   - Add projection plan export.

9. Compile-time checks next.
   - Implement high-value analyzers before broad code fixes.
   - Implement generated registration before generated mapping optimization.

10. Benchmarks before claims.
    - Add benchmark project after parity surfaces exist.
    - Publish methodology before publishing claims.

11. Migration examples before promotion.
    - Build sample before/after mediator and mapper migrations.
    - Keep scanners suggestion-only.

## Repository Cleanup Checklist

Run these scans before every public release:

```powershell
rg -n "NEXORA|Nexora|nexora|NEXORA-Backend|NEXORA-Frontend|nexora-cli|tools/nexora-cli"
rg -n -i "nexora" .
rg -n "private product|internal application|host system|project-specific" README.md docs src tests samples scripts .github
rg -n "packages/AstraFlow|E:\\Projects|local project references" README.md docs scripts .github CONTRIBUTING.md
```

Inspect:

- `README.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `docs/`
- `scripts/`
- `tests/`
- `.github/workflows/`
- `src/**/*.csproj`
- `samples/`
- templates when they exist
- package metadata in `Directory.Build.props`

Acceptance:

- No operational NEXORA references outside cleanup report, policy language, and scan-command examples.
- No private product references.
- No public docs require a private app.
- Package metadata says AstraFlow is standalone.
- Samples are generic.
- Scripts validate generic packages and sample consumers.
- Workflows do not invoke private paths.

## Acceptance Gates For The Whole Revised Roadmap

Status: `Planned`.

- Package builds pass.
- Tests pass.
- Clean install verification passes.
- No operational NEXORA references outside cleanup report, policy language, and scan-command examples.
- No private product references.
- Docs updated.
- Package metadata updated.
- Migration examples compile.
- Diagnostics redact by default.
- No payload logging by default.
- No DTO payload logging by default.
- Public API review completed.
- Compatibility matrix updated.
- Changelog updated.
- Release checklist updated.
- Package artifact checks pass.
- SourceLink and symbols verified where applicable.
- Analyzer rule catalog updated when analyzers exist.
- Generator snapshots updated when generators exist.
- Benchmark methodology published before performance claims.
