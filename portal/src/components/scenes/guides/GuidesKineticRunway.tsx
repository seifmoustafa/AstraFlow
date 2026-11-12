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
  type IsoPlateGeometry,
  type Point2,
  type Point3,
  type Projector,
} from '@/components/hairline';
import styles from './GuidesKineticRunway.module.css';

export interface GuidesKineticRunwayProps {
  milestones: LearningMilestone[];
  initialMilestoneId?: string;
  className?: string;
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

const SVG_WIDTH = 840;
const SVG_HEIGHT = 270;
const PLATE_HALF = 24;

interface StationGeometryEntry {
  index: number;
  cx: number;
  cy: number;
  z0: number;
  z1: number;
  conduitAnchor: Point3;
  geometry: IsoPlateGeometry;
  baseDropLine: string;
  markPaths: string[];
  dotCenters: Point2[];
}

function buildStationMark(
  index: number,
  P: Projector,
  cx: number,
  cy: number,
  zTop: number,
): string[] {
  switch (index) {
    case 0: {
      // Contracts frame
      const sq: Point2[] = [
        P(cx - 9, cy - 9, zTop),
        P(cx + 9, cy - 9, zTop),
        P(cx + 9, cy + 9, zTop),
        P(cx - 9, cy + 9, zTop),
        P(cx - 9, cy - 9, zTop),
      ];
      return [
        open(sq),
        seg(P(cx - 4, cy, zTop), P(cx + 4, cy, zTop)),
      ];
    }
    case 1: {
      // Mediator pipeline layers
      return [
        seg(P(cx - 10, cy - 5, zTop), P(cx + 10, cy - 5, zTop)),
        seg(P(cx - 7, cy, zTop), P(cx + 7, cy, zTop)),
        seg(P(cx - 10, cy + 5, zTop), P(cx + 10, cy + 5, zTop)),
      ];
    }
    case 2: {
      // Explicit mapping transfer
      return [
        seg(P(cx - 10, cy - 6, zTop), P(cx - 2, cy - 6, zTop)),
        seg(P(cx - 2, cy - 6, zTop), P(cx + 4, cy + 6, zTop)),
        seg(P(cx + 4, cy + 6, zTop), P(cx + 10, cy + 6, zTop)),
        seg(P(cx - 10, cy + 6, zTop), P(cx - 3, cy + 6, zTop)),
      ];
    }
    case 3: {
      // Generators diamond + core
      const inner: Point2[] = [
        P(cx, cy - 9, zTop),
        P(cx + 9, cy, zTop),
        P(cx, cy + 9, zTop),
        P(cx - 9, cy, zTop),
        P(cx, cy - 9, zTop),
      ];
      return [
        open(inner),
        seg(P(cx - 3.5, cy, zTop), P(cx + 3.5, cy, zTop)),
      ];
    }
    case 4: {
      // Diagnostics telemetry waveform
      return [
        open([
          P(cx - 11, cy + 4, zTop),
          P(cx - 5, cy + 4, zTop),
          P(cx - 2, cy - 7, zTop),
          P(cx + 3, cy + 6, zTop),
          P(cx + 6, cy - 2, zTop),
          P(cx + 11, cy - 2, zTop),
        ]),
      ];
    }
    default: {
      // Testing verification check
      return [
        open([
          P(cx - 8, cy + 1, zTop),
          P(cx - 2, cy + 7, zTop),
          P(cx + 10, cy - 7, zTop),
        ]),
      ];
    }
  }
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
  const [pulsePaused, setPulsePaused] = useState<boolean>(false);
  const [copiedKind, setCopiedKind] = useState<'code' | 'cli' | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  const stageRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const copyTimerRef = useRef<number | null>(null);

  const reducedMotion = useReducedMotionSafe();
  const stageActivity = useViewportActivity(stageRef, {
    paused: pulsePaused || reducedMotion,
    initialInView: true,
  });

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const count = milestones.length;

  const scene = useMemo(() => {
    const safeCount = Math.max(1, count);
    const mid = (safeCount - 1) / 2;
    const stepX = 68;
    const stepY = 64;
    const zRise = 5.5;
    const plateHeight = 11;
    const maxLiftWorld = 12;

    const cam = createCamera(45, 0.5, 1.34);
    const extrema: Point3[] = [];
    for (let i = 0; i < safeCount; i++) {
      const cx = (i - mid) * stepX;
      const cy = -(i - mid) * stepY;
      const z0 = i * zRise;
      const z1 = z0 + plateHeight;
      extrema.push(
        [cx - PLATE_HALF, cy - PLATE_HALF, 0],
        [cx + PLATE_HALF, cy + PLATE_HALF, 0],
        [cx - PLATE_HALF, cy + PLATE_HALF, z1 + maxLiftWorld],
        [cx + PLATE_HALF, cy - PLATE_HALF, z1 + maxLiftWorld],
      );
    }
    fitCamera(cam, extrema, SVG_WIDTH / 2, SVG_HEIGHT / 2 + 12);

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
        radius: 6,
        creaseInset: 2,
        steps: 6,
      });

      const baseFoot = P(cx, cy, z0);
      const groundPoint = P(cx, cy, 0);
      groundRailPoints.push(groundPoint);

      const dotCenters: Point2[] = [];
      const dotCount = i + 1;
      const dotSpan = (dotCount - 1) * 4.4;
      for (let d = 0; d < dotCount; d++) {
        const offset = -dotSpan / 2 + d * 4.4;
        dotCenters.push(P(cx + offset * 0.72, cy + 16 + offset * 0.3, z1));
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
        baseDropLine: seg(baseFoot, groundPoint),
        markPaths: buildStationMark(i, P, cx, cy, z1),
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
              <button
                type="button"
                className={styles.navBtn}
                aria-pressed={pulsePaused}
                disabled={reducedMotion}
                title={
                  reducedMotion
                    ? 'Motion paused by prefers-reduced-motion'
                    : undefined
                }
                onClick={() => setPulsePaused((prev) => !prev)}
              >
                {pulsePaused ? 'Resume signal ▶' : 'Pause signal ⏸'}
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
                active={safeActiveIndex > 0}
                progress={conduitProgress}
                paused={pulsePaused}
                viewportActive={stageActivity.isActive}
                surface="ivory"
                baseColor={WARM_FOREST_PALETTE.muted}
                baseStrokeWidth={1.35}
                activeStrokeWidth={2.2}
                pulseDurationMs={2600}
                pulseRadius={3.2}
                showTerminals
                ariaLabel={`Learning progression signal from Contracts to ${active.shortTitle}`}
              />

              {/* Opaque isometric plinths rendered back-to-front (Rules 01, 02, 04, 06, 09, 10) */}
              {scene.sortedStations.map((station) => {
                const milestone = milestones[station.index];
                if (!milestone) return null;

                const isSelected = station.index === safeActiveIndex;
                const isTraversed = station.index < safeActiveIndex;
                const isHovered = hoveredIndex === station.index;
                const liftPx = isSelected ? 12 : isHovered ? 5 : 0;

                const variant = isSelected
                  ? milestone.unreleasedNote
                    ? 'terracotta'
                    : 'forest'
                  : isTraversed
                    ? 'sand'
                    : 'ivory';

                const markStroke = isSelected
                  ? milestone.unreleasedNote
                    ? WARM_FOREST_PALETTE.ink
                    : WARM_FOREST_PALETTE.peach
                  : isTraversed
                    ? WARM_FOREST_PALETTE.inkSecondary
                    : WARM_FOREST_PALETTE.ink;

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
                    active={isHovered}
                    liftPx={liftPx}
                    delayMs={staggerDelayMs(station.index, safeActiveIndex, 45)}
                    showDropGuides={isSelected || isHovered}
                    role="button"
                    ariaPressed={isSelected}
                    label={`Select milestone ${milestone.stepNumber}: ${milestone.shortTitle}`}
                    onSelect={() => selectMilestone(station.index)}
                    onHoverChange={(hovering) =>
                      setHoveredIndex(hovering ? station.index : null)
                    }
                    onKeyDown={(event) => handleSvgKeyDown(event, station.index)}
                    dataTestId={`runway-station-${milestone.id}`}
                  >
                    {station.markPaths.map((d, idx) => (
                      <path
                        key={`mark-${station.index}-${idx}`}
                        d={d}
                        fill="none"
                        stroke={markStroke}
                        strokeWidth={1.3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pointerEvents="none"
                      />
                    ))}
                    {station.dotCenters.map(([dx, dy], dotIdx) => (
                      <circle
                        key={`dot-${station.index}-${dotIdx}`}
                        cx={r2(dx)}
                        cy={r2(dy)}
                        r={1.35}
                        fill={dotFill}
                        pointerEvents="none"
                      />
                    ))}
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
                <code className={styles.verifyCmd} tabIndex={0}>{localCheck.command}</code>
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
