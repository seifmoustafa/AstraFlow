'use client';

import {
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
    title: 'Explore the Monorepo & Roadmap',
    summary:
      'Browse all 16 .NET packages, source generators, analyzers, and the 2.4.0 development branch directly on GitHub.',
    detail: `Stable NuGet releases target ${LATEST_PUBLISHED_VERSION}; active source development tracks ${UNRELEASED_SOURCE_VERSION}.`,
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
      'Include exception messages, analyzer diagnostic codes, or mapping expression snippets so maintainers can reproduce fast.',
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
    title: 'Architecture Docs, ADRs & Upgrade Guides',
    summary:
      'Consult the repository docs archive, architecture decision records, benchmarks, and 2.3.0 upgrade notes before proposing API changes.',
    detail:
      'Every public API surface and compatibility decision is documented alongside the source in docs/.',
    href: '/docs/getting-started',
    ctaLabel: 'Open Documentation Hub',
    isExternal: false,
    tags: ['Docs', 'ADRs', 'Upgrade Guide'],
  },
];

const SHORT_LABELS: Record<string, string> = {
  'source-repo': 'Repository',
  'issue-tracker': 'Issues',
  'pull-requests': 'Pull Requests',
  'contributing-guide': 'Contributing',
  'security-policy': 'Security',
  'documentation-hub': 'Architecture Docs',
};

interface StationLayoutSpec {
  cx: number;
  cy: number;
  conduit: Point3[];
}

const STATION_LAYOUT: StationLayoutSpec[] = [
  {
    cx: -124,
    cy: -36,
    conduit: [
      [-34, -18, 4],
      [-80, -18, 4],
      [-80, -36, 4],
      [-104, -36, 4],
    ],
  },
  {
    cx: -36,
    cy: -124,
    conduit: [
      [-18, -34, 4],
      [-18, -80, 4],
      [-36, -80, 4],
      [-36, -104, 4],
    ],
  },
  {
    cx: 102,
    cy: -102,
    conduit: [
      [34, -22, 4],
      [68, -22, 4],
      [68, -102, 4],
      [82, -102, 4],
    ],
  },
  {
    cx: 124,
    cy: 36,
    conduit: [
      [34, 18, 4],
      [80, 18, 4],
      [80, 36, 4],
      [104, 36, 4],
    ],
  },
  {
    cx: 36,
    cy: 124,
    conduit: [
      [18, 34, 4],
      [18, 80, 4],
      [36, 80, 4],
      [36, 104, 4],
    ],
  },
  {
    cx: -102,
    cy: 102,
    conduit: [
      [-34, 22, 4],
      [-68, 22, 4],
      [-68, 102, 4],
      [-82, 102, 4],
    ],
  },
];

const SVG_WIDTH = 640;
const SVG_HEIGHT = 320;
const STATION_HALF = 21;
const HUB_HALF = 34;

function buildPathwayGlyph(
  index: number,
  P: Projector,
  cx: number,
  cy: number,
  zTop: number,
): string[] {
  switch (index) {
    case 0:
      // Repository source frame
      return [
        open([
          P(cx - 8, cy - 8, zTop),
          P(cx + 8, cy - 8, zTop),
          P(cx + 8, cy + 8, zTop),
          P(cx - 8, cy + 8, zTop),
          P(cx - 8, cy - 8, zTop),
        ]),
        seg(P(cx - 3, cy, zTop), P(cx + 3, cy, zTop)),
      ];
    case 1:
      // Issues target ring diamond
      return [
        open([
          P(cx, cy - 8, zTop),
          P(cx + 8, cy, zTop),
          P(cx, cy + 8, zTop),
          P(cx - 8, cy, zTop),
          P(cx, cy - 8, zTop),
        ]),
      ];
    case 2:
      // Pull requests merge branch
      return [
        seg(P(cx - 8, cy - 6, zTop), P(cx + 8, cy + 6, zTop)),
        open([
          P(cx - 8, cy + 6, zTop),
          P(cx, cy + 6, zTop),
          P(cx + 3, cy + 2, zTop),
        ]),
      ];
    case 3:
      // Contributing checklist bars
      return [
        seg(P(cx - 8, cy - 5, zTop), P(cx + 8, cy - 5, zTop)),
        seg(P(cx - 8, cy, zTop), P(cx + 6, cy, zTop)),
        seg(P(cx - 8, cy + 5, zTop), P(cx + 8, cy + 5, zTop)),
      ];
    case 4:
      // Security shield polygon
      return [
        open([
          P(cx, cy - 8, zTop),
          P(cx + 7, cy - 4, zTop),
          P(cx + 6, cy + 4, zTop),
          P(cx, cy + 9, zTop),
          P(cx - 6, cy + 4, zTop),
          P(cx - 7, cy - 4, zTop),
          P(cx, cy - 8, zTop),
        ]),
      ];
    default:
      // Architecture docs twin pages
      return [
        open([
          P(cx - 8, cy - 6, zTop),
          P(cx, cy - 6, zTop),
          P(cx, cy + 7, zTop),
          P(cx - 8, cy + 7, zTop),
          P(cx - 8, cy - 6, zTop),
        ]),
        open([
          P(cx, cy - 6, zTop),
          P(cx + 8, cy - 6, zTop),
          P(cx + 8, cy + 7, zTop),
          P(cx, cy + 7, zTop),
        ]),
      ];
  }
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
    label: 'Repository governance rule',
    text: pathway.detail,
  };
}

