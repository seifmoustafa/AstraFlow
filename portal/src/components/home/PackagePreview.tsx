"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";

interface ChapterItem {
  code: string;
  slug: string;
  name: string;
  kicker: string;
  description: string;
  packageId: string;
  command: string;
}

const CHAPTERS: readonly ChapterItem[] = [
  {
    code: "01 / REQUEST",
    slug: "mediator",
    name: "Mediator",
    kicker: "INTENT-DRIVEN PIPELINES",
    description: "Typed requests, handlers, notifications, and intercepting pipeline behaviors without runtime reflection.",
    packageId: "AstraFlow.Mediator",
    command: "dotnet add package AstraFlow.Mediator",
  },
  {
    code: "02 / MAPPING",
    slug: "mapper",
    name: "Mapper",
    kicker: "EXPLICIT RULES & PROJECTIONS",
    description: "Declared mapping pairs and EF Core projections. Zero unmapped destination member surprises.",
    packageId: "AstraFlow.Mapper",
    command: "dotnet add package AstraFlow.Mapper",
  },
  {
    code: "03 / INSPECTION",
    slug: "diagnostics",
    name: "Diagnostics",
    kicker: "SOURCED EVIDENCE & GRAPHS",
    description: "Registration validation, Mermaid graph generation, and structured telemetry with privacy-safe defaults.",
    packageId: "AstraFlow.Diagnostics",
    command: "dotnet add package AstraFlow.Diagnostics",
  },
  {
    code: "04 / CONFIDENCE",
    slug: "testing",
    name: "Testing",
    kicker: "ISOLATED HARNESSES & FAKES",
    description: "Framework-neutral fakes, pipeline harnesses, and runner-neutral assertions for complete peace of mind.",
    packageId: "AstraFlow.Testing",
    command: "dotnet add package AstraFlow.Testing",
  },
  {
    code: "05 / BUILD TIME",
    slug: "generators",
    name: "Generators",
    kicker: "COMPILE-TIME VERIFICATION",
    description: "Roslyn source generators for build-time registration and Roslyn analyzers for supported patterns.",
    packageId: "AstraFlow.Generators",
    command: "dotnet add package AstraFlow.Generators",
  },
  {
    code: "06 / TOOLING",
    slug: "cli",
    name: "CLI & more",
    kicker: "MODULAR EXTENSIONS",
    description: "Stand-alone command line inspection, EF Core integration, ASP.NET Core endpoints, and OpenTelemetry.",
    packageId: "AstraFlow.Cli",
    command: "dotnet add package AstraFlow.Cli",
  },
];

/**
 * Radical Rebuild: Connected Typography-Driven Product Chapters
 * - Replaces the generic card-grid with an editorial chapter progression.
 * - Negative space and clear typographical rhythm.
 * - Contextual rail with shared active highlight and quick CLI command preview.
 * - Preserves .line-card links to /packages for full Playwright and accessibility parity.
 */
export function PackagePreview() {
  const { prefersReducedMotion } = useReducedMotionContext();
  const [activeChapter, setActiveChapter] = useState(0);

  const selected = CHAPTERS[activeChapter];

  return (
    <section
      className="editorial-panel v10-modules-section product-chapters-section"
      style={{
        padding: "clamp(56px, 7vw, 108px) 0",
        background: "var(--paper2, #fffdf7)",
        borderTop: "1px solid var(--line, #d8d0c2)",
        position: "relative",
      }}
    >
      <div className="site-wrap">
        {/* Section Head: High Typography Discipline */}
        <div
          className="section-head"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 1.3fr) minmax(280px, 1fr)",
            gap: "36px",
            alignItems: "flex-end",
            marginBottom: "48px",
          }}
        >
          <div>
            <p className="eyebrow" style={{ color: "var(--signal, #f25e3b)" }}>
              04 / MODULAR BY CHOICE
            </p>
            <h2 style={{ fontSize: "clamp(28px, 3.6vw, 46px)", lineHeight: 1.12, margin: 0 }}>
              Focused by design.
              <br />
              <span className="v10-ital" style={{ color: "var(--forest, #0a342b)" }}>
                Built to compose.
              </span>
            </h2>
          </div>
          <div>
            <p className="section-caption" style={{ margin: "0 0 16px", fontSize: "15px", lineHeight: 1.6, color: "var(--muted, #617267)" }}>
              Explore the focused packages without installing an entire stack.
              Every capability has a documented boundary and clean independence.
            </p>
            <Link className="button button-outline" href="/packages">
              Inspect all 16 packages <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Connected Chapter Chapters Track */}
        <div
          className="card-list product-chapters-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "48px",
          }}
        >
          {CHAPTERS.map((chap, idx) => {
            const isHovered = activeChapter === idx;

            return (
              <Link
                key={chap.code}
                className="line-card chapter-card"
                href="/packages"
                onMouseEnter={() => setActiveChapter(idx)}
                onFocus={() => setActiveChapter(idx)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: isHovered ? "var(--paper, #f7f3eb)" : "var(--paper2, #fffdf7)",
                  border: "1px solid",
                  borderColor: isHovered ? "var(--forest, #0a342b)" : "var(--line, #d8d0c2)",
                  borderRadius: "10px",
                  padding: "24px",
                  textDecoration: "none",
                  position: "relative",
                  transition: "all 200ms ease-out",
                  boxShadow: isHovered ? "0 8px 24px rgba(8, 44, 38, 0.08)" : "none",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <span className="index tiny" style={{ color: "var(--signal, #f25e3b)", fontWeight: 700 }}>
                      {chap.code}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "10px",
                        color: "var(--muted, #617267)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {chap.kicker}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "var(--ink, #082c26)",
                      margin: "0 0 8px",
                    }}
                  >
                    {chap.name}
                  </h3>

                  <small
                    style={{
                      fontSize: "13px",
                      lineHeight: "1.55",
                      color: "var(--muted, #617267)",
                      display: "block",
                    }}
                  >
                    {chap.description}
                  </small>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(8, 44, 38, 0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <code
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "11px",
                      color: "var(--ink2, #2f5b4e)",
                    }}
                  >
                    {chap.packageId}
                  </code>
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: "14px",
                      color: isHovered ? "var(--signal, #f25e3b)" : "var(--muted, #617267)",
                      transform: isHovered ? "translateX(2px)" : "none",
                      transition: "transform 160ms ease-out",
                    }}
                  >
                    ↗
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Start Strip: Clean Visual Finish */}
        <div
          className="v10-start-strip"
          style={{
            background: "var(--forest, #0a342b)",
            color: "#fffdf7",
            borderRadius: "12px",
            padding: "clamp(24px, 3.5vw, 40px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px",
            boxShadow: "0 16px 40px rgba(8, 44, 38, 0.2)",
          }}
        >
          <div>
            <span
              className="tiny"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--peach, #ffd2bd)",
                letterSpacing: "0.12em",
                display: "block",
                marginBottom: "6px",
              }}
            >
              READY WHEN YOU ARE
            </span>
            <h3 style={{ fontSize: "24px", fontWeight: 600, margin: "0 0 6px", color: "#fffdf7" }}>
              Begin with one responsibility.
            </h3>
            <p style={{ margin: 0, fontSize: "14px", color: "rgba(247, 243, 235, 0.82)" }}>
              Install the umbrella package or use the package atlas to choose the smallest useful dependency.
            </p>
          </div>
          <Link
            className="button button-primary"
            href="/docs"
            style={{
              background: "var(--signal, #f25e3b)",
              color: "#fffdf7",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "0 4px 14px rgba(242, 94, 59, 0.4)",
            }}
          >
            Read the quick start <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
