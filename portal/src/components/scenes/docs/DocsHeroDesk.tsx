'use client';

import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type { DocCategory, DocSummary } from '@/lib/docs';
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
  type Point3,
} from '@/components/hairline';
import styles from './DocsHeroDesk.module.css';

export interface DocsHeroDeskProps {
  docs?: DocSummary[];
}

interface CodexVolumeSpec {
  id: string;
  num: string;
  shortTag: string;
  shelfTitle: string;
  category: DocCategory;
  flagshipSlug: string;
  flagshipTitle: string;
  apiPill: string;
  summary: string;
  defaultMinutes: number;
  cx: number;
  cy: number;
  zTop: number;
  calloutShelf: 'top' | 'bottom';
}

const CODEX_VOLUMES: readonly CodexVolumeSpec[] = [
  {
    id: 'getting-started',
    num: '01',
    shortTag: 'START',
    shelfTitle: 'Getting Started',
    category: 'Getting Started',
    flagshipSlug: 'getting-started',
    flagshipTitle: 'Getting Started with AstraFlow',
    apiPill: 'IRequest<TResponse>',
    summary: 'Package topology, DI registration, and your first end-to-end request.',
    defaultMinutes: 4,
    cx: -96,
    cy: 56,
    zTop: 24,
    calloutShelf: 'bottom',
  },
  {
    id: 'core-mapping',
    num: '02',
    shortTag: 'CORE',
    shelfTitle: 'Core & Mapping',
    category: 'Core & Mapping',
    flagshipSlug: 'mapper',
    flagshipTitle: 'Explicit Object Mapping',
    apiPill: 'IDeclaredObjectMappingRule',
    summary: 'Mediator dispatch, pipeline behaviors, conventions, and explicit maps.',
    defaultMinutes: 5,
    cx: -48,
    cy: 28,
    zTop: 29,
    calloutShelf: 'top',
  },
  {
    id: 'integrations',
    num: '03',
    shortTag: 'INTEGRATE',
    shelfTitle: 'Integrations',
    category: 'Integrations',
    flagshipSlug: 'entity-framework-core',
    flagshipTitle: 'Entity Framework Core Projections',
    apiPill: 'ProjectTo<TDto>()',
    summary: 'ASP.NET Core ProblemDetails, EF Core SQL translation, and validation.',
    defaultMinutes: 4,
    cx: 0,
    cy: 0,
    zTop: 34,
    calloutShelf: 'bottom',
  },
  {
    id: 'diagnostics-cli',
    num: '04',
    shortTag: 'DIAGNOSE',
    shelfTitle: 'Diagnostics & CLI',
    category: 'Diagnostics, Tooling & Testing',
    flagshipSlug: 'diagnostics',
    flagshipTitle: 'Diagnostics & Inspection',
    apiPill: 'IAstraFlowDiagnosticsReporter',
    summary: 'Build-time Roslyn analyzers, generators, OpenTelemetry, CLI, and tests.',
    defaultMinutes: 5,
    cx: 48,
    cy: -28,
    zTop: 39,
    calloutShelf: 'top',
  },
  {
    id: 'operations-adrs',
    num: '05',
    shortTag: 'ADRS & OPS',
    shelfTitle: 'Operations & ADRs',
    category: 'Architecture Decisions (ADRs)',
    flagshipSlug: 'adr/0001-generated-mapper',
    flagshipTitle: 'ADR-0001: Generated Mapper',
    apiPill: 'ADR-0001',
    summary: 'Accepted ADRs, supply-chain security, benchmarks, and migration guides.',
    defaultMinutes: 4,
    cx: 96,
    cy: -56,
    zTop: 44,
    calloutShelf: 'bottom',
  },
] as const;

const CYCLE_INTERVAL_MS = 3400;

