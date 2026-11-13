'use client';

import Link from 'next/link';
import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type { AstraFlowPackage, ComposerPreset } from '@/lib/packages';
import { LATEST_PUBLISHED_VERSION } from '@/lib/site-config';
import {
  createCamera,
  createFacingPredicate,
  createIsoPlateGeometry,
  EASE_LIFT_CSS,
  EASE_LIFT_DURATION_MS,
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
import { PackagesDirectory } from './PackagesDirectory';
import {
  groupPackagesByLayer,
  PACKAGE_LAYER_GROUPS,
  resolvePackageStackClient,
  STAGE_STACK_EVENT,
  type ComposerLayerKey,
  type StageStackEventDetail,
} from './stack-resolver';
import styles from './PackagesStackComposer.module.css';

export type InstallOutputTab = 'cli' | 'xml' | 'tool' | 'combined';

export interface StagedStackPayload {
  packageIds: string[];
  moduleId?: string;
  label?: string;
  mode?: 'replace' | 'add';
  seq: number;
}

export interface PackagesStackComposerProps {
  packages: AstraFlowPackage[];
  presets: ComposerPreset[];
  initialSelectedIds?: string[];
  stagedRequest?: StagedStackPayload | null;
  showDirectory?: boolean;
}

const STACK_SVG_WIDTH = 470;
const STACK_SVG_HEIGHT = 450;

function formatStackLeaderLabel(pkgId: string): string {
  const short = pkgId
    .replace(/^AstraFlow\.?/, '')
    .replace('EntityFrameworkCore', 'EF Core');
  const base = short || 'AstraFlow';
  return base.toUpperCase();
}

export function PackagesStackComposer({
  packages,
  presets,
  initialSelectedIds = ['AstraFlow.Mediator'],
  stagedRequest = null,
  showDirectory = false,
}: PackagesStackComposerProps) {
  const baseId = useId();
  const stackStageRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Partial<Record<InstallOutputTab, HTMLButtonElement | null>>>({});

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [activeLayerFilter, setActiveLayerFilter] = useState<ComposerLayerKey | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<InstallOutputTab>('cli');
  const [focusedPkgId, setFocusedPkgId] = useState<string | null>(
    initialSelectedIds[0] ?? 'AstraFlow.Mediator',
  );
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);
  const [stagedBanner, setStagedBanner] = useState<string | null>(null);
  const [copiedTab, setCopiedTab] = useState<InstallOutputTab | null>(null);
  const [prevStagedSeq, setPrevStagedSeq] = useState<number | null>(null);

  const reducedMotion = useReducedMotionSafe();
  const { isActive: viewportActive } = useViewportActivity(stackStageRef, {
    paused: reducedMotion,
    initialInView: true,
  });

  const applyStagedDetail = (detail: StageStackEventDetail) => {
    if (!detail.packageIds || detail.packageIds.length === 0) return;

    if (detail.mode === 'add') {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of detail.packageIds) {
          next.add(id);
        }
        return Array.from(next);
      });
    } else {
      setSelectedIds([...detail.packageIds]);
    }

    setFocusedPkgId(detail.packageIds[0] ?? null);
    setActiveLayerFilter('all');
    setSearchQuery('');

    if (detail.packageIds.includes('AstraFlow.Cli') && detail.packageIds.length === 1) {
      setActiveTab('tool');
    } else {
      setActiveTab('cli');
    }

    setStagedBanner(
      detail.label
        ? `Staged ${detail.label}`
        : `Staged ${detail.packageIds.join(', ')}`,
    );
  };

  if (stagedRequest && stagedRequest.seq !== prevStagedSeq) {
    setPrevStagedSeq(stagedRequest.seq);
    applyStagedDetail({
      packageIds: stagedRequest.packageIds,
      moduleId: stagedRequest.moduleId,
      label: stagedRequest.label,
      mode: stagedRequest.mode,
    });
  }

  useEffect(() => {
    const onStageEvent = (event: Event) => {
      const custom = event as CustomEvent<StageStackEventDetail>;
      if (custom.detail) {
        applyStagedDetail(custom.detail);
      }
    };

    window.addEventListener(STAGE_STACK_EVENT, onStageEvent);
    return () => {
      window.removeEventListener(STAGE_STACK_EVENT, onStageEvent);
    };
  }, []);

  const packageById = useMemo(
    () => new Map(packages.map((pkg) => [pkg.id, pkg])),
    [packages],
  );

  const stack = useMemo(
    () => resolvePackageStackClient(selectedIds, packages),
    [selectedIds, packages],
  );

  const groupedLayers = useMemo(() => groupPackagesByLayer(packages), [packages]);

  const visibleGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return groupedLayers
      .filter((group) => activeLayerFilter === 'all' || group.key === activeLayerFilter)
      .map((group) => ({
        ...group,
        packages: group.packages.filter((pkg) => {
          if (!q) return true;
          return (
            pkg.id.toLowerCase().includes(q) ||
            pkg.shortName.toLowerCase().includes(q) ||
            pkg.categoryLabel.toLowerCase().includes(q) ||
            pkg.roleSummary.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((group) => group.packages.length > 0);
  }, [groupedLayers, activeLayerFilter, searchQuery]);

  const togglePackage = (id: string) => {
    setStagedBanner(null);
    setSelectedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      if (!exists) {
        setFocusedPkgId(id);
      }
      return next;
    });
  };

  const applyPresetIds = (ids: readonly string[], label?: string) => {
    setSelectedIds([...ids]);
    setFocusedPkgId(ids[0] ?? null);
    setStagedBanner(label ? `Preset active: ${label}` : null);
    if (ids.length === 1 && ids[0] === 'AstraFlow.Cli') {
      setActiveTab('tool');
    }
  };

  const isPresetActive = (ids: readonly string[]) => {
    if (ids.length !== selectedIds.length) return false;
    const set = new Set(selectedIds);
    return ids.every((id) => set.has(id));
  };

  // Enlarged Living Isometric Stack Geometry with multi-solid 2-tier plates + leader ticks
  const stackGeometry = useMemo(() => {
    const effective = stack.effectivePackages;
    const count = effective.length;
    const cam = createCamera(
      45,
      0.5,
      count <= 4 ? 1.44 : count <= 8 ? 1.28 : count <= 12 ? 1.15 : 1.04,
    );

    const stepZ = count <= 4 ? 26 : count <= 8 ? 20 : count <= 12 ? 15 : 12;
    const plateH = count <= 4 ? 10 : count <= 8 ? 8.5 : count <= 12 ? 7.5 : 6.5;
    const maxZ = Math.max(1, count - 1) * stepZ + plateH + 20;

    const extremePoints: Point3[] = [
      [-74, -74, 0],
      [74, 74, 0],
      [-74, -74, maxZ],
      [74, 74, maxZ],
    ];
    fitCamera(cam, extremePoints, 166, 232);

    const project = projectCamera(cam);
    const front = createFacingPredicate(cam);

    const baseFootprint = createIsoPlateGeometry({
      camera: cam,
      project,
      front,
      x0: -70,
      y0: -70,
      x1: 70,
      y1: 70,
      z0: 0,
      z1: 5,
      radius: 12,
      creaseInset: 5,
      steps: 8,
    });

    const layers = effective.map((pkg, idx) => {
      const z0 = 8 + idx * stepZ;
      const z1 = z0 + plateH;
      const isDirect = stack.selectedIds.includes(pkg.id);
      const halfSpan = isDirect ? 56 : 62;
      const geom = createIsoPlateGeometry({
        camera: cam,
        project,
        front,
        x0: -halfSpan,
        y0: -halfSpan,
        x1: halfSpan,
        y1: halfSpan,
        z0,
        z1,
        radius: 9,
        creaseInset: 3.6,
        steps: 8,
      });

      const trimGeom = isDirect
        ? createIsoPlateGeometry({
            camera: cam,
            project,
            front,
            x0: -halfSpan + 14,
            y0: -halfSpan + 14,
            x1: halfSpan - 14,
            y1: halfSpan - 14,
            z0: z1,
            z1: z1 + Math.max(2.5, plateH * 0.34),
            radius: 5,
            creaseInset: 2,
            steps: 6,
          })
        : null;

      const rightCornerAnchor = project(halfSpan, -halfSpan, z0 + plateH * 0.6);

      return {
        pkg,
        index: idx,
        isDirect,
        geom,
        trimGeom,
        rightCornerAnchor,
      };
    });

    const spineStartZ = 8;
    const spineEndZ =
      count > 0 ? 8 + (count - 1) * stepZ + plateH : 26;
    const spinePoints: Point3[] = [
      [0, -76, spineStartZ],
      [0, -76, spineEndZ],
    ];

    const centerFoot = project(0, 0, 5);

    return {
      cam,
      project,
      baseFootprint,
      layers,
      spinePoints,
      centerFoot,
    };
  }, [stack.effectivePackages, stack.selectedIds]);

  const activeLayerPkg = useMemo(() => {
    const targetId = hoveredLayerId ?? focusedPkgId;
    if (targetId && stack.effectivePackages.some((p) => p.id === targetId)) {
      return packageById.get(targetId) ?? null;
    }
    return stack.selectedPackages[stack.selectedPackages.length - 1] ?? stack.effectivePackages[0] ?? null;
  }, [hoveredLayerId, focusedPkgId, stack.effectivePackages, stack.selectedPackages, packageById]);

  const activeLayerIndex = useMemo(() => {
    if (!activeLayerPkg) return 0;
    const idx = stack.effectivePackages.findIndex((p) => p.id === activeLayerPkg.id);
    return idx >= 0 ? idx : 0;
  }, [activeLayerPkg, stack.effectivePackages]);

  const currentOutputCode = useMemo(() => {
    if (stack.packageCount === 0) {
      return '# Select one or more packages or choose an architecture preset.';
    }
    switch (activeTab) {
      case 'cli':
        if (stack.cliBlock) {
          return stack.cliBlock;
        }
        if (stack.toolBlock) {
          return '# AstraFlow.Cli installs via the .NET Tool CLI tab:\n' + stack.toolBlock;
        }
        return '# Select one or more NuGet packages.';
      case 'xml':
        return stack.xmlBlock;
      case 'tool':
        return (
          stack.toolBlock ||
          `# Select AstraFlow.Cli under Build-Time & Tooling to generate:\n# dotnet tool install --global AstraFlow.Cli --version ${LATEST_PUBLISHED_VERSION}`
        );
      case 'combined':
        return stack.combinedBlock;
    }
  }, [activeTab, stack]);

  const canCopyOutput = useMemo(() => {
    if (stack.packageCount === 0) return false;
    if (activeTab === 'tool') return Boolean(stack.toolBlock);
    return Boolean(currentOutputCode.trim());
  }, [stack.packageCount, activeTab, stack.toolBlock, currentOutputCode]);

  const handleCopy = async () => {
    if (!canCopyOutput) return;
    try {
      await navigator.clipboard.writeText(currentOutputCode);
      setCopiedTab(activeTab);
      window.setTimeout(() => setCopiedTab(null), 1800);
    } catch {
      setCopiedTab(null);
    }
  };

  const tabItems: ReadonlyArray<{ id: InstallOutputTab; label: string }> = [
    { id: 'cli', label: 'dotnet CLI' },
    { id: 'xml', label: 'PackageReference XML' },
    { id: 'tool', label: '.NET Tool CLI' },
    { id: 'combined', label: 'All Commands' },
  ];

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    idx: number,
  ) => {
    let next = idx;
    if (event.key === 'ArrowRight') next = (idx + 1) % tabItems.length;
    else if (event.key === 'ArrowLeft')
      next = (idx - 1 + tabItems.length) % tabItems.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabItems.length - 1;
    else return;

    event.preventDefault();
    const target = tabItems[next];
    setActiveTab(target.id);
    tabRefs.current[target.id]?.focus();
  };

  const tfmDisplay =
    stack.effectiveTargetFrameworks.length > 0
      ? stack.effectiveTargetFrameworks.join(' · ')
      : stack.packageCount === 0
        ? 'No packages staged'
        : 'Compiler / Tool assets only (no runtime TFM lock)';

  return (
    <div className={styles.composerWrapper}>
      <div className={styles.composerShell} aria-label="AstraFlow Stack Composer">
        <div className={styles.topBar}>
          <div className={styles.topBarMeta}>
            <p className={styles.topKicker}>
              <span className={styles.topDot} aria-hidden="true" />
              INTERACTIVE STACK COMPOSER · VERIFIED {LATEST_PUBLISHED_VERSION} MANIFEST
            </p>
            <div className={styles.telemetryPills}>
              <span className={styles.telemetryChip}>{packages.length} packages</span>
              <span className={styles.telemetryChip}>
                {stack.selectedIds.length} direct
              </span>
              <span className={styles.telemetryChip}>
                {stack.effectivePackages.length} effective
              </span>
            </div>
            {stagedBanner ? (
              <span className={styles.stagedBanner} role="status" aria-live="polite">
                {stagedBanner}
              </span>
            ) : null}
          </div>

          <div className={styles.quickActions}>
            <button
              type="button"
              className={styles.utilityBtn}
              onClick={() => applyPresetIds(['AstraFlow.Mediator'], 'Minimal Mediator')}
            >
              Minimal
            </button>
            <button
              type="button"
              className={styles.utilityBtn}
              onClick={() =>
                applyPresetIds(
                  [
                    'AstraFlow.Contracts',
                    'AstraFlow.Mediator',
                    'AstraFlow.Mapper',
                    'AstraFlow.Diagnostics',
                  ],
                  'All Core',
                )
              }
            >
              All Core
            </button>
            <button
              type="button"
              className={styles.utilityBtn}
              onClick={() => applyPresetIds([], 'Cleared')}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Architecture Presets */}
        <div className={styles.presetRow}>
          <span className={styles.presetLabel}>Quick Architecture Presets</span>
          <div
            className={styles.presetPills}
            role="group"
            aria-label="Quick architecture presets"
          >
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={styles.presetBtn}
                aria-pressed={isPresetActive(preset.packageIds)}
                title={preset.summary}
                onClick={() => applyPresetIds(preset.packageIds, preset.label)}
              >
                <span>{preset.label}</span>
                <span className={styles.presetCountBadge}>
                  {preset.packageIds.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.benchGrid}>
          {/* Left Pane: Layer Filters & 16 Package Selector */}
          <div className={styles.selectorPane}>
            <div className={styles.paneControls}>
              <input
                type="search"
                aria-label="Filter 16 AstraFlow packages"
                placeholder="Search packages by name or capability..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div
                className={styles.layerFilters}
                role="group"
                aria-label="Filter selector by architecture layer"
              >
                <button
                  type="button"
                  className={styles.layerFilterBtn}
                  aria-pressed={activeLayerFilter === 'all'}
                  onClick={() => setActiveLayerFilter('all')}
                >
                  All ({packages.length})
                </button>
                {PACKAGE_LAYER_GROUPS.map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    className={styles.layerFilterBtn}
                    aria-pressed={activeLayerFilter === group.key}
                    onClick={() => setActiveLayerFilter(group.key)}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
            </div>

            {visibleGroups.length > 0 ? (
              <div
                className={styles.groupList}
                data-lenis-prevent=""
                tabIndex={0}
              >
                {visibleGroups.map((group) => (
                  <section
                    key={group.key}
                    className={styles.layerSection}
                    aria-label={group.label}
                  >
                    <div className={styles.layerHeadingRow}>
                      <h3 className={styles.layerTitle}>{group.label}</h3>
                      <span className={styles.layerCount}>
                        {group.packages.length} pkg
                        {group.packages.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {group.packages.map((pkg) => {
                      const isSelected = stack.selectedIds.includes(pkg.id);
                      const isImplied =
                        !isSelected && stack.impliedDependencies.includes(pkg.id);

                      return (
                        <div key={pkg.id} className={styles.pkgRow}>
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            className={styles.pkgToggle}
                            onClick={() => togglePackage(pkg.id)}
                          >
                            <span className={styles.pkgCheck} aria-hidden="true">
                              {isSelected ? '✓' : '+'}
                            </span>
                            <span className={styles.pkgMain}>
                              <span className={styles.pkgIdLine}>
                                <span className={styles.pkgName}>{pkg.id}</span>
                                {pkg.requiresPrivateAssets ? (
                                  <span className={styles.pkgTag}>
                                    PrivateAssets=&quot;all&quot;
                                  </span>
                                ) : pkg.isTool ? (
                                  <span className={styles.pkgTag}>.NET Tool</span>
                                ) : (
                                  <span className={styles.pkgTag}>
                                    {pkg.publishedVersion}
                                  </span>
                                )}
                                {isImplied ? (
                                  <span className={styles.pkgTagImplied}>
                                    Implied ref
                                  </span>
                                ) : null}
                              </span>
                              <span className={styles.pkgTfm}>
                                {pkg.targetFrameworks.join(' · ')}
                              </span>
                            </span>
                          </button>

                          <Link
                            href={pkg.docHref}
                            className={styles.pkgInfoLink}
                            aria-label={`Read documentation for ${pkg.id}`}
                            title={`Documentation for ${pkg.id}`}
                          >
                            ↗
                          </Link>
                        </div>
                      );
                    })}
                  </section>
                ))}
              </div>
            ) : (
              <p className={styles.emptySearch}>
                No packages match &ldquo;{searchQuery.trim()}&rdquo;.
              </p>
            )}
          </div>

          {/* Center Pane: Enlarged Living Isometric Stack SVG */}
          <div ref={stackStageRef} className={styles.stackPane}>
            <div className={styles.stackHeader}>
              <h3 className={styles.stackTitle}>LIVING ISOMETRIC STACK</h3>
              <span className={styles.stackCounts}>
                {stack.selectedIds.length} direct · {stack.effectivePackages.length}{' '}
                effective
              </span>
            </div>

            <div className={styles.stackCanvas} data-parallax="stage">
              <svg
                className={styles.stackSvg}
                viewBox={`0 0 ${STACK_SVG_WIDTH} ${STACK_SVG_HEIGHT}`}
                role="group"
                aria-label={`Isometric stack visualization showing ${stack.effectivePackages.length} effective packages`}
              >
                {/* Drafting rings around stack base */}
                <circle
                  cx={r2(stackGeometry.centerFoot[0])}
                  cy={r2(stackGeometry.centerFoot[1] - 10)}
                  r={124}
                  fill="none"
                  stroke="rgba(180, 205, 189, 0.14)"
                  strokeDasharray="3 7"
                  aria-hidden="true"
                />

                {/* Base architectural chassis guide */}
                <IsoPrism
                  geometry={stackGeometry.baseFootprint}
                  variant="dark-forest"
                  strokeWidth={1.05}
                  creaseStrokeWidth={0.75}
                />

                {/* Vertical Signal Orange bus conduit threading the stack */}
                {stackGeometry.layers.length > 0 ? (
                  <IsoSignalConduit
                    worldPoints={stackGeometry.spinePoints}
                    camera={stackGeometry.cam}
                    project={stackGeometry.project}
                    surface="forest"
                    active
                    progress={1}
                    paused={!viewportActive}
                    showTerminals
                    pulseRadius={2.6}
                  />
                ) : (
                  <text
                    x={STACK_SVG_WIDTH / 2}
                    y={215}
                    textAnchor="middle"
                    fill="#b4cdbd"
                    fontSize={11.5}
                    fontFamily="var(--font-mono)"
                    fontWeight={700}
                  >
                    SELECT A PACKAGE TO BUILD STACK
                  </text>
                )}

                {/* Dynamic multi-solid stacked IsoPrism layers */}
                {stackGeometry.layers.map((layer) => {
                  const isFocused = activeLayerPkg?.id === layer.pkg.id;
                  const isHovered = hoveredLayerId === layer.pkg.id;

                  let variant: IsoPrismVariant = 'forest';
                  if (!layer.isDirect) {
                    variant = 'dark-forest';
                  } else if (layer.pkg.requiresPrivateAssets) {
                    variant = 'sand';
                  } else if (layer.pkg.isTool) {
                    variant = 'ivory';
                  }

                  const trimVariant: IsoPrismVariant =
                    variant === 'sand' || variant === 'ivory' ? 'forest' : 'sand';

                  const textColor =
                    variant === 'sand' || variant === 'ivory'
                      ? WARM_FOREST_PALETTE.ink
                      : WARM_FOREST_PALETTE.paperRaised;

                  const leaderText = formatStackLeaderLabel(layer.pkg.id);

                  const showFaceBadge =
                    isFocused ||
                    layer.index === stackGeometry.layers.length - 1 ||
                    stackGeometry.layers.length <= 5;

                  const liftPx = isFocused ? 7 : isHovered ? 3.5 : 0;
                  const delayMs = staggerDelayMs(layer.index, activeLayerIndex, 35);
                  const overlayTransformStyle = {
                    transform:
                      Math.abs(liftPx) > 0.001
                        ? `translate3d(0, ${r2(-liftPx)}px, 0)`
                        : 'translate3d(0, 0, 0)',
                    transition: reducedMotion
                      ? 'none'
                      : `transform ${EASE_LIFT_DURATION_MS}ms ${EASE_LIFT_CSS} ${delayMs}ms`,
                  };

                  return (
                    <Fragment key={layer.pkg.id}>
                      <IsoPrism
                        geometry={layer.geom}
                        variant={variant}
                        active={isHovered}
                        selected={isFocused}
                        liftPx={liftPx}
                        delayMs={delayMs}
                        showDropGuides={isFocused}
                        label={`${layer.pkg.id} (${
                          layer.isDirect ? 'Selected' : 'Implied reference'
                        })`}
                        onSelect={() => setFocusedPkgId(layer.pkg.id)}
                        onHoverChange={(hover) =>
                          setHoveredLayerId(hover ? layer.pkg.id : null)
                        }
                        onFocusChange={(focus) =>
                          setHoveredLayerId(focus ? layer.pkg.id : null)
                        }
                      >
                        {layer.trimGeom ? (
                          <IsoPrism
                            geometry={layer.trimGeom}
                            variant={trimVariant}
                            interactive={false}
                            strokeWidth={0.85}
                            creaseStrokeWidth={0.6}
                          />
                        ) : null}
                      </IsoPrism>

                      {showFaceBadge ||
                      isFocused ||
                      layer.index === stackGeometry.layers.length - 1 ? (
                        <g
                          aria-hidden="true"
                          pointerEvents="none"
                          style={overlayTransformStyle}
                        >
                          {showFaceBadge ? (
                            <g>
                              <line
                                x1={r2(layer.rightCornerAnchor[0])}
                                y1={r2(layer.rightCornerAnchor[1])}
                                x2={r2(Math.min(STACK_SVG_WIDTH - 110, layer.rightCornerAnchor[0] + 18))}
                                y2={r2(layer.rightCornerAnchor[1])}
                                stroke={
                                  isFocused
                                    ? WARM_FOREST_PALETTE.signal
                                    : 'rgba(255, 253, 247, 0.35)'
                                }
                                strokeWidth={1}
                              />
                              <circle
                                cx={r2(layer.rightCornerAnchor[0])}
                                cy={r2(layer.rightCornerAnchor[1])}
                                r={2}
                                fill={
                                  isFocused
                                    ? WARM_FOREST_PALETTE.signal
                                    : WARM_FOREST_PALETTE.peach
                                }
                              />
                              <text
                                x={r2(Math.min(STACK_SVG_WIDTH - 106, layer.rightCornerAnchor[0] + 22))}
                                y={r2(layer.rightCornerAnchor[1] + 3)}
                                textAnchor="start"
                                fontFamily="var(--font-mono)"
                                fontSize={9}
                                fontWeight={700}
                                fill={
                                  isFocused
                                    ? WARM_FOREST_PALETTE.peach
                                    : '#d8ebe0'
                                }
                              >
                                {leaderText}
                              </text>
                            </g>
                          ) : null}

                          {isFocused || layer.index === stackGeometry.layers.length - 1 ? (
                            <text
                              x={r2(layer.geom.topCenter[0])}
                              y={r2(layer.geom.topCenter[1] + 3)}
                              textAnchor="middle"
                              fontFamily="var(--font-mono)"
                              fontSize={8.5}
                              fontWeight={700}
                              fill={
                                layer.trimGeom
                                  ? trimVariant === 'forest'
                                    ? WARM_FOREST_PALETTE.paperRaised
                                    : WARM_FOREST_PALETTE.ink
                                  : textColor
                              }
                            >
                              {String(layer.index + 1).padStart(2, '0')}
                            </text>
                          ) : null}
                        </g>
                      ) : null}
                    </Fragment>
                  );
                })}
              </svg>
            </div>

            <div className={styles.stackLegend} aria-hidden="true">
              <span className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{ background: WARM_FOREST_PALETTE.forest }}
                />
                Runtime
              </span>
              <span className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{ background: WARM_FOREST_PALETTE.forestDeep }}
                />
                Implied ref
              </span>
              <span className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{ background: WARM_FOREST_PALETTE.sand }}
                />
                Compiler asset
              </span>
              <span className={styles.legendItem}>
                <span
                  className={styles.legendSwatch}
                  style={{ background: WARM_FOREST_PALETTE.paperRaised }}
                />
                .NET Tool
              </span>
            </div>

            {activeLayerPkg ? (
              <div className={styles.focusedLayerCard} aria-live="polite">
                <div className={styles.focusedLayerTop}>
                  <span className={styles.focusedLayerName}>{activeLayerPkg.id}</span>
                  <span className={styles.pkgTag}>
                    {activeLayerPkg.statusLabel}
                  </span>
                </div>
                <p className={styles.focusedLayerDesc}>{activeLayerPkg.roleSummary}</p>
                <Link href={activeLayerPkg.docHref} className={styles.focusedLayerDoc}>
                  Open {activeLayerPkg.shortName} docs ↗
                </Link>
              </div>
            ) : null}
          </div>

          {/* Right Pane: Install Plan & Warnings */}
          <div className={styles.outputPane}>
            <div className={styles.outputHeader}>
              <div>
                <span className={styles.presetLabel}>INSTALL PLAN</span>
                <h3 className={styles.outputCount}>
                  {stack.packageCount} package{stack.packageCount === 1 ? '' : 's'} selected
                </h3>
              </div>
              <div className={styles.terminalStatusDots} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>

            <p className={styles.tfmSummary}>
              Shared TFMs: <strong>{tfmDisplay}</strong>
            </p>

            <div
              role="tablist"
              aria-label="Install plan output formats"
              className={styles.tabRow}
            >
              {tabItems.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[tab.id] = el;
                    }}
                    id={`${baseId}-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`${baseId}-panel`}
                    tabIndex={isActive ? 0 : -1}
                    className={styles.tabBtn}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div
              id={`${baseId}-panel`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${activeTab}`}
            >
              <pre
                className={styles.codeBox}
                data-lenis-prevent=""
                tabIndex={0}
              >
                {currentOutputCode}
              </pre>

              <div className={styles.copyRow}>
                <button
                  type="button"
                  className={styles.copyBtn}
                  disabled={!canCopyOutput}
                  onClick={handleCopy}
                >
                  {copiedTab === activeTab ? 'Copied ✓' : 'Copy output'}{' '}
                  <span aria-hidden="true">↗</span>
                </button>
                <span className={styles.copyStatus} role="status" aria-live="polite">
                  {copiedTab === activeTab
                    ? 'Copied current install output to clipboard.'
                    : ''}
                </span>
              </div>
            </div>

            <div className={styles.notesBlock}>
              {stack.impliedDependencies.length > 0 ? (
                <div className={styles.impliedNote}>
                  <strong>Transitive project references included:</strong>{' '}
                  {stack.impliedDependencies.join(', ')}
                </div>
              ) : null}

              {stack.warnings.map((warning) => (
                <div
                  key={warning.code}
                  className={`${styles.warningItem} ${
                    warning.severity === 'info' ? styles.warningInfo : ''
                  }`}
                >
                  <span className={styles.warningTitle}>{warning.title}</span>
                  {warning.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showDirectory ? (
        <section
          className="section"
          id="directory"
          aria-label="All 16 AstraFlow packages directory"
        >
          <PackagesDirectory
            packages={packages}
            onStagePackage={(pkgId) =>
              applyStagedDetail({
                packageIds: [pkgId],
                label: pkgId,
                mode: 'add',
              })
            }
          />
        </section>
      ) : null}
    </div>
  );
}
