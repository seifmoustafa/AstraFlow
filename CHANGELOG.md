# Changelog

All notable AstraFlow changes are tracked here.

## 1.3.0

- Added `AstraFlow.Testing` as a framework-neutral testing package.
- Added fake sender, fake publisher, and fake mediator helpers with request and notification recording.
- Added handler, notification handler, and pipeline test harnesses.
- Added mediator, mapper, projection, diagnostics, exception, mapping-rule, and secure ID assertion helpers.
- Added deterministic `TestSecureIdCodec` for test-only secure ID round trips.
- Kept the testing package free from xUnit, NUnit, MSTest, FluentAssertions, and mocking-framework dependencies.
- Shipped `AstraFlow.Testing` assets for `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`.
- Updated CI, publish, pack, and clean-install verification to include `AstraFlow.Testing`.

## 1.2.3

- Added `scripts/verify-package-install.ps1` to install packed packages into clean external consumer projects.
- Verified core packages in `netstandard2.0`, `net8.0`, and `net9.0` consumer projects.
- Verified all packages, including `AstraFlow.Mapper.EntityFrameworkCore`, in a `net10.0` consumer project.
- Wired clean package install verification into local packing, CI, and the publish workflow.
- Updated release documentation so target-framework support must be proven by automated package install checks.

## 1.2.2

- Added real multi-target support for `AstraFlow`, `AstraFlow.Mediator`, `AstraFlow.Mapper`, and `AstraFlow.Diagnostics`.
- Core packages now ship `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` assets.
- Kept `AstraFlow.Mapper.EntityFrameworkCore` on `net10.0` because it follows the EF Core 10 package line.
- Replaced newer runtime helper APIs in core source with compatibility-safe equivalents where needed.
- Added the `System.Text.Json` package dependency for the `netstandard2.0` diagnostics asset.
- Updated compatibility, release, publishing, and package-selection docs for the actual published target frameworks.

## 1.2.1

- Added compatibility guidance for current `net10.0` support and future multi-target expansion.
- Added package selection guidance for choosing the meta package or focused packages.
- Added release checklist gates for target framework verification, package dependency review, and clean install smoke tests.
- Documented compatibility audit findings for future `netstandard2.0`, `net8.0`, `net9.0`, and direct legacy framework support.
- Updated package release notes for the compatibility and adoption hardening release.
- No runtime behavior changes.

## 1.2.0

- Added projection registry support with deterministic unnamed and named projection lookup.
- Added `INamedProjection<TSource, TDestination>` for explicit multiple projection shapes per source/destination pair.
- Added projection validation with warning-by-default findings for duplicate projections, null expressions, mapper calls, custom method calls, non-deterministic values, complex closure captures, and unsupported construction risks.
- Added diagnostics integration for projection names and projection validation findings.
- Added optional `AstraFlow.Mapper.EntityFrameworkCore` package with EF Core relational translation validation helpers.
- Added SQLite EF Core integration tests and expanded projection registry tests.

## 1.1.0

- Added `AstraFlow.Diagnostics` with framework-neutral registration reports for request handlers, notification handlers, pipeline behaviors, mapping rules, and projections.
- Added severity-coded findings, including duplicate request handlers, ambiguous request contracts, missing request handlers, singleton lifetime warnings, and mapper catalog validation failures.
- Added in-memory diagnostics reports, camelCase JSON output, Markdown output, and a health-check-ready summary object.
- Added diagnostics tests, a diagnostics sample, CI packing, publishing workflow support, and documentation.

## 1.0.1

- Hardened mediator dispatch so request types that implement multiple `IRequest<TResponse>` contracts fail with a clear diagnostic instead of choosing an arbitrary response type.
- Hardened mediator registration with null service checks, null marker-type tolerance, and partial assembly-load tolerance during scanning.
- Clarified mediator registration options documentation and fixed small XML documentation polish issues.
- Documented the `net10.0` target and current .NET support window.
- Expanded and packaged public documentation with API reference tables, architecture notes, mediator scenarios, mapper scenarios, troubleshooting, and publishing guidance for community consumption.

## 1.0.0

- Added `AstraFlow.Mediator` with request dispatch, notification publishing, pipeline behaviors, assembly scanning, duplicate handler detection, missing handler diagnostics, and optional handler coverage validation.
- Added `AstraFlow.Mapper` with explicit mapping rules, declared mapping validation, collection mapping, explicit query projection helpers, and secure ID abstractions.
- Added `AstraFlow` convenience registration package.
- Added package tests, integration tests, samples, NuGet metadata, XML documentation, symbols, SourceLink-ready metadata, and MIT license.
