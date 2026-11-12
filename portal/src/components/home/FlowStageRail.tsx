"use client";

import React, { useRef } from "react";
import { useFlowStageSynchronizer } from "@/components/motion/ReducedMotionProvider";

export type StepIndex = 0 | 1 | 2 | 3;

export interface FlowStageRailProps {
  stages: readonly [string, string, string, string];
  step: StepIndex;
  onSelectStep: (step: StepIndex) => void;
}

export function FlowStageRail({
  stages,
  step,
  onSelectStep,
}: FlowStageRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([
    null,
    null,
    null,
    null,
  ]);
  const { stageX, progressPercent: progress } = useFlowStageSynchronizer(
    railRef,
    nodeRefs,
    step,
    stages.join("|"),
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: StepIndex,
  ) => {
    let next: StepIndex | null = null;
    if (e.key === "ArrowRight") {
      next = Math.min(3, idx + 1) as StepIndex;
    } else if (e.key === "ArrowLeft") {
      next = Math.max(0, idx - 1) as StepIndex;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = 3;
    }

    if (next !== null) {
      e.preventDefault();
      onSelectStep(next);
      nodeRefs.current[next]?.focus();
    }
  };

  return (
    <div
      ref={railRef}
      className="flow-path v12-flow-path"
      id="flow-path"
      aria-label={`Guided flow, step ${step + 1} of 4`}
      style={
        {
          "--v11-stage-progress": progress,
          "--v12-stage-x": `${stageX}px`,
        } as React.CSSProperties
      }
    >
      <div className="v12-stage-current" aria-hidden="true">
        <span className="v12-stage-beam" />
        <span
          className="v12-stage-travel"
          style={
            {
              "--v12-stage-x": `${stageX}px`,
            } as React.CSSProperties
          }
        />
      </div>

      {stages.map((stageName, index) => {
        const idx = index as StepIndex;
        const isActive = step === idx;

        return (
          <React.Fragment key={idx}>
            <button
              ref={(el) => {
                nodeRefs.current[idx] = el;
              }}
              className="flow-node"
              data-active={isActive ? "true" : "false"}
              data-stage={String(idx)}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectStep(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
            >
              {stageName}
            </button>
            {idx < 3 && <i className="flow-rule" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
