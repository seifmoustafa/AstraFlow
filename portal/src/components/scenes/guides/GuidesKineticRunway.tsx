'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
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
  ISO_PRISM_PALETTES,
  open,
  projectCamera,
  seg,
  useReducedMotionSafe,
  useViewportActivity,
  WARM_FOREST_PALETTE,
  type IsoPlateGeometry,
  type IsoPrismVariant,
  type Point3,
} from '@/components/hairline';
import styles from './GuidesKineticRunway.module.css';

export const GUIDES_SELECT_EVENT = 'astraflow:select-milestone';
export const GUIDES_ACTIVE_EVENT = 'astraflow:active-milestone';

export interface GuidesSelectEventDetail {
  index: number;
}

export function dispatchGuidesSelectEvent(index: number) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<GuidesSelectEventDetail>(GUIDES_SELECT_EVENT, {
      detail: { index },
    }),
  );
}

function dispatchGuidesActiveEvent(index: number) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<GuidesSelectEventDetail>(GUIDES_ACTIVE_EVENT, {
      detail: { index },
    }),
  );
}

const STATION_CUES: readonly string[] = [
  'CONTRACTS',
  'PIPELINES',
  'PROJECTIONS',
  'ROSLYN AST',
  'TELEMETRY',
  'HARNESSES',
];

const STATION_COORDS = [
  { svgX: 80, svgY: 288.8, groundY: 360 },
  { svgX: 246, svgY: 248.5, groundY: 360 },
  { svgX: 412, svgY: 208.2, groundY: 360 },
  { svgX: 578, svgY: 168.0, groundY: 360 },
  { svgX: 744, svgY: 127.7, groundY: 360 },
  { svgX: 910, svgY: 87.4, groundY: 360 },
] as const;

// Smooth ascending S-curve trace linking (8%, 76%) through (91%, 23%) in 1000x380 coordinates
const RUNWAY_ROUTE_PATH =
  'M 80 288.8 C 145 294 182 241 246 248.5 C 310 256 348 202 412 208.2 C 476 214 514 163 578 168.0 C 642 173 680 123 744 127.7 C 808 132 845 87.4 910 87.4';

const STATION_POS_CLASSES = [
  styles.stationPos0,
  styles.stationPos1,
  styles.stationPos2,
  styles.stationPos3,
  styles.stationPos4,
  styles.stationPos5,
] as const;

export interface GuidesHeroQuickJumpProps {
  milestones: Pick<
    LearningMilestone,
    'id' | 'stepNumber' | 'shortTitle' | 'unreleasedNote'
  >[];
}

