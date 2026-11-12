'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  IsoPrism,
  IsoSignalConduit,
  WARM_FOREST_PALETTE,
  createCamera,
  createIsoPlateGeometry,
  fitCamera,
  open,
  projectCamera,
  r2,
  seg,
  staggerDelayMs,
  useReducedMotionSafe,
  useViewportActivity,
  type IsoPrismVariant,
  type Point2,
  type ReadonlyPoint3,
} from '@/components/hairline';
import styles from './HomeExplodedArchitecture.module.css';

export type AssemblyLayerIndex = 0 | 1 | 2;
export type AssemblyViewMode = 'exploded' | 'assembled';

export interface AssemblyPackageRef {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly role: string;
  readonly href: string;
}

export interface AssemblyLayerSpec {
  readonly index: AssemblyLayerIndex;
  readonly tierLabel: string;
  readonly shortTag: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly variant: IsoPrismVariant;
  readonly z0: number;
  readonly z1: number;
  readonly packages: readonly AssemblyPackageRef[];
  readonly contracts: readonly string[];
  readonly docsHref: string;
  readonly docsLabel: string;
}

export interface HomeExplodedArchitectureProps {
  /** Optional default active tier (`0` top Input, `1` middle Execution, `2` bottom Inspection). */
  readonly initialLayer?: AssemblyLayerIndex;
  /** Optional initial spacing mode. Defaults to `'exploded'`. */
  readonly initialMode?: AssemblyViewMode;
  /** Optional outer section id (defaults to `'composition'`). */
  readonly sectionId?: string;
  /** Optional className hook for parent page spacing overrides. */
  readonly className?: string;
}

const SVG_WIDTH = 660;
const SVG_HEIGHT = 540;
const PLATE_MIN = -102;
const PLATE_MAX = 102;
const PLATE_RADIUS = 18;
const PLATE_CREASE_INSET = 10;
const PLATE_STEPS = 7;

const RAIL_SCREEN_X = 592;
const RAIL_TOP_Y = 58;
const RAIL_BOTTOM_Y = 476;
const CALLOUT_EDGE_X = 16;

const LAYER_SPECS: readonly AssemblyLayerSpec[] = [
  {
    index: 0,
    tierLabel: '01 / INPUT',
    shortTag: 'INPUT',
    title: 'Declare intent',
    subtitle: 'Pure contract shapes with zero framework baggage',
    description:
      'Application boundaries start with light, serializable request and notification interfaces. Projects share AstraFlow.Contracts across domain, client, and worker assemblies without pulling in mediator or runtime engines.',
    variant: 'ivory',
    z0: 204,
    z1: 226,
    packages: [
      {
        id: 'contracts',
        name: 'AstraFlow.Contracts',
        version: '2.3.0',
        role: 'Zero-dependency request, notification, and stream contracts',
        href: '/packages#directory',
      },
    ],
    contracts: [
      'IRequest<T>',
      'IRequest',
      'INotification',
      'IStreamRequest<T>',
      'IRequestContext',
    ],
    docsHref: '/docs/architecture',
    docsLabel: 'Read architecture contracts',
  },
  {
    index: 1,
    tierLabel: '02 / EXECUTION',
    shortTag: 'EXECUTION',
    title: 'Compose behavior',
    subtitle: 'Deterministic dispatch pipelines and compiled object maps',
    description:
      'Execution sits in the middle plane: AstraFlow.Mediator routes each request through an explicit outer-to-inner pipeline stack while AstraFlow.Mapper translates boundary DTOs and query projections explicitly.',
    variant: 'forest',
    z0: 102,
    z1: 124,
    packages: [
      {
        id: 'mediator',
        name: 'AstraFlow.Mediator',
        version: '2.3.0',
        role: 'Request dispatch, pipeline behaviors, and notification fan-out',
        href: '/packages#directory',
      },
      {
        id: 'mapper',
        name: 'AstraFlow.Mapper',
        version: '2.3.0',
        role: 'Declared mapping rules and EF-safe projection builders',
        href: '/packages#directory',
      },
    ],
    contracts: [
      'IPipelineBehavior',
      'IRequestHandler<,>',
      'INotificationHandler<>',
      'IDeclaredObjectMappingRule',
      'IMediator',
    ],
    docsHref: '/docs/mediator',
    docsLabel: 'Explore mediator & pipelines',
  },
  {
    index: 2,
    tierLabel: '03 / INSPECTION',
    shortTag: 'INSPECTION',
    title: 'Verify decisions',
    subtitle: 'Build-time analyzers, trace diagnostics, and test harnesses',
    description:
      'Verification grounds the entire stack before code ever ships. Compile-time analyzers guard missing handlers or cycles, diagnostics record timing without secret leakage, and test harnesses assert every pipeline contract.',
    variant: 'terracotta',
    z0: 0,
    z1: 22,
    packages: [
      {
        id: 'diagnostics',
        name: 'AstraFlow.Diagnostics',
        version: '2.3.0',
        role: 'Structured dispatch snapshots and safe redaction reporters',
        href: '/packages#directory',
      },
      {
        id: 'analyzers',
        name: 'AstraFlow.Analyzers',
        version: '2.3.0',
        role: 'Compile-time Roslyn diagnostics (AFAN0101–0404) & fixes',
        href: '/packages#directory',
      },
      {
        id: 'testing',
        name: 'AstraFlow.Testing',
        version: '2.3.0',
        role: 'Deterministic FakeMediator and PipelineTestHarness<,>',
        href: '/packages#directory',
      },
    ],
    contracts: [
      'IAstraFlowDiagnosticsReporter',
      'AFAN0101–0404',
      'FakeMediator',
      'PipelineTestHarness<,>',
      'ShouldHaveNoDiagnosticErrors()',
    ],
    docsHref: '/docs/diagnostics',
    docsLabel: 'Inspect verification tooling',
  },
] as const;

