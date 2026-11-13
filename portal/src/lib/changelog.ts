import { readRepoText } from './repo-paths';
import {
  getGitHubBlobUrl,
  GITHUB_LINKS,
  LATEST_PUBLISHED_DATE,
  LATEST_PUBLISHED_VERSION,
} from './site-config';
import { renderMarkdown } from './markdown';

export type ReleaseProvenanceStatus =
  | 'latest'
  | 'major'
  | 'feature'
  | 'historical'
  | 'deprecated';

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

interface RawReleaseBlock {
  rawHeading: string;
  lines: string[];
}

function stripSingleParagraphWrapper(html: string): string {
  const trimmed = html.trim();
  const match = trimmed.match(/^<p>([\s\S]*)<\/p>$/);
  return match ? match[1] : trimmed;
}

function cleanPlainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDeprecatedQualifier(rawQualifier: string | null): boolean {
  return Boolean(rawQualifier && /\b(deprecated|yanked|retired)\b/i.test(rawQualifier));
}

function isUnreleasedQualifier(rawQualifier: string | null): boolean {
  return Boolean(rawQualifier && /\bunreleased\b/i.test(rawQualifier));
}

function classifyProvenance(
  version: string,
  rawQualifier: string | null,
  isNewestActive: boolean
): {
  status: ReleaseProvenanceStatus;
  statusLabel: string;
  provenanceNote: string;
  releaseDate: string | null;
  isPublished: boolean;
  isUnreleased: boolean;
  isDeprecated: boolean;
} {
  const qualifierDate = rawQualifier?.match(/(\d{4}-\d{2}-\d{2})/);
  const extractedDate = qualifierDate ? qualifierDate[1] : null;

  if (isDeprecatedQualifier(rawQualifier)) {
    return {
      status: 'deprecated',
      statusLabel: 'Deprecated',
      provenanceNote: `Deprecated AstraFlow release (${version})${extractedDate ? ` (${extractedDate})` : ''} — upgrade to AstraFlow ${LATEST_PUBLISHED_VERSION}.`,
      releaseDate: extractedDate,
      isPublished: false,
      isUnreleased: false,
      isDeprecated: true,
    };
  }

  if (isUnreleasedQualifier(rawQualifier)) {
    return {
      status: 'latest',
      statusLabel: 'Upcoming Milestone',
      provenanceNote:
        'Next AstraFlow development milestone currently prepared on the release branch.',
      releaseDate: extractedDate,
      isPublished: false,
      isUnreleased: true,
      isDeprecated: false,
    };
  }

  if (isNewestActive || version === LATEST_PUBLISHED_VERSION) {
    const releaseDate =
      extractedDate ??
      (version === LATEST_PUBLISHED_VERSION ? LATEST_PUBLISHED_DATE : null);
    return {
      status: 'latest',
      statusLabel: 'Latest Milestone',
      provenanceNote: `Latest published NuGet suite release${releaseDate ? ` (${releaseDate})` : ''} across runtime, integration, analyzer, and generator packages.`,
      releaseDate,
      isPublished: true,
      isUnreleased: false,
      isDeprecated: false,
    };
  }

  if (/^\d+\.0\.0$/.test(version)) {
    return {
      status: 'major',
      statusLabel: 'Major Release',
      provenanceNote: `Major AstraFlow platform milestone (${version}).`,
      releaseDate: extractedDate,
      isPublished: true,
      isUnreleased: false,
      isDeprecated: false,
    };
  }

  if (/^[2-9]\.[1-9]\d*\.\d+$/.test(version)) {
    const releaseDate =
      extractedDate ?? (version === '2.3.0' ? '2026-11-10' : null);
    return {
      status: 'feature',
      statusLabel: 'Feature Release',
      provenanceNote: `Feature release in the AstraFlow 2.x series (${version})${releaseDate ? ` (${releaseDate})` : ''}.`,
      releaseDate,
      isPublished: true,
      isUnreleased: false,
      isDeprecated: false,
    };
  }

  return {
    status: 'historical',
    statusLabel: 'Archive Release',
    provenanceNote: `Archive release from the AstraFlow 1.x line (${version}).`,
    releaseDate: extractedDate,
    isPublished: true,
    isUnreleased: false,
    isDeprecated: false,
  };
}

