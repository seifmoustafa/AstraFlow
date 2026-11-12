"use client";

import React, { useReducer, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";
import {
  OBSERVATORY_SCENARIOS,
  type Capability,
  type StepIndex,
} from "./FlowObservatoryAlternativeA";

interface State {
  capability: Capability;
  step: StepIndex;
}

type Action =
  | { type: "SELECT_CAPABILITY"; capability: Capability }
  | { type: "SELECT_STEP"; step: StepIndex }
  | { type: "PREV_STEP" }
  | { type: "NEXT_STEP" };

function chamberReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_CAPABILITY":
      if (state.capability === action.capability && state.step === 0) return state;
      return { capability: action.capability, step: 0 };
    case "SELECT_STEP":
      if (state.step === action.step) return state;
      return { ...state, step: action.step };
    case "PREV_STEP":
      return { ...state, step: Math.max(0, state.step - 1) as StepIndex };
    case "NEXT_STEP":
      return { ...state, step: ((state.step + 1) % 4) as StepIndex };
    default:
      return state;
  }
}

const CAPABILITIES: readonly Capability[] = ["dispatch", "mapping", "diagnostics"];

/**
 * Concept B: Orbital Pipeline Chamber
 * - Circular/curved multi-station diagnostic chamber.
 * - An orbital arc trajectory with crosshair reticle locking onto the active stage sector.
 * - Radial focus with physical docking target, stage pulse, and synchronized code blade.
 * - Single typed state machine with interruptible spring motion.
 */
