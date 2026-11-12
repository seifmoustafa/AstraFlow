"use client";

import React, { useReducer, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";

export type Capability = "dispatch" | "mapping" | "diagnostics";
export type StepIndex = 0 | 1 | 2 | 3;

interface State {
  capability: Capability;
  step: StepIndex;
  direction: -1 | 0 | 1;
  transitionSeq: number;
}

type Action =
  | { type: "SELECT_CAPABILITY"; capability: Capability }
  | { type: "SELECT_STEP"; step: StepIndex }
  | { type: "PREV_STEP" }
  | { type: "NEXT_STEP" };

function observatoryReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_CAPABILITY":
      if (state.capability === action.capability && state.step === 0) return state;
      return {
        capability: action.capability,
        step: 0,
        direction: 0,
        transitionSeq: state.transitionSeq + 1,
      };
    case "SELECT_STEP":
      if (state.step === action.step) return state;
      return {
        ...state,
        step: action.step,
        direction: action.step > state.step ? 1 : -1,
        transitionSeq: state.transitionSeq + 1,
      };
    case "PREV_STEP": {
      const next = Math.max(0, state.step - 1) as StepIndex;
      if (next === state.step) return state;
      return {
        ...state,
        step: next,
        direction: -1,
        transitionSeq: state.transitionSeq + 1,
      };
    }
    case "NEXT_STEP": {
      const next = ((state.step + 1) % 4) as StepIndex;
      return {
        ...state,
        step: next,
        direction: state.step === 3 ? -1 : 1,
        transitionSeq: state.transitionSeq + 1,
      };
    }
    default:
      return state;
  }
}

interface CapabilityDefinition {
  tabLabel: string;
  tag: string;
  title: string;
  stages: readonly [string, string, string, string];
  labels: readonly [string, string, string, string];
  details: readonly [string, string, string, string];
  code: readonly [string, string, string, string];
  emphasizedLines: readonly [
    readonly number[],
    readonly number[],
    readonly number[],
    readonly number[],
  ];
}

const CAPABILITIES: readonly Capability[] = [
  "dispatch",
  "mapping",
  "diagnostics",
];

const TECHNICAL_RAIL_STEPS = [
  "CONTRACT",
  "DECISION",
  "IMPLEMENTATION",
  "RESULT",
] as const;

