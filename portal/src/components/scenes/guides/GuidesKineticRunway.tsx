'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import type { LearningMilestone } from '@/lib/guides';
import {
  LATEST_PUBLISHED_VERSION,
  UNRELEASED_SOURCE_VERSION,
} from '@/lib/site-config';
import {
  createCamera,
  createFacingPredicate,
  createIsoPlateGeometry,
  fitCamera,
  IsoPrism,
  IsoSignalConduit,
  open,
  projectCamera,
  r2,
  seg,
  staggerDelayMs,
  useReducedMotionSafe,
  useViewportActivity,
  WARM_FOREST_PALETTE,
  type IsoCamera,
  type FacingPredicate,
  type IsoPlateGeometry,
  type IsoPrismVariant,
  type Point2,
  type Point3,
  type Projector,
} from '@/components/hairline';
import styles from './GuidesKineticRunway.module.css';

export const GUIDES_SELECT_EVENT = 'astraflow:select-milestone';

export interface GuidesSelectEventDetail {
  index: number;
}

export function dispatchGuidesSelectEvent(index: number): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<GuidesSelectEventDetail>(GUIDES_SELECT_EVENT, {
      detail: { index },
    }),
  );
}

export interface GuidesKineticRunwayProps {
  milestones: LearningMilestone[];
  initialMilestoneId?: string;
  className?: string;
}

export interface GuidesHeroQuickJumpProps {
  milestones: Pick<LearningMilestone, 'id' | 'stepNumber' | 'shortTitle'>[];
}

export function GuidesHeroQuickJump({ milestones }: GuidesHeroQuickJumpProps) {
  const reducedMotion = useReducedMotionSafe();

  return (
    <div
      className={styles.quickJumpStrip}
      role="group"
      aria-label="Quick jump to learning milestone"
    >
      {milestones.map((m, idx) => (
        <button
          key={m.id}
          type="button"
          className={styles.quickJumpBtn}
          onClick={() => {
            dispatchGuidesSelectEvent(idx);
            const target = document.getElementById('guides-runway');
            target?.scrollIntoView({
              behavior: reducedMotion ? 'auto' : 'smooth',
              block: 'start',
            });
          }}
        >
          <span className={styles.quickJumpIndex}>{m.stepNumber}</span>
          <span>{m.shortTitle}</span>
        </button>
      ))}
    </div>
  );
}

interface LocalCheckSpec {
  title: string;
  command: string;
  note: string;
}

const LOCAL_CHECKS: Record<string, LocalCheckSpec> = {
  contracts: {
    title: 'Local verification — Contracts assembly',
    command: 'dotnet build src/AstraFlow.Contracts/AstraFlow.Contracts.csproj -c Release',
    note: 'Confirms shared message and handler contracts compile with zero framework or DI dependencies.',
  },
  'mediator-pipelines': {
    title: 'Local verification — Mediator & pipelines',
    command: 'dotnet test tests/AstraFlow.Mediator.Tests/AstraFlow.Mediator.Tests.csproj -c Release',
    note: 'Executes handler resolution, pipeline ordering, notifications, and streaming dispatch tests.',
  },
  'explicit-mapping': {
    title: 'Local verification — Explicit mapping & projections',
    command:
      'dotnet test tests/AstraFlow.Mapper.Tests/AstraFlow.Mapper.Tests.csproj && dotnet test tests/AstraFlow.Mapper.EntityFrameworkCore.Tests/AstraFlow.Mapper.EntityFrameworkCore.Tests.csproj',
    note: 'Validates explicit mapper rules, registration checks, and EF Core IQueryable projections.',
  },
  'source-generators': {
    title: 'Local verification — Generators & analyzers',
    command:
      'dotnet test tests/AstraFlow.Generators.Tests/AstraFlow.Generators.Tests.csproj && dotnet test tests/AstraFlow.Analyzers.Tests/AstraFlow.Analyzers.Tests.csproj',
    note: 'Verifies incremental Roslyn source generation and build-time diagnostic emission.',
  },
  'diagnostics-cli': {
    title: 'Local verification — CLI & redaction',
    command: 'dotnet run --project src/AstraFlow.Cli -- inspect AstraFlow.slnx',
    note: 'Runs the repository CLI inspector directly from source against the AstraFlow solution.',
  },
  'testing-harnesses': {
    title: 'Local verification — Testing & 2.4.0 assertions source',
    command:
      'dotnet test tests/AstraFlow.Testing.Tests/AstraFlow.Testing.Tests.csproj && dotnet test tests/AstraFlow.Assertions.Tests/AstraFlow.Assertions.Tests.csproj',
    note: 'Runs both published 2.3.0 testing harnesses and the unreleased 2.4.0 AstraFlow.Assertions suite.',
  },
};

