'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type {
  ChangelogRelease,
  ChangelogStats,
  ReleaseProvenanceStatus,
} from '@/lib/changelog';
import { useReducedMotionSafe } from '@/components/hairline';
import { CHANGELOG_FOCUS_EVENT } from './VersionDeck';
import styles from './ReleaseFolio.module.css';

export type ChangelogFilterId =
  | 'all'
  | 'published-confirmed'
  | 'unreleased'
  | 'baseline-historical'
  | 'github-unverified'
  | 'breaking';

export interface ReleaseFolioProps {
  releases: ChangelogRelease[];
  stats: ChangelogStats;
  className?: string;
}

function getStatusBadgeClass(status: ReleaseProvenanceStatus): string {
  switch (status) {
    case 'unreleased':
      return styles.badgeUnreleased;
    case 'published-confirmed':
      return styles.badgeConfirmed;
    case 'published-baseline':
      return styles.badgeBaseline;
    case 'github-unverified':
      return styles.badgeUnverified;
    default:
      return styles.badgeHistorical;
  }
}

function getShortProvenanceCode(release: ChangelogRelease): string {
  switch (release.status) {
    case 'unreleased':
      return `SOURCE ${release.version}`;
    case 'published-confirmed':
      return `NUGET ${release.version}`;
    case 'published-baseline':
      return 'BASELINE';
    case 'github-unverified':
      return 'UNVERIFIED';
    default:
      return 'HISTORICAL';
  }
}

function getProvenanceBannerMeta(release: ChangelogRelease): {
  title: string;
  body: string;
  toneClass: string;
} {
  if (release.status === 'unreleased') {
    return {
      title: `UNRELEASED REPOSITORY SOURCE · ${release.version}`,
      body:
        release.provenanceNote ||
        'Active unreleased development in main source (includes AstraFlow.Assertions). Do not cite as published on NuGet.org.',
      toneClass: styles.bannerUnreleased,
    };
  }
  if (release.status === 'published-confirmed') {
    return {
      title: `PUBLISHED CONFIRMED ON NUGET · ${release.version}`,
      body:
        release.provenanceNote ||
        'Verified published NuGet release suite across shipped packages.',
      toneClass: styles.bannerConfirmed,
    };
  }
  if (release.status === 'github-unverified') {
    return {
      title: `GITHUB RELEASE / NUGET UNVERIFIED · ${release.version}`,
      body:
        release.provenanceNote ||
        'Tagged on GitHub Releases without independently verified NuGet parity across all package IDs.',
      toneClass: styles.bannerUnverified,
    };
  }
  if (release.status === 'published-baseline') {
    return {
      title: `VERIFIED PRIOR BASELINE · ${release.version}`,
      body:
        release.provenanceNote ||
        'Verified baseline release preceding the 2.3.0 package series.',
      toneClass: '',
    };
  }
  return {
    title: `RECORDED SOURCE MILESTONE · ${release.version}`,
    body:
      release.provenanceNote ||
      'Historical release milestone preserved verbatim from CHANGELOG.md.',
    toneClass: '',
  };
}

function getCategoryClass(normalizedTitle: string): string {
  const key = normalizedTitle.toLowerCase();
  if (key.includes('breaking')) return styles.categoryBreaking;
  if (key.includes('add')) return styles.categoryAdded;
  if (key.includes('fix') || key.includes('security')) return styles.categoryFixed;
  return '';
}

