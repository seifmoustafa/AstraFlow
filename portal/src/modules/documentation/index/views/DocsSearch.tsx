'use client';
import { Button, Input } from '@core/ui';
import { useTranslations } from 'next-intl';

import Link from 'next/link';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  DOC_CATEGORY_MESSAGE_KEYS,
  DOC_CATEGORY_ORDER,
  searchDocSummaries,
  type DocCategory,
  type DocCategoryGroup,
  type DocSummary,
} from '@modules/documentation/data/client';
import { useReducedMotionSafe } from '@core/hairline';
import styles from './DocsSearch.module.css';

export interface DocsSearchProps {
  docs: DocSummary[];
  categories: DocCategoryGroup[];
  initialSlugPath?: string;
}

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
  const t = useTranslations('documentation.search');
  const tCategory = useTranslations('documentation.categories');
  const inputId = useId();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const resetCopyTimerRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotionSafe();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | 'All'>('All');
  const [showAllUnfiltered, setShowAllUnfiltered] = useState(false);
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
    () => searchDocSummaries(docs, query, selectedCategory),
    [docs, query, selectedCategory],
  );

  const isDefaultUnfilteredView =
    selectedCategory === 'All' && query.trim() === '';
  const hasCollapsibleOverflow =
    isDefaultUnfilteredView && filteredDocs.length > 10;
  const visibleDocs =
    hasCollapsibleOverflow && !showAllUnfiltered
      ? filteredDocs.slice(0, 10)
      : filteredDocs;

  const activeDoc = useMemo(() => {
    if (visibleDocs.length === 0) return null;
    return (
      visibleDocs.find((d) => d.slugPath === activeSlugPath) ?? visibleDocs[0]
    );
  }, [activeSlugPath, visibleDocs]);

  const activeDocIndex = useMemo(() => {
    if (!activeDoc) return 0;
    const found = visibleDocs.findIndex((d) => d.slugPath === activeDoc.slugPath);
    return found >= 0 ? found : 0;
  }, [activeDoc, visibleDocs]);

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
    const nextFiltered = searchDocSummaries(docs, query, nextCategory);
    if (
      nextFiltered.length > 0 &&
      !nextFiltered.some((d) => d.slugPath === activeSlugPath)
    ) {
      setActiveSlugPath(nextFiltered[0].slugPath);
    }
  };

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    const nextFiltered = searchDocSummaries(docs, nextQuery, selectedCategory);
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
      targetIndex = Math.min(visibleDocs.length - 1, index + 1);
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
      targetIndex = visibleDocs.length - 1;
    } else if (event.key === 'Escape') {
      event.preventDefault();
      searchInputRef.current?.focus();
      return;
    }

    if (targetIndex !== null && visibleDocs[targetIndex]) {
      setActiveSlugPath(visibleDocs[targetIndex].slugPath);
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
    <div className={styles.craftReference}>
      <div className={styles.topRuleLine}>
        <span className={styles.topRuleLeft}>
          {t('topRule')}
        </span>
        <span className={styles.topRuleCount} role="status">
          {filteredDocs.length === docs.length
            ? t('allGuidesCount', { count: String(docs.length) })
            : t('filteredGuidesCount', {
                filtered: String(filteredDocs.length),
                total: String(docs.length),
              })}
        </span>
      </div>

      {/* Giant Frameless Editorial Underline Search Bar */}
      <div className={styles.underlineSearchBar}>
        <span aria-hidden="true" className={styles.searchGlyph}>
          ⌕
        </span>
        <label className={styles.srOnly} htmlFor={inputId}>
          {t('searchAriaLabel')}
        </label>
        <Input
          aria-label={t('searchAriaLabel')}
          autoComplete="off"
          className={styles.underlineInput}
          id={inputId}
          onChange={(event) => handleQueryChange(event.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={t('searchPlaceholder')}
          ref={searchInputRef}
          type="search"
          value={query}
        />
        <div className={styles.searchKeycaps}>
          {query ? (
            <Button
              className={styles.clearBtn}
              onClick={() => {
                handleQueryChange('');
                searchInputRef.current?.focus();
              }}
              type="button"
            >
              {t('clear')}
            </Button>
          ) : null}
          <kbd aria-hidden="true" className={styles.kbdChip}>
            /
          </kbd>
          <kbd aria-hidden="true" className={styles.kbdChip}>
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* Track Filter Pills */}
      <div
        aria-label={t('categoriesAriaLabel')}
        className={styles.filterPills}
        role="group"
      >
        <Button
          aria-pressed={selectedCategory === 'All'}
          className={`${styles.filterPill} ${
            selectedCategory === 'All' ? styles.filterPillActive : ''
          }`}
          onClick={() => handleCategoryChange('All')}
          type="button"
        >
          <span>{t('allTopics')}</span>
          <span className={styles.filterCount}>{docs.length}</span>
        </Button>

        {DOC_CATEGORY_ORDER.map((category) => {
          const count = categoryCounts.get(category) ?? 0;
          if (count === 0) return null;
          const isPressed = selectedCategory === category;

          return (
            <Button
              aria-pressed={isPressed}
              className={`${styles.filterPill} ${
                isPressed ? styles.filterPillActive : ''
              }`}
              key={category}
              onClick={() => handleCategoryChange(category)}
              type="button"
            >
              <span>{tCategory(DOC_CATEGORY_MESSAGE_KEYS[category])}</span>
              <span className={styles.filterCount}>{count}</span>
            </Button>
          );
        })}
      </div>

      {/* 2-Column Results Grid + Sticky Warm-Parchment Reference Lens */}
      <div className={styles.craftReferenceGrid}>
        <div
          aria-label={t('resultsAriaLabel')}
          className={styles.resultsGrid}
          role="region"
        >
          {filteredDocs.length === 0 ? (
            <div className={styles.emptyState} role="status">
              <h3>{t('noResultsTitle')}</h3>
              <p>
                {t('noResultsLead')} <code>mediator</code>, <code>mapper</code>,{' '}
                <code>diagnostics</code>, {t('noResultsTail')}
              </p>
              <Button
                className="button button-outline"
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('All');
                  searchInputRef.current?.focus();
                }}
                type="button"
              >
                {t('resetFilters')}
              </Button>
            </div>
          ) : (
            <>
              {visibleDocs.map((doc, index) => {
                const isSelected = activeDoc?.slugPath === doc.slugPath;
                return (
                  <article
                    className={`${styles.resultCard} ${
                      isSelected ? styles.resultCardActive : ''
                    }`}
                    key={doc.slugPath}
                  >
                    <Button
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
                          {String(index + 1).padStart(2, '0')} /{' '}
                          {tCategory(DOC_CATEGORY_MESSAGE_KEYS[doc.category])}
                        </span>
                      </div>
                      <strong className={styles.cardTitle}>{doc.title}</strong>
                      <span className={styles.cardSummary}>{doc.summary}</span>
                      <span className={styles.cardFocusHint}>
                        {isSelected ? t('inFocus') : t('selectToInspect')}
                      </span>
                    </Button>

                    <div className={styles.cardFooter}>
                      <span className={styles.cardMeta}>
                        {t('readMinutes', { count: String(doc.readingMinutes) })}
                      </span>
                      <Link className={styles.cardOpenLink} href={doc.href}>
                        {t('openGuide')}
                        <span className={styles.srOnly}> — {doc.title}</span>{' '}
                        <span aria-hidden="true">↗</span>
                      </Link>
                    </div>
                  </article>
                );
              })}

              {hasCollapsibleOverflow ? (
                <div className={styles.showAllToggleWrap}>
                  <Button
                    aria-expanded={showAllUnfiltered}
                    className={styles.showAllToggleBtn}
                    onClick={() => setShowAllUnfiltered((prev) => !prev)}
                    type="button"
                  >
                    <span>
                      {showAllUnfiltered
                        ? t('collapseArticles')
                        : t('showAllArticles', { count: String(filteredDocs.length) })}
                    </span>
                    <span className={styles.showAllMeta}>
                      {showAllUnfiltered
                        ? t('showingAll', {
                            count: String(filteredDocs.length),
                            total: String(filteredDocs.length),
                          })
                        : t('showingFeatured', { count: String(filteredDocs.length) })}
                    </span>
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <aside
          aria-label={t('inspectorAriaLabel')}
          aria-live="polite"
          className={styles.lensInspector}
        >
          <div className={styles.lensHeader}>
            <span className={styles.lensEyebrow}>
              {t('inspectorTitle')} <strong>{t('activeInspection')}</strong>
            </span>
            {activeDoc ? (
              <span className={styles.lensSourcePath}>{activeDoc.sourcePath}</span>
            ) : null}
          </div>

          <div aria-hidden="true" className={styles.inspectorRule}>
            <span />
          </div>

          <AnimatePresence mode="wait">
            {activeDoc ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? {} : { opacity: 0, y: -6 }}
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                key={activeDoc.slugPath}
                transition={{ duration: reducedMotion ? 0 : 0.16 }}
              >
                <div className={styles.inspectorIndexLine}>
                  <span>
                    {String(activeDocIndex + 1).padStart(2, '0')} /{' '}
                    {String(filteredDocs.length).padStart(2, '0')} ·{' '}
                    {tCategory(DOC_CATEGORY_MESSAGE_KEYS[activeDoc.category])} ·{' '}
                    {activeDoc.readingMinutes} MIN READ
                  </span>
                </div>

                <h3 className={styles.lensTitle}>{activeDoc.title}</h3>
                <p className={styles.lensSummary}>{activeDoc.summary}</p>

                {activeDoc.toc.length > 0 ? (
                  <div className={styles.tocPreviewBox}>
                    <p className={styles.lensSectionLabel}>{t('onThisPage')}</p>
                    <div className={styles.headingPillGrid}>
                      {activeDoc.toc.slice(0, 5).map((heading) => (
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
                        {t('snippetPreview', {
                          language: activeDoc.firstCodeSnippet.lang.toUpperCase(),
                        })}
                      </span>
                      <Button
                        aria-label={
                          snippetCopied
                            ? t('copiedSnippetAria', {
                                language: activeDoc.firstCodeSnippet.lang.toUpperCase(),
                              })
                            : t('copySnippetAria', {
                                language: activeDoc.firstCodeSnippet.lang.toUpperCase(),
                              })
                        }
                        className={styles.copyBtn}
                        onClick={handleCopyPreviewSnippet}
                        type="button"
                      >
                        {snippetCopied ? t('copied') : t('copySnippet')}
                      </Button>
                    </div>
                    <pre
                      className={styles.codePreviewPre}
                      data-lenis-prevent=""
                      tabIndex={0}
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

                <Link className={styles.inspectorActionLink} href={activeDoc.href}>
                  <span>{t('exploreReference')}</span>
                  <span aria-hidden="true" className={styles.inspectorArrow}>
                    ↗
                  </span>
                </Link>

                <div className={styles.inspectorFooter}>
                  <a
                    className={styles.inspectorGithubLink}
                    href={activeDoc.githubUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('sourceOnGitHub')}
                  </a>
                </div>
              </motion.div>
            ) : (
              <p className={styles.lensSummary} key="empty">
                {t('emptyInspector')}
              </p>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
