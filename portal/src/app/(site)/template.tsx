"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function RouteTemplate({ children }: { children: ReactNode }) {
  const sweepRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof Element === "undefined" ||
      typeof Element.prototype.animate !== "function"
    ) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const animations: Animation[] = [];

    if (sweepRef.current) {
      try {
        animations.push(
          sweepRef.current.animate(
            [
              { transform: "scaleX(0)", opacity: 0.95 },
              { transform: "scaleX(1)", opacity: 0.92, offset: 0.7 },
              { transform: "scaleX(1)", opacity: 0 },
            ],
            {
              duration: 500,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "none",
            }
          )
        );
      } catch {
        // Ignore in environments lacking WAAPI support
      }
    }

    if (stageRef.current) {
      try {
        animations.push(
          stageRef.current.animate(
            [
              { transform: "translate3d(0, 10px, 0)", opacity: 1 },
              { transform: "translate3d(0, 0, 0)", opacity: 1 },
            ],
            {
              duration: 360,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "none",
            }
          )
        );
      } catch {
        // Ignore in environments lacking WAAPI support
      }
    }

    return () => {
      for (const anim of animations) {
        anim.cancel();
      }
    };
  }, []);

  return (
    <div className="af-route-shell">
      <div ref={sweepRef} className="af-route-sweep" aria-hidden="true" />
      <div ref={stageRef} className="af-route-stage">
        {children}
      </div>
    </div>
  );
}
