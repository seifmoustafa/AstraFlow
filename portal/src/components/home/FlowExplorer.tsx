"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { FlowStageRail, type StepIndex } from "./FlowStageRail";
import { DecisionPanel } from "./DecisionPanel";
import { CodeExample } from "./CodeExample";

export type Capability = "dispatch" | "mapping" | "diagnostics";

export interface FlowState {
  capability: Capability;
  step: StepIndex;
}

interface CapabilityDefinition {
  tabLabel: string;
  tag: string;
  title: string;
  stages: readonly [string, string, string, string];
  labels: readonly [string, string, string, string];
  details: readonly [string, string, string, string];
  code: readonly [string, string, string, string];
}

const CAPABILITIES: readonly Capability[] = [
  "dispatch",
  "mapping",
  "diagnostics",
];

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
      "public sealed record CreateOrder(string Number)\n    : IRequest<OrderCreated>;",
      "services.AddAstraFlow(\n    assemblyMarkerTypes: typeof(CreateOrderHandler));",
      "public Task<OrderCreated> Handle(\n    CreateOrder request, CancellationToken ct) {\n  // application logic\n}",
      'var result = await sender.Send(\n    new CreateOrder("ORD-1042"), ct);',
    ],
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
      "// Source DTO and domain model",
      "// Declare an explicit mapping pair",
      "// Validate supported mapping rules",
      "// Map only declared destination members",
    ],
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
      "// Discover supported source shapes",
      "// Inspect registration relationships",
      "// Report findings via CLI tools",
      "// Take action on verified findings",
    ],
  },
};

export function FlowExplorer() {
  const [state, setState] = useState<FlowState>({
    capability: "dispatch",
    step: 0,
  });
  const tabRefs = useRef<Record<Capability, HTMLButtonElement | null>>({
    dispatch: null,
    mapping: null,
    diagnostics: null,
  });

  const activeData = FLOW_DATA[state.capability];

  const selectCapability = (capability: Capability) => {
    setState({ capability, step: 0 });
  };

  const selectStep = (step: StepIndex) => {
    setState((prev) => ({ ...prev, step }));
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
    setState((prev) => ({
      ...prev,
      step: Math.max(0, prev.step - 1) as StepIndex,
    }));
  };

  const handleNext = () => {
    setState((prev) => ({
      ...prev,
      step: ((prev.step + 1) % 4) as StepIndex,
    }));
  };

  return (
    <section
      className="flow-section v10-flow-section v12-flow-section"
      id="experience"
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
                >
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
            <h3 id="flow-title">{activeData.title}</h3>

            <FlowStageRail
              stages={activeData.stages}
              step={state.step}
              onSelectStep={selectStep}
            />

            <DecisionPanel
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

          <CodeExample code={activeData.code[state.step]} />
        </div>

        <div className="v12-technical-rail" aria-hidden="true">
          <span>CONTRACT</span>
          <i />
          <span>DECISION</span>
          <i />
          <span>IMPLEMENTATION</span>
          <i />
          <span>RESULT</span>
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
