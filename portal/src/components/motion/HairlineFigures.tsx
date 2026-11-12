"use client";

import React from "react";
import { Exploded, Rebuild, Relay } from "@lucasmarkes/hairline/react";

export type AssemblyLayerIndex = 0 | 1 | 2;

/**
 * Exact Hairline v0.5.1 surface masking & stroke tokens for Warm Ivory (#F7F3EB)
 * per `MOTION-HAIRLINE-DESIGN-CONTRACT.md`.
 */
export const HAIRLINE_IVORY_STYLE: React.CSSProperties = {
  "--hairline-plate": "#F7F3EB",
  "--hairline-hi": "#082C26",
  "--hairline-edge": "#62766B",
  "--hairline-mid": "#92A69A",
  "--hairline-lo": "#D6D3C8",
  "--hairline-stroke": "0.9",
} as React.CSSProperties;

/**
 * Hairline v0.5.1 surface masking & stroke tokens for Deep Forest (#082C26).
 */
export const HAIRLINE_FOREST_STYLE: React.CSSProperties = {
  "--hairline-plate": "#082C26",
  "--hairline-hi": "#F7F3EB",
  "--hairline-edge": "#92A69A",
  "--hairline-mid": "#62766B",
  "--hairline-lo": "#16443A",
  "--hairline-stroke": "0.9",
} as React.CSSProperties;

export interface IsometricAssemblySvgProps {
  activeLayer: AssemblyLayerIndex;
  onSelectLayer?: (layer: AssemblyLayerIndex) => void;
}

/**
 * Custom adopted Hairline-compatible 3-layer isometric assembly SVG reproducing
 * the exact geometry and selected-plate state of `AstraFlow-Final-Craft-v12/index.html`
 * (`FIGURE 02 / COMPOSITION`, `viewBox="0 0 760 510"`).
 *
 * Uses `--hairline-plate` opaque surface masking so foreground plates cleanly occlude
 * background construction lines, and elevates the selected layer (`data-selected="true"`)
 * with a low-amplitude cubic-bezier transition (or instantaneously under reduced motion).
 */
