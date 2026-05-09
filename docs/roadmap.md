# Roadmap

## v1 Stable Core

- Request/response dispatch.
- Sequential notification publishing.
- Notification failure policies.
- Pipeline behaviors.
- Handler scanning.
- Duplicate and missing handler diagnostics.
- Explicit object mapping rules.
- Declared mapping validation.
- Collection mapping.
- Explicit projection helpers.
- Secure ID abstraction.
- NuGet metadata, XML docs, tests, samples, and MIT license.

## v1.x Optional Expansion Packages

- `AstraFlow.Mapper.Conventions`: opt-in property-name mapping, flattening, ignore rules, sensitive-field deny lists, and ambiguity detection.
- `AstraFlow.Mapper.Projection`: projection registry, provider-translatable validation, EF Core tests, and projection composition.
- `AstraFlow.Diagnostics`: startup reports for handlers, notifications, mappings, projections, and registration conflicts.
- Transition helpers for teams moving large existing applications to AstraFlow-owned contracts.

## v2 Superiority Layer

- Source-generated mappings and handler registration.
- Roslyn analyzers for missing handlers, duplicate handlers, unsafe DTO IDs, suspicious sensitive-field mapping, unsafe pipeline order, and non-translatable projections.
- OpenTelemetry activities and metrics hooks.
- Benchmarks covering handler dispatch, pipeline depth, notification fan-out, object mapping, collection mapping, projection overhead, and direct manual baselines.
- Package signing, SBOM, SourceLink, deterministic builds, API compatibility checks, security policy, and release automation.

## v3 Ecosystem

- ASP.NET Core endpoint helpers.
- EF Core projection helpers.
- FluentValidation behavior package.
- Testing harness and fake mediator.
- CLI inspection tool for handlers and mappings.
- Public docs website and migration assistant.
