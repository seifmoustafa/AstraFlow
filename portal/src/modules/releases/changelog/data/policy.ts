import {
  KNOWN_RELEASE_DATES,
  LATEST_PUBLISHED_DATE,
  LATEST_PUBLISHED_VERSION,
  SUPPORTED_MIN_MAJOR,
} from '@core/config/site-config';
import type {
  ChangelogRelease,
  ReleaseLifecyclePolicy,
  ReleaseProvenanceStatus,
  SemverVersion,
} from './model';

export const DEFAULT_MAX_FEATURED_CARDS = 6;

export const DEFAULT_RELEASE_LIFECYCLE_POLICY: ReleaseLifecyclePolicy = {
  supportedMinMajor: SUPPORTED_MIN_MAJOR,
  latestPublishedVersion: LATEST_PUBLISHED_VERSION,
  latestPublishedDate: LATEST_PUBLISHED_DATE,
  knownReleaseDates: KNOWN_RELEASE_DATES,
};

export function parseSemver(version: string): SemverVersion | null {
  const match = version
    .trim()
    .match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if (!match) {
    return null;
  }

  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10),
    prerelease: match[4] ?? null,
  };
}

export function isDeprecatedQualifier(rawQualifier: string | null): boolean {
  return Boolean(
    rawQualifier && /\b(deprecated|yanked|retired)\b/i.test(rawQualifier),
  );
}

export function isUnreleasedQualifier(rawQualifier: string | null): boolean {
  return Boolean(rawQualifier && /\bunreleased\b/i.test(rawQualifier));
}

export interface ReleaseProvenanceClassification {
  status: ReleaseProvenanceStatus;
  statusLabel: string;
  provenanceNote: string;
  releaseDate: string | null;
  isPublished: boolean;
  isUnreleased: boolean;
  isDeprecated: boolean;
}

export function classifyReleaseProvenance(
  version: string,
  rawQualifier: string | null,
  isNewestActive: boolean,
  policy: ReleaseLifecyclePolicy = DEFAULT_RELEASE_LIFECYCLE_POLICY,
): ReleaseProvenanceClassification {
  const semver = parseSemver(version);
  const qualifierDate = rawQualifier?.match(/(\d{4}-\d{2}-\d{2})/);
  const extractedDate = qualifierDate
    ? qualifierDate[1]
    : (policy.knownReleaseDates[version] ?? null);

  if (isDeprecatedQualifier(rawQualifier)) {
    return {
      status: 'deprecated',
      statusLabel: 'Deprecated',
      provenanceNote: `Deprecated AstraFlow release (${version})${extractedDate ? ` (${extractedDate})` : ''} — upgrade to AstraFlow ${policy.latestPublishedVersion}.`,
      releaseDate: extractedDate,
      isPublished: false,
      isUnreleased: false,
      isDeprecated: true,
    };
  }

  if (isUnreleasedQualifier(rawQualifier)) {
    return {
      status: 'latest',
      statusLabel: 'Upcoming Milestone',
      provenanceNote:
        'Next AstraFlow development milestone currently prepared on the release branch.',
      releaseDate: extractedDate,
      isPublished: false,
      isUnreleased: true,
      isDeprecated: false,
    };
  }

  if (semver && semver.major < policy.supportedMinMajor) {
    const legacyLine = `${semver.major}.x`;
    return {
      status: 'historical',
      statusLabel: `Deprecated · ${legacyLine} Archive`,
      provenanceNote: `Deprecated AstraFlow ${legacyLine} release (${version}) — all ${legacyLine} packages are deprecated on NuGet.org; upgrade to supported AstraFlow ${policy.latestPublishedVersion}.`,
      releaseDate: extractedDate,
      isPublished: false,
      isUnreleased: false,
      isDeprecated: true,
    };
  }

  if (isNewestActive || version === policy.latestPublishedVersion) {
    const releaseDate =
      extractedDate ??
      (version === policy.latestPublishedVersion
        ? policy.latestPublishedDate
        : null);
    return {
      status: 'latest',
      statusLabel: 'Latest Milestone',
      provenanceNote: `Latest published NuGet suite release${releaseDate ? ` (${releaseDate})` : ''} across runtime, integration, analyzer, and generator packages.`,
      releaseDate,
      isPublished: true,
      isUnreleased: false,
      isDeprecated: false,
    };
  }

  if (semver && semver.minor === 0 && semver.patch === 0) {
    return {
      status: 'major',
      statusLabel: 'Major Release',
      provenanceNote: `Major AstraFlow ${semver.major}.0 platform milestone (${version}).`,
      releaseDate: extractedDate,
      isPublished: true,
      isUnreleased: false,
      isDeprecated: false,
    };
  }

  const seriesLabel = semver ? `${semver.major}.x` : 'current';
  return {
    status: 'feature',
    statusLabel: 'Feature Release',
    provenanceNote: `Feature release in the AstraFlow ${seriesLabel} series (${version})${extractedDate ? ` (${extractedDate})` : ''}.`,
    releaseDate: extractedDate,
    isPublished: true,
    isUnreleased: false,
    isDeprecated: false,
  };
}

/**
 * Selects a bounded sliding window of active, non-deprecated milestones for the hero deck:
 * 1) Excludes deprecated/legacy editions (they remain inspectable in ReleaseFolio).
 * 2) Pins the newest active edition first and retains up to two supported major landmarks.
 * 3) Fills remaining slots chronologically without hardcoded version strings.
 */
export function selectFeaturedReleases(
  releases: readonly ChangelogRelease[],
  maxCards = DEFAULT_MAX_FEATURED_CARDS,
): ChangelogRelease[] {
  const active = releases.filter((release) => !release.isDeprecated);
  const pool = active.length > 0 ? active : [...releases];

  if (pool.length <= maxCards) {
    return pool;
  }

  const selected = new Set<string>();
  selected.add(pool[0].version);

  const majorCandidates = pool.filter(
    (release) => release.status === 'major' && !selected.has(release.version),
  );
  for (const major of majorCandidates.slice(0, 2)) {
    if (selected.size < maxCards) {
      selected.add(major.version);
    }
  }

  for (const release of pool) {
    if (selected.size >= maxCards) {
      break;
    }
    selected.add(release.version);
  }

  return pool.filter((release) => selected.has(release.version));
}
