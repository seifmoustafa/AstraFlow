'use client';

import Link from 'next/link';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type { AstraFlowPackage } from '@/lib/packages';
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
  type IsoPrismVariant,
  type Point2,
  type Point3,
  type Projector,
} from '@/components/hairline';
import { dispatchStageStackEvent } from './stack-resolver';
import styles from './PackagesModuleLoom.module.css';

export type LoomModuleId =
  | 'contracts'
  | 'mediator'
  | 'mapper'
  | 'diagnostics'
  | 'testing'
  | 'tooling';

interface LoomModuleSpec {
  id: LoomModuleId;
  index: string;
  shortLabel: string;
  plateTitle: string;
  name: string;
  packageIds: string[];
  stagePackageIds: string[];
  fallbackTfms: string;
  summary: string;
  docHref: string;
  docLabel: string;
  bounds: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    z0: number;
    z1: number;
    radius: number;
    creaseInset: number;
  };
  capInset: number;
  capHeight: number;
  centerXY: [number, number];
  conduitWorldPoints: Point3[];
  variant: IsoPrismVariant;
}

const SVG_WIDTH = 640;
const SVG_HEIGHT = 452;

// Painter's order: chassis -> back-most (tooling) -> flanks (testing, diagnostics) -> mediator -> front (mapper)
const LOOM_MODULES: readonly LoomModuleSpec[] = [
  {
    id: 'contracts',
    index: '01',
    shortLabel: 'Contracts',
    plateTitle: 'CONTRACTS',
    name: 'AstraFlow.Contracts Chassis',
    packageIds: ['AstraFlow.Contracts'],
    stagePackageIds: ['AstraFlow.Contracts'],
    fallbackTfms: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
    summary:
      'Framework-neutral request, notification, stream, and pipeline abstractions with zero mediator runtime coupling.',
    docHref: '/docs/package-selection#astraflowcontracts',
    docLabel: 'Contracts boundary docs',
    bounds: {
      x0: -118,
      y0: -118,
      x1: 118,
      y1: 118,
      z0: 0,
      z1: 10,
      radius: 14,
      creaseInset: 7,
    },
    capInset: 0,
    capHeight: 0,
    centerXY: [0, 0],
    conduitWorldPoints: [
      [-76, 0, 10],
      [0, 0, 10],
      [76, 0, 10],
    ],
    variant: 'sand',
  },
  {
    id: 'tooling',
    index: '06',
    shortLabel: 'Generators & CLI',
    plateTitle: 'GEN + CLI',
    name: 'Generators, Analyzers & CLI',
    packageIds: ['AstraFlow.Generators', 'AstraFlow.Analyzers', 'AstraFlow.Cli'],
    stagePackageIds: ['AstraFlow.Generators', 'AstraFlow.Analyzers', 'AstraFlow.Cli'],
    fallbackTfms: 'netstandard2.0 (analyzers/dotnet/cs) · net10.0 (.NET tool)',
    summary:
      'Compile-time Roslyn diagnostics and opt-in [AstraGenerateMapping] source generators (PrivateAssets="all") plus the global `astraflow` CLI tool.',
    docHref: '/docs/generated-dispatch',
    docLabel: 'Generators & CLI docs',
    bounds: {
      x0: -112,
      y0: -112,
      x1: -44,
      y1: -44,
      z0: 102,
      z1: 111,
      radius: 8,
      creaseInset: 3,
    },
    capInset: 10,
    capHeight: 5.5,
    centerXY: [-78, -78],
    conduitWorldPoints: [
      [-78, -78, 102],
      [-78, -78, 10],
      [-78, 0, 10],
      [0, 0, 10],
    ],
    variant: 'ivory',
  },
  {
    id: 'testing',
    index: '05',
    shortLabel: 'Testing',
    plateTitle: 'TESTING',
    name: 'Testing Harnesses & Assertions',
    packageIds: ['AstraFlow.Testing', 'AstraFlow.Assertions'],
    stagePackageIds: ['AstraFlow.Testing', 'AstraFlow.Assertions'],
    fallbackTfms: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
    summary:
      'Runner-neutral FakeMediator, pipeline harnesses, and standalone fluent .Should() assertions.',
    docHref: '/docs/testing',
    docLabel: 'Testing guide',
    bounds: {
      x0: -140,
      y0: -4,
      x1: -76,
      y1: 60,
      z0: 66,
      z1: 75,
      radius: 8,
      creaseInset: 3,
    },
    capInset: 10,
    capHeight: 5.5,
    centerXY: [-108, 28],
    conduitWorldPoints: [
      [-108, 28, 66],
      [-108, 28, 10],
      [-108, 0, 10],
      [0, 0, 10],
    ],
    variant: 'ivory',
  },
  {
    id: 'diagnostics',
    index: '04',
    shortLabel: 'Diagnostics',
    plateTitle: 'DIAGNOSTICS',
    name: 'Diagnostics, Security & Telemetry',
    packageIds: ['AstraFlow.Diagnostics', 'AstraFlow.Security', 'AstraFlow.OpenTelemetry'],
    stagePackageIds: ['AstraFlow.Diagnostics', 'AstraFlow.Security'],
    fallbackTfms: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
    summary:
      'Deterministic registration snapshots, startup validation findings, shared sensitive-name redaction rules, and payload-free OpenTelemetry spans.',
    docHref: '/docs/diagnostics',
    docLabel: 'Diagnostics & security',
    bounds: {
      x0: -4,
      y0: -140,
      x1: 60,
      y1: -76,
      z0: 66,
      z1: 75,
      radius: 8,
      creaseInset: 3,
    },
    capInset: 10,
    capHeight: 5.5,
    centerXY: [28, -108],
    conduitWorldPoints: [
      [28, -108, 66],
      [28, -108, 10],
      [0, -108, 10],
      [0, 0, 10],
    ],
    variant: 'ivory',
  },
  {
    id: 'mediator',
    index: '02',
    shortLabel: 'Mediator',
    plateTitle: 'MEDIATOR',
    name: 'Mediator & Request Pipelines',
    packageIds: ['AstraFlow.Mediator', 'AstraFlow.AspNetCore', 'AstraFlow.FluentValidation'],
    stagePackageIds: ['AstraFlow.Mediator'],
    fallbackTfms: 'netstandard2.0 · net8.0 · net9.0 · net10.0 (AspNetCore: net10.0)',
    summary:
      'Explicit single-handler dispatch, async streams, sequential/parallel notifications, pre/post processors, and pipeline behaviors.',
    docHref: '/docs/mediator',
    docLabel: 'Mediator guide',
    bounds: {
      x0: -38,
      y0: -38,
      x1: 38,
      y1: 38,
      z0: 72,
      z1: 82,
      radius: 9,
      creaseInset: 3.6,
    },
    capInset: 11,
    capHeight: 6,
    centerXY: [0, 0],
    conduitWorldPoints: [
      [0, 0, 72],
      [0, 0, 10],
    ],
    variant: 'forest',
  },
  {
    id: 'mapper',
    index: '03',
    shortLabel: 'Mapper',
    plateTitle: 'MAPPER',
    name: 'Explicit Mapper & Projections',
    packageIds: [
      'AstraFlow.Mapper',
      'AstraFlow.Mapper.Conventions',
      'AstraFlow.Mapper.EntityFrameworkCore',
    ],
    stagePackageIds: ['AstraFlow.Mapper'],
    fallbackTfms: 'netstandard2.0 · net8.0 · net9.0 · net10.0 (EF Core: net10.0)',
    summary:
      'Declared IDeclaredObjectMappingRule pairs, named/parameterized IProjection expressions, opt-in conventions, and EF Core relational checks.',
    docHref: '/docs/mapper',
    docLabel: 'Mapper & projections',
    bounds: {
      x0: 44,
      y0: 44,
      x1: 110,
      y1: 110,
      z0: 42,
      z1: 51,
      radius: 8,
      creaseInset: 3.2,
    },
    capInset: 10,
    capHeight: 5.5,
    centerXY: [77, 77],
    conduitWorldPoints: [
      [77, 77, 42],
      [77, 77, 10],
      [77, 0, 10],
      [0, 0, 10],
    ],
    variant: 'ivory',
  },
] as const;

