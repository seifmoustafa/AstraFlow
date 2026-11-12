'use client';

import Link from 'next/link';
import {
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
  projectCamera,
  r2,
  staggerDelayMs,
  useReducedMotionSafe,
  useViewportActivity,
  WARM_FOREST_PALETTE,
  type IsoPrismVariant,
  type Point3,
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
  plateSub: string;
  name: string;
  packageIds: readonly string[];
  stagePackageIds: readonly string[];
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
  centerXY: readonly [number, number];
  conduitWorldPoints: readonly Point3[];
  variant: IsoPrismVariant;
}

const LOOM_MODULES: readonly LoomModuleSpec[] = [
  {
    id: 'contracts',
    index: '01',
    shortLabel: 'Contracts',
    plateTitle: 'CONTRACTS',
    plateSub: 'CORE CHASSIS · 2.3.0',
    name: 'AstraFlow.Contracts Chassis',
    packageIds: ['AstraFlow.Contracts'],
    stagePackageIds: ['AstraFlow.Contracts'],
    fallbackTfms: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
    summary:
      'Framework-neutral request, notification, stream, and pipeline abstractions with zero mediator runtime coupling.',
    docHref: '/docs/package-selection#astraflowcontracts',
    docLabel: 'Contracts boundary docs',
    bounds: {
      x0: -98,
      y0: -98,
      x1: 98,
      y1: 98,
      z0: 0,
      z1: 10,
      radius: 12,
      creaseInset: 6,
    },
    centerXY: [0, 0],
    conduitWorldPoints: [
      [-64, 0, 10],
      [0, 0, 10],
      [64, 0, 10],
    ],
    variant: 'sand',
  },
  {
    id: 'tooling',
    index: '06',
    shortLabel: 'Generators & CLI',
    plateTitle: 'GEN + CLI',
    plateSub: 'PRIVATEASSETS · TOOL',
    name: 'Generators, Analyzers & CLI',
    packageIds: ['AstraFlow.Generators', 'AstraFlow.Analyzers', 'AstraFlow.Cli'],
    stagePackageIds: ['AstraFlow.Generators', 'AstraFlow.Analyzers', 'AstraFlow.Cli'],
    fallbackTfms: 'netstandard2.0 (analyzers/dotnet/cs) · net10.0 (.NET tool)',
    summary:
      'Compile-time Roslyn diagnostics and opt-in [AstraGenerateMapping] source generators (PrivateAssets="all") plus the global `astraflow` CLI tool.',
    docHref: '/docs/generators',
    docLabel: 'Generators & CLI docs',
    bounds: {
      x0: -96,
      y0: -96,
      x1: -30,
      y1: -30,
      z0: 86,
      z1: 94,
      radius: 7,
      creaseInset: 3,
    },
    centerXY: [-63, -63],
    conduitWorldPoints: [
      [-63, -63, 86],
      [-63, -63, 10],
      [-63, 0, 10],
      [0, 0, 10],
    ],
    variant: 'ivory',
  },
  {
    id: 'testing',
    index: '05',
    shortLabel: 'Testing',
    plateTitle: 'TESTING',
    plateSub: 'HARNESS · 2.3.0 / 2.4*',
    name: 'Testing Harnesses & Assertions',
    packageIds: ['AstraFlow.Testing', 'AstraFlow.Assertions'],
    stagePackageIds: ['AstraFlow.Testing'],
    fallbackTfms: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
    summary:
      'Runner-neutral FakeMediator and harnesses (2.3.0 published). AstraFlow.Assertions fluent Should() primitives live in 2.4.0 unreleased source only.',
    docHref: '/docs/testing',
    docLabel: 'Testing guide',
    bounds: {
      x0: -104,
      y0: -8,
      x1: -40,
      y1: 56,
      z0: 48,
      z1: 56,
      radius: 7,
      creaseInset: 3,
    },
    centerXY: [-72, 24],
    conduitWorldPoints: [
      [-72, 24, 48],
      [-72, 24, 10],
      [-72, 0, 10],
      [0, 0, 10],
    ],
    variant: 'ivory',
  },
  {
    id: 'diagnostics',
    index: '04',
    shortLabel: 'Diagnostics',
    plateTitle: 'DIAGNOSTICS',
    plateSub: 'AFD* · SECURITY',
    name: 'Diagnostics, Security & Telemetry',
    packageIds: ['AstraFlow.Diagnostics', 'AstraFlow.Security', 'AstraFlow.OpenTelemetry'],
    stagePackageIds: ['AstraFlow.Diagnostics', 'AstraFlow.Security'],
    fallbackTfms: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
    summary:
      'Deterministic registration snapshots, AFD* findings, shared sensitive-name redaction rules, and payload-free OpenTelemetry spans.',
    docHref: '/docs/diagnostics',
    docLabel: 'Diagnostics & security',
    bounds: {
      x0: -8,
      y0: -104,
      x1: 56,
      y1: -40,
      z0: 48,
      z1: 56,
      radius: 7,
      creaseInset: 3,
    },
    centerXY: [24, -72],
    conduitWorldPoints: [
      [24, -72, 48],
      [24, -72, 10],
      [0, -72, 10],
      [0, 0, 10],
    ],
    variant: 'ivory',
  },
  {
    id: 'mediator',
    index: '02',
    shortLabel: 'Mediator',
    plateTitle: 'MEDIATOR',
    plateSub: 'DISPATCH · 2.3.0',
    name: 'Mediator & Request Pipelines',
    packageIds: ['AstraFlow.Mediator', 'AstraFlow.AspNetCore', 'AstraFlow.FluentValidation'],
    stagePackageIds: ['AstraFlow.Mediator'],
    fallbackTfms: 'netstandard2.0 · net8.0 · net9.0 · net10.0 (AspNetCore: net10.0)',
    summary:
      'Explicit single-handler dispatch, async streams, sequential/parallel notifications, pre/post processors, and pipeline behaviors.',
    docHref: '/docs/mediator',
    docLabel: 'Mediator guide',
    bounds: {
      x0: -42,
      y0: -42,
      x1: 42,
      y1: 42,
      z0: 74,
      z1: 84,
      radius: 8,
      creaseInset: 3.6,
    },
    centerXY: [0, 0],
    conduitWorldPoints: [
      [0, 0, 74],
      [0, 0, 10],
    ],
    variant: 'forest',
  },
  {
    id: 'mapper',
    index: '03',
    shortLabel: 'Mapper',
    plateTitle: 'MAPPER',
    plateSub: 'PROJECTIONS · 2.3.0',
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
      x0: 24,
      y0: 24,
      x1: 92,
      y1: 92,
      z0: 36,
      z1: 44,
      radius: 7,
      creaseInset: 3,
    },
    centerXY: [58, 58],
    conduitWorldPoints: [
      [58, 58, 36],
      [58, 58, 10],
      [58, 0, 10],
      [0, 0, 10],
    ],
    variant: 'ivory',
  },
] as const;

