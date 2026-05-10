# Changelog

All notable AstraFlow changes are tracked here.

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
