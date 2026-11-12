'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { HAIRLINE_IVORY_STYLE } from '@/components/motion/HairlineFigures';
import { useReducedMotionContext } from '@/components/motion/ReducedMotionProvider';

export type BranchIndex = 0 | 1 | 2 | 3;

export interface BranchStation {
  index: BranchIndex;
  id: string;
  tag: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  actionText: string;
  href: string;
  external: boolean;
  busCoordinates: {
    start: { x: number; y: number };
    control1: { x: number; y: number };
    control2: { x: number; y: number };
    terminal: { x: number; y: number };
  };
  pathD: string;
}

export const COMMUNITY_STATIONS: readonly BranchStation[] = [
  {
    index: 0,
    id: 'source',
    tag: 'CHANNEL 01 / SOURCE',
    code: 'SRC-CORE',
    title: 'Inspect Runtime & Abstractions',
    subtitle: 'Direct repository access to runtime source and core abstractions.',
    description:
      'Inspect Mediator dispatch pipeline, compile-time Roslyn source generators, zero-allocation mappers, and diagnostic ActivitySource instrumentation.',
    badge: '16 Modular Packages',
    actionText: 'Explore Codebase',
    href: 'https://github.com/seifmoustafa/AstraFlow',
    external: true,
    busCoordinates: {
      start: { x: 420, y: 260 },
      control1: { x: 300, y: 260 },
      control2: { x: 260, y: 130 },
      terminal: { x: 120, y: 130 },
    },
    pathD: 'M420 260 C 300 260, 260 130, 120 130',
  },
  {
    index: 1,
    id: 'discuss',
    tag: 'CHANNEL 02 / DISCUSS',
    code: 'ISSUE-TRACK',
    title: 'Report Issues & Engineering Findings',
    subtitle: 'Public issue tracking with reproducible test harnesses.',
    description:
      'Submit edge-case reports, benchmark logs, and API refinement proposals. Every report is evaluated against documented runtime contracts.',
    badge: 'Public Discussions',
    actionText: 'Open Issue Tracker',
    href: 'https://github.com/seifmoustafa/AstraFlow/issues',
    external: true,
    busCoordinates: {
      start: { x: 480, y: 260 },
      control1: { x: 600, y: 260 },
      control2: { x: 640, y: 130 },
      terminal: { x: 780, y: 130 },
    },
    pathD: 'M480 260 C 600 260, 640 130, 780 130',
  },
  {
    index: 2,
    id: 'contribute',
    tag: 'CHANNEL 03 / CONTRIBUTE',
    code: 'PR-GATE',
    title: 'Propose Changes & Verification Gates',
    subtitle: 'Focused pull requests adhering to strict TDD and baseline preservation.',
    description:
      'Submit targeted PRs validated against public API baseline diffs, zero breaking changes, and Sigstore cryptographic artifact provenance.',
    badge: 'Automated CI Matrix',
    actionText: 'Submit Pull Request',
    href: 'https://github.com/seifmoustafa/AstraFlow/pulls',
    external: true,
    busCoordinates: {
      start: { x: 420, y: 300 },
      control1: { x: 300, y: 300 },
      control2: { x: 260, y: 430 },
      terminal: { x: 120, y: 430 },
    },
    pathD: 'M420 300 C 300 300, 260 430, 120 430',
  },
  {
    index: 3,
    id: 'learn',
    tag: 'CHANNEL 04 / LEARN',
    code: 'DOCS-LENS',
    title: 'Explore Architecture & 61 Guides',
    subtitle: 'Living documentation with deep conceptual walkthroughs and ADRs.',
    description:
      'Comprehensive guides covering request/response dispatch, expression tree EF Core projections, security redaction, and performance baselines.',
    badge: '61 Verified Guides',
    actionText: 'Browse Documentation',
    href: '/docs',
    external: false,
    busCoordinates: {
      start: { x: 480, y: 300 },
      control1: { x: 600, y: 300 },
      control2: { x: 640, y: 430 },
      terminal: { x: 780, y: 430 },
    },
    pathD: 'M480 300 C 600 300, 640 430, 780 430',
  },
] as const;

