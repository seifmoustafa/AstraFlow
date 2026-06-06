# AstraFlow Product Roadmap

## Executive Summary

AstraFlow is a MIT-licensed standalone .NET package family for explicit, inspectable, secure, diagnosable, and enterprise-ready application flow.

Current implementation truth: AstraFlow is complete through `v1.11.0` in this repository. The next planned roadmap item is `v1.12.0` observability and operational hooks.

The `v1.0.0` through `v1.4.0` releases are the fixed baseline. They are completed historical/current scope and must not be removed, downgraded, reordered, or moved into later versions. Follow-up work against that baseline belongs in patch-safe `v1.4.x` stabilization releases only.

The post-`v1.4.0` roadmap prioritizes practical MediatR-style and AutoMapper-style capability parity first, then differentiators:

- `v1.4.x`: patch-only stabilization.
- `v1.5.x`: AutoMapper-style core mapping parity in small phases.
- `v1.6.x`: advanced mapping parity with risky behavior kept candidate until stable.
- `v1.7.x`: projection and EF provider parity.
- `v1.8.x`: analyzers first, then source generators.
- `v1.9.x`: benchmarks and performance measurement.
- `v1.10.x`: CLI, migration acceleration, diagnostics diffing, and graph output.
- `v1.11.x`: ASP.NET Core and FluentValidation integrations.
- `v1.12.x`: observability and operational hooks.
- `v1.13.x`: compatibility, migration confidence, and API governance preparation.
- `v2.x`: mature compile-time superiority, secure DTO governance, and generated fast paths.
- `v2.2+`: enterprise supply chain and public API governance.
- `v3+`: optional ecosystem packages.
- `v4+`: platform-level tooling and visual products.

This roadmap is the source of truth for AstraFlow release direction, package ownership, feature planning, acceptance gates, and public promotion rules.

## Product Positioning

AstraFlow exists to make application flow explicit and reviewable:

- request/response dispatch,
- commands and queries,
- notification publishing,
- pipeline behaviors,
- source-auditable object mapping,
- opt-in convention mapping,
- query projections,
- EF Core projection validation,
- diagnostics,
- testing,
- analyzers,
- source generators,
- CLI tooling,
- framework integrations,
- observability,
- secure DTO policy,
- enterprise release governance.

AstraFlow is not a clone or fork of any existing library. Capability parity means developers can solve the same common application problems using AstraFlow's own APIs, implementation, package architecture, documentation, diagnostics, tests, and tooling.

The long-term product direction is to be safer, more diagnosable, more auditable, and more enterprise-ready than runtime-only or convention-heavy alternatives. The explicit core remains first-class forever.

## Roadmap Principles

- Explicit behavior is the default.
- Convention mapping is opt-in, inspectable, and never enabled by default.
- Mapping, projection, diagnostics, and telemetry must redact sensitive data by default.
- No package logs request payloads or DTO payloads by default.
- No package stores secrets.
- Framework-specific dependencies live only in framework-specific packages.
- Optional integration dependencies must not leak into core packages.
- Diagnostics are part of the product, not a side feature.
- Compile-time checks should move correctness earlier where practical.
- Source generators must be deterministic and readable.
- Performance claims require repeatable benchmark evidence.
- Public APIs must be stable, boring, and easy to explain.
- Breaking changes require a major version and migration guidance.
- Platform tooling must not block core parity.

## Standalone Package Independence Policy

Status: `Active policy`.

AstraFlow is a standalone public .NET package family.

AstraFlow is not tied to any private product, internal system, monorepo, or host application.

No package may require a private product or application-specific dependency.

No public documentation may imply that AstraFlow depends on a private product for validation, testing, migration, or adoption.

Public validation must use:

- clean sample consumers,
- package install verification,
- public package tests,
- compatibility matrices,
- generic sample applications,
- package artifact checks,
- migration examples that compile in this repository.

Private adoption stories and cleanup notes must stay outside the public roadmap.

The roadmap must remain focused on product versions, features, package boundaries, acceptance gates, and long-term direction.

## Package Boundary Rules

Status: `Active policy`.

- `AstraFlow.Contracts` contains shared public contracts only.
- `AstraFlow.Mediator` contains mediator runtime behavior only.
- `AstraFlow.Mapper` remains the explicit mapping core.
- `AstraFlow.Mapper.Conventions` contains opt-in convention and advanced mapping behavior.
- Convention mapping must not live as default behavior in `AstraFlow.Mapper`.
- EF Core provider-specific work must stay outside the mapper core.
- `AstraFlow.Mapper.EntityFrameworkCore` contains EF Core projection validation and EF-specific helpers.
- Provider-specific test projects or packages must not force provider dependencies on core users.
- `AstraFlow.Diagnostics` contains reporting and diagnostic models without framework-specific dependencies.
- `AstraFlow.Testing` contains framework-neutral testing helpers and must not depend on one test framework.
- `AstraFlow.Analyzers` contains Roslyn analyzers.
- `AstraFlow.Generators` contains source generators.
- `AstraFlow.Cli` contains command-line inspection, reporting, scaffolding, and migration assistance.
- `AstraFlow.AspNetCore` contains ASP.NET Core-specific helpers only.
- `AstraFlow.FluentValidation` contains FluentValidation-specific integration only.
- `AstraFlow.OpenTelemetry` or observability packages contain telemetry-specific integration only.
- Caching, authorization, idempotency, resilience, background jobs, domain events, and webhooks must stay in optional integration packages.
- No optional integration dependency may leak into core packages.
- No package may log request payloads or DTO payloads by default.
- No package may store secrets.
- Diagnostics must redact by default.
- Framework-specific dependencies must live only in framework-specific packages.

## Release Size And Scope Rules

Status: `Active policy`.

- One release should have one primary goal.
- Large parity work must be split into phases.
- Patch releases must not add broad new public surfaces.
- Minor releases may add optional packages and additive APIs.
- Major releases are for breaking changes or platform shifts.
- If a release contains too many high-risk features, split it.
- Candidate features must not block planned parity work.
- Platform tooling must not block core parity.
- No release may weaken explicit mapping defaults.
- No release may enable convention mapping by default.
- No release may remove diagnostics to gain speed.
- No release may introduce framework dependencies into core packages.
- Security-sensitive automation must be explicit and diagnostics-visible.

## Package Naming And Status Rules

Status: `Active policy`.

- A package should not be listed as candidate if the roadmap depends on it.
- If convention mapping is required for `v1.5` parity, `AstraFlow.Mapper.Conventions` is `Planned`, not candidate.
- Candidate packages must not be used as acceptance gates for planned releases.
- Research features must not be marketed.
- `Implemented candidate` only means code or docs are already edited and need final review.
- If something is only a future idea, label it `Candidate` or `Research`, not `Implemented candidate`.
- Use `Done`, `Patch`, `Planned`, `Candidate`, `Research`, `Rejected`, `Moved earlier`, and `Moved later` consistently.
- Public package names must describe package ownership clearly.
- Package names must not imply framework support unless the package actually owns that integration.

## Status Legend

- `Done`: implemented, tested, documented, and released or intended for release as completed scope.
- `Done, expand`: implemented, tested, and documented for the current release scope, with later expansion still planned.
- `Done where promoted`: candidate ideas that were promoted and shipped are done; unpromoted related ideas remain candidate.
- `Patch`: SemVer-safe hardening for existing released behavior.
- `Planned`: approved direction, not implemented yet.
- `Candidate`: useful but still requires design review.
- `Research`: requires technical, product, or market validation.
- `Rejected`: deliberately not planned.
- `Moved earlier`: intentionally advanced because it is required for practical parity.
- `Moved later`: retained but delayed behind parity and confidence work.
- `Active policy`: permanent roadmap rule.
- `Required`: mandatory gate or rule.
- `Implemented candidate`: edited in the repository and awaiting maintainer review.

