"use client";

import React, { useReducer, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";

export type Capability = "dispatch" | "mapping" | "diagnostics";
export type StepIndex = 0 | 1 | 2 | 3;

interface State {
  capability: Capability;
  step: StepIndex;
  direction: -1 | 0 | 1;
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
      };
    case "SELECT_STEP":
      if (state.step === action.step) return state;
      return {
        ...state,
        step: action.step,
        direction: action.step > state.step ? 1 : -1,
      };
    case "PREV_STEP": {
      const next = Math.max(0, state.step - 1) as StepIndex;
      if (next === state.step) return state;
      return { ...state, step: next, direction: -1 };
    }
    case "NEXT_STEP": {
      const next = ((state.step + 1) % 4) as StepIndex;
      return { ...state, step: next, direction: state.step === 3 ? -1 : 1 };
    }
    default:
      return state;
  }
}

export const OBSERVATORY_SCENARIOS = {
  dispatch: {
    id: "dispatch" as const,
    label: "01 / REQUEST DISPATCH",
    sublabel: "Mediator & Pipeline Route",
    tag: "MEDIATOR / ISENDER",
    title: "A request, intentionally routed.",
    stages: [
      { name: "Declaration", label: "THE DECLARATION", num: "01", desc: "A typed request expresses intent before any handler runs." },
      { name: "Registration", label: "THE REGISTRATION", num: "02", desc: "A focused registration path connects the handler to DI." },
      { name: "Execution", label: "THE EXECUTION", num: "03", desc: "The handler executes application logic with declared inputs." },
      { name: "Return", label: "THE RETURN", num: "04", desc: "The caller receives the typed response." },
    ],
    code: [
      "// 01. Declare the typed request contract\npublic sealed record CreateOrder(string Number)\n    : IRequest<OrderCreated>;",
      "// 02. Register the handler assembly explicitly\nservices.AddAstraFlow(\n    assemblyMarkerTypes: typeof(CreateOrderHandler));",
      "public Task<OrderCreated> Handle(\n    CreateOrder request, CancellationToken ct) {\n  // application logic\n  return Task.FromResult(new OrderCreated(request.Number));\n}",
      '// 04. Dispatch through ISender and await typed result\nvar result = await sender.Send(\n    new CreateOrder("ORD-1042"), ct);',
    ],
    emphasized: [[2, 3], [2, 3], [3, 4], [2, 3]],
  },
  mapping: {
    id: "mapping" as const,
    label: "02 / OBJECT MAPPING",
    sublabel: "Declared Rules & Projections",
    tag: "MAPPER / DECLARED RULES",
    title: "Mapping is an intentional decision.",
    stages: [
      { name: "Source Shape", label: "SOURCE SHAPE", num: "01", desc: "Start with known input shapes." },
      { name: "Explicit Rule", label: "EXPLICIT RULE", num: "02", desc: "Declare the mapping rule or supported generated mapping." },
      { name: "Validate Plan", label: "VALIDATE PLAN", num: "03", desc: "Use available validation where supported." },
      { name: "Mapped Result", label: "MAPPED RESULT", num: "04", desc: "Produce the destination model deliberately." },
    ],
    code: [
      "// Source DTO and domain model\npublic sealed record Invoice(Guid Id, string Number);\npublic sealed record InvoiceResponse(Guid Id, string Number);",
      "// Declare an explicit mapping pair\npublic sealed class InvoiceMappingRule : IDeclaredObjectMappingRule {\n  public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =\n      [ObjectMappingPair.Create<Invoice, InvoiceResponse>()];\n}",
      "// Validate supported mapping rules\nservices.AddAstraFlowMapper(typeof(InvoiceMappingRule));\nvalidator.Validate(mappingOptions);",
      "// Map only declared destination members\nInvoiceResponse dto = mapper.Map<InvoiceResponse>(invoice);",
    ],
    emphasized: [[2, 3], [2, 3, 4], [2, 3], [2]],
  },
  diagnostics: {
    id: "diagnostics" as const,
    label: "03 / DIAGNOSTIC EVIDENCE",
    sublabel: "Inspectable Registrations",
    tag: "DIAGNOSTICS / SOURCED EVIDENCE",
    title: "What is knowable, visible.",
    stages: [
      { name: "Discover", label: "DISCOVER", num: "01", desc: "Read the discoverable registration declarations." },
      { name: "Inspect", label: "INSPECT", num: "02", desc: "Assess supported relationships and findings." },
      { name: "Report", label: "REPORT", num: "03", desc: "Output a report or CLI graph representation." },
      { name: "Correct", label: "CORRECT", num: "04", desc: "Use evidence to correct configuration." },
    ],
    code: [
      "// Discover supported source shapes\nservices.AddAstraFlowDiagnostics(options =>\n    options.AssemblyMarkerTypes.Add(typeof(CreateOrderHandler)));",
      "// Inspect registration relationships\nvar reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();\nAstraFlowDiagnosticReport report = reporter.CreateReport();",
      "// Report findings via CLI tools\nstring markdown = reporter.CreateMarkdownReport();\nstring json = reporter.CreateJsonReport();",
      "// Take action on verified findings\nbool hasErrors = report.Summary.HasErrors;",
    ],
    emphasized: [[2, 3], [2, 3], [2, 3], [2]],
  },
} as const;

