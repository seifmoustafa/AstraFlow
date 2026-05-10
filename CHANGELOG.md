# Changelog

All notable AstraFlow changes are tracked here.

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
