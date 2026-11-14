# AstraFlow 2.4.0 Assertions Expansion Implementation Plan

> **For agentic workers:** Use the appropriate execution skill to implement and review each independently verifiable slice. Steps use checkboxes for tracking.

**Goal:** Deliver a bounded, release-ready general-purpose assertions core and conservative migration-analysis tool in 2.4.0, with an exhaustive capability inventory that assigns remaining breadth to explicit later phases.

**Architecture:** Keep general assertions in the standalone package, AstraFlow-specific helpers in `AstraFlow.Testing`, and project analysis in the CLI. Build a private behavior inventory before defining the full set of implementation slices; each slice adds its own tests, documentation and API evidence.

**Tech stack:** C#, .NET, xUnit, Roslyn for CLI semantic analysis, PowerShell release scripts, Next.js portal.

**Spec:** [2026-11-13-assertions-24-design.md](../specs/2026-11-13-assertions-24-design.md)

## Global constraints

- Target 2.4.0 on the existing PR branch; preserve the generated-mapping changes.
- Preserve `netstandard2.0`, `net8.0`, `net9.0` and `net10.0` for the core package, existing public behavior, and the absence of production package or runtime dependencies unless explicitly reviewed.
- Use original AstraFlow-owned implementation and product identity. Do not place external product names or namespaces in product text or dependencies.
- Every inventoried capability needs implementation and evidence for 2.4.0, or a specific maintainer-approved deferral/rejection before the release gate. Inventory completeness does not mean full capability parity must ship in 2.4.0.
- 2.4.0 must be coherent and useful for ordinary .NET test projects: common value, collection/dictionary, object comparison, exception/async, safe diagnostic, authoring, and conservative migration-review workflows. An item belongs to the 2.4.0 ship set only when it is advertised in release documentation and passes its evidence gate.
- Keep 2.4.x patch releases for compatible fixes and hardening; schedule new backward-compatible public assertion capabilities for a later 2.x minor release, starting at 2.5.0 unless release policy is deliberately revised.
- Keep values out of failure messages and CLI reports by default; configuration and scopes must be safe for concurrent tests.
- Preserve current portal design and apply its collaborative design gate before any new UI or UX work.

## Review focus

1. One-shot enumerables: a failed collection assertion must not silently enumerate the subject twice.
2. Cyclic or very deep graphs: comparison must terminate with a deterministic path or depth failure.
3. Parallel scopes: failure collection and formatting options must not leak between concurrent tests.
4. Timed or cancelled async work: distinguish cancellation, timeout and an operation's own exception without abandoning ownership silently.
5. Partially compilable projects: CLI findings with unresolved symbols must be unknown, never a guessed migration match.

## File ownership and decomposition

- `src/AstraFlow.Assertions/`: value, collection, graph, async, specialized and authoring APIs; keep related behavior in focused files.
- `tests/AstraFlow.Assertions.Tests/`: behavior and failure tests grouped by capability, retaining existing regression tests.
- `src/AstraFlow.Testing/` and its tests: AstraFlow-specific helpers only.
- `src/AstraFlow.Cli/` and `tests/AstraFlow.Cli.Tests/`: command routing, semantic inspection and report contracts.
- `docs/api-baselines/`, `docs/assertions.md`, `docs/testing.md`, `docs/cli.md`, `samples/`, README, changelog and `portal/`: public contract, examples and synchronized product content.
- Private inventory and detailed per-family plans must not expose external implementation identities in product content.

## Task 1: Inventory and compatibility contract

**Files:** Reconcile the approved private capability inventory with `src/AstraFlow.Assertions/`, its tests and `docs/api-baselines/AstraFlow.Assertions/`; keep detailed inventory material outside public product content.

