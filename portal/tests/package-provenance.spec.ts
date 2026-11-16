import { expect, test } from '@playwright/test';
import {
  getAllPackages,
  getComposerPresets,
  resolvePackageStack,
} from '../src/modules/catalog/packages';
import { PACKAGE_ORDER } from '../src/modules/catalog/packages/data/catalog';
import { packagesEn } from '../src/modules/catalog/packages/packages.en';
import {
  PACKAGE_RELEASES,
  validatePackageReleaseManifest,
} from '../src/modules/catalog/packages/data/release-manifest';
import type { PackageReleaseEntry } from '../src/modules/catalog/packages/data/release-manifest';
import { resolvePackageStackClient } from '../src/modules/catalog/packages';
import {
  getAllChangelogReleases,
  getChangelogStats,
  parseSemver,
  selectFeaturedReleases,
} from '../src/modules/releases/changelog';
import {
  LATEST_PUBLISHED_VERSION,
  LATEST_PUBLISHED_DATE,
  PREVIOUS_PUBLISHED_VERSION,
  SUPPORTED_MIN_MAJOR,
} from '../src/core/config/site-config';

test('package release metadata is complete, explicit, and valid', () => {
  const releases = validatePackageReleaseManifest(PACKAGE_ORDER, PACKAGE_RELEASES);

  expect([LATEST_PUBLISHED_VERSION, LATEST_PUBLISHED_DATE, PREVIOUS_PUBLISHED_VERSION]).toEqual([
    '2.4.1',
    '2026-11-16',
    '2.4.0',
  ]);
  expect(releases.size).toBe(PACKAGE_ORDER.length);
  expect(releases.get('AstraFlow.Assertions')).toEqual({
    availability: 'published',
    version: '2.4.1',
    publishedAt: '2026-11-16',
  });
  expect(releases.get('AstraFlow.Mediator')).toEqual({
    availability: 'published',
    version: '2.4.1',
    publishedAt: '2026-11-16',
  });
});

test('package locale provides descriptions and searchable capabilities for every catalog entry', () => {
  expect(Object.keys(packagesEn.packageProfiles).sort()).toEqual(
    [...PACKAGE_ORDER].sort(),
  );
  expect(Object.keys(packagesEn.presetProfiles).sort()).toEqual(
    getComposerPresets().map((preset) => preset.id).sort(),
  );

  for (const profile of Object.values(packagesEn.packageProfiles)) {
    expect(profile.shortName).not.toBe('');
    expect(profile.categoryLabel).not.toBe('');
    expect(profile.roleSummary).not.toBe('');
    expect(profile.capabilities.length).toBeGreaterThan(0);
  }

  const assertions = packagesEn.packageProfiles['AstraFlow.Assertions'];
  expect(assertions.roleSummary).toContain('XML structure');
  expect(assertions.capabilities).toContain(
    'XML root, direct-child, attribute, ordinal element-value, and document/element tree-equivalence assertions on all four targets; equivalence compares expanded names and attribute sets, preserves child-node order, treats CDATA as text, and omits compared values from failures',
  );
  expect(assertions.capabilities).toContain(
    'HTTP response status and response/content header assertions that never read or dispose content and omit header values, body text, and request URIs from failure messages',
  );
  expect(assertions.capabilities).toContain(
    'Exact HaveContent(byte[]) and NotHaveContent(byte[]) stream comparisons use a fixed 4 KiB buffer; seekable streams restore position after success, mismatch, or read failure, while non-seekable streams are consumed',
  );
  expect(assertions.capabilities).toContain(
    'HaveElementAt(index, expected) checks a zero-based sequence position with EqualityComparer<T>.Default, returns the matched item through Which, and enumerates only as far as the requested index',
  );
  expect(assertions.capabilities).toContain(
    'HaveElementPreceding/HaveElementSucceeding check the immediate neighbor of the first matching pivot with EqualityComparer<T>.Default, stop after that neighbor, and omit compared values from failures',
  );
  expect(assertions.capabilities).toContain(
    'Ordered sequence checks accept params or IEnumerable expectations: ContainInOrder/NotContainInOrder allow gaps, while ContainInConsecutiveOrder/NotContainInConsecutiveOrder require adjacency; duplicate expected items need distinct positions, default equality compares nulls, expected inputs must be finite, and each input is enumerated at most once',
  );
  expect(assertions.capabilities).toContain(
    'StartWith and EndWith compare finite ordered prefixes or suffixes from params or IEnumerable inputs with an optional comparer; expected inputs and subjects are read at most once, prefix checks stop early, suffix checks reach the end, and failures omit compared values',
  );
  expect(assertions.capabilities).toContain(
    'BeInAscendingOrderBy/BeInDescendingOrderBy check selected keys with an optional comparer; the selector runs once per item, ties pass, and failures report only the first failing index',
  );
  expect(assertions.capabilities).toContain(
    'ContainEquivalentOf/NotContainEquivalentOf/AllBeEquivalentTo compare items structurally against one expected shape with per-call graph options; positive containment returns the matched item, all-item checks pass empty sequences, nested one-shot collections are snapshotted at most once across candidates, null subjects fail, and failures omit compared values',
  );
  expect(assertions.capabilities).toContain(
    'Order-independent dictionary Equal/NotEqual over finite entry sequences uses default key/value equality and enumerates expected once; null expected sequences throw, null subjects fail, duplicate or null expected keys are rejected, and failures never print keys or values',
  );
  expect(assertions.capabilities).toContain(
    'Mutable and read-only dictionaries support the full key, value, batch, count, same-count, and mapping assertion chain; lookups honor the dictionary comparer, while entry-sequence checks use default equality and safe failures',
  );
  expect(assertions.capabilities).toContain(
    'Mutable dictionaries, read-only dictionaries, and IEnumerable<KeyValuePair<TKey,TValue>> use the ordinary Should() entry point; read-only dictionary checks preserve the dictionary comparer and pair-sequence assertions use default key equality with one subject pass',
  );
  expect(assertions.capabilities).toContain(
    'NotContainInOrderAsync and NotContainInConsecutiveOrderAsync reject gapped or adjacent matches; both require a non-null subject, accept empty expectations, use default equality, consume finite expected inputs at most once, forward cancellation when acquiring the async enumerator, dispose it, and report only the ending index without item values',
  );
  expect(assertions.capabilities).toContain(
    'FluentActions.Invoking/Awaiting/Enumerating and subject extensions defer operations until asserted; Task helpers are available on all targets, ValueTask subject Awaiting extensions on net8.0+, and lazy iterator factories are fully enumerated and disposed',
  );
  expect(assertions.capabilities).toContain(
    'AllBeAssignableTo/AllBeOfType generic and Type overloads distinguish assignability from exact runtime type; generic all-item checks return typed chains, while ContainItemsAssignableTo/NotContainItemsAssignableTo scan at most once',
  );
  expect(assertions.capabilities).toContain(
    'Async HTTP response-body equality and ordinal substring assertions buffer content without disposing the response and omit expected and actual body text from failures',
  );
});

