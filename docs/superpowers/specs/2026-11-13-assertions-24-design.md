# AstraFlow 2.4.0 Assertions Expansion Design

**Status:** Design approved; implementation is in progress. Numeric/temporal and the initial assertion-family slices are implemented and verified on the package targets. The read-only CLI now binds locally declared symbols using host framework metadata, with explicit partial results when project context is unavailable; project metadata, verified migration mappings and full classification remain open. Remaining capability families, complete inventory reconciliation, final portal synchronization and the full release gate are still open. The maintainer confirmed that 2.4.0 is not published or merged. The existing assertion foundation and generated-mapping work remain part of the release.

## Goal and release scope

Make `AstraFlow.Assertions` a practical general-purpose assertion package for application test suites. The 2.4.0 objective is comprehensive coverage of the approved capability set, with AstraFlow-owned APIs and implementation. Similar method names alone do not establish equivalent behavior. A capability is complete only when its behavior, failure paths, supported targets, documentation and consumer use have been verified.

Maintain a private capability inventory that maps every identified capability to an AstraFlow API, behavior and evidence. Keep external product names and namespaces out of AstraFlow product text and dependencies. If a capability cannot reasonably fit package boundaries or the release, present that specific exception to the maintainer for a decision; do not silently defer it or claim complete coverage.

## Package boundaries

- `AstraFlow.Assertions` owns general assertions and works without AstraFlow runtime packages or a specific test runner. Preserve the existing target frameworks and public APIs; use additive changes where possible.
- `AstraFlow.Testing` owns helpers for testing AstraFlow mediator, pipeline, mapping, projection, diagnostics and security behavior. Any new dependency between packages must have an explicit reviewed contract.
- `AstraFlow.Cli` owns project inspection and migration reports. The core assertions package does not depend on the CLI or Roslyn.
- The existing 2.4.0 generated-mapping changes, documentation and release work remain in scope.

## Capability phases

1. **Values:** nullable values, numeric boundaries and precision, dates, offsets, times and durations, alongside existing equality, identity, boolean, string, enum and GUID checks.
2. **Collections:** ordering, membership, equivalence, dictionaries, item assertions, duplicate behavior and one-shot enumeration.
3. **Object graphs:** structural equivalence, nested mismatch paths, member selection, ordering, polymorphism, cycle handling, recursion limits and custom comparers.
4. **Exceptions and async:** sync and async exceptions, inner exceptions and properties, cancellation, completion, timeouts and async streams. Define ownership of cancellation and timeouts explicitly.
5. **Specialized assertions:** XML, streams, reflection and type metadata, events and execution time, with platform-specific integrations isolated where required.
6. **Authoring:** assertion scopes, configuration, formatting, source/subject identification and extension points, including concurrent use.

The implementation plan will break these families into independently verifiable slices. The inventory must also identify additional capabilities not listed above, including supported language and framework integrations; each requires implementation and evidence or a maintainer-approved disposition.

## Semantics and failure behavior

Use exact equality by default and require explicit options for alternate comparisons. Structural comparisons report the failing member path and expose clear options for selection, ordering, cycles and custom rules. Failure messages identify the assertion, failure and relevant path; sensitive values are omitted by default, with explicit formatting options for teams that choose to expose detail. Define formatting, exception and null behavior consistently across supported targets.

Configuration must support per-assertion and per-scope customization without shared mutable state causing interference between concurrent tests. Preserve current public behavior unless an incompatibility is reviewed and documented. Migration documentation must explain semantic differences and resolution of ambiguous extension methods when both assertion APIs are present during a transition.

## CLI migration analysis

Provide `astraflow assertions analyze` for a solution or test project. The initial implementation parses C# syntax, reports relative source locations and method-name candidates, omits expressions/literal values, flags parse errors and never changes files. It does not yet resolve projects, receiver types or overloads; it marks every candidate for review and makes no equivalence claim. The completed CLI phase must use C# symbols where available, classify verified equivalents/manual/unsupported/unknown cases, report unresolved calls as unknown, and document incomplete-project behavior. Keep output safe for local use and CI. Reports must not contain test values or secrets.

Automatic rewriting is a later slice and requires demonstrated behavior preservation for every supported rewrite; it is not an acceptance condition for the analysis command.

## Evidence and release gates

- Inventory every identified capability and record API, semantic differences, target frameworks, success and failure tests, and consumer evidence. No unapproved gaps at the comprehensive-release gate.
- Exercise positive, negative, null, boundary, concurrency, cancellation, cycle, ordering and disposal cases as relevant. Test failure paths and privacy defaults, not just successful calls.
- Build and test every advertised target; verify public API baselines, compatibility, package assets, dependency boundaries, reproducibility and clean package consumers.
- Migrate representative existing test projects, including a transition with both assertion APIs present. They must compile and pass; ambiguous calls and behavior differences must have documented resolutions.
- Verify CLI analysis on representative, incomplete and unbuildable projects, including unresolved symbols, reports, exit codes and privacy.
- Synchronize README, API guides, package selection, samples, changelog and portal product content with verified behavior. Preserve the portal's approved design and follow its brainstorming gate for new UI or UX changes. Run the repository's required portal checks after the final portal edits.
- Update the 2.4.0 changelog as work is implemented and verified. Re-run the release and hosted PR gates on the final commit. Publishing and merging require their own authorization.

## Claim boundaries

Do not claim universal compatibility, superiority, zero defects or performance advantages from API similarity or a passing test suite. Any performance claim requires reproducible, comparable measurements. Publication status must be established independently from source version and local package output.
