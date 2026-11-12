import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  renderMarkdown,
  type CodeSnippet,
  type TocItem,
} from './markdown';
import { readRepoText, resolveRepoPath } from './repo-paths';
import { getGitHubBlobUrl } from './site-config';

export type DocCategory =
  | 'Start Here'
  | 'Core & Mapping'
  | 'Tooling & Quality'
  | 'Integrations & Security'
  | 'Governance & Releases'
  | 'ADRs'
  | 'Plans & Evidence'
  | 'Strategy';

export interface DocNavLink {
  slug: string[];
  slugPath: string;
  href: string;
  title: string;
  category: DocCategory;
}

export interface DocSummary {
  slug: string[];
  slugPath: string;
  href: string;
  sourcePath: string;
  category: DocCategory;
  title: string;
  summary: string;
  readingMinutes: number;
  wordCount: number;
  plainExcerpt: string;
  searchText: string;
  firstCodeSnippet: CodeSnippet | null;
  githubUrl: string;
  prevSlug: string[] | null;
  nextSlug: string[] | null;
  prev: DocNavLink | null;
  next: DocNavLink | null;
  toc: TocItem[];
}

export interface DocDetail extends DocSummary {
  html: string;
  resolvedFromAlias: string | null;
}

export interface DocCategoryGroup {
  category: DocCategory;
  docs: DocSummary[];
}

export const DOC_SLUG_ALIASES: ReadonlyMap<string, string> = new Map([
  ['quick-start', 'getting-started'],
  ['release-verification', 'release-checklist'],
  ['nuget-publishing', 'publishing'],
  ['branch-protection-rollout', 'security-and-supply-chain'],
  ['readme', 'overview'],
  ['index', 'overview'],
]);

const DOC_CATEGORY_ORDER: readonly DocCategory[] = [
  'Start Here',
  'Core & Mapping',
  'Tooling & Quality',
  'Integrations & Security',
  'Governance & Releases',
  'ADRs',
  'Plans & Evidence',
  'Strategy',
];

const CURATED_DOC_ORDER: readonly string[] = [
  'overview',
  'getting-started',
  'package-selection',
  'architecture',
  'compatibility',
  'version-upgrade-guide',
  'migration-cookbook',
  'mediator',
  'mediator-scenarios',
  'mapper',
  'mapper-scenarios',
  'convention-mapping',
  'projections',
  'projection-scenarios',
  'api-reference',
  'troubleshooting',
  'testing',
  'assertions',
  'diagnostics',
  'diagnostics-endpoint-safety',
  'analyzers',
  'generators',
  'cli',
  'benchmarks',
  'aspnetcore',
  'entity-framework-core',
  'fluentvalidation',
  'observability',
  'security',
  'security-and-supply-chain',
  'api-governance',
  'publishing',
  'release-checklist',
  'community-release-guide',
  'roadmap',
  'engineering-blueprint',
  'branding',
  'future-ideas',
  'design-v1.6.1-candidate-followups',
  'design-v1.6.2-inheritance-polymorphism',
];

const CATEGORY_BY_SLUG: Record<string, DocCategory> = {
  overview: 'Start Here',
  'getting-started': 'Start Here',
  'package-selection': 'Start Here',
  architecture: 'Start Here',
  compatibility: 'Start Here',
  'version-upgrade-guide': 'Start Here',
  'migration-cookbook': 'Start Here',

  mediator: 'Core & Mapping',
  'mediator-scenarios': 'Core & Mapping',
  mapper: 'Core & Mapping',
  'mapper-scenarios': 'Core & Mapping',
  'convention-mapping': 'Core & Mapping',
  projections: 'Core & Mapping',
  'projection-scenarios': 'Core & Mapping',
  'api-reference': 'Core & Mapping',
  troubleshooting: 'Core & Mapping',

  testing: 'Tooling & Quality',
  assertions: 'Tooling & Quality',
  diagnostics: 'Tooling & Quality',
  'diagnostics-endpoint-safety': 'Tooling & Quality',
  analyzers: 'Tooling & Quality',
  generators: 'Tooling & Quality',
  cli: 'Tooling & Quality',
  benchmarks: 'Tooling & Quality',

  aspnetcore: 'Integrations & Security',
  'entity-framework-core': 'Integrations & Security',
  fluentvalidation: 'Integrations & Security',
  observability: 'Integrations & Security',
  security: 'Integrations & Security',
  'security-and-supply-chain': 'Integrations & Security',

  'api-governance': 'Governance & Releases',
  publishing: 'Governance & Releases',
  'release-checklist': 'Governance & Releases',
  'community-release-guide': 'Governance & Releases',
  roadmap: 'Governance & Releases',
  'engineering-blueprint': 'Governance & Releases',
  branding: 'Governance & Releases',
  'future-ideas': 'Governance & Releases',
  'design-v1.6.1-candidate-followups': 'Governance & Releases',
  'design-v1.6.2-inheritance-polymorphism': 'Governance & Releases',
};

