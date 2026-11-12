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
import {
  createCamera,
  createFacingPredicate,
  createIsoPlateGeometry,
  fitCamera,
  IsoPrism,
  IsoSignalConduit,
  projectCamera,
  r2,
  seg,
  staggerDelayMs,
  useReducedMotionSafe,
  useViewportActivity,
  WARM_FOREST_PALETTE,
  type IsoPlateGeometry,
  type IsoPrismVariant,
  type Point2,
  type Point3,
} from '@/components/hairline';
import styles from './ChangelogLivingEdition.module.css';

const FOCUS_EVENT_NAME = 'astraflow:changelog-focus';

const HERO_TIER_VERSIONS = ['2.4.0', '2.3.0', '2.2.0', '2.1.0', '2.0.0'] as const;

type FilterKind =
  | 'all'
  | 'published-confirmed'
  | 'baseline-historical'
  | 'unreleased'
  | 'github-unverified'
  | 'breaking';

export interface ChangelogFolioHeroProps {
  releases: ChangelogRelease[];
  stats?: ChangelogStats;
  activeVersion?: string;
  onSelectVersion?: (version: string) => void;
  onJumpToVersion?: (anchorId: string) => void;
  className?: string;
}

export interface ChangelogChronicleProps {
  releases: ChangelogRelease[];
  stats: ChangelogStats;
  className?: string;
}

export interface ChangelogLivingEditionProps {
  releases: ChangelogRelease[];
  stats: ChangelogStats;
  mode?: 'hero' | 'chronicle';
  className?: string;
}

function getBadgeClass(status: ReleaseProvenanceStatus): string {
  switch (status) {
    case 'unreleased':
      return `${styles.provenanceBadge} ${styles.badgeUnreleased}`;
    case 'published-confirmed':
      return `${styles.provenanceBadge} ${styles.badgePublishedConfirmed}`;
    case 'published-baseline':
      return `${styles.provenanceBadge} ${styles.badgePublishedBaseline}`;
    case 'github-unverified':
      return `${styles.provenanceBadge} ${styles.badgeGithubUnverified}`;
    case 'historical-release':
      return `${styles.provenanceBadge} ${styles.badgeHistorical}`;
  }
}

function getShortTierLabel(status: ReleaseProvenanceStatus): string {
  switch (status) {
    case 'unreleased':
      return 'Unreleased';
    case 'published-confirmed':
      return 'NuGet Latest';
    case 'published-baseline':
      return 'Baseline';
    case 'github-unverified':
      return 'GH Unverified';
    case 'historical-release':
      return 'Major 2.0';
  }
}

function getPlateVariant(status: ReleaseProvenanceStatus): IsoPrismVariant {
  switch (status) {
    case 'unreleased':
      return 'terracotta';
    case 'published-confirmed':
      return 'forest';
    case 'published-baseline':
      return 'ivory';
    case 'github-unverified':
      return 'sand';
    case 'historical-release':
      return 'ivory';
  }
}

function getTierBaseZ(status: ReleaseProvenanceStatus): { z0: number; z1: number } {
  switch (status) {
    case 'unreleased':
      return { z0: 6, z1: 16 };
    case 'published-confirmed':
      return { z0: 10, z1: 22 };
    case 'published-baseline':
      return { z0: 6, z1: 16 };
    case 'github-unverified':
      return { z0: 4, z1: 14 };
    case 'historical-release':
      return { z0: 2, z1: 12 };
  }
}

interface FolioPlateEntry {
  index: number;
  release: ChangelogRelease;
  geometry: IsoPlateGeometry;
  spineTickPath: string;
  dotPoints: Point2[];
  accentBar: string;
}

const FOLIO_WIDTH = 560;
const FOLIO_HEIGHT = 250;

