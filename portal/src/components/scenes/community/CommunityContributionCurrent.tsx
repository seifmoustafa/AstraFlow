'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import type {
  CommunityGovernance,
  ContributionPathway,
} from '@/lib/community';
import {
  GITHUB_LINKS,
  LATEST_PUBLISHED_VERSION,
} from '@/lib/site-config';
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
  type FacingPredicate,
  type IsoCamera,
  type IsoPlateGeometry,
  type IsoPrismVariant,
  type Point2,
  type Point3,
  type Projector,
} from '@/components/hairline';
import styles from './CommunityContributionCurrent.module.css';

export interface CommunityContributionCurrentProps {
  pathways?: ContributionPathway[];
  governance?: CommunityGovernance;
  className?: string;
}

const FALLBACK_PATHWAYS: ContributionPathway[] = [
  {
    id: 'source-repo',
    number: '01',
    title: 'Explore the Monorepo Source',
    summary:
      'Browse all 16 .NET packages, source generators, Roslyn analyzers, and test suites directly on GitHub.',
    detail: `AstraFlow packages target version ${LATEST_PUBLISHED_VERSION} with modular project boundaries.`,
    href: GITHUB_LINKS.repo,
    ctaLabel: 'Open GitHub Repository',
    isExternal: true,
    tags: ['Repository', 'MIT License', 'Source'],
  },
  {
    id: 'issue-tracker',
    number: '02',
    title: 'Report Bugs & Reproduction Cases',
    summary:
      'Open a targeted GitHub Issue with your AstraFlow package version, target framework, and minimal reproduction.',
    detail:
      'Include exception messages, compiler warnings, or mapping expression snippets so maintainers can reproduce fast.',
    href: GITHUB_LINKS.issues,
    ctaLabel: 'Browse or File Issues',
    isExternal: true,
    tags: ['Issues', 'Bug Reports', 'Repros'],
  },
  {
    id: 'pull-requests',
    number: '03',
    title: 'Submit Focused Pull Requests',
    summary:
      'Contribute handler optimizations, analyzer rules, EF Core projection fixes, or package documentation updates.',
    detail:
      'Keep each PR scoped to the owning package, update tests and docs, and confirm solution builds stay warning-clean.',
    href: GITHUB_LINKS.pulls,
    ctaLabel: 'View Pull Requests',
    isExternal: true,
    tags: ['Pull Requests', 'Review', 'CI'],
  },
  {
    id: 'contributing-guide',
    number: '04',
    title: 'Contribution & Verification Checklist',
    summary:
      'Follow CONTRIBUTING.md conventions: build AstraFlow.slnx, run package and generator test suites, and verify XML docs.',
    detail:
      'Respect package boundaries (AstraFlow.Contracts stays dependency-free; Analyzers & Generators require PrivateAssets="all").',
    href: GITHUB_LINKS.contributing,
    ctaLabel: 'Read CONTRIBUTING.md',
    isExternal: true,
    tags: ['CONTRIBUTING.md', 'Test Matrix', 'Quality'],
  },
  {
    id: 'security-policy',
    number: '05',
    title: 'Coordinated Security Disclosures',
    summary:
      'Report redaction, serialization, source-generation, or endpoint vulnerabilities privately via GitHub Security Advisories.',
    detail:
      'Do not open public issues for sensitive security bugs. Target initial maintainer triage acknowledgement within 72 hours.',
    href: GITHUB_LINKS.security,
    ctaLabel: 'Read SECURITY.md',
    isExternal: true,
    tags: ['SECURITY.md', '72h Target', 'Advisories'],
  },
  {
    id: 'documentation-hub',
    number: '06',
    title: 'Product Documentation & Guides',
    summary:
      'Consult the developer documentation, package selection matrix, pipeline patterns, and upgrade notes before proposing API changes.',
    detail:
      'Every public API surface and compatibility baseline is documented in the AstraFlow documentation hub.',
    href: '/docs/getting-started',
    ctaLabel: 'Open Documentation Hub',
    isExternal: false,
    tags: ['Docs', 'Quick Start', 'Migration'],
  },
];

const SHORT_LABELS: Record<string, string> = {
  'source-repo': 'Repository',
  'issue-tracker': 'Issues',
  'pull-requests': 'Pull Requests',
  'contributing-guide': 'Contributing',
  'security-policy': 'Security',
  'documentation-hub': 'Architecture',
};