// Display tabs in crisp 01..06 architectural sequence
const TAB_ORDER: readonly LoomModuleId[] = [
  'contracts',
  'mediator',
  'mapper',
  'diagnostics',
  'testing',
  'tooling',
];

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
  const [userPaused, setUserPaused] = useState(false);

  const activeModuleId = controlledModuleId ?? uncontrolledId;
  const inspectedModuleId = hoveredId ?? activeModuleId;

  const reducedMotion = useReducedMotionSafe();
  const { isActive: viewportActive } = useViewportActivity(stageRef, {
    paused: userPaused || reducedMotion,
    initialInView: true,
  });

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
      [-108, -108, 0],
      [102, 102, 0],
      [-108, 60, 108],
      [60, -108, 108],
    ];
    fitCamera(cam, extremePoints, 300, 224);

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

      const guideStart = project(mod.centerXY[0], mod.centerXY[1], 10);
      const guideEnd = project(mod.centerXY[0], mod.centerXY[1], mod.bounds.z0);

      return {
        spec: mod,
        geom,
        guideStart,
        guideEnd,
      };
    });

    const chassisCenter = project(0, 0, 10);
    const leftFiducial = project(-114, 18, 12);
    const rightFiducial = project(18, -114, 12);

    return {
      cam,
      project,
      plates,
      chassisCenter,
      leftFiducial,
      rightFiducial,
    };
  }, []);

  const selectModule = (id: LoomModuleId) => {
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
    selectModule(nextId);
    tabRefs.current[nextId]?.focus();
  };

  const handleStageInComposer = () => {
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

  const hasUnreleasedInModule =
    activeModule.id === 'testing' ||
    activePackages.some((pkg) => !pkg.isPublished);

  const releaseStatusLabel = useMemo(() => {
    if (activeModule.id === 'tooling') {
      return 'Published · 2.3.0 (PrivateAssets + .NET Tool)';
    }
    if (activeModule.id === 'testing') {
      return 'Testing 2.3.0 Published · Assertions 2.4.0 Unreleased Source';
    }
    const publishedVersion =
      activePackages.find((pkg) => pkg.isPublished)?.publishedVersion ?? '2.3.0';
    return `Published · ${publishedVersion} NuGet`;
  }, [activeModule.id, activePackages]);

  const panelId = `${baseId}-inspector`;

  return (
    <div
      ref={stageRef}
      className={styles.loomShell}
      aria-label="AstraFlow interactive isometric module loom"
    >
      <div className={styles.loomHeader}>
        <p className={styles.loomTitle}>
          <span className={styles.loomDot} aria-hidden="true" />
          ISOMETRIC MODULE LOOM · CONTRACTS CHASSIS
        </p>
        <button
          type="button"
          className={styles.motionBtn}
          aria-pressed={userPaused}
          disabled={reducedMotion}
          title={
            reducedMotion
              ? 'Signal motion paused by system reduced-motion setting'
              : undefined
          }
          onClick={() => setUserPaused((prev) => !prev)}
        >
          {userPaused ? 'Resume signal ▶' : 'Pause signal Ⅱ'}
        </button>
      </div>

      <div className={styles.stageFrame}>
        <svg
          className={styles.loomSvg}
          viewBox="0 0 600 410"
          role="group"
          aria-label="Interactive isometric capability modules docked onto the AstraFlow.Contracts chassis"
        >
          <g
            fill="none"
            stroke={WARM_FOREST_PALETTE.border}
            strokeWidth={0.9}
            opacity={0.7}
            aria-hidden="true"
          >
            <circle
              cx={r2(sceneGeometry.chassisCenter[0])}
              cy={r2(sceneGeometry.chassisCenter[1] - 42)}
              r={194}
              strokeDasharray="3 8"
            />
            <circle
              cx={r2(sceneGeometry.chassisCenter[0])}
              cy={r2(sceneGeometry.chassisCenter[1] - 42)}
              r={138}
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
                label={`${chassis.spec.name} (${chassis.spec.plateSub})`}
                ariaPressed={isSelected}
                onSelect={() => selectModule('contracts')}
                onHoverChange={(hover) =>
                  setHoveredId(hover ? 'contracts' : null)
                }
                onFocusChange={(focused) =>
                  setHoveredId(focused ? 'contracts' : null)
                }
              >
                <text
                  x={r2(chassis.geom.topCenter[0])}
                  y={r2(chassis.geom.topCenter[1] + 54)}
                  textAnchor="middle"
                  className={styles.plateTitle}
                  fill={WARM_FOREST_PALETTE.ink}
                  aria-hidden="true"
                >
                  ASTRAFLOW.CONTRACTS CHASSIS
                </text>
              </IsoPrism>
            );
          })()}

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
                  paused={userPaused || !viewportActive || !isDirectSelection}
                  showTerminals
                  pulseRadius={2.3}
                  baseStrokeWidth={1}
                  activeStrokeWidth={isDirectSelection ? 1.85 : 1.25}
                />
              </g>
            );
          })}

          {/* Upper 5 dockable capability modules in back-to-front painter's order */}
          {sceneGeometry.plates.slice(1).map((entry, idx) => {
            const spec = entry.spec;
            const isSelected = activeModule.id === spec.id;
            const isHovered = hoveredId === spec.id;
            const isTesting = spec.id === 'testing';
            const modTabIndex = TAB_ORDER.indexOf(spec.id);

            const liftPx = isSelected ? 12 : isHovered ? 6 : 0;
            const variant: IsoPrismVariant = isSelected
              ? 'terracotta'
              : spec.id === 'mediator'
                ? 'forest'
                : 'ivory';

            const labelFill =
              variant === 'forest'
                ? WARM_FOREST_PALETTE.paperRaised
                : WARM_FOREST_PALETTE.ink;
            const subFill =
              variant === 'forest'
                ? WARM_FOREST_PALETTE.peach
                : isTesting && isSelected
                  ? WARM_FOREST_PALETTE.action
                  : WARM_FOREST_PALETTE.inkSecondary;

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
                label={`${spec.plateTitle} ${spec.plateSub} — Inspect ${spec.name}`}
                ariaPressed={isSelected}
                onSelect={() => selectModule(spec.id)}
                onHoverChange={(hover) => setHoveredId(hover ? spec.id : null)}
                onFocusChange={(focused) =>
                  setHoveredId(focused ? spec.id : null)
                }
                dataTestId={`loom-plate-${spec.id}`}
              >
                <text
                  x={r2(entry.geom.topCenter[0])}
                  y={r2(entry.geom.topCenter[1] - 2)}
                  textAnchor="middle"
                  className={styles.plateTitle}
                  fill={labelFill}
                  aria-hidden="true"
                >
                  {spec.plateTitle}
                </text>{' '}
                <text
                  x={r2(entry.geom.topCenter[0])}
                  y={r2(entry.geom.topCenter[1] + 10)}
                  textAnchor="middle"
                  className={styles.plateSub}
                  fill={subFill}
                  aria-hidden="true"
                >
                  {spec.plateSub}
                </text>
                {idx === 3 ? (
                  <circle
                    cx={r2(entry.geom.topCenter[0] + 34)}
                    cy={r2(entry.geom.topCenter[1] - 12)}
                    r={2.5}
                    fill={WARM_FOREST_PALETTE.signal}
                  />
                ) : null}
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
              onClick={() => selectModule(mod.id)}
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
          <span
            className={`${styles.statusBadge} ${
              hasUnreleasedInModule ? styles.statusBadgeWarn : ''
            }`}
          >
            {releaseStatusLabel}
          </span>
        </div>

        <p className={styles.inspectorSummary}>{activeModule.summary}</p>

        <div className={styles.metaRow}>
          <span>TFM: {activeTfmSummary}</span>
        </div>

        <div className={styles.pkgChips} aria-label="Owning packages">
          {activeModule.packageIds.map((pkgId) => {
            const pkg = packageById.get(pkgId);
            const suffix =
              pkg && !pkg.isPublished
                ? ' · 2.4.0 UNRELEASED SOURCE'
                : pkg?.requiresPrivateAssets
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

        {activeModule.id === 'testing' ? (
          <p className={styles.unreleasedNotice}>
            Note: <code>AstraFlow.Testing</code> is published on NuGet (2.3.0).{' '}
            <code>AstraFlow.Assertions</code> is 2.4.0 unreleased source only — NOT published on NuGet yet.
          </p>
        ) : null}

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