const FLOW_DATA: Record<Capability, CapabilityDefinition> = {
  dispatch: {
    tabLabel: "01\u00a0 Request dispatch",
    tag: "MEDIATOR / ISENDER",
    title: "A request, intentionally routed.",
    stages: ["Request", "Register", "Handle", "Result"],
    labels: [
      "THE DECLARATION",
      "THE REGISTRATION",
      "THE EXECUTION",
      "THE RETURN",
    ],
    details: [
      "A typed request expresses intent before any handler runs.",
      "A focused registration path connects the handler to DI.",
      "The handler executes application logic with declared inputs.",
      "The caller receives the typed response.",
    ],
    code: [
      "// 01. Declare the typed request contract\npublic sealed record CreateOrder(string Number)\n    : IRequest<OrderCreated>;",
      "// 02. Register the handler assembly explicitly\nservices.AddAstraFlow(\n    assemblyMarkerTypes: typeof(CreateOrderHandler));",
      "public Task<OrderCreated> Handle(\n    CreateOrder request, CancellationToken ct) {\n  // application logic\n  return Task.FromResult(new OrderCreated(request.Number));\n}",
      '// 04. Dispatch through ISender and await typed result\nvar result = await sender.Send(\n    new CreateOrder("ORD-1042"), ct);',
    ],
    emphasizedLines: [[2, 3], [2, 3], [3, 4], [2, 3]],
  },
  mapping: {
    tabLabel: "02\u00a0 Object mapping",
    tag: "MAPPER / DECLARED RULES",
    title: "Mapping is a decision.",
    stages: ["Source", "Rule", "Validate", "Target"],
    labels: [
      "SOURCE SHAPE",
      "EXPLICIT RULE",
      "VALIDATE PLAN",
      "MAPPED RESULT",
    ],
    details: [
      "Start with known input shapes.",
      "Declare the mapping rule or supported generated mapping.",
      "Use available validation where supported.",
      "Produce the destination model deliberately.",
    ],
    code: [
      "// Source DTO and domain model\npublic sealed record Invoice(Guid Id, string Number);\npublic sealed record InvoiceResponse(Guid Id, string Number);",
      "// Declare an explicit mapping pair\npublic sealed class InvoiceMappingRule : IDeclaredObjectMappingRule {\n  public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =\n      [ObjectMappingPair.Create<Invoice, InvoiceResponse>()];\n}",
      "// Validate supported mapping rules\nservices.AddAstraFlowMapper(typeof(InvoiceMappingRule));\nvalidator.Validate(mappingOptions);",
      "// Map only declared destination members\nInvoiceResponse dto = mapper.Map<InvoiceResponse>(invoice);",
    ],
    emphasizedLines: [[2, 3], [2, 3, 4], [2, 3], [2]],
  },
  diagnostics: {
    tabLabel: "03\u00a0 Diagnostics",
    tag: "DIAGNOSTICS / SOURCED EVIDENCE",
    title: "What is knowable, visible.",
    stages: ["Discover", "Inspect", "Report", "Act"],
    labels: ["DISCOVER", "INSPECT", "REPORT", "CORRECT"],
    details: [
      "Read the discoverable registration declarations.",
      "Assess supported relationships and findings.",
      "Output a report or CLI graph representation.",
      "Use evidence to correct configuration.",
    ],
    code: [
      "// Discover supported source shapes\nservices.AddAstraFlowDiagnostics(options =>\n    options.AssemblyMarkerTypes.Add(typeof(CreateOrderHandler)));",
      "// Inspect registration relationships\nvar reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();\nAstraFlowDiagnosticReport report = reporter.CreateReport();",
      "// Report findings via CLI tools\nstring markdown = reporter.CreateMarkdownReport();\nstring json = reporter.CreateJsonReport();",
      "// Take action on verified findings\nbool hasErrors = report.Summary.HasErrors;",
    ],
    emphasizedLines: [[2, 3], [2, 3], [2, 3], [2]],
  },
};

/**
 * Radical Rebuild: Living Flow Observatory
 * - Replaces the old 3-column dashboard box with an open spatial conduit and living context lens.
 * - Single typed state machine driving all 3 scenarios x 4 stages.
 * - Direct stage clicking, keyboard navigation, and immediate mid-animation scenario interruption.
 * - Preserves all verified semantic IDs and attributes for Playwright & accessibility contracts.
 */