- [ ] Enumerate every assertion entry point, capability, configuration, integration and target-framework condition. Record source area, expected behavior, failure behavior, AstraFlow status and evidence for each row.
- [ ] Record the current public API and the 24 existing assertion test cases as the baseline. Identify source and behavioral compatibility hazards, including ambiguous extension methods during migration.
- [ ] Split the inventory into independently testable plans for values, collections, graph comparison, async/exception behavior, specialized integrations, authoring and CLI. Each plan must specify exact public signatures, file paths, tests and target-specific behavior before implementation. Route any proposed exception to the maintainer.
- [ ] Review the inventory for missing families and make it the release gate; do not count matching names as behavioral coverage.

## Task 2: Values and temporal assertions

**Files:** Add focused value assertion files under `src/AstraFlow.Assertions/`; extend `AssertionExtensions.cs`; add `tests/AstraFlow.Assertions.Tests/ValueAssertionTests.cs` and update the four API baselines and assertion guide.

- [ ] Specify exact APIs and expected messages from Task 1 for nullable values, numeric ranges and tolerances, dates, offsets, times and durations.
- [ ] Add positive and failure tests including null, boundary, negative tolerance, NaN/infinity, overflow, precision and offset cases. Assert that secret values are omitted by default.
- [ ] Implement the approved API without changing existing overload resolution or dependency boundaries.
- [ ] Run `dotnet test tests/AstraFlow.Assertions.Tests/AstraFlow.Assertions.Tests.csproj -c Release`; expect all tests to pass. Build each advertised target and review API baseline changes.

## Task 3: Collections and dictionaries

**Files:** Extend `CollectionAssertions.cs` and `DictionaryAssertions.cs` or introduce focused companion files; add `tests/AstraFlow.Assertions.Tests/CollectionExpansionTests.cs`.

- [ ] Specify ordering, membership, multiset/equivalence, dictionary and item assertion semantics from the inventory.
- [ ] Test duplicate handling, empty/null subjects, order differences, lazy and one-shot enumerables, disposal and failure messages. Include a subject that throws if enumerated a second time.
- [ ] Implement the approved APIs and update XML documentation, API baselines and examples. Run the Assertions test project in Release and expect a clean pass.

Verified slices in this task (the collections/dictionaries family remains in progress):

- [x] Null-aware sequence count/order/uniqueness/multiset/callback/consecutive assertions with focused one-shot and failure-path tests.
- [x] Batch sequence membership with one-pass subject enumeration, duplicate expected-item presence semantics, and null/empty behavior.
- [x] Dictionary and key-value-pair sequence assertions for keys, values, empty state, and count relationships; dictionary subjects use their own key comparer and key-value-pair sequences are enumerated at most once.
- [x] Exact runtime-type and assignability assertions for sequence items, with generic typed chaining, `Type` overloads, represented-type handling, null/empty coverage, safe failures, and one-shot enumeration/disposal tests; add indexed item selection with a verified `Which` value and one-pass behavior. All 268 Assertions tests pass on net10.0, the package builds on all four targets without warnings, the public API baseline passes for 62 package/target combinations, and local package `2.4.0-c54-local` builds a fresh four-target consumer and passes a net10 runtime smoke check.
- [x] Add enumerable expected-sequence overloads and negative ordered/consecutive containment assertions with null, empty, duplicate, one-shot, disposal, and safe-failure cases; validate those APIs from the freshly packed c54 consumer.
- [x] Add ascending and descending key-order assertions with optional comparers, one selector call per item, tie support, safe index-only failures, and fresh-package compile/runtime coverage.
- [x] Add structural-equivalency containment, negative containment, and all-item checks with per-call graph options, returned matched-item access, one-pass outer enumeration, shared nested snapshots, safe mismatch paths, and empty/null behavior.
- [x] Add order-independent dictionary `Equal`/`NotEqual` checks for unique expected key-value pairs, with default key/value comparers, one-pass expected enumeration, duplicate-key validation, null handling, and value-safe failures; validate the packed c54 API from compile-time and runtime consumers.
- [x] Add full read-only dictionary assertions through the ordinary `Should()` entry point for key-value-pair sequences; preserve subject key comparers for dictionary lookups, add mapping/count/value chaining and safe failures, and verify a clean packed consumer across all four target frameworks plus a net10 runtime smoke check. The final standard `.Should()` overload passes the 276/276 package suite, four-target Release build, 62 API-baseline combinations, and local c58 compile/runtime consumer checks.
- [x] Add async negative ordered and consecutive containment with one-pass expected/subject enumeration, cancellation forwarding, enumerator disposal, and privacy-safe failure messages; focused match/miss, null, empty, and cancellation cases pass in the 272/272 suite.
- [x] Add ordered collection prefix/suffix assertions for `params` and enumerable expectations with optional equality comparers, null/empty semantics, one-pass reads, disposal, and value-safe failures; focused cases include short subjects, mismatch positions, one-shot enumerables, comparer behavior, empty input, and producer exceptions.
- [x] Add `HaveElementPreceding` and `HaveElementSucceeding` checks for the immediate neighbor of the first matching pivot, using default equality, one-pass early stopping, disposed enumerators, and value-safe failures. Focused tests pass 6/6, the full Assertions suite passes 287/287, the package builds all four targets with zero warnings/errors, API baselines pass 62 combinations, and a packed `2.4.0-c63-local` consumer builds all four targets and passes net10 runtime smoke.
- [ ] Close the remaining collection inventory cases.

