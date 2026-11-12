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
import type { AstraFlowPackage, ComposerPreset } from '@/lib/packages';
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

  // Living Isometric Stack Geometry
  const stackGeometry = useMemo(() => {
    const effective = stack.effectivePackages;
    const count = effective.length;
    const cam = createCamera(
      45,
      0.5,
      count <= 4 ? 1.38 : count <= 8 ? 1.24 : count <= 12 ? 1.12 : 1.02,
    );

    const stepZ = count <= 4 ? 24 : count <= 8 ? 18 : count <= 12 ? 14 : 11;
    const plateH = count <= 4 ? 9 : count <= 8 ? 8 : count <= 12 ? 7 : 6;
    const maxZ = Math.max(1, count - 1) * stepZ + plateH + 14;

    const extremePoints: Point3[] = [
      [-64, -64, 0],
      [64, 64, 0],
      [-64, -64, maxZ],
      [64, 64, maxZ],
    ];
    fitCamera(cam, extremePoints, 180, 198);

    const project = projectCamera(cam);
    const front = createFacingPredicate(cam);

    const baseFootprint = createIsoPlateGeometry({
      camera: cam,
      project,
      front,
      x0: -64,
      y0: -64,
      x1: 64,
      y1: 64,
      z0: 0,
      z1: 4,
      radius: 10,
      creaseInset: 4,
      steps: 8,
    });

    const layers = effective.map((pkg, idx) => {
      const z0 = 6 + idx * stepZ;
      const z1 = z0 + plateH;
      const isDirect = stack.selectedIds.includes(pkg.id);
      const halfSpan = isDirect ? 54 : 58;
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
        radius: 8,
        creaseInset: 3.2,
        steps: 8,
      });

      return {
        pkg,
        index: idx,
        isDirect,
        geom,
      };
    });

    const spineStartZ = 6;
    const spineEndZ =
      count > 0 ? 6 + (count - 1) * stepZ + plateH : 24;
    const spinePoints: Point3[] = [
      [0, -68, spineStartZ],
      [0, -68, spineEndZ],
    ];

    return {
      cam,
      project,
      baseFootprint,
      layers,
      spinePoints,
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
          return stack.unreleasedBlock
            ? `${stack.cliBlock}\n\n${stack.unreleasedBlock}`
            : stack.cliBlock;
        }
        if (stack.toolBlock && !stack.unreleasedBlock) {
          return '# AstraFlow.Cli installs via the .NET Tool CLI tab:\n' + stack.toolBlock;
        }
        return stack.unreleasedBlock || '# No published NuGet packages selected.';
      case 'xml':
        return stack.xmlBlock;
      case 'tool':
        return (
          stack.toolBlock ||
          '# Select AstraFlow.Cli under Build-Time & Tooling to generate:\n# dotnet tool install --global AstraFlow.Cli --version 2.3.0'
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
              INTERACTIVE STACK COMPOSER · VERIFIED 2.3.0 MANIFEST
            </p>
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
                {preset.label}
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
              <div className={styles.groupList}>
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
                      const isUnreleased = !pkg.isPublished;

                      return (
                        <div key={pkg.id} className={styles.pkgRow}>
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            className={`${styles.pkgToggle} ${
                              isUnreleased ? styles.pkgToggleUnreleased : ''
                            }`}
                            onClick={() => togglePackage(pkg.id)}
                          >
                            <span className={styles.pkgCheck} aria-hidden="true">
                              {isSelected ? '✓' : '+'}
                            </span>
                            <span className={styles.pkgMain}>
                              <span className={styles.pkgIdLine}>
                                <span className={styles.pkgName}>{pkg.id}</span>
                                {isUnreleased ? (
                                  <span className={styles.pkgTagWarn}>
                                    2.4.0 Unreleased Source
                                  </span>
                                ) : pkg.requiresPrivateAssets ? (
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

          {/* Center Pane: Live Isometric Living Stack SVG */}
          <div ref={stackStageRef} className={styles.stackPane}>
            <div className={styles.stackHeader}>
              <h3 className={styles.stackTitle}>LIVING ISOMETRIC STACK</h3>
              <span className={styles.stackCounts}>
                {stack.selectedIds.length} direct · {stack.effectivePackages.length}{' '}
                effective
              </span>
            </div>

            <div className={styles.stackCanvas}>
              <svg
                className={styles.stackSvg}
                viewBox="0 0 360 390"
                role="group"
                aria-label={`Isometric stack visualization showing ${stack.effectivePackages.length} effective packages`}
              >
                {/* Base architectural chassis guide */}
                <IsoPrism
                  geometry={stackGeometry.baseFootprint}
                  variant="dark-forest"
                  strokeWidth={1}
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
                    pulseRadius={2.4}
                  />
                ) : (
                  <text
                    x={180}
                    y={170}
                    textAnchor="middle"
                    fill="#9bb8a8"
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    fontWeight={700}
                  >
                    SELECT A PACKAGE TO BUILD STACK
                  </text>
                )}

                {/* Dynamic stacked IsoPrism layers */}
                {stackGeometry.layers.map((layer) => {
                  const isFocused = activeLayerPkg?.id === layer.pkg.id;
                  const isHovered = hoveredLayerId === layer.pkg.id;
                  const isUnreleased = !layer.pkg.isPublished;

                  let variant: IsoPrismVariant = 'forest';
                  if (isUnreleased) {
                    variant = 'terracotta';
                  } else if (!layer.isDirect) {
                    variant = 'dark-forest';
                  } else if (layer.pkg.requiresPrivateAssets) {
                    variant = 'sand';
                  } else if (layer.pkg.isTool) {
                    variant = 'ivory';
                  }

                  const textColor =
                    variant === 'sand' ||
                    variant === 'ivory' ||
                    variant === 'terracotta'
                      ? WARM_FOREST_PALETTE.ink
                      : WARM_FOREST_PALETTE.paperRaised;

                  const labelShort = layer.pkg.id.replace(/^AstraFlow\.?/, '') || 'AstraFlow';

                  return (
                    <IsoPrism
                      key={layer.pkg.id}
                      geometry={layer.geom}
                      variant={variant}
                      active={isHovered}
                      selected={isFocused}
                      liftPx={isFocused ? 6 : isHovered ? 3 : 0}
                      delayMs={staggerDelayMs(layer.index, activeLayerIndex, 35)}
                      showDropGuides={isFocused}
                      label={`${layer.pkg.id} (${
                        isUnreleased
                          ? '2.4.0 Unreleased Source'
                          : layer.isDirect
                            ? 'Selected'
                            : 'Implied reference'
                      })`}
                      onSelect={() => setFocusedPkgId(layer.pkg.id)}
                      onHoverChange={(hover) =>
                        setHoveredLayerId(hover ? layer.pkg.id : null)
                      }
                      onFocusChange={(focus) =>
                        setHoveredLayerId(focus ? layer.pkg.id : null)
                      }
                    >
                      {(isFocused ||
                        layer.index === stackGeometry.layers.length - 1 ||
                        isUnreleased ||
                        stackGeometry.layers.length <= 6) && (
                        <text
                          x={r2(layer.geom.topCenter[0])}
                          y={r2(layer.geom.topCenter[1] + 3)}
                          textAnchor="middle"
                          fontFamily="var(--font-mono)"
                          fontSize={9}
                          fontWeight={700}
                          fill={textColor}
                          pointerEvents="none"
                          aria-hidden="true"
                        >
                          {isUnreleased ? `${labelShort} · 2.4*` : labelShort.toUpperCase()}
                        </text>
                      )}
                    </IsoPrism>
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
                  style={{ background: WARM_FOREST_PALETTE.peach }}
                />
                2.4.0 unreleased
              </span>
            </div>

            {activeLayerPkg ? (
              <div className={styles.focusedLayerCard} aria-live="polite">
                <div className={styles.focusedLayerTop}>
                  <span className={styles.focusedLayerName}>{activeLayerPkg.id}</span>
                  <span
                    className={
                      !activeLayerPkg.isPublished ? styles.pkgTagWarn : styles.pkgTag
                    }
                  >
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

          {/* Right Pane: Truthful Install Plan & Warnings */}
          <div className={styles.outputPane}>
            <div className={styles.outputHeader}>
              <div>
                <span className={styles.presetLabel}>INSTALL PLAN</span>
                <h3 className={styles.outputCount}>
                  {stack.packageCount} package{stack.packageCount === 1 ? '' : 's'} selected
                </h3>
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

            {stack.unreleasedCount > 0 ? (
              <div className={styles.unreleasedBanner} role="alert">
                2.4.0 UNRELEASED SOURCE WARNING: <code>AstraFlow.Assertions</code> is NOT
                published on NuGet. It is excluded from published 2.3.0{' '}
                <code>dotnet add package</code> commands.
              </div>
            ) : null}

            <div
              id={`${baseId}-panel`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${activeTab}`}
            >
              <pre className={styles.codeBox} tabIndex={0}>
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