## Fixed Baseline: v1.0.0-v1.4.0

Status: `Done`.

The releases below are fixed history and current baseline. Do not move these features into later versions. Patch releases may harden them, but must not rewrite the baseline.

### v1.0.0

Status: `Done`.

Goal:

Establish the explicit mediator and mapper core.

Packages affected:

- `AstraFlow.Mediator`
- `AstraFlow.Mapper`
- `AstraFlow`

Completed scope:

- Request/response dispatch.
- Notification publishing.
- Pipeline behaviors.
- Assembly scanning.
- Duplicate handler detection.
- Missing handler diagnostics.
- Optional handler coverage validation.
- Explicit object mapping rules.
- Declared mapping validation.
- Collection mapping.
- Explicit query projection helpers.
- Secure ID abstractions.
- Convenience registration package.
- Package tests, integration tests, samples, NuGet metadata, XML documentation, symbols, SourceLink-ready metadata, and MIT license.

### v1.0.1

Status: `Done`.

Goal:

Harden the initial explicit core.

Packages affected:

- `AstraFlow.Mediator`
- `AstraFlow.Mapper`
- `AstraFlow`
- docs

Completed scope:

- Clear failure for request types implementing multiple response contracts.
- Null service hardening.
- Null marker-type tolerance.
- Partial assembly-load tolerance during scanning.
- Mediator registration option documentation.
- XML documentation polish.
- Target framework documentation.
- Public documentation expansion for API reference, architecture, scenarios, troubleshooting, and publishing.

### v1.1.0

Status: `Done`.

Goal:

Make registrations and validation inspectable.

Packages affected:

- `AstraFlow.Diagnostics`
- `AstraFlow.Mediator`
- `AstraFlow.Mapper`

Completed scope:

- Framework-neutral diagnostics package.
- Registration reports for request handlers, notification handlers, pipeline behaviors, mapping rules, and projections.
- Severity-coded findings.
- Duplicate request handler findings.
- Ambiguous request contract findings.
- Missing request handler findings.
- Singleton lifetime warnings.
- Mapper catalog validation failures.
- In-memory diagnostic reports.
- JSON output.
- Markdown output.
- Health-check-ready summary object.
- Diagnostics tests, diagnostics sample, CI packing, publish workflow support, and documentation.

### v1.2.0

Status: `Done`.

Goal:

Add safer projection registration and validation.

Packages affected:

- `AstraFlow.Mapper`
- `AstraFlow.Mapper.EntityFrameworkCore`
- `AstraFlow.Diagnostics`

Completed scope:

- Projection registry.
- Deterministic unnamed and named projection lookup.
- `INamedProjection<TSource, TDestination>`.
- Projection validation warning-by-default findings.
- Duplicate projection detection.
- Null expression findings.
- Mapper-call, custom-method, non-deterministic-value, complex-closure, and unsupported-construction findings.
- Diagnostics integration for projection names and projection validation findings.
- Optional EF Core relational translation validation helpers.
- SQLite EF Core integration tests.
- Expanded projection registry tests.

### v1.2.1

Status: `Done`.

Goal:

Harden compatibility and adoption documentation.

Packages affected:

- all current packages
- docs
- release process

Completed scope:

- Compatibility guidance for current target support and future target expansion.
- Package selection guidance.
- Release checklist gates for target framework verification, dependency review, and clean install smoke tests.
- Compatibility audit findings for future `netstandard2.0`, `net8.0`, `net9.0`, and direct legacy framework support.
- Package release notes update.
- No runtime behavior changes.

### v1.2.2

Status: `Done`.

Goal:

Ship broad core package target framework support.

Packages affected:

- `AstraFlow`
- `AstraFlow.Mediator`
- `AstraFlow.Mapper`
- `AstraFlow.Diagnostics`
- `AstraFlow.Mapper.EntityFrameworkCore`

Completed scope:

- Multi-target support for core packages.
- Core package assets for `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`.
- EF Core package remains version-aligned with EF Core 10.
- Compatibility-safe source changes for older target assets.
- `System.Text.Json` package dependency for the `netstandard2.0` diagnostics asset.
- Compatibility, release, publishing, and package-selection docs updated for actual target frameworks.

### v1.2.3

Status: `Done`.

Goal:

Verify clean package consumption.

Packages affected:

- all current packages
- scripts
- CI

Completed scope:

- Clean external consumer install verification script.
- Core package verification in `netstandard2.0`, `net8.0`, and `net9.0` consumer projects.
- Full package verification, including EF Core package, in a `net10.0` consumer project.
- Clean package install verification wired into local packing, CI, and publish workflow.
- Release documentation updated so target framework support must be proven by automated package install checks.

### v1.3.0

Status: `Done`.

Goal:

Add framework-neutral testing support.

Packages affected:

- `AstraFlow.Testing`
- `AstraFlow.Mediator`
- `AstraFlow.Mapper`
- `AstraFlow.Diagnostics`

Completed scope:

- Fake sender.
- Fake publisher.
- Fake mediator.
- Request and notification recording.
- Handler test harness.
- Notification handler test harness.
- Pipeline test harness.
- Mediator, mapper, projection, diagnostics, exception, mapping-rule, and secure ID assertion helpers.
- Deterministic `TestSecureIdCodec`.
- No dependency on xUnit, NUnit, MSTest, FluentAssertions, or mocking frameworks.
- `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` assets.
- CI, publish, pack, and clean-install verification updated for the testing package.

### v1.4.0

Status: `Done`.

Goal:

Complete the first practical mediator parity baseline.

Packages affected:

- `AstraFlow.Contracts`
- `AstraFlow.Mediator`
- `AstraFlow.Testing`
- `AstraFlow.Diagnostics`
- `AstraFlow`

Completed scope:

- Shared contracts package.
- Mediator contracts available from shared contracts.
- Void request support.
- Runtime object dispatch for void requests.
- Stream request support.
- Stream pipeline behaviors.
- Void request pipeline behaviors.
- Request pre-processors.
- Request post-processors.
- Request exception actions that rethrow.
- Request exception handlers that must explicitly mark failures as handled.
- Opt-in parallel notification publishing.
- Opt-in bounded-parallel notification publishing.
- Sequential notification publishing remains the default.
- Registration builder helpers for behavior, processor, stream behavior, and exception-flow registration.
- Pack, publish, CI, and clean-install verification updated for the contracts package.

## v1.4.x Stabilization Patches

Status: `Patch`.

Goal:

Harden the `v1.4.0` mediator parity baseline without adding broad new public surfaces.

Why this version exists:

The `v1.4.0` release expands the mediator surface significantly. Patch releases should improve reliability, diagnostics, docs, and package verification before mapping parity work accelerates.

Packages affected:

