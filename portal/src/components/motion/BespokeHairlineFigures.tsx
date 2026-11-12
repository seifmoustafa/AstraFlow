"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { HAIRLINE_IVORY_STYLE } from "./HairlineFigures";
import { useReducedMotionContext } from "./ReducedMotionProvider";

export type BespokeStudyId =
  | "astraflow-route"
  | "astraflow-assembly"
  | "astraflow-branchwork"
  | "astraflow-version-spine";

export interface BespokeStudyMetadata {
  id: BespokeStudyId;
  name: string;
  title: string;
  metaphor: string;
  means: string;
  rules: readonly number[];
  range: readonly [number, number, number];
  artifactUrl: string;
  readoutRest: string;
  readoutLabels: readonly string[];
  pointerBehavior: string;
  reducedMotionBehavior: string;
  recommendedSurface: string;
}

export const BESPOKE_HAIRLINE_MANIFEST: Record<BespokeStudyId, BespokeStudyMetadata> = {
  "astraflow-route": {
    id: "astraflow-route",
    name: "astraflow-route",
    title: "The Calibrated Pipeline Conduit",
    metaphor:
      "A precision-engineered longitudinal plinth carrying four discrete pipeline stations (Request, Behavior, Handler, Result) and an active signal carriage running on a central conduit rail.",
    means:
      "A structural rail carrying four pipeline stages: request, behavior, handler and result, illuminated as the signal advances.",
    rules: [1, 2, 4, 8, 10],
    range: [20, 45, 75],
    artifactUrl: "/hairline-studies/hairline-astraflow-route.html",
    readoutRest: "rest",
    readoutLabels: ["request", "behavior", "handler", "result"],
    pointerBehavior:
      "Moving pointer along the conduit picks the station; the carriage glides to its center, the station elevates on an interruptible spring, and the silhouette lights up with 'hi'.",
    reducedMotionBehavior:
      "All elevations and shuttle translations resolve instantaneously (0ms); resting station 0 remains distinct.",
    recommendedSurface: "Home Flow Observatory / Design Lab Alternative A",
  },
  "astraflow-assembly": {
    id: "astraflow-assembly",
    name: "astraflow-assembly",
    title: "The Interlocking Architectural Assembly",
    metaphor:
      "Three independent semantic plates (Contracts, Composition, Inspection) aligned along a common vertical optical axis with registration guide pins.",
    means:
      "Three interlocking architectural plates: contracts, composition and inspection dock on an aligned axis as selection shifts.",
    rules: [1, 3, 5, 8, 9],
    range: [12, 26, 42],
    artifactUrl: "/hairline-studies/hairline-astraflow-assembly.html",
    readoutRest: "rest",
    readoutLabels: ["declarations", "composition", "inspection"],
    pointerBehavior:
      "Hovering or clicking a plate elevates it vertically by the gap distance while neighbouring plates settle; guide pins align and the active plate illuminates with 'hi'.",
    reducedMotionBehavior:
      "Plate elevation is instantaneous without spring oscillation; clear figure/ground contrast maintained.",
    recommendedSurface: "Home 'Every Piece Has a Purpose' / Packages Hero Alternative B",
  },
  "astraflow-branchwork": {
    id: "astraflow-branchwork",
    name: "astraflow-branchwork",
    title: "The Open Contribution Circuit",
    metaphor:
      "A central repository core hub that routes four physical conduits out to Source, Issues, Reviews, and Documentation stations.",
    means:
      "A central repository hub extending four open contribution paths to source, issues, reviews and documentation.",
    rules: [1, 2, 4, 8, 10],
    range: [20, 50, 90],
    artifactUrl: "/hairline-studies/hairline-astraflow-branchwork.html",
    readoutRest: "rest",
    readoutLabels: ["source", "issues", "reviews", "docs"],
    pointerBehavior:
      "Pointer proximity to a satellite station pad elevates that station, highlights its connecting conduit, and routes an active signal bead from the hub.",
    reducedMotionBehavior:
      "Station elevation and route highlight occur without transit delays; calm idle state at rest.",
    recommendedSurface: "Community Hero / Contribution Circuit",
  },
  "astraflow-version-spine": {
    id: "astraflow-version-spine",
    name: "astraflow-version-spine",
    title: "The Mechanical Version Folio",
    metaphor:
      "A chronological index folio bound along a rigid left spine; selecting a release pulls its plate forward from the stack, allowing tactile inspection.",
    means:
      "A mechanical archive of chronological release plates bound along a rigid spine, pulling forward on focus.",
    rules: [1, 2, 4, 8, 10],
    range: [10, 22, 36],
    artifactUrl: "/hairline-studies/hairline-astraflow-version-spine.html",
    readoutRest: "rest",
    readoutLabels: ["v2.4", "v2.3", "v2.2", "v2.1", "v2.0"],
    pointerBehavior:
      "Moving across sheets pulls the target sheet forward along the spine with staggered displacement of adjacent sheets; tab indicator illuminates.",
    reducedMotionBehavior:
      "Selected sheet shifts forward immediately with no stagger loop.",
    recommendedSurface: "Changelog Archive Hero / Design Lab",
  },
};