interface ProjectedStation {
  index: number;
  geometry: IsoPlateGeometry;
  conduitPoints: Point2[];
  glyphPaths: string[];
  dotCenter: Point2;
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

  const activeIndex = hoveredIndex ?? focusedIndex ?? pinnedIndex;

  const scene = useMemo(() => {
    const cam = createCamera(45, 0.5, 1.24);
    const extrema: Point3[] = [
      [-HUB_HALF, -HUB_HALF, 0],
      [HUB_HALF, HUB_HALF, 18],
    ];
    for (let i = 0; i < effectivePathways.length; i++) {
      const spec = STATION_LAYOUT[i % STATION_LAYOUT.length];
      extrema.push(
        [spec.cx - STATION_HALF, spec.cy - STATION_HALF, 0],
        [spec.cx + STATION_HALF, spec.cy + STATION_HALF, 20],
      );
    }
    fitCamera(cam, extrema, SVG_WIDTH / 2, SVG_HEIGHT / 2 + 4);

    const P = projectCamera(cam);
    const front = createFacingPredicate(cam);

    const hubGeometry = createIsoPlateGeometry({
      camera: cam,
      project: P,
      front,
      x0: -HUB_HALF,
      y0: -HUB_HALF,
      x1: HUB_HALF,
      y1: HUB_HALF,
      z0: 4,
      z1: 15,
      radius: 7,
      creaseInset: 2.5,
      steps: 8,
    });

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
        radius: 5,
        creaseInset: 1.8,
        steps: 6,
      });

