'use client';

import Link from 'next/link';
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
import styles from './DocsSearch.module.css';

export interface DocsSearchProps {
  docs: DocSummary[];
  categories: DocCategoryGroup[];
  initialSlugPath?: string;
}

const CATEGORY_ORDER: readonly DocCategory[] = [
  'Getting Started',
  'Core & Mapping',
  'Integrations',
  'Diagnostics, Tooling & Testing',
  'Reference & Operations',
  'Architecture Decisions (ADRs)',
];

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

function filterAndScoreDocs(
  docs: readonly DocSummary[],
  query: string,
  selectedCategory: DocCategory | 'All',
): DocSummary[] {
  const categoryPool =
    selectedCategory === 'All'
      ? docs
      : docs.filter((doc) => doc.category === selectedCategory);

  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [...categoryPool];
  }

  const terms = trimmed.split(/\s+/).filter(Boolean);
  return categoryPool
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

async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  if (typeof document === 'undefined') return false;
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(area);
    return copied;
  } catch {
    return false;
  }
}

export function DocsSearch({
  docs,
  categories,
  initialSlugPath = 'getting-started',
}: DocsSearchProps) {
  const inputId = useId();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const resetCopyTimerRef = useRef<number | null>(null);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | 'All'>('All');
  const [activeSlugPath, setActiveSlugPath] = useState<string>(() => {
    const initial = docs.find((d) => d.slugPath === initialSlugPath);
    return initial?.slugPath ?? docs[0]?.slugPath ?? '';
  });
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const categoryCounts = useMemo(() => {
    const counts = new Map<DocCategory, number>();
    if (categories.length > 0) {
      for (const group of categories) {
        counts.set(group.category, group.docs.length);
      }
      return counts;
    }
    for (const doc of docs) {
      counts.set(doc.category, (counts.get(doc.category) ?? 0) + 1);
    }
    return counts;
  }, [categories, docs]);

  const filteredDocs = useMemo(
    () => filterAndScoreDocs(docs, query, selectedCategory),
    [docs, query, selectedCategory],
  );

  const activeDoc = useMemo(() => {
    if (filteredDocs.length === 0) return null;
    return (
      filteredDocs.find((d) => d.slugPath === activeSlugPath) ?? filteredDocs[0]
    );
  }, [activeSlugPath, filteredDocs]);

  useEffect(() => {
    const handleWindowKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (resetCopyTimerRef.current !== null) {
        window.clearTimeout(resetCopyTimerRef.current);
      }
    };
  }, []);

  const handleCategoryChange = (nextCategory: DocCategory | 'All') => {
    setSelectedCategory(nextCategory);
    const nextFiltered = filterAndScoreDocs(docs, query, nextCategory);
    if (
      nextFiltered.length > 0 &&
      !nextFiltered.some((d) => d.slugPath === activeSlugPath)
    ) {
      setActiveSlugPath(nextFiltered[0].slugPath);
    }
  };

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    const nextFiltered = filterAndScoreDocs(docs, nextQuery, selectedCategory);
    if (
      nextFiltered.length > 0 &&
      !nextFiltered.some((d) => d.slugPath === activeSlugPath)
    ) {
      setActiveSlugPath(nextFiltered[0].slugPath);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (query) {
        event.preventDefault();
        handleQueryChange('');
      } else {
        searchInputRef.current?.blur();
      }
      return;
    }

    if (event.key === 'ArrowDown' && filteredDocs.length > 0) {
      event.preventDefault();
      setActiveSlugPath(filteredDocs[0].slugPath);
      cardRefs.current[0]?.focus();
    }
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let targetIndex: number | null = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      targetIndex = Math.min(filteredDocs.length - 1, index + 1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      if (index === 0) {
        searchInputRef.current?.focus();
        return;
      }
      targetIndex = Math.max(0, index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      targetIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      targetIndex = filteredDocs.length - 1;
    }

    if (targetIndex !== null && filteredDocs[targetIndex]) {
      setActiveSlugPath(filteredDocs[targetIndex].slugPath);
      cardRefs.current[targetIndex]?.focus();
    }
  };

  const handleCopyPreviewSnippet = async () => {
    if (!activeDoc?.firstCodeSnippet) return;
    const ok = await copyText(activeDoc.firstCodeSnippet.code);
    if (!ok) return;
    setCopiedSlug(activeDoc.slugPath);
    if (resetCopyTimerRef.current !== null) {
      window.clearTimeout(resetCopyTimerRef.current);
    }
    resetCopyTimerRef.current = window.setTimeout(() => {
      setCopiedSlug(null);
    }, 1800);
  };

  const snippetCopied = Boolean(activeDoc && copiedSlug === activeDoc.slugPath);

  return (
    <div className={styles.deskRoot}>
      <div className={styles.controlsBar}>
        <div className={styles.searchRow}>
          <div className={styles.searchFieldWrap}>
            <span aria-hidden="true" className={styles.searchIcon}>
              ⌕
            </span>
            <input
              aria-label="Search all AstraFlow documentation"
              autoComplete="off"
              className={styles.searchInput}
              id={inputId}
              onChange={(event) => handleQueryChange(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search APIs, mediator pipelines, mapping, analyzers, ADRs..."
              ref={searchInputRef}
              type="search"
              value={query}
            />
            <span aria-hidden="true" className={styles.keycapGroup}>
              <kbd className={styles.keycap}>/</kbd>
              <kbd className={styles.keycap}>⌘ K</kbd>
            </span>
          </div>

          <span aria-live="polite" className={styles.resultCount} role="status">
            {filteredDocs.length} of {docs.length} guides
          </span>
        </div>

        <div
          aria-label="Filter documentation categories"
          className={styles.filterGroup}
          role="group"
        >
          <button
            aria-pressed={selectedCategory === 'All'}
            className={`${styles.filterPill} ${
              selectedCategory === 'All' ? styles.filterPillActive : ''
            }`}
            onClick={() => handleCategoryChange('All')}
            type="button"
          >
            <span>All tracks</span>
            <span className={styles.filterCount}>{docs.length}</span>
          </button>

          {CATEGORY_ORDER.map((category) => {
            const count = categoryCounts.get(category) ?? 0;
            if (count === 0) return null;
            const isPressed = selectedCategory === category;
            return (
              <button
                aria-pressed={isPressed}
                className={`${styles.filterPill} ${
                  isPressed ? styles.filterPillActive : ''
                }`}
                key={category}
                onClick={() => handleCategoryChange(category)}
                type="button"
              >
                <span>{category}</span>
                <span className={styles.filterCount}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.workbench}>
        <div
          aria-label="Matching documentation results"
          className={styles.resultsGrid}
          role="region"
        >
          {filteredDocs.length === 0 ? (
            <div className={styles.emptyState} role="status">
              <p>
                No guides matched <strong>“{query}”</strong> in{' '}
                <strong>{selectedCategory}</strong>.
              </p>
              <button
                className={styles.resetBtn}
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('All');
                  setActiveSlugPath(docs[0]?.slugPath ?? '');
                }}
                type="button"
              >
                Reset search & filters
              </button>
            </div>
          ) : (
            filteredDocs.map((doc, index) => {
              const isSelected = activeDoc?.slugPath === doc.slugPath;
              return (
                <article
                  className={`${styles.docCard} ${
                    isSelected ? styles.docCardSelected : ''
                  }`}
                  key={doc.slugPath}
                >
                  <button
                    aria-pressed={isSelected}
                    className={styles.cardInspectBtn}
                    onClick={() => setActiveSlugPath(doc.slugPath)}
                    onFocus={() => setActiveSlugPath(doc.slugPath)}
                    onKeyDown={(event) => handleCardKeyDown(event, index)}
                    onMouseEnter={() => setActiveSlugPath(doc.slugPath)}
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    type="button"
                  >
                    <div className={styles.cardEyebrowRow}>
                      <span className={styles.cardEyebrow}>
                        {String(index + 1).padStart(2, '0')} / {doc.category}
                      </span>
                      {doc.isUnreleasedSource ? (
                        <span className={styles.unreleasedTag}>2.4.0 SOURCE</span>
                      ) : null}
                    </div>
                    <strong className={styles.cardTitle}>{doc.title}</strong>
                    <span className={styles.cardSummary}>{doc.summary}</span>
                  </button>

                  <div className={styles.cardFooter}>
                    <span className={styles.cardMeta}>
                      {doc.readingMinutes} min read
                    </span>
                    <Link className={styles.cardOpenLink} href={doc.href}>
                      Open guide
                      <span className={styles.srOnly}> — {doc.title}</span>{' '}
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <aside
          aria-label="Live document inspector preview"
          aria-live="polite"
          className={styles.lensCard}
        >
          {activeDoc ? (
            <>
              <div className={styles.lensTopBar}>
                <span className={styles.lensEyebrow}>
                  REFERENCE LENS / ACTIVE
                </span>
                <span className={styles.lensSourcePath}>{activeDoc.sourcePath}</span>
              </div>

              <h3 className={styles.lensTitle}>{activeDoc.title}</h3>

              <div className={styles.lensMetaRow}>
                <span>{activeDoc.category}</span>
                <span>{activeDoc.readingMinutes} min read</span>
                <span>{activeDoc.wordCount} words</span>
                {activeDoc.isUnreleasedSource ? (
                  <span className={styles.unreleasedTag}>2.4.0 UNRELEASED SOURCE</span>
                ) : null}
              </div>

              <p className={styles.lensSummary}>{activeDoc.summary}</p>

              {activeDoc.toc.length > 0 ? (
                <div>
                  <p className={styles.lensSectionLabel}>On this page</p>
                  <div className={styles.headingPillGrid}>
                    {activeDoc.toc.slice(0, 6).map((heading) => (
                      <Link
                        className={styles.headingPill}
                        href={`${activeDoc.href}#${heading.id}`}
                        key={heading.id}
                      >
                        {heading.text}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeDoc.firstCodeSnippet ? (
                <div className={styles.codePreviewWrap}>
                  <div className={styles.codePreviewBar}>
                    <span className={styles.codePreviewLang}>
                      {activeDoc.firstCodeSnippet.lang.toUpperCase()} PREVIEW
                    </span>
                    <button
                      aria-label={
                        snippetCopied
                          ? `Copied ✓ (${activeDoc.firstCodeSnippet.lang.toUpperCase()} preview)`
                          : `Copy snippet (${activeDoc.firstCodeSnippet.lang.toUpperCase()} preview)`
                      }
                      className={styles.copyBtn}
                      onClick={handleCopyPreviewSnippet}
                      type="button"
                    >
                      {snippetCopied ? 'Copied ✓' : 'Copy snippet'}
                    </button>
                  </div>
                  <pre className={styles.codePreviewPre} tabIndex={0}>
                    <code
                      className={`language-${activeDoc.firstCodeSnippet.lang}`}
                      dangerouslySetInnerHTML={{
                        __html: activeDoc.firstCodeSnippet.html,
                      }}
                    />
                  </pre>
                </div>
              ) : null}

              <div className={styles.lensActions}>
                <Link className="button button-primary" href={activeDoc.href}>
                  Read full guide{' '}
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </Link>
                <a
                  className="button button-outline"
                  href={activeDoc.githubUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  View markdown source{' '}
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </a>
              </div>
            </>
          ) : (
            <p className={styles.lensSummary}>
              Select a documentation guide or adjust your filters to inspect its table of
              contents and source code preview.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