interface StationLayoutSpec {
  cx: number;
  cy: number;
  conduit: Point3[];
}

const STATION_LAYOUT: StationLayoutSpec[] = [
  {
    cx: -138,
    cy: -40,
    conduit: [
      [-40, -20, 4],
      [-88, -20, 4],
      [-88, -40, 4],
      [-115, -40, 4],
    ],
  },
  {
    cx: -42,
    cy: -136,
    conduit: [
      [-20, -40, 4],
      [-20, -90, 4],
      [-42, -90, 4],
      [-42, -114, 4],
    ],
  },
  {
    cx: 112,
    cy: -112,
    conduit: [
      [40, -24, 4],
      [76, -24, 4],
      [76, -112, 4],
      [89, -112, 4],
    ],
  },
  {
    cx: 138,
    cy: 40,
    conduit: [
      [40, 20, 4],
      [88, 20, 4],
      [88, 40, 4],
      [115, 40, 4],
    ],
  },
  {
    cx: 42,
    cy: 136,
    conduit: [
      [20, 40, 4],
      [20, 90, 4],
      [42, 90, 4],
      [42, 114, 4],
    ],
  },
  {
    cx: -112,
    cy: 112,
    conduit: [
      [-40, 24, 4],
      [-76, 24, 4],
      [-76, 112, 4],
      [-89, 112, 4],
    ],
  },
];

const SVG_WIDTH = 680;
const SVG_HEIGHT = 350;
const STATION_HALF = 23;
const HUB_BASE_HALF = 43;
const HUB_COLLAR_HALF = 35;
const HUB_CROWN_HALF = 27;
const AUTO_ROUTE_INTERVAL_MS = 3000;

interface MiniSculptureBlock {
  key: string;
  geometry: IsoPlateGeometry;
  variant: IsoPrismVariant;
}

interface ProjectedStation {
  index: number;
  geometry: IsoPlateGeometry;
  conduitPoints: Point2[];
  miniBlocks: MiniSculptureBlock[];
  accentDotCenter: Point2;
}

function buildMiniSculptureBlocks(
  index: number,
  camera: IsoCamera,
  P: Projector,
  front: FacingPredicate,
  cx: number,
  cy: number,
): MiniSculptureBlock[] {
  const plate = (
    key: string,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    z0: number,
    z1: number,
    variant: IsoPrismVariant,
    radius = 2,
  ): MiniSculptureBlock => ({
    key,
    variant,
    geometry: createIsoPlateGeometry({
      camera,
      project: P,
      front,
      x0: cx + x0,
      y0: cy + y0,
      x1: cx + x1,
      y1: cy + y1,
      z0,
      z1,
      radius,
      creaseInset: 1.1,
      steps: 4,
    }),
  });

  let blocks: MiniSculptureBlock[];
  switch (index) {
    case 0:
      // 01 Repository: stepped archive cube monolith + slate top plate
      blocks = [
        plate('repo-base', -9, -8, 9, 8, 8, 14, 'ivory', 2.4),
        plate('repo-core', -5, -4, 6, 5, 14, 19, 'forest', 1.8),
      ];
      break;
    case 1:
      // 02 Issues: diagnostic plinth + glowing beacon turret
      blocks = [
        plate('issue-pad', -9, -9, 9, 9, 8, 13, 'ivory', 2.4),
        plate('issue-beacon', -4, -4, 4, 4, 13, 21, 'terracotta', 1.6),
      ];
      break;
    case 2:
      // 03 Pull Requests: twin input branch blocks + joined merge bridge
      blocks = [
        plate('pr-branch-a', -11, -8, -2, 1, 8, 14, 'forest', 1.8),
        plate('pr-branch-b', 2, -8, 11, 1, 8, 14, 'ivory', 1.8),
        plate('pr-merge', -6, 1, 6, 10, 8, 17, 'terracotta', 2),
      ];
      break;
    case 3:
      // 04 Contributing: three ascending verification steps
      blocks = [
        plate('step-1', -11, -8, -4, 8, 8, 11, 'ivory', 1.5),
        plate('step-2', -3, -8, 4, 8, 8, 14, 'sand', 1.5),
        plate('step-3', 5, -8, 12, 8, 8, 18, 'forest', 1.5),
      ];
      break;
    case 4:
      // 05 Security: dark bastion base + terracotta vault lock turret
      blocks = [
        plate('sec-bastion', -10, -9, 10, 9, 8, 14, 'dark-forest', 2.6),
        plate('sec-core', -5, -5, 5, 5, 14, 19, 'terracotta', 1.8),
      ];
      break;
    default:
      // 06 Architecture Docs: twin architectural folio slabs side-by-side
      blocks = [
        plate('docs-leaf-l', -11, -8, -1, 8, 8, 14, 'ivory', 2),
        plate('docs-leaf-r', 1, -8, 11, 8, 8, 17, 'forest', 2),
      ];
      break;
  }

  return blocks.sort((a, b) => a.geometry.depthKey - b.geometry.depthKey);
}

