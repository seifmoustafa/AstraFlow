import type { AstraFlowPackage, PackageRelease } from './model';

export interface PackageReleaseLabelCopy {
  planned(version: string): string;
  tool(version: string): string;
  privateAssets(version: string): string;
  published(version: string): string;
}

export function getPackageReleaseLabel(
  pkg: AstraFlowPackage,
  copy: PackageReleaseLabelCopy,
  release: PackageRelease = pkg.release,
): string {
  if (release.availability === 'planned') {
    return copy.planned(release.targetVersion);
  }

  if (pkg.distribution.installKind === 'dotnet-tool') {
    return copy.tool(release.version);
  }
  if (pkg.distribution.privateAssets === 'all') {
    return copy.privateAssets(release.version);
  }
  return copy.published(release.version);
}

export function getPublishedReleaseVersion(
  pkg: AstraFlowPackage,
): string | null {
  return pkg.release.availability === 'published' ? pkg.release.version : null;
}