export function ReleaseFolio({
  releases,
  stats,
  className,
}: ReleaseFolioProps) {
  const [filter, setFilter] = useState<ChangelogFilterId>('all');
  const [query, setQuery] = useState('');
  const [selectedAnchor, setSelectedAnchor] = useState<string>(
    () => releases[0]?.anchorId ?? '',
  );
  const [notesExpanded, setNotesExpanded] = useState(true);
  const [highlightedAnchor, setHighlightedAnchor] = useState<string | null>(
    null,
  );

  const highlightTimerRef = useRef<number | null>(null);
  const spineBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const stageRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotionSafe();

  const counts = useMemo(
    () => ({
      all: releases.length,
      publishedConfirmed: releases.filter(
        (item) => item.status === 'published-confirmed',
      ).length,
      unreleased: releases.filter((item) => item.status === 'unreleased').length,
      baselineHistorical: releases.filter(
        (item) =>
          item.status === 'published-baseline' ||
          item.status === 'historical-release',
      ).length,
      githubUnverified: releases.filter(
        (item) => item.status === 'github-unverified',
      ).length,
      breaking: releases.filter((item) => item.isBreaking).length,
    }),
    [releases],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredReleases = useMemo(() => {
    return releases.filter((release) => {
      if (
        filter === 'published-confirmed' &&
        release.status !== 'published-confirmed'
      ) {
        return false;
      }
      if (filter === 'unreleased' && release.status !== 'unreleased') {
        return false;
      }
      if (
        filter === 'baseline-historical' &&
        release.status !== 'published-baseline' &&
        release.status !== 'historical-release'
      ) {
        return false;
      }
      if (
        filter === 'github-unverified' &&
        release.status !== 'github-unverified'
      ) {
        return false;
      }
      if (filter === 'breaking' && !release.isBreaking) {
        return false;
      }

      if (!normalizedQuery) return true;

      if (
        release.version.toLowerCase().includes(normalizedQuery) ||
        `v${release.version}`.toLowerCase().includes(normalizedQuery) ||
        release.headline.toLowerCase().includes(normalizedQuery) ||
        release.statusLabel.toLowerCase().includes(normalizedQuery) ||
        release.highlightTags.some((tag) =>
          tag.toLowerCase().includes(normalizedQuery),
        )
      ) {
        return true;
      }

      return release.sections.some(
        (section) =>
          section.title.toLowerCase().includes(normalizedQuery) ||
          section.items.some(
            (item) =>
              !item.isNonePlaceholder &&
              item.text.toLowerCase().includes(normalizedQuery),
          ),
      );
    });
  }, [releases, filter, normalizedQuery]);

  const activeRelease = useMemo(() => {
    const bySelection = filteredReleases.find(
      (item) => item.anchorId === selectedAnchor,
    );
    return bySelection ?? filteredReleases[0] ?? releases[0] ?? null;
  }, [filteredReleases, selectedAnchor, releases]);

  const activeFilterIndex = useMemo(() => {
    if (!activeRelease) return -1;
    return filteredReleases.findIndex(
      (item) => item.anchorId === activeRelease.anchorId,
    );
  }, [filteredReleases, activeRelease]);

  const focusAnchor = useCallback(
    (anchorId: string, shouldScroll = false): boolean => {
      const normalized = anchorId.replace(/^#/, '');
      const match = releases.find(
        (item) =>
          item.anchorId === normalized || `v${item.version}` === normalized,
      );
      if (!match) return false;

      setFilter('all');
      setQuery('');
      setSelectedAnchor(match.anchorId);
      setNotesExpanded(true);
      setHighlightedAnchor(match.anchorId);

      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
      highlightTimerRef.current = window.setTimeout(() => {
        setHighlightedAnchor((curr) =>
          curr === match.anchorId ? null : curr,
        );
      }, 2200);

      if (shouldScroll) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            spineBtnRefs.current[match.anchorId]?.scrollIntoView({
              block: 'nearest',
            });
            const stageEl =
              document.getElementById(match.anchorId) ?? stageRef.current;
            stageEl?.scrollIntoView({
              behavior: reducedMotion ? 'auto' : 'smooth',
              block: 'start',
            });
          });
        });
      }

      return true;
    },
    [releases, reducedMotion],
  );

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      const initialHash = window.location.hash.replace(/^#/, '');
      if (initialHash) {
        focusAnchor(initialHash, false);
      }
    });

    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        focusAnchor(hash, true);
      }
    };

    const handleFocusEvent = (event: Event) => {
      const custom = event as CustomEvent<{ anchorId?: string }>;
      if (
        custom.detail?.anchorId &&
        focusAnchor(custom.detail.anchorId, true)
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener(CHANGELOG_FOCUS_EVENT, handleFocusEvent);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener(CHANGELOG_FOCUS_EVENT, handleFocusEvent);
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, [focusAnchor]);

  function selectReleaseFromSpine(
    release: ChangelogRelease,
    moveFocus = false,
  ) {
    setSelectedAnchor(release.anchorId);
    setNotesExpanded(true);
    if (moveFocus) {
      spineBtnRefs.current[release.anchorId]?.focus();
    }
    if (window.location.hash !== `#${release.anchorId}`) {
      window.history.replaceState(null, '', `#${release.anchorId}`);
    }
  }

  function handleSpineKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (filteredReleases.length === 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next =
        filteredReleases[(index + 1) % filteredReleases.length];
      if (next) selectReleaseFromSpine(next, true);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev =
        filteredReleases[
          (index - 1 + filteredReleases.length) % filteredReleases.length
        ];
      if (prev) selectReleaseFromSpine(prev, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      const first = filteredReleases[0];
      if (first) selectReleaseFromSpine(first, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      const last = filteredReleases[filteredReleases.length - 1];
      if (last) selectReleaseFromSpine(last, true);
    }
  }

  const filterButtons: Array<{
    id: ChangelogFilterId;
    label: string;
    count: number;
  }> = [
    { id: 'all', label: 'All', count: counts.all },
    {
      id: 'published-confirmed',
      label: 'Published Confirmed',
      count: counts.publishedConfirmed,
    },
    {
      id: 'unreleased',
      label: 'Unreleased Source',
      count: counts.unreleased,
    },
    {
      id: 'baseline-historical',
      label: 'Baseline & Historical',
      count: counts.baselineHistorical,
    },
    {
      id: 'github-unverified',
      label: 'GitHub Unverified',
      count: counts.githubUnverified,
    },
    {
      id: 'breaking',
      label: 'Breaking Changes',
      count: counts.breaking,
    },
  ];

  const hasActiveFilter = filter !== 'all' || normalizedQuery.length > 0;
  const activeBanner = activeRelease
    ? getProvenanceBannerMeta(activeRelease)
    : null;
  const visibleSections = activeRelease
    ? activeRelease.sections.filter((sec) => !sec.isEmptyNone)
    : [];

  return (
    <div className={className ? `${styles.folioRoot} ${className}` : styles.folioRoot}>
      <div className={styles.controlsPanel} data-reveal="up">
        <div className={styles.controlsTop}>
          <div className={styles.searchWrap}>
            <input
              type="search"
              className={styles.searchInput}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${stats.totalReleases} releases by version, package, or change...`}
              aria-label={`Search ${stats.totalReleases} AstraFlow releases`}
            />
            {query ? (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setQuery('')}
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className={styles.resultSummary} aria-live="polite">
            <span>
              Showing {filteredReleases.length} of {releases.length} releases
            </span>
            {hasActiveFilter ? (
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => {
                  setFilter('all');
                  setQuery('');
                }}
              >
                Reset filters
              </button>
            ) : null}
          </div>
        </div>

        <div
          className={styles.filterRow}
          role="group"
          aria-label="Filter releases by provenance or breaking status"
        >
          {filterButtons.map((btn) => {
            const pressed = filter === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                aria-pressed={pressed}
                className={styles.filterBtn}
                onClick={() => {
                  setFilter(btn.id);
                  const firstMatch = releases.find((item) => {
                    if (btn.id === 'published-confirmed') {
                      return item.status === 'published-confirmed';
                    }
                    if (btn.id === 'unreleased') {
                      return item.status === 'unreleased';
                    }
                    if (btn.id === 'baseline-historical') {
                      return (
                        item.status === 'published-baseline' ||
                        item.status === 'historical-release'
                      );
                    }
                    if (btn.id === 'github-unverified') {
                      return item.status === 'github-unverified';
                    }
                    if (btn.id === 'breaking') return item.isBreaking;
                    return true;
                  });
                  if (firstMatch) {
                    setSelectedAnchor(firstMatch.anchorId);
                  }
                }}
              >
                <span>{btn.label}</span>
                <span className={styles.filterCount}>({btn.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.folioGrid}>
        <div className={styles.spineColumn} data-reveal="up">
          <div className={styles.spineHeader}>
            <span>CHRONOLOGICAL SPINE</span>
            <span>{filteredReleases.length} ENTRIES</span>
          </div>

          <div
            className={styles.spineListWrap}
            tabIndex={0}
            aria-label="Chronological release history list"
          >
            {filteredReleases.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No releases match the active filter or search term.</p>
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={() => {
                    setFilter('all');
                    setQuery('');
                  }}
                >
                  Show all {releases.length} releases
                </button>
              </div>
            ) : (
              <ol className={styles.spineList}>
                {filteredReleases.map((release, index) => {
                  const isSelected =
                    activeRelease?.anchorId === release.anchorId;
                  return (
                    <li key={release.version} className={styles.spineItem}>
                      <button
                        ref={(el) => {
                          spineBtnRefs.current[release.anchorId] = el;
                        }}
                        type="button"
                        aria-pressed={isSelected}
                        className={styles.spineBtn}
                        onClick={() => selectReleaseFromSpine(release)}
                        onKeyDown={(event) => handleSpineKeyDown(event, index)}
                      >
                        <div className={styles.spineRowTop}>
                          <div className={styles.spineVersionGroup}>
                            <span className={styles.spineVersion}>
                              v{release.version}
                            </span>
                            <span className={styles.spineDate}>
                              {release.releaseDate ??
                                (release.isUnreleased
                                  ? 'Unreleased'
                                  : release.rawQualifier ?? 'Source record')}
                            </span>
                          </div>
                          <span
                            className={`${styles.spineBadge} ${getStatusBadgeClass(
                              release.status,
                            )}`}
                          >
                            {getShortProvenanceCode(release)}
                          </span>
                        </div>

                        <p className={styles.spineHeadline}>{release.headline}</p>

                        <div className={styles.spineMetaRow}>
                          <span>{release.itemCount} changes</span>
                          {release.isBreaking ? (
                            <span className={styles.breakingChip}>
                              Breaking changes
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>

        <div className={styles.stageColumn} data-reveal="up">
          {activeRelease ? (
            <article
              ref={stageRef}
              id={activeRelease.anchorId}
              className={`${styles.stageFolio}${
                highlightedAnchor === activeRelease.anchorId
                  ? ` ${styles.stageFolioHighlight}`
                  : ''
              }`}
              aria-live="polite"
            >
              <div className={styles.stageTopMeta}>
                <span>EDITION FOLIO / VERIFIED SOURCE RECORD</span>
                <span>
                  {activeFilterIndex >= 0
                    ? `${activeFilterIndex + 1} OF ${filteredReleases.length}`
                    : `v${activeRelease.version}`}
                </span>
              </div>

              <header className={styles.stageHeader}>
                <div className={styles.stageVersionLine}>
                  <h3 className={styles.monumentalVersion}>
                    v{activeRelease.version}
                  </h3>
                  <div className={styles.stagePills}>
                    <span
                      className={`${styles.spineBadge} ${getStatusBadgeClass(
                        activeRelease.status,
                      )}`}
                    >
                      {activeRelease.statusLabel}
                    </span>
                    {activeRelease.releaseDate ? (
                      <span className={styles.highlightTag}>
                        {activeRelease.releaseDate}
                      </span>
                    ) : null}
                    {activeRelease.isBreaking ? (
                      <span className={styles.breakingChip}>
                        Breaking changes
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className={styles.stageHeadline}>{activeRelease.headline}</p>

                {activeRelease.highlightTags.length > 0 ? (
                  <div className={styles.highlightTags}>
                    {activeRelease.highlightTags.map((tag) => (
                      <span key={tag} className={styles.highlightTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </header>

              {activeBanner ? (
                <div
                  className={`${styles.provenanceBanner} ${activeBanner.toneClass}`}
                >
                  <span className={styles.bannerTitle}>{activeBanner.title}</span>
                  <p className={styles.bannerText}>{activeBanner.body}</p>
                </div>
              ) : null}

              <div className={styles.drawerBar}>
                <button
                  type="button"
                  aria-expanded={notesExpanded}
                  aria-controls={`${activeRelease.anchorId}-detail`}
                  className={styles.notesToggleBtn}
                  onClick={() => setNotesExpanded((prev) => !prev)}
                >
                  {notesExpanded
                    ? `Hide structured change notes (${activeRelease.itemCount})`
                    : `Show structured change notes (${activeRelease.itemCount})`}
                </button>
              </div>

              {notesExpanded ? (
                <div
                  id={`${activeRelease.anchorId}-detail`}
                  className={styles.sectionsDetail}
                >
                  {activeRelease.isBreaking &&
                  activeRelease.breakingChanges.length > 0 ? (
                    <div className={styles.breakingAlert} role="note">
                      <span className={styles.breakingTitle}>
                        BREAKING / COMPATIBILITY NOTICE
                      </span>
                      <ul className={styles.itemList}>
                        {activeRelease.breakingChanges.map((item, idx) => (
                          <li
                            key={`brk-${idx}`}
                            dangerouslySetInnerHTML={{ __html: item.html }}
                          />
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {visibleSections.length > 0 ? (
                    visibleSections.map((section) => {
                      const items = section.items.filter(
                        (item) => !item.isNonePlaceholder,
                      );
                      if (items.length === 0) return null;
                      return (
                        <section
                          key={section.title}
                          className={styles.sectionBlock}
                          aria-label={`${section.title} changes in v${activeRelease.version}`}
                        >
                          <div className={styles.sectionHeadingRow}>
                            <span
                              className={`${styles.categoryBadge} ${getCategoryClass(
                                section.normalizedTitle,
                              )}`}
                            >
                              {section.title}
                            </span>
                            <span className={styles.categoryCount}>
                              {items.length}{' '}
                              {items.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                          <ul className={styles.itemList}>
                            {items.map((item, itemIdx) => (
                              <li
                                key={`${section.title}-${itemIdx}`}
                                dangerouslySetInnerHTML={{ __html: item.html }}
                              />
                            ))}
                          </ul>
                        </section>
                      );
                    })
                  ) : (
                    <div className={styles.sectionBlock}>
                      <p className={styles.bannerText}>
                        {activeRelease.rawHeading} — see CHANGELOG.md for full
                        source context.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              <footer className={styles.stageFooter}>
                <button
                  type="button"
                  className={styles.stepBtn}
                  disabled={activeFilterIndex <= 0}
                  onClick={() => {
                    const newer = filteredReleases[activeFilterIndex - 1];
                    if (newer) selectReleaseFromSpine(newer);
                  }}
                >
                  ← Newer edition
                </button>
                <button
                  type="button"
                  className={styles.stepBtn}
                  disabled={
                    activeFilterIndex < 0 ||
                    activeFilterIndex >= filteredReleases.length - 1
                  }
                  onClick={() => {
                    const older = filteredReleases[activeFilterIndex + 1];
                    if (older) selectReleaseFromSpine(older);
                  }}
                >
                  Older edition →
                </button>
                <a
                  href={activeRelease.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.changelogLink}
                >
                  View in CHANGELOG.md ↗
                </a>
              </footer>
            </article>
          ) : null}
        </div>
      </div>
    </div>
  );
}
