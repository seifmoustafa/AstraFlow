"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { HAIRLINE_IVORY_STYLE } from "@/components/motion/HairlineFigures";

export type LayerIndex = 0 | 1 | 2;

export interface ArchitecturalTier {
  index: LayerIndex;
  code: string;
  stratumCode: string;
  title: string;
  subtitle: string;
  role: string;
  description: string;
  apiTokens: string[];
  chassisColor: string;
  strokeColor: string;
  pinCount: number;
}

export const ARCHITECTURAL_TIERS: readonly ArchitecturalTier[] = [
  {
    index: 0,
    code: "01 / CONTRACT",
    stratumCode: "DECLARATION TIER",
    title: "Declare intent",
    subtitle: "Typed requests and contracts",
    role: "Contract Socket",
    description:
      "Typed requests declare intent without hiding the contract behind infrastructure. Zero dependency on mediator or mapping implementation.",
    apiTokens: ["IRequest<TResponse>", "INotification", "IStreamRequest<T>"],
    chassisColor: "#eee0d1",
    strokeColor: "#365d51",
    pinCount: 8,
  },
  {
    index: 1,
    code: "02 / EXECUTION",
    stratumCode: "COMPOSITION TIER",
    title: "Compose behavior",
    subtitle: "Handlers, pipelines and mappings",
    role: "Execution Matrix",
    description:
      "Handlers, pipeline behaviors, and explicit mapping rules are distinct, opt-in responsibilities that bind cleanly to contracts.",
    apiTokens: ["IMediator", "IPipelineBehavior<TReq, TRes>", "IObjectMapper"],
    chassisColor: "#082c26",
    strokeColor: "#81aa95",
    pinCount: 16,
  },
  {
    index: 2,
    code: "03 / VERIFY",
    stratumCode: "INSPECTION TIER",
    title: "Verify decisions",
    subtitle: "Diagnostics and test workflows",
    role: "Verification Gateway",
    description:
      "Use diagnostics, analyzers, and testing helpers to inspect registered relationships, detect circular dependencies, and validate safety.",
    apiTokens: ["IAstraFlowDiagnosticsReporter", "AssertionScope", "AstraFlowDiagnosticReport"],
    chassisColor: "#f7ebe0",
    strokeColor: "#c14a2b",
    pinCount: 12,
  },
];

/**
 * Radical Rebuild: Bespoke Architectural Assembly Instrument
 * Replaces the generic stacked rhombus SVG with an open-frame, multi-tier docking
 * instrument where Declarations, Composition, and Inspection physically dock/undock
 * with mechanical latches, contact pins, and inter-tier bus conduits.
 */
