'use client';
import { Button, Input, copyTextToClipboard } from '@core/ui';
import { useTranslations } from 'next-intl';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DOC_CATEGORY_MESSAGE_KEYS,
  type DocCategoryGroup,
  type TocItem,
} from '@modules/documentation/data/client';
import styles from './DocEnhancements.module.css';

export interface DocEnhancementsProps {
  toc: TocItem[];
  title?: string;
  articleSelector?: string;
  tocSelector?: string;
}

export interface DocSidebarNavProps {
  categories: DocCategoryGroup[];
  activeSlugPath: string;
}

export interface DocMobileNavDrawerProps {
  categories: DocCategoryGroup[];
  activeSlugPath: string;
  totalCount: number;
}

export function DocSidebarNav({
  categories,
  activeSlugPath,
}: DocSidebarNavProps) {
  const t = useTranslations('documentation.enhancements');
  const tCategory = useTranslations('documentation.categories');
  const [filterQuery, setFilterQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const needle = filterQuery.trim().toLowerCase();
    if (!needle) {
      return categories;
    }
    return categories
      .map((group) => ({
        category: group.category,
        docs: group.docs.filter(
          (doc) =>
            doc.title.toLowerCase().includes(needle) ||
            doc.slugPath.toLowerCase().includes(needle) ||
            doc.category.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.docs.length > 0);
  }, [categories, filterQuery]);

  return (
    <nav aria-label={t('trackNavigationAriaLabel')} className={styles.sidebarNav}>
      <Link className={styles.desktopNavBack} href="/docs">
        {t('backToDocs')}
      </Link>

      <div className={styles.sidebarFilterWrap}>
        <Input
          aria-label={t('filterAriaLabel')}
          autoComplete="off"
          className={styles.sidebarFilterInput}
          onChange={(event) => setFilterQuery(event.target.value)}
          placeholder={t('filterPlaceholder')}
          type="search"
          value={filterQuery}
        />
      </div>

      {filteredCategories.length === 0 ? (
        <p className={styles.sidebarEmpty}>{t('noMatches')}</p>
      ) : (
        filteredCategories.map((group) => (
          <div className={styles.desktopNavGroup} key={group.category}>
            <p className={styles.desktopNavCategory}>
              {tCategory(DOC_CATEGORY_MESSAGE_KEYS[group.category])}
            </p>
            <div className={styles.desktopNavLinks}>
              {group.docs.map((item) => {
                const isCurrent = item.slugPath === activeSlugPath;
                return (
                  <Link
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`${styles.desktopNavLink} ${
                      isCurrent ? styles.desktopNavLinkCurrent : ''
                    }`}
                    href={item.href}
                    key={item.slugPath}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))
      )}
    </nav>
  );
}

export function DocMobileNavDrawer({
  categories,
  activeSlugPath,
  totalCount,
}: DocMobileNavDrawerProps) {
  const t = useTranslations('documentation.enhancements');
  const tCategory = useTranslations('documentation.categories');
  return (
    <details className={styles.mobileNavDetails}>
      <summary className={styles.mobileNavSummary}>
        <span>
          {t('browseSummary', {
            docs: String(totalCount),
            tracks: String(categories.length),
          })}
        </span>
        <span className={styles.mobileNavSummaryTag}>{t('index')}</span>
      </summary>
      <div className={styles.mobileNavBody}>
        <Link className={styles.desktopNavBack} href="/docs">
          {t('backToDocs')}
        </Link>
        {categories.map((group) => (
          <div key={group.category}>
            <p className={styles.mobileNavCatLabel}>
              {tCategory(DOC_CATEGORY_MESSAGE_KEYS[group.category])}
            </p>
            <div className={styles.mobileNavLinks}>
              {group.docs.map((item) => {
                const isCurrent = item.slugPath === activeSlugPath;
                return (
                  <Link
                    aria-current={isCurrent ? 'page' : undefined}
                    className={
                      isCurrent
                        ? `${styles.mobileNavLink} ${styles.mobileNavLinkCurrent}`
                        : styles.mobileNavLink
                    }
                    href={item.href}
                    key={item.slugPath}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

export function DocEnhancements({
  toc,
  title,
  articleSelector = '.docs-prose',
  tocSelector = '.docs-toc',
}: DocEnhancementsProps) {
  const t = useTranslations('documentation.enhancements');
  const progressTrackRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? '');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveStatus, setLiveStatus] = useState('');

  useEffect(() => {
    let rafId: number | null = null;
    let lastPercent = -1;

    const applyProgress = () => {
      rafId = null;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        scrollable <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / scrollable));
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${ratio})`;
      }
      const nextPercent = Math.round(ratio * 100);
      if (nextPercent !== lastPercent && progressTrackRef.current) {
        lastPercent = nextPercent;
        progressTrackRef.current.setAttribute('aria-valuenow', String(nextPercent));
      }
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(applyProgress);
    };

    applyProgress();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    const tocRoot = document.querySelector(tocSelector);
    if (!tocRoot) {
      return;
    }

    const links = Array.from(
      tocRoot.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
    );
    for (const link of links) {
      const hash = link.getAttribute('href')?.slice(1) ?? '';
      const isMatch = Boolean(activeId && hash === activeId);
      link.classList.toggle(styles.activeTocLink, isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }

    return () => {
      for (const link of links) {
        link.classList.remove(styles.activeTocLink);
        link.removeAttribute('aria-current');
      }
    };
  }, [activeId, tocSelector]);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(articleSelector);
    if (!article) {
      return;
    }

    const abortController = new AbortController();
    const { signal } = abortController;

    const tableWraps = Array.from(
      article.querySelectorAll<HTMLElement>('.md-table-wrap'),
    );
    for (const wrap of tableWraps) {
      if (!wrap.hasAttribute('tabindex')) {
        wrap.tabIndex = 0;
      }
    }

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]'),
    );

    let observer: IntersectionObserver | null = null;
    if (headings.length > 0 && typeof IntersectionObserver !== 'undefined') {
      const visibleIds = new Set<string>();

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const id = entry.target.getAttribute('id');
            if (!id) continue;
            if (entry.isIntersecting) {
              visibleIds.add(id);
            } else {
              visibleIds.delete(id);
            }
          }

          if (visibleIds.size > 0) {
            const firstVisible = headings.find((heading) =>
              visibleIds.has(heading.getAttribute('id') ?? ''),
            );
            if (firstVisible?.id) {
              setActiveId(firstVisible.id);
              return;
            }
          }

          const offset = 118;
          let fallbackId = headings[0]?.id ?? '';
          for (const heading of headings) {
            if (heading.getBoundingClientRect().top <= offset) {
              fallbackId = heading.id;
            }
          }
          if (fallbackId) {
            setActiveId(fallbackId);
          }
        },
        {
          rootMargin: '-96px 0px -64% 0px',
          threshold: [0, 1],
        },
      );

      for (const heading of headings) {
        observer.observe(heading);
      }
    }

    const resetTimers = new Map<HTMLButtonElement, number>();

    const handleCodeCopyClick = async (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>('[data-docs-copy-btn]');
      if (!button || !article.contains(button)) return;

      const wrap = button.closest('[data-docs-code-block]');
      const pre = wrap?.querySelector<HTMLPreElement>('pre.code-block');
      const codeText =
        pre?.querySelector('code')?.textContent ?? pre?.textContent ?? '';
      if (!codeText) return;

      const ok = await copyTextToClipboard(codeText);
      if (!ok) return;

      const copyLabel = button.dataset.copyLabel || t('copyCommand');
      const copiedLabel = button.dataset.copiedLabel || t('copiedCommand');
      const rawLang = (pre?.dataset.lang || 'text').toUpperCase();

      button.textContent = copiedLabel;
      button.classList.add('docs-code-copy--copied');
      setLiveStatus(`${rawLang} code copied to clipboard.`);

      const existingTimer = resetTimers.get(button);
      if (existingTimer !== undefined) {
        window.clearTimeout(existingTimer);
      }
      const nextTimer = window.setTimeout(() => {
        button.textContent = copyLabel;
        button.classList.remove('docs-code-copy--copied');
        resetTimers.delete(button);
      }, 1800);
      resetTimers.set(button, nextTimer);
    };

    article.addEventListener('click', handleCodeCopyClick, { signal });

    return () => {
      abortController.abort();
      observer?.disconnect();
      for (const timerId of resetTimers.values()) {
        window.clearTimeout(timerId);
      }
      resetTimers.clear();
    };
  }, [articleSelector, t]);

  const activeTocItem = toc.find((item) => item.id === activeId) ?? toc[0] ?? null;

  return (
    <>
      <div
        aria-label={t('readingProgressAriaLabel')}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={0}
        className={styles.readingProgressTrack}
        ref={progressTrackRef}
        role="progressbar"
      >
        <div className={styles.readingProgressBar} ref={progressBarRef} />
      </div>

      {toc.length > 0 ? (
        <div className={styles.enhancerHost}>
          <nav
            aria-label={title ? t('sectionsIn', { title }) : t('onThisPageNav')}
            className={styles.mobileToc}
          >
            <Button
              aria-controls="doc-mobile-toc-panel"
              aria-expanded={drawerOpen}
              className={styles.mobileTocButton}
              onClick={() => setDrawerOpen((prev) => !prev)}
              type="button"
            >
              <span className={styles.mobileTocCurrent}>
                {activeTocItem ? activeTocItem.text : t('onThisPageNav')}
              </span>
              <span className={styles.mobileTocMeta}>
                <span>{t('sectionsCount', { count: String(toc.length) })}</span>
                <span aria-hidden="true">{drawerOpen ? '−' : '+'}</span>
              </span>
            </Button>

            {drawerOpen ? (
              <div
                className={styles.mobileTocPanel}
                id="doc-mobile-toc-panel"
              >
                {toc.map((item) => {
                  const isActive = item.id === activeId;
                  return (
                    <a
                      aria-current={isActive ? 'location' : undefined}
                      className={`${styles.mobileTocLink} ${
                        isActive ? styles.mobileTocLinkActive : ''
                      }`}
                      data-level={item.level}
                      href={`#${item.id}`}
                      key={item.id}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {item.text}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}

      <div aria-live="polite" className={styles.srOnly} role="status">
        {liveStatus}
      </div>
    </>
  );
}

export interface CliCopyPillProps {
  command: string;
}

export function CliCopyPill({ command }: CliCopyPillProps) {
  const t = useTranslations('documentation.enhancements');
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(command);
    if (!ok) return;
    setCopied(true);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={styles.cliCopyPill}>
      <code className={styles.cliCopyCode}>{command}</code>
      <Button
        aria-label={
          copied
            ? t('copiedCommandAria', { command })
            : t('copyCommandAria', { command })
        }
        className={styles.cliCopyBtn}
        onClick={handleCopy}
        type="button"
      >
        {copied ? t('copiedCommand') : t('copyCommand')}
      </Button>
    </div>
  );
}
