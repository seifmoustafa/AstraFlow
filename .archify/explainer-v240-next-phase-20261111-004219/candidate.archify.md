# AstraFlow 2.4.0: what remains? {#phase-status}

The approved 2.4.0 source work and local release checks are complete. The maintainer chose to keep the branch local, so Phase 4 remote checks remain pending. Version 2.4.0 is still unpublished.

- Phase 1 established the runner-neutral `AstraFlow.Assertions` package and migrated AstraFlow's test projects.
- Phase 2 added inherited-property, nullable-scalar, positional-record, primary-constructor, and init-only generated mappings.
- Phase 3 passed the local build, tests, package, consumer, API, upgrade, and reproducibility gates.
- Local diff review passed. Phase 4 still needs hosted CI and remote SourceLink evidence before the release is ready.

@answer scope="Local branch evidence on 2026-11-11; hosted checks and publication are not included"
@meta locale=en quality_profile=showcase style=clean

## Which phases are complete?

@workflow id=release-phases title="AstraFlow 2.4.0 release phases"
| lane p1 | Phase 1: Assertions |
| lane p2 | Phase 2: Generated mapping |
| lane p3 | Phase 3: Local checks |
| lane p4 | Phase 4: Release readiness |
| assertions | Assertions | backend | p1 |
| mapping | Generated mapping | backend | p2 |
| local-checks | Local checks | backend | p3 |
| release-ready | Hosted readiness | external | p4 |
| assertions > mapping | implemented | |
| mapping > local-checks | 80 generator tests | |
| local-checks > release-ready | local gates pass | |

@steps id=phase-notes
| assertions | Assertions | Original runner-neutral API; package remains unpublished. | release-phases | assertions |
| mapping | Generated mapping | Supports inherited source properties, safe nullable flows, and positional/init-only destinations. | release-phases | mapping |
| local-checks | Local gates | Build, 313 tests, package and consumer checks, API checks, upgrade smoke, changelog, and reproducibility passed. | release-phases | local-checks |
| release-ready | Hosted readiness | Local diff review passed. Hosted CI and remote SourceLink await a remote review branch; publication remains separate. | release-phases | release-ready |

## What has passed locally?

| Gate | Evidence |
| --- | --- |
| Release build and tests | 0 warnings, 0 errors; 313 passed, 0 failed, 0 skipped; generator suite includes 80 tests and Assertions suite includes 24. |
| Package output | 16 packages packed; all 16 `.nupkg` and `.snupkg` pairs reproduce. |
| Package consumers | `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` compile cleanly; the package smoke runs inherited `Guid`/`DateTime` entity-to-positional-record mapping; standalone Assertions passes. |
| Compatibility | Public API baselines pass for 46 package/TFM combinations; 14 package APIs pass comparisons against both 2.0.0 and 2.3.0 where prior packages exist. |
| Upgrade | Clean `net10.0` consumers build and run against 2.0.0 and 2.3.0, then after upgrade to 2.4.0. |
| Tool and changelog | 2.4.0 CLI installs and inspects the repository; changelog validation passes. |

## What changes for an existing 2.3.0 app?

| Adoption choice | Expected project edits |
| --- | --- |
| Upgrade existing AstraFlow packages | Update the package versions already referenced, then restore, build, and run the application's tests. No source rewrite is expected for existing APIs. |
| Use AstraFlow assertions | Add `AstraFlow.Assertions` to the test project and change only tests that adopt its API. Production projects need no new dependency. |
| Use the new generated mapping shapes | Update only explicitly declared mapping methods that need inherited entity fields or immutable DTO construction. Existing mappings stay opt-in and do not switch automatically. |

## What remains before 2.4.0 can ship?

- [x] Review the complete local branch diff and confirm docs match the current code.
- [ ] Run hosted CI and remote SourceLink verification after the branch source exists remotely.
- [ ] Obtain separate release authorization before publication, then verify published packages with a clean consumer.

@callout level=warning title="Release status"
| Local package artifacts do not mean NuGet publication. Passing local checks does not prove zero defects or broad parity with another assertion library. |


