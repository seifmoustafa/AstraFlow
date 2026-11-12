"use client";

import React, { useReducer, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";
import { FlowStageRail, type StepIndex } from "./FlowStageRail";
import { DecisionPanel } from "./DecisionPanel";
import { CodeExample } from "./CodeExample";

export type Capability = "dispatch" | "mapping" | "diagnostics";

export interface FlowState {
  capability: Capability;
  step: StepIndex;
  direction: -1 | 0 | 1;
  transitionSeq: number;
}

type FlowAction =
  | { type: "SELECT_CAPABILITY"; capability: Capability }
  | { type: "SELECT_STEP"; step: StepIndex }
  | { type: "PREV_STEP" }
  | { type: "NEXT_STEP" };

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "SELECT_CAPABILITY":
      if (state.capability === action.capability && state.step === 0) {
        return state;
      }
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
      const nextStep = Math.max(0, state.step - 1) as StepIndex;
      if (nextStep === state.step) return state;
      return {
        ...state,
        step: nextStep,
        direction: -1,
        transitionSeq: state.transitionSeq + 1,
      };
    }
    case "NEXT_STEP": {
      const nextStep = ((state.step + 1) % 4) as StepIndex;
      return {
        ...state,
        step: nextStep,
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

export function FlowExplorer() {
  const { prefersReducedMotion } = useReducedMotionContext();
  const [state, dispatch] = useReducer(flowReducer, {
    capability: "dispatch",
    step: 0,
    direction: 0,
    transitionSeq: 0,
  });

  const tabRefs = useRef<Record<Capability, HTMLButtonElement | null>>({
    dispatch: null,
    mapping: null,
    diagnostics: null,
  });

  const activeData = FLOW_DATA[state.capability];

  const selectCapability = (capability: Capability) => {
    dispatch({ type: "SELECT_CAPABILITY", capability });
  };

  const selectStep = (step: StepIndex) => {
    dispatch({ type: "SELECT_STEP", step });
  };

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % CAPABILITIES.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + CAPABILITIES.length) % CAPABILITIES.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = CAPABILITIES.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextCapability = CAPABILITIES[nextIndex];
      selectCapability(nextCapability);
      tabRefs.current[nextCapability]?.focus();
    }
  };

  const handlePrev = () => {
    dispatch({ type: "PREV_STEP" });
  };

  const handleNext = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  const stateKey = `${state.capability}-${state.step}`;

  return (
    <section
      className="flow-section v10-flow-section v12-flow-section"
      id="experience"
      data-active-capability={state.capability}
      data-active-step={String(state.step)}
    >
      <div className="site-wrap">
        <div className="v10-flow-intro">
          <div>
            <p className="eyebrow">02 / FOLLOW THE ENGINE</p>
            <h2>
              The whole path.
              <br />
              <span>In plain sight.</span>
            </h2>
          </div>
          <div className="v10-flow-caption">
            <div aria-hidden="true" className="v10-flow-glyph">
              {"{ }"}
            </div>
            <p>
              Walk through a real API concept. Change a capability, select its
              stages, and read the matching example.{" "}
              <strong>
                This is a guided illustration, not a runtime trace.
              </strong>
            </p>
            <span className="tiny">INTERACTIVE / SELECT A STAGE</span>
          </div>
        </div>

        <div className="v10-flow-topbar">
          <span>
            <i aria-hidden="true" /> ASTRAFLOW / FLOW EXPLORER
          </span>
          <span>DOCUMENTED API WALKTHROUGH / CONCEPTUAL</span>
        </div>

        <div
          aria-label="Guided AstraFlow API walkthrough"
          className="flow-device v10-flow-instrument"
        >
          <div
            aria-label="Select the flow capability"
            className="flow-list"
            role="tablist"
          >
            <span className="tiny" style={{ color: "#97b6a3" }}>
              CHOOSE A CAPABILITY
            </span>
            {CAPABILITIES.map((cap, idx) => {
              const isSelected = state.capability === cap;
              return (
                <button
                  key={cap}
                  ref={(el) => {
                    tabRefs.current[cap] = el;
                  }}
                  aria-selected={isSelected}
                  data-flow={cap}
                  role="tab"
                  tabIndex={isSelected ? 0 : -1}
                  type="button"
                  onClick={() => selectCapability(cap)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  style={{ position: "relative" }}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="flow-capability-active-bar"
                      aria-hidden="true"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              stiffness: 420,
                              damping: 34,
                              mass: 0.7,
                            }
                      }
                      style={{
                        position: "absolute",
                        insetInlineStart: 0,
                        top: "6px",
                        bottom: "6px",
                        width: "3px",
                        borderRadius: "2px",
                        backgroundColor: "var(--signal, #f25e3b)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  {FLOW_DATA[cap].tabLabel}
                </button>
              );
            })}
          </div>

          <div className="flow-main">
            <div className="flow-head">
              <span
                className="tiny"
                id="flow-tag"
                style={{ color: "#f8b694" }}
              >
                {activeData.tag}
              </span>
              <span className="tiny">{`0${state.step + 1} / 04`}</span>
            </div>
            <motion.h3
              key={`title-${state.capability}`}
              id="flow-title"
              initial={prefersReducedMotion ? false : { opacity: 0.5, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.22, ease: [0.22, 0.75, 0.19, 1] }
              }
            >
              {activeData.title}
            </motion.h3>

            <FlowStageRail
              stages={activeData.stages}
              step={state.step}
              onSelectStep={selectStep}
            />

            <DecisionPanel
              capability={state.capability}
              step={state.step}
              label={activeData.labels[state.step]}
              detail={activeData.details[state.step]}
            />

            <div className="links" style={{ marginTop: "18px" }}>
              <button
                className="button button-outline"
                id="stage-prev"
                disabled={state.step === 0}
                style={{
                  background: "transparent",
                  color: "white",
                  borderColor: "#799887",
                  minHeight: "39px",
                }}
                type="button"
                onClick={handlePrev}
              >
                ← Previous
              </button>
              <button
                className="button button-primary"
                id="stage-next"
                style={{ minHeight: "39px" }}
                type="button"
                onClick={handleNext}
              >
                {state.step === 3 ? "Restart ↺" : "Next step →"}
              </button>
            </div>
          </div>

          <CodeExample
            code={activeData.code[state.step]}
            emphasizedLines={activeData.emphasizedLines[state.step]}
            stateKey={stateKey}
            stageBadge={`STAGE 0${state.step + 1}`}
          />
        </div>

        <div className="v12-technical-rail" aria-hidden="true">
          {TECHNICAL_RAIL_STEPS.map((label, idx) => {
            const isStepActive = state.step === idx;
            return (
              <React.Fragment key={label}>
                <span
                  data-active={isStepActive ? "true" : "false"}
                  style={
                    isStepActive
                      ? { color: "#fffdf7", fontWeight: 700 }
                      : undefined
                  }
                >
                  {label}
                </span>
                {idx < TECHNICAL_RAIL_STEPS.length - 1 && <i />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="v10-flow-outro">
          <p>
            Every stage represents a documented responsibility, not measured
            execution timing.
          </p>
          <Link href="/docs">
            Read the API documentation <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
