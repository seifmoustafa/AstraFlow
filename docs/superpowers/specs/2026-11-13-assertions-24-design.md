# AstraFlow 2.4.0 Assertions Expansion Design

**Status:** The approved bounded 2.4.0 ship set is implemented and locally release-verified at `91206dd`; it remains unmerged and unpublished, and hosted checks for that head have not run. The CLI safely binds symbols for explicitly selected restored single-target projects; only exact, behavior-tested mappings are verified, while other matches remain manual or unknown. Deferred inventory rows are not 2.4.0 blockers or promises. Future assertion additions are separately tracked as candidates in the [v2.5 Assertions plan](../../plans/v2.5-assertions.md). The generated-mapping work remains part of the 2.4.0 release.

## Goal and release scope

Make `AstraFlow.Assertions` a practical, independently usable assertion package for application test suites. The 2.4.0 objective is the specifically approved and behavior-verified ship set, with AstraFlow-owned APIs and implementation—not comprehensive ecosystem parity. Similar method names alone do not establish equivalent behavior. A capability is complete only when its behavior, failure paths, supported targets, documentation and consumer use have been verified.

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

These families are a discovery taxonomy, not a promise that every item belongs in 2.4.0 or any later release. The 2.4.0 release boundary and verified surface are maintained in the [v2.4 Assertions plan](../../plans/v2.4-assertions.md). Unselected inventory items need an explicit disposition; any later implementation requires evidence, a bounded design and maintainer approval.

## Semantics and failure behavior

Use exact equality by default and require explicit options for alternate comparisons. Structural comparisons report the failing member path and expose only the selection, ordering, cycle and comparer options implemented in the approved ship set. Failure messages identify the assertion, failure and relevant path; sensitive values are omitted by default. Any future formatting or broader configuration API needs its own bounded design and must avoid shared mutable state. Define exception and null behavior consistently across supported targets.

Preserve current public behavior unless an incompatibility is reviewed and documented. If a future release adds per-assertion or per-scope configuration, it must not let shared mutable state interfere between concurrent tests. Migration documentation must explain semantic differences and resolution of ambiguous extension methods when both assertion APIs are present during a transition.

## CLI migration analysis

Provide `astraflow assertions analyze` as a read-only migration aid. It parses C# syntax and, for an explicitly selected restored single-target project, can bind symbols using safe compile metadata without evaluating project code. It reports relative source locations, omits expressions and literal values, flags incomplete analysis, and never changes files. Only exact symbol identities with behavior-backed tests receive a verified mapping; other bound matches remain manual and unresolved calls remain unknown. Keep output safe for local use and CI; reports must not contain test values or secrets.

Automatic rewriting is a later slice and requires demonstrated behavior preservation for every supported rewrite; it is not an acceptance condition for the analysis command.

## Evidence and release gates

- For the bounded 2.4.0 ship set, record API behavior, semantic differences, target frameworks, success and failure tests, and consumer evidence. Every unselected inventory item must have a disposition; none is counted as supported based on a name match.
- Exercise positive, negative, null, boundary, concurrency, cancellation, cycle, ordering and disposal cases as relevant. Test failure paths and privacy defaults, not just successful calls.
- Build and test every advertised target; verify public API baselines, compatibility, package assets, dependency boundaries, reproducibility and clean package consumers.
- Migrate representative existing test projects. They must compile and pass; ambiguous calls and behavior differences must have documented resolutions.
- Verify CLI analysis on representative and incomplete projects, including unresolved symbols, reports, exit codes and privacy.
- Synchronize README, API guides, package selection, samples, changelog and portal product content with verified behavior. Preserve the portal's approved design and follow its brainstorming gate for new UI or UX changes. Run the repository's required portal checks after the final portal edits.
- Update the 2.4.0 changelog for implemented and verified ship-set behavior. Re-run the release and hosted PR gates on the final commit. Publishing and merging require their own authorization.

## Claim boundaries

Do not claim universal compatibility, superiority, zero defects or performance advantages from API similarity or a passing test suite. Any performance claim requires reproducible, comparable measurements. Publication status must be established independently from source version and local package output.