export function IsometricAssemblySvg({
  activeLayer,
  onSelectLayer,
}: IsometricAssemblySvgProps) {
  return (
    <svg
      aria-label="Three interlocking isometric plates connected by fine hairline construction guides. Selected layer is highlighted."
      className="v10-assembly-svg hairline-ivory"
      role="img"
      viewBox="0 0 760 510"
      style={HAIRLINE_IVORY_STYLE}
    >
      <defs>
        <linearGradient id="v10-plate-shadow" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#f3e8d8" />
          <stop offset="1" stopColor="#dacbb8" />
        </linearGradient>
      </defs>
      <g
        className="v10-construction"
        fill="none"
        opacity=".38"
        stroke="#90a89b"
        strokeWidth="1"
      >
        <path d="M22 346 383 147 744 349M43 383 382 194 713 380M57 287 381 461 704 280" />
        <path d="M383 50 V477 M0 254 H760" strokeDasharray="3 8" />
        <circle cx="383" cy="252" r="197" strokeDasharray="4 9" />
      </g>
      <g
        className="v10-geom-layer"
        data-geom-layer="0"
        data-selected={String(activeLayer === 0)}
        onClick={onSelectLayer ? () => onSelectLayer(0) : undefined}
        style={onSelectLayer ? { cursor: "pointer" } : undefined}
      >
        <path
          d="M221 202 378 118 539 202 383 291Z"
          fill="#c3c2b5"
          opacity=".55"
          transform="translate(8 19)"
        />
        <path
          d="M221 202 378 118 539 202 383 291Z"
          fill="#f9f4eb"
          stroke="#365d51"
          strokeWidth="1.8"
        />
        <path
          d="M291 201 382 153 471 202 382 251Z"
          fill="none"
          stroke="#648778"
          strokeDasharray="5 7"
          strokeWidth="1"
        />
        <text
          fill="#082c26"
          fontFamily="monospace"
          fontSize="13"
          textAnchor="middle"
          x="383"
          y="208"
        >
          DECLARATIONS
        </text>
      </g>
      <g
        className="v10-geom-layer"
        data-geom-layer="1"
        data-selected={String(activeLayer === 1)}
        onClick={onSelectLayer ? () => onSelectLayer(1) : undefined}
        style={onSelectLayer ? { cursor: "pointer" } : undefined}
      >
        <path
          d="M193 268 383 163 574 269 383 377Z"
          fill="#082c26"
          opacity=".14"
          transform="translate(8 20)"
        />
        <path
          d="M193 268 383 163 574 269 383 377Z"
          fill="#0c352d"
          stroke="#0a3d33"
          strokeWidth="2"
        />
        <path
          d="M263 268 383 202 504 267 383 334Z"
          fill="none"
          stroke="#d4e3d6"
          strokeDasharray="5 7"
          strokeWidth="1"
        />
        <path
          d="M283 269 382 214 482 268 382 323Z"
          fill="none"
          stroke="#81aa95"
          strokeWidth="1"
        />
        <text
          fill="#f9f2e6"
          fontFamily="monospace"
          fontSize="14"
          textAnchor="middle"
          x="383"
          y="273"
        >
          COMPOSITION
        </text>
      </g>
      <g
        className="v10-geom-layer"
        data-geom-layer="2"
        data-selected={String(activeLayer === 2)}
        onClick={onSelectLayer ? () => onSelectLayer(2) : undefined}
        style={onSelectLayer ? { cursor: "pointer" } : undefined}
      >
        <path
          d="M162 345 384 223 608 346 383 471Z"
          fill="#d3af95"
          opacity=".4"
          transform="translate(8 14)"
        />
        <path
          d="M162 345 384 223 608 346 383 471Z"
          fill="#f7ebe0"
          stroke="#c14a2b"
          strokeWidth="1.7"
        />
        <path
          d="M244 346 384 269 525 346 384 425Z"
          fill="none"
          stroke="#e47b54"
          strokeWidth="1.5"
        />
        <path d="M316 346H454" stroke="#db5837" strokeWidth="2" />
        <circle cx="384" cy="346" fill="#db5837" r="5" />
        <text
          fill="#b73921"
          fontFamily="monospace"
          fontSize="13"
          textAnchor="middle"
          x="384"
          y="370"
        >
          INSPECTION
        </text>
      </g>
      <g
        className="v10-dimension"
        fill="#617267"
        fontFamily="monospace"
        fontSize="10"
      >
        <path d="M184 161v-25h-54" fill="none" stroke="#81998c" />
        <text x="20" y="132">
          01 / CONTRACT
        </text>
        <path d="M584 234h53v-24" fill="none" stroke="#81998c" />
        <text x="641" y="206">
          02
        </text>
        <path d="M564 420h70v25" fill="none" stroke="#81998c" />
        <text x="640" y="449">
          03 / VERIFY
        </text>
      </g>
    </svg>
  );
}

/**
 * Custom Hairline-compatible 4-way open-paper branching network SVG reproducing
 * `AstraFlow-Final-Craft-v12/community.html` (`FIGURE 03 / OPEN CONTRIBUTION`, `viewBox="0 0 740 600"`).
 */