const DEFAULT_LOCAL_CHECK: LocalCheckSpec = {
  title: 'Local verification — Solution suite',
  command: 'dotnet test AstraFlow.slnx -c Release',
  note: 'Builds and tests the complete AstraFlow solution from source.',
};

const SVG_WIDTH = 900;
const SVG_HEIGHT = 320;
const PLATE_HALF = 28;

interface MiniatureBlock {
  geometry: IsoPlateGeometry;
  tone: 'primary' | 'secondary' | 'accent';
}

interface StationGeometryEntry {
  index: number;
  cx: number;
  cy: number;
  z0: number;
  z1: number;
  conduitAnchor: Point3;
  geometry: IsoPlateGeometry;
  miniatures: MiniatureBlock[];
  bridgeVectors: string[];
  baseDropLine: string;
  badgeTickLine: string;
  badgeCenter: Point2;
  dotCenters: Point2[];
}

function buildStationMiniatures(
  index: number,
  camera: IsoCamera,
  project: Projector,
  front: FacingPredicate,
  cx: number,
  cy: number,
  zTop: number,
): {
  miniatures: MiniatureBlock[];
  bridgeVectors: string[];
  peakZ: number;
} {
  const makeBox = (
    dx0: number,
    dy0: number,
    dx1: number,
    dy1: number,
    dz0: number,
    dz1: number,
    tone: MiniatureBlock['tone'],
    radius = 2.2,
  ): MiniatureBlock => ({
    tone,
    geometry: createIsoPlateGeometry({
      camera,
      project,
      front,
      x0: cx + dx0,
      y0: cy + dy0,
      x1: cx + dx1,
      y1: cy + dy1,
      z0: zTop + dz0,
      z1: zTop + dz1,
      radius,
      creaseInset: 1.2,
      steps: 4,
    }),
  });

  let raw: MiniatureBlock[] = [];
  const bridgeVectors: string[] = [];
  let peakZ = zTop + 10;

  switch (index) {
    case 0: {
      // 01 Contracts: twin interlocking contract tablets
      raw = [
        makeBox(-14, -12, -1, 4, 0, 6.5, 'primary'),
        makeBox(-1, -4, 14, 12, 2.5, 9.5, 'secondary'),
      ];
      peakZ = zTop + 9.5;
      break;
    }
    case 1: {
      // 02 Mediator & Pipelines: 3 stepped pipeline arches flanking central handler core
      raw = [
        makeBox(-16, -6, -9, 6, 0, 5.5, 'secondary'),
        makeBox(-6, -16, 6, -9, 0, 5.5, 'secondary'),
        makeBox(-6.5, -6.5, 6.5, 6.5, 0, 12, 'accent', 2.8),
        makeBox(9, -6, 16, 6, 0, 5.5, 'secondary'),
      ];
      peakZ = zTop + 12;
      break;
    }
    case 2: {
      // 03 Explicit Mapping: separated Source & DTO prisms bridged by directional vector
      raw = [
        makeBox(-16, -13, -3, 2, 0, 7.5, 'secondary'),
        makeBox(3, -2, 16, 13, 0, 7.5, 'primary'),
      ];
      const pStart = project(cx - 2, cy - 3, zTop + 7.8);
      const pEnd = project(cx + 3, cy + 2, zTop + 7.8);
      bridgeVectors.push(seg(pStart, pEnd));
      peakZ = zTop + 9.5;
      break;
    }
    case 3: {
      // 04 Source Generators: central Roslyn compiler die + emitted code slab
      raw = [
        makeBox(-11, -11, 5, 5, 0, 10.5, 'accent', 3),
        makeBox(3, 3, 16, 16, 0, 4.8, 'secondary', 2),
      ];
      peakZ = zTop + 10.5;
      break;
    }
    case 4: {
      // 05 Diagnostics & CLI: 3 ascending 3D telemetry bar prisms
      raw = [
        makeBox(-15, -5, -7, 5, 0, 4.5, 'secondary'),
        makeBox(-4, -5, 4, 5, 0, 8.5, 'primary'),
        makeBox(7, -5, 15, 5, 0, 12.5, 'accent'),
      ];
      peakZ = zTop + 12.5;
      break;
    }
    default: {
      // 06 Testing & Harnesses: U-shaped test harness cradle enclosing raised verified terracotta prism
      raw = [
        makeBox(-15, -14, -7, 11, 0, 6.5, 'secondary'),
        makeBox(-7, -14, 15, -7, 0, 6.5, 'secondary'),
        makeBox(-5.5, -5.5, 5.5, 6.5, 0, 11.5, 'accent', 2.8),
        makeBox(7, -7, 15, 11, 0, 6.5, 'secondary'),
      ];
      peakZ = zTop + 11.5;
      break;
    }
  }

  raw.sort((a, b) => a.geometry.depthKey - b.geometry.depthKey);
  return { miniatures: raw, bridgeVectors, peakZ };
}

