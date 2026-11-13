'use client';

import { useEffect, useRef, useState } from 'react';
import type { TocItem } from '@/lib/markdown';
import styles from './DocEnhancements.module.css';

export interface DocEnhancementsProps {
  toc: TocItem[];
  title?: string;
  articleSelector?: string;
  tocSelector?: string;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function DocEnhancements({
  toc,
  title,
  articleSelector = '.docs-prose',
  tocSelector = '.docs-toc',
}: DocEnhancementsProps) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? '');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveStatus, setLiveStatus] = useState('');

  // Top Signal Orange reading progress hairline
  useEffect(() => {
    const updateProgress = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));
      setProgress(Math.round(ratio * 100));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  // Keep desktop .docs-toc in sync with the active heading ID
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

  // IntersectionObserver scrollspy + pre.code-block copy bars + focusable table wraps
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

    const preBlocks = Array.from(
      article.querySelectorAll<HTMLPreElement>('pre.code-block'),
    );
    const cleanups: Array<() => void> = [];

    for (const pre of preBlocks) {
      if (pre.dataset.enhanced === 'true' || !pre.parentNode) {
        continue;
      }

      const rawLang = (pre.dataset.lang || 'text').toUpperCase();
      pre.tabIndex = 0;

      const wrapper = document.createElement('div');
      wrapper.className = styles.codeBlockWrap;

      const bar = document.createElement('div');
      bar.className = styles.codeBlockBar;

      const langBadge = document.createElement('span');
      langBadge.className = styles.codeBlockLang;
      langBadge.textContent = rawLang;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = styles.codeCopyButton;
      button.textContent = 'Copy';
      button.setAttribute('aria-label', `Copy ${rawLang} code`);

      let resetTimer: number | null = null;
      button.addEventListener(
        'click',
        async () => {
          const codeText =
            pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
          const ok = await copyTextToClipboard(codeText);
          if (!ok) {
            return;
          }

          button.textContent = 'Copied ✓';
          button.classList.add(styles.codeCopyButtonCopied);
          setLiveStatus(`${rawLang} code copied to clipboard.`);

          if (resetTimer !== null) {
            window.clearTimeout(resetTimer);
          }
          resetTimer = window.setTimeout(() => {
            button.textContent = 'Copy';
            button.classList.remove(styles.codeCopyButtonCopied);
          }, 1800);
        },
        { signal },
      );

      bar.appendChild(langBadge);
      bar.appendChild(button);

      pre.dataset.enhanced = 'true';
      pre.classList.add(styles.codeBlockPreEnhanced);

      const parent = pre.parentNode;
      parent.insertBefore(wrapper, pre);
      wrapper.appendChild(bar);
      wrapper.appendChild(pre);

      cleanups.push(() => {
        if (resetTimer !== null) {
          window.clearTimeout(resetTimer);
        }
        pre.classList.remove(styles.codeBlockPreEnhanced);
        delete pre.dataset.enhanced;
        if (wrapper.parentNode) {
          wrapper.parentNode.insertBefore(pre, wrapper);
          wrapper.parentNode.removeChild(wrapper);
        }
      });
    }

    return () => {
      abortController.abort();
      observer?.disconnect();
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [articleSelector]);

  const activeTocItem = toc.find((item) => item.id === activeId) ?? toc[0] ?? null;

  return (
    <>
      <div
        aria-label="Article reading progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className={styles.readingProgressTrack}
        role="progressbar"
      >
        <div
          className={styles.readingProgressBar}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.enhancerHost}>
        {toc.length > 0 ? (
          <nav
            aria-label={title ? `Sections in ${title}` : 'On this page'}
            className={styles.mobileToc}
          >
            <button
              aria-controls="doc-mobile-toc-panel"
              aria-expanded={drawerOpen}
              className={styles.mobileTocButton}
              onClick={() => setDrawerOpen((prev) => !prev)}
              type="button"
            >
              <span className={styles.mobileTocCurrent}>
                {activeTocItem ? activeTocItem.text : 'On this page'}
              </span>
              <span className={styles.mobileTocMeta}>
                <span>{toc.length} sections</span>
                <span aria-hidden="true">{drawerOpen ? '−' : '+'}</span>
              </span>
            </button>

            {drawerOpen ? (
              <div className={styles.mobileTocPanel} id="doc-mobile-toc-panel">
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
        ) : null}

        <div aria-live="polite" className={styles.srOnly} role="status">
          {liveStatus}
        </div>
      </div>
    </>
  );
}

export interface CliCopyPillProps {
  command: string;
}

export function CliCopyPill({ command }: CliCopyPillProps) {
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
      <button
        aria-label={`Copy command: ${command}`}
        className={styles.cliCopyBtn}
        onClick={handleCopy}
        type="button"
      >
        {copied ? 'Copied ✓' : 'Copy'}
      </button>
    </div>
  );
}
