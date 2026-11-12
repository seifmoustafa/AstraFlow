export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://astraflow.dev'
).replace(/\/+$/, '');

export const SITE_NAME = 'AstraFlow';
export const SITE_TAGLINE = 'ENGINEERED CLARITY';
export const SITE_DESCRIPTION =
  'Explicit .NET packages for mediator dispatch, auditable object mapping, query projections, compile-time analyzers, source generators, diagnostics, and test workflows.';

export const LATEST_PUBLISHED_VERSION = '2.3.0';
export const LATEST_PUBLISHED_DATE = '2026-11-10';
export const LATEST_PUBLISHED_PROVENANCE =
  'Maintainer-confirmed published on 2026-11-10';
export const PREVIOUS_PUBLISHED_VERSION = '2.2.0';
export const UNRELEASED_SOURCE_VERSION = '2.4.0';

export const LICENSE_NAME = 'MIT';

export const GITHUB_OWNER = 'seifmoustafa';
export const GITHUB_REPO = 'AstraFlow';
export const GITHUB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
export const NUGET_BASE_URL = 'https://www.nuget.org/packages';

export const GITHUB_LINKS = {
  repo: GITHUB_URL,
  issues: `${GITHUB_URL}/issues`,
  pulls: `${GITHUB_URL}/pulls`,
  releases: `${GITHUB_URL}/releases`,
  advisories: `${GITHUB_URL}/security/advisories/new`,
  contributing: `${GITHUB_URL}/blob/main/CONTRIBUTING.md`,
  security: `${GITHUB_URL}/blob/main/SECURITY.md`,
  support: `${GITHUB_URL}/blob/main/SUPPORT.md`,
  changelog: `${GITHUB_URL}/blob/main/CHANGELOG.md`,
  license: `${GITHUB_URL}/blob/main/LICENSE`,
  codeOfConduct: `${GITHUB_URL}/blob/main/CODE_OF_CONDUCT.md`,
  readme: `${GITHUB_URL}/blob/main/README.md`,
  buyMeACoffee: 'https://buymeacoffee.com/seifmoustafa',
} as const;

export function getGitHubBlobUrl(repoRelativePath: string): string {
  const clean = repoRelativePath.replace(/^\/+/, '').replace(/\\/g, '/');
  return `${GITHUB_URL}/blob/main/${clean}`;
}

export function getGitHubTreeUrl(repoRelativePath: string): string {
  const clean = repoRelativePath.replace(/^\/+/, '').replace(/\\/g, '/');
  return `${GITHUB_URL}/tree/main/${clean}`;
}

export function getNuGetPackageUrl(
  packageId: string,
  version?: string | null,
): string {
  const encodedId = encodeURIComponent(packageId);
  if (version) {
    return `${NUGET_BASE_URL}/${encodedId}/${encodeURIComponent(version)}`;
  }
  return `${NUGET_BASE_URL}/${encodedId}`;
}