export function ContributionNetwork() {
  const { prefersReducedMotion } = useReducedMotionContext();
  const [activeBranch, setActiveBranch] = useState<BranchIndex>(0);
  const [hoveredBranch, setHoveredBranch] = useState<BranchIndex | null>(null);
  const stationRefs = useRef<Array<HTMLAnchorElement | null>>([null, null, null, null]);

  useEffect(() => {
    const previousPage = document.body.getAttribute('data-page');
    document.body.setAttribute('data-page', 'community');
    return () => {
      if (previousPage) {
        document.body.setAttribute('data-page', previousPage);
      } else {
        document.body.removeAttribute('data-page');
      }
    };
  }, []);

  const currentSelection = hoveredBranch ?? activeBranch;
  const currentStation = COMMUNITY_STATIONS[currentSelection];

  const handleStationKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: BranchIndex) => {
      let targetIdx: BranchIndex | null = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIdx = ((idx + 1) % 4) as BranchIndex;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIdx = ((idx + 3) % 4) as BranchIndex;
      } else if (e.key === 'Home') {
        targetIdx = 0;
      } else if (e.key === 'End') {
        targetIdx = 3;
      }

      if (targetIdx !== null) {
        e.preventDefault();
        setActiveBranch(targetIdx);
        stationRefs.current[targetIdx]?.focus();
      }
    },
    []
  );

  return (
    <div
      aria-label="AstraFlow Contribution Circuit & Open Branchwork"
      className="community-circuit-instrument hairline-ivory"
      data-active-channel={String(currentSelection)}
      style={HAIRLINE_IVORY_STYLE}
    >
      {/* Top Engineering Status Header */}
      <div className="circuit-status-bar">
        <div className="circuit-metric">
          <span className="circuit-dot" aria-hidden="true" />
          <span className="mono-code">FIGURE 03 // OPEN CONTRIBUTION CIRCUIT</span>
        </div>
        <div
          id="circuit-live-telemetry"
          data-testid="community-route-readout"
          className="circuit-telemetry mono-code"
          aria-live="polite"
        >
          <span id="community-route-readout" className="sr-only">
            Route {currentStation.code}: {currentStation.tag} — {currentStation.title}
          </span>
          ACTIVE PORT: {currentStation.code} // DEST: {currentStation.tag}
        </div>
      </div>

      {/* Desktop Spatial Circuit Stage */}
      <div className="circuit-stage-container">
        {/* SVG Electrical Bus Network */}
        <svg
          aria-hidden="true"
          className="circuit-bus-svg"
          fill="none"
          viewBox="0 0 900 560"
        >
          <defs>
            <linearGradient id="circuit-signal-glow" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#082c26" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#f25e3b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f25e3b" stopOpacity="1" />
            </linearGradient>

            <pattern id="circuit-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e0d9cc" strokeWidth="0.5" strokeOpacity="0.6" />
            </pattern>
          </defs>

          {/* Precision Architectural Grid */}
          <rect width="100%" height="100%" fill="url(#circuit-grid)" opacity="0.75" />

          {/* Precision Axis Guides & Coordinate Rings */}
          <g stroke="#90a89b" strokeWidth="1" opacity="0.35">
            <circle cx="450" cy="280" r="210" strokeDasharray="3 8" />
            <circle cx="450" cy="280" r="140" strokeDasharray="2 6" />
            <line x1="450" y1="30" x2="450" y2="530" strokeDasharray="4 8" />
            <line x1="30" y1="280" x2="870" y2="280" strokeDasharray="4 8" />
          </g>

          {/* Base Inactive Circuit Conduits */}
          {COMMUNITY_STATIONS.map((station) => (
            <g key={`base-conduit-${station.id}`}>
              {/* Secondary grounding trace */}
              <path
                d={station.pathD}
                stroke="#648778"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                opacity="0.4"
              />
              {/* Main structural copper bus line */}
              <path
                d={station.pathD}
                stroke={currentSelection === station.index ? '#f25e3b' : '#365d51'}
                strokeWidth={currentSelection === station.index ? '2.8' : '1.8'}
                strokeOpacity={currentSelection === station.index ? 1 : 0.45}
                style={{
                  transition: prefersReducedMotion
                    ? 'none'
                    : 'stroke 240ms ease-out, stroke-width 240ms ease-out, stroke-opacity 240ms ease-out',
                }}
              />
            </g>
          ))}

          {/* Active Animated Traveling Signal (Motion Tracer) */}
          {!prefersReducedMotion && (
            <motion.path
              key={`signal-active-${currentStation.id}`}
              d={currentStation.pathD}
              fill="none"
              stroke="url(#circuit-signal-glow)"
              strokeWidth="3.2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.45,
                ease: [0.2, 0.8, 0.2, 1],
              }}
            />
          )}

          {/* Central AstraFlow Kernel Node SVG Backdrop */}
          <g transform="translate(450, 280)">
            {/* Hexagonal Kernel Ground Plate */}
            <polygon
              points="-45,-26 0,-52 45,-26 45,26 0,52 -45,26"
              fill="#fffdf7"
              stroke="#082c26"
              strokeWidth="2"
            />
            {/* Inner Precision Compass Ring */}
            <circle
              cx="0"
              cy="0"
              r="34"
              fill="none"
              stroke={currentSelection !== null ? '#f25e3b' : '#365d51'}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* Targeting Indicator Pointer toward active branch */}
            <motion.line
              x1="0"
              y1="0"
              x2={currentSelection === 0 || currentSelection === 2 ? -30 : 30}
              y2={currentSelection === 0 || currentSelection === 1 ? -22 : 22}
              stroke="#f25e3b"
              strokeWidth="2.5"
              strokeLinecap="round"
              transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            />
          </g>

          {/* Terminal Contact Waypoint Rings */}
          {COMMUNITY_STATIONS.map((station) => {
            const isTarget = currentSelection === station.index;
            const tx = station.busCoordinates.terminal.x;
            const ty = station.busCoordinates.terminal.y;

            return (
              <g
                key={`waypoint-${station.id}`}
                transform={`translate(${tx}, ${ty})`}
                data-branch-waypoint={station.id}
              >
                {/* Contact Pad Square */}
                <rect
                  x="-7"
                  y="-7"
                  width="14"
                  height="14"
                  fill={isTarget ? '#f25e3b' : '#174339'}
                  stroke="#082c26"
                  strokeWidth="1.5"
                  style={{
                    transition: prefersReducedMotion ? 'none' : 'fill 200ms ease-out',
                  }}
                />
                {/* Active Radiating Targeting Ring */}
                {isTarget && (
                  <motion.circle
                    cx="0"
                    cy="0"
                    r="12"
                    fill="none"
                    stroke="#f25e3b"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1.25, opacity: 1 }}
                    transition={{
                      duration: 0.35,
                      ease: 'easeOut',
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Central Core Status Terminal */}
        <div className="circuit-central-core">
          <div className="core-mark-wrapper">
            <img
              src="/brand/mark-on-light.svg"
              alt="AstraFlow Canonical Mark"
              className="core-logo-img"
              width={48}
              height={44}
            />
          </div>
          <span className="core-title mono-code">ASTRAFLOW // KERNEL</span>
          <strong className="core-slogan">One Core. Four Open Channels.</strong>
          <span className="core-status-pill mono-code">SOURCE VERIFIED</span>
        </div>

        {/* Four Distinct Terminal Station Dockets */}
        <div className="circuit-terminals-grid">
          {COMMUNITY_STATIONS.map((station) => {
            const isSelected = currentSelection === station.index;
            const posClass =
              station.index === 0
                ? 'station-top-left'
                : station.index === 1
                ? 'station-top-right'
                : station.index === 2
                ? 'station-bottom-left'
                : 'station-bottom-right';

            return (
              <div
                key={station.id}
                className={`circuit-station-card v10-branch-item ${posClass} ${isSelected ? 'active-station' : ''}`}
                data-branch-item={station.id}
                onMouseEnter={() => setHoveredBranch(station.index)}
                onMouseLeave={() => setHoveredBranch(null)}
              >
                <div className="station-card-inner">
                  <div className="station-header">
                    <span className="station-tag mono-code">{station.tag}</span>
                    <span className="station-code mono-code">{station.code}</span>
                  </div>

                  <h3 className="station-title">{station.title}</h3>
                  <p className="station-desc">{station.subtitle}</p>

                  <div className="station-footer">
                    <span className="station-badge mono-code">{station.badge}</span>
                    {station.external ? (
                      <a
                        ref={(el) => {
                          stationRefs.current[station.index] = el;
                        }}
                        href={station.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="station-action-btn"
                        onFocus={() => setActiveBranch(station.index)}
                        onKeyDown={(e) => handleStationKeyDown(e, station.index)}
                      >
                        {station.actionText} <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <Link
                        ref={(el) => {
                          stationRefs.current[station.index] = el;
                        }}
                        href={station.href}
                        className="station-action-btn"
                        onFocus={() => setActiveBranch(station.index)}
                        onKeyDown={(e) => handleStationKeyDown(e, station.index)}
                      >
                        {station.actionText} <span aria-hidden="true">↗</span>
                      </Link>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    layoutId="community-active-branch-keyline"
                    className="station-active-glow"
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Channel Deep Context & Action Console */}
      <div className="circuit-detail-console">
        <div className="console-indicator mono-code">
          <span>PORT FOCUS // 0{currentStation.index + 1}</span>
          <span className="console-divider">—</span>
          <span>{currentStation.badge}</span>
        </div>
        <div className="console-body">
          <div className="console-text-wrap">
            <h4 className="console-heading">{currentStation.title}</h4>
            <p className="console-detail-desc">{currentStation.description}</p>
          </div>
          <div className="console-cta-wrap">
            {currentStation.external ? (
              <a
                href={currentStation.href}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-primary"
              >
                Launch {currentStation.actionText} <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <Link href={currentStation.href} className="button button-primary">
                Open Documentation <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .community-circuit-instrument {
          position: relative;
          background: var(--paper2, #fffdf7);
          border: 1px solid var(--line, #d8d0c2);
          border-radius: 8px;
          overflow: hidden;
          margin-top: 36px;
          margin-bottom: 40px;
          box-shadow: 0 16px 45px rgba(8, 44, 38, 0.05);
        }

        .circuit-status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: #082c26;
          color: #f7f3eb;
          border-bottom: 1px solid #134234;
        }

        .circuit-metric {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          letter-spacing: 0.12em;
          color: #ffc4aa;
        }

        .circuit-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--signal, #f25e3b);
          box-shadow: 0 0 0 4px rgba(242, 94, 59, 0.25);
        }

        .circuit-telemetry {
          font-size: 10px;
          color: #a8c6b7;
          letter-spacing: 0.1em;
        }

        .circuit-stage-container {
          position: relative;
          min-height: 560px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at center, rgba(255, 253, 247, 0.95), var(--paper, #f7f3eb));
        }

        .circuit-bus-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .circuit-central-core {
          position: absolute;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 22px 24px;
          background: rgba(255, 253, 247, 0.96);
          border: 1px solid var(--line, #d8d0c2);
          border-radius: 6px;
          box-shadow: 0 12px 32px rgba(8, 44, 38, 0.08);
          max-width: 250px;
          pointer-events: none;
        }

        .core-mark-wrapper {
          margin-bottom: 8px;
        }

        .core-title {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--action, #b73921);
          margin-bottom: 4px;
        }

        .core-slogan {
          font-size: 14px;
          color: var(--ink, #082c26);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.25;
          margin-bottom: 8px;
        }

        .core-status-pill {
          font-size: 8px;
          padding: 3px 8px;
          background: #e9e3d7;
          border: 1px solid #d8d0c2;
          border-radius: 3px;
          color: #496455;
          letter-spacing: 0.1em;
        }

        .circuit-terminals-grid {
          position: absolute;
          inset: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 20px;
          pointer-events: none;
        }

        .circuit-station-card {
          pointer-events: auto;
          position: relative;
          background: rgba(255, 253, 247, 0.94);
          border: 1px solid #c9c3b5;
          border-radius: 6px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          max-width: 320px;
          transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.22s ease-out, border-color 0.22s ease-out;
        }

        .station-top-left {
          justify-self: start;
          align-self: start;
        }
        .station-top-right {
          justify-self: end;
          align-self: start;
        }
        .station-bottom-left {
          justify-self: start;
          align-self: end;
        }
        .station-bottom-right {
          justify-self: end;
          align-self: end;
        }

        .circuit-station-card:hover,
        .circuit-station-card.active-station {
          transform: translateY(-4px);
          border-color: var(--signal, #f25e3b);
          box-shadow: 0 14px 30px rgba(183, 57, 33, 0.12);
        }

        .station-card-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .station-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .station-tag {
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--action, #b73921);
          font-weight: 700;
        }

        .station-code {
          font-size: 8px;
          padding: 2px 6px;
          background: #f0eae0;
          border-radius: 2px;
          color: #557262;
        }

        .station-title {
          font-size: 15px;
          font-weight: 750;
          letter-spacing: -0.03em;
          color: var(--ink, #082c26);
          line-height: 1.25;
          margin-bottom: 6px;
        }

        .station-desc {
          font-size: 12px;
          line-height: 1.5;
          color: var(--muted, #617267);
          margin-bottom: 12px;
          flex: 1;
        }

        .station-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid #e8e2d5;
        }

        .station-badge {
          font-size: 9px;
          color: #496455;
          letter-spacing: 0.05em;
        }

        .station-action-btn {
          font-size: 11px;
          font-weight: 700;
          color: var(--action, #b73921);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.18s ease-out;
        }

        .station-action-btn:hover {
          color: var(--signal, #f25e3b);
          text-decoration: underline;
        }

        .station-active-glow {
          position: absolute;
          inset: -1px;
          border: 2px solid var(--signal, #f25e3b);
          border-radius: 6px;
          pointer-events: none;
        }

        .circuit-detail-console {
          background: #082c26;
          color: #f7f3eb;
          padding: 24px 32px;
          border-top: 1px solid #134234;
        }

        .console-indicator {
          font-size: 10px;
          letter-spacing: 0.14em;
          color: var(--peach, #ffd2bd);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .console-divider {
          opacity: 0.5;
        }

        .console-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .console-heading {
          font-size: 22px;
          font-weight: 750;
          letter-spacing: -0.04em;
          margin: 0 0 6px 0;
          color: #ffffff;
        }

        .console-detail-desc {
          font-size: 13px;
          line-height: 1.6;
          color: #a8c6b7;
          margin: 0;
          max-width: 680px;
        }

        .mono-code {
          font-family: 'Courier New', monospace;
        }

        @media (max-width: 880px) {
          .circuit-stage-container {
            min-height: unset;
            padding: 30px 16px;
          }

          .circuit-bus-svg {
            display: none;
          }

          .circuit-central-core {
            position: static;
            margin-bottom: 24px;
            max-width: 100%;
            width: 100%;
          }

          .circuit-terminals-grid {
            position: static;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .circuit-station-card {
            max-width: 100%;
            width: 100%;
          }

          .console-body {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .console-cta-wrap .button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default ContributionNetwork;