export function ChangelogFolioHero({
  releases,
  activeVersion,
  onSelectVersion,
  onJumpToVersion,
  className,
}: ChangelogFolioHeroProps) {
  const tierReleases = useMemo(() => {
    const picked: ChangelogRelease[] = [];
    for (const version of HERO_TIER_VERSIONS) {
      const found = releases.find((item) => item.version === version);
      if (found) picked.push(found);
    }
    if (picked.length === 0) {
      return releases.slice(0, 5);
    }
    return picked;
  }, [releases]);

  const defaultIndex = useMemo(() => {
    if (activeVersion) {
      const idx = tierReleases.findIndex((item) => item.version === activeVersion);
      if (idx >= 0) return idx;
    }
    const publishedIdx = tierReleases.findIndex(
      (item) => item.status === 'published-confirmed',
    );
    return publishedIdx >= 0 ? publishedIdx : 0;
  }, [tierReleases, activeVersion]);

  const [selectedIndex, setSelectedIndex] = useState<number>(defaultIndex);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const effectiveIndex = useMemo(() => {
    if (activeVersion) {
      const found = tierReleases.findIndex((item) => item.version === activeVersion);
      if (found >= 0) return found;
    }
    return Math.min(selectedIndex, Math.max(0, tierReleases.length - 1));
  }, [activeVersion, selectedIndex, tierReleases]);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = useReducedMotionSafe();
  const stageActivity = useViewportActivity(stageRef, {
    paused: reducedMotion,
    initialInView: true,
  });

  const scene = useMemo(() => {
    const n = Math.max(1, tierReleases.length);
    const mid = (n - 1) / 2;
    const stepX = 34;
    const stepY = -52;
    const halfX = 22;
    const halfY = 24;
    const maxLift = 15;

    const cam = createCamera(45, 0.5, 1.32);
    const extrema: Point3[] = [];
    for (let i = 0; i < n; i++) {
      const cx = (i - mid) * stepX;
      const cy = (i - mid) * stepY;
      const zSpec = getTierBaseZ(tierReleases[i].status);
      extrema.push(
        [cx - halfX, cy - halfY, 0],
        [cx + halfX, cy + halfY, 0],
        [cx - halfX, cy + halfY, zSpec.z1 + maxLift],
        [cx + halfX, cy - halfY, zSpec.z1 + maxLift],
      );
      extrema.push([cx, cy + 36, 0]);
    }
    fitCamera(cam, extrema, FOLIO_WIDTH / 2, FOLIO_HEIGHT / 2 + 8);

    const P = projectCamera(cam);
    const front = createFacingPredicate(cam);

    const plates: FolioPlateEntry[] = [];
    const spinePoints: Point2[] = [];

    for (let i = 0; i < n; i++) {
      const release = tierReleases[i];
      const cx = (i - mid) * stepX;
      const cy = (i - mid) * stepY;
      const zSpec = getTierBaseZ(release.status);

      const geometry = createIsoPlateGeometry({
        camera: cam,
        project: P,
        front,
        x0: cx - halfX,
        y0: cy - halfY,
        x1: cx + halfX,
        y1: cy + halfY,
        z0: zSpec.z0,
        z1: zSpec.z1,
        radius: 5.5,
        creaseInset: 2,
        steps: 6,
      });

      const spinePt = P(cx, cy + 36, 0);
      const plateAnchor = P(cx, cy + halfY, zSpec.z0);
      spinePoints.push(spinePt);

      const dotPoints: Point2[] = [];
      const tierCount = n - i;
      for (let d = 0; d < tierCount; d++) {
        dotPoints.push(P(cx - 12 + d * 5, cy - 13, zSpec.z1));
      }

      const accentBar = seg(
        P(cx - 12, cy + 10, zSpec.z1),
        P(cx + 12, cy + 10, zSpec.z1),
      );

      plates.push({
        index: i,
        release,
        geometry,
        spineTickPath: seg(plateAnchor, spinePt),
        dotPoints,
        accentBar,
      });
    }

    const sortedPlates = [...plates].sort(
      (a, b) => a.geometry.depthKey - b.geometry.depthKey,
    );

    // Order spine chronological: 2.0.0 (last index) -> 2.4.0 (index 0)
    const chronologicalSpine = [...spinePoints].reverse();

    return {
      plates,
      sortedPlates,
      chronologicalSpine,
    };
  }, [tierReleases]);

  if (tierReleases.length === 0) {
    return null;
  }

  const activeRelease = tierReleases[effectiveIndex] ?? tierReleases[0];
  const count = tierReleases.length;
  // Chronological spine runs from index n-1 (2.0.0) up to index 0 (2.4.0)
  const spineProgress =
    count > 1 ? (count - 1 - effectiveIndex) / (count - 1) : 1;

  function selectFolio(nextIndex: number, moveFocus = false) {
    const wrapped = (nextIndex + count) % count;
    setSelectedIndex(wrapped);
    const chosen = tierReleases[wrapped];
    if (chosen) {
      onSelectVersion?.(chosen.version);
    }
    if (moveFocus) {
      tabRefs.current[wrapped]?.focus();
    }
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectFolio(index + 1, true);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectFolio(index - 1, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectFolio(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectFolio(count - 1, true);
    }
  }

  function handleSvgKeyDown(
    event: KeyboardEvent<SVGGElement>,
    index: number,
  ) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectFolio(index + 1, false);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectFolio(index - 1, false);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectFolio(0, false);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectFolio(count - 1, false);
    }
  }

  function handleJumpToNotes() {
    const targetId = activeRelease.anchorId;
    if (onJumpToVersion) {
      onJumpToVersion(targetId);
      return;
    }
    const focusEvent = new CustomEvent<{ anchorId: string }>(
      FOCUS_EVENT_NAME,
      {
        detail: { anchorId: targetId },
        cancelable: true,
      },
    );
    const unhandled = window.dispatchEvent(focusEvent);
    if (window.location.hash !== `#${targetId}`) {
      window.history.replaceState(null, '', `#${targetId}`);
    }
    if (unhandled) {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }

  return (
    <div
      ref={stageRef}
      className={
        className ? `${styles.folioStage} ${className}` : styles.folioStage
      }
      aria-label="AstraFlow version provenance folio stage"
    >
      <div className={styles.folioTopBar}>
        <span>FIGURE 04 / PROVENANCE FOLIO STACK</span>
        <span>
          ACTIVE TIER: v{activeRelease.version}
        </span>
      </div>

      <div className={styles.folioCanvasWrap}>
        <svg
          className={styles.folioSvg}
          viewBox={`0 0 ${FOLIO_WIDTH} ${FOLIO_HEIGHT}`}
          role="group"
          aria-label="Interactive release provenance folio plates"
        >
          {/* Spine registration ticks linking folio plates to editorial axis */}
          {scene.plates.map((plate) => (
            <path
              key={`tick-${plate.release.version}`}
              d={plate.spineTickPath}
              fill="none"
              stroke={
                plate.index === effectiveIndex
                  ? WARM_FOREST_PALETTE.signal
                  : WARM_FOREST_PALETTE.border
              }
              strokeWidth={plate.index === effectiveIndex ? 1.4 : 1}
              strokeDasharray="2 3"
              aria-hidden="true"
            />
          ))}

          {/* Editorial Spine Signal Conduit */}
          <IsoSignalConduit
            points={scene.chronologicalSpine}
            cornerRadius={4}
            active
            progress={spineProgress}
            viewportActive={stageActivity.isActive}
            surface="ivory"
            baseColor={WARM_FOREST_PALETTE.muted}
            baseStrokeWidth={1.25}
            activeStrokeWidth={2}
            pulseDurationMs={2600}
            pulseRadius={2.9}
            showTerminals
            ariaLabel={`Release provenance timeline positioned at ${activeRelease.version}`}
          />

          {/* Stacked Isometric Folio Plates rendered back-to-front */}
          {scene.sortedPlates.map((plate) => {
            const isSelected = plate.index === effectiveIndex;
            const isHovered = hoveredIndex === plate.index;
            const liftPx = isSelected ? 14 : isHovered ? 6 : 0;
            const variant = getPlateVariant(plate.release.status);
            const isDarkPlate = variant === 'forest' || variant === 'dark-forest';

            const markColor = isSelected
              ? WARM_FOREST_PALETTE.signal
              : isDarkPlate
                ? WARM_FOREST_PALETTE.peach
                : WARM_FOREST_PALETTE.inkSecondary;

            return (
              <IsoPrism
                key={plate.release.version}
                geometry={plate.geometry}
                variant={variant}
                selected={isSelected}
                active={isHovered}
                liftPx={liftPx}
                delayMs={staggerDelayMs(plate.index, effectiveIndex, 45)}
                showDropGuides={isSelected || isHovered}
                role="button"
                ariaPressed={isSelected}
                label={`Inspect release ${plate.release.version}: ${plate.release.statusLabel}`}
                onSelect={() => selectFolio(plate.index)}
                onHoverChange={(hovering) =>
                  setHoveredIndex(hovering ? plate.index : null)
                }
                onKeyDown={(event) => handleSvgKeyDown(event, plate.index)}
                dataTestId={`folio-plate-${plate.release.version}`}
              >
                <path
                  d={plate.accentBar}
                  fill="none"
                  stroke={markColor}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  pointerEvents="none"
                />
                {plate.dotPoints.map(([dx, dy], dotIdx) => (
                  <circle
                    key={`folio-dot-${plate.release.version}-${dotIdx}`}
                    cx={r2(dx)}
                    cy={r2(dy)}
                    r={1.35}
                    fill={
                      isSelected
                        ? WARM_FOREST_PALETTE.signal
                        : isDarkPlate
                          ? WARM_FOREST_PALETTE.paperRaised
                          : WARM_FOREST_PALETTE.ink
                    }
                    pointerEvents="none"
                  />
                ))}
              </IsoPrism>
            );
          })}
        </svg>
      </div>

      <div
        className={styles.folioTabStrip}
        role="tablist"
        aria-label="Key AstraFlow release provenance milestones"
      >
        {tierReleases.map((release, index) => {
          const isSelected = index === effectiveIndex;
          return (
            <button
              key={release.version}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`folio-tab-${release.version}`}
              aria-selected={isSelected}
              aria-controls="folio-inspector-panel"
              tabIndex={isSelected ? 0 : -1}
              data-tier={release.status}
              className={styles.folioTab}
              onClick={() => selectFolio(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <strong className={styles.folioTabVersion}>
                {release.version}
              </strong>
              <span className={styles.folioTabKind}>
                {getShortTierLabel(release.status)}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="folio-inspector-panel"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`folio-tab-${activeRelease.version}`}
        className={styles.folioInspector}
      >
        <div className={styles.folioInspectorTop}>
          <div className={styles.folioVersionTitle}>
            <strong>{activeRelease.version}</strong>
            <span className={styles.folioDateMeta}>
              {activeRelease.releaseDate
                ? activeRelease.releaseDate
                : activeRelease.isUnreleased
                  ? 'Source branch · Unpublished'
                  : `${activeRelease.itemCount} notes`}
            </span>
          </div>
          <span className={getBadgeClass(activeRelease.status)}>
            {activeRelease.statusLabel}
          </span>
        </div>

        <p className={styles.folioHeadline}>{activeRelease.headline}</p>
        <p className={styles.folioNote}>{activeRelease.provenanceNote}</p>

        <div className={styles.folioActions}>
          <div className={styles.folioTagRow}>
            {activeRelease.highlightTags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tagChip}>
                {tag}
              </span>
            ))}
          </div>

          <button
            type="button"
            className={styles.jumpBtn}
            onClick={handleJumpToNotes}
          >
            Jump to full {activeRelease.version} notes ↓
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChangelogChronicle({
  releases,
  stats,
  className,
}: ChangelogChronicleProps) {
  const [filter, setFilter] = useState<FilterKind>('all');
  const [query, setQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<string[]>(() => {
    const initial: string[] = [];
    const v24 = releases.find((item) => item.version === '2.4.0');
    const v23 = releases.find((item) => item.version === '2.3.0');
    if (v24) initial.push(v24.anchorId);
    if (v23) initial.push(v23.anchorId);
    return initial;
  });
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotionSafe();

  const focusAnchor = useCallback(
    (anchorId: string, shouldScroll = false): boolean => {
      const match = releases.find((item) => item.anchorId === anchorId);
      if (!match) return false;

      setFilter('all');
      setQuery('');
      setOpenIds((prev) =>
        prev.includes(match.anchorId) ? prev : [...prev, match.anchorId],
      );
      setHighlightedId(match.anchorId);

      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
      highlightTimerRef.current = window.setTimeout(() => {
        setHighlightedId((curr) => (curr === match.anchorId ? null : curr));
      }, 2400);

      if (shouldScroll) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            const el = document.getElementById(match.anchorId);
            el?.scrollIntoView({
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
        focusAnchor(hash, false);
      }
    };

    const handleFocusEvent = (event: Event) => {
      const custom = event as CustomEvent<{ anchorId?: string }>;
      if (custom.detail?.anchorId && focusAnchor(custom.detail.anchorId, true)) {
        event.preventDefault();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener(FOCUS_EVENT_NAME, handleFocusEvent);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener(FOCUS_EVENT_NAME, handleFocusEvent);
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, [focusAnchor]);

  const counts = useMemo(() => {
    return {
      all: releases.length,
      publishedConfirmed: releases.filter(
        (item) => item.status === 'published-confirmed',
      ).length,
      baselineHistorical: releases.filter(
        (item) =>
          item.status === 'published-baseline' ||
          item.status === 'historical-release',
      ).length,
      unreleased: releases.filter((item) => item.status === 'unreleased').length,
      githubUnverified: releases.filter(
        (item) => item.status === 'github-unverified',
      ).length,
      breaking: releases.filter((item) => item.isBreaking).length,
    };
  }, [releases]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredReleases = useMemo(() => {
    return releases.filter((release) => {
      if (filter === 'published-confirmed' && release.status !== 'published-confirmed') {
        return false;
      }
      if (
        filter === 'baseline-historical' &&
        release.status !== 'published-baseline' &&
        release.status !== 'historical-release'
      ) {
        return false;
      }
      if (filter === 'unreleased' && release.status !== 'unreleased') {
        return false;
      }
      if (filter === 'github-unverified' && release.status !== 'github-unverified') {
        return false;
      }
      if (filter === 'breaking' && !release.isBreaking) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

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

      return release.sections.some((section) =>
        section.items.some(
          (item) =>
            !item.isNonePlaceholder &&
            item.text.toLowerCase().includes(normalizedQuery),
        ),
      );
    });
  }, [releases, filter, normalizedQuery]);

  const allVisibleOpen =
    filteredReleases.length > 0 &&
    filteredReleases.every((item) => openIds.includes(item.anchorId));

  function toggleRelease(anchorId: string) {
    setOpenIds((prev) =>
      prev.includes(anchorId)
        ? prev.filter((item) => item !== anchorId)
        : [...prev, anchorId],
    );
  }

  function toggleAllVisible() {
    const visibleIds = filteredReleases.map((item) => item.anchorId);
    if (allVisibleOpen) {
      setOpenIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setOpenIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape' && query) {
      event.preventDefault();
      setQuery('');
    }
  }

  return (
    <div
      className={
        className ? `${styles.chronicleRoot} ${className}` : styles.chronicleRoot
      }
    >
      {/* Provenance Summary Strip */}
      <div className={styles.statsStrip} aria-label="Changelog provenance summary">
        <div className={styles.statCell}>
          <span className={styles.statLabel}>Latest Published NuGet</span>
          <strong className={styles.statValue}>
            {stats.latestPublishedVersion}
          </strong>
          <span className={styles.statSub}>2026-11-10 · Maintainer confirmed</span>
        </div>
        <div className={styles.statCell}>
          <span className={styles.statLabel}>Unreleased Source Line</span>
          <strong className={styles.statValue}>
            {stats.latestUnreleasedVersion}
          </strong>
          <span className={styles.statSub}>Not yet published on NuGet.org</span>
        </div>
        <div className={styles.statCell}>
          <span className={styles.statLabel}>Tracked Versions</span>
          <strong className={styles.statValue}>{stats.totalReleases}</strong>
          <span className={styles.statSub}>
            {stats.publishedCount} published/historical ·{' '}
            {stats.githubUnverifiedCount} GH unverified
          </span>
        </div>
        <div className={styles.statCell}>
          <span className={styles.statLabel}>Breaking Releases</span>
          <strong className={styles.statValue}>
            {stats.breakingReleaseCount}
          </strong>
          <span className={styles.statSub}>Full section breakdown below</span>
        </div>
      </div>

      {/* Search + Provenance Filter Controls */}
      <div className={styles.controlsBar}>
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <label htmlFor="changelog-search" className={styles.searchLabel}>
              Search releases by version, API, or keyword
            </label>
            <input
              id="changelog-search"
              type="search"
              className={styles.searchInput}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search version (e.g. 2.3.0, 2.4.0) or keyword (e.g. Projections, Assertions, Security)..."
            />
            {query ? (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setQuery('')}
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className={styles.utilityRow}>
            <span className={styles.matchCount} aria-live="polite">
              Showing {filteredReleases.length} of {stats.totalReleases} releases
            </span>
            <button
              type="button"
              className={styles.filterBtn}
              onClick={toggleAllVisible}
              disabled={filteredReleases.length === 0}
            >
              {allVisibleOpen ? 'Collapse visible ↑' : 'Expand visible ↓'}
            </button>
          </div>
        </div>

        <div className={styles.filterRow}>
          <div
            className={styles.filterGroup}
            role="group"
            aria-label="Filter releases by provenance or breaking status"
          >
            <button
              type="button"
              className={styles.filterBtn}
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              className={styles.filterBtn}
              aria-pressed={filter === 'published-confirmed'}
              onClick={() => setFilter('published-confirmed')}
            >
              Published Confirmed ({counts.publishedConfirmed})
            </button>
            <button
              type="button"
              className={styles.filterBtn}
              aria-pressed={filter === 'baseline-historical'}
              onClick={() => setFilter('baseline-historical')}
            >
              Baseline &amp; Historical ({counts.baselineHistorical})
            </button>
            <button
              type="button"
              className={styles.filterBtn}
              aria-pressed={filter === 'unreleased'}
              onClick={() => setFilter('unreleased')}
            >
              Unreleased Source ({counts.unreleased})
            </button>
            <button
              type="button"
              className={styles.filterBtn}
              aria-pressed={filter === 'github-unverified'}
              onClick={() => setFilter('github-unverified')}
            >
              GitHub Unverified ({counts.githubUnverified})
            </button>
            <button
              type="button"
              className={styles.filterBtn}
              aria-pressed={filter === 'breaking'}
              onClick={() => setFilter('breaking')}
            >
              Breaking Changes ({counts.breaking})
            </button>
          </div>
        </div>
      </div>

      {/* Full Chronicle Spine */}
      {filteredReleases.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No matching changelog entries.</h3>
          <p>
            No releases match &ldquo;{query}&rdquo; under the selected
            provenance filter.
          </p>
          <button
            type="button"
            className="button button-outline"
            onClick={() => {
              setQuery('');
              setFilter('all');
            }}
          >
            Reset search &amp; filters
          </button>
        </div>
      ) : (
        <div className={styles.spineList}>
          {filteredReleases.map((release) => {
            const isOpen = openIds.includes(release.anchorId);
            const isHighlighted = highlightedId === release.anchorId;
            const detailId = `${release.anchorId}-detail`;
            const nonEmptySections = release.sections.filter(
              (section) =>
                !section.isEmptyNone &&
                section.items.some((item) => !item.isNonePlaceholder),
            );

            return (
              <article
                key={release.anchorId}
                id={release.anchorId}
                data-status={release.status}
                className={`${styles.releaseRow}${
                  isHighlighted ? ` ${styles.releaseRowHighlighted}` : ''
                }`}
              >
                <div className={styles.versionCol}>
                  <div className={styles.versionNumber}>{release.version}</div>
                  <span className={styles.versionMeta}>
                    {release.releaseDate
                      ? release.releaseDate
                      : release.isUnreleased
                        ? 'Source milestone'
                        : release.status === 'github-unverified'
                          ? 'GitHub release'
                          : 'Recorded release'}{' '}
                    · {release.itemCount} notes
                  </span>
                </div>

                <div className={styles.contentCol}>
                  <h3 className={styles.rowHeadline}>{release.headline}</h3>
                  <p className={styles.rowProvenance}>
                    {release.provenanceNote}
                  </p>

                  {release.isUnreleased ? (
                    <div className={styles.unreleasedBanner} role="note">
                      <strong>Not on NuGet:</strong> {release.version} tracks
                      repository source in <code>Directory.Build.props</code>{' '}
                      and <code>CHANGELOG.md</code>; published consumer packages
                      remain on <strong>{stats.latestPublishedVersion}</strong>.
                    </div>
                  ) : null}

                  {release.highlightTags.length > 0 || release.isBreaking ? (
                    <div className={styles.tagRow}>
                      {release.highlightTags.map((tag) => (
                        <span
                          key={tag}
                          className={`${styles.tagChip}${
                            tag === 'Breaking Changes'
                              ? ` ${styles.tagChipBreaking}`
                              : ''
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.expandBtn}
                      aria-expanded={isOpen}
                      aria-controls={detailId}
                      onClick={() => toggleRelease(release.anchorId)}
                    >
                      {isOpen
                        ? 'Hide release notes ↑'
                        : `Inspect ${release.itemCount} release notes ↓`}
                    </button>

                    <a
                      href={release.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.githubLink}
                    >
                      {release.isUnreleased
                        ? 'View CHANGELOG.md on GitHub ↗'
                        : `View v${release.version} on GitHub ↗`}
                    </a>
                  </div>

                  {isOpen ? (
                    <div id={detailId} className={styles.detailDrawer}>
                      {nonEmptySections.map((section) => {
                        const visibleItems = section.items.filter(
                          (item) => !item.isNonePlaceholder,
                        );
                        if (visibleItems.length === 0) return null;
                        const isBreakingSection =
                          section.normalizedTitle === 'Breaking Changes';

                        return (
                          <div
                            key={section.title}
                            className={styles.sectionGroup}
                          >
                            <h4
                              className={`${styles.sectionTitle}${
                                isBreakingSection
                                  ? ` ${styles.sectionTitleBreaking}`
                                  : ''
                              }`}
                            >
                              {section.title}
                            </h4>
                            <ul className={styles.detailList}>
                              {visibleItems.map((item, idx) => (
                                <li
                                  key={`${section.title}-${idx}`}
                                  dangerouslySetInnerHTML={{ __html: item.html }}
                                />
                              ))}
                            </ul>
                          </div>
                        );
                      })}

                      <div className={styles.detailFooter}>
                        <a
                          href={release.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.githubLink}
                        >
                          {release.isUnreleased
                            ? 'Inspect full CHANGELOG.md on GitHub ↗'
                            : `Open GitHub release tag v${release.version} ↗`}
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className={styles.statusCol}>
                  <span className={getBadgeClass(release.status)}>
                    {release.statusLabel}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ChangelogLivingEdition({
  releases,
  stats,
  mode = 'chronicle',
  className,
}: ChangelogLivingEditionProps) {
  if (mode === 'hero') {
    return (
      <ChangelogFolioHero
        releases={releases}
        stats={stats}
        className={className}
      />
    );
  }
  return (
    <ChangelogChronicle
      releases={releases}
      stats={stats}
      className={className}
    />
  );
}
