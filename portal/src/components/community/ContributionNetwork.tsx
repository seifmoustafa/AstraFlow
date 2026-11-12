'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CommunityBranchesSvg,
  HAIRLINE_IVORY_STYLE,
} from '@/components/motion/HairlineFigures';

export interface BranchNode {
  index: 0 | 1 | 2 | 3;
  className: string;
  tag: string;
  title: string;
  href: string;
  external: boolean;
}

const BRANCH_NODES: readonly BranchNode[] = [
  {
    index: 0,
    className: 'v10-branch-item v10-branch-one',
    tag: '01 / SOURCE',
    title: 'Read the code.',
    href: 'https://github.com/seifmoustafa/AstraFlow',
    external: true,
  },
  {
    index: 1,
    className: 'v10-branch-item v10-branch-two',
    tag: '02 / DISCUSS',
    title: 'Report an issue.',
    href: 'https://github.com/seifmoustafa/AstraFlow/issues',
    external: true,
  },
  {
    index: 2,
    className: 'v10-branch-item v10-branch-three',
    tag: '03 / CONTRIBUTE',
    title: 'Propose a change.',
    href: 'https://github.com/seifmoustafa/AstraFlow/pulls',
    external: true,
  },
  {
    index: 3,
    className: 'v10-branch-item v10-branch-four',
    tag: '04 / LEARN',
    title: 'Explore the docs.',
    href: '/docs',
    external: false,
  },
] as const;

export function ContributionNetwork() {
  const [hoveredBranch, setHoveredBranch] = useState<number | null>(null);
  const [focusedBranch, setFocusedBranch] = useState<number | null>(null);

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

  const activeBranch = hoveredBranch ?? focusedBranch;

  return (
    <div
      aria-label="Four ways to participate in AstraFlow"
      className="v10-community-branches v12-community-branches hairline-ivory"
      data-active-branch={activeBranch !== null ? String(activeBranch) : undefined}
      style={HAIRLINE_IVORY_STYLE}
    >
      <div className="v10-branch-heading">
        <span>FIGURE 03 / OPEN CONTRIBUTION</span>
        <span>EVERY PATH LEADS TO SOURCE</span>
      </div>
      <CommunityBranchesSvg />
      <div className="v10-branch-root">
        <img alt="" src="/brand/mark-on-light.svg" />
        <span>ASTRAFLOW / OPEN SOURCE</span>
        <strong>
          One source.
          <br />
          Four ways in.
        </strong>
      </div>
      {BRANCH_NODES.map((node) => {
        const interactionProps = {
          className: node.className,
          onMouseEnter: () => setHoveredBranch(node.index),
          onMouseLeave: () =>
            setHoveredBranch((prev) => (prev === node.index ? null : prev)),
          onFocus: () => setFocusedBranch(node.index),
          onBlur: () =>
            setFocusedBranch((prev) => (prev === node.index ? null : prev)),
        };

        const children = (
          <>
            <span>{node.tag}</span>
            <strong>{node.title}</strong>
            <i aria-hidden="true">↗</i>
          </>
        );

        if (node.external) {
          return (
            <a
              key={node.index}
              href={node.href}
              rel="noopener noreferrer"
              {...interactionProps}
            >
              {children}
            </a>
          );
        }

        return (
          <Link key={node.index} href={node.href} {...interactionProps}>
            {children}
          </Link>
        );
      })}
    </div>
  );
}

export default ContributionNetwork;
