"use client";

import React from "react";

export interface MobileNavigationProps {
  open: boolean;
  onToggle: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function MobileNavigation({
  open,
  onToggle,
  buttonRef,
}: MobileNavigationProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className="mobile-menu"
      aria-controls="main-menu"
      aria-expanded={open}
      aria-label="Toggle navigation menu"
      onClick={onToggle}
    >
      {open ? "Close ✕" : "Menu ☰"}
    </button>
  );
}
