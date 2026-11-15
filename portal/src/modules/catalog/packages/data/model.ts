export type PackageCategory =
  | 'convenience'
  | 'mediator'
  | 'mapping'
  | 'diagnostics-security'
  | 'tooling'
  | 'integrations'
  | 'testing';

export type PackageInstallKind =
  | 'nuget'
  | 'analyzer-private'
  | 'dotnet-tool';

export type PackageAssetType =
  | 'runtime-library'
  | 'compiler-analyzer'
  | 'dotnet-tool';

export type PackageKind =
  | 'meta-package'
  | 'runtime-library'
  | 'test-support'
  | 'compiler-tool'
  | 'dotnet-tool'
  | 'integration';

export type PackageAudience = 'application' | 'test' | 'build';

export type PackageRelease =
  | {
      availability: 'published';
      version: string;
      publishedAt: string;
    }
  | {
      availability: 'planned';
      targetVersion: string;
    };

export interface ExternalPackageDependency {
  id: string;
  version: string;
  privateAssets: boolean;
  condition: string | null;
}

export interface DirectoryBuildInfo {
  sourceVersion: string;
  license: string;
  repositoryUrl: string;
  authors: string;
}

export interface PackageProjectSource {
  id: string;
  directoryName: string;
  title: string;
  description: string | null;
  tags: string[];
  targetFrameworks: string[];
  packAsTool: boolean;
  toolCommandName: string | null;
  includesBuildOutput: boolean;
  projectReferences: string[];
  externalDependencies: ExternalPackageDependency[];
  frameworkReferences: string[];
  csprojPath: string;
}

export interface PackageDistribution {
  assetType: PackageAssetType;
  installKind: PackageInstallKind;
  privateAssets: 'all' | null;
  toolCommandName: string | null;
  installCommand: string | null;
  packageReferenceXml: string | null;
  nugetUrl: string | null;
}

export interface PackageStackConstraint {
  kind: 'requires-one-of';
  packageIds: readonly string[];
}

/** Package facts read from project files and the release manifest. */
export interface AstraFlowPackageData {
  id: string;
  kind: PackageKind;
  audience: PackageAudience;
  title: string;
  category: PackageCategory;
  tags: string[];
  targetFrameworks: string[];
  release: PackageRelease;
  sourceVersion: string;
  distribution: PackageDistribution;
  activation: 'default' | 'opt-in';
  bundledPackageIds: string[];
  stackConstraints: PackageStackConstraint[];
  hostFrameworkRequirement: string | null;
  projectReferences: string[];
  externalDependencies: ExternalPackageDependency[];
  frameworkReferences: string[];
  installWarning: string | null;
  csprojPath: string;
  docHref: string;
  githubUrl: string;
}

/** English (or future locale) presentation attached at the server page boundary. */
export interface AstraFlowPackage extends AstraFlowPackageData {
  shortName: string;
  categoryLabel: string;
  roleSummary: string;
  capabilities: string[];
  targetSummary: string;
}

export type PackagePresentation = Pick<
  AstraFlowPackage,
  'shortName' | 'categoryLabel' | 'roleSummary' | 'capabilities'
>;

export interface ComposerPresetDefinition {
  id: string;
  packageIds: string[];
  recommendedDocHref: string;
}

export type ComposerPresetPresentation = Pick<
  ComposerPreset,
  'label' | 'summary' | 'targetNote'
>;

export interface ComposerPreset {
  id: string;
  label: string;
  summary: string;
  targetNote: string;
  packageIds: string[];
  recommendedDocHref: string;
}

export type StackWarning =
  | {
      code: 'OVERLAP_META_PACKAGE';
      severity: 'warning';
      metaPackageId: string;
      includedPackageIds: string[];
    }
  | {
      code: 'PRIVATE_ASSETS_REQUIRED';
      severity: 'info';
      packageIds: string[];
    }
  | {
      code: 'GENERATOR_PAIRING';
      severity: 'info';
      packageId: string;
      requiredPackageIds: readonly string[];
    }
  | {
      code: 'TOOL_INSTALL_SEPARATE';
      severity: 'info';
      packageIds: string[];
    }
  | { code: 'TEST_PROJECT_BOUNDARY'; severity: 'info' }
  | {
      code: 'TFM_NET10_ONLY';
      severity: 'info';
      integrationCount: number;
      frameworkNames: string[];
    }
  | {
      code: 'CONVENTIONS_OPT_IN';
      severity: 'info';
      packageIds: string[];
    };

export interface ResolvedPackageStack<
  TPackage extends AstraFlowPackageData = AstraFlowPackageData,
> {
  selectedIds: string[];
  selectedPackages: TPackage[];
  impliedDependencies: string[];
  effectivePackages: TPackage[];
  effectiveTargetFrameworks: string[];
  warnings: StackWarning[];
  cliBlock: string;
  toolBlock: string;
  unreleasedBlock: string;
  xmlBlock: string;
  combinedBlock: string;
  packageCount: number;
  publishedCount: number;
  unreleasedCount: number;
}