- `AstraFlow.Contracts`
- `AstraFlow.Mediator`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`
- `AstraFlow`
- docs, samples, scripts, CI

Features included:

- Registration builder polish.
- Documentation corrections.
- Diagnostics finding expansion for existing mediator features.
- Stream cancellation hardening.
- Stream disposal behavior tests.
- Processor ordering diagnostics.
- Exception-handler ordering diagnostics.
- Notification handler diagnostics.
- Install verification expansion.
- Clean sample consumer checks.
- Package metadata polish.
- CI/package artifact verification improvements.

Competitor-style parity covered:

- Mature mediator reliability and diagnostics for already shipped request, notification, stream, processor, and exception-flow features.

AstraFlow advantage beyond parity:

- Startup and registration diagnostics remain explicit and reviewable.

Acceptance gates:

- Package builds pass.
- Release tests pass.
- Clean package install verification passes.
- A clean sample consumer can send response requests, void requests, stream requests, and notifications.
- Diagnostics report existing mediator registrations without payload values.

Test requirements:

- Stream cancellation tests.
- Stream disposal tests.
- Processor order tests.
- Exception action rethrow tests.
- Exception handler handled-state tests.
- Bounded parallel notification aggregate failure tests.

Documentation requirements:

- Mediator guide updates.
- Testing guide updates.
- Troubleshooting entries for stream, processor, notification, and exception-flow failures.

Migration examples required:

- Response request.
- Void request.
- Stream request.
- Notification.
- Pipeline behavior.
- Local project reference to NuGet `PackageReference` migration in a clean sample consumer.

Risk level:

- Low to medium.

What must NOT be included:

- Broad new mapping parity.
- New major public API areas.
- Breaking changes.
- Moving `v1.4.0` features to later versions.

## Fast-Track Post-v1.4 Roadmap

### v1.5 AutoMapper Core Parity Overview

Status: `Done`.

Goal:

Make AstraFlow credible for common DTO mapping scenarios while keeping explicit mapping as the recommended default for sensitive and enterprise flows.

Why this version exists:

The largest practical adoption gap after `v1.4.0` is mapping productivity. This work is split into small releases so convention mapping can be introduced safely and inspected thoroughly.

Packages affected:

- `AstraFlow.Mapper`
- `AstraFlow.Mapper.Conventions`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`

Implementation order:

1. Establish package boundary and opt-in registration.
2. Add profile/catalog discovery and exact member matching.
3. Add diagnostics and mapping plan export.
4. Add member configuration.
5. Add constructor, immutable destination, and update mapping.

Competitor-style parity covered:

- Common object-to-object mapping productivity.
- Profile/catalog organization.
- Member-level configuration.
- Startup validation.
- Existing destination update scenarios.

AstraFlow advantage beyond parity:

- Convention output is never hidden.
- Sensitive-field behavior is deny-by-default.
- Strict mode can fail startup when convention output changes.

Risk level:

- High across the full `v1.5.x` line.

#### v1.5.0 Convention Mapping Foundation

Status: `Done`.

Goal:

Introduce safe opt-in convention mapping without weakening explicit mapping.

Why this version exists:

Developers need common read DTO mapping productivity, but AstraFlow must not make implicit mapping the default.

Packages affected:

- `AstraFlow.Mapper`
- `AstraFlow.Mapper.Conventions`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`

Features included:

- Optional `AstraFlow.Mapper.Conventions` package.
- Convention mapping disabled by default.
- Exact source/destination type-pair registration.
- Mapping profiles.
- Mapping catalogs.
- Exact property-name matching.
- Case-insensitive matching as opt-in.
- Include rules.
- Ignore rules.
- Unmapped destination diagnostics.
- Unmapped source diagnostics.
- Ambiguity detection.
- Sensitive-field deny list.
- Sensitive-field require-allow option.
- Strict mode for convention output.
- Diagnostics for every convention-created member.
- Mapping plan export foundation.
- Generated preview report for convention output if feasible.

Competitor-style parity covered:

- Basic convention mapping and configuration validation for common DTO mapping.

AstraFlow advantage beyond parity:

- Every convention-created member must be visible in diagnostics.
- Sensitive fields are blocked unless explicitly allowed.

Acceptance gates:

- Explicit mapping remains unchanged.
- Convention mapping is opt-in.
- No convention-created mapping is hidden from diagnostics.
- Sensitive field mapping is blocked unless explicitly allowed.
- Strict mode can fail startup when convention output changes.
- Mapping plan export is deterministic.

Test requirements:

- Exact matching tests.
- Case-insensitive matching tests.
- Include/ignore tests.
- Unmapped source and destination tests.
- Ambiguity tests.
- Sensitive field tests.
- Mapping plan export tests.

Documentation requirements:

- Convention mapping guide.
- Profile/catalog guide.
- Sensitive-field policy guide.
- Strict mode guide.
- Troubleshooting entries for unmapped, ambiguous, and sensitive-field failures.

Migration examples required:

- Explicit read DTO mapping to opt-in convention mapping.
- Ignoring sensitive fields.
- Strict convention mapping failure and fix.

Risk level:

- High.

What must NOT be included:

- Convention mapping enabled by default.
- Reverse mapping.
- Flattening.
- Unflattening.
- Deep graph magic.
- Framework-specific dependencies.

#### v1.5.1 Member Configuration Expansion

Status: `Done`.

Goal:

Add common member-level mapping configuration needed for practical mapping productivity.

Why this version exists:

Exact convention mapping alone is not enough for real DTOs. Member-level configuration is required before broader adoption claims.

Packages affected:

- `AstraFlow.Mapper.Conventions`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`

Features included:

- Fluent member configuration.
- Required destination member rules.
- Null substitution.
- Value converters.
- Conditional member mapping.
- Enum-to-enum mapping validation.
- Enum-to-string mapping support.
- Nullable compatibility diagnostics.
- Numeric conversion diagnostics.
- Per-member diagnostics.
- Mapping plan export expansion.

Competitor-style parity covered:

- Common member mapping configuration used in object mapping libraries.

AstraFlow advantage beyond parity:

- Member-level behavior appears in mapping plans and diagnostics.
- Unsafe nullable and numeric conversions are reported.

Acceptance gates:

- Member-level configuration is inspectable.
- Unsafe nullable and numeric conversions produce diagnostics.
- Enum mapping failures are clear.
- Converter usage appears in mapping plans.
- Conditional member mapping is visible in diagnostics.

Test requirements:

- Member configuration tests.
- Required destination tests.
- Null substitution tests.
- Converter tests.
- Conditional mapping tests.
- Enum mapping tests.
- Nullable and numeric diagnostics tests.
- Mapping plan tests.

Documentation requirements:

- Member configuration reference.
- Converter guide.
- Conditional mapping guide.
- Nullable/numeric diagnostics guide.

Migration examples required:

- Custom member mapping.
- Null substitution.
- Converter usage.
- Conditional patch DTO member mapping.

Risk level:

- Medium to high.

What must NOT be included:

- Hidden global transforms.
- Uninspectable member behavior.
- Implicit reverse mapping.

#### v1.5.2 Destination, Constructor, and Update Mapping

Status: `Done`.

Goal:

Support real-world destination creation and update scenarios.

Why this version exists:

DTOs often target records, immutable types, required members, and existing destination instances. AstraFlow needs these scenarios without enabling unsafe public DTO to domain updates.

Packages affected:

- `AstraFlow.Mapper.Conventions`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`

Features included:

- Constructor binding.
- Record binding.
- Immutable destination support.
- Required member validation.
- Existing destination mapping.
- Update/patch mapping foundation.
- Sensitive destination write diagnostics.
- Safe update mapping policy foundation.
- Collection mapping shape expansion where safe.

Competitor-style parity covered:

- Constructor/record mapping.
- Existing destination mapping.
- Common update/patch mapping scenarios.

AstraFlow advantage beyond parity:

- Read DTO mapping and write/update mapping are documented and diagnosed separately.
- Sensitive destination writes require explicit allow rules.

Acceptance gates:

- Constructor and record binding have ambiguity diagnostics.
- Required destination members are validated.
- Existing destination mapping does not overwrite sensitive members without explicit allow rules.
- Update/patch behavior is documented separately from read DTO mapping.

Test requirements:

- Constructor binding tests.
- Record binding tests.
- Immutable destination tests.
- Required member validation tests.
- Existing destination tests.
- Update/patch tests.
- Sensitive destination write tests.

Documentation requirements:

- Constructor and record binding guide.
- Existing destination mapping guide.
- Update/patch safety guide.
- Sensitive destination write guide.

Migration examples required:

- Record DTO mapping.
- Immutable destination mapping.
- Existing destination update with explicit allow rules.

Risk level:

- High.

What must NOT be included:

- Unsafe public DTO to domain updates.
- Sensitive destination writes by convention.
- Deep graph update magic.

### v1.6 Advanced Mapping Parity

Status: `Done`.

Goal:

Cover advanced but common mapping scenarios without compromising auditability.

Why this version exists:

After core convention mapping exists, common advanced scenarios such as flattening, explicit reverse mapping, custom paths, and resolvers become the next practical parity gap.

#### v1.6.0 Advanced Mapping Parity Core

Status: `Done`.

Goal:

Add the stable advanced mapping core.

Packages affected:

- `AstraFlow.Mapper.Conventions`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`