export function GuidesHeroQuickJump({ milestones }: GuidesHeroQuickJumpProps) {
  const reducedMotion = useReducedMotionSafe();
  const [syncedIndex, setSyncedIndex] = useState(0);

  useEffect(() => {
    const onActiveChange = (event: Event) => {
      const custom = event as CustomEvent<GuidesSelectEventDetail>;
      if (typeof custom.detail?.index === 'number') {
        setSyncedIndex(custom.detail.index);
      }
    };
    const onSelectChange = (event: Event) => {
      const custom = event as CustomEvent<GuidesSelectEventDetail>;
      if (typeof custom.detail?.index === 'number') {
        setSyncedIndex(custom.detail.index);
      }
    };
    window.addEventListener(GUIDES_ACTIVE_EVENT, onActiveChange);
    window.addEventListener(GUIDES_SELECT_EVENT, onSelectChange);
    return () => {
      window.removeEventListener(GUIDES_ACTIVE_EVENT, onActiveChange);
      window.removeEventListener(GUIDES_SELECT_EVENT, onSelectChange);
    };
  }, []);

  const currentStep = milestones[syncedIndex]?.stepNumber ?? '01';
  const totalCount = String(milestones.length).padStart(2, '0');

  return (
    <div className={styles.curriculumCard}>
      <div className={styles.curriculumHead}>
        <span className={styles.curriculumTitle}>
          <span className={styles.curriculumDot} aria-hidden="true" />
          06 MILESTONES · RUNNABLE C# · CLI VERIFIED
        </span>
        <span className={styles.curriculumCounter}>
          STEP {currentStep} / {totalCount}
        </span>
      </div>

      <div
        className={styles.quickJumpMatrix}
        role="group"
        aria-label="Quick jump to learning milestone"
      >
        {milestones.map((m, idx) => {
          const isActive = idx === syncedIndex;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isActive}
              className={`${styles.quickJumpBtn}${
                isActive ? ` ${styles.quickJumpBtnActive}` : ''
              }`}
              onClick={() => {
                setSyncedIndex(idx);
                dispatchGuidesSelectEvent(idx);
                const target = document.getElementById('guides-runway');
                target?.scrollIntoView({
                  behavior: reducedMotion ? 'auto' : 'smooth',
                  block: 'start',
                });
              }}
            >
              <span className={styles.quickJumpTop}>
                <span className={styles.quickJumpIndex}>{m.stepNumber}</span>
                {m.unreleasedNote ? (
                  <span className={styles.quickJumpPreviewTag}>2.4*</span>
                ) : (
                  <span className={styles.quickJumpArrow} aria-hidden="true">
                    ↘
                  </span>
                )}
              </span>
              <span className={styles.quickJumpLabel}>{m.shortTitle}</span>
            </button>
          );
        })}
      </div>
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

interface SculptureSolid {
  geometry: IsoPlateGeometry;
  tone: 'base' | 'mid' | 'accent';
}

interface MilestoneSculpture {
  solids: SculptureSolid[];
  accents: string[];
}

function buildMilestoneSculpture(index: number): MilestoneSculpture {
  const cam = createCamera(45, 0.5, 1.32);
  const extrema: Point3[] = [
    [-17, -17, 0],
    [17, 17, 0],
    [-17, 17, 24],
    [17, -17, 24],
  ];
  fitCamera(cam, extrema, 36, 33);

  const P = projectCamera(cam);
  const front = createFacingPredicate(cam);

  const box = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    z0: number,
    z1: number,
    tone: SculptureSolid['tone'],
  ): SculptureSolid => ({
    tone,
    geometry: createIsoPlateGeometry({
      camera: cam,
      project: P,
      front,
      x0,
      y0,
      x1,
      y1,
      z0,
      z1,
      radius: 1.8,
      creaseInset: 0.9,
      steps: 4,
    }),
  });

  let raw: SculptureSolid[] = [];
  const accents: string[] = [];

  switch (index) {
    case 0: {
      // 01 Contract Slabs: interlocking beveled horizontal + stepped interface tablets
      raw = [
        box(-14, -14, 14, 14, 0, 5, 'base'),
        box(-11, -11, 2, 4, 5, 12, 'mid'),
        box(-2, -4, 11, 11, 8, 16, 'accent'),
      ];
      accents.push(seg(P(-6, -2, 16.5), P(6, 5, 16.5)));
      break;
    }
    case 1: {
      // 02 Mediator Gateways: pipeline arches flanking tall central spire
      raw = [
        box(-15, -15, 15, 15, 0, 4, 'base'),
        box(-13, -6, -6, 6, 4, 15, 'mid'),
        box(-6, -13, 6, -6, 4, 15, 'mid'),
        box(-4, -4, 6, 6, 4, 22, 'accent'),
      ];
      accents.push(
        open([P(-10, 0, 15.5), P(1, 0, 22.5), P(10, 0, 8)]),
      );
      break;
    }
    case 2: {
      // 03 Mapper Prism: separated Source & DTO monoliths connected by projection vector
      raw = [
        box(-15, -14, 15, 14, 0, 3, 'base'),
        box(-14, -13, -2, 1, 3, 15, 'mid'),
        box(2, -1, 14, 13, 3, 15, 'accent'),
      ];
      accents.push(seg(P(-6, -5, 16), P(7, 5, 16)));
      break;
    }
    case 3: {
      // 04 Roslyn AST Lattice: analyzer die + 2x2 emitted AST lattice tiles
      raw = [
        box(-15, -15, 15, 15, 0, 5, 'base'),
        box(-7, -7, 7, 7, 5, 13, 'mid'),
        box(-11, -11, -2, -2, 14, 20, 'accent'),
        box(2, -11, 11, -2, 14, 20, 'mid'),
        box(-11, 2, -2, 11, 14, 20, 'mid'),
        box(2, 2, 11, 11, 14, 20, 'accent'),
      ];
      break;
    }
    case 4: {
      // 05 Telemetry Spire: 3 ascending metric bars + CLI baseline bar
      raw = [
        box(-15, -12, 15, 12, 0, 4, 'base'),
        box(-13, -5, -5, 5, 4, 11, 'mid'),
        box(-4, -5, 4, 5, 4, 17, 'mid'),
        box(5, -5, 13, 5, 4, 23, 'accent'),
      ];
      accents.push(open([P(-9, 0, 11.5), P(0, 0, 17.5), P(9, 0, 23.5)]));
      break;
    }
    default: {
      // 06 Testing Harness Cube: U-cradle dock framing lifted verified assertion block
      raw = [
        box(-14, -14, 14, 14, 0, 4, 'base'),
        box(-14, -14, 14, -5, 4, 12, 'mid'),
        box(-14, -5, -5, 14, 4, 12, 'mid'),
        box(-3, -3, 12, 12, 7, 18, 'accent'),
      ];
      accents.push(
        open([P(1, 5, 18.6), P(4, 8, 18.6), P(9, 1, 18.6)]),
      );
      break;
    }
  }

  raw.sort((a, b) => a.geometry.depthKey - b.geometry.depthKey);
  return { solids: raw, accents };
}

