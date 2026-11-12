"use client";

import React, { useEffect, useRef, useState } from "react";

export interface CodeExampleProps {
  code: string;
}

export function CodeExample({ code }: CodeExampleProps) {
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

  return (
    <div className="flow-code v12-flow-code">
      <div className="v12-code-edge" aria-hidden="true" />
      <div className="frame-dots">
        <i />
        <i />
        <i />
      </div>
      <p className="tiny">EXAMPLE.CS / DOCUMENTED SHAPE</p>
      <pre
        id="flow-code"
        tabIndex={0}
        className={swapping ? "v12-swap" : undefined}
      >
        {code}
      </pre>
      <button
        type="button"
        className="v11-code-copy"
        aria-label="Copy the currently displayed C# code example"
        onClick={handleCopy}
      >
        {copyLabel}
      </button>
    </div>
  );
}