const TAB_ORDER: readonly LoomModuleId[] = [
  'contracts',
  'mediator',
  'mapper',
  'diagnostics',
  'testing',
  'tooling',
];

const AUTO_CYCLE_ORDER: readonly LoomModuleId[] = [
  'mediator',
  'mapper',
  'diagnostics',
  'testing',
  'tooling',
  'contracts',
];

function buildModuleEmblemPaths(
  id: LoomModuleId,
  project: Projector,
  cx: number,
  cy: number,
  zTop: number,
): string[] {
  switch (id) {
    case 'mediator':
      return [
        seg(project(cx - 8, cy - 4, zTop), project(cx + 8, cy - 4, zTop)),
        seg(project(cx - 5, cy, zTop), project(cx + 5, cy, zTop)),
        seg(project(cx - 8, cy + 4, zTop), project(cx + 8, cy + 4, zTop)),
      ];
    case 'mapper':
      return [
        seg(project(cx - 7, cy - 4, zTop), project(cx - 1, cy - 4, zTop)),
        seg(project(cx - 1, cy - 4, zTop), project(cx + 3, cy + 4, zTop)),
        seg(project(cx + 3, cy + 4, zTop), project(cx + 8, cy + 4, zTop)),
      ];
    case 'diagnostics':
      return [
        open([
          project(cx - 8, cy + 3, zTop),
          project(cx - 3, cy + 3, zTop),
          project(cx - 1, cy - 5, zTop),
          project(cx + 3, cy + 5, zTop),
          project(cx + 5, cy - 1, zTop),
          project(cx + 8, cy - 1, zTop),
        ]),
      ];
    case 'testing':
      return [
        open([
          project(cx - 6, cy + 1, zTop),
          project(cx - 1, cy + 6, zTop),
          project(cx + 7, cy - 5, zTop),
        ]),
      ];
    case 'tooling':
      return [
        open([
          project(cx, cy - 7, zTop),
          project(cx + 7, cy, zTop),
          project(cx, cy + 7, zTop),
          project(cx - 7, cy, zTop),
          project(cx, cy - 7, zTop),
        ]),
      ];
    default:
      return [];
  }
}

