export {
  getAllPackages,
  getDirectoryBuildInfo,
  getPackageById,
} from './data/service';
export {
  default as PackagesPage,
  generateMetadata as packagesMetadata,
} from './views/PackagesPage';
export { getComposerPresets } from './data/presets';
import { getAllPackages } from './data/service';
import { resolvePackageStack as composePackageStack } from './data/stack';
import type { ResolvedPackageStack } from './data/model';
export { packagesEn } from './packages.en';
export { getPackageReleaseLabel, getPublishedReleaseVersion } from './data/presentation';
export type * from './data/model';
export {
  PackagesInteractiveView,
  PackagesWorkspace,
  dispatchStageStackEvent,
  groupPackagesByLayer,
  resolvePackageStackClient,
  STAGE_STACK_EVENT,
} from './views';
export type {
  InstallOutputTab,
  PackagesWorkspaceProps,
  StagedStackPayload,
} from './views';

export function resolvePackageStack(
  selectedIds: readonly string[],
): ResolvedPackageStack {
  return composePackageStack(selectedIds, getAllPackages());
}