function getPackageQualifier(pkg: string): string | null {
  if (pkg === 'AstraFlow.Assertions') return `${UNRELEASED_SOURCE_VERSION} source`;
  if (pkg === 'AstraFlow.Cli') return '.NET tool';
  if (pkg === 'AstraFlow.Generators' || pkg === 'AstraFlow.Analyzers') {
    return 'PrivateAssets="all"';
  }
  return null;
}

function getLanguageLabel(lang: LearningMilestone['codeLang']): string {
  switch (lang) {
    case 'csharp':
      return 'C#';
    case 'xml':
      return 'XML';
    case 'bash':
      return 'CLI / Bash';
  }
}

function resolveSculptureColors(
  tone: SculptureSolid['tone'],
  isSelected: boolean,
  isTraversed: boolean,
  isUnreleased: boolean,
) {
  let variant: IsoPrismVariant;
  if (isSelected) {
    if (tone === 'accent') {
      variant = isUnreleased ? 'sand' : 'terracotta';
    } else if (tone === 'mid') {
      variant = 'ivory';
    } else {
      variant = 'sand';
    }
  } else {
    if (tone === 'accent') {
      variant = isTraversed ? 'terracotta' : 'forest';
    } else if (tone === 'mid') {
      variant = 'ivory';
    } else {
      variant = 'sand';
    }
  }
  return ISO_PRISM_PALETTES[variant];
}

export interface GuidesKineticRunwayProps {
  milestones: LearningMilestone[];
}