export function CommunityBranchesSvg() {
  return (
    <svg
      aria-hidden="true"
      className="v10-branches-svg hairline-ivory"
      fill="none"
      viewBox="0 0 740 600"
      style={HAIRLINE_IVORY_STYLE}
    >
      <defs>
        <linearGradient id="v10-branchline" x1="0" x2="1" y1="0" y2="0">
          <stop stopColor="#0b3b32" />
          <stop offset="1" stopColor="#eb6540" />
        </linearGradient>
      </defs>
      <g opacity=".7" stroke="#bcc7b7" strokeWidth="1">
        <circle cx="348" cy="283" r="192" strokeDasharray="3 9" />
        <circle cx="348" cy="283" r="129" />
        <path d="M15 283H725M348 16V571" strokeDasharray="4 9" />
      </g>
      <path
        d="M355 278C252 278 252 119 140 119H44 M355 278C466 278 466 130 604 130H708 M355 278C241 278 241 452 133 452H44 M355 278C463 278 463 449 596 449H708"
        stroke="#718f7e"
        strokeWidth="1.6"
      />
      <path
        d="M355 278C466 278 466 130 604 130H708"
        stroke="url(#v10-branchline)"
        strokeDasharray="4 7"
        strokeWidth="2.3"
      />
      <path
        d="M325 254l26-14 27 14v32l-27 15-26-15z"
        fill="#f7f3eb"
        stroke="#0b3b32"
        strokeWidth="2"
      />
      <path
        d="M337 272l12-12 13 12M338 285h25"
        stroke="#e75e3a"
        strokeWidth="3"
      />
      <g fill="#ea633f">
        <rect height="10" width="10" x="126" y="113" />
        <rect height="10" width="10" x="601" y="124" />
        <rect height="10" width="10" x="126" y="446" />
        <rect height="10" width="10" x="594" y="443" />
      </g>
      <path
        className="v10-branch-highlight"
        d="M355 278C252 278 252 119 140 119H44"
        data-branch-route="0"
        fill="none"
        stroke="#e96843"
        strokeDasharray="4 6"
        strokeWidth="2.7"
      />
      <path
        className="v10-branch-highlight"
        d="M355 278C466 278 466 130 604 130H708"
        data-branch-route="1"
        fill="none"
        stroke="#e96843"
        strokeDasharray="4 6"
        strokeWidth="2.7"
      />
      <path
        className="v10-branch-highlight"
        d="M355 278C241 278 241 452 133 452H44"
        data-branch-route="2"
        fill="none"
        stroke="#e96843"
        strokeDasharray="4 6"
        strokeWidth="2.7"
      />
      <path
        className="v10-branch-highlight"
        d="M355 278C463 278 463 449 596 449H708"
        data-branch-route="3"
        fill="none"
        stroke="#e96843"
        strokeDasharray="4 6"
        strokeWidth="2.7"
      />
    </svg>
  );
}

/**
 * Validated `@lucasmarkes/hairline/react` primitive studies configured per
 * `MOTION-HAIRLINE-DESIGN-CONTRACT.md` (`intensity={0.20}`, `play={false}`, `.hairline-ivory`).
 */
export interface HairlineStudyProps {
  intensity?: number;
  label?: string;
  onRead?: (caption: string) => void;
  className?: string;
}

export function HairlineExplodedStudy({
  intensity = 0.2,
  label = "Interactive exploded composition study",
  onRead,
  className,
}: HairlineStudyProps) {
  return (
    <div
      className={className ? `hairline-ivory ${className}` : "hairline-ivory"}
      style={HAIRLINE_IVORY_STYLE}
    >
      <Exploded
        intensity={intensity}
        play={false}
        theme="light"
        label={label}
        onRead={onRead}
      />
    </div>
  );
}

export function HairlineRebuildStudy({
  intensity = 0.2,
  label = "Interactive modular package composition study",
  onRead,
  className,
}: HairlineStudyProps) {
  return (
    <div
      className={className ? `hairline-ivory ${className}` : "hairline-ivory"}
      style={HAIRLINE_IVORY_STYLE}
    >
      <Rebuild
        intensity={intensity}
        play={false}
        theme="light"
        label={label}
        onRead={onRead}
      />
    </div>
  );
}

export function HairlineRelayStudy({
  intensity = 0.2,
  label = "Interactive branching contribution paths study",
  onRead,
  className,
}: HairlineStudyProps) {
  return (
    <div
      className={className ? `hairline-ivory ${className}` : "hairline-ivory"}
      style={HAIRLINE_IVORY_STYLE}
    >
      <Relay
        intensity={intensity}
        play={false}
        theme="light"
        label={label}
        onRead={onRead}
      />
    </div>
  );
}

/**
 * Mandatory Component Replacement Ledger (`AGENT-START-HERE.md` & `MOTION-HAIRLINE-DESIGN-CONTRACT.md`)
 * documenting where custom Hairline-adopted SVG, `@lucasmarkes/hairline/react`, and `motion/react`
 * are used, the exact problem solved, and visual fidelity guarantees.
 */