## Task 4: Object-graph equivalence

**Files:** Create focused graph comparison and options files in `src/AstraFlow.Assertions/`; add `tests/AstraFlow.Assertions.Tests/EquivalencyTests.cs`.

- [ ] Define exact APIs for member selection, ordering, custom comparers, recursion limit and cycle policy; integrate per-assertion options without changing global mutable settings.
- [ ] Test a nested mismatch path, ignored and selected members, record and polymorphic values, unordered/ordered collections, custom comparers, cycles and depth limits. Verify no sensitive values appear by default.
- [ ] Implement traversal and deterministic failure paths; run the Assertions test project in Release and review public API baselines.

Verified initial slice (the graph family remains in progress):

- [x] Compare public readable properties across differing DTO types, ordered sequences, and dictionaries with subject comparer lookups.
- [x] Add value-safe first mismatch paths, cycle-pair tracking, per-call property-name exclusions, and a bounded maximum depth.
- [x] Add per-call type/path comparers, configurable ordered/unordered sequence matching, and opt-in public instance field comparison; field tests cover inheritance, exclusions, static-field omission, and safe mismatch paths.
- [x] Add path-based selected-member rules, missing-path failures, and safe focused tests; broader graph edge-case coverage remains open.

## Task 5: Exceptions, async and scopes

**Files:** Extend existing action/function/exception assertion files; add focused async and scope files plus `tests/AstraFlow.Assertions.Tests/AsyncAndScopeTests.cs`.

- [ ] Define exact exception-chain, timeout, cancellation, async-stream and scope APIs and ownership semantics from the inventory.
- [ ] Test expected and unexpected exceptions, inner properties, an operation's own cancellation, caller cancellation, timeout, stream disposal and concurrent scopes with distinct settings.
- [ ] Implement and run the Assertions test project in Release. Confirm existing exception behavior and privacy regressions still pass.

Verified exception slice (Task 5 remains in progress):

- [x] Add synchronous and asynchronous `ArgumentException` parameter-name checks with ordinal case-insensitive matching, input validation, and failure messages that omit both names. Verify direct chaining after `Throw<TException>()` and `ThrowAsync<TException>()` with positive, negative, mismatch, and invalid-input cases.
- [x] Add generic task-completion-source assertions on all package targets and non-generic source assertions where the framework provides the type. Cover timed success/failure, result capture, non-completion, source-fault propagation, timeout validation, cancellation ownership, and null subjects.
- [x] Add typed reference-subject property selection with nested property paths. Reject fields, indexers, static members, and method calls before execution; test single evaluation, null/type mismatch, safe failure output, and original getter exceptions.
- [x] Add async-sequence full-enumeration `NotThrowAsync` with caller-cancellation propagation, safe failure messages, and enumerator disposal. The complete Assertions test suite now passes 257/257 on net10.0 when VSTest has local loopback IPC access.