export function FlowObservatoryAlternativeB() {
  const { prefersReducedMotion } = useReducedMotionContext();
  const [state, dispatch] = useReducer(chamberReducer, {
    capability: "dispatch",
    step: 0,
  });
  const [copyState, setCopyState] = React.useState<"idle" | "copied">("idle");
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = OBSERVATORY_SCENARIOS[state.capability];
  const activeStage = scenario.stages[state.step];
  const activeCode = scenario.code[state.step];
  const activeEmphasized = scenario.emphasized[state.step];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode.trim());
      setCopyState("copied");
    } catch {
      setCopyState("idle");
    }
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyState("idle"), 1800);
  };

  // Node station coordinates along the curved chamber arc (viewBox: 600 x 200)
  const stationCoords = [
    { x: 75, y: 140, labelX: 75, angle: -45 },
    { x: 225, y: 70, labelX: 225, angle: -15 },
    { x: 375, y: 70, labelX: 375, angle: 15 },
    { x: 525, y: 140, labelX: 525, angle: 45 },
  ];

  const activeCoord = stationCoords[state.step];

  return (
    <div
      className="observatory-concept-b"
      style={{
        background: "var(--paper, #f7f3eb)",
        color: "var(--ink, #082c26)",
        borderRadius: "16px",
        padding: "clamp(24px, 4vw, 48px)",
        border: "1px solid var(--line, #d8d0c2)",
        position: "relative",
      }}
    >
      {/* Kicker & Mode Selector */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
          borderBottom: "1px solid rgba(8, 44, 38, 0.12)",
          paddingBottom: "20px",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "11px",
              letterSpacing: "0.14em",
              color: "var(--signal, #f25e3b)",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            LAB STUDY B · ORBITAL PIPELINE CHAMBER
          </span>
          <h3
            style={{
              fontSize: "clamp(22px, 2.8vw, 32px)",
              fontWeight: 600,
              margin: "6px 0 0",
              letterSpacing: "-0.02em",
            }}
          >
            {scenario.title}
          </h3>
        </div>

        {/* Tactical Dial Tabs */}
        <div
          role="tablist"
          aria-label="Chamber capabilities"
          style={{
            display: "inline-flex",
            background: "rgba(8, 44, 38, 0.05)",
            padding: "4px",
            borderRadius: "8px",
            border: "1px solid var(--line, #d8d0c2)",
            gap: "2px",
          }}
        >
          {CAPABILITIES.map((cap) => {
            const isSelected = state.capability === cap;
            return (
              <button
                key={cap}
                role="tab"
                aria-selected={isSelected}
                onClick={() => dispatch({ type: "SELECT_CAPABILITY", capability: cap })}
                type="button"
                style={{
                  position: "relative",
                  background: "transparent",
                  border: "none",
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono, monospace)",
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? "var(--ink, #082c26)" : "var(--muted, #617267)",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "color 160ms ease-out",
                }}
              >
                {isSelected && (
                  <motion.span
                    layoutId="observatory-b-capability-pill"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34, mass: 0.7 }
                    }
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "var(--paper2, #fffdf7)",
                      borderRadius: "6px",
                      boxShadow: "0 2px 8px rgba(8, 44, 38, 0.08)",
                      border: "1px solid rgba(8, 44, 38, 0.12)",
                      pointerEvents: "none",
                    }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>
                  {OBSERVATORY_SCENARIOS[cap].label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The Orbital Chamber Graphic */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto 32px",
          background: "rgba(8, 44, 38, 0.03)",
          borderRadius: "12px",
          padding: "20px 20px 10px",
          border: "1px solid rgba(8, 44, 38, 0.08)",
        }}
      >
        <svg
          viewBox="0 0 600 180"
          style={{ width: "100%", height: "auto", overflow: "visible" }}
          aria-hidden="true"
        >
          {/* Construction Guide Grid */}
          <line x1="40" y1="90" x2="560" y2="90" stroke="rgba(8, 44, 38, 0.08)" strokeDasharray="4 6" />
          <line x1="300" y1="20" x2="300" y2="160" stroke="rgba(8, 44, 38, 0.08)" strokeDasharray="4 6" />
          <circle cx="300" cy="180" r="140" fill="none" stroke="rgba(8, 44, 38, 0.06)" strokeDasharray="2 6" />

          {/* Curved Pipeline Arc Path */}
          <path
            d="M 75 140 C 135 70, 210 70, 300 70 C 390 70, 465 70, 525 140"
            fill="none"
            stroke="rgba(8, 44, 38, 0.16)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Active Flow Line to current stage */}
          <motion.path
            d="M 75 140 C 135 70, 210 70, 300 70 C 390 70, 465 70, 525 140"
            fill="none"
            stroke="var(--signal, #f25e3b)"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={false}
            animate={{
              pathLength: (state.step + 0.15) / 3.15,
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.38, ease: [0.22, 0.75, 0.19, 1] }
            }
          />

          {/* Waypoint stations along the arc */}
          {stationCoords.map((coord, sIdx) => {
            const isSelected = state.step === sIdx;
            return (
              <g key={sIdx} transform={`translate(${coord.x}, ${coord.y})`}>
                <circle
                  r={isSelected ? "14" : "10"}
                  fill={isSelected ? "var(--signal, #f25e3b)" : "var(--paper2, #fffdf7)"}
                  stroke={isSelected ? "#fffdf7" : "var(--forest, #0a342b)"}
                  strokeWidth="2.5"
                  style={{ transition: "all 200ms ease-out" }}
                />
                {isSelected && (
                  <circle
                    r="20"
                    fill="none"
                    stroke="var(--signal, #f25e3b)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />
                )}
                <text
                  y="30"
                  textAnchor="middle"
                  fill="var(--ink, #082c26)"
                  fontFamily="var(--font-mono, monospace)"
                  fontSize="11"
                  fontWeight={isSelected ? "700" : "500"}
                >
                  {scenario.stages[sIdx].num} · {scenario.stages[sIdx].name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interactive Station Click Target Buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          {scenario.stages.map((stg, sIdx) => {
            const isSelected = state.step === sIdx;
            return (
              <button
                key={stg.num}
                type="button"
                aria-pressed={isSelected}
                onClick={() => dispatch({ type: "SELECT_STEP", step: sIdx as StepIndex })}
                style={{
                  background: isSelected ? "var(--forest, #0a342b)" : "transparent",
                  color: isSelected ? "#fffdf7" : "var(--ink2, #2f5b4e)",
                  border: "1px solid",
                  borderColor: isSelected ? "var(--forest, #0a342b)" : "rgba(8, 44, 38, 0.15)",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: isSelected ? 600 : 500,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 160ms ease-out",
                }}
              >
                {stg.num} {stg.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Synchronized Output Deck: Context Details + Live C# Code */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.4fr)",
          gap: "28px",
          alignItems: "stretch",
          background: "var(--forest, #0a342b)",
          color: "#fffdf7",
          borderRadius: "12px",
          padding: "clamp(20px, 3vw, 32px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        {/* Left Column: Stage Detail & Navigation */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "11px",
                letterSpacing: "0.12em",
                color: "var(--peach, #ffd2bd)",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--signal, #f25e3b)",
                  display: "inline-block",
                }}
              />
              SECTOR {activeStage.num} FOCUS
            </div>

            <motion.h4
              key={`b-h4-${state.capability}-${state.step}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                fontSize: "20px",
                fontWeight: 600,
                margin: "0 0 10px",
                color: "#fffdf7",
              }}
            >
              {activeStage.label}
            </motion.h4>

            <motion.p
              key={`b-p-${state.capability}-${state.step}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.04 }}
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "rgba(247, 243, 235, 0.85)",
                margin: 0,
              }}
            >
              {activeStage.desc}
            </motion.p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <button
              type="button"
              disabled={state.step === 0}
              onClick={() => dispatch({ type: "PREV_STEP" })}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.24)",
                color: state.step === 0 ? "rgba(255, 255, 255, 0.3)" : "#fffdf7",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: state.step === 0 ? "not-allowed" : "pointer",
              }}
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "NEXT_STEP" })}
              style={{
                background: "var(--signal, #f25e3b)",
                border: "none",
                color: "#fffdf7",
                borderRadius: "6px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {state.step === 3 ? "Restart ↺" : "Next step →"}
            </button>
          </div>
        </div>

        {/* Right Column: Code Blade */}
        <div
          style={{
            background: "rgba(5, 30, 25, 0.8)",
            borderRadius: "8px",
            padding: "20px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: "8px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "11px",
                color: "var(--peach, #ffd2bd)",
              }}
            >
              PIPELINE BLADE · STAGE {activeStage.num}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: copyState === "copied" ? "var(--forest, #0a342b)" : "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: copyState === "copied" ? "var(--peach, #ffd2bd)" : "#fffdf7",
                fontSize: "11px",
                fontFamily: "var(--font-mono, monospace)",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {copyState === "copied" ? "COPIED ✓" : "COPY C# ↗"}
            </button>
          </div>

          <pre
            style={{
              margin: 0,
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "13px",
              lineHeight: "1.65",
              color: "#fffdf7",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {activeCode.split("\n").map((line, lIdx) => {
              const lineNum = lIdx + 1;
              const isEmphasized = (activeEmphasized as unknown as number[]).includes(lineNum);
              return (
                <div
                  key={lineNum}
                  style={{
                    backgroundColor: isEmphasized ? "rgba(242, 94, 59, 0.16)" : "transparent",
                    borderLeft: isEmphasized ? "2px solid var(--signal, #f25e3b)" : "2px solid transparent",
                    paddingLeft: "8px",
                    marginLeft: "-8px",
                    color: isEmphasized ? "#fffdf7" : "rgba(255, 255, 255, 0.72)",
                    transition: "all 160ms ease-out",
                  }}
                >
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
}