const MODE_SHIFT_ASSEMBLED: Readonly<Record<AssemblyLayerIndex, number>> = {
  0: 78,
  1: 0,
  2: -78,
};

function computeLiftPx(
  layerIndex: AssemblyLayerIndex,
  activeLayer: AssemblyLayerIndex,
  hoveredLayer: AssemblyLayerIndex | null,
  viewMode: AssemblyViewMode,
): number {
  const isHovered = hoveredLayer === layerIndex;

  if (viewMode === 'exploded') {
    if (activeLayer === 0) {
      if (layerIndex === 0) return isHovered ? 24 : 20;
      return isHovered ? 6 : 0;
    }
    if (activeLayer === 1) {
      if (layerIndex === 0) return isHovered ? 26 : 22;
      if (layerIndex === 1) return isHovered ? 18 : 14;
      return isHovered ? 6 : 0;
    }
    if (layerIndex === 0) return isHovered ? 26 : 22;
    if (layerIndex === 1) return isHovered ? 20 : 16;
    return isHovered ? 12 : 8;
  }

  // Assembled stack opens cleanly upward above any selected lower tier
  if (activeLayer === 0) {
    if (layerIndex === 0) return isHovered ? 28 : 24;
    return isHovered ? 6 : 0;
  }
  if (activeLayer === 1) {
    if (layerIndex === 0) return isHovered ? 50 : 46;
    if (layerIndex === 1) return isHovered ? 24 : 20;
    return isHovered ? 4 : 0;
  }
  if (layerIndex === 0) return isHovered ? 56 : 52;
  if (layerIndex === 1) return isHovered ? 36 : 32;
  return isHovered ? 14 : 10;
}

