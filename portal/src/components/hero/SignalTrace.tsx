"use client";

import React, { useEffect, useRef } from "react";
import { useSignalPauseController } from "@/components/motion/ReducedMotionProvider";

export interface SignalTraceProps {
  children: React.ReactNode;
}

/**
 * Tiny client wrapper controlling ONLY the orange signal trace animation:
 * - Pause/resume toggle (#v10-motion-toggle)
 * - IntersectionObserver (pauses when offscreen)
 * - Document visibility (pauses when tab is hidden)
 * - prefers-reduced-motion (disables button and pauses SVG animations)
 */
export function SignalTrace({ children }: SignalTraceProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const {
    isPaused: paused,
    userPaused,
    prefersReducedMotion: reducedMotion,
    toggleUserPause,
  } = useSignalPauseController(stageRef);

  useEffect(() => {
    document.body.dataset.page = "home";
  }, []);

  return (
    <div
      className="v10-signature-stage v12-signature-stage"
      id="v10-signature-stage"
      data-signal-paused={String(paused)}
      ref={stageRef}
    >
      <div className="v10-stage-top">
        <span>FIGURE 01 / REQUEST TO RESULT</span>
        <button
          aria-label={
            userPaused
              ? "Resume hero trace animation"
              : "Pause hero trace animation"
          }
          aria-pressed={userPaused}
          className="v10-motion-control"
          id="v10-motion-toggle"
          type="button"
          disabled={reducedMotion}
          title={
            reducedMotion
              ? "Movement disabled by your reduced-motion preference"
              : ""
          }
          onClick={toggleUserPause}
        >
          {userPaused ? (
            <>
              RESUME SIGNAL <span aria-hidden="true">▶</span>
            </>
          ) : (
            <>
              PAUSE SIGNAL <span aria-hidden="true">Ⅱ</span>
            </>
          )}
        </button>
      </div>
      {children}
      <div className="v10-stage-bottom v12-stage-bottom">
        <span>01 / DECLARE</span>
        <span>02 / COMPOSE</span>
        <span>03 / EXECUTE</span>
        <span>04 / VERIFY</span>
      </div>
    </div>
  );
}