export function FlowExplorer() {
  const { prefersReducedMotion } = useReducedMotionContext();
  const [state, dispatch] = useReducer(observatoryReducer, {
    capability: "dispatch",
    step: 0,
    direction: 0,
    transitionSeq: 0,
  });
  const [copyState, setCopyState] = React.useState<"idle" | "copied">("idle");
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeData = FLOW_DATA[state.capability];
  const activeStage = activeData.stages[state.step];
  const activeCode = activeData.code[state.step];
  const activeEmphasized = activeData.emphasizedLines[state.step] as readonly number[];

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

  const handleKeyDown = (e: React.KeyboardEvent, idx: StepIndex) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      dispatch({ type: "SELECT_STEP", step: Math.min(3, idx + 1) as StepIndex });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      dispatch({ type: "SELECT_STEP", step: Math.max(0, idx - 1) as StepIndex });
    } else if (e.key === "Home") {
      e.preventDefault();
      dispatch({ type: "SELECT_STEP", step: 0 });
    } else if (e.key === "End") {
      e.preventDefault();
      dispatch({ type: "SELECT_STEP", step: 3 });
    }
  };

  // Station positions along the physical conduit
  const stationPercents = [12.5, 37.5, 62.5, 87.5];
  const activePercent = stationPercents[state.step];

  return (
    <section
      className="flow-section v10-flow-section v12-flow-section living-flow-observatory"
      id="experience"
      data-active-capability={state.capability}
      data-active-step={String(state.step)}
      style={{
        padding: "clamp(48px, 6vw, 96px) 0",
        position: "relative",
        background: "var(--paper, #f7f3eb)",
      }}
    >
      <div className="site-wrap">
        {/* Section Intro: Open Editorial Character */}
        <div
          className="v10-flow-intro"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 1.2fr) minmax(280px, 1fr)",
            gap: "32px",
            alignItems: "flex-end",
            marginBottom: "36px",
          }}
        >
          <div>
            <p className="eyebrow" style={{ color: "var(--signal, #f25e3b)" }}>
              02 / FOLLOW THE ENGINE
            </p>
            <h2 style={{ fontSize: "clamp(28px, 3.6vw, 46px)", lineHeight: 1.12, margin: 0 }}>
              The whole path.
              <br />
              <span style={{ color: "var(--forest, #0a342b)" }}>In plain sight.</span>
            </h2>
          </div>
          <div className="v10-flow-caption">
            <p style={{ margin: "0 0 8px", fontSize: "14px", lineHeight: 1.6, color: "var(--muted, #617267)" }}>
              Walk through a real API concept. Select a capability, inspect its stages, and follow how intent becomes execution.{" "}
              <strong>This is a guided illustration of documented C# APIs, not a runtime profiler.</strong>
            </p>
            <span className="tiny" style={{ letterSpacing: "0.1em", color: "var(--signal, #f25e3b)", fontWeight: 600 }}>
              LIVING FLOW OBSERVATORY · SELECT A STAGE
            </span>
          </div>
        </div>

        {/* Observatory Control Bar & Capability Modes */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            background: "var(--paper2, #fffdf7)",
            padding: "12px 18px",
            borderRadius: "10px",
            border: "1px solid var(--line, #d8d0c2)",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--signal, #f25e3b)",
                boxShadow: "0 0 8px rgba(242, 94, 59, 0.6)",
              }}
              aria-hidden="true"
            />
            <span className="mono" style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink, #082c26)" }}>
              ASTRAFLOW / FLOW OBSERVATORY
            </span>
          </div>

          <div
            className="flow-list"
            role="tablist"
            aria-label="Select the flow capability"
            style={{
              display: "flex",
              gap: "4px",
              background: "rgba(8, 44, 38, 0.05)",
              padding: "4px",
              borderRadius: "8px",
            }}
          >
            {CAPABILITIES.map((cap) => {
              const isSelected = state.capability === cap;
              return (
                <button
                  key={cap}
                  aria-selected={isSelected}
                  data-flow={cap}
                  role="tab"
                  tabIndex={isSelected ? 0 : -1}
                  type="button"
                  onClick={() => dispatch({ type: "SELECT_CAPABILITY", capability: cap })}
                  style={{
                    position: "relative",
                    background: "transparent",
                    border: "none",
                    padding: "6px 14px",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "12px",
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "var(--ink, #082c26)" : "var(--muted, #617267)",
                    cursor: "pointer",
                    borderRadius: "6px",
                    transition: "color 160ms ease-out",
                  }}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="flow-capability-active-bar"
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
                        boxShadow: "0 2px 6px rgba(8, 44, 38, 0.08)",
                        border: "1px solid rgba(8, 44, 38, 0.12)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <span style={{ position: "relative", zIndex: 1 }}>
                    {FLOW_DATA[cap].tabLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spatial Calibrated Conduit Instrument */}
        <div
          className="flow-path v12-flow-path"
          id="flow-path"
          aria-label={`Guided flow, step ${state.step + 1} of 4`}
          style={{
            position: "relative",
            background: "var(--paper2, #fffdf7)",
            border: "1px solid var(--line, #d8d0c2)",
            borderRadius: "14px",
            padding: "32px clamp(16px, 3vw, 36px) 24px",
            marginBottom: "32px",
            boxShadow: "0 12px 36px rgba(8, 44, 38, 0.05)",
          }}
        >
          {/* Header Metadata on the Conduit */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                id="flow-tag"
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--signal, #f25e3b)",
                  background: "rgba(242, 94, 59, 0.1)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                {activeData.tag}
              </span>
              <h3 id="flow-title" style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
                {activeData.title}
              </h3>
            </div>
            <span
              className="mono"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--muted, #617267)",
              }}
            >
              {`0${state.step + 1} / 04`}
            </span>
          </div>

          {/* Physical Conduit Track Line with Double Hairline Guide */}
          <div
            style={{
              position: "relative",
              height: "8px",
              background: "rgba(8, 44, 38, 0.08)",
              borderRadius: "4px",
              border: "1px solid rgba(8, 44, 38, 0.12)",
              margin: "24px 0",
            }}
          >
            {/* Active Flow Line Beam */}
            <motion.div
              className="v12-stage-beam"
              initial={false}
              animate={{ width: `${activePercent}%` }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.38, ease: [0.22, 0.75, 0.19, 1] }
              }
              style={{
                height: "100%",
                background: "linear-gradient(90deg, var(--forest, #0a342b), var(--signal, #f25e3b))",
                borderRadius: "4px",
              }}
            />

            {/* Traveling Signal Carriage Head with reticle pulse */}
            <motion.div
              className="v12-stage-travel"
              initial={false}
              animate={{ left: `${activePercent}%` }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 360, damping: 30, mass: 0.75 }
              }
              style={{
                position: "absolute",
                top: "50%",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "var(--signal, #f25e3b)",
                border: "3px solid #fffdf7",
                boxShadow: "0 0 0 2px var(--signal, #f25e3b), 0 4px 14px rgba(242, 94, 59, 0.4)",
                transform: "translate(-50%, -50%)",
                zIndex: 3,
              }}
            />
          </div>

          {/* 4 Waypoint Station Node Buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              position: "relative",
              gap: "8px",
            }}
          >
            {activeData.stages.map((stageName, idx) => {
              const isSelected = state.step === idx;
              const isCompleted = idx < state.step;
              const num = String(idx + 1).padStart(2, "0");

              return (
                <button
                  key={idx}
                  className="flow-node"
                  data-active={isSelected ? "true" : "false"}
                  data-completed={isCompleted ? "true" : "false"}
                  data-stage={String(idx)}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => dispatch({ type: "SELECT_STEP", step: idx as StepIndex })}
                  onKeyDown={(e) => handleKeyDown(e, idx as StepIndex)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "8px 6px",
                    borderRadius: "8px",
                    position: "relative",
                    transition: "opacity 180ms ease-out",
                    opacity: isSelected ? 1 : isCompleted ? 0.85 : 0.55,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: isSelected ? "var(--signal, #f25e3b)" : "var(--muted, #617267)",
                      letterSpacing: "0.08em",
                      marginBottom: "4px",
                    }}
                  >
                    {num}
                  </span>
                  <strong
                    style={{
                      fontSize: "14px",
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? "var(--ink, #082c26)" : "var(--ink2, #2f5b4e)",
                    }}
                  >
                    {stageName}
                  </strong>

                  {isSelected && (
                    <motion.div
                      layoutId="flow-stage-active-outline"
                      className="v12-stage-active-outline"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 34 }
                      }
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "8px",
                        border: "1px solid rgba(242, 94, 59, 0.5)",
                        background: "rgba(242, 94, 59, 0.05)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Spatial Context Lens: Decision Detail + Live Documented C# Code */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 1fr) minmax(340px, 1.4fr)",
            gap: "28px",
            alignItems: "stretch",
            background: "var(--forest, #0a342b)",
            color: "#fffdf7",
            borderRadius: "14px",
            padding: "clamp(22px, 3.5vw, 36px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 18px 48px rgba(8, 44, 38, 0.24)",
          }}
        >
          {/* Left Column: Decision Detail & Navigation Controls */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="flow-detail v12-flow-detail">
              <div
                className="v12-decision-kicker mono"
                style={{
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
                  className="v12-live-dot"
                  aria-hidden="true"
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "var(--signal, #f25e3b)",
                    display: "inline-block",
                    boxShadow: "0 0 8px var(--signal, #f25e3b)",
                  }}
                />
                INTERACTIVE DECISION / <span id="v12-decision-count">{String(state.step + 1).padStart(2, "0")}</span> OF 04
              </div>

              <motion.strong
                key={`label-${state.capability}-${state.step}`}
                id="stage-label"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  display: "block",
                  fontSize: "22px",
                  fontWeight: 600,
                  margin: "0 0 10px",
                  color: "#fffdf7",
                  letterSpacing: "-0.01em",
                }}
              >
                {activeData.labels[state.step]}
              </motion.strong>

              <motion.div
                key={`detail-${state.capability}-${state.step}`}
                id="stage-detail"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.04 }}
                style={{
                  fontSize: "14px",
                  lineHeight: "1.65",
                  color: "rgba(247, 243, 235, 0.85)",
                }}
              >
                {activeData.details[state.step]}
              </motion.div>
            </div>

            {/* Previous / Next Stepper Controls */}
            <div
              className="links"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "28px",
              }}
            >
              <button
                className="button button-outline"
                id="stage-prev"
                disabled={state.step === 0}
                type="button"
                onClick={() => dispatch({ type: "PREV_STEP" })}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: state.step === 0 ? "rgba(255, 255, 255, 0.3)" : "#fffdf7",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  minHeight: "39px",
                  cursor: state.step === 0 ? "not-allowed" : "pointer",
                }}
              >
                ← Previous
              </button>
              <button
                className="button button-primary"
                id="stage-next"
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
                  minHeight: "39px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(242, 94, 59, 0.4)",
                }}
              >
                {state.step === 3 ? "Restart ↺" : "Next step →"}
              </button>
            </div>
          </div>

          {/* Right Column: Code Lens with Verified AstraFlow C# APIs & Line Highlights */}
          <div
            className="flow-code v12-flow-code"
            style={{
              background: "rgba(5, 30, 25, 0.85)",
              borderRadius: "10px",
              padding: "20px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingBottom: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div className="frame-dots" style={{ display: "flex", gap: "4px" }}>
                    <i style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
                    <i style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
                    <i style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
                  </div>
                  <p className="tiny" style={{ margin: 0, color: "var(--peach, #ffd2bd)", fontFamily: "var(--font-mono, monospace)" }}>
                    EXAMPLE.CS / DOCUMENTED SHAPE
                  </p>
                </div>

                <button
                  type="button"
                  className="v11-code-copy"
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
                  {copyState === "copied" ? "COPIED ✓" : "COPY EXAMPLE  ↗"}
                </button>
              </div>

              <pre
                id="flow-code"
                tabIndex={0}
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
                  const isEmphasized = activeEmphasized.includes(lineNum);
                  return (
                    <div
                      key={lineNum}
                      className="v12-code-line"
                      data-line={lineNum}
                      data-emphasized={isEmphasized ? "true" : "false"}
                      style={{
                        backgroundColor: isEmphasized ? "rgba(242, 94, 59, 0.16)" : "transparent",
                        borderLeft: isEmphasized ? "2px solid var(--signal, #f25e3b)" : "2px solid transparent",
                        paddingLeft: "8px",
                        marginLeft: "-8px",
                        color: isEmphasized ? "#fffdf7" : "rgba(255, 255, 255, 0.75)",
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

        {/* Technical Surface Invariants Rail */}
        <div
          className="v12-technical-rail"
          aria-hidden="true"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "18px",
            marginTop: "32px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "11px",
            color: "var(--muted, #617267)",
          }}
        >
          {TECHNICAL_RAIL_STEPS.map((stepName, sIdx) => {
            const isStepActive = state.step === sIdx;
            return (
              <React.Fragment key={stepName}>
                <span
                  data-active={isStepActive ? "true" : "false"}
                  style={{
                    color: isStepActive ? "var(--signal, #f25e3b)" : "var(--muted, #617267)",
                    fontWeight: isStepActive ? 700 : 500,
                  }}
                >
                  {stepName}
                </span>
                {sIdx < TECHNICAL_RAIL_STEPS.length - 1 && <i style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--line, #d8d0c2)" }} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Outro Strip */}
        <div
          className="v10-flow-outro"
          style={{
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "13px", color: "var(--muted, #617267)", margin: "0 0 8px" }}>
            Every stage represents a documented responsibility, not measured execution timing.
          </p>
          <Link href="/docs" style={{ color: "var(--action, #b73921)", fontWeight: 600, fontSize: "13px" }}>
            Read the API documentation <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
