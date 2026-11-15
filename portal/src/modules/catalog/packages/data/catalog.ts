import type {
  PackageAudience,
  PackageCategory,
  PackageKind,
  PackageStackConstraint,
} from './model';

export interface PackageCuratedMeta {
  kind: PackageKind;
  audience: PackageAudience;
  category: PackageCategory;
  docHref: string;
  bundledPackages?: string[];
  activation?: 'default' | 'opt-in';
  privateAssets?: 'all';
  stackConstraints?: PackageStackConstraint[];
  hostFrameworkRequirement?: string;
}

/** Stable package identity and integration rules; all display copy lives in locales. */
export const CURATED_METADATA = {
  AstraFlow: {
    kind: 'meta-package',
    audience: 'application',
    category: 'convenience',
    docHref: '/docs/package-selection#astraflow',
    bundledPackages: ['AstraFlow.Contracts', 'AstraFlow.Mediator', 'AstraFlow.Mapper'],
  },
  'AstraFlow.Contracts': {
    kind: 'runtime-library',
    audience: 'application',
    category: 'mediator',
    docHref: '/docs/package-selection#astraflowcontracts',
  },
  'AstraFlow.Mediator': {
    kind: 'runtime-library',
    audience: 'application',
    category: 'mediator',
    docHref: '/docs/mediator',
  },
  'AstraFlow.Mapper': {
    kind: 'runtime-library',
    audience: 'application',
    category: 'mapping',
    docHref: '/docs/mapper',
  },
  'AstraFlow.Mapper.Conventions': {
    kind: 'runtime-library',
    audience: 'application',
    activation: 'opt-in',
    category: 'mapping',
    docHref: '/docs/convention-mapping',
  },
  'AstraFlow.Mapper.EntityFrameworkCore': {
    kind: 'integration',
    audience: 'application',
    hostFrameworkRequirement: 'net10.0',
    category: 'mapping',
    docHref: '/docs/entity-framework-core',
  },
  'AstraFlow.Diagnostics': {
    kind: 'runtime-library',
    audience: 'application',
    category: 'diagnostics-security',
    docHref: '/docs/diagnostics',
  },
  'AstraFlow.Security': {
    kind: 'runtime-library',
    audience: 'application',
    category: 'diagnostics-security',
    docHref: '/docs/secure-ids',
  },
  'AstraFlow.Testing': {
    kind: 'test-support',
    audience: 'test',
    category: 'testing',
    docHref: '/docs/testing',
  },
  'AstraFlow.Assertions': {
    kind: 'test-support',
    audience: 'test',
    category: 'testing',
    docHref: '/docs/assertions',
  },
  'AstraFlow.Analyzers': {
    kind: 'compiler-tool',
    audience: 'build',
    privateAssets: 'all',
    category: 'tooling',
    docHref: '/docs/analyzers',
  },
  'AstraFlow.Generators': {
    kind: 'compiler-tool',
    audience: 'build',
    privateAssets: 'all',
    stackConstraints: [
      {
        kind: 'requires-one-of',
        packageIds: ['AstraFlow.Mediator', 'AstraFlow.Mapper'],
      },
    ],
    category: 'tooling',
    docHref: '/docs/generated-dispatch',
  },
  'AstraFlow.Cli': {
    kind: 'dotnet-tool',
    audience: 'build',
    category: 'tooling',
    docHref: '/docs/cli',
  },
  'AstraFlow.AspNetCore': {
    kind: 'integration',
    audience: 'application',
    hostFrameworkRequirement: 'net10.0',
    category: 'integrations',
    docHref: '/docs/aspnetcore',
  },
  'AstraFlow.FluentValidation': {
    kind: 'integration',
    audience: 'application',
    category: 'integrations',
    docHref: '/docs/fluentvalidation',
  },
  'AstraFlow.OpenTelemetry': {
    kind: 'integration',
    audience: 'application',
    category: 'integrations',
    docHref: '/docs/opentelemetry',
  },
} satisfies Record<string, PackageCuratedMeta>;

export type PackageId = keyof typeof CURATED_METADATA;

/** Catalog insertion order is the single stable display and install-plan order. */
export const PACKAGE_ORDER: readonly PackageId[] = Object.keys(
  CURATED_METADATA,
) as PackageId[];
