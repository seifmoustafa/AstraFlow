"use client";

import React, { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { HAIRLINE_IVORY_STYLE } from "@/components/motion/HairlineFigures";

export type LayerIndex = 0 | 1 | 2;

const LAYER_DETAILS: Record<LayerIndex, readonly [string, string]> = {
  0: [
    "01 / INPUT SELECTED",
    "Typed requests declare intent without hiding the contract behind infrastructure.",
  ],
  1: [
    "02 / EXECUTION SELECTED",
    "Handlers, pipeline behaviors and mapping rules are distinct, opt-in responsibilities.",
  ],
  2: [
    "03 / INSPECTION SELECTED",
    "Use diagnostics, analyzers and testing helpers to inspect supported relationships and validate decisions.",
  ],
};

const LAYER_CONTROLS: ReadonlyArray<{
  index: LayerIndex;
  code: string;
  title: string;
  subtitle: string;
}> = [
  {
    index: 0,
    code: "01 / INPUT",
    title: "Declare intent",
    subtitle: "Typed requests and contracts",
  },
  {
    index: 1,
    code: "02 / EXECUTION",
    title: "Compose behavior",
    subtitle: "Handlers, pipelines and mappings",
  },
  {
    index: 2,
    code: "03 / INSPECTION",
    title: "Verify decisions",
    subtitle: "Diagnostics and test workflows",
  },
];

/**
 * Computes physical vertical offset (px) and figure/ground opacity for each of the
 * 3 interlocking isometric plates so selecting/focusing one plate elevates it while
 * neighboring plates react softly along the shared optical axis.
 */
function getPlateSpatialState(
  plateIndex: LayerIndex,
  activeLayer: LayerIndex,
  hoveredLayer: LayerIndex | null
): { y: number; opacity: number } {
  const isHovered = hoveredLayer === plateIndex && activeLayer !== plateIndex;
  const hoverNudge = isHovered ? -2.5 : 0;

  if (activeLayer === 0) {
    if (plateIndex === 0) return { y: -9, opacity: 1 };
    if (plateIndex === 1) return { y: 5 + hoverNudge, opacity: isHovered ? 0.82 : 0.68 };
    return { y: 8 + hoverNudge, opacity: isHovered ? 0.74 : 0.56 };
  }

  if (activeLayer === 1) {
    if (plateIndex === 0) return { y: -4 + hoverNudge, opacity: isHovered ? 0.82 : 0.64 };
    if (plateIndex === 1) return { y: -7, opacity: 1 };
    return { y: 5 + hoverNudge, opacity: isHovered ? 0.82 : 0.64 };
  }

  // activeLayer === 2
  if (plateIndex === 0) return { y: -8 + hoverNudge, opacity: isHovered ? 0.74 : 0.56 };
  if (plateIndex === 1) return { y: -5 + hoverNudge, opacity: isHovered ? 0.82 : 0.68 };
  return { y: -9, opacity: 1 };
}

export function ArchitectureAssembly() {
  const [activeLayer, setActiveLayer] = useState<LayerIndex>(1);
  const [hoveredLayer, setHoveredLayer] = useState<LayerIndex | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const prefersReducedMotion = useReducedMotion();

  const [selectedLabel, selectedDescription] = LAYER_DETAILS[activeLayer];

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 310, damping: 28, mass: 0.8 };

  const connectorTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const };

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

  const plate0State = getPlateSpatialState(0, activeLayer, hoveredLayer);
  const plate1State = getPlateSpatialState(1, activeLayer, hoveredLayer);
  const plate2State = getPlateSpatialState(2, activeLayer, hoveredLayer);

  const upperAxisActive = activeLayer === 0 || activeLayer === 1;
  const lowerAxisActive = activeLayer === 1 || activeLayer === 2;

  return (
    <section
      aria-labelledby="v10-assembly-title"
      className="v10-assembly v12-assembly"
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
          compose deliberately. Explore how each layer contributes to the whole.
        </p>
      </div>

      <div className="site-wrap v10-assembly-layout">
        <div
          aria-label="Architecture layers"
          className="v10-assembly-controls"
          role="group"
        >
          {LAYER_CONTROLS.map((layer) => {
            const isActive = activeLayer === layer.index;
            return (
              <button
                key={layer.index}
                ref={(el) => {
                  buttonRefs.current[layer.index] = el;
                }}
                aria-pressed={isActive}
                className="v10-layer-control"
                data-layer={String(layer.index)}
                data-active={isActive ? "true" : "false"}
                type="button"
                onClick={() => setActiveLayer(layer.index)}
                onMouseEnter={() => setHoveredLayer(layer.index)}
                onMouseLeave={() =>
                  setHoveredLayer((prev) => (prev === layer.index ? null : prev))
                }
                onFocus={() => setHoveredLayer(layer.index)}
                onBlur={() =>
                  setHoveredLayer((prev) => (prev === layer.index ? null : prev))
                }
                onKeyDown={(e) => handleControlKeyDown(e, layer.index)}
                style={{
                  borderInlineStart: isActive ? "0px solid transparent" : undefined,
                }}
              >
                {isActive && (
                  <motion.span
                    aria-hidden="true"
                    className="v12-assembly-active-bar"
                    layoutId="assembly-active-layer-bar"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                            mass: 0.75,
                          }
                    }
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
                <span>{layer.code}</span>
                <strong>{layer.title}</strong>
                <small>{layer.subtitle}</small>
                <b aria-hidden="true">↗</b>
              </button>
            );
          })}
        </div>

        <div
          aria-label="Conceptual interlocking illustration of three independent layers"
          className="v10-assembly-figure hairline-ivory"
          data-active-layer={String(activeLayer)}
          style={HAIRLINE_IVORY_STYLE}
        >
          <div className="v10-figure-top mono">
            <span>FIGURE 02 / COMPOSITION</span>
            <span>SELECT A LAYER TO INSPECT</span>
          </div>

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

            {/* Isometric construction guides */}
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

            {/* Layer 0: DECLARATIONS */}
            <motion.g
              className="v10-geom-layer"
              data-geom-layer="0"
              data-selected={String(activeLayer === 0)}
              initial={false}
              animate={{ y: plate0State.y, opacity: plate0State.opacity }}
              transition={springTransition}
              onClick={() => setActiveLayer(0)}
              onMouseEnter={() => setHoveredLayer(0)}
              onMouseLeave={() =>
                setHoveredLayer((prev) => (prev === 0 ? null : prev))
              }
              style={{
                cursor: "pointer",
                transition: "filter 0.32s ease",
              }}
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
                stroke={activeLayer === 0 ? "#e96843" : "#365d51"}
                strokeWidth={activeLayer === 0 ? "2.2" : "1.8"}
              />
              <path
                d="M291 201 382 153 471 202 382 251Z"
                fill="none"
                stroke={activeLayer === 0 ? "#e96843" : "#648778"}
                strokeDasharray="5 7"
                strokeWidth="1"
              />
              <text
                fill="#082c26"
                fontFamily="monospace"
                fontSize="13"
                fontWeight={activeLayer === 0 ? "700" : "400"}
                textAnchor="middle"
                x="383"
                y="208"
              >
                DECLARATIONS
              </text>
            </motion.g>

            {/* Layer 1: COMPOSITION */}
            <motion.g
              className="v10-geom-layer"
              data-geom-layer="1"
              data-selected={String(activeLayer === 1)}
              initial={false}
              animate={{ y: plate1State.y, opacity: plate1State.opacity }}
              transition={springTransition}
              onClick={() => setActiveLayer(1)}
              onMouseEnter={() => setHoveredLayer(1)}
              onMouseLeave={() =>
                setHoveredLayer((prev) => (prev === 1 ? null : prev))
              }
              style={{
                cursor: "pointer",
                transition: "filter 0.32s ease",
              }}
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
                stroke={activeLayer === 1 ? "#e96843" : "#0a3d33"}
                strokeWidth={activeLayer === 1 ? "2.2" : "2"}
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
                stroke={activeLayer === 1 ? "#f29d7e" : "#81aa95"}
                strokeWidth="1"
              />
              <text
                fill="#f9f2e6"
                fontFamily="monospace"
                fontSize="14"
                fontWeight={activeLayer === 1 ? "700" : "400"}
                textAnchor="middle"
                x="383"
                y="273"
              >
                COMPOSITION
              </text>
            </motion.g>

            {/* Layer 2: INSPECTION */}
            <motion.g
              className="v10-geom-layer"
              data-geom-layer="2"
              data-selected={String(activeLayer === 2)}
              initial={false}
              animate={{ y: plate2State.y, opacity: plate2State.opacity }}
              transition={springTransition}
              onClick={() => setActiveLayer(2)}
              onMouseEnter={() => setHoveredLayer(2)}
              onMouseLeave={() =>
                setHoveredLayer((prev) => (prev === 2 ? null : prev))
              }
              style={{
                cursor: "pointer",
                transition: "filter 0.32s ease",
              }}
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
                stroke={activeLayer === 2 ? "#e96843" : "#c14a2b"}
                strokeWidth={activeLayer === 2 ? "2.2" : "1.7"}
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
                fontWeight={activeLayer === 2 ? "700" : "400"}
                textAnchor="middle"
                x="384"
                y="370"
              >
                INSPECTION
              </text>
            </motion.g>

            {/* Active Inter-Plate Connection Spine & Callout Segments */}
            <g
              className="v10-assembly-connectors"
              aria-hidden="true"
              pointerEvents="none"
            >
              <motion.path
                d="M383 195 L383 263"
                fill="none"
                stroke="#e96843"
                strokeDasharray="3 4"
                strokeWidth="1.7"
                initial={false}
                animate={{
                  pathLength: upperAxisActive ? 1 : 0,
                  opacity: upperAxisActive ? 0.9 : 0,
                }}
                transition={connectorTransition}
              />
              <motion.path
                d="M383 263 L384 342"
                fill="none"
                stroke="#e96843"
                strokeDasharray="3 4"
                strokeWidth="1.7"
                initial={false}
                animate={{
                  pathLength: lowerAxisActive ? 1 : 0,
                  opacity: lowerAxisActive ? 0.9 : 0,
                }}
                transition={connectorTransition}
              />
              <motion.circle
                cx="383"
                initial={false}
                animate={{
                  cy: activeLayer === 0 ? 195 : activeLayer === 1 ? 261 : 337,
                }}
                transition={springTransition}
                r="4.5"
                fill="#f7f3eb"
                stroke="#e96843"
                strokeWidth="2"
              />
            </g>

            {/* Dimension callouts with active trace emphasis */}
            <g
              className="v10-dimension"
              fill="#617267"
              fontFamily="monospace"
              fontSize="10"
            >
              <path d="M184 161v-25h-54" fill="none" stroke="#81998c" />
              <motion.path
                d="M184 161v-25h-54"
                fill="none"
                stroke="#e96843"
                strokeWidth="1.8"
                initial={false}
                animate={{
                  pathLength: activeLayer === 0 ? 1 : 0,
                  opacity: activeLayer === 0 ? 1 : 0,
                }}
                transition={connectorTransition}
              />
              <text
                x="20"
                y="132"
                fill={activeLayer === 0 ? "#b73921" : "#617267"}
                fontWeight={activeLayer === 0 ? "700" : "400"}
              >
                01 / CONTRACT
              </text>

              <path d="M584 234h53v-24" fill="none" stroke="#81998c" />
              <motion.path
                d="M584 234h53v-24"
                fill="none"
                stroke="#e96843"
                strokeWidth="1.8"
                initial={false}
                animate={{
                  pathLength: activeLayer === 1 ? 1 : 0,
                  opacity: activeLayer === 1 ? 1 : 0,
                }}
                transition={connectorTransition}
              />
              <text
                x="641"
                y="206"
                fill={activeLayer === 1 ? "#b73921" : "#617267"}
                fontWeight={activeLayer === 1 ? "700" : "400"}
              >
                02
              </text>

              <path d="M564 420h70v25" fill="none" stroke="#81998c" />
              <motion.path
                d="M564 420h70v25"
                fill="none"
                stroke="#e96843"
                strokeWidth="1.8"
                initial={false}
                animate={{
                  pathLength: activeLayer === 2 ? 1 : 0,
                  opacity: activeLayer === 2 ? 1 : 0,
                }}
                transition={connectorTransition}
              />
              <text
                x="640"
                y="449"
                fill={activeLayer === 2 ? "#b73921" : "#617267"}
                fontWeight={activeLayer === 2 ? "700" : "400"}
              >
                03 / VERIFY
              </text>
            </g>
          </svg>

          <motion.div
            key={activeLayer}
            className="v10-figure-foot"
            initial={prefersReducedMotion ? false : { opacity: 0.65, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <span id="v10-layer-label">{selectedLabel}</span>
            <p aria-live="polite" id="v10-layer-description">
              {selectedDescription}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