Features included:

- Flattening with explicit enablement.
- Unflattening with explicit enablement.
- Explicit reverse mapping.
- Include members.
- Custom source expressions.
- Custom destination paths.
- Value resolvers.
- Resolver lifetime diagnostics.
- Reverse-map diagnostics.
- Unflattening domain-write diagnostics.
- Sensitive destination write protection.
- Strict diagnostics for every advanced mapping decision.

Competitor-style parity covered:

- Flattened DTOs.
- Explicit reverse maps.
- Custom member paths.
- Resolver-based mapping.
- Controlled composition mapping.

AstraFlow advantage beyond parity:

- Reverse mapping is never implicit.
- Unflattening is opt-in and diagnostics-heavy.
- Sensitive domain writes require explicit allow rules.

Acceptance gates:

- Reverse mapping is never implicit.
- Flattening is opt-in.
- Unflattening is opt-in.
- Every reversed member path appears in diagnostics.
- Every unflattened destination path appears in diagnostics.
- Sensitive domain writes require explicit allow rules.

Test requirements:

- Flattening tests.
- Reverse mapping tests.
- Unflattening tests.
- Include member tests.
- Custom source tests.
- Custom destination path tests.
- Resolver tests.
- Resolver lifetime diagnostics tests.
- Sensitive destination write tests.

Documentation requirements:

- Advanced mapping guide.
- Flattening guide.
- Explicit reverse mapping guide.
- Unflattening safety guide.
- Resolver guide.

Migration examples required:

- Flattened read DTO.
- Explicit reverse mapping with allow rules.
- Custom source expression.
- Custom destination path.

Risk level:

- High.

What must NOT be included:

- Implicit reverse mapping.
- Automatic domain update magic.
- Hidden global behavior.
- Polymorphism unless design is stable.
- Inheritance mapping unless design is stable.
- Circular reference controls unless deep graph mapping is explicitly accepted.

#### v1.6.x Candidate Follow-ups

Status: `Done where promoted`.

Unpromoted related ideas remain candidate.

Goal:

Track useful advanced mapping ideas without making them blockers for `v1.6.0`.

Packages affected:

- `AstraFlow.Mapper.Conventions`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`

Candidate features:

- Value transformers if global behavior can be made diagnosable. `Done in v1.6.1`.
- Before-map hooks if diagnostics-visible. `Done in v1.6.1`.
- After-map hooks if diagnostics-visible. `Done in v1.6.1`.
- Inheritance mapping after profile/catalog model stabilizes. `Done in v1.6.2`.
- Polymorphic mapping after profile/catalog model stabilizes. `Done in v1.6.2`.
- Collection element polymorphism after profile/catalog model stabilizes.
- Collection update strategies if real update flows require them.
- Max-depth controls only if deep graph mapping becomes explicit scope.
- Circular-reference controls only if deep graph mapping becomes explicit scope.

Competitor-style parity covered:

- Advanced mapping convenience scenarios that are useful but riskier than the core parity set.

AstraFlow advantage beyond parity:

- Risky features remain candidate until they are inspectable, diagnosable, and safe by default.

Acceptance gates:

- Each candidate must have a design note before implementation.
- Each candidate must identify diagnostics output.
- Each candidate must prove it does not weaken explicit defaults.

Test requirements:

- Candidate-specific test plan before promotion.

Documentation requirements:

- Candidate-specific design notes before promotion.
- `v1.6.1` design note: `docs/design-v1.6.1-candidate-followups.md`.
- `v1.6.2` design note: `docs/design-v1.6.2-inheritance-polymorphism.md`.

Migration examples required:

- Candidate-specific examples only after promotion.

Risk level:

- High.

What must NOT be included:

- Blocking `v1.6.0`.
- Hidden global behavior.
- Deep graph behavior by default.

### v1.7 Projection and EF Provider Parity

Status: `Done`.

Goal:

Make AstraFlow projections credible for real EF Core read models and safer than hidden runtime SQL translation assumptions.

Why this version exists:

Projection support exists, but practical adoption needs parameters, provider-specific validation, stable warning codes, and CI-friendly projection reports.

Packages affected:

- `AstraFlow.Mapper`
- `AstraFlow.Mapper.EntityFrameworkCore`
- provider-specific test projects or optional packages if dependency isolation requires them
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`

Features included:

- Projection parameters.
- Projection parameter object model.
- Deterministic projection plan export.
- CI-friendly projection reports through `IProjectionPlanProvider`.
- SQLite provider tests.
- EF provider validation report metadata.
- Provider matrix documentation.
- Provider-specific warning codes.
- Expression translation warnings.
- Non-translatable method warnings.
- Non-deterministic expression warnings.
- No unsafe closure capture.
- Raw public ID checks.
- Secure ID projection checks.
- SQL snapshot helper remains candidate only.

Deferred to `v1.7.x` or later:

- SQL Server provider tests where practical.
- PostgreSQL provider tests where practical.
- MySQL provider tests where practical.
- Projection diffing.

Original candidate scope:

- SQLite provider tests.
- SQL Server provider tests where practical.
- PostgreSQL provider tests where practical.
- MySQL provider tests where practical.
- Provider-specific warning codes.
- Expression translation warnings.
- Non-translatable method warnings.
- Non-deterministic expression warnings.
- No unsafe closure capture.
- Projection plan export.
- Projection diffing if useful.
- Raw public ID checks.
- Secure ID projection checks.
- CI-friendly projection reports.
- SQL snapshot helper as candidate only.

Competitor-style parity covered:

- Query projection to DTOs.
- Provider translation validation.
- Parameterized projection scenarios.

AstraFlow advantage beyond parity:

- Projection validation must not execute application queries.
- Provider-specific findings are stable and reviewable.
- EF provider dependencies remain isolated from mapper core users.

Acceptance gates:

- EF provider-specific test projects are isolated.
- Provider tests do not force SQL Server, PostgreSQL, or MySQL packages onto normal users.
- `AstraFlow.Mapper.EntityFrameworkCore` remains the EF integration layer.
- Provider-specific packages or test projects are used if dependency isolation requires it.
- Unsafe closure capture produces a finding.
- Projection plan export is deterministic.

Test requirements:

- Projection parameter tests.
- Provider validation tests.
- Translation warning tests.
- Non-translatable method tests.
- Closure capture tests.
- Projection plan export tests.
- Raw public ID and secure ID projection tests.

Documentation requirements:

- Projection parameter guide.
- EF provider validation matrix.
- Projection diagnostics code catalog.
- CI projection report guide.

Migration examples required:

- Query projection migration to AstraFlow projection.
- Tenant/user/current-time parameter projection.
- Provider validation in a clean sample consumer.

Risk level:

- Medium to high.

What must NOT be included:

- Executing application queries during validation.
- Hiding `IQueryable` provider behavior.
- Forcing provider dependencies into mapper core.
- SQL snapshot helper as required scope.

### v1.7.x Projection Stabilization Patches

Status: `Done`.

Goal:

Harden the `v1.7.0` projection and EF provider parity baseline without expanding core package dependencies.

Patch releases:

- `v1.7.1`: projection plan assertion helpers in `AstraFlow.Testing`, plus release-facing documentation and package metadata updates.
- `v1.7.2`: projection plan parameter type and sensitivity assertion helpers in `AstraFlow.Testing`.

Packages affected:

