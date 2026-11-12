'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type {
  DocCategory,
  DocCategoryGroup,
  DocSummary,
} from '@/lib/docs';
import styles from './DocsReferenceDesk.module.css';

const CATEGORY_ORDER: readonly DocCategory[] = [
  'Start Here',
  'Core & Mapping',
  'Tooling & Quality',
  'Integrations & Security',
  'Governance & Releases',
  'ADRs',
  'Plans & Evidence',
  'Strategy',
];

const QUICK_INDEX_CARDS = [
  {
    slugPath: 'getting-started',
    label: 'Getting started',
    sub: 'Build your first request',
  },
  {
    slugPath: 'mapper',
    label: 'Mapping',
    sub: 'Rules & projections',
  },
  {
    slugPath: 'diagnostics',
    label: 'Diagnostics',
    sub: 'Inspect what is knowable',
  },
  {
    slugPath: 'generators',
    label: 'Generators',
    sub: 'Opt-in build-time code',
  },
] as const;

export interface DocsReferenceDeskProps {
  docs: DocSummary[];
  categories?: DocCategoryGroup[];
  initialSlugPath?: string;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

function scoreAndFilterDocs(
  docs: readonly DocSummary[],
  query: string,
  category: DocCategory | 'All',
): DocSummary[] {
  const pool =
    category === 'All' ? docs : docs.filter((doc) => doc.category === category);

  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [...pool];
  }

