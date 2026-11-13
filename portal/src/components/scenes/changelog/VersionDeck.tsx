'use client';

import {
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
import styles from './VersionDeck.module.css';

export const CHANGELOG_FOCUS_EVENT = 'astraflow:changelog-focus';

const MILESTONE_VERSIONS = [
  '2.4.0',
  '2.3.0',
  '2.2.0',
  '2.1.0',
  '2.0.0',
  '1.0.0',
] as const;

const DECK_WIDTH = 640;
const DECK_HEIGHT = 300;
const AUTO_CYCLE_INTERVAL_MS = 3400;

export interface VersionDeckProps {
  releases: ChangelogRelease[];
  stats?: ChangelogStats;
  onSelectVersion?: (anchorId: string) => void;
  className?: string;
}

interface ProjectedEditionPlate {
  index: number;
  release: ChangelogRelease;
  geometry: IsoPlateGeometry;
  spineNodePoint: Point2;
  spineTickPath: string;
  accentBarPath: string;
  tierPipCenters: Point2[];
}

function getPlateVariant(status: ReleaseProvenanceStatus): IsoPrismVariant {
  switch (status) {
    case 'unreleased':
      return 'terracotta';
    case 'published-confirmed':
      return 'ivory';
    case 'published-baseline':
    case 'github-unverified':
      return 'sand';
    default:
      return 'forest';
  }
}

function getShortTag(status: ReleaseProvenanceStatus): string {
  switch (status) {
    case 'unreleased':
      return 'Source';
    case 'published-confirmed':
      return 'NuGet';
    case 'published-baseline':
      return 'Baseline';
    case 'github-unverified':
      return 'Unverified';
    default:
      return 'Milestone';
  }
}

function getStatusClass(status: ReleaseProvenanceStatus): string {
  switch (status) {
    case 'unreleased':
      return styles.statusUnreleased;
    case 'published-confirmed':
      return styles.statusConfirmed;
    case 'published-baseline':
      return styles.statusBaseline;
    case 'github-unverified':
      return styles.statusUnverified;
    default:
      return styles.statusHistorical;
  }
}

function selectMilestoneReleases(
  releases: ChangelogRelease[],
): ChangelogRelease[] {
  const picked: ChangelogRelease[] = [];
  for (const version of MILESTONE_VERSIONS) {
    const match = releases.find((item) => item.version === version);
    if (match) picked.push(match);
  }
  if (picked.length >= 4) return picked;

  for (const release of releases) {
    if (picked.length >= 6) break;
    if (!picked.some((existing) => existing.version === release.version)) {
      picked.push(release);
    }
  }
  return picked;
}

export function VersionDeck({
  releases,
  stats,
  onSelectVersion,
  className,
}: VersionDeckProps) {
  const milestones = useMemo(
    () => selectMilestoneReleases(releases),
    [releases],
  );
  const count = milestones.length;

  const [autoIndex, setAutoIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [rovingIndex, setRovingIndex] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = useReducedMotionSafe();
  const stageActivity = useViewportActivity(stageRef, {
    paused: reducedMotion,
    initialInView: true,
  });

  const isUserControlled =
    hoveredIndex !== null || focusedIndex !== null || pinnedIndex !== null;

  useEffect(() => {
    if (
      count <= 1 ||
      reducedMotion ||
      !stageActivity.isActive ||
      isUserControlled
    ) {
      return;
    }

    const timerId = window.setInterval(() => {
      setAutoIndex((prev) => (prev + 1) % count);
    }, AUTO_CYCLE_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [count, reducedMotion, stageActivity.isActive, isUserControlled]);

  const rawIndex =
    hoveredIndex ?? focusedIndex ?? pinnedIndex ?? autoIndex;
  const activeIndex = count > 0 ? Math.min(rawIndex, count - 1) : 0;
  const activeRelease = milestones[activeIndex] ?? releases[0];

  const scene = useMemo(() => {
    const cam = createCamera(38, 0.56, 1.32);
    const total = milestones.length;
    const xSpacing = 54;
    const yStep = 14;
    const plateHalfW = 30;
    const plateHalfD = 62;
    const startX = -((total - 1) * xSpacing) / 2;
    const startY = -((total - 1) * yStep) / 2;

    const extrema: Point3[] = [
      [startX - plateHalfW - 8, startY - plateHalfD - 10, 0],
      [
        startX + (total - 1) * xSpacing + plateHalfW + 8,
        startY + (total - 1) * yStep + plateHalfD + 44,
        36,
      ],
    ];
    fitCamera(cam, extrema, DECK_WIDTH / 2 + 8, DECK_HEIGHT / 2 + 8);

    const P = projectCamera(cam);
    const front = createFacingPredicate(cam);

    const spineOffsetY = 92;
    const plates: ProjectedEditionPlate[] = milestones.map((release, i) => {
      const cx = startX + i * xSpacing;
      const cy = startY + i * yStep;
      const z0 = (total - 1 - i) * 1.4;
      const z1 = z0 + 13 + (release.status === 'unreleased' ? 2 : 0);

      const geometry = createIsoPlateGeometry({
        camera: cam,
        project: P,
        front,
        x0: cx - plateHalfW,
        y0: cy - plateHalfD,
        x1: cx + plateHalfW,
        y1: cy + plateHalfD,
        z0,
        z1,
        radius: 6,
        creaseInset: 2.2,
        steps: 6,
      });

      const spinePtWorld: Point3 = [cx, startY + spineOffsetY, 0];
      const plateFrontEdge: Point3 = [cx, cy + plateHalfD, z0 + 1];

      const tierPipCenters: Point2[] = [];
      const pipCount = release.isBreaking ? 3 : 2;
      for (let p = 0; p < pipCount; p++) {
        tierPipCenters.push(P(cx - 10 + p * 10, cy + 36, z1));
      }

      return {
        index: i,
        release,
        geometry,
        spineNodePoint: P(spinePtWorld[0], spinePtWorld[1], spinePtWorld[2]),
        spineTickPath: seg(
          P(plateFrontEdge[0], plateFrontEdge[1], plateFrontEdge[2]),
          P(spinePtWorld[0], spinePtWorld[1], spinePtWorld[2]),
        ),
        accentBarPath: seg(
          P(cx - 14, cy - 30, z1),
          P(cx + 14, cy - 30, z1),
        ),
        tierPipCenters,
      };
    });

    const sortedPlates = [...plates].sort(
      (a, b) => a.geometry.depthKey - b.geometry.depthKey,
    );

    const spinePoints: Point2[] = plates.map((plate) => plate.spineNodePoint);
    const datumLine = seg(
      P(startX - 48, startY - plateHalfD - 14, 0),
      P(
        startX + (total - 1) * xSpacing + 48,
        startY + (total - 1) * yStep - plateHalfD - 14,
        0,
      ),
    );

    return {
      plates,
      sortedPlates,
      spinePoints,
      datumLine,
    };
  }, [milestones]);

  if (!activeRelease) {
    return null;
  }

  const spineProgress =
    count > 1 ? activeIndex / (count - 1) : 1;

  function selectTab(index: number, moveFocus: boolean) {
    if (count === 0) return;
    const wrapped = (index + count) % count;
    setPinnedIndex(wrapped);
    setRovingIndex(wrapped);
    if (moveFocus) {
      setFocusedIndex(wrapped);
      tabRefs.current[wrapped]?.focus();
    }
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectTab(index + 1, true);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectTab(index - 1, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectTab(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectTab(count - 1, true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setPinnedIndex(null);
      setHoveredIndex(null);
      setFocusedIndex(null);
    }
  }

  function handleSvgKeyDown(
    event: KeyboardEvent<SVGGElement>,
    index: number,
  ) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectTab(index + 1, false);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectTab(index - 1, false);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectTab(0, false);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectTab(count - 1, false);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setPinnedIndex(null);
      setHoveredIndex(null);
      setFocusedIndex(null);
    }
  }

  function handleJumpToRelease() {
    const targetId = activeRelease.anchorId;
    if (onSelectVersion) {
      onSelectVersion(targetId);
      return;
    }

    const focusEvent = new CustomEvent<{ anchorId: string }>(
      CHANGELOG_FOCUS_EVENT,
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
      const targetEl =
        document.getElementById(targetId) ??
        document.getElementById('releases');
      targetEl?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }

  return (
    <div
      ref={stageRef}
      className={className ? `${styles.deckRoot} ${className}` : styles.deckRoot}
      onMouseLeave={() => setHoveredIndex(null)}
      aria-label="AstraFlow release edition provenance deck"
    >
      <div className={styles.topBar}>
        <span>
          THE EDITIONS / {stats ? `${stats.totalReleases} RECORDED` : 'EDITION DECK'}
        </span>
        <span className={styles.modePill}>
          <span className={styles.modeDot} aria-hidden="true" />
          <span>
            {isUserControlled
              ? `PINNED · v${activeRelease.version}`
              : `AUTO-PULSE · v${activeRelease.version}`}
          </span>
        </span>
      </div>

      <div className={styles.canvasFrame}>
        <svg
          className={styles.canvasSvg}
          viewBox={`0 0 ${DECK_WIDTH} ${DECK_HEIGHT}`}
          role="group"
          aria-label="Interactive isometric stack of six key AstraFlow release provenance plates"
        >
          {/* Background architectural datum & spine ticks (Rule 06 occluded behind prisms) */}
          <path
            d={scene.datumLine}
            fill="none"
            stroke={WARM_FOREST_PALETTE.border}
            strokeWidth={1}
            strokeDasharray="4 6"
            aria-hidden="true"
          />

          {scene.plates.map((plate) => {
            const isActive = plate.index === activeIndex;
            return (
              <path
                key={`tick-${plate.release.version}`}
                d={plate.spineTickPath}
                fill="none"
                stroke={
                  isActive
                    ? WARM_FOREST_PALETTE.signal
                    : WARM_FOREST_PALETTE.border
                }
                strokeWidth={isActive ? 1.6 : 1}
                strokeDasharray="2 3"
                aria-hidden="true"
              />
            );
          })}

          {scene.spinePoints.length >= 2 ? (
            <IsoSignalConduit
              points={scene.spinePoints}
              cornerRadius={4}
              active
              progress={spineProgress}
              viewportActive={stageActivity.isActive}
              surface="ivory"
              baseColor={WARM_FOREST_PALETTE.muted}
              baseStrokeWidth={1.3}
              activeStrokeWidth={2.2}
              pulseDurationMs={2400}
              pulseRadius={3}
              showTerminals
              ariaLabel={`Release provenance conduit aligned at v${activeRelease.version}`}
            />
          ) : null}

          {scene.sortedPlates.map((plate) => {
            const isSelected = plate.index === activeIndex;
            const isHovered = hoveredIndex === plate.index;
            const liftPx = isSelected ? 15 : isHovered ? 7 : 0;
            const variant = getPlateVariant(plate.release.status);
            const isDark = variant === 'forest' || variant === 'dark-forest';
            const barStroke = isSelected
              ? WARM_FOREST_PALETTE.signal
              : isDark
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
                delayMs={staggerDelayMs(plate.index, activeIndex, 45)}
                showDropGuides={isSelected || isHovered}
                role="button"
                ariaPressed={isSelected}
                label={`Select edition v${plate.release.version}: ${plate.release.statusLabel}`}
                onSelect={() => selectTab(plate.index, false)}
                onHoverChange={(hovering) =>
                  setHoveredIndex(hovering ? plate.index : null)
                }
                onFocusChange={(focused) =>
                  setFocusedIndex(focused ? plate.index : null)
                }
                onKeyDown={(event) => handleSvgKeyDown(event, plate.index)}
                dataTestId={`version-deck-plate-${plate.release.version}`}
              >
                <path
                  d={plate.accentBarPath}
                  fill="none"
                  stroke={barStroke}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  pointerEvents="none"
                />
                {plate.tierPipCenters.map(([px, py], pipIndex) => (
                  <circle
                    key={`pip-${plate.release.version}-${pipIndex}`}
                    cx={r2(px)}
                    cy={r2(py)}
                    r={isSelected ? 2.4 : 1.7}
                    fill={
                      isSelected
                        ? WARM_FOREST_PALETTE.signal
                        : isDark
                          ? WARM_FOREST_PALETTE.peach
                          : WARM_FOREST_PALETTE.inkSecondary
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
        className={styles.tablist}
        role="tablist"
        aria-label="Key AstraFlow release provenance milestones"
      >
        {milestones.map((release, index) => {
          const selected = activeIndex === index;
          return (
            <button
              key={release.version}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={rovingIndex === index ? 0 : -1}
              className={styles.tabBtn}
              onClick={() => selectTab(index, true)}
              onMouseEnter={() => setHoveredIndex(index)}
              onFocus={() => {
                setFocusedIndex(index);
                setRovingIndex(index);
              }}
              onBlur={() =>
                setFocusedIndex((curr) => (curr === index ? null : curr))
              }
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span className={styles.tabHead}>
                <span className={styles.tabDot} aria-hidden="true" />
                <span className={styles.tabVersion}>v{release.version}</span>
              </span>
              <span className={styles.tabTag}>
                {getShortTag(release.status)}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.readoutCard} aria-live="polite">
        <div className={styles.readoutMeta}>
          <div className={styles.readoutLeft}>
            <span className={styles.versionPill}>v{activeRelease.version}</span>
            <span
              className={`${styles.statusBadge} ${getStatusClass(
                activeRelease.status,
              )}`}
            >
              {activeRelease.statusLabel}
            </span>
          </div>
          <span className={styles.dateMeta}>
            {activeRelease.releaseDate
              ? `Published ${activeRelease.releaseDate}`
              : activeRelease.isUnreleased
                ? 'Active source branch'
                : 'Recorded in CHANGELOG.md'}
          </span>
        </div>

        <p className={styles.readoutHeadline}>{activeRelease.headline}</p>

        <div className={styles.readoutFooter}>
          <div className={styles.tagRow}>
            {activeRelease.highlightTags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.microTag}>
                {tag}
              </span>
            ))}
          </div>

          <button
            type="button"
            className={styles.jumpBtn}
            onClick={handleJumpToRelease}
          >
            Jump to v{activeRelease.version} notes ↓
          </button>
        </div>
      </div>
    </div>
  );
}