export function ArchitectureAssembly() {
  const [activeLayer, setActiveLayer] = useState<LayerIndex>(1);
  const [hoveredLayer, setHoveredLayer] = useState<LayerIndex | null>(null);
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const activeTier = ARCHITECTURAL_TIERS[activeLayer];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMouseOffset({ x: x * 6, y: y * 6 });
    },
    [prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 });
    setHoveredLayer(null);
  }, []);

  const handleControlKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: LayerIndex
  ) => {
    let nextIndex: LayerIndex | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = ((currentIndex + 1) % 3) as LayerIndex;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = ((currentIndex + 2) % 3) as LayerIndex;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = 2;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      setActiveLayer(nextIndex);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  const spring = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 340, damping: 28, mass: 0.8 };

  return (
    <section
      aria-labelledby="v10-assembly-title"
      className="v10-assembly v12-assembly bespoke-assembly-instrument"
      id="composition"
    >
      <div className="site-wrap v10-assembly-head">
        <div>
          <p className="eyebrow">03 / ENGINEERED TO CONNECT</p>
          <h2 id="v10-assembly-title">
            Every piece
            <br />
            <span className="v10-ital">has a purpose.</span>
          </h2>
        </div>
        <p>
          Not a monolithic framework. Clearly separated responsibilities you can
          compose deliberately. Explore how each layer docks into the architectural whole.
        </p>
      </div>

      <div className="site-wrap v10-assembly-layout" style={{ marginTop: "36px" }}>
        {/* Left: Interactive Layer Selectors */}
        <div
          aria-label="Architecture layers"
          className="v10-assembly-controls"
          role="group"
        >
          {ARCHITECTURAL_TIERS.map((tier) => {
            const isActive = activeLayer === tier.index;
            return (
              <button
                key={tier.index}
                ref={(el) => {
                  buttonRefs.current[tier.index] = el;
                }}
                aria-pressed={isActive}
                className="v10-layer-control"
                data-layer={String(tier.index)}
                data-active={isActive ? "true" : "false"}
                type="button"
                onClick={() => setActiveLayer(tier.index)}
                onMouseEnter={() => setHoveredLayer(tier.index)}
                onMouseLeave={() =>
                  setHoveredLayer((prev) => (prev === tier.index ? null : prev))
                }
                onFocus={() => setHoveredLayer(tier.index)}
                onBlur={() =>
                  setHoveredLayer((prev) => (prev === tier.index ? null : prev))
                }
                onKeyDown={(e) => handleControlKeyDown(e, tier.index)}
                style={{ position: "relative" }}
              >
                {isActive && (
                  <motion.span
                    aria-hidden="true"
                    className="v12-assembly-active-bar"
                    layoutId="assembly-active-layer-bar"
                    transition={spring}
                    style={{
                      position: "absolute",
                      insetBlock: 0,
                      insetInlineStart: 0,
                      width: "3px",
                      background: "var(--signal)",
                      pointerEvents: "none",
                    }}
                  />
                )}
                <span>{tier.code}</span>
                <strong>{tier.title}</strong>
                <small>{tier.subtitle}</small>
                <b aria-hidden="true">↗</b>
              </button>
            );
          })}
        </div>

        {/* Right: Bespoke Architectural Docking Instrument */}
        <div
          ref={containerRef}
          aria-label="Bespoke architectural docking instrument showing interlocking architectural strata"
          className="v10-assembly-figure hairline-ivory"
          data-active-layer={String(activeLayer)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            ...HAIRLINE_IVORY_STYLE,
            border: "1px solid var(--line)",
            borderRadius: "8px",
            background: "var(--paper2)",
            padding: "24px 20px 20px",
            boxShadow: "var(--shadow)",
            position: "relative",
          }}
        >
          {/* Instrument HUD Header */}
          <div
            className="v10-figure-top mono"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid var(--line)",
              fontSize: "10px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--signal)",
                  boxShadow: "0 0 6px rgba(242, 94, 59, 0.4)",
                }}
              />
              FIGURE 02 // ARCHITECTURAL DOCKING INSTRUMENT
            </span>
            <span style={{ color: "var(--action)", fontWeight: "bold" }}>
              FOCAL PLANE: {activeTier.stratumCode}
            </span>
          </div>

          {/* Precision Docking Chassis Graphic */}
          <div style={{ position: "relative", height: "320px", overflow: "visible" }}>
            <svg
              className="v10-assembly-svg"
              viewBox="0 0 720 320"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                overflow: "visible",
              }}
            >
              {/* Central structural bus backbone */}
              <g stroke="#90a89b" strokeWidth="1" opacity="0.38" fill="none">
                <line x1="360" y1="20" x2="360" y2="300" strokeDasharray="3 6" strokeWidth="1.5" />
                <line x1="80" y1="60" x2="640" y2="60" strokeDasharray="2 4" />
                <line x1="80" y1="160" x2="640" y2="160" strokeDasharray="2 4" />
                <line x1="80" y1="260" x2="640" y2="260" strokeDasharray="2 4" />
              </g>

              {/* Dynamic Inter-Tier Contact Conduits */}
              <g fill="none" strokeWidth="2">
                <motion.line
                  x1="360"
                  y1="90"
                  x2="360"
                  y2="135"
                  stroke="#f25e3b"
                  strokeDasharray="3 4"
                  initial={false}
                  animate={{
                    opacity: activeLayer === 0 || activeLayer === 1 ? 0.9 : 0.25,
                    strokeWidth: activeLayer === 0 || activeLayer === 1 ? 2.2 : 1,
                  }}
                  transition={spring}
                />
                <motion.line
                  x1="360"
                  y1="185"
                  x2="360"
                  y2="235"
                  stroke="#f25e3b"
                  strokeDasharray="3 4"
                  initial={false}
                  animate={{
                    opacity: activeLayer === 1 || activeLayer === 2 ? 0.9 : 0.25,
                    strokeWidth: activeLayer === 1 || activeLayer === 2 ? 2.2 : 1,
                  }}
                  transition={spring}
                />
                <motion.circle
                  cx="360"
                  initial={false}
                  animate={{
                    cy: activeLayer === 0 ? 60 : activeLayer === 1 ? 160 : 260,
                  }}
                  transition={spring}
                  r="5"
                  fill="#f7f3eb"
                  stroke="#f25e3b"
                  strokeWidth="2.5"
                />
              </g>

              {/* 3 Physical Architectural Tier Trays */}
              {ARCHITECTURAL_TIERS.map((tier) => {
                const isSelected = activeLayer === tier.index;
                const isHovered = hoveredLayer === tier.index;
                const baseY = 30 + tier.index * 100;
                const targetY = isSelected ? baseY - 8 : baseY;

                return (
                  <motion.g
                    key={tier.index}
                    className="v10-geom-layer architectural-tier-plate"
                    data-geom-layer={String(tier.index)}
                    data-selected={String(isSelected)}
                    initial={false}
                    animate={{
                      y: targetY + mouseOffset.y * (tier.index === 1 ? 0.8 : 0.4),
                      x: mouseOffset.x * (tier.index === 1 ? 0.6 : 0.3),
                      opacity: isSelected ? 1 : isHovered ? 0.85 : 0.55,
                    }}
                    transition={spring}
                    onClick={() => setActiveLayer(tier.index)}
                    onMouseEnter={() => setHoveredLayer(tier.index)}
                    onMouseLeave={() => setHoveredLayer(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Shadow plate */}
                    <rect
                      x="100"
                      y="0"
                      width="520"
                      height="64"
                      rx="6"
                      fill="#082c26"
                      opacity={isSelected ? 0.14 : 0.06}
                      transform="translate(4, 7)"
                    />

                    {/* Main Tray Body */}
                    <rect
                      x="100"
                      y="0"
                      width="520"
                      height="64"
                      rx="6"
                      fill={tier.chassisColor}
                      stroke={isSelected ? "#f25e3b" : tier.strokeColor}
                      strokeWidth={isSelected ? "2.2" : "1.2"}
                    />

                    {/* Inner Technical Keyline */}
                    <rect
                      x="106"
                      y="6"
                      width="508"
                      height="52"
                      rx="4"
                      fill="none"
                      stroke={isSelected ? "#f25e3b" : "#90a89b"}
                      strokeDasharray="4 5"
                      strokeWidth="0.8"
                      opacity={isSelected ? 0.8 : 0.4}
                    />

                    {/* Stratum Tag & Title */}
                    <text
                      x="122"
                      y="24"
                      fill={tier.index === 1 && isSelected ? "#aad1c0" : "#b73921"}
                      fontFamily="monospace"
                      fontSize="9.5"
                      fontWeight="700"
                      letterSpacing="0.08em"
                    >
                      {tier.stratumCode}
                    </text>
                    <text
                      x="122"
                      y="44"
                      fill={tier.index === 1 && isSelected ? "#fffdf7" : "#082c26"}
                      fontFamily="Arial, sans-serif"
                      fontSize="14"
                      fontWeight="750"
                      letterSpacing="-0.02em"
                    >
                      {tier.title}
                    </text>

                    {/* Right Latch Indicator */}
                    <rect
                      x="490"
                      y="16"
                      width="112"
                      height="32"
                      rx="4"
                      fill={isSelected ? "rgba(242, 94, 59, 0.15)" : "rgba(8, 44, 38, 0.06)"}
                      stroke={isSelected ? "#f25e3b" : "#90a89b"}
                      strokeWidth="1"
                    />
                    <text
                      x="546"
                      y="36"
                      textAnchor="middle"
                      fill={isSelected ? "#b73921" : "#617267"}
                      fontFamily="monospace"
                      fontSize="9"
                      fontWeight="700"
                    >
                      {isSelected ? "DOCKED ✓" : "+ FOCUS"}
                    </text>

                    {/* Mechanical Contact Pins along tray edge */}
                    <g opacity={isSelected ? 0.9 : 0.4}>
                      {Array.from({ length: 12 }).map((_, p) => (
                        <rect
                          key={p}
                          x={260 + p * 18}
                          y="58"
                          width="10"
                          height="4"
                          rx="1"
                          fill={isSelected ? "#e98a66" : "#b0a89b"}
                        />
                      ))}
                    </g>
                  </motion.g>
                );
              })}
            </svg>
          </div>

          {/* Synchronized Detail Readout Plane */}
          <div
            className="v10-figure-foot"
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "24px",
            }}
          >
            <div>
              <span
                id="v10-layer-label"
                style={{
                  display: "block",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--action)",
                  marginBottom: "4px",
                  letterSpacing: "0.08em",
                }}
              >
                {`0${activeTier.index + 1} / ${activeTier.title.toUpperCase()} SELECTED`}
              </span>
              <p
                id="v10-layer-description"
                aria-live="polite"
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--ink2)",
                  lineHeight: "1.6",
                  maxWidth: "520px",
                }}
              >
                {activeTier.description}
              </p>
            </div>

            {/* Live API Contract Badges */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px",
              }}
            >
              <span className="tiny mono" style={{ color: "var(--muted)", fontSize: "9px" }}>
                DOCUMENTED APIS:
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {activeTier.apiTokens.map((api) => (
                  <code
                    key={api}
                    style={{
                      padding: "3px 7px",
                      background: "rgba(8, 44, 38, 0.06)",
                      border: "1px solid var(--line)",
                      borderRadius: "3px",
                      fontSize: "10px",
                      fontFamily: "monospace",
                      color: "var(--ink)",
                    }}
                  >
                    {api}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArchitectureAssembly;
