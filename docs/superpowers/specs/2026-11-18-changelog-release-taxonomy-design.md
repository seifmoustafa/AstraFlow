# Changelog Release Taxonomy Design

## Context

The portal currently uses release provenance as if it were release type. As a result, supported 2.4.x releases appear as “Feature Release” even when their changelog contains fixes or improvements. The user confirmed that release types should be classified from changelog content, with “Latest NuGet” remaining separate.

## Goals

- Derive the release category from substantive changelog sections.
- Keep publication state and release type as separate facts.
- Show 2.4.7 as the latest published NuGet suite and 2.4.6 as its previous release, following the user's release confirmation.
- Preserve the existing portal layout and changelog source of truth.

## Options considered

1. **Keep the current status-derived labels.** This is the least work, but it continues to call every non-major release a feature release and does not answer which releases contain fixes.
2. **Classify from changelog sections.** This follows the existing changelog, distinguishes provenance from content, and updates automatically as release notes change. This is the approved approach.
3. **Add a manually maintained release-type field to each changelog heading.** This makes labels explicit but duplicates information already present in Added, Fixed, Changed, and Security sections and can drift.

## Design

`status` describes provenance and lifecycle, such as Latest NuGet, published, historical, deprecated, or upcoming. A separate `releaseType` describes release content:

| Changelog signal | Release type |
| --- | --- |
| `x.0.0` version | Major |
| Substantive `Added` section | Feature |
| Substantive `Fixed` section | Bug Fix |
| Substantive `Changed` section | Improvement |
| Substantive `Security` section | Security |
| More than one content category | Mixed, with the contributing categories shown in the label |
| No substantive category sections | Maintenance |

An entry counts as substantive when it contains a changelog item other than the `None.` placeholder. Existing breaking-change and deprecation signals remain separate indicators. Historical and deprecated releases retain their lifecycle presentation while still having a content category.

The existing release filters and summary will expose the content categories. Facet counts may overlap for mixed releases, so summary wording will say “releases with features,” “with bug fixes,” and similar. “Latest NuGet” remains a provenance badge and is combined with the content type only where the UI presents both facts together.

No new page section, layout, or component is part of this change.

## Release metadata synchronization

Treat the user's confirmation as release-state authority for this change: set all 16 package entries to published version 2.4.7 dated 2026-11-18; set 2.4.6 as the previous published version; remove the upcoming qualifier from the 2.4.7 changelog heading; and update the portal and product documentation that identify the latest package version or installation pin.

## Acceptance criteria

- 2.4.7 is identified as Latest NuGet and classified as Bug Fix + Improvement.
- 2.4.6 is identified as a published Feature release.
- 2.4.1 and 2.4.3 classify as Feature + Bug Fix; 2.4.2 as Feature + Improvement.
- 2.4.x releases that contain substantive `Added` entries are no longer all presented as the same undifferentiated feature category when their sections show additional types.
- Category filters, counts, folio labels, and featured edition stamps use the new taxonomy while preserving provenance and archive behavior.
- Portal package metadata and synchronized documentation show 2.4.7 as current and 2.4.6 as previous.
- Portal typecheck, lint, and production build pass.

## Scope limits

This change does not redesign the portal, publish NuGet packages, change the release notes themselves, or merge the pull request.