## Task 6: Specialized assertions and extensibility

**Files:** Add capability-specific files under `src/AstraFlow.Assertions/` or reviewed optional packages; add `tests/AstraFlow.Assertions.Tests/SpecializedAssertionTests.cs` and relevant consumer projects.

- [ ] Define inventory-backed XML, stream, reflection, event, timing, formatting, subject identification, extension and language-integration APIs. Review any target or dependency that cannot fit the core package.
- [ ] Test malformed XML, stream position/disposal, missing metadata, event unsubscription/order, timing boundaries, custom formatter privacy and concurrent configuration. Add consumer tests for each integration.
- [ ] Implement, document and verify each capability independently; update baselines and package metadata. Record unresolved inventory rows for maintainer decision.

Verified initial XML slice (Task 6 remains in progress):

- [x] Add namespace-aware `XDocument` root/direct-child checks and `XElement` child/attribute/text checks. Failures omit XML values; tests cover namespaces, negative assertions, nulls and invalid names.
- [x] Add document and element structural equivalency; test null pairs, namespace-prefix and unused-declaration handling, child ordering, attribute order, text/CDATA, comments, processing instructions, document types, and safe failures.
- [x] Add non-consuming HTTP response status and response/content-header assertions with exact value comparisons; test status boundaries, case-insensitive header names, value redaction, and no body reads.
- [x] Add explicit standard-event monitoring for generic and non-generic event handlers, `INotifyPropertyChanged` helpers, ordered occurrence capture, exact-count and negative assertions, safe diagnostics, concurrent raises, duplicate registration checks, and disposal with best-effort removal of every handler.
- [x] Expand stream assertions with read-only/write-only checks, negative length/position checks, and buffered-stream size checks on targets that expose `BufferedStream.BufferSize`; verify no reads, seeks, position changes, or disposal.
- [x] Add exact stream byte-content equality and inequality using a fixed 4 KiB buffer, restore seekable stream positions on success and failure, document consumption for non-seekable streams, and cover privacy, short reads, trailing content, disposal and I/O propagation. The full Assertions suite now passes 250/250; package `2.4.0-c50-local` compiles across all four targets and passes a net10 runtime smoke check for the current collection APIs.
- [x] Add one-run synchronous/asynchronous delegate and subject-method execution-time measurement returning `TimeSpan`; test exactly-once invocation, completion, exception identity, null handling, and composition with ordinary duration assertions.
- [x] Add direct current-state XML reader assertions without advancing, closing or disposing caller-owned readers; whole-reader comparison remains a separate consuming API decision.
- [x] Add a typed custom-delegate adapter for event monitoring, preserving arbitrary payloads in occurrence snapshots while omitting them from failure messages; verify factory failure releases its event registration.
- [ ] Continue with broader timing and authoring capabilities.
- [x] Add deferred `Invoking`, `Awaiting`, and `Enumerating` helpers for static and subject delegates, `Task`/`ValueTask` operations, and lazy generic/non-generic iterators; verify deferred invocation, exception identity, null validation, and iterator disposal.
- [x] Keep `ValueTask` subject overloads out of the `netstandard2.0` asset without adding a package dependency; document their `net8.0+` availability and compile a fresh packed consumer across all four target frameworks. Local package `2.4.0-c57-local` also passes a net10 runtime smoke.

## Task 7: CLI migration analysis

**Files:** Modify `src/AstraFlow.Cli/Program.cs`; create focused analysis/report files under `src/AstraFlow.Cli/`; add tests and fixture projects under `tests/AstraFlow.Cli.Tests/`.

