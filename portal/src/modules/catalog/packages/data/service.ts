import {
  CURATED_METADATA,
  PACKAGE_ORDER,
  type PackageCuratedMeta,
} from './catalog';
import type {
  AstraFlowPackageData,
  DirectoryBuildInfo,
  PackageAssetType,
  PackageDistribution,
  PackageInstallKind,
  PackageProjectSource,
  PackageRelease,
} from './model';
import { validatePackageReleaseManifest } from './release-manifest';
import { readDirectoryBuildInfo, readPackageProjectSources } from './project-source';
import { getGitHubTreeUrl, getNuGetPackageUrl } from '@core/config/site-config';

let cachedBuildInfo: DirectoryBuildInfo | null = null;
let cachedPackages: AstraFlowPackageData[] | null = null;

export function getDirectoryBuildInfo(): DirectoryBuildInfo {
  cachedBuildInfo ??= readDirectoryBuildInfo();
  return cachedBuildInfo;
}

function buildPackageRecord(
  source: PackageProjectSource,
  buildInfo: DirectoryBuildInfo,
  releases: ReadonlyMap<string, PackageRelease>,
): AstraFlowPackageData {
  const meta = CURATED_METADATA[
    source.id as keyof typeof CURATED_METADATA
  ] as PackageCuratedMeta | undefined;
  if (!meta) {
    throw new Error(
      `Unexpected package "${source.id}" under ${source.csprojPath} has no catalog entry.`,
    );
  }

  const release = releases.get(source.id);
  if (!release) {
    throw new Error(`Missing release metadata for "${source.id}".`);
  }
  if (meta.kind === 'dotnet-tool' && !source.packAsTool) {
    throw new Error(`${source.id} is cataloged as a .NET tool but its project does not pack as a tool.`);
  }
  if (meta.kind === 'compiler-tool' && source.includesBuildOutput) {
    throw new Error(`${source.id} is cataloged as compiler tooling but includes a runtime build output.`);
  }
  if (
    meta.hostFrameworkRequirement &&
    !source.targetFrameworks.includes(meta.hostFrameworkRequirement)
  ) {
    throw new Error(
      `${source.id} requires ${meta.hostFrameworkRequirement}, but its project does not target that framework.`,
    );
  }

  let assetType: PackageAssetType = 'runtime-library';
  if (source.packAsTool) {
    assetType = 'dotnet-tool';
  } else if (!source.includesBuildOutput) {
    assetType = 'compiler-analyzer';
  }

  const privateAssets = meta.privateAssets ?? null;
  let installKind: PackageInstallKind = 'nuget';
  if (source.packAsTool) {
    installKind = 'dotnet-tool';
  } else if (privateAssets === 'all') {
    installKind = 'analyzer-private';
  }

  const publishedVersion =
    release.availability === 'published' ? release.version : null;
  const installCommand = publishedVersion
    ? installKind === 'dotnet-tool'
      ? `dotnet tool install --global ${source.id} --version ${publishedVersion}`
      : `dotnet add package ${source.id} --version ${publishedVersion}`
    : null;
  const packageReferenceXml = publishedVersion
    ? installKind === 'dotnet-tool'
      ? `<!-- Install ${source.id} as a .NET tool, not a PackageReference: ${installCommand} -->`
      : `<PackageReference Include="${source.id}" Version="${publishedVersion}"${privateAssets === 'all' ? ' PrivateAssets="all"' : ''} />`
    : null;

  const distribution: PackageDistribution = {
    assetType,
    installKind,
    privateAssets,
    toolCommandName: source.toolCommandName,
    installCommand,
    packageReferenceXml,
    nugetUrl: publishedVersion
      ? getNuGetPackageUrl(source.id, publishedVersion)
      : null,
  };

  return {
    id: source.id,
    kind: meta.kind,
    audience: meta.audience,
    title: source.title,
    category: meta.category,
    tags: source.tags,
    targetFrameworks: source.targetFrameworks,
    release,
    sourceVersion: buildInfo.sourceVersion,
    distribution,
    activation: meta.activation ?? 'default',
    bundledPackageIds: meta.bundledPackages ?? [],
    stackConstraints: meta.stackConstraints ?? [],
    hostFrameworkRequirement: meta.hostFrameworkRequirement ?? null,
    projectReferences: source.projectReferences,
    externalDependencies: source.externalDependencies,
    frameworkReferences: source.frameworkReferences,
    installWarning: null,
    csprojPath: source.csprojPath,
    docHref: meta.docHref,
    githubUrl: getGitHubTreeUrl(`src/${source.directoryName}`),
  };
}

/** Combines repository source facts, curated product metadata, and release facts. */
export function getAllPackages(): AstraFlowPackageData[] {
  if (cachedPackages) return cachedPackages;

  const buildInfo = getDirectoryBuildInfo();
  const sourcePackages = readPackageProjectSources();
  const releaseMetadata = validatePackageReleaseManifest(PACKAGE_ORDER);
  const parsed = sourcePackages.map((source) =>
    buildPackageRecord(source, buildInfo, releaseMetadata),
  );

  validatePackageReleaseManifest(parsed.map((pkg) => pkg.id));

  const byId = new Map(parsed.map((pkg) => [pkg.id, pkg]));
  const missing = PACKAGE_ORDER.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    throw new Error(`Missing source projects for packages: ${missing.join(', ')}.`);
  }

  cachedPackages = PACKAGE_ORDER.map((id) => byId.get(id)!);
  return cachedPackages;
}

export function getPackageById(id: string): AstraFlowPackageData | undefined {
  const normalizedId = id.trim().toLowerCase();
  return getAllPackages().find((pkg) => pkg.id.toLowerCase() === normalizedId);
}

