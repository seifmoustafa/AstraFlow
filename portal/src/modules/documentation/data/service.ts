import { renderMarkdown } from './markdown';
import { getGitHubBlobUrl } from '@core/config/site-config';
import {
  DOC_CATEGORY_ORDER,
  DOC_SLUG_ALIASES,
  CURATED_DOC_ORDER,
  classifyDocCategory,
} from './catalog';
import { extractPlainProse, extractTitle } from './content';
import type {
  DocCategory,
  DocCategoryGroup,
  DocDetail,
  DocNavLink,
  DocSummary,
  RawDocEntry,
} from './model';
import { readPortalDocSources } from './repository';
import { searchDocSummaries } from './search';
let cachedDocs: DocDetail[] | null = null;
let cachedDocBySlug: Map<string, DocDetail> | null = null;

function buildDocsIndex(): DocDetail[] {
  if (cachedDocs) {
    return cachedDocs;
  }

  const rawEntries: RawDocEntry[] = readPortalDocSources().map((source) => {
    const normalizedRel = source.relativePath.replace(/\\/g, '/');
    const slugPath = normalizedRel.slice(0, -'.md'.length);
    const slug = slugPath.split('/');
    const sourcePath = `portal/src/content/docs/${normalizedRel}`;
    return {
      slug,
      slugPath,
      sourcePath,
      markdown: source.markdown,
      category: classifyDocCategory(slugPath),
      title: extractTitle(source.markdown, slugPath),
    };
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
      isUnreleasedSource: false,
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
    isUnreleasedSource: doc.isUnreleasedSource,
  };
}

/**
 * Returns all curated developer documentation guides under `portal/src/content/docs/`.
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
 * covering all curated canonical docs as well as documented slug aliases (`quick-start`, etc.).
 */
export function getAllDocRouteParams(): { slug: string[] }[] {
  const docs = buildDocsIndex();
  const canonicalSet = new Set(docs.map((doc) => doc.slugPath));
  const canonical = docs.map((doc) => ({ slug: doc.slug }));
  const aliasEntries = Array.from(DOC_SLUG_ALIASES.entries())
    .filter(([, target]) => canonicalSet.has(target))
    .map(([alias]) => ({
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

  for (const [key, doc] of cachedDocBySlug?.entries() ?? []) {
    if (key.toLowerCase() === normalized) {
      return doc;
    }
  }

  return null;
}

export function searchDocs(query: string): DocSummary[] {
  return searchDocSummaries(getAllDocs(), query);
}
