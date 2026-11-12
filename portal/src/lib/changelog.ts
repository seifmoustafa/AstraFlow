import { readRepoText } from './repo-paths';
import { getGitHubBlobUrl, GITHUB_LINKS } from './site-config';
import { renderMarkdown } from './markdown';

export type ReleaseProvenanceStatus =
  | 'unreleased'
  | 'published-confirmed'
  | 'published-baseline'
  | 'github-unverified'
  | 'historical-release';

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
  isBreaking: boolean;
  headline: string;
  highlightTags: string[];
  sections: ChangelogSection[];
  breakingChanges: ChangelogItem[];
  itemCount: number;
  anchorId: string;
  githubUrl: string;
}

export interface ChangelogStats {
  totalReleases: number;
  unreleasedCount: number;
  publishedCount: number;
  githubUnverifiedCount: number;
  latestPublishedVersion: string;
  latestUnreleasedVersion: string;
  breakingReleaseCount: number;
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

function classifyProvenance(
  version: string,
  rawQualifier: string | null
): {
  status: ReleaseProvenanceStatus;
  statusLabel: string;
  provenanceNote: string;
  releaseDate: string | null;
  isPublished: boolean;
  isUnreleased: boolean;
} {
  if (version === '2.4.0' || (rawQualifier && /unreleased/i.test(rawQualifier))) {
    return {
      status: 'unreleased',
      statusLabel: 'Unreleased · Source Milestone — Not on NuGet',
      provenanceNote:
        'Tracked in repository source (Directory.Build.props 2.4.0) and CHANGELOG.md; not yet published to NuGet.org.',
      releaseDate: null,
      isPublished: false,
      isUnreleased: true,
    };
  }

  if (version === '2.3.0') {
    const dateMatch = rawQualifier?.match(/(\d{4}-\d{2}-\d{2})/);
    const releaseDate = dateMatch ? dateMatch[1] : '2026-11-10';
    return {
      status: 'published-confirmed',
      statusLabel: `Published · ${releaseDate} · Maintainer Confirmed`,
      provenanceNote:
        'Latest stable NuGet release verified against maintainer confirmation and docs/version-upgrade-guide.md.',
      releaseDate,
      isPublished: true,
      isUnreleased: false,
    };
  }

  if (version === '2.2.0') {
    return {
      status: 'published-baseline',
      statusLabel: 'Published · Verified Baseline',
      provenanceNote: 'Prior published baseline release documented in CHANGELOG.md.',
      releaseDate: null,
      isPublished: true,
      isUnreleased: false,
    };
  }

  if (version === '2.1.0') {
    return {
      status: 'github-unverified',
      statusLabel: 'GitHub Release · NuGet Unverified',
      provenanceNote:
        'Recorded in CHANGELOG.md as a GitHub Release whose NuGet publication could not be independently verified.',
      releaseDate: null,
      isPublished: false,
      isUnreleased: false,
    };
  }

  const qualifierDate = rawQualifier?.match(/(\d{4}-\d{2}-\d{2})/);
  return {
    status: 'historical-release',
    statusLabel: 'Historical Release',
    provenanceNote: 'Historical AstraFlow release recorded in CHANGELOG.md.',
    releaseDate: qualifierDate ? qualifierDate[1] : null,
    isPublished: true,
    isUnreleased: false,
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

function buildItem(rawText: string): ChangelogItem {
  const normalized = rawText.replace(/\s+/g, ' ').trim();
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
  breakingChanges: ChangelogItem[]
): string[] {
  const tags: string[] = [];
  const corpus = sections
    .flatMap((section) => section.items.map((item) => item.text))
    .join(' ')
    .toLowerCase();

  if (breakingChanges.length > 0) {
    tags.push('Breaking Changes');
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

  for (const block of rawBlocks) {
    const headingMatch = block.rawHeading.match(/^(\d+\.\d+\.\d+)(?:\s*\(([^)]+)\))?/);
    if (!headingMatch) {
      continue;
    }

    const version = headingMatch[1];
    const rawQualifier = headingMatch[2]?.trim() ?? null;
    const provenance = classifyProvenance(version, rawQualifier);
    const sections = parseSections(block.lines);

    const breakingSection = sections.find(
      (section) => section.normalizedTitle === 'Breaking Changes'
    );
    const breakingChanges = (breakingSection?.items ?? []).filter(
      (item) => !item.isNonePlaceholder
    );
    const isBreaking = breakingChanges.length > 0;

    const itemCount = sections.reduce(
      (count, section) =>
        count + section.items.filter((item) => !item.isNonePlaceholder).length,
      0
    );

    const anchorId = `v${version.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
    const githubUrl =
      version === '2.4.0' || provenance.isUnreleased
        ? getGitHubBlobUrl('CHANGELOG.md')
        : `${GITHUB_LINKS.releases}/tag/v${version}`;

    releases.push({
      version,
      rawHeading: block.rawHeading,
      rawQualifier,
      releaseDate: provenance.releaseDate,
      status: provenance.status,
      statusLabel: provenance.statusLabel,
      provenanceNote: provenance.provenanceNote,
      isPublished: provenance.isPublished,
      isUnreleased: provenance.isUnreleased,
      isBreaking,
      headline: deriveHeadline(version, sections, provenance.statusLabel),
      highlightTags: extractHighlightTags(version, sections, breakingChanges),
      sections,
      breakingChanges,
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
  const latestPublished =
    releases.find((release) => release.status === 'published-confirmed') ??
    releases.find((release) => release.isPublished);
  const latestUnreleased = releases.find((release) => release.isUnreleased);

  return {
    totalReleases: releases.length,
    unreleasedCount: releases.filter((release) => release.isUnreleased).length,
    publishedCount: releases.filter((release) => release.isPublished).length,
    githubUnverifiedCount: releases.filter((release) => release.status === 'github-unverified')
      .length,
    latestPublishedVersion: latestPublished?.version ?? '2.3.0',
    latestUnreleasedVersion: latestUnreleased?.version ?? '2.4.0',
    breakingReleaseCount: releases.filter((release) => release.isBreaking).length,
  };
}