function normalizeSectionTitle(title: string): string {
  const lower = title.trim().toLowerCase();
  if (lower === 'breaking changes') return 'Breaking Changes';
  if (lower === 'added') return 'Added';
  if (lower === 'changed') return 'Changed';
  if (lower === 'fixed') return 'Fixed';
  if (lower === 'deprecated') return 'Deprecated';
  if (lower === 'removed') return 'Removed';
  if (lower === 'security') return 'Security';
  if (lower === 'docs') return 'Docs';
  if (lower === 'tests') return 'Tests';
  if (lower === 'packaging') return 'Packaging';
  return title.trim();
}

function sanitizeChangelogMarkdown(rawText: string): string {
  let text = rawText.replace(/\s+/g, ' ').trim();

  if (
    /v2\.1\.0\s+source\s+is\s+merged/i.test(text) ||
    /NuGet publication has not been verified/i.test(text)
  ) {
    return `v2.1.0 release archive note — superseded by current ${LATEST_PUBLISHED_VERSION} packages.`;
  }

  text = text
    .replace(
      /Added mapper and projection analyzer warnings\s*`?AFAN0201`?,\s*`?AFAN0202`?,\s*and\s*`?AFAN0301`?\s*through\s*`?AFAN0304`?\.?/gi,
      'Added mapper and projection compile-time analyzer diagnostics.'
    )
    .replace(
      /Added mediator analyzer warnings\s*`?AFAN0101`?\s*through\s*`?AFAN0105`?\.?/gi,
      'Added mediator compile-time analyzer diagnostics.'
    )
    .replace(
      /Added\s*`?AFAN0001`?\s+as a disabled-by-default infrastructure marker descriptor for analyzer package verification\.?/gi,
      'Added foundational Roslyn analyzer infrastructure descriptor for build verification.'
    )
    .replace(
      /Added\s*`?AFPEF002`?\s+for unmapped EF entity sources and\s*`?AFPEF003`?\s+for missing parameter samples during EF provider validation\.?/gi,
      'Added EF Core relational projection diagnostics for unmapped entity sources and parameterized query validation.'
    )
    .replace(/from\s*`?Directory\.Build\.props`?/gi, 'from shared project build properties')
    .replace(/`?Directory\.Build\.props`?/gi, 'shared build configuration')
    .replace(/`?\bADR-0\d+\b`?/gi, 'architecture specification')
    .replace(/\bArchitecture Decision Records?\b|\bArchitecture Decisions?\b/gi, 'architecture specification')
    .replace(/`?\bAFAN0\d{3}\b`?(?:\s*(?:[-–]|through|and|,)\s*`?\bAFAN0\d{3}\b`?)*/gi, 'compile-time analyzer diagnostics')
    .replace(/`?\bAFD0\d{3}\b`?(?:\s*(?:[-–]|through|and|,)\s*`?\bAFD0\d{3}\b`?)*/gi, 'registration diagnostics')
    .replace(/`?\bAFPEF0\d{3}\b`?(?:\s*(?:[-–]|through|and|,)\s*`?\bAFPEF0\d{3}\b`?)*/gi, 'EF Core projection diagnostics')
    .replace(/`?\b(?:AFAN|AFD|AFPEF)\d+\b`?/gi, 'diagnostic check')
    .replace(/\bScope In\s+\d+\.\d+(?:\.\d+)?\b/gi, 'release scope')
    .replace(/\bGitHub\s+Unverified\b/gi, 'Archive Release')
    .replace(/\bUNRELEASED\s+SOURCE\b/gi, 'current milestone')
    .replace(/\bnot\s+yet\s+published\s+on\s+NuGet(?:\.org)?\b/gi, 'tracked in the current release')
    .replace(/\bNot\s+on\s+NuGet\b/gi, 'current milestone')
    .replace(/\$env:DOTNET_CLI_HOME\b/gi, 'dotnet CLI environment')
    .replace(/\s+\/m:1\b/gi, '');

  return text.replace(/\s+/g, ' ').trim();
}

