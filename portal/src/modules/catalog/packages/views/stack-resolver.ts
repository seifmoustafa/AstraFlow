import type {
  AstraFlowPackage,
  AstraFlowPackageData,
  PackageCategory,
  ResolvedPackageStack,
} from '../data/model';
import { resolvePackageStack } from '../data/stack';

export type PackageSpec = AstraFlowPackage;

export type ComposerLayerKey =
  | 'core'
  | 'mapping'
  | 'diagnostics-security'
  | 'testing'
  | 'tooling'
  | 'integrations';

export interface ComposerLayerGroup {
  key: ComposerLayerKey;
  categories: readonly PackageCategory[];
}

export const PACKAGE_LAYER_GROUPS: readonly ComposerLayerGroup[] = [
  {
    key: 'core',
    categories: ['convenience', 'mediator'],
  },
  {
    key: 'mapping',
    categories: ['mapping'],
  },
  {
    key: 'diagnostics-security',
    categories: ['diagnostics-security'],
  },
  {
    key: 'testing',
    categories: ['testing'],
  },
  {
    key: 'tooling',
    categories: ['tooling'],
  },
  {
    key: 'integrations',
    categories: ['integrations'],
  },
] as const;

export const STAGE_STACK_EVENT = 'astraflow:stage-stack';

export interface StageStackEventDetail {
  packageIds: string[];
  moduleId?: string;
  label?: string;
  mode?: 'replace' | 'add';
}

export function dispatchStageStackEvent(detail: StageStackEventDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<StageStackEventDetail>(STAGE_STACK_EVENT, { detail }));
}

export function groupPackagesByLayer<TPackage extends AstraFlowPackageData>(
  packages: readonly TPackage[],
): Array<ComposerLayerGroup & { packages: TPackage[] }> {
  return PACKAGE_LAYER_GROUPS.map((group) => ({
    ...group,
    packages: packages.filter((pkg) => group.categories.includes(pkg.category)),
  })).filter((group) => group.packages.length > 0);
}

export function resolvePackageStackClient<TPackage extends AstraFlowPackageData>(
  selectedIds: readonly string[],
  packages: readonly TPackage[],
): ResolvedPackageStack<TPackage> {
  return resolvePackageStack(selectedIds, packages);
}
