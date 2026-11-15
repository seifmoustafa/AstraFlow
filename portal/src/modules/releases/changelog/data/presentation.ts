import type { ChangelogRelease } from './model';
import { parseSemver } from './policy';

/**
 * Formats the compact release-spine tag and edition folio stamp.
 */
export function getShortSpineTag(release: ChangelogRelease): string {
  if (release.status === 'deprecated') {
    return release.releaseDate
      ? `Deprecated · ${release.releaseDate}`
      : 'Deprecated';
  }
  if (release.isDeprecated && release.status === 'historical') {
    const semver = parseSemver(release.version);
    const legacyLine = semver ? `${semver.major}.x` : 'Legacy';
    return release.releaseDate
      ? `Deprecated · ${release.releaseDate}`
      : `Deprecated · ${legacyLine}`;
  }
  if (release.status === 'latest') {
    return release.releaseDate
      ? `Latest · ${release.releaseDate}`
      : 'Latest Milestone';
  }
  if (release.status === 'major') {
    return release.releaseDate
      ? `Major · ${release.releaseDate}`
      : 'Major Release';
  }
  if (release.status === 'feature') {
    return release.releaseDate
      ? `Feature · ${release.releaseDate}`
      : 'Feature Release';
  }
  return release.releaseDate
    ? `Archive · ${release.releaseDate}`
    : 'Archive Release';
}