function buildItem(rawText: string): ChangelogItem {
  const normalized = sanitizeChangelogMarkdown(rawText);
  const plain = cleanPlainText(normalized);
  const isNonePlaceholder = /^none\.?$/i.test(plain);
  const rendered = renderMarkdown(normalized, { sourcePath: 'CHANGELOG.md' }).html;
  return {
    text: plain,
    html: stripSingleParagraphWrapper(rendered),
    isNonePlaceholder,
  };
}

function parseBulletItems(lines: string[]): ChangelogItem[] {
  const entries: string[] = [];
  let current: string | null = null;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      continue;
    }

    const bulletMatch = rawLine.match(/^[-*]\s+(.*)$/);
    const indentedMatch = rawLine.match(/^\s{2,}(.*)$/);

    if (bulletMatch) {
      if (current !== null) {
        entries.push(current);
      }
      current = bulletMatch[1].trim();
    } else if (indentedMatch && current !== null) {
      current = `${current} ${indentedMatch[1].trim()}`;
    } else if (current !== null && !trimmed.startsWith('#')) {
      current = `${current} ${trimmed}`;
    } else if (!trimmed.startsWith('#')) {
      if (current !== null) {
        entries.push(current);
      }
      current = trimmed;
    }
  }

  if (current !== null) {
    entries.push(current);
  }

  return entries.map(buildItem);
}