test('release metadata rejects missing, unexpected, duplicate, and malformed entries', () => {
  const plannedAssertions: PackageReleaseEntry = {
    packageId: 'AstraFlow.Assertions',
    release: { availability: 'planned', targetVersion: '2.4.0' },
  };

  expect(() =>
    validatePackageReleaseManifest(['AstraFlow.Assertions'], []),
  ).toThrow(/Missing release metadata/);
  expect(() =>
    validatePackageReleaseManifest(['AstraFlow.Assertions'], [
      { ...plannedAssertions, packageId: 'AstraFlow.Unknown' },
    ]),
  ).toThrow(/unknown package/);
  expect(() =>
    validatePackageReleaseManifest(['AstraFlow.Assertions'], [
      plannedAssertions,
      plannedAssertions,
    ]),
  ).toThrow(/Duplicate release metadata/);
  expect(() =>
    validatePackageReleaseManifest(['AstraFlow.Assertions'], [
      {
        packageId: 'AstraFlow.Assertions',
        release: { availability: 'planned', targetVersion: 'next' },
      } as unknown as PackageReleaseEntry,
    ]),
  ).toThrow(/Invalid planned version/);
  expect(() =>
    validatePackageReleaseManifest(['AstraFlow.Assertions'], [
      {
        packageId: 'AstraFlow.Assertions',
        release: {
          availability: 'published',
          version: '2.3.0',
          publishedAt: '2026-02-31',
        },
      },
    ]),
  ).toThrow(/Invalid publication date/);
});

test('release manifest supports independent package versions and publication dates', () => {
  const releases = validatePackageReleaseManifest(
    ['AstraFlow.One', 'AstraFlow.Two'],
    [
      {
        packageId: 'AstraFlow.One',
        release: {
          availability: 'published',
          version: '1.4.2',
          publishedAt: '2025-03-14',
        },
      },
      {
        packageId: 'AstraFlow.Two',
        release: {
          availability: 'published',
          version: '2.3.0',
          publishedAt: '2026-11-10',
        },
      },
    ],
  );

  expect(releases.get('AstraFlow.One')).toEqual({
    availability: 'published',
    version: '1.4.2',
    publishedAt: '2025-03-14',
  });
  expect(releases.get('AstraFlow.Two')).toEqual({
    availability: 'published',
    version: '2.3.0',
    publishedAt: '2026-11-10',
  });
});