function getPackageQualifier(pkg: string): string | null {
  if (pkg === 'AstraFlow.Assertions') {
    return `${UNRELEASED_SOURCE_VERSION} unreleased`;
  }
  if (pkg === 'AstraFlow.Analyzers' || pkg === 'AstraFlow.Generators') {
    return 'PrivateAssets="all"';
  }
  if (pkg === 'AstraFlow.Cli') {
    return `.NET tool · ${LATEST_PUBLISHED_VERSION}`;
  }
  return LATEST_PUBLISHED_VERSION;
}

function getLanguageLabel(lang: LearningMilestone['codeLang']): string {
  if (lang === 'csharp') return 'C#';
  if (lang === 'xml') return 'MSBUILD XML';
  return 'DOTNET CLI';
}

export function GuidesKineticRunway({
  milestones,
  initialMilestoneId,
  className,
}: GuidesKineticRunwayProps) {
  const initialIdx = useMemo(() => {
    if (!initialMilestoneId) return 0;
    const found = milestones.findIndex((item) => item.id === initialMilestoneId);
    return found >= 0 ? found : 0;
  }, [milestones, initialMilestoneId]);

  const [activeIndex, setActiveIndex] = useState<number>(initialIdx);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [waveIndex, setWaveIndex] = useState<number>(0);
  const [copiedKind, setCopiedKind] = useState<'code' | 'cli' | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  const stageRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const copyTimerRef = useRef<number | null>(null);

  const reducedMotion = useReducedMotionSafe();
  const stageActivity = useViewportActivity(stageRef, {
    paused: reducedMotion,
    initialInView: true,
  });

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  // Gentle idle beacon wave along stations without altering deterministic activeIndex tab state
  useEffect(() => {
    if (
      reducedMotion ||
      !stageActivity.isActive ||
      hasInteracted ||
      hoveredIndex !== null ||
      milestones.length <= 1
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setWaveIndex((prev) => (prev + 1) % milestones.length);
    }, 2200);

    return () => {
      window.clearInterval(timer);
    };
  }, [reducedMotion, stageActivity.isActive, hasInteracted, hoveredIndex, milestones.length]);

  // Listen to hero quick-jump milestone selection events
  useEffect(() => {
    const onExternalSelect = (event: Event) => {
      const custom = event as CustomEvent<GuidesSelectEventDetail>;
      if (typeof custom.detail?.index === 'number') {
        const clamped = Math.max(0, Math.min(milestones.length - 1, custom.detail.index));
        setHasInteracted(true);
        setActiveIndex(clamped);
      }
    };
    window.addEventListener(GUIDES_SELECT_EVENT, onExternalSelect);
    return () => {
      window.removeEventListener(GUIDES_SELECT_EVENT, onExternalSelect);
    };
  }, [milestones.length]);

  const count = milestones.length;

  const scene = useMemo(() => {
    const safeCount = Math.max(1, count);
    const mid = (safeCount - 1) / 2;
    const stepX = 76;
    const stepY = 72;
    const zRise = 6;
    const plateHeight = 11;
    const maxLiftAndBadgeWorld = 34;

    const cam = createCamera(45, 0.5, 1.36);
    const extrema: Point3[] = [];
    for (let i = 0; i < safeCount; i++) {
      const cx = (i - mid) * stepX;
      const cy = -(i - mid) * stepY;
      const z0 = i * zRise;
      const z1 = z0 + plateHeight;
      extrema.push(
        [cx - PLATE_HALF, cy - PLATE_HALF, 0],
        [cx + PLATE_HALF, cy + PLATE_HALF, 0],
        [cx - PLATE_HALF, cy + PLATE_HALF, z1 + maxLiftAndBadgeWorld],
        [cx + PLATE_HALF, cy - PLATE_HALF, z1 + maxLiftAndBadgeWorld],
      );
    }
    fitCamera(cam, extrema, SVG_WIDTH / 2, SVG_HEIGHT / 2 + 16);

    const P = projectCamera(cam);
    const front = createFacingPredicate(cam);

    const stations: StationGeometryEntry[] = [];
    const conduitPoints: Point3[] = [];
    const groundRailPoints: Point2[] = [];

    for (let i = 0; i < safeCount; i++) {
      const cx = (i - mid) * stepX;
      const cy = -(i - mid) * stepY;
      const z0 = i * zRise;
      const z1 = z0 + plateHeight;
      const geometry = createIsoPlateGeometry({
        camera: cam,
        project: P,
        front,
        x0: cx - PLATE_HALF,
        y0: cy - PLATE_HALF,
        x1: cx + PLATE_HALF,
        y1: cy + PLATE_HALF,
        z0,
        z1,
        radius: 7,
        creaseInset: 2.4,
        steps: 6,
      });

      const { miniatures, bridgeVectors, peakZ } = buildStationMiniatures(
        i,
        cam,
        P,
        front,
        cx,
        cy,
        z1,
      );

      const baseFoot = P(cx, cy, z0);
      const groundPoint = P(cx, cy, 0);
      groundRailPoints.push(groundPoint);

      const badgeAnchor = P(cx, cy, peakZ + 1.5);
      const badgeCenter: Point2 = [badgeAnchor[0], badgeAnchor[1] - 24];
      const badgeTickLine = seg(badgeAnchor, [badgeCenter[0], badgeCenter[1] + 9]);

      const dotCenters: Point2[] = [];
      const dotCount = i + 1;
      const dotSpan = (dotCount - 1) * 4.4;
      for (let d = 0; d < dotCount; d++) {
        const offset = -dotSpan / 2 + d * 4.4;
        dotCenters.push(P(cx + offset * 0.72, cy + 20 + offset * 0.3, z1));
      }

      conduitPoints.push([cx, cy, z0 + 5.5]);
      stations.push({
        index: i,
        cx,
        cy,
        z0,
        z1,
        conduitAnchor: [cx, cy, z0 + 5.5],
        geometry,
        miniatures,
        bridgeVectors,
        baseDropLine: seg(baseFoot, groundPoint),
        badgeTickLine,
        badgeCenter,
        dotCenters,
      });
    }

    const sortedStations = [...stations].sort(
      (a, b) => a.geometry.depthKey - b.geometry.depthKey,
    );

    const projectedConduit = conduitPoints.map((pt) => P(pt[0], pt[1], pt[2]));
    const groundRailPath = open(groundRailPoints);

    return {
      stations,
      sortedStations,
      projectedConduit,
      groundRailPath,
    };
  }, [count]);

  if (count === 0) {
    return null;
  }

  const safeActiveIndex = Math.min(activeIndex, count - 1);
  const active = milestones[safeActiveIndex] ?? milestones[0];
  const localCheck = LOCAL_CHECKS[active.id] ?? DEFAULT_LOCAL_CHECK;
  const conduitProgress = count > 1 ? safeActiveIndex / (count - 1) : 1;

  function selectMilestone(nextIndex: number, moveFocus = false) {
    const wrapped = (nextIndex + count) % count;
    setHasInteracted(true);
    setActiveIndex(wrapped);
    setCopiedKind(null);
    const chosen = milestones[wrapped];
    if (chosen) {
      setLiveAnnouncement(
        `Milestone ${chosen.stepNumber} of ${String(count).padStart(2, '0')}: ${chosen.shortTitle}`,
      );
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
      selectMilestone(index + 1, true);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectMilestone(index - 1, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectMilestone(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectMilestone(count - 1, true);
    }
  }

  function handleSvgKeyDown(
    event: KeyboardEvent<SVGGElement>,
    index: number,
  ) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectMilestone(index + 1, false);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectMilestone(index - 1, false);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectMilestone(0, false);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectMilestone(count - 1, false);
    }
  }

  async function copyText(text: string, kind: 'code' | 'cli', label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKind(kind);
      setLiveAnnouncement(`${label} copied to clipboard.`);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedKind(null);
      }, 1800);
    } catch {
      setLiveAnnouncement(`Copy unavailable; select and copy ${label} manually.`);
    }
  }

  return (
    <div
      id="guides-runway"
      ref={stageRef}
      className={className ? `${styles.root} ${className}` : styles.root}
    >
      <div className="site-wrap">
        <div className={styles.stageCard}>
          <div className={styles.stageBar}>
            <div className={styles.stageMeta}>
              <span className={styles.stageBadge}>
                FIGURE 02 / KINETIC LEARNING RUNWAY
              </span>
              <span>
                MILESTONE {active.stepNumber} OF{' '}
                {String(count).padStart(2, '0')}
              </span>
            </div>

            <div className={styles.stageControls}>
              <span className={styles.signalLiveBadge}>
                <span className={styles.signalLiveDot} aria-hidden="true" />
                SIGNAL PULSE · CONTINUOUS
              </span>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => selectMilestone(safeActiveIndex - 1)}
                aria-label="Previous milestone"
              >
                ← Previous
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => selectMilestone(safeActiveIndex + 1)}
                aria-label="Next milestone"
              >
                Next milestone →
              </button>
            </div>
          </div>

          <div className={styles.runwayCanvasWrap}>
            <svg
              className={styles.runwaySvg}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              role="group"
              aria-label="Interactive ascending isometric AstraFlow learning runway"
            >
              {/* Ground datum hairline beneath ascending staircase */}
              {scene.groundRailPath ? (
                <path
                  d={scene.groundRailPath}
                  fill="none"
                  stroke={WARM_FOREST_PALETTE.border}
                  strokeWidth={1}
                  strokeDasharray="3 5"
                  aria-hidden="true"
                />
              ) : null}

              {/* Vertical construction datum lines from plinth foot to z=0 */}
              {scene.stations.map((station) => (
                <path
                  key={`datum-${station.index}`}
                  d={station.baseDropLine}
                  fill="none"
                  stroke={
                    station.index <= safeActiveIndex
                      ? WARM_FOREST_PALETTE.action
                      : WARM_FOREST_PALETTE.border
                  }
                  strokeOpacity={station.index <= safeActiveIndex ? 0.55 : 0.75}
                  strokeWidth={1}
                  strokeDasharray="2 3.5"
                  aria-hidden="true"
                />
              ))}

              {/* Energized Signal Orange isometric runway conduit */}
              <IsoSignalConduit
                points={scene.projectedConduit}
                cornerRadius={6}
                active
                progress={Math.max(0.2, conduitProgress)}
                paused={false}
                viewportActive={stageActivity.isActive}
                surface="ivory"
                baseColor={WARM_FOREST_PALETTE.muted}
                baseStrokeWidth={1.35}
                activeStrokeWidth={2.4}
                pulseDurationMs={2500}
                pulseRadius={3.4}
                showTerminals
                ariaLabel={`Learning progression signal from Contracts to ${active.shortTitle}`}
              />

              {/* Opaque isometric plinths + genuine 3D miniature assemblies in Painter's Order */}
              {scene.sortedStations.map((station) => {
                const milestone = milestones[station.index];
                if (!milestone) return null;

                const isSelected = station.index === safeActiveIndex;
                const isTraversed = station.index < safeActiveIndex;
                const isHovered = hoveredIndex === station.index;
                const isIdleWave =
                  !hasInteracted && hoveredIndex === null && waveIndex === station.index;
                const liftPx = isSelected
                  ? 12
                  : isHovered
                    ? 6
                    : isIdleWave
                      ? 3.5
                      : 0;

                const variant: IsoPrismVariant = isSelected
                  ? milestone.unreleasedNote
                    ? 'terracotta'
                    : 'forest'
                  : isTraversed
                    ? 'sand'
                    : 'ivory';

                const resolveMiniatureVariant = (
                  tone: MiniatureBlock['tone'],
                ): IsoPrismVariant => {
                  if (tone === 'accent') {
                    return isSelected
                      ? milestone.unreleasedNote
                        ? 'ivory'
                        : 'terracotta'
                      : isIdleWave
                        ? 'terracotta'
                        : 'forest';
                  }
                  if (tone === 'primary') {
                    return isSelected ? 'sand' : 'ivory';
                  }
                  return isSelected ? 'ivory' : 'sand';
                };

                const dotFill = isSelected
                  ? WARM_FOREST_PALETTE.signal
                  : isTraversed
                    ? WARM_FOREST_PALETTE.action
                    : WARM_FOREST_PALETTE.muted;

                return (
                  <IsoPrism
                    key={milestone.id}
                    geometry={station.geometry}
                    variant={variant}
                    selected={isSelected}
                    active={isHovered || isIdleWave}
                    liftPx={liftPx}
                    delayMs={staggerDelayMs(station.index, safeActiveIndex, 45)}
                    showDropGuides={isSelected || isHovered}
                    role="button"
                    ariaPressed={isSelected}
                    label={`Select milestone ${milestone.stepNumber}: ${milestone.shortTitle}`}
                    onSelect={() => selectMilestone(station.index)}
                    onHoverChange={(hover) =>
                      setHoveredIndex(hover ? station.index : null)
                    }
                    onKeyDown={(event) => handleSvgKeyDown(event, station.index)}
                    dataTestId={`runway-station-${milestone.id}`}
                  >
                    {/* Genuine 3D isometric miniature sub-assemblies sorted back-to-front */}
                    {station.miniatures.map((mini, idx) => (
                      <IsoPrism
                        key={`mini-${station.index}-${idx}`}
                        geometry={mini.geometry}
                        variant={resolveMiniatureVariant(mini.tone)}
                        interactive={false}
                        strokeWidth={0.9}
                        creaseStrokeWidth={0.65}
                      />
                    ))}

                    {/* Mapping vector bridge when applicable */}
                    {station.bridgeVectors.map((d, idx) => (
                      <path
                        key={`vec-${station.index}-${idx}`}
                        d={d}
                        fill="none"
                        stroke={WARM_FOREST_PALETTE.signal}
                        strokeWidth={2}
                        strokeLinecap="round"
                        pointerEvents="none"
                      />
                    ))}

                    {station.dotCenters.map(([dx, dy], dotIdx) => (
                      <circle
                        key={`dot-${station.index}-${dotIdx}`}
                        cx={r2(dx)}
                        cy={r2(dy)}
                        r={1.4}
                        fill={dotFill}
                        pointerEvents="none"
                      />
                    ))}

                    {/* Crisp floating step number pill above each station */}
                    <g pointerEvents="none" aria-hidden="true">
                      <path
                        d={station.badgeTickLine}
                        fill="none"
                        stroke={
                          isSelected || isIdleWave
                            ? WARM_FOREST_PALETTE.signal
                            : WARM_FOREST_PALETTE.muted
                        }
                        strokeWidth={1}
                        strokeDasharray="2 2.5"
                      />
                      <rect
                        x={r2(station.badgeCenter[0] - 15)}
                        y={r2(station.badgeCenter[1] - 9)}
                        width={30}
                        height={18}
                        rx={9}
                        fill={
                          isSelected
                            ? WARM_FOREST_PALETTE.forest
                            : isIdleWave
                              ? WARM_FOREST_PALETTE.peach
                              : WARM_FOREST_PALETTE.paperRaised
                        }
                        stroke={
                          isSelected || isIdleWave
                            ? WARM_FOREST_PALETTE.signal
                            : WARM_FOREST_PALETTE.border
                        }
                        strokeWidth={1.1}
                      />
                      <text
                        x={r2(station.badgeCenter[0])}
                        y={r2(station.badgeCenter[1] + 3.4)}
                        textAnchor="middle"
                        className={styles.floatingStepText}
                        fill={
                          isSelected
                            ? WARM_FOREST_PALETTE.paperRaised
                            : WARM_FOREST_PALETTE.ink
                        }
                      >
                        {milestone.stepNumber}
                      </text>
                    </g>
                  </IsoPrism>
                );
              })}
            </svg>
          </div>

          <div
            className={styles.stationTabs}
            role="tablist"
            aria-label="AstraFlow learning milestones"
          >
            {milestones.map((milestone, index) => {
              const isSelected = index === safeActiveIndex;
              const isTraversed = index < safeActiveIndex;
              return (
                <button
                  key={milestone.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`runway-tab-${milestone.id}`}
                  aria-selected={isSelected}
                  aria-controls="runway-workbench-panel"
                  tabIndex={isSelected ? 0 : -1}
                  data-traversed={isTraversed ? 'true' : 'false'}
                  className={styles.stationTab}
                  onClick={() => selectMilestone(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  <span className={styles.tabStepRow}>
                    <span className={styles.tabIndex}>
                      STEP {milestone.stepNumber}
                    </span>
                    {milestone.unreleasedNote ? (
                      <span className={styles.tabSourceTag}>
                        {UNRELEASED_SOURCE_VERSION} SRC
                      </span>
                    ) : null}
                  </span>
                  <strong className={styles.tabTitle}>
                    {milestone.shortTitle}
                  </strong>
                </button>
              );
            })}
          </div>

          <div
            id="runway-workbench-panel"
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={`runway-tab-${active.id}`}
            className={styles.workbenchPanel}
          >
            <div className={styles.workbenchCopy}>
              <div className={styles.panelHeaderRow}>
                <span className={styles.panelEyebrow}>
                  MILESTONE {active.stepNumber} /{' '}
                  {active.shortTitle.toUpperCase()}
                </span>
                <span
                  className={`${styles.provenancePill} ${
                    active.unreleasedNote
                      ? styles.provenanceUnreleased
                      : styles.provenancePublished
                  }`}
                >
                  {active.unreleasedNote
                    ? `NuGet ${LATEST_PUBLISHED_VERSION} + ${UNRELEASED_SOURCE_VERSION} Unreleased Source`
                    : `Published NuGet ${LATEST_PUBLISHED_VERSION}`}
                </span>
              </div>

              <h3 className={styles.panelHeading}>{active.subtitle}</h3>
              <p className={styles.panelSummary}>{active.summary}</p>

              <span className={styles.pkgSectionLabel}>
                Required packages for this milestone
              </span>
              <div
                className={styles.pkgRow}
                aria-label="Required packages for this milestone"
              >
                {active.packages.map((pkg) => {
                  const isUnreleased = pkg === 'AstraFlow.Assertions';
                  const qualifier = getPackageQualifier(pkg);
                  return (
                    <Link
                      key={pkg}
                      href={`/packages#${encodeURIComponent(pkg)}`}
                      className={`${styles.pkgPill}${
                        isUnreleased ? ` ${styles.pkgPillUnreleased}` : ''
                      }`}
                    >
                      <span>{pkg}</span>
                      {qualifier ? (
                        <span className={styles.pkgQualifier}>{qualifier}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>

              <ul className={styles.conceptList}>
                {active.keyConcepts.map((concept) => (
                  <li key={concept}>{concept}</li>
                ))}
              </ul>

              {active.unreleasedNote ? (
                <div className={styles.unreleasedNotice} role="note">
                  <strong>Provenance notice:</strong> {active.unreleasedNote}
                </div>
              ) : null}

              <div className={styles.ctaRow}>
                <Link className="button button-primary" href={active.docHref}>
                  {active.docLabel}
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </Link>
                {active.secondaryLinks.map((linkItem) => (
                  <Link
                    key={linkItem.href}
                    className="button button-outline"
                    href={linkItem.href}
                  >
                    {linkItem.label}
                    <span aria-hidden="true" className="arrow">
                      ↗
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.workbenchCodeCol}>
              <div className={styles.codeCard}>
                <div className={styles.codeHeader}>
                  <span>
                    <span className={styles.codeLangTag}>
                      {getLanguageLabel(active.codeLang)}
                    </span>
                    {active.codeTitle}
                  </span>
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() =>
                      copyText(active.code, 'code', active.codeTitle)
                    }
                  >
                    {copiedKind === 'code' ? 'Copied ✓' : 'Copy snippet'}
                  </button>
                </div>
                <pre className={styles.codePre} tabIndex={0}>
                  <code
                    className={`language-${active.codeLang}`}
                    dangerouslySetInnerHTML={{ __html: active.codeHtml }}
                  />
                </pre>
              </div>

              <div className={styles.verifyBox}>
                <div className={styles.verifyHead}>
                  <span className={styles.verifyTitle}>{localCheck.title}</span>
                  <button
                    type="button"
                    className={styles.verifyCopyBtn}
                    onClick={() =>
                      copyText(
                        localCheck.command,
                        'cli',
                        'Verification CLI command',
                      )
                    }
                  >
                    {copiedKind === 'cli' ? 'Copied ✓' : 'Copy CLI check'}
                  </button>
                </div>
                <code className={styles.verifyCmd} tabIndex={0}>
                  {localCheck.command}
                </code>
                <p className={styles.verifyCaption}>{localCheck.note}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.srLive} aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>
    </div>
  );
}