export interface BespokeHairlineFrameProps {
  studyId: BespokeStudyId;
  height?: number | string;
  showControls?: boolean;
  className?: string;
  caption?: string;
}

/**
 * High-fidelity client container embedding the standalone, validated
 * Hairline HTML engine artifact with accessible controls and live telemetry.
 */
export function BespokeHairlineFrame({
  studyId,
  height = 360,
  showControls = true,
  className = "",
  caption,
}: BespokeHairlineFrameProps) {
  const meta = BESPOKE_HAIRLINE_MANIFEST[studyId];
  const { prefersReducedMotion } = useReducedMotionContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [intensity, setIntensity] = useState(0.5);
  const [readout, setReadout] = useState(meta.readoutRest);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        try {
          const btn = iframe.contentDocument?.querySelector<HTMLButtonElement>(
            '[data-hairline-play], button.play',
          );
          btn?.click();
        } catch {
          // Cross-origin fallback
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === "object" && "hairlineReadout" in event.data) {
        setReadout(String(event.data.hairlineReadout));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div
      className={`bespoke-hairline-card hairline-ivory ${className}`}
      data-study-id={studyId}
      style={{
        ...HAIRLINE_IVORY_STYLE,
        position: "relative",
        background: "var(--hairline-plate, #f7f3eb)",
        border: "1px solid var(--hairline-edge, #667c70)",
        borderRadius: "6px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Engineering Header */}
      <div
        className="hairline-frame-head"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 14px",
          borderBottom: "1px solid var(--hairline-edge, #667c70)",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "11px",
          color: "var(--hairline-hi, #082c26)",
          background: "rgba(8, 44, 38, 0.04)",
        }}
      >
        <span style={{ fontWeight: 700, letterSpacing: "0.08em" }}>
          HAIRLINE / {studyId.toUpperCase()}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            aria-live="polite"
            style={{
              color: "var(--signal, #f25e3b)",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {readout}
          </span>
          {showControls && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause tour" : "Play tour"}
              style={{
                background: isPlaying ? "var(--hairline-hi, #082c26)" : "transparent",
                color: isPlaying ? "#f7f3eb" : "var(--hairline-hi, #082c26)",
                border: "1px solid var(--hairline-edge, #667c70)",
                borderRadius: "3px",
                padding: "2px 8px",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "10px",
                cursor: "pointer",
              }}
            >
              {isPlaying ? "PAUSE" : "TOUR ▷"}
            </button>
          )}
        </div>
      </div>

      {/* Embedded Validated Hairline HTML Engine */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: typeof height === "number" ? `${height}px` : height,
          background: "var(--hairline-plate, #f7f3eb)",
        }}
      >
        <iframe
          ref={iframeRef}
          src={meta.artifactUrl}
          title={meta.title}
          style={{
            width: "100%",
            height: "100%",
            border: 0,
            display: "block",
            background: "transparent",
          }}
          loading="lazy"
        />
      </div>

      {/* Bottom Metaphor & Technical Readout */}
      <div
        style={{
          padding: "8px 14px",
          borderTop: "1px solid var(--hairline-edge, #667c70)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          fontSize: "10px",
          color: "var(--hairline-edge, #667c70)",
          fontFamily: "var(--font-mono, monospace)",
        }}
      >
        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {caption ?? meta.means}
        </span>
        <a
          href={meta.artifactUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--signal, #f25e3b)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          ARTIFACT ↗
        </a>
      </div>
    </div>
  );
}

/**
 * Dedicated component for Study 1: astraflow-route
 */
export function AstraflowRouteStudy(props: Omit<BespokeHairlineFrameProps, "studyId">) {
  return <BespokeHairlineFrame studyId="astraflow-route" {...props} />;
}

/**
 * Dedicated component for Study 2: astraflow-assembly
 */
export function AstraflowAssemblyStudy(props: Omit<BespokeHairlineFrameProps, "studyId">) {
  return <BespokeHairlineFrame studyId="astraflow-assembly" {...props} />;
}

/**
 * Dedicated component for Study 3: astraflow-branchwork
 */
export function AstraflowBranchworkStudy(props: Omit<BespokeHairlineFrameProps, "studyId">) {
  return <BespokeHairlineFrame studyId="astraflow-branchwork" {...props} />;
}

/**
 * Dedicated component for Study 4: astraflow-version-spine
 */
export function AstraflowVersionSpineStudy(props: Omit<BespokeHairlineFrameProps, "studyId">) {
  return <BespokeHairlineFrame studyId="astraflow-version-spine" {...props} />;
}