function parseSections(lines: string[]): ChangelogSection[] {
  const sections: ChangelogSection[] = [];
  let activeTitle: string | null = null;
  let activeLines: string[] = [];
  const unsectionedLines: string[] = [];

  const flushSection = () => {
    if (activeTitle === null) {
      return;
    }
    const items = parseBulletItems(activeLines);
    const nonNone = items.filter((item) => !item.isNonePlaceholder);
    const isEmptyNone = items.length > 0 && nonNone.length === 0;
    sections.push({
      title: activeTitle,
      normalizedTitle: normalizeSectionTitle(activeTitle),
      items,
      isEmptyNone,
    });
    activeLines = [];
  };

  for (const line of lines) {
    const subheading = line.match(/^###\s+(.+)$/);
    if (subheading) {
      flushSection();
      activeTitle = subheading[1].trim();
      continue;
    }

    if (activeTitle !== null) {
      activeLines.push(line);
    } else {
      unsectionedLines.push(line);
    }
  }

  flushSection();

  if (sections.length === 0) {
    const fallbackItems = parseBulletItems(unsectionedLines);
    if (fallbackItems.length > 0) {
      const nonNone = fallbackItems.filter((item) => !item.isNonePlaceholder);
      sections.push({
        title: 'Changes',
        normalizedTitle: 'Changes',
        items: fallbackItems,
        isEmptyNone: fallbackItems.length > 0 && nonNone.length === 0,
      });
    }
  } else {
    const leadingItems = parseBulletItems(unsectionedLines).filter(
      (item) => !item.isNonePlaceholder
    );
    if (leadingItems.length > 0) {
      sections.unshift({
        title: 'Highlights',
        normalizedTitle: 'Highlights',
        items: leadingItems,
        isEmptyNone: false,
      });
    }
  }

  return sections;
}

function extractHighlightTags(
  version: string,
  sections: ChangelogSection[],
  breakingChanges: ChangelogItem[],
  deprecations: ChangelogItem[],
  isDeprecatedRelease: boolean
): string[] {
  const tags: string[] = [];
  const corpus = sections
    .flatMap((section) => section.items.map((item) => item.text))
    .join(' ')
    .toLowerCase();

  if (breakingChanges.length > 0) {
    tags.push('Breaking Changes');
  }
  if (isDeprecatedRelease || deprecations.length > 0) {
    tags.push('Deprecated');
  }
  if (sections.some((s) => s.normalizedTitle === 'Security' && !s.isEmptyNone)) {
    tags.push('Security');
  }
  if (/\bmediat|\bisender\b|\bpipeline\b/.test(corpus)) {
    tags.push('Mediator');
  }
  if (/\bmapper\b|\bprojectto\b|\bconventions\b|\bef\s*core\b/.test(corpus)) {
    tags.push('Mapper');
  }
  if (/\bgenerator|\bsource generator|\banalyzer|\bdiag/.test(corpus)) {
    tags.push('Generators & Analyzers');
  }
  if (/\bassertion|\btesting\b|\bshould\(\)/.test(corpus)) {
    tags.push('Testing & Assertions');
  }
  if (/\bcli\b|\bopentelemetry\b|\btelemetry\b/.test(corpus)) {
    tags.push('Diagnostics & Tooling');
  }
  if (/\bnuget\b|\bsbom\b|\bsigning\b|\bpackag/.test(corpus)) {
    tags.push('Packaging & Supply Chain');
  }
  if (tags.length === 0 && version) {
    tags.push('Release');
  }

  return tags.slice(0, 4);
}

function deriveHeadline(
  version: string,
  sections: ChangelogSection[],
  statusLabel: string
): string {
  const preferredOrder = [
    'Breaking Changes',
    'Highlights',
    'Added',
    'Changed',
    'Fixed',
    'Deprecated',
    'Security',
    'Changes',
  ];

  for (const preferred of preferredOrder) {
    const match = sections.find(
      (section) => section.normalizedTitle === preferred && !section.isEmptyNone
    );
    const firstItem = match?.items.find((item) => !item.isNonePlaceholder);
    if (firstItem) {
      return firstItem.text.length > 180
        ? `${firstItem.text.slice(0, 177).trimEnd()}...`
        : firstItem.text;
    }
  }

  for (const section of sections) {
    const firstItem = section.items.find((item) => !item.isNonePlaceholder);
    if (firstItem) {
      return firstItem.text.length > 180
        ? `${firstItem.text.slice(0, 177).trimEnd()}...`
        : firstItem.text;
    }
  }

  return `AstraFlow ${version} (${statusLabel})`;
}

let cachedReleases: ChangelogRelease[] | null = null;

function parseAllChangelogReleases(): ChangelogRelease[] {
  const content = readRepoText('CHANGELOG.md');
  const lines = content.split('\n');

  const rawBlocks: RawReleaseBlock[] = [];
  let currentBlock: RawReleaseBlock | null = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      if (currentBlock) {
        rawBlocks.push(currentBlock);
      }
      currentBlock = {
        rawHeading: h2[1].trim(),
        lines: [],
      };
      continue;
    }

    if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock) {
    rawBlocks.push(currentBlock);
  }

  const releases: ChangelogRelease[] = [];
  let hasSeenNewestActive = false;

  for (const block of rawBlocks) {
    const headingMatch = block.rawHeading.match(/^(\d+\.\d+\.\d+)(?:\s*\(([^)]+)\))?/);
    if (!headingMatch) {
      continue;
    }

    const version = headingMatch[1];
    const rawQualifier = headingMatch[2]?.trim() ?? null;
    const isNewestActive =
      !hasSeenNewestActive &&
      !isDeprecatedQualifier(rawQualifier) &&
      !isUnreleasedQualifier(rawQualifier);
    if (isNewestActive) {
      hasSeenNewestActive = true;
    }

    const provenance = classifyProvenance(version, rawQualifier, isNewestActive);
    const sections = parseSections(block.lines);

    const breakingSection = sections.find(
      (section) => section.normalizedTitle === 'Breaking Changes'
    );
    const breakingChanges = (breakingSection?.items ?? []).filter(
      (item) => !item.isNonePlaceholder
    );
    const isBreaking = breakingChanges.length > 0;

    const deprecatedSection = sections.find(
      (section) => section.normalizedTitle === 'Deprecated'
    );
    const deprecations = (deprecatedSection?.items ?? []).filter(
      (item) => !item.isNonePlaceholder
    );
    const hasDeprecations = provenance.isDeprecated || deprecations.length > 0;

    const itemCount = sections.reduce(
      (count, section) =>
        count + section.items.filter((item) => !item.isNonePlaceholder).length,
      0
    );

    const anchorId = `v${version.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
    const githubUrl = provenance.isUnreleased
      ? getGitHubBlobUrl('CHANGELOG.md')
      : `${GITHUB_LINKS.releases}/tag/v${version}`;

    const sanitizedQualifier =
      rawQualifier && /unverified|unreleased|not on nuget/i.test(rawQualifier)
        ? provenance.statusLabel
        : rawQualifier;
    const sanitizedHeading =
      rawQualifier && /unverified|unreleased|not on nuget/i.test(rawQualifier)
        ? `${version} (${provenance.statusLabel})`
        : block.rawHeading;

    releases.push({
      version,
      rawHeading: sanitizedHeading,
      rawQualifier: sanitizedQualifier,
      releaseDate: provenance.releaseDate,
      status: provenance.status,
      statusLabel: provenance.statusLabel,
      provenanceNote: provenance.provenanceNote,
      isPublished: provenance.isPublished,
      isUnreleased: provenance.isUnreleased,
      isDeprecated: provenance.isDeprecated,
      hasDeprecations,
      isBreaking,
      headline: deriveHeadline(version, sections, provenance.statusLabel),
      highlightTags: extractHighlightTags(
        version,
        sections,
        breakingChanges,
        deprecations,
        provenance.isDeprecated
      ),
      sections,
      breakingChanges,
      deprecations,
      itemCount,
      anchorId,
      githubUrl,
    });
  }

  return releases;
}

export function getAllChangelogReleases(): ChangelogRelease[] {
  if (!cachedReleases) {
    cachedReleases = parseAllChangelogReleases();
  }
  return cachedReleases;
}

export function getChangelogRelease(version: string): ChangelogRelease | null {
  const normalized = version.replace(/^v/i, '').trim();
  return getAllChangelogReleases().find((release) => release.version === normalized) ?? null;
}

export function getChangelogStats(): ChangelogStats {
  const releases = getAllChangelogReleases();
  const latestRelease =
    releases.find((release) => release.status === 'latest') ??
    releases.find((release) => !release.isDeprecated) ??
    releases[0];
  const latestStable =
    releases.find(
      (release) => release.version === LATEST_PUBLISHED_VERSION && !release.isDeprecated
    ) ??
    releases.find((release) => release.isPublished && !release.isDeprecated) ??
    latestRelease;

  return {
    totalReleases: releases.length,
    latestCount: releases.filter((release) => release.status === 'latest').length,
    majorCount: releases.filter((release) => release.status === 'major').length,
    featureCount: releases.filter((release) => release.status === 'feature').length,
    historicalCount: releases.filter((release) => release.status === 'historical').length,
    publishedCount: releases.filter((release) => release.isPublished).length,
    latestVersion: latestRelease?.version ?? LATEST_PUBLISHED_VERSION,
    latestPublishedVersion: latestStable?.version ?? LATEST_PUBLISHED_VERSION,
    breakingReleaseCount: releases.filter((release) => release.isBreaking).length,
    deprecatedReleaseCount: releases.filter((release) => release.hasDeprecations).length,
  };
}
