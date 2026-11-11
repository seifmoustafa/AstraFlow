import React from "react";

export interface AstraFlowLogoProps {
  variant?: "color" | "mono" | "mark-only" | "lockup";
  size?: number | { width: number; height: number };
  className?: string;
  showSubtitle?: boolean;
}

export function AstraFlowLogoMark({
  width = 36,
  height = 29,
  className = "",
  variant = "color",
}: {
  width?: number;
  height?: number;
  className?: string;
  variant?: "color" | "mono";
}) {
  const isMono = variant === "mono";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 270 215"
      role="img"
      aria-label="AstraFlow Logo Mark"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {!isMono && (
          <>
            <linearGradient id="af-mineral-dark" x1="0" y1="0" x2="0.2" y2="1">
              <stop stopColor="#FFFDF6" />
              <stop offset="1" stopColor="#E7E7E3" />
            </linearGradient>
            <linearGradient id="af-mineral-light" x1="0" y1="0" x2="0.2" y2="1">
              <stop stopColor="#243342" />
              <stop offset="1" stopColor="#172231" />
            </linearGradient>
            <linearGradient id="af-flow" x1="0" y1="0" x2="0.9" y2="0.8">
              <stop stopColor="#79E0E3" />
              <stop offset=".55" stopColor="#72D5DE" />
              <stop offset="1" stopColor="#83DCDD" />
            </linearGradient>
            <linearGradient id="af-metal" x1="0" y1="0" x2="1" y2="0.5">
              <stop stopColor="#E4AF82" />
              <stop offset="1" stopColor="#D49B70" />
            </linearGradient>
          </>
        )}
      </defs>
      <g transform="translate(0 0) scale(1)">
        {/* Top/Main Mineral Path - adapts in light mode for AA contrast on white backgrounds */}
        <path
          d="M129 7 H173 L222 87 H181 L152 40 L98 129 C92 139 87 143 77 143 H44 Z"
          className={!isMono ? "fill-[url(#af-mineral-dark)] [html[data-theme='light']_&]:fill-[url(#af-mineral-light)]" : ""}
          fill={isMono ? "currentColor" : "url(#af-mineral-dark)"}
        />
        {/* Signature Cyan Flow Path */}
        <path
          d="M30 166 H91 C104 166 111 160 119 148 L137 116 C147 102 157 98 169 98 H230 L249 128 H177 C165 128 160 134 154 144 L132 180 C119 196 107 200 89 200 H10 Z"
          fill={isMono ? "currentColor" : "url(#af-flow)"}
        />
        {/* Copper Metal Terminal Accent */}
        <path
          d="M199 145 H237 L259 182 H220 Z"
          fill={isMono ? "currentColor" : "url(#af-metal)"}
        />
      </g>
    </svg>
  );
}

export function AstraFlowLogo({
  variant = "lockup",
  size = 32,
  className = "",
  showSubtitle = true,
}: AstraFlowLogoProps) {
  const markWidth = typeof size === "number" ? (size * 270) / 215 : size.width;
  const markHeight = typeof size === "number" ? size : size.height;

  if (variant === "mark-only" || variant === "color") {
    return <AstraFlowLogoMark width={markWidth} height={markHeight} className={className} />;
  }

  if (variant === "mono") {
    return <AstraFlowLogoMark width={markWidth} height={markHeight} className={className} variant="mono" />;
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <AstraFlowLogoMark width={markWidth} height={markHeight} />
      <div className="flex flex-col justify-center leading-none">
        <span
          className="text-lg font-bold tracking-tight text-[var(--af-text-primary)]"
          style={{ letterSpacing: "-0.02em" }}
        >
          AstraFlow
        </span>
        {showSubtitle && (
          <span
            className="text-[9px] uppercase font-mono tracking-widest text-[var(--af-text-subtle)] mt-1"
            style={{ letterSpacing: "0.15em" }}
          >
            Engineered Clarity
          </span>
        )}
      </div>
    </div>
  );
}
