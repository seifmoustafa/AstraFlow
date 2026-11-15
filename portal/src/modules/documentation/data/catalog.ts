import type { DocCategory } from './model';

export const DOC_SLUG_ALIASES: ReadonlyMap<string, string> = new Map([
  ['quick-start', 'getting-started'],
  ['mapping', 'mapper'],
  ['efcore', 'entity-framework-core'],
  ['ef-core', 'entity-framework-core'],
  ['validation', 'fluentvalidation'],
  ['observability', 'opentelemetry'],
  ['generators', 'generated-dispatch'],
  ['security', 'secure-ids'],
  ['security-and-supply-chain', 'secure-ids'],
  ['branch-protection-rollout', 'secure-ids'],
  ['mediator-scenarios', 'pipelines'],
  ['mapper-scenarios', 'mapper'],
  ['projection-scenarios', 'projections'],
  ['diagnostics-endpoint-safety', 'diagnostics'],
  ['api-governance', 'compatibility'],
  ['api-reference', 'overview'],
  ['benchmarks', 'generated-dispatch'],
  ['engineering-blueprint', 'architecture'],
  ['version-upgrade-guide', 'migration-and-troubleshooting'],
  ['migration-cookbook', 'migration-and-troubleshooting'],
  ['troubleshooting', 'migration-and-troubleshooting'],
  ['adr/0001-generated-mapper', 'generated-mapping'],
  ['adr/0002-generated-mediator', 'generated-dispatch'],
  ['adr/0003-flow-manifest', 'diagnostics'],
  ['readme', 'overview'],
  ['index', 'overview'],
]);

export const DOC_CATEGORY_ORDER: readonly DocCategory[] = [
  'Getting Started',
  'Mediator & Pipelines',
  'Mapping & Projections',
  'Framework Integrations',
  'Testing, Diagnostics & Tooling',
];

export const CURATED_DOC_ORDER: readonly string[] = [
  // 1. Getting Started
  'overview',
  'getting-started',
  'package-selection',
  'architecture',
  'compatibility',
  // 2. Mediator & Pipelines
  'mediator',
  'pipelines',
  'notifications-and-streams',
  'generated-dispatch',
  // 3. Mapping & Projections
  'mapper',
  'convention-mapping',
  'projections',
  'generated-mapping',
  'secure-ids',
  // 4. Framework Integrations
  'aspnetcore',
  'entity-framework-core',
  'fluentvalidation',
  'opentelemetry',
  // 5. Testing, Diagnostics & Tooling
  'testing',
  'assertions',
  'diagnostics',
  'analyzers',
  'cli',
  'migration-and-troubleshooting',
];

const CATEGORY_BY_SLUG: Record<string, DocCategory> = {
  overview: 'Getting Started',
  'getting-started': 'Getting Started',
  'package-selection': 'Getting Started',
  architecture: 'Getting Started',
  compatibility: 'Getting Started',

  mediator: 'Mediator & Pipelines',
  pipelines: 'Mediator & Pipelines',
  'notifications-and-streams': 'Mediator & Pipelines',
  'generated-dispatch': 'Mediator & Pipelines',

  mapper: 'Mapping & Projections',
  'convention-mapping': 'Mapping & Projections',
  projections: 'Mapping & Projections',
  'generated-mapping': 'Mapping & Projections',
  'secure-ids': 'Mapping & Projections',

  aspnetcore: 'Framework Integrations',
  'entity-framework-core': 'Framework Integrations',
  fluentvalidation: 'Framework Integrations',
  opentelemetry: 'Framework Integrations',

  testing: 'Testing, Diagnostics & Tooling',
  assertions: 'Testing, Diagnostics & Tooling',
  diagnostics: 'Testing, Diagnostics & Tooling',
  analyzers: 'Testing, Diagnostics & Tooling',
  cli: 'Testing, Diagnostics & Tooling',
  'migration-and-troubleshooting': 'Testing, Diagnostics & Tooling',
};

export function classifyDocCategory(slugPath: string): DocCategory {
  return CATEGORY_BY_SLUG[slugPath] ?? 'Testing, Diagnostics & Tooling';
}