- `AstraFlow.Mapper`
- `AstraFlow.Mapper.EntityFrameworkCore`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`
- docs, samples, scripts, CI

Patch-safe scope:

- Documentation corrections for projection parameters and provider validation.
- Additional projection plan assertion helpers.
- More static projection warning coverage where additive and low risk.
- Provider-specific test projects for SQL Server, PostgreSQL, or MySQL if dependencies stay isolated.
- More clean consumer projection validation examples.
- Package verification polish.

What must NOT be included:

- Provider dependencies in `AstraFlow.Mapper`.
- Required SQL snapshot output.
- Query execution during validation.
- Breaking projection API changes.

### v1.8 Early Analyzers and Source Generators

Status: `Done, expand`.

Goal:

Introduce build-time checks first, then generated registration and metadata after analyzer IDs and diagnostics are stable.

Why this version exists:

Runtime diagnostics are useful, but common wiring, mapping, and projection failures should be caught during build wherever practical. Analyzers come before generators so generated metadata has stable rule IDs and semantics.

Packages affected:

- `AstraFlow.Analyzers`
- `AstraFlow.Generators`
- `AstraFlow.Contracts`
- `AstraFlow.Mediator`
- `AstraFlow.Mapper`
- `AstraFlow.Mapper.Conventions`
- `AstraFlow.Diagnostics`
- `AstraFlow.Testing`

Competitor-style parity covered:

- Compile-time registration and configuration checks.
- AOT/trimming-friendly registration foundation.

AstraFlow advantage beyond parity:

- Runtime diagnostics, analyzer findings, CLI reports, and generator metadata can share stable concepts.

Risk level:

- High across the full `v1.8.x` line.

#### v1.8.0 Analyzer Foundation

Status: `Done`.

Goal:

Create the analyzer package foundation before individual rules expand.

Packages affected:

- `AstraFlow.Analyzers`
- `AstraFlow.Testing`
- docs

Features included:

- Analyzer package structure.
- Stable analyzer IDs.
- Analyzer severity model.
- Analyzer documentation pattern.
- Analyzer test infrastructure.
- Suppression guidance.
- Analyzer package asset verification.

Acceptance gates:

- Analyzer IDs are stable.
- Analyzer tests can run in CI.
- Suppression guidance exists.
- Rule documentation template exists.
- Analyzer package ships compiler analyzer assets without runtime `lib/` assets.

What must NOT be included:

- Generator dependency.
- Unstable rule IDs.
- Unsafe code fixes.

#### v1.8.1 Mediator Analyzers

Status: `Done`.

Goal:

Catch mediator wiring risks during build.

Packages affected:

- `AstraFlow.Analyzers`
- `AstraFlow.Contracts`
- `AstraFlow.Mediator`

Features included:

- Missing handler analyzer.
- Duplicate handler analyzer.
- Ambiguous request contract analyzer.
- Missing stream handler analyzer.
- Unsafe lifetime analyzer.
- Behavior order analyzer remains a later candidate.

Acceptance gates:

- Rules produce actionable diagnostics.
- False-positive tests exist.
- Analyzer messages point to fixes or docs.

What must NOT be included:

- Silent rewrites.
- Required source generator dependency.

#### v1.8.2 Mapper and Projection Analyzers

Status: `Done`.

Goal:

Catch mapping and projection risks during build.

Packages affected:

- `AstraFlow.Analyzers`
- `AstraFlow.Mapper`
- `AstraFlow.Mapper.Conventions`

Features included:

- Undeclared mapping rule analyzer as the first declaration-drift check.
- Reverse mapping sensitive-write analyzer.
- Raw `Guid` `PublicId` projection shape analyzer.
- Mapper call inside `IQueryable` or projection expression analyzer.
- Custom method call inside projection expression analyzer.
- Complex closure or instance-field capture analyzer.

Acceptance gates:

- Sensitive findings have clear severity rules.
- Projection analyzer docs explain static limits.
- Rules do not claim full provider translation proof.

What must NOT be included:

- Unsafe automatic mapping rewrites.
- Claims that static analysis replaces EF provider validation.

#### v1.8.3 Generated Registration Foundation

Status: `Done`.

Goal:

Add generated registration for mediator flows after analyzer foundation is stable.

Packages affected:

- `AstraFlow.Generators`
- `AstraFlow.Contracts`
- `AstraFlow.Mediator`

Features included:

- Generated closed request handler registration.
- Generated closed notification handler registration.
- Generated closed stream handler registration.
- Generated closed pre-processor, post-processor, exception-action, and exception-handler registration.
- AOT/trimming-friendly generated mediator registration sample.

Acceptance gates:

- Analyzers are useful without generators.
- Generators ship after the analyzer foundation and stable rule catalog.
- Runtime fallback remains through `AddAstraFlowMediator(...)`.
- Generated code is deterministic, readable, and fully qualified.
- Generated mediator registration sample builds.
- Generator package builds as compiler assets under `analyzers/dotnet/cs`.

What must NOT be included:

- Generator-only runtime behavior without migration guidance.
- Unreadable generated code.

#### v1.8.4 Generated Mapping and Projection Metadata

Status: `Done`.

Goal:

Generate mapping and projection metadata for diagnostics, CLI, AOT, and future optimization.

Packages affected:

- `AstraFlow.Generators`
- `AstraFlow.Mapper`
- `AstraFlow.Mapper.Conventions`
- `AstraFlow.Diagnostics`

Features included:

- Generated mapping rule metadata.
- Generated declared-rule metadata flags.
- Generated projection metadata.
- Generated parameterized projection metadata.
- Generated named projection flags.
- Generator snapshot-style tests.

Acceptance gates:

- Generated code is deterministic.
- Snapshot-style tests cover generated output.
- Runtime fallback remains through `AddAstraFlowMapper(...)`.
- Generated metadata provider identifies generated mapper/projection metadata origin.

What must NOT be included:

- Performance claims before benchmarks.
- Required generated-only mapping path.

### v1.9 Performance and Benchmarks

Status: `Done in v1.9.0`.

Goal:

Measure real performance honestly before making performance claims or optimizing generated fast paths.

Why this version exists:

AstraFlow should not claim speed without repeatable numbers. Benchmarks must exist before public speed claims.

Packages affected:

- `AstraFlow.Benchmarks`
- all runtime packages as benchmark subjects

Features included:

- BenchmarkDotNet project added as `benchmarks/AstraFlow.Benchmarks`.
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
- Generated metadata benchmark where generators exist.
- Allocation measurements through BenchmarkDotNet `MemoryDiagnoser` and smoke-run allocation capture.
- Benchmark claim policy documented in `docs/benchmarks.md`.

Competitor-style parity covered:

- Credible performance comparison methodology.

AstraFlow advantage beyond parity:

- Manual baseline exists in every benchmark group.
- Benchmark claims are blocked until evidence exists.

Acceptance gates:

- Benchmarks run locally through `scripts/run-benchmarks.ps1` and in CI through workflow dispatch.
- Benchmark environment is documented in `docs/benchmarks.md`.
- Manual baseline exists in every benchmark group.
- Benchmark results are reproducible.
- No speed claims are made until repeatable numbers exist.

Test requirements:

- Benchmark project compile test through solution/test builds.
- Smoke benchmark run through `--smoke`.
- Allocation measurement capture in smoke mode and BenchmarkDotNet output.

Documentation requirements:

- Benchmark methodology.
- Benchmark environment template.
- Benchmark claim policy.

Migration examples required:

- None.

Risk level:

- Medium.

What must NOT be included:

- Speed claims without repeatable numbers.
- Optimizations that remove diagnostics or weaken safety.
- Marketing claims based on one local run.

### v1.10 CLI, Migration Acceleration, Diagnostics Diffing, and Graph Output

Status: `Done in v1.10.0`.

Goal:

Make AstraFlow inspectable, adoptable, and maintainable from the command line.

Why this version exists:

Diagnostics should become practical CI and migration workflows. This release is command-line tooling, not a dashboard or IDE product.

Packages affected:

- `AstraFlow.Cli`
- `AstraFlow.Diagnostics`
- `AstraFlow.Mediator`
- `AstraFlow.Mapper`
- `AstraFlow.Mapper.Conventions`
- `AstraFlow.Analyzers`
- `AstraFlow.Generators`

Delivered in `v1.10.0`:

- `AstraFlow.Cli` exists as a `net10.0` .NET tool package.
- `astraflow inspect [path]` emits a stable JSON report envelope.
- `astraflow inspect handlers|notifications|mappings|projections` exposes category-specific snapshots.
- `astraflow validate` emits structured success/error results.
- `astraflow report` emits JSON, Markdown, and SARIF output.
- `astraflow diff` compares JSON report snapshots.
- `astraflow graph` emits Mermaid and DOT graphs.
- `astraflow scan` reports MediatR and AutoMapper migration candidates.
- CLI command, output-format, diff, graph, scan, and process smoke tests exist.

Features included:

- `astraflow inspect handlers`
- `astraflow inspect notifications`
- `astraflow inspect mappings`
- `astraflow inspect projections`
- `astraflow validate`
- `astraflow report`
- JSON output.
- Markdown output.
- SARIF output.
- Diagnostics diff.
- Mermaid graph output.
- DOT graph output.
- Migration scanner reports.
- Scaffold request.
- Scaffold handler.
- Scaffold mapping.
- Scaffold projection.
- Scaffold test.
- Package reference checker.
- Package artifact checker.

Competitor-style parity covered:

- Migration and inspection support for common mediator and mapper adoption paths.

AstraFlow advantage beyond parity:

- Diagnostics diffing and graph output make application-flow changes reviewable in CI.

Acceptance gates:

- CLI commands work against clean sample consumers.
- Reports redact payloads and secrets by default.
- SARIF output validates.
- Diagnostics diff is deterministic.
- Graph output is stable enough for CI artifacts.
- Scanner output is suggestion-only.

Test requirements:

- CLI command tests.
- Golden report tests.
- SARIF validation tests.
- Graph output tests.
- Scanner fixture tests.

Documentation requirements:

- CLI reference.
- CI usage guide.
- Diagnostics diff guide.
- Graph output guide.
- Migration scanner guide.
- Scaffold command guide.

Migration examples required:

- Common mediator usage patterns to AstraFlow equivalents.
- Common mapper usage patterns to AstraFlow equivalents.
- Package selection examples.
- Before/after examples that compile.

Migration Acceleration Strategy:

- Provide a migration cookbook.
- Provide before/after examples.
- Use analyzer suggestions.
- Use CLI migration scanner reports.
- Scaffold request, handler, mapping, projection, and test files.
- Explain compatibility notes.
- Do not perform automatic unsafe rewrites.
- Do not clone competitor APIs.
- Do not copy competitor code.
- Do not silently change behavior.
- Security-sensitive mapping changes require explicit user action.

Risk level:

- Medium.

What must NOT be included:

- Visual dashboard UI.
- IDE extension.
- Hosted service.
- Interactive diagnostics explorer.
- Silent mass rewrites.

### v1.11 Web and Validation Integrations

Status: `Done in v1.11.0`.

Goal:

Support common application integration without polluting core packages.

Why this version exists:

ASP.NET Core and FluentValidation are common adoption needs, but they belong in dedicated packages after core parity foundations exist.

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

Competitor-style parity covered:

- Common web and validation usage around mediator flows.

AstraFlow advantage beyond parity:

- Framework-specific behavior stays out of core packages.
- Diagnostics endpoint is development-only by default.
- Payload logging remains off by default.

Acceptance gates:

- Core packages do not gain ASP.NET Core or FluentValidation dependencies.
- Sample API builds.
- Validation behavior tests pass.
- Diagnostics endpoint redacts by default.
- Diagnostics endpoint is development-only unless explicitly enabled.

Test requirements:

- Minimal API helper tests.
- Controller helper tests where practical.
- Validation behavior tests.
- Problem-details mapping tests.
- Health-check summary tests.

Documentation requirements:

- ASP.NET Core integration guide.
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

Status: `Planned`.

Goal:

Make production operation visible without leaking sensitive data.

Why this version exists:

Operational visibility matters, but it should use stable mediator, mapper, projection, diagnostics, and integration surfaces.

Packages affected:

- `AstraFlow.OpenTelemetry`
- `AstraFlow.Diagnostics`
- `AstraFlow.AspNetCore`
- observability abstractions if dependency-free

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

Competitor-style parity covered:

- Production tracing and metrics around application flow.

AstraFlow advantage beyond parity:

- No request payload logging by default.
- No DTO payload logging by default.
- Redaction policy aligns with diagnostics and CLI.

Acceptance gates:

- Telemetry can be disabled.
- No payload values are emitted by default.
- Span names and metric names are documented.
- High-cardinality values are avoided by default.

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
- OpenTelemetry dependency in core packages.

### v1.13 Compatibility, Migration, and Consumer Confidence

Status: `Planned`.

Goal:

Make adoption and upgrades credible before larger v2/v3 platform work.

Why this version exists:

After parity features land, consumer confidence becomes the blocker. API compatibility, upgrade tests, matrices, and samples must be stable before bigger package expansion.

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
- API governance preparation.

Competitor-style parity covered:

- Upgrade confidence and adoption documentation.

AstraFlow advantage beyond parity:

- Package confidence is a planned product feature, not release housekeeping.

Acceptance gates:

- API diff runs in CI.
- Upgrade smoke tests restore old package versions, upgrade, build, and test.
- Compatibility matrix is current.
- Samples compile.
- Migration cookbook examples compile.

Test requirements:

- API compatibility tests.
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

- Large new product features.
- Platform dashboard work.
- Broad ecosystem package expansion.

## v2 Compile-Time Superiority and Security Governance

Status: `Planned`.

Goal:

Mature and expand the analyzer/generator foundation introduced in `v1.8`, then add compile-time security governance.

Why this version exists:

`v1.8` introduces early analyzers and generators. `v2` is the maturity phase for full rule coverage, secure DTO policy, shared redaction policy, and compile-time governance.

Packages affected:

- `AstraFlow.Analyzers`
- `AstraFlow.Generators`
- `AstraFlow.Diagnostics`
- `AstraFlow.Cli`
- `AstraFlow.Testing`
- optional security policy package if justified

Features included:

- Full analyzer catalog.
- Mature generator packages.
- Secure DTO policy.
- Analyzer code fixes where safe.
- Deterministic generated code.
- Generator snapshot tests.
- AOT/trimming sample.
- Raw public ID enforcement.
- Sensitive-field enforcement.
- Secure analyzer suppression policy.
- Redaction policy shared by diagnostics, CLI, and observability.
- Security threat model.
- Secure defaults test suite.
- Compile-time governance rules.

Competitor-style parity covered:

- Compile-time validation, generated registration, and generated mapping metadata.

AstraFlow advantage beyond parity:

- Security-sensitive DTO and mapping policies become enforceable.

Acceptance gates:

- Analyzer rule catalog is complete.
- Generator outputs are deterministic.
- Secure DTO policy has tests.
- Redaction policy is shared across diagnostics, CLI, and observability.
- Threat model is published.
- Suppression policy requires reasons for sensitive suppressions where practical.

Test requirements:

- Analyzer tests.
- Code-fix tests where implemented.
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

## v2.1 Performance Optimization and Generated Fast Paths

Status: `Planned`.

Goal:

Improve performance only after measurement.

Why this version exists:

`v1.9` provides evidence. `v2.1` acts on that evidence without weakening diagnostics or safety.

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

Competitor-style parity covered:

- Performance-sensitive mediator and mapping scenarios.

AstraFlow advantage beyond parity:

- Performance claims remain evidence-backed and reproducible.

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

## v2.2 Enterprise Supply Chain

Status: `Planned`.

Goal:

Make AstraFlow credible for enterprise package review.

Why this version exists:

Enterprise adoption requires signing, provenance, SBOMs, dependency review, and documented security handling.

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

Competitor-style parity covered:

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

## v2.3 Public API Governance

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

Competitor-style parity covered:

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

- Breaking changes without a major version and migration guide.

## v3 Ecosystem Packages

Status: `Moved later` and `Planned`.

Goal:

Provide optional ecosystem packages without bloating core.

Why this version exists:

Caching, authorization, idempotency, resilience, background jobs, domain events, and webhooks are useful but should not delay practical mediator and mapper parity.

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

Competitor-style parity covered:

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

## v4 Platform-Level Tooling

Status: `Moved later` and `Planned`.

Goal:

Turn AstraFlow into a full application-flow platform after the core is already competitive.

Why this version exists:

Visual tooling is valuable only after CLI, diagnostics metadata, analyzers, generators, mappings, projections, and compatibility foundations are stable.

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

Competitor-style parity covered:

- Platform-level inspection and governance tooling beyond common runtime libraries.

AstraFlow advantage beyond parity:

- Flow, mapping, projection, and diagnostic changes become reviewable by large teams.

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

What AstraFlow already has:

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
- Opt-in convention mapping package.
- Convention mapping profiles and catalogs.
- Include, ignore, sensitive-member allow, strict mode, and mapping plan export.
- Member configuration, required-member checks, null substitution, value converters, conditionals, nullable diagnostics, numeric diagnostics, and enum mapping helpers.
- Constructor, record, immutable destination, and existing-destination mapping.
- Flattening, unflattening, explicit reverse mapping, include members, value resolvers, value transformers, before/after hooks, inheritance mapping, and polymorphic dispatch.
- Parameterized projections, named parameterized projections, projection parameter metadata, and projection plan export.
- Projection plan and projection parameter assertions in `AstraFlow.Testing`.
- Analyzer package foundation with stable `AFAN` rule IDs and source-only analyzer assets.
- Mediator analyzers for missing handlers, duplicate handlers, ambiguous request contracts, missing stream handlers, and singleton handler lifetime risks.
- Mapper and projection analyzers for undeclared mapping rules, reverse sensitive writes, raw public IDs, mapper calls inside query expressions, custom projection methods, and complex projection captures.

Missing for MediatR-style parity:

- Behavior-order analyzer remains a later candidate.
- Generated registration for handlers, notifications, streams, processors, and exception-flow components.
- AOT/trimming-friendly generated registration sample.
- Migration guide and scanner from common mediator usage.

Missing for AutoMapper-style parity:

- Mapping plan diffing.
- Generated runtime mapping plans beyond the first generated metadata provider.
- Provider matrix expansion beyond the current SQLite baseline.
- Additional mapper/projection analyzer maturity beyond the first `1.8.2` warning set.
- Generated mapping/projection runtime fast paths beyond the first `1.8.4` metadata provider.
- Migration guide and scanner from common mapper usage.

Moved earlier:

- AutoMapper-style core parity.
- Convention mapping.
- Profiles/catalogs.
- Member configuration.
- Projection parameters.
- EF provider matrix.
- Analyzer essentials.
- Generator essentials.
- Mapping plan export.
- Diagnostics diffing.
- Migration scanner.
- Benchmarks.

Moved later:

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

## MediatR-Style Parity Checklist

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
| Failure policies | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Failure policy report | Failure policy tests |
| Parallel publishing | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Unsafe ordering warning docs | Parallel tests |
| Bounded parallel publishing | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Degree report | Bounded tests |
| Pipeline behaviors | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Behavior report | Pipeline tests |
| Behavior ordering | Done, expand | v1.4.x/v1.8 | `AstraFlow.Mediator` | P1 | Runtime report plus analyzer | Order tests |
| Short-circuiting | Done | v1.0.0 | `AstraFlow.Mediator` | P0 | Behavior report | Short-circuit tests |
| Stream requests | Done | v1.4.0 | `AstraFlow.Contracts` | P0 | Stream handler report | Stream tests |
| Stream pipeline behaviors | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Stream behavior report | Stream behavior tests |
| Pre-processors | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Processor report | Processor tests |
| Post-processors | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Processor report | Processor tests |
| Exception handlers | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Explicit handled-state report | Exception tests |
| Exception actions | Done | v1.4.0 | `AstraFlow.Mediator` | P1 | Always-rethrow docs | Rethrow tests |
| Essential analyzers | Done, expand | v1.8.0-v1.8.2 | `AstraFlow.Analyzers` | P0 | Stable rule IDs | Analyzer tests |
| Generated registrations | Done, expand | v1.8.3/v2 | `AstraFlow.Generators` | P0 | Generated metadata report | Generator tests |
| Migration guide/scanner | Done | v1.10 | `AstraFlow.Cli` | P1 | Suggestion report | Fixture tests |

## AutoMapper-Style Parity Checklist

| Required feature | Current status | Target version | Package | Priority | Diagnostics requirement | Test requirement |
| --- | --- | --- | --- | --- | --- | --- |
| Explicit object mapping | Done | v1.0.0 | `AstraFlow.Mapper` | P0 | Missing/duplicate mapping errors | Mapping tests |
| Declared mapping pairs | Done | v1.0.0 | `AstraFlow.Mapper` | P0 | Ownership report | Validation tests |
| Mapping startup validation | Done | v1.0.0 | `AstraFlow.Mapper` | P0 | Startup findings | Startup tests |
| Collection mapping | Done | v1.0.0 | `AstraFlow.Mapper` | P1 | Collection diagnostics | Collection tests |
| Explicit projections | Done | v1.2.0 | `AstraFlow.Mapper` | P0 | Projection report | Projection tests |
| EF Core projection validation | Done | v1.2.0 | `AstraFlow.Mapper.EntityFrameworkCore` | P0 | Provider findings | Provider tests |
| Convention mapping opt-in | Done | v1.5.0 | `AstraFlow.Mapper.Conventions` | P0 | Every member reported | Convention tests |
| Profiles/catalogs | Done | v1.5.0 | `AstraFlow.Mapper.Conventions` | P0 | Profile report | Profile tests |
| Include/ignore rules | Done | v1.5.0 | `AstraFlow.Mapper.Conventions` | P0 | Include/ignore report | Rule tests |
| Sensitive-field deny list | Done | v1.5.0 | `AstraFlow.Mapper.Conventions` | P0 | Security finding | Sensitive tests |
| Member configuration | Done | v1.5.1 | `AstraFlow.Mapper.Conventions` | P0 | Per-member diagnostics | Config tests |
| Null substitution | Done | v1.5.1 | `AstraFlow.Mapper.Conventions` | P1 | Member rule report | Null tests |
| Value converters | Done | v1.5.1 | `AstraFlow.Mapper.Conventions` | P1 | Converter report | Converter tests |
| Conditional mapping | Done | v1.5.1 | `AstraFlow.Mapper.Conventions` | P1 | Condition report | Condition tests |
| Nullable diagnostics | Done | v1.5.1 | `AstraFlow.Mapper.Conventions` | P0 | Nullable findings | Nullable tests |
| Numeric diagnostics | Done | v1.5.1 | `AstraFlow.Mapper.Conventions` | P0 | Numeric findings | Numeric tests |
| Constructor/record binding | Done | v1.5.2 | `AstraFlow.Mapper.Conventions` | P1 | Binding report | Binding tests |
| Existing destination mapping | Done | v1.5.2 | `AstraFlow.Mapper.Conventions` | P1 | Update report | Update tests |
| Flattening | Done | v1.6.0 | `AstraFlow.Mapper.Conventions` | P0 | Flattening report | Flattening tests |
| Unflattening | Done | v1.6.0 | `AstraFlow.Mapper.Conventions` | P0 | Domain-write findings | Unflattening tests |
| Reverse mapping | Done | v1.6.0 | `AstraFlow.Mapper.Conventions` | P0 | Explicit reverse report | Reverse tests |
| Projection parameters | Done | v1.7.0 | `AstraFlow.Mapper` | P0 | Parameter report | Parameter tests |
| EF provider matrix | Done, expand | v1.7.0/v1.7.x | `AstraFlow.Mapper.EntityFrameworkCore` | P0 | Provider findings | Provider tests |
| Mapping analyzers/generators | Done, expand | v1.8.2/v1.8.4/v2 | `AstraFlow.Analyzers`/`AstraFlow.Generators` | P0 | Rule IDs and metadata | Analyzer/generator tests |
| Migration guide/scanner | Done | v1.10 | `AstraFlow.Cli` | P1 | Suggestion report | Fixture tests |

## AstraFlow Differentiator Matrix

| Differentiator | Why it matters | Target version | Package/tooling | Evidence required before marketing claim |
| --- | --- | --- | --- | --- |
| Convention mapping disabled by default | Prevents hidden DTO leaks and silent member drift | v1.5.0 | `AstraFlow.Mapper.Conventions` | Tests proving convention mapping is opt-in |
| Sensitive-field deny list | Reduces accidental password/token/secret mapping | v1.5.0 | `AstraFlow.Mapper.Conventions` | Security tests and diagnostics examples |
| Mapping plan export | Makes automatic mapping inspectable | v1.5.x | Mapper/Diagnostics/CLI | Deterministic export tests |
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
| Explicit mapping | Done | v1.0.0 | P0 | `AstraFlow.Mapper` | AutoMapper-style problem domain | Missing/duplicate mapping diagnostics | Preserve |
| Convention mapping | Done | v1.5.0 | P0 | `AstraFlow.Mapper.Conventions` | AutoMapper-style | Opt-in and inspectable | Moved earlier |
| Member config | Done | v1.5.1 | P0 | `AstraFlow.Mapper.Conventions` | AutoMapper-style | Per-member diagnostics | Moved earlier |
| Destination/update mapping | Done | v1.5.2 | P1 | `AstraFlow.Mapper.Conventions` | AutoMapper-style | Sensitive write diagnostics | Moved earlier |
| Flattening/reverse/unflattening | Done | v1.6.0 | P0 | `AstraFlow.Mapper.Conventions` | AutoMapper-style | Explicit and security-gated | Moved earlier |
| Projections | Done, expand | v1.7 | P0 | `AstraFlow.Mapper` | AutoMapper-style query projection | Provider warnings | Moved earlier |
| Analyzers | Done, expand | v1.8.0-v1.8.2/v2 | P0 | `AstraFlow.Analyzers` | Compile-time parity | Stable rule IDs | Moved earlier |
| Generators | Done, expand | v1.8.3-v1.8.4/v2 | P0 | `AstraFlow.Generators` | AOT/trimming parity | Deterministic output | Moved earlier |
| Benchmarks | Done | v1.9 | P1 | `AstraFlow.Benchmarks` | Credible comparisons | Repeatable evidence | Moved earlier |
| CLI inspection | Done | v1.10 | P1 | `AstraFlow.Cli` | Adoption tooling | Redacted reports | Moved earlier |
| ASP.NET Core integration | Done | v1.11 | P1 | `AstraFlow.AspNetCore` | Common app integration | Dev-only diagnostics endpoint | After parity |
| FluentValidation integration | Done | v1.11 | P1 | `AstraFlow.FluentValidation` | Common validation flow | Validation diagnostics | After parity |
| Observability | Planned | v1.12 | P1 | `AstraFlow.OpenTelemetry` | Operational parity | No payload logging | After parity |
| Compatibility confidence | Planned | v1.13 | P1 | all | Adoption confidence | API diff and matrix | Before v2 expansion |
| Enterprise supply chain | Planned | v2.2 | P1 | CI/release | Enterprise review | SBOM/provenance/signing | Later |
| Ecosystem packages | Planned | v3 | P2 | optional packages | Broader app flow | No core dependency leaks | Later |
| Platform tooling | Planned | v4 | P2 | CLI/UI/docs | Differentiation | Redacted visual output | Later |

## Promote From Future Ideas Bank

Status: `Moved earlier`.

Promote into the main roadmap:

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

Keep outside the committed parity path until they pass design review:

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

These claims require evidence. Until that evidence exists, use precise wording such as `planned`, `supports common scenarios after version X`, `validated by package tests`, or `designed for`.

## Must-Have Before Public Promotion

Before claiming common MediatR-style replacement:

- `v1.4.x` stabilization completed.
- Stream cancellation and exception-flow hardening completed.
- Migration guide and before/after examples completed.
- Handler/notification/stream diagnostics completed.
- Clean sample consumer passes.

Before claiming common AutoMapper-style replacement:

- `v1.5.x` and `v1.6.0` completed.
- Convention mapping opt-in and tested.
- Mapping profiles/catalogs completed.
- Member configuration, include/ignore, null substitution, value converters, conditionals, constructor/record binding, immutable destination support, and existing destination mapping completed.
- Flattening, unflattening, and explicit reverse mapping completed.
- Sensitive-field deny list and mapping plan export completed.
- Migration examples compile.

Before claiming safer than common alternatives:

- Sensitive-field deny list completed.
- Secure DTO policy completed.
- Redaction policy completed.
- Analyzer coverage for raw public IDs and sensitive mapping completed.
- Threat model and secure defaults test suite completed.

Before claiming faster than common alternatives:

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

1. Baseline verification.
   - Restore, build, test, pack, and run package install verification.
   - Confirm `v1.0.0` through `v1.4.0` remain fixed history.

2. Patch hardening.
   - Implement `v1.4.x` stream cancellation/disposal tests.
   - Expand diagnostics for processor and exception-flow order.
   - Polish registration builder docs and troubleshooting.

3. Package boundary setup.
   - Create or design `AstraFlow.Mapper.Conventions`.
   - Keep explicit mapping unchanged in `AstraFlow.Mapper`.

4. `v1.5.0` APIs first.
   - Design profile/catalog model.
   - Design opt-in convention registration.
   - Design strict mode and mapping plan export shape.

5. `v1.5.0` tests first.
   - Write tests for exact matching, case-insensitive matching, include/ignore, unmapped members, ambiguity, sensitive fields, and mapping plan export.

6. `v1.5.1` member configuration.
   - Add fluent member configuration.
   - Add null substitution, converters, conditionals, enum validation, nullable diagnostics, and numeric diagnostics.

7. `v1.5.2` destination/update mapping.
   - Add constructor/record binding.
   - Add immutable destination support.
   - Add existing destination mapping and safe update policy foundation.

8. Docs alongside APIs.
   - Add convention mapping guide.
   - Add sensitive-field policy guide.
   - Add migration examples from common mapper usage.

9. Projection parity next.
   - Design projection parameter object model.
   - Add provider matrix tests.
   - Add projection plan export.

10. Compile-time checks next.
    - Implement analyzer foundation before generator work.
    - Implement generated registration before generated mapping optimization.

11. Benchmarks before claims.
    - Add benchmark project after parity surfaces exist.
    - Publish methodology before publishing performance claims.

12. Migration examples before promotion.
    - Build sample before/after mediator and mapper migrations.
    - Keep scanners suggestion-only.

## Acceptance Gates For The Whole Revised Roadmap

Status: `Required`.

- Package builds pass.
- Tests pass.
- Clean install verification passes.
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
- Optional integration dependencies do not leak into core packages.
- Convention mapping remains opt-in.
- Reverse mapping remains explicit.
- Security-sensitive mapping requires explicit allow rules.