  const terms = trimmed.split(/\s+/).filter(Boolean);
  return pool
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
    .filter((entry): entry is { doc: DocSummary; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.doc);
}

export function DocsReferenceDesk({
  docs,
  categories,
  initialSlugPath = 'getting-started',
}: DocsReferenceDeskProps) {
  const router = useRouter();
  const baseId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | 'All'>('All');
  const [activeSlugPath, setActiveSlugPath] = useState<string>(() => {
    const match = docs.find((d) => d.slugPath === initialSlugPath);
    return match?.slugPath ?? docs[0]?.slugPath ?? '';
  });
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Global keyboard shortcuts: Ctrl+K / Cmd+K and '/' to focus search
  useEffect(() => {
    const handleGlobalKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isEditableElement(event.target)
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = new Map<DocCategory, number>();
    if (categories && categories.length > 0) {
      for (const grp of categories) {
        counts.set(grp.category, grp.docs.length);
      }
    } else {
      for (const doc of docs) {
        counts.set(doc.category, (counts.get(doc.category) ?? 0) + 1);
      }
    }
    return counts;
  }, [docs, categories]);

  const availableCategories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => (categoryCounts.get(cat) ?? 0) > 0),
    [categoryCounts],
  );

  const filteredDocs = useMemo(
    () => scoreAndFilterDocs(docs, query, selectedCategory),
    [docs, query, selectedCategory],
  );

  const groupedResults = useMemo(() => {
    const byCategory = new Map<DocCategory, DocSummary[]>();
    for (const cat of CATEGORY_ORDER) {
      byCategory.set(cat, []);
    }
    for (const doc of filteredDocs) {
      byCategory.get(doc.category)?.push(doc);
    }

    return CATEGORY_ORDER.map((category) => ({
      category,
      docs: byCategory.get(category) ?? [],
    })).filter((grp) => grp.docs.length > 0);
  }, [filteredDocs]);

  const flattenedResults = useMemo(
    () => groupedResults.flatMap((grp) => grp.docs),
    [groupedResults],
  );

  const activeDoc = useMemo(() => {
    return (
      flattenedResults.find((doc) => doc.slugPath === activeSlugPath) ??
      flattenedResults[0] ??
      docs.find((doc) => doc.slugPath === activeSlugPath) ??
      docs[0] ??
      null
    );
  }, [flattenedResults, activeSlugPath, docs]);

  const handleSelectPreview = (slugPath: string) => {
    setActiveSlugPath(slugPath);
    setCopiedSnippet(false);
  };

  const handleQuickShelfClick = (slugPath: string) => {
    setSelectedCategory('All');
    setQuery('');
    setActiveSlugPath(slugPath);
    setCopiedSnippet(false);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (query.trim().length > 0) {
        event.preventDefault();
        setQuery('');
      } else {
        inputRef.current?.blur();
      }
      return;
    }

    if (flattenedResults.length === 0) return;

    const currentIndex = flattenedResults.findIndex(
      (doc) => doc.slugPath === activeDoc?.slugPath,
    );

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex =
        currentIndex < 0 ? 0 : (currentIndex + 1) % flattenedResults.length;
      const nextDoc = flattenedResults[nextIndex];
      handleSelectPreview(nextDoc.slugPath);
      rowRefs.current[nextDoc.slugPath]?.scrollIntoView({ block: 'nearest' });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex =
        currentIndex <= 0 ? flattenedResults.length - 1 : currentIndex - 1;
      const prevDoc = flattenedResults[prevIndex];
      handleSelectPreview(prevDoc.slugPath);
      rowRefs.current[prevDoc.slugPath]?.scrollIntoView({ block: 'nearest' });
      return;
    }

    if (event.key === 'Enter' && activeDoc) {
      event.preventDefault();
      router.push(activeDoc.href);
    }
  };

  const handleCopySnippet = async () => {
    if (!activeDoc?.firstCodeSnippet?.code) return;
    try {
      await navigator.clipboard.writeText(activeDoc.firstCodeSnippet.code);
      setCopiedSnippet(true);
      window.setTimeout(() => setCopiedSnippet(false), 1600);
    } catch {
      setCopiedSnippet(false);
    }
  };

  const sectionAnchors = useMemo(() => {
    if (!activeDoc) return [];
    const h2Items = activeDoc.toc.filter((item) => item.level === 2);
    return (h2Items.length > 0 ? h2Items : activeDoc.toc).slice(0, 6);
  }, [activeDoc]);

  return (
    <div
      className={styles.deskShell}
      aria-label="AstraFlow Living Reference Desk"
    >
      <div className={styles.deskHeader}>
        <p className={styles.deskKicker}>
          <span className={styles.deskDot} aria-hidden="true" />
          REFERENCE DESK · {docs.length} VERIFIED DOCS
        </p>
        <span className={styles.shortcutHint}>
          <kbd className={styles.kbd}>Ctrl K</kbd> or{' '}
          <kbd className={styles.kbd}>/</kbd> ·{' '}
          <kbd className={styles.kbd}>↑↓</kbd> +{' '}
          <kbd className={styles.kbd}>Enter</kbd>
        </span>
      </div>

      {/* Search bar */}
      <div className={styles.searchRow}>
        <span className={styles.searchIcon} aria-hidden="true">
          ⌕
        </span>
        <input
          ref={inputRef}
          id={`${baseId}-search`}
          type="search"
          aria-label="Search all AstraFlow documentation"
          placeholder="Search the documentation (e.g. Mediator, Projections, AFAN0101, ADR)..."
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        {query.trim().length > 0 ? (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            Clear
          </button>
        ) : null}
      </div>

      {/* Stepped visual index cards (03-docs-reference-desk.png) */}
      <div
        className={styles.steppedShelf}
        role="group"
        aria-label="Quick index cards"
      >
        {QUICK_INDEX_CARDS.map((card) => {
          const isSelected = activeDoc?.slugPath === card.slugPath;
          return (
            <button
              key={card.slugPath}
              type="button"
              aria-pressed={isSelected}
              className={styles.stepCard}
              onClick={() => handleQuickShelfClick(card.slugPath)}
            >
              <span className={styles.stepTitle}>{card.label}</span>
              <span className={styles.stepSub}>{card.sub}</span>
              <span className={styles.stepArrow} aria-hidden="true">
                ↗
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Filter Pills */}
      <div
        className={styles.categoryRow}
        role="group"
        aria-label="Filter documentation by category"
      >
        <button
          type="button"
          className={styles.categoryBtn}
          aria-pressed={selectedCategory === 'All'}
          onClick={() => setSelectedCategory('All')}
        >
          All ({docs.length})
        </button>
        {availableCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={styles.categoryBtn}
            aria-pressed={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          >
            {category} ({categoryCounts.get(category) ?? 0})
          </button>
        ))}
      </div>

      {/* Split Results + Live Document Inspector Preview */}
      <div className={styles.deskBody}>
        <div className={styles.resultsPane}>
          <div className={styles.resultsBar}>
            <span>
              {flattenedResults.length} match
              {flattenedResults.length === 1 ? '' : 'es'}
            </span>
            <span>{selectedCategory}</span>
          </div>

          {groupedResults.length > 0 ? (
            <div
        className={styles.resultsScroll}
        role="region"
        aria-label="Matching documentation results"
        tabIndex={0}
      >
              {groupedResults.map((group) => (
                <div key={group.category} className={styles.groupBlock}>
                  <p className={styles.groupLabel}>
                    {group.category} ({group.docs.length})
                  </p>
                  {group.docs.map((doc) => {
                    const isActive = activeDoc?.slugPath === doc.slugPath;
                    return (
                      <div key={doc.slugPath} className={styles.resultRow}>
                        <button
                          ref={(el) => {
                            rowRefs.current[doc.slugPath] = el;
                          }}
                          type="button"
                          data-active={isActive ? 'true' : 'false'}
                          aria-pressed={isActive}
                          className={styles.resultBtn}
                          onClick={() => handleSelectPreview(doc.slugPath)}
                        >
                          <span className={styles.resultTitle}>{doc.title}</span>
                          <span className={styles.resultMeta}>
                            {doc.readingMinutes} min · {doc.sourcePath}
                          </span>
                        </button>
                        <Link
                          href={doc.href}
                          className={styles.resultOpenLink}
                          aria-label={`Open ${doc.title}`}
                          title={`Open ${doc.title}`}
                        >
                          ↗
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyResults}>
              No documentation pages match &ldquo;{query.trim()}&rdquo;
              {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.
            </p>
          )}
        </div>

        {/* Right Live Document Inspector */}
        {activeDoc ? (
          <aside
            className={styles.inspectorPane}
            aria-label="Live document inspector preview"
            aria-live="polite"
          >
            <div className={styles.inspectorTop}>
              <span className={styles.categoryPill}>{activeDoc.category}</span>
              <span className={styles.inspectorStats}>
                {activeDoc.readingMinutes} min read · {activeDoc.sourcePath}
              </span>
            </div>

            <h3 className={styles.inspectorTitle}>{activeDoc.title}</h3>
            <p className={styles.inspectorSummary}>{activeDoc.summary}</p>

            {activeDoc.firstCodeSnippet ? (
              <div className={styles.codeCard}>
                <div className={styles.codeHeader}>
                  <span className={styles.codeLang}>
                    {activeDoc.firstCodeSnippet.lang}
                  </span>
                  <button
                    type="button"
                    className={styles.codeCopyBtn}
                    onClick={handleCopySnippet}
                  >
                    {copiedSnippet ? 'Copied ✓' : 'Copy snippet'}
                  </button>
                </div>
                <pre
                  className={styles.codePre}
                  tabIndex={0}
                  data-lang={activeDoc.firstCodeSnippet.lang}
                >
                  <code
                    className={`language-${activeDoc.firstCodeSnippet.lang}`}
                    dangerouslySetInnerHTML={{
                      __html: activeDoc.firstCodeSnippet.html,
                    }}
                  />
                </pre>
              </div>
            ) : null}

            {sectionAnchors.length > 0 ? (
              <div className={styles.anchorsBlock}>
                <span className={styles.anchorsLabel}>Section anchors</span>
                <div className={styles.anchorList}>
                  {sectionAnchors.map((item) => (
                    <Link
                      key={item.id}
                      href={`${activeDoc.href}#${item.id}`}
                      className={styles.anchorChip}
                    >
                      # {item.text}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className={styles.inspectorFooter}>
              <Link href={activeDoc.href} className={styles.openGuideBtn}>
                Open full guide <span aria-hidden="true">↗</span>
              </Link>
              <a
                href={activeDoc.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubLink}
              >
                GitHub source ↗
              </a>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
