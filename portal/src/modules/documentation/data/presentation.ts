import type { DocCategory } from './model';

export const DOC_CATEGORY_MESSAGE_KEYS: Record<
  DocCategory,
  | 'gettingStarted'
  | 'mediatorPipelines'
  | 'mappingProjections'
  | 'frameworkIntegrations'
  | 'testingDiagnosticsTooling'
> = {
  'Getting Started': 'gettingStarted',
  'Mediator & Pipelines': 'mediatorPipelines',
  'Mapping & Projections': 'mappingProjections',
  'Framework Integrations': 'frameworkIntegrations',
  'Testing, Diagnostics & Tooling': 'testingDiagnosticsTooling',
};
