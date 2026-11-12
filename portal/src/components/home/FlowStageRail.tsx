"use client";

import React, { useRef } from "react";
import { motion } from "motion/react";
import {
  useFlowStageSynchronizer,
  useReducedMotionContext,
} from "@/components/motion/ReducedMotionProvider";

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
  const { prefersReducedMotion } = useReducedMotionContext();
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
      data-active-step={String(step)}
      aria-label={`Guided flow, step ${step + 1} of 4`}
      style={
        {
          "--v11-stage-progress": progress,
          "--v12-stage-x": `${stageX}px`,
        } as React.CSSProperties
      }
    >
      <div className="v12-stage-current" aria-hidden="true">
        <motion.span
          className="v12-stage-beam"
          initial={false}
          animate={{ width: progress }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }
          }
        />
        <motion.span
          className="v12-stage-travel"
          initial={false}
          animate={{ x: stageX }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                  mass: 0.72,
                }
          }
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
        const isCompleted = idx < step;

        return (
          <React.Fragment key={idx}>
            <button
              ref={(el) => {
                nodeRefs.current[idx] = el;
              }}
              className="flow-node"
              data-active={isActive ? "true" : "false"}
              data-completed={isCompleted ? "true" : "false"}
              data-stage={String(idx)}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectStep(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{ position: "relative", overflow: "hidden" }}
            >
              {isActive && (
                <motion.span
                  layoutId="flow-stage-active-outline"
                  className="v12-stage-active-outline"
                  aria-hidden="true"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                          mass: 0.68,
                        }
                  }
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    border: "1px solid rgba(242, 94, 59, 0.75)",
                    background: "rgba(242, 94, 59, 0.10)",
                    pointerEvents: "none",
                  }}
                />
              )}
              {stageName}
            </button>
            {idx < 3 && (
              <i
                className="flow-rule"
                data-completed={isCompleted ? "true" : "false"}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