function formatDestinationBadge(href: string): string {
  return href.replace(/^https?:\/\//, '');
}

function getGovernanceRuleForPathway(
  pathway: ContributionPathway,
  governance?: CommunityGovernance,
): { label: string; text: string } {
  if (pathway.id === 'pull-requests') {
    const firstCheck =
      governance?.prChecklist[0] ??
      'Changes are scoped cleanly to a bug fix, feature, or documentation update.';
    return {
      label: 'PR checklist rule (CONTRIBUTING.md)',
      text: firstCheck,
    };
  }
  if (pathway.id === 'contributing-guide') {
    const cmd =
      governance?.buildTestCommands[2] ??
      governance?.buildTestCommands[1] ??
      'dotnet test AstraFlow.slnx -c Release --no-build';
    return {
      label: 'Verification baseline (CONTRIBUTING.md)',
      text: `Verify locally before opening a PR: ${cmd}`,
    };
  }
  if (pathway.id === 'security-policy') {
    const sla = governance?.securitySlaHours ?? '72 hours';
    return {
      label: `Security disclosure rule (SECURITY.md · ${sla} SLA)`,
      text: pathway.detail,
    };
  }
  return {
    label: 'Contribution guideline',
    text: pathway.detail,
  };
}

export function CommunityContributionCurrent({
  pathways,
  governance,
  className,
}: CommunityContributionCurrentProps) {
  const effectivePathways = useMemo(() => {
    if (pathways && pathways.length > 0) return pathways.slice(0, 6);
    if (governance?.pathways && governance.pathways.length > 0) {
      return governance.pathways.slice(0, 6);
    }
    return FALLBACK_PATHWAYS;
  }, [pathways, governance]);

  const count = effectivePathways.length;

  const [autoIndex, setAutoIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [rovingIndex, setRovingIndex] = useState<number>(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = useReducedMotionSafe();
  const stageActivity = useViewportActivity(stageRef, {
    paused: reducedMotion,
    initialInView: true,
  });

  const userActiveIndex = hoveredIndex ?? focusedIndex ?? pinnedIndex;
  const isUserActive = userActiveIndex !== null;

  useEffect(() => {
    if (
      count <= 1 ||
      reducedMotion ||
      !stageActivity.isActive ||
      isUserActive
    ) {
      return;
    }

    const timerId = window.setInterval(() => {
      setAutoIndex((prev) => (prev + 1) % count);
    }, AUTO_ROUTE_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [count, reducedMotion, stageActivity.isActive, isUserActive]);

  const displayIndex = userActiveIndex ?? autoIndex;

  const scene = useMemo(() => {
    const cam = createCamera(45, 0.5, 1.24);
    const extrema: Point3[] = [
      [-HUB_BASE_HALF, -HUB_BASE_HALF, 0],
      [HUB_BASE_HALF, HUB_BASE_HALF, 22],
    ];
    for (let i = 0; i < effectivePathways.length; i++) {
      const spec = STATION_LAYOUT[i % STATION_LAYOUT.length];
      extrema.push(
        [spec.cx - STATION_HALF, spec.cy - STATION_HALF, 0],
        [spec.cx + STATION_HALF, spec.cy + STATION_HALF, 32],
      );
    }
    fitCamera(cam, extrema, SVG_WIDTH / 2, SVG_HEIGHT / 2 + 6);

    const P = projectCamera(cam);
    const front = createFacingPredicate(cam);

    const hubBaseGeometry = createIsoPlateGeometry({
      camera: cam,
      project: P,
      front,
      x0: -HUB_BASE_HALF,
      y0: -HUB_BASE_HALF,
      x1: HUB_BASE_HALF,
      y1: HUB_BASE_HALF,
      z0: 0,
      z1: 6,
      radius: 8,
      creaseInset: 2.5,
      steps: 8,
    });

    const hubCollarGeometry = createIsoPlateGeometry({
      camera: cam,
      project: P,
      front,
      x0: -HUB_COLLAR_HALF,
      y0: -HUB_COLLAR_HALF,
      x1: HUB_COLLAR_HALF,
      y1: HUB_COLLAR_HALF,
      z0: 6,
      z1: 11,
      radius: 7,
      creaseInset: 2,
      steps: 8,
    });

    const hubCrownGeometry = createIsoPlateGeometry({
      camera: cam,
      project: P,
      front,
      x0: -HUB_CROWN_HALF,
      y0: -HUB_CROWN_HALF,
      x1: HUB_CROWN_HALF,
      y1: HUB_CROWN_HALF,
      z0: 11,
      z1: 18,
      radius: 6,
      creaseInset: 2,
      steps: 6,
    });

    const guideLines = [
      seg(P(-165, 0, 0), P(165, 0, 0)),
      seg(P(0, -165, 0), P(0, 165, 0)),
    ];

    const stations: ProjectedStation[] = effectivePathways.map((_, i) => {
      const spec = STATION_LAYOUT[i % STATION_LAYOUT.length];
      const geometry = createIsoPlateGeometry({
        camera: cam,
        project: P,
        front,
        x0: spec.cx - STATION_HALF,
        y0: spec.cy - STATION_HALF,
        x1: spec.cx + STATION_HALF,
        y1: spec.cy + STATION_HALF,
        z0: 0,
        z1: 8,
        radius: 5.5,
        creaseInset: 1.8,
        steps: 6,
      });

      return {
        index: i,
        geometry,
        conduitPoints: spec.conduit.map((pt) => P(pt[0], pt[1], pt[2])),
        miniBlocks: buildMiniSculptureBlocks(i, cam, P, front, spec.cx, spec.cy),
        accentDotCenter: P(spec.cx, spec.cy + 16, 8),
      };
    });

    type RenderSolid =
      | { kind: 'hub'; depthKey: number }
      | { kind: 'station'; depthKey: number; station: ProjectedStation };

    const solids: RenderSolid[] = [
      { kind: 'hub' as const, depthKey: hubBaseGeometry.depthKey },
      ...stations.map((station) => ({
        kind: 'station' as const,
        depthKey: station.geometry.depthKey,
        station,
      })),
    ].sort((a, b) => a.depthKey - b.depthKey);

    return {
      hubBaseGeometry,
      hubCollarGeometry,
      hubCrownGeometry,
      guideLines,
      stations,
      solids,
    };
  }, [effectivePathways]);

  const activePathway = effectivePathways[displayIndex] ?? effectivePathways[0];

  const activeRule = activePathway
    ? getGovernanceRuleForPathway(activePathway, governance)
    : {
        label: 'Baseline verification rule (CONTRIBUTING.md)',
        text:
          governance?.buildTestCommands[2] ??
          'dotnet test AstraFlow.slnx -c Release --no-build',
      };

  function focusStation(nextIndex: number) {
    if (count === 0) return;
    const wrapped = (nextIndex + count) % count;
    setRovingIndex(wrapped);
    setFocusedIndex(wrapped);
    btnRefs.current[wrapped]?.focus();
  }

  function handleStationKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusStation(index + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusStation(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusStation(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusStation(count - 1);
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
    if (count === 0) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = (index + 1) % count;
      setPinnedIndex(next);
      setRovingIndex(next);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = (index - 1 + count) % count;
      setPinnedIndex(prev);
      setRovingIndex(prev);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setPinnedIndex(null);
      setHoveredIndex(null);
      setFocusedIndex(null);
    }
  }

  function handleContainerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      setPinnedIndex(null);
      setHoveredIndex(null);
      setFocusedIndex(null);
    }
  }

  const hubLeftPct = (scene.hubCrownGeometry.topCenter[0] / SVG_WIDTH) * 100;
  const hubTopPct = (scene.hubCrownGeometry.topCenter[1] / SVG_HEIGHT) * 100;
  const shortActiveLabel = activePathway
    ? SHORT_LABELS[activePathway.id] ?? activePathway.title
    : 'Repository';

  return (
    <div
      ref={stageRef}
      className={className ? `${styles.root} ${className}` : styles.root}
      onMouseLeave={() => setHoveredIndex(null)}
      onKeyDown={handleContainerKeyDown}
    >
      <div className={styles.topBar}>
        <span>FIGURE 05 / CONTRIBUTION CURRENT</span>
        <span
          className={`${styles.statePill}${
            isUserActive ? ` ${styles.statePillActive}` : ''
          }`}
        >
          <span className={styles.stateDot} aria-hidden="true" />
          <span>
            {isUserActive
              ? `${pinnedIndex !== null ? 'PINNED · ' : ''}SIGNAL ACTIVE · ${
                  activePathway?.number ?? '01'
                } ${shortActiveLabel}`
              : `IDLE / AUTO-ROUTING · ${
                  activePathway?.number ?? '01'
                } ${shortActiveLabel}`}
          </span>
        </span>
      </div>

      <div className={styles.networkStage}>
        <div className={styles.svgWrap}>
          <svg
            className={styles.networkSvg}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            role="group"
            aria-label="Isometric AstraFlow contribution network connecting the central multi-tier hub to six repository pathways"
          >
            {/* Subtle drafting crosshair datum lines behind conduits (Rule 06) */}
            {scene.guideLines.map((d, guideIdx) => (
              <path
                key={`guide-${guideIdx}`}
                d={d}
                fill="none"
                stroke={WARM_FOREST_PALETTE.border}
                strokeWidth={1}
                strokeDasharray="3 7"
                opacity={0.75}
                aria-hidden="true"
              />
            ))}

            {/* Orthogonal-isometric conduits painted behind opaque plinths (Rule 06) */}
            {scene.stations.map((station) => {
              const pathway = effectivePathways[station.index];
              if (!pathway) return null;
              const isIlluminated = displayIndex === station.index;
              return (
                <IsoSignalConduit
                  key={`conduit-${pathway.id}`}
                  points={station.conduitPoints}
                  cornerRadius={5}
                  active={isIlluminated}
                  progress={isIlluminated ? 1 : 0}
                  paused={!isIlluminated}
                  viewportActive={stageActivity.isActive}
                  surface="ivory"
                  baseColor={WARM_FOREST_PALETTE.border}
                  baseStrokeWidth={1.35}
                  activeStrokeWidth={2.4}
                  pulseDurationMs={1900}
                  pulseRadius={3.2}
                  showTerminals
                  ariaLabel={`Conduit between AstraFlow core hub and ${pathway.title}`}
                />
              );
            })}

            {/* Painter-sorted opaque solids: sculpted 3-tier central hub + 6 pathway stations */}
            {scene.solids.map((solid) => {
              if (solid.kind === 'hub') {
                return (
                  <g key="central-hub-stack">
                    <IsoPrism
                      geometry={scene.hubBaseGeometry}
                      variant="dark-forest"
                      active={displayIndex !== null}
                      interactive={false}
                      strokeWidth={1.35}
                      activeStrokeWidth={1.65}
                      dataTestId="community-hub-base"
                    />
                    <IsoPrism
                      geometry={scene.hubCollarGeometry}
                      variant="terracotta"
                      active
                      interactive={false}
                      strokeWidth={1.2}
                      activeStrokeWidth={1.6}
                      dataTestId="community-hub-collar"
                    />
                    <IsoPrism
                      geometry={scene.hubCrownGeometry}
                      variant="ivory"
                      active={isUserActive}
                      interactive={false}
                      strokeWidth={1.35}
                      activeStrokeWidth={1.75}
                      dataTestId="community-hub-plinth"
                    />
                  </g>
                );
              }

              const { station } = solid;
              const pathway = effectivePathways[station.index];
              if (!pathway) return null;

              const isHighlighted = displayIndex === station.index;
              const isPinned = pinnedIndex === station.index;

              return (
                <IsoPrism
                  key={pathway.id}
                  geometry={station.geometry}
                  variant={isHighlighted ? 'terracotta' : 'sand'}
                  selected={isPinned}
                  active={isHighlighted}
                  liftPx={isHighlighted ? 11 : 0}
                  delayMs={staggerDelayMs(station.index, displayIndex, 35)}
                  showDropGuides={isHighlighted}
                  role="button"
                  ariaPressed={isPinned}
                  label={`${pathway.number} ${
                    SHORT_LABELS[pathway.id] ?? pathway.title
                  }: inspect pathway`}
                  onSelect={() => {
                    setPinnedIndex((prev) =>
                      prev === station.index ? null : station.index,
                    );
                    setRovingIndex(station.index);
                  }}
                  onHoverChange={(hovering) =>
                    setHoveredIndex(hovering ? station.index : null)
                  }
                  onFocusChange={(focused) =>
                    setFocusedIndex(focused ? station.index : null)
                  }
                  onKeyDown={(event) => handleSvgKeyDown(event, station.index)}
                  dataTestId={`community-station-${pathway.id}`}
                >
                  {station.miniBlocks.map((block) => (
                    <IsoPrism
                      key={block.key}
                      geometry={block.geometry}
                      variant={block.variant}
                      active={isHighlighted}
                      interactive={false}
                      liftPx={0}
                      strokeWidth={0.95}
                      activeStrokeWidth={1.15}
                    />
                  ))}
                  <circle
                    cx={r2(station.accentDotCenter[0])}
                    cy={r2(station.accentDotCenter[1])}
                    r={isHighlighted ? 2.1 : 1.5}
                    fill={
                      isHighlighted
                        ? WARM_FOREST_PALETTE.signal
                        : WARM_FOREST_PALETTE.inkSecondary
                    }
                    pointerEvents="none"
                  />
                </IsoPrism>
              );
            })}
          </svg>

          {/* Canonical A mark anchored cleanly over the Warm Ivory crown cap */}
          <div
            className={styles.hubEmblem}
            style={{
              left: `${r2(hubLeftPct)}%`,
              top: `${r2(hubTopPct)}%`,
            }}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/mark-on-light.svg"
              alt=""
              width={44}
              height={35}
            />
          </div>
        </div>
      </div>

      {/* Keyboard-accessible 6-station pathway selector strip */}
      <div
        className={styles.stationGrid}
        role="group"
        aria-label="AstraFlow contribution pathways"
      >
        {effectivePathways.map((pathway, index) => {
          const isHighlighted = displayIndex === index;
          const isPinned = pinnedIndex === index;
          const shortLabel = SHORT_LABELS[pathway.id] ?? pathway.title;

          return (
            <button
              key={pathway.id}
              ref={(el) => {
                btnRefs.current[index] = el;
              }}
              type="button"
              tabIndex={rovingIndex === index ? 0 : -1}
              aria-pressed={isPinned}
              data-highlighted={isHighlighted ? 'true' : 'false'}
              className={styles.stationBtn}
              onMouseEnter={() => setHoveredIndex(index)}
              onFocus={() => {
                setFocusedIndex(index);
                setRovingIndex(index);
              }}
              onBlur={() =>
                setFocusedIndex((curr) => (curr === index ? null : curr))
              }
              onClick={() => {
                setPinnedIndex((prev) => (prev === index ? null : index));
                setRovingIndex(index);
              }}
              onKeyDown={(event) => handleStationKeyDown(event, index)}
            >
              <span className={styles.stationNum}>{pathway.number}</span>
              <strong className={styles.stationName}>{shortLabel}</strong>
            </button>
          );
        })}
      </div>

      {/* Inset Active Pathway Readout (CONDUIT INSPECTOR) */}
      {activePathway ? (
        <div
          className={styles.inspectorPanel}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className={styles.inspectorHeader}>
            <div className={styles.inspectorTitleGroup}>
              <span className={styles.inspectorKicker}>
                CONDUIT INSPECTOR · {activePathway.number}{' '}
                {shortActiveLabel.toUpperCase()}
              </span>
            </div>

            {pinnedIndex !== null ? (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => {
                  setPinnedIndex(null);
                  setHoveredIndex(null);
                  setFocusedIndex(null);
                }}
              >
                Reset idle
              </button>
            ) : null}
          </div>

          <h2 className={styles.inspectorHeading}>{activePathway.title}</h2>

          <p className={styles.inspectorPurpose}>{activePathway.summary}</p>

          <div className={styles.governanceRule}>
            <strong>{activeRule.label}</strong>
            <span>{activeRule.text}</span>
          </div>

          <div className={styles.inspectorFooter}>
            <span className={styles.destBadge}>
              {formatDestinationBadge(activePathway.href)}
            </span>

            {activePathway.isExternal ? (
              <a
                href={activePathway.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.destLink}
              >
                Open destination ↗
              </a>
            ) : (
              <Link href={activePathway.href} className={styles.destLink}>
                Open destination ↗
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