const CAPABILITIES: readonly Capability[] = ["dispatch", "mapping", "diagnostics"];

/**
 * Concept A: Spatial Calibrated Physical Conduit
 * - Boundary-less, open architectural instrument.
 * - Continuous horizontal rail with 4 illuminated waypoint stations.
 * - Gliding Signal Carriage and physical drop connector linking the active station to the code lens.
 * - Single typed state machine with interruptible spring motion.
 */
export function FlowObservatoryAlternativeA() {
  const { prefersReducedMotion } = useReducedMotionContext();
  const [state, dispatch] = useReducer(observatoryReducer, {
    capability: "dispatch",
    step: 0,
    direction: 0,
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

  // Waypoint station percentages along the conduit
  const stationPercents = [12.5, 37.5, 62.5, 87.5];
  const activePercent = stationPercents[state.step];

  return (
    <div
      className="observatory-concept-a"
      style={{
        background: "var(--paper, #f7f3eb)",
        color: "var(--ink, #082c26)",
        borderRadius: "16px",
        padding: "clamp(24px, 4vw, 48px)",
        border: "1px solid var(--line, #d8d0c2)",
        position: "relative",
      }}
    >
      {/* Kicker & Concept Identity */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "32px",
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
            LAB STUDY A · CALIBRATED PHYSICAL CONDUIT
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

        {/* Capability Switcher with Shared Glider */}
        <div
          role="tablist"
          aria-label="Observatory capability"
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
                    layoutId="observatory-a-capability-pill"
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

      {/* The Calibrated Spatial Conduit Rail */}
      <div
        className="conduit-station-track"
        style={{
          position: "relative",
          margin: "40px 0 28px",
          padding: "20px 0 36px",
        }}
      >
        {/* Physical Conduit Pipe & Trace Line */}
        <div
          style={{
            position: "relative",
            height: "8px",
            background: "rgba(8, 44, 38, 0.08)",
            borderRadius: "4px",
            border: "1px solid rgba(8, 44, 38, 0.12)",
          }}
        >
          {/* Active Flow Line Beam */}
          <motion.div
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

          {/* Traveling Signal Carriage Head */}
          <motion.div
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

        {/* 4 Waypoint Station Nodes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            position: "relative",
            marginTop: "16px",
          }}
        >
          {scenario.stages.map((stg, idx) => {
            const isSelected = state.step === idx;
            const isCompleted = idx < state.step;

            return (
              <button
                key={stg.num}
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
                  padding: "8px 4px",
                  borderRadius: "8px",
                  position: "relative",
                  transition: "opacity 180ms ease-out",
                  opacity: isSelected ? 1 : isCompleted ? 0.85 : 0.55,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: isSelected ? "var(--signal, #f25e3b)" : "var(--muted, #617267)",
                    letterSpacing: "0.08em",
                    marginBottom: "4px",
                  }}
                >
                  STATION {stg.num}
                </div>
                <strong
                  style={{
                    fontSize: "14px",
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "var(--ink, #082c26)" : "var(--ink2, #2f5b4e)",
                  }}
                >
                  {stg.name}
                </strong>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--muted, #617267)",
                    marginTop: "2px",
                    maxWidth: "180px",
                  }}
                >
                  {stg.label}
                </span>

                {isSelected && (
                  <motion.div
                    layoutId="observatory-a-active-ring"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "8px",
                      border: "1px solid rgba(242, 94, 59, 0.4)",
                      background: "rgba(242, 94, 59, 0.04)",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Synchronized Spatial Lens: Decision Detail + Contextual C# Code */}
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
          boxShadow: "0 18px 48px rgba(8, 44, 38, 0.22)",
        }}
      >
        {/* Left: Active Decision Readout & Stepper */}
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
                  boxShadow: "0 0 8px var(--signal, #f25e3b)",
                }}
              />
              INTERACTIVE DECISION · {activeStage.num} / 04
            </div>

            <motion.h4
              key={`h4-${state.capability}-${state.step}`}
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
              key={`p-${state.capability}-${state.step}`}
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

          {/* Stepper Navigation */}
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
                boxShadow: "0 4px 12px rgba(242, 94, 59, 0.35)",
              }}
            >
              {state.step === 3 ? "Restart ↺" : "Next step →"}
            </button>
          </div>
        </div>

        {/* Right: Synchronized C# Code Lens with Line Highlights */}
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
              SOURCE CONTRACT · STAGE {activeStage.num}
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
              const isEmphasized = (activeEmphasized as readonly number[]).some((n) => n === lineNum);
              return (
                <div
                  key={lineNum}
                  style={{
                    backgroundColor: isEmphasized ? "rgba(242, 94, 59, 0.16)" : "transparent",
                    borderLeft: isEmphasized ? "2px solid var(--signal, #f25e3b)" : "2px solid transparent",
                    paddingLeft: isEmphasized ? "8px" : "8px",
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