const FALLBACK_TITLES: Record<string, string> = {
  'benchmark-results/v2.1-draft/generated-mapping-bdn-short':
    'Generated Mapping Short Benchmark (v2.1 Draft)',
  'benchmark-results/v2.1-draft/generated-mapping-bdn-mapperly-short':
    'Generated Mapping vs Mapperly Benchmark (v2.1 Draft)',
  'benchmark-results/v2.1-draft/generated-mapping-first-call-cold':
    'Generated Mapping First-Call Cold Start (v2.1 Draft)',
};

function classifyDocCategory(slugPath: string): DocCategory {
  if (slugPath.startsWith('adr/')) return 'ADRs';
  if (
    slugPath.startsWith('plans/') ||
    slugPath.startsWith('decisions/') ||
    slugPath.startsWith('benchmark-results/')
  ) {
    return 'Plans & Evidence';
  }
  if (slugPath.startsWith('strategy/')) return 'Strategy';
  return CATEGORY_BY_SLUG[slugPath] ?? 'Governance & Releases';
}

function titleCaseFromSlug(slugPath: string): string {
  if (FALLBACK_TITLES[slugPath]) {
    return FALLBACK_TITLES[slugPath];
  }
  const base = path.posix.basename(slugPath);
  return base
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function stripInlineMarkdown(line: string): string {
  return line
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(markdown: string, slugPath: string): string {
  const lines = markdown.split('\n');
  let inFence = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = line.match(/^#\s+(.+)$/);
    if (match) {
      return stripInlineMarkdown(match[1]);
    }
  }
  return titleCaseFromSlug(slugPath);
}

function extractPlainProse(markdown: string): {
  summary: string;
  plainExcerpt: string;
  searchText: string;
  wordCount: number;
} {
  const lines = markdown.split('\n');
  const paragraphs: string[] = [];
  const allPlainTokens: string[] = [];
  let currentParagraph: string[] = [];
  let inFence = false;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const joined = stripInlineMarkdown(currentParagraph.join(' '));
      if (joined) {
        paragraphs.push(joined);
        allPlainTokens.push(joined);
      }
      currentParagraph = [];
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith('```')) {
      flushParagraph();
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    if (!trimmed) {
      flushParagraph();
      continue;
    }
    if (/^#\s+/.test(trimmed)) {
      flushParagraph();
      allPlainTokens.push(stripInlineMarkdown(trimmed.replace(/^#+\s+/, '')));
      continue;
    }
    if (/^#{2,6}\s+/.test(trimmed)) {
      flushParagraph();
      allPlainTokens.push(stripInlineMarkdown(trimmed.replace(/^#+\s+/, '')));
      continue;
    }
    if (/^!\[.*\]\(.*\)$/.test(trimmed)) {
      flushParagraph();
      continue;
    }
    if (/^\|[-:\s|]+\|$/.test(trimmed)) {
      continue;
    }
    if (trimmed.startsWith('|')) {
      flushParagraph();
      const cells = trimmed
        .split('|')
        .map((c) => stripInlineMarkdown(c))
        .filter(Boolean);
      if (cells.length > 0) {
        allPlainTokens.push(cells.join(' '));
      }
      continue;
    }
    if (/^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      const itemText = stripInlineMarkdown(
        trimmed.replace(/^([-*+]|\d+\.)\s+/, ''),
      );
      if (itemText) {
        allPlainTokens.push(itemText);
      }
      continue;
    }
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>+\s*/, '');
      if (quoteText) {
        currentParagraph.push(quoteText);
      }
      continue;
    }
    if (/^[-_*]{3,}$/.test(trimmed)) {
      flushParagraph();
      continue;
    }
    currentParagraph.push(trimmed);
  }
  flushParagraph();

  const joinedSearch = allPlainTokens.join(' ').replace(/\s+/g, ' ').trim();
  const wordCount = joinedSearch ? joinedSearch.split(/\s+/).length : 0;

  const firstParagraph =
    paragraphs[0] ??
    allPlainTokens.find((token) => token.length > 20) ??
    'BenchmarkDotNet measurement summary from the AstraFlow repository.';

  const truncateAtWord = (text: string, maxLen: number): string => {
    if (text.length <= maxLen) return text;
    const sliced = text.slice(0, maxLen);
    const lastSpace = sliced.lastIndexOf(' ');
    const cut = lastSpace > maxLen * 0.55 ? sliced.slice(0, lastSpace) : sliced;
    return `${cut.trimEnd()}…`;
  };

  const summary = truncateAtWord(firstParagraph, 190);
  const plainExcerpt = truncateAtWord(
    paragraphs.slice(0, 2).join(' ') || firstParagraph,
    240,
  );

  return {
    summary,
    plainExcerpt,
    searchText: joinedSearch.slice(0, 4000).toLowerCase(),
    wordCount,
  };
}

function collectMarkdownFiles(dir: string, prefix = ''): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(full, rel));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(rel);
    }
  }

  return files;
}

interface RawDocEntry {
  slug: string[];
  slugPath: string;
  sourcePath: string;
  markdown: string;
  category: DocCategory;
  title: string;
}

let cachedDocs: DocDetail[] | null = null;
let cachedDocBySlug: Map<string, DocDetail> | null = null;

function buildDocsIndex(): DocDetail[] {
  if (cachedDocs) {
    return cachedDocs;
  }

  const docsDir = resolveRepoPath('docs');
  const relativeFiles = collectMarkdownFiles(docsDir);

  const rawEntries: RawDocEntry[] = relativeFiles.map((relPath) => {
    const slugPath = relPath.slice(0, -'.md'.length);
    const slug = slugPath.split('/');
    const sourcePath = `docs/${relPath}`;
    const markdown = readRepoText('docs', ...slug.slice(0, -1), `${slug[slug.length - 1]}.md`);
    return {
      slug,
      slugPath,
      sourcePath,
      markdown,
      category: classifyDocCategory(slugPath),
      title: extractTitle(markdown, slugPath),
    };
  });

  // Include root README.md mapped under /docs/overview
  const readmeMarkdown = readRepoText('README.md');
  rawEntries.push({
    slug: ['overview'],
    slugPath: 'overview',
    sourcePath: 'README.md',
    markdown: readmeMarkdown,
    category: 'Start Here',
    title: 'AstraFlow Overview',
  });

  const orderIndex = new Map<string, number>(
    CURATED_DOC_ORDER.map((slugPath, idx) => [slugPath, idx]),
  );

  rawEntries.sort((a, b) => {
    const catDiff =
      DOC_CATEGORY_ORDER.indexOf(a.category) -
      DOC_CATEGORY_ORDER.indexOf(b.category);
    if (catDiff !== 0) return catDiff;

    const aCurated = orderIndex.get(a.slugPath);
    const bCurated = orderIndex.get(b.slugPath);
    if (aCurated !== undefined && bCurated !== undefined) {
      return aCurated - bCurated;
    }
    if (aCurated !== undefined) return -1;
    if (bCurated !== undefined) return 1;
    return a.slugPath.localeCompare(b.slugPath);
  });

  const canonicalSlugSet = new Set(rawEntries.map((entry) => entry.slugPath));

  const built: DocDetail[] = rawEntries.map((entry, index) => {
    const rendered = renderMarkdown(entry.markdown, {
      sourcePath: entry.sourcePath,
      docSlugs: canonicalSlugSet,
      docAliases: DOC_SLUG_ALIASES,
    });
    const prose = extractPlainProse(entry.markdown);
    const readingMinutes = Math.max(1, Math.ceil(prose.wordCount / 220));

    const prevEntry = index > 0 ? rawEntries[index - 1] : null;
    const nextEntry =
      index < rawEntries.length - 1 ? rawEntries[index + 1] : null;

    const toNav = (target: RawDocEntry | null): DocNavLink | null =>
      target
        ? {
            slug: target.slug,
            slugPath: target.slugPath,
            href: `/docs/${target.slugPath}`,
            title: target.title,
            category: target.category,
          }
        : null;

    return {
      slug: entry.slug,
      slugPath: entry.slugPath,
      href: `/docs/${entry.slugPath}`,
      sourcePath: entry.sourcePath,
      category: entry.category,
      title: entry.title,
      summary: prose.summary,
      readingMinutes,
      wordCount: prose.wordCount,
      plainExcerpt: prose.plainExcerpt,
      searchText: `${entry.title.toLowerCase()} ${entry.slugPath.toLowerCase()} ${entry.category.toLowerCase()} ${prose.searchText}`,
      firstCodeSnippet: rendered.firstCodeSnippet,
      githubUrl: getGitHubBlobUrl(entry.sourcePath),
      prevSlug: prevEntry ? prevEntry.slug : null,
      nextSlug: nextEntry ? nextEntry.slug : null,
      prev: toNav(prevEntry),
      next: toNav(nextEntry),
      toc: rendered.toc,
      html: rendered.html,
      resolvedFromAlias: null,
    };
  });

  cachedDocs = built;
  cachedDocBySlug = new Map(built.map((doc) => [doc.slugPath, doc]));
  return built;
}

function toDocSummary(doc: DocDetail): DocSummary {
  return {
    slug: doc.slug,
    slugPath: doc.slugPath,
    href: doc.href,
    sourcePath: doc.sourcePath,
    category: doc.category,
    title: doc.title,
    summary: doc.summary,
    readingMinutes: doc.readingMinutes,
    wordCount: doc.wordCount,
    plainExcerpt: doc.plainExcerpt,
    searchText: doc.searchText,
    firstCodeSnippet: doc.firstCodeSnippet,
    githubUrl: doc.githubUrl,
    prevSlug: doc.prevSlug,
    nextSlug: doc.nextSlug,
    prev: doc.prev,
    next: doc.next,
    toc: doc.toc,
  };
}

/**
 * Returns all canonical repository documents (all files under `docs/` plus root `README.md` at `overview`),
 * without duplicating alias routes.
 */
export function getAllDocs(): DocSummary[] {
  return buildDocsIndex().map(toDocSummary);
}

export function getDocCategories(): DocCategoryGroup[] {
  const all = getAllDocs();
  const grouped = new Map<DocCategory, DocSummary[]>();
  for (const cat of DOC_CATEGORY_ORDER) {
    grouped.set(cat, []);
  }
  for (const doc of all) {
    grouped.get(doc.category)?.push(doc);
  }
  return DOC_CATEGORY_ORDER.map((category) => ({
    category,
    docs: grouped.get(category) ?? [],
  })).filter((group) => group.docs.length > 0);
}

export function getAllDocSlugs(): string[][] {
  return buildDocsIndex().map((doc) => doc.slug);
}

/**
 * Returns Next.js App Router `generateStaticParams()` entries for `/docs/[...slug]`,
 * covering all canonical docs as well as documented slug aliases (`quick-start`, etc.).
 */
export function getAllDocRouteParams(): { slug: string[] }[] {
  const canonical = buildDocsIndex().map((doc) => ({ slug: doc.slug }));
  const aliasEntries = Array.from(DOC_SLUG_ALIASES.keys()).map((alias) => ({
    slug: alias.split('/'),
  }));
  return [...canonical, ...aliasEntries];
}

export function getDocBySlug(slugInput: string[] | string): DocDetail | null {
  buildDocsIndex();
  const slugArray = Array.isArray(slugInput)
    ? slugInput
    : slugInput.split('/').filter(Boolean);
  const rawSlugPath = slugArray.join('/').replace(/\.md$/i, '');

  const direct = cachedDocBySlug?.get(rawSlugPath);
  if (direct) {
    return direct;
  }

  const normalized = rawSlugPath.toLowerCase();
  const aliasTarget = DOC_SLUG_ALIASES.get(normalized);
  if (aliasTarget) {
    const resolved = cachedDocBySlug?.get(aliasTarget);
    if (resolved) {
      return {
        ...resolved,
        resolvedFromAlias: rawSlugPath,
      };
    }
  }

  // Case-insensitive canonical fallback
  for (const [key, doc] of cachedDocBySlug?.entries() ?? []) {
    if (key.toLowerCase() === normalized) {
      return doc;
    }
  }

  return null;
}

export function searchDocs(query: string): DocSummary[] {
  const trimmed = query.trim().toLowerCase();
  const all = getAllDocs();
  if (!trimmed) {
    return all;
  }

  const terms = trimmed.split(/\s+/).filter(Boolean);
  return all
    .map((doc) => {
      const titleLower = doc.title.toLowerCase();
      const slugLower = doc.slugPath.toLowerCase();
      let score = 0;

      for (const term of terms) {
        if (titleLower === term || slugLower === term) {
          score += 100;
        } else if (titleLower.includes(term)) {
          score += 40;
        } else if (slugLower.includes(term)) {
          score += 25;
        } else if (doc.summary.toLowerCase().includes(term)) {
          score += 15;
        } else if (doc.searchText.includes(term)) {
          score += 5;
        } else {
          return null;
        }
      }

      return { doc, score };
    })
    .filter((item): item is { doc: DocSummary; score: number } => item !== null)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.doc);
}
