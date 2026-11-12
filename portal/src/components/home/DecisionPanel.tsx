"use client";

import React from "react";
import type { StepIndex } from "./FlowStageRail";

export interface DecisionPanelProps {
  step: StepIndex;
  label: string;
  detail: string;
}

export function DecisionPanel({ step, label, detail }: DecisionPanelProps) {
  const formattedCount = String(step + 1).padStart(2, "0");

  return (
    <div className="flow-detail v12-flow-detail">
      <div className="v12-decision-kicker mono">
        <span className="v12-live-dot" aria-hidden="true" /> INTERACTIVE
        DECISION / <span id="v12-decision-count">{formattedCount}</span> OF 04
      </div>
      <strong id="stage-label">{label}</strong>
      <div id="stage-detail">{detail}</div>
    </div>
  );
}
