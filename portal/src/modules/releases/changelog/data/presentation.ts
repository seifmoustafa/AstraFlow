import type { ChangelogRelease } from './model';
import { parseSemver } from './policy';

/**
 * Formats the compact release-spine tag and edition folio stamp.
 */
export function getShortSpineTag(release: ChangelogRelease): string {
  const releaseType = release.releaseTypeLabel.replace(/\s+Release$/, '');
  if (release.isUnreleased) {
    return 'Upcoming Milestone';
  }
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
    const label =
      release.statusLabel === 'Latest NuGet' ? 'Latest NuGet' : 'Latest Release';
    return release.releaseDate
      ? label + ' · ' + releaseType + ' · ' + release.releaseDate
      : label + ' · ' + releaseType;
  }
  if (release.status === 'historical') {
    return release.releaseDate ? 'Archive · ' + release.releaseDate : 'Archive Release';
  }
  return release.releaseDate
    ? releaseType + ' · ' + release.releaseDate
    : releaseType;
}
