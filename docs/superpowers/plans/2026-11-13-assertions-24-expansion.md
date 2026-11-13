# AstraFlow 2.4.0 Assertions Expansion Implementation Plan

> **For agentic workers:** Use the appropriate execution skill to implement and review each independently verifiable slice. Steps use checkboxes for tracking.

**Goal:** Deliver the approved comprehensive, independent assertion and migration-tooling scope in 2.4.0.

**Architecture:** Keep general assertions in the standalone package, AstraFlow-specific helpers in `AstraFlow.Testing`, and project analysis in the CLI. Build a private behavior inventory before defining the full set of implementation slices; each slice adds its own tests, documentation and API evidence.

**Tech stack:** C#, .NET, xUnit, Roslyn for CLI semantic analysis, PowerShell release scripts, Next.js portal.

**Spec:** [2026-11-13-assertions-24-design.md](../specs/2026-11-13-assertions-24-design.md)

## Global constraints

- Target 2.4.0 on the existing PR branch; preserve the generated-mapping changes.
- Preserve `netstandard2.0`, `net8.0`, `net9.0` and `net10.0` for the core package, existing public behavior, and the absence of production package or runtime dependencies unless explicitly reviewed.
- Use original AstraFlow-owned implementation and product identity. Do not place reference names or namespaces in product text or dependencies.
- Every reference capability needs implementation and evidence or a specific maintainer-approved disposition before the comprehensive release gate.
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
- Private inventory and detailed per-family plans must not expose the reference identity in product content.

## Task 1: Inventory and compatibility contract

**Files:** Review the local reference source and tests, `src/AstraFlow.Assertions/`, its tests and `docs/api-baselines/AstraFlow.Assertions/`; create a private inventory outside public product content.

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

## Task 4: Object-graph equivalence

**Files:** Create focused graph comparison and options files in `src/AstraFlow.Assertions/`; add `tests/AstraFlow.Assertions.Tests/EquivalencyTests.cs`.

- [ ] Define exact APIs for member selection, ordering, custom comparers, recursion limit and cycle policy; integrate per-assertion options without changing global mutable settings.
- [ ] Test a nested mismatch path, ignored and selected members, record and polymorphic values, unordered/ordered collections, custom comparers, cycles and depth limits. Verify no sensitive values appear by default.
- [ ] Implement traversal and deterministic failure paths; run the Assertions test project in Release and review public API baselines.

## Task 5: Exceptions, async and scopes

**Files:** Extend existing action/function/exception assertion files; add focused async and scope files plus `tests/AstraFlow.Assertions.Tests/AsyncAndScopeTests.cs`.

- [ ] Define exact exception-chain, timeout, cancellation, async-stream and scope APIs and ownership semantics from the inventory.
- [ ] Test expected and unexpected exceptions, inner properties, an operation's own cancellation, caller cancellation, timeout, stream disposal and concurrent scopes with distinct settings.
- [ ] Implement and run the Assertions test project in Release. Confirm existing exception behavior and privacy regressions still pass.

## Task 6: Specialized assertions and extensibility

**Files:** Add capability-specific files under `src/AstraFlow.Assertions/` or reviewed optional packages; add `tests/AstraFlow.Assertions.Tests/SpecializedAssertionTests.cs` and relevant consumer projects.

- [ ] Define inventory-backed XML, stream, reflection, event, timing, formatting, subject identification, extension and language-integration APIs. Review any target or dependency that cannot fit the core package.
- [ ] Test malformed XML, stream position/disposal, missing metadata, event unsubscription/order, timing boundaries, custom formatter privacy and concurrent configuration. Add consumer tests for each integration.
- [ ] Implement, document and verify each capability independently; update baselines and package metadata. Record unresolved inventory rows for maintainer decision.

## Task 7: CLI migration analysis

**Files:** Modify `src/AstraFlow.Cli/Program.cs`; create focused analysis/report files under `src/AstraFlow.Cli/`; add tests and fixture projects under `tests/AstraFlow.Cli.Tests/`.

- [ ] Define `astraflow assertions analyze <path> --format text|json`; report schema version, file, line, classification and safe suggestion. Define exit codes 0 for successful analysis, 1 for usage or operational failure, and 2 for completed analysis with unsupported or unknown findings.
- [ ] Add fixture tests for a verified mapping, manual change, unsupported call, unrelated same-name method, unresolved symbol, incomplete project and secret-bearing literal. Verify JSON schema, file/line accuracy, exit codes and absence of literal values.
- [ ] Implement symbol-based resolution where possible. Unresolved calls are unknown; the command only reads source and does not rewrite it. Keep Roslyn dependencies isolated to the CLI.
- [ ] Run `dotnet test tests/AstraFlow.Cli.Tests/AstraFlow.Cli.Tests.csproj -c Release`; expect all tests to pass. Verify the packed tool against a clean consumer.

## Task 8: Integration, documentation and release gate

**Files:** Update README, `CHANGELOG.md`, `docs/assertions.md`, `docs/testing.md`, `docs/cli.md`, package selection, samples, API baselines and synchronized `portal/` content.

- [ ] Migrate representative test projects, including one transition with both assertion APIs. Build and run them from packed packages; document supported resolutions for ambiguous calls and semantic differences.
- [ ] Finish the inventory and obtain an explicit decision on each remaining exception. Update the changelog only for implemented, verified capabilities and remove stale release-status claims.
- [ ] Run `dotnet build AstraFlow.slnx -c Release`, `dotnet test AstraFlow.slnx -c Release`, `scripts/pack.ps1 -Configuration Release`, and applicable API, upgrade, reproducibility and SourceLink scripts after inspecting their parameters. Record SHA, commands and outcomes.
- [ ] From `portal/`, run `npm run typecheck`, `npx eslint . --max-warnings 0`, `npm run build` and `npm run test:e2e`; record outcomes. Review version, package, guide and changelog content for consistency.
- [ ] Review the complete diff and current PR head; run hosted checks on the final commit. Verify publication status independently. Obtain authorization before merge or package publication.

## Plan self-review and scope boundary

This is a master plan for several independent capability families. Task 1 must produce detailed, executable per-family plans after the full inventory; the current task descriptions are acceptance boundaries, not a claim that all signatures and edge cases have already been discovered. A family cannot start until its detailed plan states those decisions. The five review-focus cases are assigned to Tasks 3, 4, 5, 5 and 7 respectively. Automatic rewrites are outside the approved CLI acceptance gate.