- [x] Define `astraflow assertions analyze <path> --format text|json`; emit a versioned report with relative source, one-based line/column, classification and safe suggestion. Exit 1 for usage/operational errors and 2 for partial or review-required analysis. A complete-analysis exit 0 remains reserved for a future complete project context.
- [x] Add fixtures for bound assertion-like calls, unrelated bound `Should()` methods, local assertion variables, unresolved chains, syntax errors, conditional directives and secret-bearing literals. Verify JSON/text shape, source locations, exit codes, and no source edits or literal leakage.
- [x] Resolve source declarations with Roslyn and host framework metadata; unrelated bound methods are skipped and unresolved calls remain unknown. For an explicitly selected single-target project, read existing package compile assets only as metadata, without evaluating imports/properties or executing MSBuild, restore, targets, generators, scripts, or inspected project code. Keep Roslyn dependencies isolated to the CLI.
- [ ] Expand behavior-backed verified/unsupported mapping rows after private inventory review and semantic tests; verify the packed tool against a clean consumer.

Initial verified milestone (Task 7 remains in progress):

- [x] Add a read-only Roslyn syntax scan for C# `.Should()` chains, relative locations, same-name candidate hints, parse-error warnings, privacy-safe output, and exit codes 0/1/2. Unit tests prove comments/string literals are ignored and source files are not modified.
- [x] Pack and install local CLI tool `2.4.0-c23-local`; run it against an XML assertion fixture and confirm it returns exit 2 with three review-required candidates while omitting XML literal values.
- [x] Pass the CLI test project with 22/22 tests on net10.0.
- [x] Add a metadata-only Roslyn milestone: bound manual candidates, unrelated-method exclusion, unresolved-unknown classification, syntax/conditional incompleteness, local-variable chains, deterministic safe reports, and explicit text/json formats; CLI tests now pass 26/26 on net10.0.
- [x] Add safe interpretation of a selected single literal target framework and existing package compile assets only from project/restore metadata; verify unrelated `Should` exclusion, declaration binding, a no-target-execution marker, safe report output, and a reviewed one-argument ordinal string `Be`/`NotBe` mapping that requires the exact source assembly and symbol identity. Lookalike methods remain manual; CLI tests pass 29/29 on net10.0.
- [ ] Expand the mapping catalog from private inventory evidence; keep each unmapped call manual until its source identity and behavior are verified.
- [x] Pack and install the CLI as `2.4.0-c61-local`; analyze a restored clean consumer project and confirm lookalikes remain manual, literals are redacted, output is partial, and exit code 2 is preserved.

## Task 8: Integration, documentation and release gate

**Files:** Update README, `CHANGELOG.md`, `docs/assertions.md`, `docs/testing.md`, `docs/cli.md`, package selection, samples, API baselines and synchronized `portal/` content.

- [ ] Migrate representative test projects, including one transition with both assertion APIs. Build and run them from packed packages; document supported resolutions for ambiguous calls and semantic differences.
- [ ] Finish the inventory and obtain an explicit decision on each remaining exception. Update the changelog only for implemented, verified capabilities and remove stale release-status claims.
- [ ] Run `dotnet build AstraFlow.slnx -c Release`, `dotnet test AstraFlow.slnx -c Release`, `scripts/pack.ps1 -Configuration Release`, and applicable API, upgrade, reproducibility and SourceLink scripts after inspecting their parameters. Record SHA, commands and outcomes.
- [ ] From `portal/`, run `npm run typecheck`, `npx eslint . --max-warnings 0`, `npm run build` and `npm run test:e2e`; record outcomes. Review version, package, guide and changelog content for consistency.
- [ ] Review the complete diff and current PR head; run hosted checks on the final commit. Verify publication status independently. Obtain authorization before merge or package publication.

## Plan self-review and scope boundary

This is a master plan for several independent capability families. Task 1 must produce an exhaustive inventory and classify each row for 2.4.0 or a follow-on phase; produce detailed, executable API plans for the 2.4.0 ship set. The current task descriptions are acceptance boundaries, not a claim that all signatures and edge cases have already been discovered. A 2.4.0 slice cannot start until its exact contract is specified. The five review-focus cases are assigned to Tasks 3, 4, 5, 5 and 7 respectively. Automatic rewrites are outside the approved CLI acceptance gate.