test('published packages receive explicit install and feed metadata', () => {
  const packages = getAllPackages();
  const assertions = packages.find((pkg) => pkg.id === 'AstraFlow.Assertions');

  expect(assertions).toMatchObject({
    release: { availability: 'published', version: '2.4.1' },
    sourceVersion: '2.4.2',
    distribution: {
      nugetUrl: 'https://www.nuget.org/packages/AstraFlow.Assertions/2.4.1',
      installCommand: 'dotnet add package AstraFlow.Assertions --version 2.4.1',
      packageReferenceXml: '<PackageReference Include="AstraFlow.Assertions" Version="2.4.1" />',
    },
  });
  expect(assertions).not.toHaveProperty('isPublished');
  expect(assertions).not.toHaveProperty('publishedVersion');
  expect(assertions).not.toHaveProperty('statusLabel');
});

test('catalog package kinds agree with framework, compiler, tool, and release metadata', () => {
  const packages = getAllPackages();
  expect(new Set(packages.map((pkg) => pkg.id)).size).toBe(packages.length);
  expect(packages.map((pkg) => pkg.id)).toEqual(PACKAGE_ORDER);

  for (const pkg of packages) {
    if (pkg.release.availability === 'published') {
      expect(pkg.distribution.nugetUrl).toContain(
        `${encodeURIComponent(pkg.id)}/${pkg.release.version}`,
      );
      expect(pkg.distribution.installCommand).toContain(pkg.release.version);
      expect(pkg.distribution.packageReferenceXml).toContain(pkg.release.version);
    } else {
      expect(pkg.distribution.nugetUrl).toBeNull();
      expect(pkg.distribution.installCommand).toBeNull();
      expect(pkg.distribution.packageReferenceXml).toBeNull();
    }
  }

  expect(packages.find((pkg) => pkg.id === 'AstraFlow.Analyzers')).toMatchObject({
    kind: 'compiler-tool',
    audience: 'build',
    distribution: { privateAssets: 'all', assetType: 'compiler-analyzer' },
  });
  expect(packages.find((pkg) => pkg.id === 'AstraFlow.Cli')).toMatchObject({
    kind: 'dotnet-tool',
    distribution: { installKind: 'dotnet-tool', assetType: 'dotnet-tool' },
  });
  expect(packages.find((pkg) => pkg.id === 'AstraFlow.Mapper.EntityFrameworkCore'))
    .toMatchObject({ hostFrameworkRequirement: 'net10.0' });
});

test('server and client stack composition share the same published install plan', () => {
  const packages = getAllPackages();
  const selections = [
    ['AstraFlow.Assertions', 'AstraFlow.Mediator'],
    ['AstraFlow.Cli', 'AstraFlow.Generators', 'AstraFlow.Mapper'],
    ['AstraFlow', 'AstraFlow.Mediator'],
  ];

  for (const selectedIds of selections) {
    const serverStack = resolvePackageStack(selectedIds);
    const clientStack = resolvePackageStackClient(selectedIds, packages);
    expect(clientStack).toEqual(serverStack);
  }

  const assertionsStack = resolvePackageStack([
    'AstraFlow.Assertions',
    'AstraFlow.Mediator',
  ]);
  expect(assertionsStack.combinedBlock).toContain(
    'dotnet add package AstraFlow.Mediator --version 2.4.1',
  );
  expect(assertionsStack.combinedBlock).toContain(
    'dotnet add package AstraFlow.Assertions --version 2.4.1',
  );
  expect(assertionsStack.xmlBlock).toContain(
    '<PackageReference Include="AstraFlow.Assertions" Version="2.4.1" />',
  );
  expect(assertionsStack.unreleasedCount).toBe(0);
});

test('changelog lifecycle policy marks 1.x releases deprecated on NuGet and keeps 2.x active', () => {
  expect(SUPPORTED_MIN_MAJOR).toBe(2);

  const releases = getAllChangelogReleases();
  const stats = getChangelogStats();

  const legacyReleases = releases.filter(
    (release) => (parseSemver(release.version)?.major ?? 0) < SUPPORTED_MIN_MAJOR,
  );
  const supportedLineReleases = releases.filter(
    (release) => (parseSemver(release.version)?.major ?? 0) >= SUPPORTED_MIN_MAJOR,
  );

  expect(legacyReleases).toHaveLength(31);
  for (const legacy of legacyReleases) {
    expect(legacy.isDeprecated).toBe(true);
    expect(legacy.isPublished).toBe(false);
    expect(legacy.status).toBe('historical');
    expect(legacy.statusLabel).toBe('Deprecated · 1.x Archive');
    expect(legacy.highlightTags).toContain('Deprecated');
  }

  expect(supportedLineReleases).toHaveLength(6);
  for (const release of supportedLineReleases) {
    expect(release.isDeprecated).toBe(false);
  }

  expect(selectFeaturedReleases(releases).map((release) => release.version)).toEqual([
    '2.4.1',
    '2.4.0',
    '2.3.0',
    '2.2.0',
    '2.1.0',
    '2.0.0',
  ]);
  expect(stats.deprecatedReleaseCount).toBeGreaterThanOrEqual(legacyReleases.length);
});
