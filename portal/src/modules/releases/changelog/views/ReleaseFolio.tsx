"use client";
import { Button, Input } from '@core/ui';
import { useTranslations } from 'next-intl';

import {
  Fragment,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  circ,
  poly,
  rrect,
  seg,
  useReducedMotionSafe,
} from "@core/hairline";
import type { ChangelogRelease, ChangelogStats } from '../data/model';
import styles from "./ReleaseFolio.module.css";

export type ReleaseFilter =
  | "all"
  | "latest"
  | "major"
  | "feature"
  | "historical"
  | "breaking"
  | "deprecated";

export interface ReleaseFolioProps {
  releases: readonly ChangelogRelease[];
  stats: ChangelogStats;
  selectedAnchor?: string;
  onSelectRelease?: (anchorId: string) => void;
  filter?: ReleaseFilter;
  onFilterChange?: (filter: ReleaseFilter) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

function matchesFilter(
  release: ChangelogRelease,
  filter: ReleaseFilter,
): boolean {
  switch (filter) {
    case "latest":
      return release.status === "latest";
    case "major":
      return release.status === "major";
    case "feature":
      return release.status === "feature";
    case "historical":
      return release.status === "historical";
    case "breaking":
      return release.isBreaking;
    case "deprecated":
      return release.hasDeprecations;
    case "all":
    default:
      return true;
  }
}

function matchesQuery(
  release: ChangelogRelease,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const haystacks = [
    release.version,
    `v${release.version}`,
    release.statusLabel,
    release.provenanceNote,
    release.headline,
    release.rawQualifier ?? "",
    ...release.highlightTags,
    ...release.sections.flatMap((section) => [
      section.title,
      ...section.items.map((item) => item.text),
    ]),
  ];

  return haystacks.some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
}

function getBadgeStyleClass(release: ChangelogRelease): string {
  if (release.isDeprecated) {
    return styles.badgeDeprecated;
  }
  switch (release.status) {
    case "latest":
      return styles.badgeLatest;
    case "major":
      return styles.badgePublished;
    case "feature":
      return styles.badgeFeature;
    case "deprecated":
      return styles.badgeDeprecated;
    case "historical":
    default:
      return styles.badgeHistorical;
  }
}

function sanitizeProductNoteText(text: string): string {
  return text.replace(/\bScope In\s+\d+(?:\.\d+)*\b:?\s*/gi, "");
}

function FormattedNoteText({ text }: { text: string }) {
  const cleanText = sanitizeProductNoteText(text);
  const parts = cleanText.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return <code key={index}>{part.slice(1, -1)}</code>;
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

/**
 * Pure Hairline corner geometry for the folio artwork sheet (zero SVG text).
 */
function FolioCornerGeometry() {
  const frame = useMemo(
    () => poly(rrect(4, 4, 40, 40, 6).map((sample) => [sample.u, sample.v])),
    [],
  );
  const orbit = useMemo(
    () => poly(circ(10, 20, 22, 22).map((sample) => [sample.u, sample.v])),
    [],
  );
  const diag = useMemo(() => seg([10, 34], [34, 10]), []);

  return (
    <svg
      className={styles.folioArtCorner}
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
    >
      <path d={frame} stroke="rgba(8, 44, 38, 0.28)" strokeWidth="1.2" />
      <path d={orbit} stroke="#b73921" strokeWidth="1.2" />
      <path d={diag} stroke="rgba(8, 44, 38, 0.45)" strokeWidth="1.2" />
      <circle cx="22" cy="22" r="2.5" fill="#082c26" />
    </svg>
  );
}

export function ReleaseFolio({
  releases,
  stats,
  selectedAnchor,
  onSelectRelease,
  filter,
  onFilterChange,
  searchQuery,
  onSearchQueryChange,
}: ReleaseFolioProps) {
  const t = useTranslations('releases.changelog.folio');
  const reducedMotion = useReducedMotionSafe();
  const [internalFilter, setInternalFilter] = useState<ReleaseFilter>("all");
  const [internalSearch, setInternalSearch] = useState("");
  const [internalAnchor, setInternalAnchor] = useState(
    () => releases[0]?.anchorId ?? "",
  );
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeFilter = filter ?? internalFilter;
  const activeSearch = searchQuery ?? internalSearch;
  const activeAnchor = selectedAnchor ?? internalAnchor;

  const setFilter = (next: ReleaseFilter) => {
    if (onFilterChange) {
      onFilterChange(next);
    } else {
      setInternalFilter(next);
    }
  };

  const setSearch = (next: string) => {
    if (onSearchQueryChange) {
      onSearchQueryChange(next);
    } else {
      setInternalSearch(next);
    }
  };

  const selectRelease = (anchorId: string) => {
    if (onSelectRelease) {
      onSelectRelease(anchorId);
    } else {
      setInternalAnchor(anchorId);
    }
  };

  const normalizedQuery = activeSearch.trim().toLowerCase();

  const filteredReleases = useMemo(
    () =>
      releases.filter(
        (release) =>
          matchesFilter(release, activeFilter) &&
          matchesQuery(release, normalizedQuery),
      ),
    [releases, activeFilter, normalizedQuery],
  );

  const activeIndex = useMemo(() => {
    if (filteredReleases.length === 0) {
      return -1;
    }
    const found = filteredReleases.findIndex(
      (release) => release.anchorId === activeAnchor,
    );
    return found >= 0 ? found : 0;
  }, [filteredReleases, activeAnchor]);

  const activeRelease =
    activeIndex >= 0 ? filteredReleases[activeIndex] : undefined;

  const globalPosition = activeRelease
    ? releases.findIndex((item) => item.anchorId === activeRelease.anchorId)
    : -1;

  const handleFilterClick = (nextFilter: ReleaseFilter) => {
    setFilter(nextFilter);
    const nextList = releases.filter(
      (release) =>
        matchesFilter(release, nextFilter) &&
        matchesQuery(release, normalizedQuery),
    );
    if (
      nextList.length > 0 &&
      !nextList.some((release) => release.anchorId === activeAnchor)
    ) {
      selectRelease(nextList[0].anchorId);
    }
  };

  const handleSearchChange = (nextQuery: string) => {
    setSearch(nextQuery);
    const nextNormalized = nextQuery.trim().toLowerCase();
    const nextList = releases.filter(
      (release) =>
        matchesFilter(release, activeFilter) &&
        matchesQuery(release, nextNormalized),
    );
    if (
      nextList.length > 0 &&
      !nextList.some((release) => release.anchorId === activeAnchor)
    ) {
      selectRelease(nextList[0].anchorId);
    }
  };

  const handleReset = () => {
    setFilter("all");
    setSearch("");
    if (releases[0]) {
      selectRelease(releases[0].anchorId);
    }
  };

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (filteredReleases.length === 0) {
      return;
    }

    let targetIndex: number | null = null;
    if (event.key === "ArrowDown") {
      targetIndex = Math.min(index + 1, filteredReleases.length - 1);
    } else if (event.key === "ArrowUp") {
      targetIndex = Math.max(index - 1, 0);
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = filteredReleases.length - 1;
    }

    if (targetIndex !== null) {
      event.preventDefault();
      const target = filteredReleases[targetIndex];
      if (target) {
        selectRelease(target.anchorId);
        rowRefs.current[targetIndex]?.focus();
      }
    }
  };

  const filterLabels: Record<ReleaseFilter, string> = {
    all: t('filterLabels.all'),
    latest: t('filterLabels.latest'),
    major: t('filterLabels.major'),
    feature: t('filterLabels.feature'),
    historical: t('filterLabels.historical'),
    breaking: t('filterLabels.breaking'),
    deprecated: t('filterLabels.deprecated'),
  };

  const filterOptions: ReadonlyArray<{
    key: ReleaseFilter;
    count: number;
  }> = [
    { key: "all", count: stats.totalReleases },
    { key: "latest", count: stats.latestCount },
    { key: "major", count: stats.majorCount },
    { key: "feature", count: stats.featureCount },
    { key: "historical", count: stats.historicalCount },
    {
      key: "breaking",
      count: stats.breakingReleaseCount,
    },
    ...(stats.deprecatedReleaseCount > 0
      ? [
          {
            key: "deprecated" as const,
            count: stats.deprecatedReleaseCount,
          },
        ]
      : []),
  ];

  const localizedSpineTag = (release: ChangelogRelease): string => {
    const date = release.releaseDate;
    if (release.status === 'deprecated') {
      return date
        ? t('spineDeprecatedDate', { date })
        : t('spineDeprecated');
    }
    if (release.isDeprecated && release.status === 'historical') {
      return date
        ? t('spineDeprecatedDate', { date })
        : t('spineDeprecatedMajor', { major: release.version.split('.')[0] ?? t('legacyMajor') });
    }
    if (release.status === 'latest') {
      const isLatestNuGet = release.statusLabel === 'Latest NuGet';
      if (isLatestNuGet) {
        return date
          ? t('spineLatestNuGetDate', { date })
          : t('spineLatestNuGet');
      }
      return date ? t('spineLatestDate', { date }) : t('spineLatest');
    }
    if (release.status === 'major') {
      return date ? t('spineMajorDate', { date }) : t('spineMajor');
    }
    if (release.status === 'feature') {
      return date ? t('spineFeatureDate', { date }) : t('spineFeature');
    }
    return date ? t('spineArchiveDate', { date }) : t('spineArchive');
  };

  const localizedStatusLabel = (release: ChangelogRelease): string => {
    if (release.isUnreleased) return t('upcomingStatus');
    if (release.status === 'latest') return release.statusLabel;
    if (release.isDeprecated && release.status === 'historical') {
      return t('legacyArchiveStatus', {
        major: release.version.split('.')[0] ?? t('legacyMajor'),
      });
    }
    return filterLabels[release.status];
  };

  return (
    <div className={styles.folio}>
      <div className={styles.folioSelectors}>
        <div className={styles.spineBar}>
          <p className={styles.spineKicker}>{t('spine')}</p>
          <p className={styles.spineCount}>
            {t('releaseCount', {
              shown: String(filteredReleases.length),
              total: String(releases.length),
            })}
          </p>
        </div>

        <div className={styles.controlsBlock}>
          <div className={styles.searchField}>
            <Input
              id="changelog-search"
              type="search"
              className={styles.searchInput}
              value={activeSearch}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={t('filterPlaceholder')}
              aria-label={t('searchAriaLabel', { count: String(releases.length) })}
            />
            {activeSearch ? (
              <Button
                type="button"
                className={styles.clearButton}
                onClick={() => handleSearchChange("")}
              >
                {t('clear')}
              </Button>
            ) : null}
          </div>

          <div
            className={styles.filterGroup}
            role="group"
            aria-label={t('categoryFilterAriaLabel')}
          >
            {filterOptions.map((option) => {
              const isSelected = activeFilter === option.key;
              return (
                <Button
                  key={option.key}
                  type="button"
                  aria-pressed={isSelected}
                  className={`${styles.filterPill} ${
                    isSelected ? styles.filterPillActive : ""
                  }`}
                  onClick={() => handleFilterClick(option.key)}
                >
                  <span>{filterLabels[option.key]}</span>
                  <span className={styles.filterCount}>{option.count}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {filteredReleases.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>{t('noMatchesTitle')}</p>
            <p className={styles.emptyCopy}>
              {t('noMatchesText')}
            </p>
            <Button
              type="button"
              className={styles.stepButton}
              onClick={handleReset}
            >
              {t('reset')}
            </Button>
          </div>
        ) : (
          <ol
            className={styles.folioList}
            tabIndex={0}
            data-lenis-prevent
            aria-label={t('entriesAriaLabel')}
          >
            {filteredReleases.map((release, index) => {
              const isSelected = release.anchorId === activeRelease?.anchorId;
              return (
                <li key={release.anchorId} className={styles.folioListItem}>
                  <Button
                    ref={(node) => {
                      rowRefs.current[index] = node;
                    }}
                    type="button"
                    aria-current={isSelected ? "true" : undefined}
                    className={`${styles.folioRow} ${
                      isSelected ? styles.folioRowActive : ""
                    }`}
                    onClick={() => selectRelease(release.anchorId)}
                    onKeyDown={(event) => handleRowKeyDown(event, index)}
                  >
                    <span className={styles.folioRowMain}>
                      <span className={styles.folioRowHeader}>
                        <span className={styles.folioRowVersion}>
                          v{release.version}
                        </span>
                        <span
                          className={`${styles.folioRowTag} ${
                            release.isDeprecated
                              ? styles.folioRowTagDeprecated
                              : release.status === "latest"
                                ? styles.folioRowTagLatest
                                : ""
                          }`}
                        >
                          {localizedSpineTag(release)}
                        </span>
                        {release.isBreaking ? (
                          <span
                            className={`${styles.folioRowTag} ${styles.folioRowTagBreaking}`}
                          >
                            {t('breaking')}
                          </span>
                        ) : null}
                        {release.hasDeprecations && !release.isDeprecated ? (
                          <span
                            className={`${styles.folioRowTag} ${styles.folioRowTagDeprecated}`}
                          >
                            {t('deprecated')}
                          </span>
                        ) : null}
                      </span>
                      <span className={styles.folioRowHeadline}>
                        {release.headline}
                      </span>
                    </span>
                    <span className={styles.folioRowArrow} aria-hidden="true">
                      ↗
                    </span>
                  </Button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <aside className={styles.folioFeature} aria-label={t('selectedNotesAriaLabel')}>
        {!activeRelease ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>{t('selectReleaseTitle')}</p>
            <p className={styles.emptyCopy}>
              {t('selectReleaseText')}
            </p>
          </div>
        ) : (
          <article id={activeRelease.anchorId} className={styles.folioCard}>
            <div className={styles.folioArt}>
              <div className={styles.folioArtBack} aria-hidden="true">
                <span className={styles.folioArtBackLabel}>{t('releaseFolio')}</span>
              </div>
              <div className={styles.folioArtMiddle} aria-hidden="true" />

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeRelease.version}
                  className={styles.folioArtFront}
                  initial={
                    reducedMotion
                      ? { opacity: 1, rotate: -6 }
                      : { opacity: 1, y: 10, rotate: -8, scale: 0.98 }
                  }
                  animate={{ opacity: 1, y: 0, rotate: -6, scale: 1 }}
                  exit={
                    reducedMotion
                      ? { opacity: 0, rotate: -6 }
                      : { opacity: 0, y: -8, rotate: -4, scale: 0.98 }
                  }
                  transition={{
                    duration: reducedMotion ? 0.08 : 0.28,
                    ease: [0.22, 0.75, 0.19, 1],
                  }}
                >
                  <p className={styles.folioArtEyebrow}>
                    {t('edition', {
                      number: String(Math.max(0, globalPosition) + 1).padStart(2, '0'),
                    })}
                  </p>
                  <p className={styles.folioArtVersion}>
                    v{activeRelease.version}
                  </p>
                  <div className={styles.folioArtBottom}>
                    <p className={styles.folioArtProvenance}>
                      {localizedSpineTag(activeRelease)}
                    </p>
                    <FolioCornerGeometry />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className={styles.folioDetail}>
              <div className={styles.badgeRow}>
                <span
                  className={`${styles.statusBadge} ${getBadgeStyleClass(
                    activeRelease,
                  )}`}
                >
                  {localizedStatusLabel(activeRelease)}
                </span>
                {activeRelease.releaseDate ? (
                  <span className={styles.dateChip}>
                    {t('date', { date: activeRelease.releaseDate })}
                  </span>
                ) : null}
                {activeRelease.isBreaking ? (
                  <span className={styles.breakingChip}>{t('breakingChanges')}</span>
                ) : null}
                {activeRelease.hasDeprecations &&
                !activeRelease.isDeprecated ? (
                  <span className={styles.deprecatedChip}>{t('deprecations')}</span>
                ) : null}
              </div>

              <h3 className={styles.folioHeadline}>{activeRelease.headline}</h3>
              <p className={styles.folioProvenance}>
                {activeRelease.provenanceNote}
              </p>

              {activeRelease.highlightTags.length > 0 ? (
                <ul className={styles.tagList} aria-label={t('highlightedAreas')}>
                  {activeRelease.highlightTags.slice(0, 6).map((tag) => (
                    <li key={tag} className={styles.tagItem}>
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}

              <Button
                type="button"
                className={styles.notesToggle}
                aria-expanded={isNotesExpanded}
                aria-controls={`${activeRelease.anchorId}-detail`}
                onClick={() => setIsNotesExpanded((prev) => !prev)}
              >
                <span>
                  {isNotesExpanded
                    ? t('hideNotes')
                    : t('showNotes')}
                </span>
                <span className={styles.notesCount}>
                  {activeRelease.itemCount}{" "}
                  {t(activeRelease.itemCount === 1 ? 'entry' : 'entries')}
                </span>
              </Button>

              <div
                id={`${activeRelease.anchorId}-detail`}
                hidden={!isNotesExpanded}
                className={styles.notesDetail}
                data-lenis-prevent
              >
                {activeRelease.sections.some((section) =>
                  section.items.some((item) => !item.isNonePlaceholder),
                ) ? (
                  activeRelease.sections.map((section) => {
                    const substantiveItems = section.items.filter(
                      (item) => !item.isNonePlaceholder,
                    );
                    if (substantiveItems.length === 0) {
                      return null;
                    }
                    const isBreakingSection =
                      section.normalizedTitle === "Breaking Changes";
                    const isDeprecatedSection =
                      section.normalizedTitle === "Deprecated";

                    return (
                      <section
                        key={section.title}
                        className={styles.sectionBlock}
                      >
                        <h4
                          className={`${styles.sectionHeading} ${
                            isBreakingSection
                              ? styles.sectionHeadingBreaking
                              : isDeprecatedSection
                                ? styles.sectionHeadingDeprecated
                                : ""
                          }`}
                        >
                          {section.title}
                        </h4>
                        <ul className={styles.sectionItems}>
                          {substantiveItems.map((item, idx) => (
                            <li key={idx} className={styles.sectionItem}>
                              <FormattedNoteText text={item.text} />
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })
                ) : (
                  <p className={styles.emptyNotes}>
                    No additional change bullets are recorded for{" "}
                    <code>{activeRelease.rawHeading}</code>. View the full
                    release note on GitHub below.
                  </p>
                )}
              </div>

              <div className={styles.folioActions}>
                <div className={styles.stepButtons}>
                  <Button
                    type="button"
                    className={styles.stepButton}
                    disabled={activeIndex <= 0}
                    onClick={() => {
                      const prev = filteredReleases[activeIndex - 1];
                      if (prev) {
                        selectRelease(prev.anchorId);
                      }
                    }}
                  >
                    ← Newer
                  </Button>
                  <Button
                    type="button"
                    className={styles.stepButton}
                    disabled={activeIndex >= filteredReleases.length - 1}
                    onClick={() => {
                      const next = filteredReleases[activeIndex + 1];
                      if (next) {
                        selectRelease(next.anchorId);
                      }
                    }}
                  >
                    Older →
                  </Button>
                </div>

                <a
                  className={styles.sourceLink}
                  href={activeRelease.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub ↗
                </a>
              </div>
            </div>
          </article>
        )}
      </aside>
    </div>
  );
}
