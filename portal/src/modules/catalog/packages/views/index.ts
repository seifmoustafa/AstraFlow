export {
  PackagesModuleLoom,
  type LoomModuleId,
  type PackagesModuleLoomProps,
} from './PackagesModuleLoom';

export {
  PackagesStackComposer,
  type InstallOutputTab,
  type StagedStackPayload,
  type PackagesStackComposerProps,
} from './PackagesStackComposer';

export {
  PackagesDirectory,
  type PackagesDirectoryProps,
} from './PackagesDirectory';

export {
  PackagesWorkspace,
  PackagesInteractiveView,
  type PackagesWorkspaceProps,
} from './PackagesWorkspace';

export {
  PACKAGE_LAYER_GROUPS,
  STAGE_STACK_EVENT,
  dispatchStageStackEvent,
  groupPackagesByLayer,
  resolvePackageStackClient,
  type ComposerLayerGroup,
  type ComposerLayerKey,
  type PackageSpec,
  type StageStackEventDetail,
} from './stack-resolver';