export function DocsHeroDesk({ docs = [] }: DocsHeroDeskProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotionSafe();
  const { isActive: viewportActive } = useViewportActivity(stageRef);

  const [activeIndex, setActiveIndex] = useState(0);
  const [userLocked, setUserLocked] = useState(false);
  const [pointerInside, setPointerInside] = useState(false);

  const docsBySlug = useMemo(() => {
    const map = new Map<string, DocSummary>();
    for (const doc of docs) {
      map.set(doc.slugPath, doc);
    }
    return map;
  }, [docs]);

  const countByCategory = useMemo(() => {
    const counts = new Map<DocCategory, number>();
    for (const doc of docs) {
      counts.set(doc.category, (counts.get(doc.category) ?? 0) + 1);
    }
    return counts;
  }, [docs]);

  useEffect(() => {
    if (reducedMotion || !viewportActive || userLocked || pointerInside) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CODEX_VOLUMES.length);
    }, CYCLE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [pointerInside, reducedMotion, userLocked, viewportActive]);

  const geometryScene = useMemo(() => {
    const rawCam = createCamera(45, 0.5, 1.24);
    const extremePoints: Point3[] = [
      [-152, -106, 0],
      [152, -106, 0],
      [152, 106, 0],
      [-152, 106, 0],
      [-152, -106, 56],
      [152, -106, 56],
      [152, 106, 56],
      [-152, 106, 56],
    ];
    const camera = fitCamera(rawCam, extremePoints, 320, 190);
    const project = projectCamera(camera);
    const front = createFacingPredicate(camera);

    const chassis = createIsoPlateGeometry({
      x0: -146,
      y0: -100,
      x1: 146,
      y1: 100,
      z0: 0,
      z1: 9,
      radius: 8,
      creaseInset: 2.8,
      camera,
      project,
      front,
    });

    const floorGridLines: string[] = [];
    for (let x = -120; x <= 120; x += 48) {
      floorGridLines.push(seg(project(x, -92, 9.05), project(x, 92, 9.05)));
    }
    for (let y = -80; y <= 80; y += 40) {
      floorGridLines.push(seg(project(-136, y, 9.05), project(136, y, 9.05)));
    }

    const busWaypoints: Point3[] = CODEX_VOLUMES.map((vol) => [
      vol.cx,
      vol.cy + 34,
      9.3,
    ]);

    const volumes = CODEX_VOLUMES.map((vol) => {
      const geo = createIsoPlateGeometry({
        x0: vol.cx - 20,
        y0: vol.cy - 26,
        x1: vol.cx + 20,
        y1: vol.cy + 26,
        z0: 9,
        z1: vol.zTop,
        radius: 3.5,
        creaseInset: 1.5,
        camera,
        project,
        front,
      });

      const spineCap = createIsoPlateGeometry({
        x0: vol.cx - 15,
        y0: vol.cy - 22,
        x1: vol.cx + 15,
        y1: vol.cy - 12,
        z0: vol.zTop,
        z1: vol.zTop + 4,
        radius: 1.5,
        creaseInset: 0.7,
        camera,
        project,
        front,
      });

      const tapPath = seg(
        project(vol.cx, vol.cy + 34, 9.3),
        project(vol.cx, vol.cy + 26, 9.3),
      );

      const capCenter = project(vol.cx, vol.cy + 4, vol.zTop);
      const leaderOrigin =
        vol.calloutShelf === 'top'
          ? project(vol.cx, vol.cy - 18, vol.zTop + 4)
          : project(vol.cx, vol.cy + 34, 9.3);
      const labelX = capCenter[0];
      const labelY = vol.calloutShelf === 'top' ? 26 : 344;
      const leaderPath =
        vol.calloutShelf === 'top'
          ? `M${r2(leaderOrigin[0])} ${r2(leaderOrigin[1] - 4)} L${r2(labelX)} ${r2(labelY + 14)}`
          : `M${r2(leaderOrigin[0])} ${r2(leaderOrigin[1] + 4)} L${r2(labelX)} ${r2(labelY - 14)}`;

      return {
        spec: vol,
        geo,
        spineCap,
        tapPath,
        capCenter,
        labelX,
        labelY,
        leaderPath,
      };
    });

    return {
      camera,
      project,
      chassis,
      floorGridPath: floorGridLines.join(' '),
      busWaypoints,
      volumes,
    };
  }, []);

  const activeVolume = CODEX_VOLUMES[activeIndex] ?? CODEX_VOLUMES[0];
  const flagshipDoc = docsBySlug.get(activeVolume.flagshipSlug);
  const categoryCount =
    activeVolume.id === 'operations-adrs'
      ? (countByCategory.get('Reference & Operations') ?? 0) +
        (countByCategory.get('Architecture Decisions (ADRs)') ?? 0)
      : (countByCategory.get(activeVolume.category) ?? 0);

  const selectVolume = (idx: number, lock = false) => {
    setActiveIndex(idx);
    if (lock) {
      setUserLocked(true);
    }
  };

  const handleVolumeKeyDown = (event: KeyboardEvent<SVGGElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (index + 1) % CODEX_VOLUMES.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (index - 1 + CODEX_VOLUMES.length) % CODEX_VOLUMES.length;
    } else if (event.key === 'Home') {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      nextIndex = CODEX_VOLUMES.length - 1;
    } else if (event.key === 'Escape') {
      setUserLocked(false);
    }

    if (nextIndex !== null) {
      selectVolume(nextIndex, true);
      const nextId = CODEX_VOLUMES[nextIndex]?.id;
      if (nextId) {
        stageRef.current
          ?.querySelector<SVGGElement>(`#codex-volume-tab-${nextId}`)
          ?.focus();
      }
    }
  };

  const activeOrigin = geometryScene.volumes[activeIndex]?.geo.restCenter ?? [320, 190];
  const conduitProgress = 0.08 + (activeIndex / (CODEX_VOLUMES.length - 1)) * 0.92;

  return (
    <div
      className={styles.deskCard}
      onMouseEnter={() => setPointerInside(true)}
      onMouseLeave={() => setPointerInside(false)}
      ref={stageRef}
    >
      <div className={styles.deskHeader}>
        <span className={styles.deskEyebrow}>
          <span aria-hidden="true" className={styles.deskPulseDot} />
          OPTICAL CODEX / 5 ARCHITECTURAL VOLUMES
        </span>
        <span
          className={`${styles.deskStatusBadge} ${
            userLocked || pointerInside ? styles.deskStatusBadgeActive : ''
          }`}
        >
          {userLocked ? 'PINNED' : pointerInside ? 'INSPECTING' : 'SCANNING'} · FOLIO{' '}
          {activeVolume.num}
        </span>
      </div>

      <div className={styles.stageFrame}>
        <svg
          aria-label="Interactive isometric 5-volume AstraFlow documentation codex"
          className={styles.deskSvg}
          role="group"
          viewBox="0 0 640 372"
        >
          {/* Base drafted architectural plinth */}
          <IsoPrism
            geometry={geometryScene.chassis}
            interactive={false}
            strokeWidth={1.1}
            variant="sand"
          />

          <path
            d={geometryScene.floorGridPath}
            fill="none"
            stroke="rgba(8, 44, 38, 0.1)"
            strokeWidth={0.8}
          />

          {/* Continuous optical bus + branch taps along desk apron */}
          <IsoSignalConduit
            active
            baseStrokeWidth={1.15}
            camera={geometryScene.camera}
            cornerRadius={3}
            progress={conduitProgress}
            pulseRadius={2.8}
            showTerminals
            surface="ivory"
            worldPoints={geometryScene.busWaypoints}
          />

          {geometryScene.volumes.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <g key={`leader-${item.spec.id}`}>
                <path
                  d={item.tapPath}
                  fill="none"
                  stroke={isActive ? '#f25e3b' : '#9eb0a5'}
                  strokeWidth={isActive ? 1.55 : 0.95}
                />
                <path
                  d={item.leaderPath}
                  fill="none"
                  stroke={isActive ? '#f25e3b' : '#9eb0a5'}
                  strokeDasharray={isActive ? undefined : '2 3'}
                  strokeWidth={isActive ? 1.35 : 0.95}
                />
                <circle
                  cx={r2(item.labelX)}
                  cy={r2(
                    item.spec.calloutShelf === 'top'
                      ? item.labelY + 14
                      : item.labelY - 14,
                  )}
                  fill={isActive ? '#f25e3b' : '#617267'}
                  r={isActive ? 2.8 : 1.9}
                />
                <text
                  className={`${styles.calloutText} ${
                    isActive ? styles.calloutTextActive : ''
                  }`}
                  dominantBaseline="central"
                  textAnchor="middle"
                  x={r2(item.labelX)}
                  y={r2(item.labelY)}
                >
                  {item.spec.num} {item.spec.shortTag}
                </text>
              </g>
            );
          })}

          {/* Interactive 5-volume codex stair (strictly painter's back-to-front order) */}
          <g aria-label="Documentation track volumes" role="tablist">
            {geometryScene.volumes.map((item, index) => {
              const isActive = index === activeIndex;
              const dx = item.geo.restCenter[0] - activeOrigin[0];
              const dy = item.geo.restCenter[1] - activeOrigin[1];
              const dist = Math.hypot(dx, dy);
              const delayMs = isActive ? 0 : staggerDelayMs(dist, 240, 0.55);

              return (
                <IsoPrism
                  active={isActive}
                  activeStrokeWidth={1.85}
                  ariaControls={`codex-lens-${item.spec.id}`}
                  ariaLabel={`${item.spec.num} ${item.spec.shelfTitle} — ${item.spec.flagshipTitle}`}
                  ariaSelected={isActive}
                  className={styles.volumeGroup}
                  dataTestId={`docs-volume-${item.spec.num}`}
                  delayMs={delayMs}
                  geometry={item.geo}
                  id={`codex-volume-tab-${item.spec.id}`}
                  interactive
                  key={item.spec.id}
                  liftPx={isActive ? 11 : 0}
                  onFocusChange={(focused) => {
                    if (focused) selectVolume(index, false);
                  }}
                  onHoverChange={(hovered) => {
                    if (hovered) selectVolume(index, false);
                  }}
                  onKeyDown={(event) => handleVolumeKeyDown(event, index)}
                  onSelect={() => selectVolume(index, true)}
                  role="tab"
                  selected={isActive}
                  showDropGuides={isActive}
                  strokeWidth={1.2}
                  tabIndex={isActive ? 0 : -1}
                  variant={isActive ? 'terracotta' : 'ivory'}
                >
                  {/* Sculpted spine bookmark relief cap */}
                  <path
                    d={item.spineCap.silPath}
                    fill={isActive ? '#b73921' : '#0a342b'}
                    stroke={isActive ? '#f25e3b' : '#2f5b4e'}
                    strokeWidth={0.95}
                  />
                  {item.spineCap.creasePath ? (
                    <path
                      d={item.spineCap.creasePath}
                      fill="none"
                      stroke={isActive ? '#ffd2bd' : '#617267'}
                      strokeWidth={0.75}
                    />
                  ) : null}
                  {/* Etched volume index */}
                  <text
                    className={`${styles.volumeCapIndex} ${
                      isActive ? styles.volumeCapIndexActive : ''
                    }`}
                    dominantBaseline="central"
                    textAnchor="middle"
                    x={r2(item.capCenter[0])}
                    y={r2(item.capCenter[1])}
                  >
                    {item.spec.num}
                  </text>
                </IsoPrism>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Synchronized compact volume switcher rail */}
      <div aria-label="Select codex volume" className={styles.trackTabStrip} role="group">
        {CODEX_VOLUMES.map((vol, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              aria-pressed={isActive}
              className={`${styles.trackMiniBtn} ${
                isActive ? styles.trackMiniBtnActive : ''
              }`}
              key={vol.id}
              onClick={() => selectVolume(index, true)}
              onMouseEnter={() => {
                if (!userLocked) selectVolume(index, false);
              }}
              type="button"
            >
              <span className={styles.trackMiniNum}>{vol.num}</span>
              <span className={styles.trackMiniName}>{vol.shelfTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Live Active Volume Lens */}
      <div
        aria-live="polite"
        className={styles.activeLens}
        id={`codex-lens-${activeVolume.id}`}
      >
        <div className={styles.lensBody}>
          <div className={styles.lensMetaRow}>
            <span>
              FOLIO {activeVolume.num} / {activeVolume.shelfTitle}
            </span>
            {categoryCount > 0 ? <span>{categoryCount} guides</span> : null}
            <span>~{flagshipDoc?.readingMinutes ?? activeVolume.defaultMinutes} min read</span>
            <code className={styles.lensApiPill}>{activeVolume.apiPill}</code>
          </div>
          <h2 className={styles.lensTitle}>
            {flagshipDoc?.title ?? activeVolume.flagshipTitle}
          </h2>
          <p className={styles.lensSummary}>{activeVolume.summary}</p>
        </div>

        <Link
          className={styles.lensCta}
          href={`/docs/${activeVolume.flagshipSlug}`}
        >
          Open track guide <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}