export interface PackagesModuleLoomProps {
  packages?: AstraFlowPackage[];
  selectedModuleId?: LoomModuleId;
  onSelectModule?: (moduleId: LoomModuleId) => void;
  onStageCapability?: (packageIds: string[], moduleId: LoomModuleId) => void;
  composerAnchorId?: string;
}

export function PackagesModuleLoom({
  packages = [],
  selectedModuleId: controlledModuleId,
  onSelectModule,
  onStageCapability,
  composerAnchorId = 'composer',
}: PackagesModuleLoomProps) {
  const baseId = useId();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Partial<Record<LoomModuleId, HTMLButtonElement | null>>>({});

  const [uncontrolledId, setUncontrolledId] = useState<LoomModuleId>('mediator');
  const [hoveredId, setHoveredId] = useState<LoomModuleId | null>(null);
  const [isShellHovered, setIsShellHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const activeModuleId = controlledModuleId ?? uncontrolledId;
  const inspectedModuleId = hoveredId ?? activeModuleId;

  const reducedMotion = useReducedMotionSafe();
  const { isActive: viewportActive } = useViewportActivity(stageRef, {
    paused: reducedMotion,
    initialInView: true,
  });

  // Gentle autonomous capability cycle when idle; pauses on hover/focus/click
  useEffect(() => {
    if (
      reducedMotion ||
      !viewportActive ||
      hasInteracted ||
      isShellHovered ||
      hoveredId !== null
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      const currentIdx = AUTO_CYCLE_ORDER.indexOf(activeModuleId);
      const nextId =
        AUTO_CYCLE_ORDER[(currentIdx + 1 + AUTO_CYCLE_ORDER.length) % AUTO_CYCLE_ORDER.length];
      if (controlledModuleId === undefined) {
        setUncontrolledId(nextId);
      }
      onSelectModule?.(nextId);
    }, 3600);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    reducedMotion,
    viewportActive,
    hasInteracted,
    isShellHovered,
    hoveredId,
    activeModuleId,
    controlledModuleId,
    onSelectModule,
  ]);

  const packageById = useMemo(
    () => new Map(packages.map((pkg) => [pkg.id, pkg])),
    [packages],
  );

  const moduleById = useMemo(
    () => new Map(LOOM_MODULES.map((mod) => [mod.id, mod])),
    [],
  );

  const activeModule = moduleById.get(activeModuleId) ?? LOOM_MODULES[4];
  const activeTabIndex = TAB_ORDER.indexOf(activeModule.id);

  const sceneGeometry = useMemo(() => {
    const cam = createCamera(45, 0.5, 1.32);
    const extremePoints: Point3[] = [
      [-146, -146, 0],
      [130, 130, 0],
      [-146, 72, 140],
      [72, -146, 140],
    ];
    fitCamera(cam, extremePoints, SVG_WIDTH / 2, SVG_HEIGHT / 2 + 4);

    const project = projectCamera(cam);
    const front = createFacingPredicate(cam);

    const plates = LOOM_MODULES.map((mod) => {
      const geom = createIsoPlateGeometry({
        camera: cam,
        project,
        front,
        x0: mod.bounds.x0,
        y0: mod.bounds.y0,
        x1: mod.bounds.x1,
        y1: mod.bounds.y1,
        z0: mod.bounds.z0,
        z1: mod.bounds.z1,
        radius: mod.bounds.radius,
        creaseInset: mod.bounds.creaseInset,
        steps: 8,
      });

      const capGeom =
        mod.capHeight > 0
          ? createIsoPlateGeometry({
              camera: cam,
              project,
              front,
              x0: mod.bounds.x0 + mod.capInset,
              y0: mod.bounds.y0 + mod.capInset,
              x1: mod.bounds.x1 - mod.capInset,
              y1: mod.bounds.y1 - mod.capInset,
              z0: mod.bounds.z1,
              z1: mod.bounds.z1 + mod.capHeight,
              radius: Math.max(4, mod.bounds.radius - 3),
              creaseInset: 2,
              steps: 6,
            })
          : null;

      const guideStart = project(mod.centerXY[0], mod.centerXY[1], 10);
      const guideEnd = project(mod.centerXY[0], mod.centerXY[1], mod.bounds.z0);
      const emblemPaths = buildModuleEmblemPaths(
        mod.id,
        project,
        mod.centerXY[0],
        mod.centerXY[1],
        mod.bounds.z1 + mod.capHeight + 0.5,
      );

      // Anchor floating badge pill cleanly above/outside plate cap so no text clips edges
      const capAnchor = project(
        mod.centerXY[0],
        mod.centerXY[1],
        mod.bounds.z1 + mod.capHeight,
      );

      return {
        spec: mod,
        geom,
        capGeom,
        guideStart,
        guideEnd,
        emblemPaths,
        capAnchor,
      };
    });

    const chassisCenter = project(0, 0, 10);
    const chassisFrontCorner = project(118, 118, 4);
    const chassisRailY = Math.min(SVG_HEIGHT - 28, chassisFrontCorner[1] + 24);
    const leftFiducial = project(-134, 24, 10);
    const rightFiducial = project(24, -134, 10);

    // Subtle surface bus hairlines across the Contracts foundation plate
    const busCrossX: [Point2, Point2] = [project(-104, 0, 10.2), project(104, 0, 10.2)];
    const busCrossY: [Point2, Point2] = [project(0, -104, 10.2), project(0, 104, 10.2)];

    return {
      cam,
      project,
      plates,
      chassisCenter,
      chassisFrontCorner,
      chassisRailY,
      leftFiducial,
      rightFiducial,
      busCrossX,
      busCrossY,
    };
  }, []);

  const selectModule = (id: LoomModuleId, userInitiated = true) => {
    if (userInitiated) {
      setHasInteracted(true);
    }
    if (controlledModuleId === undefined) {
      setUncontrolledId(id);
    }
    onSelectModule?.(id);
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % TAB_ORDER.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = TAB_ORDER.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextId = TAB_ORDER[nextIndex];
    selectModule(nextId, true);
    tabRefs.current[nextId]?.focus();
  };

  const handleStageInComposer = () => {
    setHasInteracted(true);
    const stageIds = [...activeModule.stagePackageIds];
    onStageCapability?.(stageIds, activeModule.id);
    dispatchStageStackEvent({
      packageIds: stageIds,
      moduleId: activeModule.id,
      label: activeModule.name,
      mode: 'replace',
    });

    const target = document.getElementById(composerAnchorId);
    if (target) {
      target.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  const activePackages = useMemo(() => {
    return activeModule.packageIds
      .map((id) => packageById.get(id))
      .filter((pkg): pkg is AstraFlowPackage => Boolean(pkg));
  }, [activeModule, packageById]);

  const activeTfmSummary = useMemo(() => {
    if (activePackages.length === 0) {
      return activeModule.fallbackTfms;
    }
    const primary = activePackages[0];
    const hasNet10OnlySibling = activePackages.some(
      (pkg) => pkg.targetFrameworks.length === 1 && pkg.targetFrameworks[0] === 'net10.0',
    );
    const primaryTfms = primary.targetFrameworks.join(' · ');
    if (hasNet10OnlySibling && primary.targetFrameworks.length > 1) {
      return `${primaryTfms} (net10.0 for host/EF/CLI)`;
    }
    return primaryTfms;
  }, [activePackages, activeModule.fallbackTfms]);

  const releaseStatusLabel = useMemo(() => {
    if (activeModule.id === 'tooling') {
      return 'Published · 2.3.0 (PrivateAssets + .NET Tool)';
    }
    const publishedVersion =
      activePackages.find((pkg) => pkg.publishedVersion)?.publishedVersion ?? '2.3.0';
    return `Published · ${publishedVersion} NuGet`;
  }, [activeModule.id, activePackages]);

  const panelId = `${baseId}-inspector`;
  const isChassisSelected = activeModule.id === 'contracts';

  return (
    <div
      ref={stageRef}
      className={styles.loomShell}
      aria-label="AstraFlow interactive isometric module loom"
      onMouseEnter={() => setIsShellHovered(true)}
      onMouseLeave={() => setIsShellHovered(false)}
    >
      <div className={styles.loomHeader}>
        <p className={styles.loomTitle}>
          <span className={styles.loomDot} aria-hidden="true" />
          ISOMETRIC MODULE LOOM · CONTRACTS CHASSIS
        </p>
        <span className={styles.liveStatusPill}>
          <span className={styles.livePulseDot} aria-hidden="true" />
          6 CAPABILITY PLANES · LIVE
        </span>
      </div>

      <div className={styles.stageFrame}>
        <svg
          className={styles.loomSvg}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          role="group"
          aria-label="Interactive isometric capability modules docked onto the AstraFlow.Contracts chassis"
        >
          {/* Architectural drafting rings centered behind chassis */}
          <g
            fill="none"
            stroke={WARM_FOREST_PALETTE.border}
            strokeWidth={0.9}
            opacity={0.75}
            aria-hidden="true"
          >
            <circle
              cx={r2(sceneGeometry.chassisCenter[0])}
              cy={r2(sceneGeometry.chassisCenter[1] - 48)}
              r={208}
              strokeDasharray="3 8"
            />
            <circle
              cx={r2(sceneGeometry.chassisCenter[0])}
              cy={r2(sceneGeometry.chassisCenter[1] - 48)}
              r={148}
              opacity={0.55}
            />
          </g>

          {/* Left & right engineering fiducial crosshairs */}
          <g aria-hidden="true">
            {[sceneGeometry.leftFiducial, sceneGeometry.rightFiducial].map(
              (pt, idx) => (
                <g
                  key={idx}
                  transform={`translate(${r2(pt[0])} ${r2(pt[1])})`}
                >
                  <circle
                    r={11}
                    fill={WARM_FOREST_PALETTE.paperRaised}
                    stroke={WARM_FOREST_PALETTE.border}
                    strokeWidth={1}
                  />
                  <path
                    d="M-4 0 H4 M0 -4 V4"
                    stroke={WARM_FOREST_PALETTE.signal}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                </g>
              ),
            )}
          </g>

          {/* Base chassis plate: AstraFlow.Contracts */}
          {(() => {
            const chassis = sceneGeometry.plates[0];
            const isSelected = activeModule.id === 'contracts';
            const isHovered = hoveredId === 'contracts';
            const isEnergized = isSelected || isHovered;
            return (
              <IsoPrism
                key={chassis.spec.id}
                geometry={chassis.geom}
                variant={isSelected ? 'terracotta' : 'sand'}
                active={isHovered}
                selected={isSelected}
                liftPx={isSelected ? 5 : isHovered ? 3 : 0}
                showDropGuides={isEnergized}
                label={`${chassis.spec.plateTitle} — ${chassis.spec.name}`}
                ariaPressed={isSelected}
                onSelect={() => selectModule('contracts', true)}
                onHoverChange={(hover) =>
                  setHoveredId(hover ? 'contracts' : null)
                }
                onFocusChange={(focused) =>
                  setHoveredId(focused ? 'contracts' : null)
                }
                dataTestId="loom-plate-contracts"
              >
                <line
                  x1={r2(sceneGeometry.busCrossX[0][0])}
                  y1={r2(sceneGeometry.busCrossX[0][1])}
                  x2={r2(sceneGeometry.busCrossX[1][0])}
                  y2={r2(sceneGeometry.busCrossX[1][1])}
                  stroke={WARM_FOREST_PALETTE.border}
                  strokeWidth={0.9}
                  strokeDasharray="3 4"
                  pointerEvents="none"
                />
                <line
                  x1={r2(sceneGeometry.busCrossY[0][0])}
                  y1={r2(sceneGeometry.busCrossY[0][1])}
                  x2={r2(sceneGeometry.busCrossY[1][0])}
                  y2={r2(sceneGeometry.busCrossY[1][1])}
                  stroke={WARM_FOREST_PALETTE.border}
                  strokeWidth={0.9}
                  strokeDasharray="3 4"
                  pointerEvents="none"
                />
              </IsoPrism>
            );
          })()}

          {/* Front-bottom architectural drafting rail callout for AstraFlow.Contracts (zero occlusion with MAPPER) */}
          <g aria-hidden="true">
            <line
              x1={r2(sceneGeometry.chassisFrontCorner[0])}
              y1={r2(sceneGeometry.chassisFrontCorner[1])}
              x2={r2(sceneGeometry.chassisFrontCorner[0])}
              y2={r2(sceneGeometry.chassisRailY - 12)}
              stroke={
                isChassisSelected
                  ? WARM_FOREST_PALETTE.signal
                  : WARM_FOREST_PALETTE.muted
              }
              strokeWidth={1.15}
              strokeDasharray="2 3"
            />
            <circle
              cx={r2(sceneGeometry.chassisFrontCorner[0])}
              cy={r2(sceneGeometry.chassisFrontCorner[1])}
              r={2.5}
              fill={
                isChassisSelected
                  ? WARM_FOREST_PALETTE.signal
                  : WARM_FOREST_PALETTE.inkSecondary
              }
            />
            <rect
              x={r2(SVG_WIDTH / 2 - 146)}
              y={r2(sceneGeometry.chassisRailY - 12)}
              width={292}
              height={22}
              rx={11}
              fill={
                isChassisSelected
                  ? WARM_FOREST_PALETTE.forest
                  : WARM_FOREST_PALETTE.paperRaised
              }
              stroke={
                isChassisSelected
                  ? WARM_FOREST_PALETTE.signal
                  : WARM_FOREST_PALETTE.border
              }
              strokeWidth={1.1}
            />
            <text
              x={r2(SVG_WIDTH / 2)}
              y={r2(sceneGeometry.chassisRailY + 2)}
              textAnchor="middle"
              className={styles.chassisRailLabel}
              fill={
                isChassisSelected
                  ? WARM_FOREST_PALETTE.peach
                  : WARM_FOREST_PALETTE.ink
              }
            >
              ASTRAFLOW.CONTRACTS · SHARED FOUNDATION
            </text>
          </g>

          {/* Vertical guide rails + surface registration conduits connecting modules to Contracts */}
          {sceneGeometry.plates.slice(1).map((entry) => {
            const isModuleActive =
              inspectedModuleId === entry.spec.id ||
              inspectedModuleId === 'contracts';
            const isDirectSelection = activeModule.id === entry.spec.id;
            return (
              <g key={`conduit-${entry.spec.id}`}>
                <line
                  x1={r2(entry.guideStart[0])}
                  y1={r2(entry.guideStart[1])}
                  x2={r2(entry.guideEnd[0])}
                  y2={r2(entry.guideEnd[1])}
                  stroke={WARM_FOREST_PALETTE.border}
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  aria-hidden="true"
                />
                <IsoSignalConduit
                  worldPoints={entry.spec.conduitWorldPoints}
                  camera={sceneGeometry.cam}
                  project={sceneGeometry.project}
                  cornerRadius={4}
                  surface="ivory"
                  active={isModuleActive}
                  progress={isModuleActive ? 1 : 0}
                  paused={!viewportActive || !isDirectSelection}
                  showTerminals
                  pulseRadius={2.5}
                  baseStrokeWidth={1}
                  activeStrokeWidth={isDirectSelection ? 2 : 1.3}
                />
              </g>
            );
          })}

          {/* Upper 5 2-tier sculpted capability modules in back-to-front painter's order */}
          {sceneGeometry.plates.slice(1).map((entry) => {
            const spec = entry.spec;
            const isSelected = activeModule.id === spec.id;
            const isHovered = hoveredId === spec.id;
            const modTabIndex = TAB_ORDER.indexOf(spec.id);

            const liftPx = isSelected ? 12 : isHovered ? 6 : 0;
            const variant: IsoPrismVariant = isSelected
              ? 'terracotta'
              : spec.id === 'mediator'
                ? 'forest'
                : 'ivory';

            const capVariant: IsoPrismVariant = isSelected
              ? 'ivory'
              : spec.id === 'mediator'
                ? 'terracotta'
                : 'sand';

            const emblemStroke =
              capVariant === 'terracotta'
                ? WARM_FOREST_PALETTE.ink
                : WARM_FOREST_PALETTE.forest;

            const pillWidth = Math.max(76, spec.plateTitle.length * 7.6 + 18);
            const pillX = entry.capAnchor[0] - pillWidth / 2;
            const pillY = entry.capAnchor[1] - 33;

            return (
              <IsoPrism
                key={spec.id}
                geometry={entry.geom}
                variant={variant}
                active={isHovered}
                selected={isSelected}
                liftPx={liftPx}
                delayMs={staggerDelayMs(
                  modTabIndex,
                  Math.max(0, activeTabIndex),
                  40,
                )}
                showDropGuides={isSelected || isHovered}
                label={`${spec.plateTitle} — ${spec.name}`}
                ariaPressed={isSelected}
                onSelect={() => selectModule(spec.id, true)}
                onHoverChange={(hover) => setHoveredId(hover ? spec.id : null)}
                onFocusChange={(focused) =>
                  setHoveredId(focused ? spec.id : null)
                }
                dataTestId={`loom-plate-${spec.id}`}
              >
                {/* Sculpted upper 3D collar prism + architectural emblem */}
                {entry.capGeom ? (
                  <IsoPrism
                    geometry={entry.capGeom}
                    variant={capVariant}
                    interactive={false}
                    strokeWidth={0.95}
                    creaseStrokeWidth={0.7}
                  >
                    {entry.emblemPaths.map((d, idx) => (
                      <path
                        key={`emblem-${spec.id}-${idx}`}
                        d={d}
                        fill="none"
                        stroke={emblemStroke}
                        strokeWidth={1.35}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pointerEvents="none"
                      />
                    ))}
                  </IsoPrism>
                ) : null}

                {/* High-contrast crisp floating pill title (zero plateSub clutter) */}
                <g pointerEvents="none" aria-hidden="true">
                  <line
                    x1={r2(entry.capAnchor[0])}
                    y1={r2(entry.capAnchor[1] - 9)}
                    x2={r2(entry.capAnchor[0])}
                    y2={r2(pillY + 18)}
                    stroke={
                      isSelected
                        ? WARM_FOREST_PALETTE.signal
                        : WARM_FOREST_PALETTE.inkSecondary
                    }
                    strokeWidth={1}
                  />
                  <rect
                    x={r2(pillX)}
                    y={r2(pillY)}
                    width={r2(pillWidth)}
                    height={18}
                    rx={9}
                    fill={
                      isSelected
                        ? WARM_FOREST_PALETTE.forest
                        : WARM_FOREST_PALETTE.paperRaised
                    }
                    stroke={
                      isSelected
                        ? WARM_FOREST_PALETTE.signal
                        : WARM_FOREST_PALETTE.border
                    }
                    strokeWidth={1.1}
                  />
                  <text
                    x={r2(entry.capAnchor[0])}
                    y={r2(pillY + 12.2)}
                    textAnchor="middle"
                    className={styles.plateLabelPillText}
                    fill={
                      isSelected
                        ? WARM_FOREST_PALETTE.paperRaised
                        : WARM_FOREST_PALETTE.ink
                    }
                  >
                    {spec.plateTitle}
                  </text>
                </g>
              </IsoPrism>
            );
          })}
        </svg>
      </div>

      {/* Accessible tablist for keyboard parity with the SVG isometric loom */}
      <div
        role="tablist"
        aria-label="AstraFlow capability modules"
        className={styles.moduleStrip}
      >
        {TAB_ORDER.map((modId, idx) => {
          const mod = moduleById.get(modId)!;
          const isSelected = activeModule.id === mod.id;
          return (
            <button
              key={mod.id}
              ref={(el) => {
                tabRefs.current[mod.id] = el;
              }}
              id={`${baseId}-tab-${mod.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              className={styles.moduleBtn}
              onClick={() => selectModule(mod.id, true)}
              onMouseEnter={() => setHoveredId(mod.id)}
              onMouseLeave={() => setHoveredId(null)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
            >
              <span className={styles.moduleBtnIndex}>{mod.index}</span>
              <span className={styles.moduleBtnLabel}>{mod.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Live inspector readout connected directly to the Stack Composer */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeModule.id}`}
        aria-live="polite"
        className={styles.inspectorCard}
      >
        <div className={styles.inspectorTop}>
          <h2 className={styles.inspectorName}>{activeModule.name}</h2>
          <span className={styles.statusBadge}>{releaseStatusLabel}</span>
        </div>

        <p className={styles.inspectorSummary}>{activeModule.summary}</p>

        <div className={styles.metaRow}>
          <span>TFM: {activeTfmSummary}</span>
        </div>

        <div className={styles.pkgChips} aria-label="Owning packages">
          {activeModule.packageIds.map((pkgId) => {
            const pkg = packageById.get(pkgId);
            const suffix = pkg?.requiresPrivateAssets
              ? ' · PrivateAssets="all"'
              : pkg?.isTool
                ? ' · .NET Tool'
                : '';
            return (
              <span key={pkgId} className={styles.pkgChip}>
                {pkgId}
                {suffix}
              </span>
            );
          })}
        </div>

        <div className={styles.inspectorActions}>
          <button
            type="button"
            className={styles.stageButton}
            onClick={handleStageInComposer}
          >
            Stage in Stack Composer <span aria-hidden="true">↓</span>
          </button>
          <Link href={activeModule.docHref} className={styles.docLink}>
            {activeModule.docLabel} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