export function HomeExplodedArchitecture({
  initialLayer = 0,
  initialMode = 'exploded',
  sectionId = 'composition',
  className,
}: HomeExplodedArchitectureProps) {
  const [activeLayer, setActiveLayer] = useState<AssemblyLayerIndex>(initialLayer);
  const [hoveredLayer, setHoveredLayer] = useState<AssemblyLayerIndex | null>(null);
  const [viewMode, setViewMode] = useState<AssemblyViewMode>(initialMode);

  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotionSafe();
  const { isActive: viewportActive } = useViewportActivity(sectionRef, {
    rootMargin: '80px',
    threshold: 0.12,
    paused: reducedMotion,
    initialInView: true,
  });

  const headingId = useId();
  const detailPanelId = useId();

  const isExploded = viewMode === 'exploded';
  const activeSpec = LAYER_SPECS[activeLayer];

  const scene = useMemo(() => {
    const cam = createCamera(45, 0.5, 1.2);
    const extremePoints: ReadonlyPoint3[] = [
      [PLATE_MIN, PLATE_MIN, -18],
      [PLATE_MAX, PLATE_MIN, -18],
      [PLATE_MIN, PLATE_MAX, -18],
      [PLATE_MAX, PLATE_MAX, -18],
      [PLATE_MIN, PLATE_MIN, 256],
      [PLATE_MAX, PLATE_MIN, 256],
      [PLATE_MIN, PLATE_MAX, 256],
      [PLATE_MAX, PLATE_MAX, 256],
    ];
    fitCamera(cam, extremePoints, 366, 276);
    const project = projectCamera(cam);

    const geometries = LAYER_SPECS.map((spec) =>
      createIsoPlateGeometry({
        camera: cam,
        x0: PLATE_MIN,
        y0: PLATE_MIN,
        x1: PLATE_MAX,
        y1: PLATE_MAX,
        z0: spec.z0,
        z1: spec.z1,
        radius: PLATE_RADIUS,
        creaseInset: PLATE_CREASE_INSET,
        steps: PLATE_STEPS,
      }),
    );

    // 4 shared isometric corner alignment axes + center datum line (Rule 06 behind solids)
    const guideCorners: ReadonlyArray<readonly [number, number]> = [
      [PLATE_MIN, PLATE_MIN],
      [PLATE_MAX, PLATE_MIN],
      [PLATE_MIN, PLATE_MAX],
      [PLATE_MAX, PLATE_MAX],
    ];
    const cornerAxisPaths = guideCorners.map(([gx, gy]) =>
      seg(project(gx, gy, -16), project(gx, gy, 260)),
    );
    const centerAxisPath = seg(project(0, 0, -24), project(0, 0, 266));

    // Base rest datum shadow rectangle on z = -22
    const datumOutline = open([
      project(PLATE_MIN, PLATE_MIN, -22),
      project(PLATE_MAX, PLATE_MIN, -22),
      project(PLATE_MAX, PLATE_MAX, -22),
      project(PLATE_MIN, PLATE_MAX, -22),
      project(PLATE_MIN, PLATE_MIN, -22),
    ]);

    // Decorative top-plane architectural markings per tier
    const layerSurfaceMarks = LAYER_SPECS.map((spec) => {
      const z = spec.z1;
      if (spec.index === 0) {
        const nodes: Point2[] = [
          project(-48, -48, z),
          project(0, -48, z),
          project(-48, 0, z),
          project(42, 42, z),
        ];
        const trace = `${open([nodes[0], nodes[1]])}${open([nodes[0], nodes[2]])}${open([nodes[1], project(42, -16, z), nodes[3]])}`;
        return { nodes, trace };
      }
      if (spec.index === 1) {
        const nodes: Point2[] = [
          project(-56, -24, z),
          project(0, -24, z),
          project(0, 24, z),
          project(56, 24, z),
        ];
        const trace = `${open([nodes[0], nodes[1], nodes[2], nodes[3]])}${open([
          project(-28, 36, z),
          project(0, 24, z),
          project(28, -36, z),
        ])}`;
        return { nodes, trace };
      }
      const nodes: Point2[] = [
        project(-54, 44, z),
        project(-18, 44, z),
        project(18, 44, z),
        project(54, 44, z),
      ];
      const trace = `${open([nodes[0], nodes[3]])}${open([
        project(-54, -44, z),
        project(54, -44, z),
      ])}`;
      return { nodes, trace };
    });

    // Anchors on right edge & left edge of each plate (rest coordinates in exploded world)
    const rightAnchors = LAYER_SPECS.map((spec) => {
      const midZ = (spec.z0 + spec.z1) / 2;
      return project(PLATE_MAX, PLATE_MIN, midZ);
    });
    const leftAnchors = LAYER_SPECS.map((spec) => {
      const midZ = (spec.z0 + spec.z1) / 2;
      return project(PLATE_MIN, PLATE_MAX, midZ);
    });

    return {
      cam,
      geometries,
      cornerAxisPaths,
      centerAxisPath,
      datumOutline,
      layerSurfaceMarks,
      rightAnchors,
      leftAnchors,
    };
  }, []);

  // Compute current dynamic anchors for callouts and vertical conduits
  const currentLifts = useMemo(
    () =>
      LAYER_SPECS.map((spec) =>
        computeLiftPx(spec.index, activeLayer, hoveredLayer, viewMode),
      ),
    [activeLayer, hoveredLayer, viewMode],
  );

  const currentModeShifts = useMemo(
    () =>
      LAYER_SPECS.map((spec) =>
        isExploded ? 0 : MODE_SHIFT_ASSEMBLED[spec.index],
      ),
    [isExploded],
  );

  // Anchors on right edge of each tier along current mode + lift elevation
  const branchRightAnchors: readonly Point2[] = useMemo(
    () =>
      LAYER_SPECS.map((spec, idx) => {
        const base = scene.rightAnchors[idx];
        const effectiveY = base[1] + currentModeShifts[idx] - currentLifts[idx];
        return [base[0], effectiveY];
      }),
    [scene.rightAnchors, currentModeShifts, currentLifts],
  );

  const layerButtonRefs = useRef<Array<HTMLButtonElement | null>>([
    null,
    null,
    null,
  ]);

  const handleLayerButtonKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: AssemblyLayerIndex,
  ) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = ((index + 1) % 3) as AssemblyLayerIndex;
      setActiveLayer(next);
      layerButtonRefs.current[next]?.focus();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = ((index + 2) % 3) as AssemblyLayerIndex;
      setActiveLayer(prev);
      layerButtonRefs.current[prev]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveLayer(0);
      layerButtonRefs.current[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveLayer(2);
      layerButtonRefs.current[2]?.focus();
    }
  };

  const layerTransformTransition = {
    duration: reducedMotion ? 0 : 0.62,
    ease: [0.32, 0.72, 0, 1] as const,
  };

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className={className ? `${styles.section} ${className}` : styles.section}
      aria-labelledby={headingId}
    >
      <div className={styles.container}>
        {/* ── Section Intro ── */}
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              03 / ENGINEERED TO CONNECT
            </p>
            <h2 id={headingId} className={styles.title}>
              Three layers.{' '}
              <span className={styles.titleAccent}>One contract spine.</span>
            </h2>
          </div>

          <div className={styles.headerAside}>
            <p className={styles.lead}>
              Every package occupies an explicit plane: shared abstractions sit above dispatch and mapping, grounded by static analyzers and deterministic test harnesses.
            </p>
            <div className={styles.headerMeta}>
              <span className={styles.metaPill}>NuGet Suite · 2.3.0</span>
              <Link href="/packages#directory" className={styles.metaLink}>
                Browse package matrix -&gt;
              </Link>
            </div>
          </div>
        </header>

        {/* ── Interactive Workspace ── */}
        <div className={styles.workspace}>
          {/* Open Hairline Isometric Stage */}
          <div className={styles.stageColumn}>
            <div className={styles.stageToolbar}>
              <span className={styles.stageCaption}>
                <span className={styles.stageIndicatorDot} aria-hidden="true" />
                HAIRLINE ISOMETRIC STACK · 3 TIERS
              </span>

              <button
                type="button"
                className={styles.assemblyToggle}
                aria-pressed={isExploded}
                onClick={() =>
                  setViewMode((prev) =>
                    prev === 'exploded' ? 'assembled' : 'exploded',
                  )
                }
              >
                <span
                  className={styles.assemblyToggleOption}
                  data-active={isExploded}
                >
                  Exploded view
                </span>{' '}
                <span
                  className={styles.assemblyToggleOption}
                  data-active={!isExploded}
                >
                  Assembled stack
                </span>
              </button>
            </div>

            <div className={styles.stageFrame}>
              <div className={styles.stageHeaderOverlay}>
                <span className={styles.stageReadoutTag}>
                  ACTIVE: {activeSpec.tierLabel} — {activeSpec.title}
                </span>
                <span className={styles.stageReadoutHint}>
                  Click any tier to elevate
                </span>
              </div>

              <svg
                className={styles.diagram}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                aria-label="AstraFlow three-layer isometric architecture stack. Use the adjacent layer buttons to inspect Input, Execution, and Inspection tiers."
              >
                {/* Layer Group 0: Rear Construction Guides & Base Datum (Rule 06: strictly behind opaque plates) */}
                <g aria-hidden="true">
                  <path
                    d={scene.datumOutline}
                    fill={WARM_FOREST_PALETTE.sand}
                    fillOpacity={0.55}
                    stroke={WARM_FOREST_PALETTE.border}
                    strokeWidth={1.1}
                    strokeDasharray="4 4"
                  />
                  <path
                    d={scene.centerAxisPath}
                    fill="none"
                    stroke={WARM_FOREST_PALETTE.border}
                    strokeWidth={1}
                    strokeDasharray="3 5"
                  />
                  {scene.cornerAxisPaths.map((axisPath, axisIdx) => (
                    <path
                      key={axisIdx}
                      d={axisPath}
                      fill="none"
                      stroke={WARM_FOREST_PALETTE.border}
                      strokeWidth={1.1}
                      strokeDasharray="4 4"
                    />
                  ))}
                </g>

                {/* Layer Group 1: Vertical Registration Conduits Spine + Per-Layer Signal Taps */}
                <g aria-hidden="true">
                  <path
                    d={`M ${r2(RAIL_SCREEN_X)} ${r2(RAIL_TOP_Y)} L ${r2(RAIL_SCREEN_X)} ${r2(RAIL_BOTTOM_Y)}`}
                    fill="none"
                    stroke={WARM_FOREST_PALETTE.border}
                    strokeWidth={1.4}
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={RAIL_SCREEN_X}
                    cy={RAIL_TOP_Y}
                    r={4}
                    fill={WARM_FOREST_PALETTE.paperRaised}
                    stroke={WARM_FOREST_PALETTE.signal}
                    strokeWidth={1.5}
                  />
                  <circle
                    cx={RAIL_SCREEN_X}
                    cy={RAIL_BOTTOM_Y}
                    r={3}
                    fill={WARM_FOREST_PALETTE.sand}
                    stroke={WARM_FOREST_PALETTE.border}
                    strokeWidth={1.25}
                  />
                  {LAYER_SPECS.map((spec, idx) => {
                    const anchor = branchRightAnchors[idx];
                    const tapPoints: Point2[] = [
                      [RAIL_SCREEN_X, RAIL_TOP_Y],
                      [RAIL_SCREEN_X, anchor[1]],
                      anchor,
                    ];
                    const isLayerActive = activeLayer === spec.index;
                    return (
                      <IsoSignalConduit
                        key={spec.index}
                        points={tapPoints}
                        cornerRadius={10}
                        active={isLayerActive}
                        progress={1}
                        paused={reducedMotion}
                        viewportActive={viewportActive}
                        surface="ivory"
                        baseColor={WARM_FOREST_PALETTE.border}
                        signalColor={WARM_FOREST_PALETTE.signal}
                        baseStrokeWidth={1.25}
                        activeStrokeWidth={2.25}
                        pulseDurationMs={1900}
                        pulseRadius={3.4}
                        showTerminals
                      />
                    );
                  })}
                </g>

                {/* Layer Group 2: Opaque Hairline Plates in Strict Painter's Order (Bottom 2 -> Middle 1 -> Top 0) */}
                {([2, 1, 0] as const).map((idx) => {
                  const spec = LAYER_SPECS[idx];
                  const geometry = scene.geometries[idx];
                  const isSelected = activeLayer === idx;
                  const isHovered = hoveredLayer === idx;
                  const liftPx = currentLifts[idx];
                  const modeShiftY = currentModeShifts[idx];
                  const mark = scene.layerSurfaceMarks[idx];
                  const delayMs = staggerDelayMs(idx, activeLayer, 50, 160);

                  const leftAnchor = scene.leftAnchors[idx];
                  const calloutY = leftAnchor[1] + modeShiftY - liftPx;
                  const markStroke =
                    spec.variant === 'forest'
                      ? isSelected
                        ? WARM_FOREST_PALETTE.peach
                        : WARM_FOREST_PALETTE.inkSecondary
                      : spec.variant === 'terracotta'
                        ? isSelected
                          ? WARM_FOREST_PALETTE.action
                          : WARM_FOREST_PALETTE.action
                        : isSelected
                          ? WARM_FOREST_PALETTE.signal
                          : WARM_FOREST_PALETTE.border;
                  const markNodeFill =
                    spec.variant === 'forest'
                      ? isSelected
                        ? WARM_FOREST_PALETTE.signal
                        : WARM_FOREST_PALETTE.paperRaised
                      : isSelected
                        ? WARM_FOREST_PALETTE.signal
                        : WARM_FOREST_PALETTE.ink;

                  return (
                    <g key={spec.index}>
                      {/* Left registration callout badge tracking current vertical position */}
                      <motion.g
                        initial={false}
                        animate={{ y: calloutY }}
                        transition={{
                          ...layerTransformTransition,
                          delay: reducedMotion ? 0 : delayMs / 1000,
                        }}
                        aria-hidden="true"
                      >
                        <line
                          x1={CALLOUT_EDGE_X + 128}
                          y1={0}
                          x2={r2(leftAnchor[0] - 8)}
                          y2={0}
                          stroke={
                            isSelected || isHovered
                              ? WARM_FOREST_PALETTE.signal
                              : WARM_FOREST_PALETTE.border
                          }
                          strokeWidth={isSelected ? 1.5 : 1}
                          strokeDasharray={isSelected ? undefined : '3 3'}
                        />
                        <circle
                          cx={r2(leftAnchor[0] - 8)}
                          cy={0}
                          r={isSelected ? 3.2 : 2.2}
                          fill={
                            isSelected
                              ? WARM_FOREST_PALETTE.signal
                              : WARM_FOREST_PALETTE.muted
                          }
                        />
                        <text
                          x={CALLOUT_EDGE_X}
                          y={-6}
                          fill={
                            isSelected
                              ? WARM_FOREST_PALETTE.action
                              : WARM_FOREST_PALETTE.inkSecondary
                          }
                          fontFamily="var(--font-mono, ui-monospace, monospace)"
                          fontSize="11.5"
                          fontWeight={isSelected ? 700 : 500}
                          letterSpacing="1.3"
                        >
                          {spec.tierLabel}
                        </text>
                        <text
                          x={CALLOUT_EDGE_X}
                          y={13}
                          fill={
                            isSelected
                              ? WARM_FOREST_PALETTE.ink
                              : WARM_FOREST_PALETTE.inkSecondary
                          }
                          fontFamily="var(--font-serif, Georgia, serif)"
                          fontSize="15"
                        >
                          {spec.title}
                        </text>
                      </motion.g>

                      {/* Plate solid shifted cleanly by assembly mode */}
                      <motion.g
                        initial={false}
                        animate={{ y: modeShiftY }}
                        transition={layerTransformTransition}
                      >
                        <IsoPrism
                          geometry={geometry}
                          variant={spec.variant}
                          active={isHovered}
                          selected={isSelected}
                          liftPx={liftPx}
                          delayMs={delayMs}
                          transitionMs={660}
                          showDropGuides={liftPx > 1}
                          interactive
                          role="button"
                          tabIndex={-1}
                          label={`${spec.tierLabel}: ${spec.title}`}
                          ariaPressed={isSelected}
                          ariaControls={detailPanelId}
                          strokeWidth={1.3}
                          activeStrokeWidth={2.25}
                          creaseStrokeWidth={1}
                          onSelect={() => setActiveLayer(idx)}
                          onHoverChange={(hovered) =>
                            setHoveredLayer(hovered ? idx : null)
                          }
                        >
                          <path
                            d={mark.trace}
                            fill="none"
                            stroke={markStroke}
                            strokeWidth={1.1}
                            strokeOpacity={isSelected ? 0.92 : 0.65}
                          />
                          {mark.nodes.map((node, nodeIdx) => (
                            <circle
                              key={nodeIdx}
                              cx={node[0]}
                              cy={node[1]}
                              r={isSelected ? 3 : 2.3}
                              fill={markNodeFill}
                              fillOpacity={isSelected ? 0.95 : 0.65}
                            />
                          ))}
                        </IsoPrism>
                      </motion.g>
                    </g>
                  );
                })}
              </svg>

              <div className={styles.diagramFooter}>
                <ul className={styles.legendList} aria-label="Surface color key">
                  <li className={styles.legendItem}>
                    <span
                      className={`${styles.legendSwatch} ${styles.legendSwatchIvory}`}
                      aria-hidden="true"
                    />
                    Input contracts
                  </li>
                  <li className={styles.legendItem}>
                    <span
                      className={`${styles.legendSwatch} ${styles.legendSwatchForest}`}
                      aria-hidden="true"
                    />
                    Execution core
                  </li>
                  <li className={styles.legendItem}>
                    <span
                      className={`${styles.legendSwatch} ${styles.legendSwatchPeach}`}
                      aria-hidden="true"
                    />
                    Verification base
                  </li>
                  <li className={styles.legendItem}>
                    <span
                      className={`${styles.legendSwatch} ${styles.legendSwatchSignal}`}
                      aria-hidden="true"
                    />
                    Active conduit
                  </li>
                </ul>
                <span className={styles.axisNote}>
                  {isExploded ? 'Exploded z-axis spacing' : 'Collapsed stack alignment'}
                </span>
              </div>
            </div>
          </div>

          {/* External Accessible Controls & Inspector Panel */}
          <div className={styles.inspectorColumn}>
            <div>
              <div className={styles.controlsHeader}>
                <h3 className={styles.controlsTitle}>Select Architectural Tier</h3>
                <span className={styles.controlsHint}>
                  Up / Down arrows or click
                </span>
              </div>

              <div className={styles.layerButtons} role="group" aria-label="Architecture layers">
                {LAYER_SPECS.map((spec) => {
                  const isPressed = activeLayer === spec.index;
                  return (
                    <button
                      key={spec.index}
                      ref={(el) => {
                        layerButtonRefs.current[spec.index] = el;
                      }}
                      type="button"
                      className={styles.layerButton}
                      aria-pressed={isPressed}
                      aria-controls={detailPanelId}
                      onClick={() => setActiveLayer(spec.index)}
                      onMouseEnter={() => setHoveredLayer(spec.index)}
                      onMouseLeave={() => setHoveredLayer(null)}
                      onKeyDown={(e) => handleLayerButtonKeyDown(e, spec.index)}
                    >
                      <span className={styles.layerTierBadge}>{spec.tierLabel}</span>
                      <span className={styles.layerButtonBody}>
                        <span className={styles.layerButtonName}>{spec.title}</span>
                        <span className={styles.layerButtonSub}>{spec.subtitle}</span>
                      </span>
                      <span className={styles.layerChevron} aria-hidden="true">
                        {isPressed ? 'ACTIVE' : '->'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Tier Specification Readout */}
            <div
              id={detailPanelId}
              className={styles.detailPanel}
              aria-live="polite"
            >
              <div>
                <div className={styles.detailTop}>
                  <p className={styles.detailEyebrow}>
                    <span className={styles.eyebrowDot} aria-hidden="true" />
                    {activeSpec.tierLabel} · OWNING BOUNDARY
                  </p>
                  <span className={styles.detailStateBadge}>
                    {isExploded ? 'Exploded view' : 'Assembled stack'}
                  </span>
                </div>

                <h3 className={styles.detailHeading}>{activeSpec.title}</h3>
                <p className={styles.detailDescription}>
                  {activeSpec.description}
                </p>
              </div>

              <div>
                <h4 className={styles.detailSubheading}>
                  Owning NuGet Packages ({activeSpec.packages.length})
                </h4>
                <div className={styles.packagesGrid}>
                  {activeSpec.packages.map((pkg) => (
                    <Link
                      key={pkg.id}
                      href={pkg.href}
                      className={styles.packageLink}
                    >
                      <span className={styles.packageMeta}>
                        <span className={styles.packageName}>{pkg.name}</span>
                        <span className={styles.packageRole}>{pkg.role}</span>
                      </span>
                      <span className={styles.packageVersionGroup}>
                        <span className={styles.packageVersion}>
                          v{pkg.version}
                        </span>
                        <span className={styles.packageArrow} aria-hidden="true">
                          -&gt;
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={styles.detailSubheading}>Key Type Contracts</h4>
                <ul className={styles.contractsList}>
                  {activeSpec.contracts.map((contract) => (
                    <li key={contract} className={styles.contractChip}>
                      <span className={styles.contractDot} aria-hidden="true" />
                      <code>{contract}</code>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.detailFooter}>
                <Link href={activeSpec.docsHref} className={styles.detailDocLink}>
                  {activeSpec.docsLabel} -&gt;
                </Link>
                <Link href="/packages#directory" className={styles.detailDocLink}>
                  All packages (2.3.0) -&gt;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
