"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";

export interface CodeExampleProps {
  code: string;
  emphasizedLines?: readonly number[];
  stateKey?: string;
  stageBadge?: string;
}

export function CodeExample({
  code,
  emphasizedLines = [],
  stateKey = "default",
  stageBadge,
}: CodeExampleProps) {
  const { prefersReducedMotion } = useReducedMotionContext();
  const [swapping, setSwapping] = useState(false);
  const [copyLabel, setCopyLabel] = useState("COPY EXAMPLE  ↗");
  const isFirstRender = useRef(true);
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSwapping(true);
    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    swapTimerRef.current = setTimeout(() => {
      setSwapping(false);
    }, 90);

    return () => {
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    };
  }, [code]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopyLabel("COPIED ✓");
    } catch {
      setCopyLabel("SELECT CODE TO COPY");
    }

    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopyLabel("COPY EXAMPLE  ↗");
    }, 1700);
  };

  const lines = code.split("\n");
  const hasEmphasis = emphasizedLines.length > 0;

  return (
    <div className="flow-code v12-flow-code" data-state-key={stateKey}>
      <div className="v12-code-edge" aria-hidden="true" />
      <div className="frame-dots">
        <i />
        <i />
        <i />
      </div>
      <p className="tiny">
        EXAMPLE.CS / DOCUMENTED SHAPE
        {stageBadge ? ` · ${stageBadge}` : ""}
      </p>
      <motion.pre
        key={stateKey}
        id="flow-code"
        tabIndex={0}
        className={swapping ? "v12-swap" : undefined}
        initial={prefersReducedMotion ? false : { opacity: 0.42, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.24, ease: [0.22, 0.75, 0.19, 1] }
        }
      >
        {lines.map((lineText, idx) => {
          const lineNumber = idx + 1;
          const isEmphasized = emphasizedLines.includes(lineNumber);
          const suffix = idx < lines.length - 1 ? "\n" : "";

          return (
            <span
              key={lineNumber}
              className="v12-code-line"
              data-line={lineNumber}
              data-emphasized={isEmphasized ? "true" : "false"}
              style={
                hasEmphasis
                  ? {
                      display: "inline-block",
                      width: "calc(100% + 12px)",
                      marginInlineStart: "-8px",
                      paddingInlineStart: isEmphasized ? "6px" : "8px",
                      borderInlineStart: isEmphasized
                        ? "2px solid var(--signal, #f25e3b)"
                        : "2px solid transparent",
                      backgroundColor: isEmphasized
                        ? "rgba(242, 94, 59, 0.14)"
                        : "transparent",
                      color: isEmphasized
                        ? "#fffdf7"
                        : "rgba(232, 241, 235, 0.72)",
                      borderRadius: "2px",
                      transition:
                        "background-color 180ms ease-out, color 180ms ease-out, border-color 180ms ease-out",
                    }
                  : undefined
              }
            >
              {lineText}
              {suffix}
            </span>
          );
        })}
      </motion.pre>
      <button
        type="button"
        className="v11-code-copy"
        data-copied={copyLabel === "COPIED ✓" ? "true" : "false"}
        aria-label="Copy the currently displayed C# code example"
        onClick={handleCopy}
      >
        {copyLabel}
      </button>
    </div>
  );
}