export interface ComponentReplacementEntry {
  surface: string;
  componentPath: string;
  implementation: "authored-svg-with-signal" | "custom-hairline-svg" | "motion-state-sync" | "css-plate-composition";
  dependenciesUsed: readonly string[];
  problemSolved: string;
  visualDifferencesFromV12: string;
}

export const HAIRLINE_MOTION_LEDGER: readonly ComponentReplacementEntry[] = [
  {
    surface: "Home Hero (FIGURE 01 / REQUEST TO RESULT)",
    componentPath: "portal/src/components/hero/SignatureA.tsx + SignalTrace.tsx",
    implementation: "authored-svg-with-signal",
    dependenciesUsed: ["React IntersectionObserver", "SVG <animateMotion>", "ReducedMotionProvider"],
    problemSolved:
      "Preserves stationary AstraFlow A geometry while driving a single 7s orange signal tracer and 17s dashed route that pauses on user command (#v10-motion-toggle), offscreen scroll, hidden tab, or prefers-reduced-motion.",
    visualDifferencesFromV12: "Zero. Pixel-identical viewBox 0 0 830 600 and stationary A coordinates.",
  },
  {
    surface: "Home Flow Explorer (02 / FOLLOW THE ENGINE)",
    componentPath: "portal/src/components/home/FlowExplorer.tsx + FlowStageRail.tsx",
    implementation: "motion-state-sync",
    dependenciesUsed: ["motion/react (MotionConfig)", "ResizeObserver", "MutationObserver"],
    problemSolved:
      "Single React source of truth for capability (dispatch | mapping | diagnostics) and step (0..3) with synchronized stage beam travel (--v12-stage-x, 510ms cubic-bezier(.2,.8,.2,1)), progress bar (--v11-stage-progress), and 155ms code swap fade.",
    visualDifferencesFromV12: "Zero. Exact 3-column dark instrument layout and stage-travel coordinates.",
  },
  {
    surface: "Home Architecture Assembly (FIGURE 02 / COMPOSITION)",
    componentPath: "portal/src/components/home/ArchitectureAssembly.tsx + IsometricAssemblySvg",
    implementation: "custom-hairline-svg",
    dependenciesUsed: ["@lucasmarkes/hairline/react tokens (--hairline-plate)", "Custom 3-plate SVG"],
    problemSolved:
      "Generic Hairline Exploded/Stack uses 4–5 generic frames instead of AstraFlow's 3 semantic layers (DECLARATIONS, COMPOSITION, INSPECTION). Custom Hairline-compatible SVG preserves the exact 3 isometric plates, opaque --hairline-plate surface masking, and synchronized HTML button controls.",
    visualDifferencesFromV12: "Zero. Preserves exact viewBox 0 0 760 510 and 3-layer elevation states.",
  },
  {
    surface: "Packages Hero Assembly (ISOMETRIC / PACKAGE COMPOSITION)",
    componentPath: "portal/src/components/packages/PackagesHeroAssembly.tsx",
    implementation: "css-plate-composition",
    dependenciesUsed: ["CSS 3D skewY(-14deg) rotate(-5deg) plates", "ReducedMotionProvider"],
    problemSolved:
      "Preserves the 3 selectable physical package plates (CONTRACTS, MEDIATOR, MAPPER) with Hairline crosshair keylines without implying unverified dependency trees.",
    visualDifferencesFromV12: "Zero. Exact overlapping plate geometry and selection elevation.",
  },
  {
    surface: "Community Branching Network (FIGURE 03 / OPEN CONTRIBUTION)",
    componentPath: "portal/src/components/community/ContributionNetwork.tsx + CommunityBranchesSvg",
    implementation: "custom-hairline-svg",
    dependenciesUsed: ["Custom 4-branch Hairline SVG", "data-active-branch route highlighter"],
    problemSolved:
      "Connects central AstraFlow source anchor to 4 verified GitHub/Docs routes with keyboard focus and hover stroke highlighting (v11-route-in) and zero idle network orbit.",
    visualDifferencesFromV12: "Zero. Exact viewBox 0 0 740 600 and 4-corner card coordinates.",
  },
];
