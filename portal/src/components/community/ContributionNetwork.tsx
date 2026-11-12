'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { HAIRLINE_IVORY_STYLE } from '@/components/motion/HairlineFigures';
import { useReducedMotionContext } from '@/components/motion/ReducedMotionProvider';

export type BranchIndex = 0 | 1 | 2 | 3;

export interface BranchNode {
  index: BranchIndex;
  className: string;
  tag: string;
  title: string;
  readout: string;
  href: string;
  external: boolean;
  pathD: string;
  waypointX: number;
  waypointY: number;
}

export const COMMUNITY_BRANCH_NODES: readonly BranchNode[] = [
  {
    index: 0,
    className: 'v10-branch-item v10-branch-one',
    tag: '01 / SOURCE',
    title: 'Read the code.',
    readout: '01 / SOURCE → GITHUB REPOSITORY',
    href: 'https://github.com/seifmoustafa/AstraFlow',
    external: true,
    pathD: 'M355 278C252 278 252 119 140 119H44',
    waypointX: 126,
    waypointY: 113,
  },
  {
    index: 1,
    className: 'v10-branch-item v10-branch-two',
    tag: '02 / DISCUSS',
    title: 'Report an issue.',
    readout: '02 / DISCUSS → GITHUB ISSUES',
    href: 'https://github.com/seifmoustafa/AstraFlow/issues',
    external: true,
    pathD: 'M355 278C466 278 466 130 604 130H708',
    waypointX: 601,
    waypointY: 124,
  },
  {
    index: 2,
    className: 'v10-branch-item v10-branch-three',
    tag: '03 / CONTRIBUTE',
    title: 'Propose a change.',
    readout: '03 / CONTRIBUTE → PULL REQUESTS',
    href: 'https://github.com/seifmoustafa/AstraFlow/pulls',
    external: true,
    pathD: 'M355 278C241 278 241 452 133 452H44',
    waypointX: 126,
    waypointY: 446,
  },
  {
    index: 3,
    className: 'v10-branch-item v10-branch-four',
    tag: '04 / LEARN',
    title: 'Explore the docs.',
    readout: '04 / LEARN → 61 DOCS GUIDES',
    href: '/docs',
    external: false,
    pathD: 'M355 278C463 278 463 449 596 449H708',
    waypointX: 594,
    waypointY: 443,
  },
] as const;