      return {
        index: i,
        geometry,
        conduitPoints: spec.conduit.map((pt) => P(pt[0], pt[1], pt[2])),
        glyphPaths: buildPathwayGlyph(i, P, spec.cx, spec.cy, 8),
        dotCenter: P(spec.cx, spec.cy + 13, 8),
      };
    });

    type RenderSolid =
      | { kind: 'hub'; depthKey: number }
      | { kind: 'station'; depthKey: number; station: ProjectedStation };

    const solids: RenderSolid[] = [
      { kind: 'hub' as const, depthKey: hubGeometry.depthKey },
      ...stations.map((station) => ({
        kind: 'station' as const,
        depthKey: station.geometry.depthKey,
        station,
      })),
    ].sort((a, b) => a.depthKey - b.depthKey);

    return {
      hubGeometry,
      stations,
      solids,
    };
  }, [effectivePathways]);

  const activePathway =
    activeIndex !== null ? effectivePathways[activeIndex] ?? null : null;

  const activeRule = activePathway
    ? getGovernanceRuleForPathway(activePathway, governance)
    : {
        label: 'Baseline verification rule (CONTRIBUTING.md)',
        text:
          governance?.buildTestCommands[2] ??
          'dotnet test AstraFlow.slnx -c Release --no-build',
      };

  const count = effectivePathways.length;

  function focusStation(nextIndex: number) {
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

  const hubLeftPct = (scene.hubGeometry.topCenter[0] / SVG_WIDTH) * 100;
  const hubTopPct = (scene.hubGeometry.topCenter[1] / SVG_HEIGHT) * 100;

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
            activePathway ? ` ${styles.statePillActive}` : ''
          }`}
        >
          {activePathway
            ? `SIGNAL ACTIVE · ${activePathway.number} ${
                SHORT_LABELS[activePathway.id] ?? activePathway.title
              }`
            : 'IDLE · HOVER OR ARROW A NODE'}
        </span>
      </div>

      <div className={styles.networkStage}>
        <div className={styles.svgWrap}>
          <svg
            className={styles.networkSvg}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            role="group"
            aria-label="Isometric AstraFlow contribution network connecting the central hub to six repository pathways"
          >
            {/* Orthogonal-isometric conduits painted behind opaque plinths (Rule 06) */}
            {scene.stations.map((station) => {
              const pathway = effectivePathways[station.index];
              if (!pathway) return null;
              const isIlluminated = activeIndex === station.index;
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
                  baseStrokeWidth={1.3}
                  activeStrokeWidth={2.2}
                  pulseDurationMs={1900}
                  pulseRadius={3}
                  showTerminals
                  ariaLabel={`Conduit between AstraFlow core hub and ${pathway.title}`}
                />
              );
            })}

            {/* Painter-sorted opaque solids: central hub + 6 pathway stations */}
            {scene.solids.map((solid) => {
              if (solid.kind === 'hub') {
                return (
                  <IsoPrism
                    key="central-hub"
                    geometry={scene.hubGeometry}
                    variant="ivory"
                    active={activeIndex !== null}
                    interactive={false}
                    strokeWidth={1.35}
                    activeStrokeWidth={1.75}
                    dataTestId="community-hub-plinth"
                  />
                );
              }

              const { station } = solid;
              const pathway = effectivePathways[station.index];
              if (!pathway) return null;

              const isHighlighted = activeIndex === station.index;
              const isPinned = pinnedIndex === station.index;

              return (
                <IsoPrism
                  key={pathway.id}
                  geometry={station.geometry}
                  variant={isHighlighted ? 'terracotta' : 'sand'}
                  selected={isPinned}
                  active={isHighlighted}
                  liftPx={isHighlighted ? 10 : 0}
                  delayMs={
                    activeIndex !== null
                      ? staggerDelayMs(station.index, activeIndex, 35)
                      : 0
                  }
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
                  {station.glyphPaths.map((d, gIdx) => (
                    <path
                      key={`glyph-${pathway.id}-${gIdx}`}
                      d={d}
                      fill="none"
                      stroke={
                        isHighlighted
                          ? WARM_FOREST_PALETTE.ink
                          : WARM_FOREST_PALETTE.inkSecondary
                      }
                      strokeWidth={1.25}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pointerEvents="none"
                    />
                  ))}
                  <circle
                    cx={r2(station.dotCenter[0])}
                    cy={r2(station.dotCenter[1])}
                    r={1.5}
                    fill={
                      isHighlighted
                        ? WARM_FOREST_PALETTE.signal
                        : WARM_FOREST_PALETTE.muted
                    }
                    pointerEvents="none"
                  />
                </IsoPrism>
              );
            })}
          </svg>

          {/* Canonical A mark anchored cleanly over the central Warm Ivory plinth */}
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
              width={46}
              height={37}
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
          const isHighlighted = activeIndex === index;
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
      <div
        className={styles.inspectorPanel}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className={styles.inspectorHeader}>
          <div className={styles.inspectorTitleGroup}>
            <span className={styles.inspectorKicker}>
              CONDUIT INSPECTOR ·{' '}
              {activePathway
                ? `${activePathway.number} ${
                    (
                      SHORT_LABELS[activePathway.id] ?? activePathway.title
                    ).toUpperCase()
                  }`
                : 'RESTING HUB'}
            </span>
          </div>

          {pinnedIndex !== null ? (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => {
                setPinnedIndex(null);
                setHoveredIndex(null);
              }}
            >
              Reset idle
            </button>
          ) : null}
        </div>

        <h2 className={styles.inspectorHeading}>
          {activePathway
            ? activePathway.title
            : 'One open repository. Six verified ways to engage.'}
        </h2>

        <p className={styles.inspectorPurpose}>
          {activePathway
            ? activePathway.summary
            : 'Hover, focus, or press Left/Right arrow keys across stations 01–06 to energize a contribution conduit and inspect its governance rule.'}
        </p>

        <div className={styles.governanceRule}>
          <strong>{activeRule.label}</strong>
          <span>{activeRule.text}</span>
        </div>

        <div className={styles.inspectorFooter}>
          <span className={styles.destBadge}>
            {formatDestinationBadge(
              activePathway ? activePathway.href : GITHUB_LINKS.repo,
            )}
          </span>

          {activePathway ? (
            activePathway.isExternal ? (
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
            )
          ) : (
            <a
              href={GITHUB_LINKS.repo}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.destLink}
            >
              Open destination ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