export function GuidesKineticRunway({ milestones }: GuidesKineticRunwayProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isStageHovered, setIsStageHovered] = useState(false);
  const [isStageFocused, setIsStageFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [waveIndex, setWaveIndex] = useState(0);
  const [copiedKind, setCopiedKind] = useState<'code' | 'cli' | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

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

  // Gentle idle beacon wave without altering deterministic initial activeIndex/aria-selected
  useEffect(() => {
    if (
      reducedMotion ||
      !stageActivity.isActive ||
      hasInteracted ||
      hoveredIndex !== null ||
      isStageHovered ||
      isStageFocused ||
      milestones.length <= 1
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setWaveIndex((prev) => (prev + 1) % milestones.length);
    }, 2400);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    reducedMotion,
    stageActivity.isActive,
    hasInteracted,
    hoveredIndex,
    isStageHovered,
    isStageFocused,
    milestones.length,
  ]);

  // Listen to hero quick-jump milestone selection events
  useEffect(() => {
    const onExternalSelect = (event: Event) => {
      const custom = event as CustomEvent<GuidesSelectEventDetail>;
      if (typeof custom.detail?.index === 'number') {
        const clamped = Math.max(
          0,
          Math.min(milestones.length - 1, custom.detail.index),
        );
        setHasInteracted(true);
        setActiveIndex(clamped);
        dispatchGuidesActiveEvent(clamped);
      }
    };
    window.addEventListener(GUIDES_SELECT_EVENT, onExternalSelect);
    return () => {
      window.removeEventListener(GUIDES_SELECT_EVENT, onExternalSelect);
    };
  }, [milestones.length]);

  const count = milestones.length;
  const safeActiveIndex = Math.max(0, Math.min(count - 1, activeIndex));
  const active = milestones[safeActiveIndex];

  const sculptures = useMemo(
    () => milestones.map((_, idx) => buildMilestoneSculpture(idx)),
    [milestones],
  );

  const selectMilestone = useCallback(
    (nextIdx: number, focusTab = false) => {
      if (count === 0) return;
      const wrapped = ((nextIdx % count) + count) % count;
      setHasInteracted(true);
      setActiveIndex(wrapped);
      dispatchGuidesActiveEvent(wrapped);
      const chosen = milestones[wrapped];
      if (chosen) {
        setLiveAnnouncement(`Milestone ${chosen.stepNumber}: ${chosen.shortTitle}`);
      }
      if (focusTab) {
        tabRefs.current[wrapped]?.focus();
      }
    },
    [count, milestones],
  );

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        selectMilestone(index + 1, true);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        selectMilestone(index - 1, true);
        break;
      case 'Home':
        event.preventDefault();
        selectMilestone(0, true);
        break;
      case 'End':
        event.preventDefault();
        selectMilestone(count - 1, true);
        break;
      default:
        break;
    }
  };

  const copyText = async (text: string, kind: 'code' | 'cli', label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', 'true');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        document.body.removeChild(helper);
      }
      setCopiedKind(kind);
      setLiveAnnouncement(`${label} copied to clipboard.`);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopiedKind(null), 1800);
    } catch {
      setLiveAnnouncement(`Select the ${label.toLowerCase()} manually to copy.`);
    }
  };

  if (!active) {
    return null;
  }

  const localCheck = LOCAL_CHECKS[active.id] ?? DEFAULT_LOCAL_CHECK;
  const activeCoord =
    STATION_COORDS[safeActiveIndex] ?? STATION_COORDS[STATION_COORDS.length - 1];
  const progressFraction =
    count > 1 ? Math.max(0.14, safeActiveIndex / (count - 1)) : 1;

  return (
    <div
      ref={stageRef}
      id="guides-runway"
      className={styles.runwayRoot}
      onMouseEnter={() => setIsStageHovered(true)}
      onMouseLeave={() => setIsStageHovered(false)}
      onFocusCapture={() => setIsStageFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsStageFocused(false);
        }
      }}
    >
      <div className={styles.runwayHeader}>
        <div className={styles.runwayMeta}>
          <span>ASTRAFLOW / KINETIC LEARNING RUNWAY</span>
          <span className={styles.runwayActiveCount}>
            MILESTONE {active.stepNumber} OF {String(count).padStart(2, '0')}
          </span>
        </div>

        <div className={styles.runwayControls}>
          <span className={styles.signalLiveBadge}>
            <span className={styles.signalLiveDot} aria-hidden="true" />
            LIVE PROGRESSION · CONTINUOUS
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

      {/* Open diagonal ascending 6-station architectural trajectory */}
      <div className={styles.runwayStage}>
        <div className={styles.runwayGridBackdrop} aria-hidden="true" />

        <svg
          className={styles.runwayTrace}
          viewBox="0 0 1000 380"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Ground altitude drop lines anchored from diagonal trajectory */}
          {STATION_COORDS.map((coord, idx) => (
            <g key={`alt-${idx}`}>
              <line
                x1={coord.svgX}
                y1={coord.svgY}
                x2={coord.svgX}
                y2={coord.groundY}
                stroke={
                  idx <= safeActiveIndex
                    ? WARM_FOREST_PALETTE.action
                    : WARM_FOREST_PALETTE.border
                }
                strokeOpacity={idx <= safeActiveIndex ? 0.48 : 0.72}
                strokeWidth={1.15}
                strokeDasharray="3 4"
              />
              <circle
                cx={coord.svgX}
                cy={coord.groundY}
                r={2.5}
                fill={
                  idx <= safeActiveIndex
                    ? WARM_FOREST_PALETTE.signal
                    : WARM_FOREST_PALETTE.muted
                }
              />
            </g>
          ))}

          {/* Base ground horizon line */}
          <line
            x1={80}
            y1={360}
            x2={910}
            y2={360}
            stroke={WARM_FOREST_PALETTE.border}
            strokeWidth={1}
            strokeDasharray="4 6"
          />

          {/* Base architectural trajectory spine */}
          <path
            d={RUNWAY_ROUTE_PATH}
            fill="none"
            stroke="#9eb0a2"
            strokeWidth={2.4}
            strokeLinecap="round"
          />

          {/* Soft Signal Orange energy halo along traveled progression */}
          <motion.path
            d={RUNWAY_ROUTE_PATH}
            fill="none"
            stroke={WARM_FOREST_PALETTE.signal}
            strokeWidth={11}
            strokeOpacity={0.22}
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: progressFraction }}
            transition={{
              duration: reducedMotion ? 0 : 0.6,
              ease: [0.22, 0.8, 0.22, 1],
            }}
          />

          {/* Crisp Signal Orange progress beam */}
          <motion.path
            d={RUNWAY_ROUTE_PATH}
            fill="none"
            stroke={WARM_FOREST_PALETTE.signal}
            strokeWidth={3.2}
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: progressFraction }}
            transition={{
              duration: reducedMotion ? 0 : 0.6,
              ease: [0.22, 0.8, 0.22, 1],
            }}
          />

          {/* Continuous traveling ambient signal pulse along the full ascending trace */}
          <path
            d={RUNWAY_ROUTE_PATH}
            fill="none"
            stroke={WARM_FOREST_PALETTE.signal}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="28 190"
            className={styles.signalDashStream}
            opacity={0.85}
          />

          {/* Traveling milestone cursor ring */}
          <motion.circle
            r={7}
            fill={WARM_FOREST_PALETTE.paperRaised}
            stroke={WARM_FOREST_PALETTE.signal}
            strokeWidth={3}
            initial={false}
            animate={{ cx: activeCoord.svgX, cy: activeCoord.svgY }}
            transition={{
              duration: reducedMotion ? 0 : 0.55,
              ease: [0.22, 0.8, 0.22, 1],
            }}
          />
        </svg>

        <div
          className={styles.runwayStations}
          role="tablist"
          aria-label="AstraFlow learning milestones"
        >
          {milestones.map((milestone, index) => {
            const isSelected = index === safeActiveIndex;
            const isTraversed = index < safeActiveIndex;
            const isIdleWave =
              !hasInteracted &&
              hoveredIndex === null &&
              !isStageHovered &&
              !isStageFocused &&
              waveIndex === index &&
              !isSelected;

            const sculpture = sculptures[index];
            const posClass = STATION_POS_CLASSES[index] ?? '';
            const cue = STATION_CUES[index] ?? 'MILESTONE';
            const isUnreleased = Boolean(milestone.unreleasedNote);

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
                data-wave={isIdleWave ? 'true' : 'false'}
                className={`${styles.stationCard} ${posClass}`}
                onClick={() => selectMilestone(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {/* 72x60 Bespoke 3D Isometric Hairline Architectural Monument Plinth */}
                <svg
                  className={styles.stationSculptSvg}
                  viewBox="0 0 72 60"
                  aria-hidden="true"
                >
                  {sculpture?.solids.map((solid, solidIdx) => {
                    const palette = resolveSculptureColors(
                      solid.tone,
                      isSelected,
                      isTraversed,
                      isUnreleased,
                    );
                    return (
                      <g key={`solid-${index}-${solidIdx}`}>
                        <path
                          d={solid.geometry.silPath}
                          fill={palette.fill}
                          stroke={
                            isSelected && solid.tone === 'accent'
                              ? WARM_FOREST_PALETTE.peach
                              : palette.stroke
                          }
                          strokeWidth={1.15}
                          strokeLinejoin="round"
                        />
                        {solid.geometry.creasePath ? (
                          <path
                            d={solid.geometry.creasePath}
                            fill="none"
                            stroke={palette.crease}
                            strokeWidth={0.8}
                            strokeLinecap="round"
                          />
                        ) : null}
                      </g>
                    );
                  })}
                  {sculpture?.accents.map((d, accentIdx) => (
                    <path
                      key={`accent-${index}-${accentIdx}`}
                      d={d}
                      fill="none"
                      stroke={
                        isSelected
                          ? WARM_FOREST_PALETTE.peach
                          : WARM_FOREST_PALETTE.signal
                      }
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </svg>

                <span className={styles.stationMetaRow}>
                  <span className={styles.stationStepNum}>
                    {milestone.stepNumber}
                  </span>
                  {milestone.unreleasedNote ? (
                    <span className={styles.stationSourcePill}>2.4*</span>
                  ) : null}
                </span>

                <strong className={styles.stationTitle}>
                  {milestone.shortTitle}
                </strong>

                <span className={styles.stationSubtitleCue}>{cue}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Persistent Interactive Workbench Panel */}
      <div className={styles.workbenchShell}>
        <div
          id="runway-workbench-panel"
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`runway-tab-${active.id}`}
        >
          <motion.div
            key={active.id}
            className={styles.workbenchPanel}
            initial={reducedMotion ? false : { opacity: 0.45, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.16,
              ease: [0.22, 0.8, 0.22, 1],
            }}
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

              <h2 className={styles.panelHeading}>{active.subtitle}</h2>
              <p className={styles.panelSummary}>{active.summary}</p>

              <span className={styles.pkgSectionLabel}>
                Required packages for this milestone
              </span>
              <div
                className={styles.pkgRow}
                aria-label="Required packages for this milestone"
              >
                {active.packages.map((pkg) => {
                  const isUnreleasedPkg = pkg === 'AstraFlow.Assertions';
                  const qualifier = getPackageQualifier(pkg);
                  return (
                    <Link
                      key={pkg}
                      href={`/packages#${encodeURIComponent(pkg)}`}
                      className={`${styles.pkgPill}${
                        isUnreleasedPkg ? ` ${styles.pkgPillUnreleased}` : ''
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
                  <span className={styles.codeTitleGroup}>
                    <span className={styles.codeDots} aria-hidden="true" />
                    <span className={styles.codeLangTag}>
                      {getLanguageLabel(active.codeLang)}
                    </span>
                    <span>{active.codeTitle}</span>
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
                        'Verification CLI check',
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
          </motion.div>
        </div>
      </div>

      <div className={styles.srLive} aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>
    </div>
  );
}