const TRACE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ContributionNetwork() {
  const { prefersReducedMotion } = useReducedMotionContext();
  const [hoveredBranch, setHoveredBranch] = useState<BranchIndex | null>(null);
  const [focusedBranch, setFocusedBranch] = useState<BranchIndex | null>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([
    null,
    null,
    null,
    null,
  ]);

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

  const activeBranch: BranchIndex | null = hoveredBranch ?? focusedBranch;
  const activeNode =
    activeBranch !== null ? COMMUNITY_BRANCH_NODES[activeBranch] : null;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLAnchorElement>, currentIndex: BranchIndex) => {
      let nextIndex: BranchIndex | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (((currentIndex + 1) % 4) as BranchIndex);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (((currentIndex + 3) % 4) as BranchIndex);
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = 3;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        const target = linkRefs.current[nextIndex];
        target?.focus();
      }
    },
    [],
  );

  return (
    <div
      aria-label="Four ways to participate in AstraFlow"
      className="v10-community-branches v12-community-branches hairline-ivory"
      data-active-branch={activeBranch !== null ? String(activeBranch) : undefined}
      style={HAIRLINE_IVORY_STYLE}
    >
      <div className="v10-branch-heading">
        <span>FIGURE 03 / OPEN CONTRIBUTION</span>
        <span id="community-route-readout" aria-live="polite">
          {activeNode ? activeNode.readout : 'EVERY PATH LEADS TO SOURCE'}
        </span>
      </div>

      <svg
        aria-hidden="true"
        className="v10-branches-svg hairline-ivory"
        fill="none"
        viewBox="0 0 740 600"
        style={{ ...HAIRLINE_IVORY_STYLE, pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id="v10-branchline" x1="0" x2="1" y1="0" y2="0">
            <stop stopColor="#0b3b32" />
            <stop offset="1" stopColor="#eb6540" />
          </linearGradient>
        </defs>

        {/* Fine Hairline coordinate rings & axes */}
        <g opacity=".7" stroke="#bcc7b7" strokeWidth="1">
          <circle cx="348" cy="283" r="192" strokeDasharray="3 9" />
          <circle cx="348" cy="283" r="129" />
          <path d="M15 283H725M348 16V571" strokeDasharray="4 9" />
        </g>

        {/* Base four branch connectors: calm at rest, non-selected routes recede when one is focused/hovered */}
        {COMMUNITY_BRANCH_NODES.map((node) => {
          const isSelected = activeBranch === node.index;
          const baseOpacity =
            activeBranch === null ? 1 : isSelected ? 1 : 0.38;
          return (
            <path
              key={`base-${node.index}`}
              d={node.pathD}
              stroke="#718f7e"
              strokeWidth="1.6"
              style={{
                opacity: baseOpacity,
                transition: prefersReducedMotion
                  ? 'none'
                  : 'opacity 180ms ease-out',
              }}
            />
          );
        })}

        {/* Signature gradient dashed lead on branch 02 */}
        <path
          d="M355 278C466 278 466 130 604 130H708"
          stroke="url(#v10-branchline)"
          strokeDasharray="4 7"
          strokeWidth="2.3"
          style={{
            opacity:
              activeBranch === null || activeBranch === 1 ? 1 : 0.35,
            transition: prefersReducedMotion
              ? 'none'
              : 'opacity 180ms ease-out',
          }}
        />

        {/* Interruptible Motion continuous route tracer from central AstraFlow hub to active destination */}
        {COMMUNITY_BRANCH_NODES.map((node) => {
          const isSelected = activeBranch === node.index;
          return (
            <motion.path
              key={`motion-trace-${node.index}`}
              className="v12-branch-motion-trace"
              d={node.pathD}
              data-branch-motion-route={String(node.index)}
              fill="none"
              stroke="#e96843"
              strokeLinecap="round"
              strokeWidth="2.4"
              initial={false}
              animate={{
                pathLength: isSelected ? 1 : 0,
                opacity: isSelected ? 0.92 : 0,
              }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      pathLength: { duration: 0.36, ease: TRACE_EASE },
                      opacity: { duration: 0.16, ease: 'easeOut' },
                    }
              }
            />
          );
        })}

        {/* Dashed highlight paths matching v12 CSS `[data-branch-route]` contract */}
        {COMMUNITY_BRANCH_NODES.map((node) => (
          <path
            key={`highlight-${node.index}`}
            className="v10-branch-highlight"
            d={node.pathD}
            data-branch-route={String(node.index)}
            fill="none"
            stroke="#e96843"
            strokeDasharray="4 6"
            strokeWidth="2.7"
          />
        ))}

        {/* Central hexagonal source anchor with Hairline surface masking (--hairline-plate) */}
        <path
          d="M325 254l26-14 27 14v32l-27 15-26-15z"
          data-source-hub="true"
          fill="#f7f3eb"
          stroke={activeBranch !== null ? '#e96843' : '#0b3b32'}
          strokeWidth="2"
          style={{
            transition: prefersReducedMotion
              ? 'none'
              : 'stroke 180ms ease-out',
          }}
        />
        <path
          d="M337 272l12-12 13 12M338 285h25"
          stroke="#e75e3a"
          strokeWidth="3"
        />

        {/* Waypoint anchor squares + active target frames */}
        <g fill="#ea633f">
          {COMMUNITY_BRANCH_NODES.map((node) => {
            const isSelected = activeBranch === node.index;
            return (
              <g
                key={`waypoint-${node.index}`}
                data-branch-waypoint={String(node.index)}
                data-active={String(isSelected)}
              >
                <rect
                  height="10"
                  width="10"
                  x={node.waypointX}
                  y={node.waypointY}
                />
                <rect
                  fill="none"
                  height="18"
                  stroke="#b73921"
                  strokeWidth="1.4"
                  width="18"
                  x={node.waypointX - 4}
                  y={node.waypointY - 4}
                  style={{
                    opacity: isSelected ? 1 : 0,
                    transform: isSelected ? 'scale(1)' : 'scale(0.82)',
                    transformOrigin: `${node.waypointX + 5}px ${node.waypointY + 5}px`,
                    transition: prefersReducedMotion
                      ? 'none'
                      : 'opacity 180ms ease-out, transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      <div
        className="v10-branch-root"
        data-active-route={activeBranch !== null ? String(activeBranch) : undefined}
      >
        <img alt="" src="/brand/mark-on-light.svg" />
        <span>ASTRAFLOW / OPEN SOURCE</span>
        <strong>
          One source.
          <br />
          Four ways in.
        </strong>
      </div>

      {COMMUNITY_BRANCH_NODES.map((node) => {
        const isSelected = activeBranch === node.index;
        const isDimmed = activeBranch !== null && !isSelected;

        const interactionProps = {
          className: node.className,
          'data-branch-index': String(node.index),
          'data-active': String(isSelected),
          onMouseEnter: () => setHoveredBranch(node.index),
          onMouseLeave: () =>
            setHoveredBranch((prev) => (prev === node.index ? null : prev)),
          onFocus: () => setFocusedBranch(node.index),
          onBlur: () =>
            setFocusedBranch((prev) => (prev === node.index ? null : prev)),
          onKeyDown: (e: React.KeyboardEvent<HTMLAnchorElement>) =>
            handleKeyDown(e, node.index),
          style: {
            borderColor: isSelected ? '#f25e3b' : undefined,
            boxShadow: isSelected
              ? '0 14px 27px rgba(184, 64, 30, 0.12)'
              : undefined,
            opacity: isDimmed ? 0.78 : 1,
          } as React.CSSProperties,
        };

        const children = (
          <>
            {isSelected && (
              <motion.span
                layoutId="community-active-branch-keyline"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  insetInlineStart: 0,
                  insetInlineEnd: 0,
                  insetBlockStart: 0,
                  height: '2px',
                  background: '#f25e3b',
                  borderRadius: '4px 4px 0 0',
                  pointerEvents: 'none',
                }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.24, ease: TRACE_EASE }
                }
              />
            )}
            <span>{node.tag}</span>
            <strong>{node.title}</strong>
            <i
              aria-hidden="true"
              style={{
                transform: isSelected ? 'translate(2px, -2px)' : undefined,
                transition: prefersReducedMotion
                  ? 'none'
                  : 'transform 160ms ease-out',
              }}
            >
              ↗
            </i>
          </>
        );

        if (node.external) {
          return (
            <a
              key={node.index}
              ref={(el) => {
                linkRefs.current[node.index] = el;
              }}
              href={node.href}
              target="_blank"
              rel="noopener noreferrer"
              {...interactionProps}
            >
              {children}
            </a>
          );
        }

        return (
          <Link
            key={node.index}
            ref={(el) => {
              linkRefs.current[node.index] = el;
            }}
            href={node.href}
            {...interactionProps}
          >
            {children}
          </Link>
        );
      })}
    </div>
  );
}

export default ContributionNetwork;
