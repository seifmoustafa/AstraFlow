export type ReleaseProvenanceStatus =
  | 'latest'
  | 'major'
  | 'feature'
  | 'historical'
  | 'deprecated';

export interface SemverVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
}

export interface ReleaseLifecyclePolicy {
  supportedMinMajor: number;
  latestPublishedVersion: string;
  latestPublishedDate: string;
  knownReleaseDates: Readonly<Record<string, string>>;
}

export interface ChangelogItem {
  text: string;
  html: string;
  isNonePlaceholder: boolean;
}

export interface ChangelogSection {
  title: string;
  normalizedTitle: string;
  items: ChangelogItem[];
  isEmptyNone: boolean;
}

export interface ChangelogRelease {
  version: string;
  rawHeading: string;
  rawQualifier: string | null;
  releaseDate: string | null;
  status: ReleaseProvenanceStatus;
  statusLabel: string;
  provenanceNote: string;
  isPublished: boolean;
  isUnreleased: boolean;
  isDeprecated: boolean;
  hasDeprecations: boolean;
  isBreaking: boolean;
  headline: string;
  highlightTags: string[];
  sections: ChangelogSection[];
  breakingChanges: ChangelogItem[];
  deprecations: ChangelogItem[];
  itemCount: number;
  anchorId: string;
  githubUrl: string;
}

export interface ChangelogStats {
  totalReleases: number;
  latestCount: number;
  majorCount: number;
  featureCount: number;
  historicalCount: number;
  publishedCount: number;
  latestVersion: string;
  latestPublishedVersion: string;
  breakingReleaseCount: number;
  deprecatedReleaseCount: number;
}
