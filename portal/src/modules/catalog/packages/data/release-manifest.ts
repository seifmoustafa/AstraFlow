import type { PackageRelease } from './model';

export interface PackageReleaseEntry {
  packageId: string;
  release: PackageRelease;
}

/**
 * Package publication is explicit per package. The source project version is
 * intentionally separate: source may be preparing a release that is not live.
 */
export const PACKAGE_RELEASES: readonly PackageReleaseEntry[] = [
  { packageId: 'AstraFlow', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Contracts', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Mediator', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Mapper', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Mapper.Conventions', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Mapper.EntityFrameworkCore', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Diagnostics', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Security', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Testing', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Assertions', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Analyzers', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Generators', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.Cli', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.AspNetCore', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.FluentValidation', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
  { packageId: 'AstraFlow.OpenTelemetry', release: { availability: 'published', version: '2.4.5', publishedAt: '2026-11-18' } },
];

const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validatePackageReleaseManifest(
  expectedPackageIds: readonly string[],
  entries: readonly PackageReleaseEntry[] = PACKAGE_RELEASES,
): Map<string, PackageRelease> {
  const expected = new Set(expectedPackageIds);
  if (expected.size !== expectedPackageIds.length) {
    throw new Error('Package catalog contains duplicate package IDs.');
  }

  const releases = new Map<string, PackageRelease>();
  for (const entry of entries) {
    if (!entry.packageId.trim()) {
      throw new Error('Package release metadata contains an empty package ID.');
    }
    if (releases.has(entry.packageId)) {
      throw new Error(`Duplicate release metadata for "${entry.packageId}".`);
    }
    if (!expected.has(entry.packageId)) {
      throw new Error(`Release metadata references unknown package "${entry.packageId}".`);
    }

    if (entry.release.availability === 'published') {
      if (!VERSION_PATTERN.test(entry.release.version)) {
        throw new Error(`Invalid published version for "${entry.packageId}".`);
      }
      const parsedDate = new Date(`${entry.release.publishedAt}T00:00:00Z`);
      if (
        !DATE_PATTERN.test(entry.release.publishedAt) ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== entry.release.publishedAt
      ) {
        throw new Error(`Invalid publication date for "${entry.packageId}".`);
      }
    } else if (!VERSION_PATTERN.test(entry.release.targetVersion)) {
      throw new Error(`Invalid planned version for "${entry.packageId}".`);
    }

    releases.set(entry.packageId, entry.release);
  }

  const missing = expectedPackageIds.filter((id) => !releases.has(id));
  if (missing.length > 0) {
    throw new Error(`Missing release metadata for: ${missing.join(', ')}.`);
  }

  return releases;
}

export function isPackagePublished(release: PackageRelease): boolean {
  return release.availability === 'published';
}

export function getPublishedPackageVersion(
  release: PackageRelease,
): string | null {
  return release.availability === 'published' ? release.version : null;
}
