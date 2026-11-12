"use client";

import React from "react";
import { motion } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";
import type { StepIndex } from "./FlowStageRail";

export interface DecisionPanelProps {
  step: StepIndex;
  label: string;
  detail: string;
  capability?: string;
}

export function DecisionPanel({
  step,
  label,
  detail,
  capability = "dispatch",
}: DecisionPanelProps) {
  const { prefersReducedMotion } = useReducedMotionContext();
  const formattedCount = String(step + 1).padStart(2, "0");

  return (
    <motion.div
      key={`${capability}-${step}`}
      className="flow-detail v12-flow-detail"
      initial={prefersReducedMotion ? false : { opacity: 0.45, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.24, ease: [0.22, 0.75, 0.19, 1] }
      }
    >
      <div className="v12-decision-kicker mono">
        <span className="v12-live-dot" aria-hidden="true" /> INTERACTIVE
        DECISION / <span id="v12-decision-count">{formattedCount}</span> OF 04
      </div>
      <strong id="stage-label">{label}</strong>
      <div id="stage-detail">{detail}</div>
    </motion.div>
  );
}
