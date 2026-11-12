"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { PackagesChassisAlternative } from "./PackagesChassisAlternative";
import { PackagesStratumAlternative } from "./PackagesStratumAlternative";
import { FlowObservatoryAlternativeA } from "./FlowObservatoryAlternativeA";
import { FlowObservatoryAlternativeB } from "./FlowObservatoryAlternativeB";
import {
  AstraflowRouteStudy,
  AstraflowAssemblyStudy,
  AstraflowBranchworkStudy,
  AstraflowVersionSpineStudy,
  BESPOKE_HAIRLINE_MANIFEST,
} from "@/components/motion/BespokeHairlineFigures";

type Category = "packages" | "flow" | "hairline";
type ViewMode = "split" | "a" | "b";

export function CraftLabShell() {
  const [category, setCategory] = useState<Category>("packages");
  const [viewMode, setViewMode] = useState<ViewMode>("split");

  return (
    <div className="craft-lab-container" style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", paddingBottom: "100px" }}>
      {/* Lab Banner & Control Header */}
      <section
        style={{
          borderBottom: "1px solid var(--line)",
          background: "var(--paper2)",
          position: "sticky",
          top: "84px",
          zIndex: 40,
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="site-wrap" style={{ paddingBlock: "18px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "18px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--signal)",
                    boxShadow: "0 0 0 4px rgba(242, 94, 59, 0.15)",
                  }}
                />
                <span className="mono" style={{ fontSize: "11px", fontWeight: "bold", color: "var(--action)" }}>
                  ASTRAFLOW DESIGN LAB // PHASE 1 EXPERIMENTAL BENCH
                </span>
                <span
                  className="mono tiny"
                  style={{
                    padding: "3px 7px",
                    background: "rgba(8, 44, 38, 0.08)",
                    borderRadius: "3px",
                    color: "var(--muted)",
                  }}
                >
                  ROUTE: /__craft
                </span>
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "6px 0 2px", letterSpacing: "-0.04em" }}>
                Radical Creative Rebuild — Comparative Interaction Lab
              </h1>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              {/* Category selector */}
              <div
                role="tablist"
                aria-label="Experiment Category"
                style={{
                  display: "inline-flex",
                  background: "var(--sand)",
                  borderRadius: "6px",
                  padding: "3px",
                  gap: "3px",
                }}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={category === "packages"}
                  onClick={() => setCategory("packages")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "4px",
                    border: "none",
                    background: category === "packages" ? "var(--ink)" : "transparent",
                    color: category === "packages" ? "#ffffff" : "var(--ink)",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  Packages Hero (2 Concepts)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={category === "flow"}
                  onClick={() => setCategory("flow")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "4px",
                    border: "none",
                    background: category === "flow" ? "var(--ink)" : "transparent",
                    color: category === "flow" ? "#ffffff" : "var(--ink)",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  Flow Observatory (2 Concepts)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={category === "hairline"}
                  onClick={() => setCategory("hairline")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "4px",
                    border: "none",
                    background: category === "hairline" ? "var(--ink)" : "transparent",
                    color: category === "hairline" ? "#ffffff" : "var(--ink)",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  Bespoke Hairline Figures (4 Studies)
                </button>
              </div>

              {/* View mode toggle */}
              <div
                role="radiogroup"
                aria-label="View Mode"
                style={{
                  display: "inline-flex",
                  background: "var(--sand)",
                  borderRadius: "6px",
                  padding: "3px",
                  gap: "3px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode("split")}
                  aria-pressed={viewMode === "split"}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    border: "none",
                    background: viewMode === "split" ? "var(--action)" : "transparent",
                    color: viewMode === "split" ? "#ffffff" : "var(--ink)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  Side-by-Side Split
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("a")}
                  aria-pressed={viewMode === "a"}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    border: "none",
                    background: viewMode === "a" ? "var(--action)" : "transparent",
                    color: viewMode === "a" ? "#ffffff" : "var(--ink)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  Concept A Only
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("b")}
                  aria-pressed={viewMode === "b"}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    border: "none",
                    background: viewMode === "b" ? "var(--action)" : "transparent",
                    color: viewMode === "b" ? "#ffffff" : "var(--ink)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  Concept B Only
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Experiment Stage */}
      <main className="site-wrap" style={{ paddingTop: "35px" }}>
        {category === "packages" && (
          <section aria-label="Packages Hero Experiments">
            <div
              style={{
                marginBottom: "28px",
                padding: "20px 24px",
                background: "var(--paper2)",
                border: "1px solid var(--line)",
                borderLeft: "4px solid var(--action)",
                borderRadius: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span className="mono tiny" style={{ color: "var(--action)" }}>
                    CATEGORY: PACKAGES HERO & COMPOSITION BENCH
                  </span>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "6px 0 4px", letterSpacing: "-0.03em" }}>
                    Replacing the 3 Tilted Generic Cards with Purpose-Built Composition Machines
                  </h2>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "14px", maxWidth: "880px" }}>
                    Per <strong>CREATIVE-REBUILD-AUTHORIZATION.md</strong> § 53–54: The old tilted CONTRACTS/MEDIATOR/MAPPER rectangles are replaced with an open modular chassis where actual installable packages are represented by modular plates and sockets that snap into a cohesive assembly with synchronized <code>dotnet add package</code> CLI output.
                  </p>
                </div>
                <div className="mono tiny" style={{ color: "var(--ink2)" }}>
                  CONTRACT: REAL PACKAGES ONLY • ZERO FAKE DEPENDENCIES
                </div>
              </div>
            </div>

            {/* Split or Single Views */}
            {viewMode === "split" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(580px, 1fr))",
                  gap: "35px",
                }}
              >
                {/* Concept A Panel */}
                <div
                  style={{
                    background: "var(--paper2)",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    padding: "24px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "14px", marginBottom: "20px" }}>
                    <span className="mono tiny" style={{ color: "var(--signal)", fontWeight: 700 }}>
                      ALTERNATIVE A // THE MODULAR SOCKETS CHASSIS
                    </span>
                    <h3 style={{ fontSize: "18px", margin: "4px 0", letterSpacing: "-0.03em" }}>
                      Horizontal Contact Bus & Gold Pin Docking
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                      Plates snap into open chassis sockets with illuminated gold contacts, bus routing, and integrated CLI bench.
                    </p>
                  </div>
                  <PackagesChassisAlternative />
                </div>

                {/* Concept B Panel */}
                <div
                  style={{
                    background: "var(--paper2)",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    padding: "24px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "14px", marginBottom: "20px" }}>
                    <span className="mono tiny" style={{ color: "var(--action)", fontWeight: 700 }}>
                      ALTERNATIVE B // THE ISOMETRIC STRATUM WEAVER
                    </span>
                    <h3 style={{ fontSize: "18px", margin: "4px 0", letterSpacing: "-0.03em" }}>
                      Vertical Interlocking Column & Sliding Rails
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                      Vertical architectural column with interlocking strata, shallow parallax, and tactile snap notches.
                    </p>
                  </div>
                  <PackagesStratumAlternative />
                </div>
              </div>
            )}

            {viewMode === "a" && (
              <div
                style={{
                  background: "var(--paper2)",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  padding: "32px",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "16px", marginBottom: "24px" }}>
                  <span className="mono tiny" style={{ color: "var(--signal)", fontWeight: 700 }}>
                    ALTERNATIVE A // THE MODULAR SOCKETS CHASSIS
                  </span>
                  <h3 style={{ fontSize: "22px", margin: "4px 0" }}>
                    Horizontal Contact Bus & Gold Pin Docking
                  </h3>
                </div>
                <PackagesChassisAlternative />
              </div>
            )}

            {viewMode === "b" && (
              <div
                style={{
                  background: "var(--paper2)",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  padding: "32px",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "16px", marginBottom: "24px" }}>
                  <span className="mono tiny" style={{ color: "var(--action)", fontWeight: 700 }}>
                    ALTERNATIVE B // THE ISOMETRIC STRATUM WEAVER
                  </span>
                  <h3 style={{ fontSize: "22px", margin: "4px 0" }}>
                    Vertical Interlocking Column & Sliding Rails
                  </h3>
                </div>
                <PackagesStratumAlternative />
              </div>
            )}
          </section>
        )}

        {category === "hairline" && (
          <section aria-label="Bespoke Hairline Figures Experiments">
            <div
              style={{
                marginBottom: "28px",
                padding: "20px 24px",
                background: "var(--paper2)",
                border: "1px solid var(--line)",
                borderLeft: "4px solid var(--signal)",
                borderRadius: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span className="mono tiny" style={{ color: "var(--signal)" }}>
                    CATEGORY: BESPOKE HAIRLINE FIGURES // 4 ORIGINAL STUDIES
                  </span>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "6px 0 4px", letterSpacing: "-0.03em" }}>
                    Engineered from Scratch with @lucasmarkes/hairline Kernel &amp; Validation Gate
                  </h2>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "14px", maxWidth: "880px" }}>
                    Per <strong>CREATIVE-REBUILD-AUTHORIZATION.md</strong> § 61–76: Four genuinely bespoke and semantically distinct geometric studies developed using the official Hairline skill, validated against all 10 rules with <code>validate.mjs</code>, and compiled to standalone HTML artifacts.
                  </p>
                </div>
                <div className="mono tiny" style={{ color: "var(--ink2)" }}>
                  VALIDATION: 100% OK • 4/4 STANDALONE ARTIFACTS
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(540px, 1fr))",
                gap: "30px",
              }}
            >
              {/* Study 1 */}
              <div style={{ background: "var(--paper2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "20px" }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono tiny" style={{ color: "var(--signal)", fontWeight: 700 }}>STUDY 01 // ASTRAFLOW-ROUTE</span>
                    <span className="mono tiny" style={{ background: "var(--sand)", padding: "2px 6px", borderRadius: "3px" }}>RULES [1, 2, 4, 8, 10]</span>
                  </div>
                  <h3 style={{ fontSize: "17px", margin: "4px 0" }}>The Calibrated Pipeline Conduit</h3>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                    {BESPOKE_HAIRLINE_MANIFEST["astraflow-route"].metaphor}
                  </p>
                </div>
                <AstraflowRouteStudy height={290} />
              </div>

              {/* Study 2 */}
              <div style={{ background: "var(--paper2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "20px" }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono tiny" style={{ color: "var(--action)", fontWeight: 700 }}>STUDY 02 // ASTRAFLOW-ASSEMBLY</span>
                    <span className="mono tiny" style={{ background: "var(--sand)", padding: "2px 6px", borderRadius: "3px" }}>RULES [1, 3, 5, 8, 9]</span>
                  </div>
                  <h3 style={{ fontSize: "17px", margin: "4px 0" }}>The Interlocking Architectural Assembly</h3>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                    {BESPOKE_HAIRLINE_MANIFEST["astraflow-assembly"].metaphor}
                  </p>
                </div>
                <AstraflowAssemblyStudy height={290} />
              </div>

              {/* Study 3 */}
              <div style={{ background: "var(--paper2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "20px" }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono tiny" style={{ color: "var(--signal)", fontWeight: 700 }}>STUDY 03 // ASTRAFLOW-BRANCHWORK</span>
                    <span className="mono tiny" style={{ background: "var(--sand)", padding: "2px 6px", borderRadius: "3px" }}>RULES [1, 2, 4, 8, 10]</span>
                  </div>
                  <h3 style={{ fontSize: "17px", margin: "4px 0" }}>The Open Contribution Circuit</h3>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                    {BESPOKE_HAIRLINE_MANIFEST["astraflow-branchwork"].metaphor}
                  </p>
                </div>
                <AstraflowBranchworkStudy height={290} />
              </div>

              {/* Study 4 */}
              <div style={{ background: "var(--paper2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "20px" }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono tiny" style={{ color: "var(--action)", fontWeight: 700 }}>STUDY 04 // ASTRAFLOW-VERSION-SPINE</span>
                    <span className="mono tiny" style={{ background: "var(--sand)", padding: "2px 6px", borderRadius: "3px" }}>RULES [1, 2, 4, 8, 10]</span>
                  </div>
                  <h3 style={{ fontSize: "17px", margin: "4px 0" }}>The Mechanical Version Folio</h3>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                    {BESPOKE_HAIRLINE_MANIFEST["astraflow-version-spine"].metaphor}
                  </p>
                </div>
                <AstraflowVersionSpineStudy height={290} />
              </div>
            </div>
          </section>
        )}

        {category === "flow" && (
          <section aria-label="Flow Observatory Experiments">
            <div
              style={{
                marginBottom: "28px",
                padding: "20px 24px",
                background: "var(--paper2)",
                border: "1px solid var(--line)",
                borderLeft: "4px solid var(--signal)",
                borderRadius: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span className="mono tiny" style={{ color: "var(--signal)" }}>
                    CATEGORY: HOME FLOW OBSERVATORY
                  </span>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "6px 0 4px", letterSpacing: "-0.03em" }}>
                    Replacing the 3-Column Rectangular Dashboard Box with Open Spatial Instruments
                  </h2>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "14px", maxWidth: "880px" }}>
                    Per <strong>CREATIVE-REBUILD-AUTHORIZATION.md</strong> § 50: The old 3-column rectangular pseudo-dashboard is replaced with an open Flow Observatory where requests travel visibly through spatial waypoint pedestals with continuous trajectory beams and synchronized C# code lenses.
                  </p>
                </div>
                <div className="mono tiny" style={{ color: "var(--ink2)" }}>
                  CONTRACT: GUIDED DEMO • ZERO FAKE RUNTIME TELEMETRY
                </div>
              </div>
            </div>

            {/* Split or Single Views */}
            {viewMode === "split" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(580px, 1fr))",
                  gap: "35px",
                }}
              >
                {/* Concept A Panel */}
                <div
                  style={{
                    background: "var(--paper2)",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    padding: "24px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "14px", marginBottom: "20px" }}>
                    <span className="mono tiny" style={{ color: "var(--signal)", fontWeight: 700 }}>
                      ALTERNATIVE A // THE CALIBRATED PHYSICAL CONDUIT
                    </span>
                    <h3 style={{ fontSize: "18px", margin: "4px 0", letterSpacing: "-0.03em" }}>
                      Open Trajectory Beam & Flying Drop Connector
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                      Continuous physical path carrying a traveling signal between 4 spatial waypoint pedestals with synchronized inline code lens.
                    </p>
                  </div>
                  <FlowObservatoryAlternativeA />
                </div>

                {/* Concept B Panel */}
                <div
                  style={{
                    background: "var(--paper2)",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    padding: "24px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "14px", marginBottom: "20px" }}>
                    <span className="mono tiny" style={{ color: "var(--action)", fontWeight: 700 }}>
                      ALTERNATIVE B // THE ORBITAL PIPELINE CHAMBER
                    </span>
                    <h3 style={{ fontSize: "18px", margin: "4px 0", letterSpacing: "-0.03em" }}>
                      Curved Stage Bus & Spatial Docking Sectors
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                      Circular coordinate stage bus where requests travel through an optical chamber with aperture indicators.
                    </p>
                  </div>
                  <FlowObservatoryAlternativeB />
                </div>
              </div>
            )}

            {viewMode === "a" && (
              <div
                style={{
                  background: "var(--paper2)",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  padding: "32px",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "16px", marginBottom: "24px" }}>
                  <span className="mono tiny" style={{ color: "var(--signal)", fontWeight: 700 }}>
                    ALTERNATIVE A // THE CALIBRATED PHYSICAL CONDUIT
                  </span>
                  <h3 style={{ fontSize: "22px", margin: "4px 0" }}>
                    Open Trajectory Beam & Flying Drop Connector
                  </h3>
                </div>
                <FlowObservatoryAlternativeA />
              </div>
            )}

            {viewMode === "b" && (
              <div
                style={{
                  background: "var(--paper2)",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  padding: "32px",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "16px", marginBottom: "24px" }}>
                  <span className="mono tiny" style={{ color: "var(--action)", fontWeight: 700 }}>
                    ALTERNATIVE B // THE ORBITAL PIPELINE CHAMBER
                  </span>
                  <h3 style={{ fontSize: "22px", margin: "4px 0" }}>
                    Curved Stage Bus & Spatial Docking Sectors
                  </h3>
                </div>
                <FlowObservatoryAlternativeB />
              </div>
            )}
          </section>
        )}

        {category === "hairline" && (
          <section aria-label="Bespoke Hairline Figures Experiments">
            <div
              style={{
                marginBottom: "28px",
                padding: "20px 24px",
                background: "var(--paper2)",
                border: "1px solid var(--line)",
                borderLeft: "4px solid var(--signal)",
                borderRadius: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span className="mono tiny" style={{ color: "var(--signal)" }}>
                    CATEGORY: BESPOKE HAIRLINE FIGURES // 4 ORIGINAL STUDIES
                  </span>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "6px 0 4px", letterSpacing: "-0.03em" }}>
                    Engineered from Scratch with @lucasmarkes/hairline Kernel &amp; Validation Gate
                  </h2>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "14px", maxWidth: "880px" }}>
                    Per <strong>CREATIVE-REBUILD-AUTHORIZATION.md</strong> § 61–76: Four genuinely bespoke and semantically distinct geometric studies developed using the official Hairline skill, validated against all 10 rules with <code>validate.mjs</code>, and compiled to standalone HTML artifacts.
                  </p>
                </div>
                <div className="mono tiny" style={{ color: "var(--ink2)" }}>
                  VALIDATION: 100% OK • 4/4 STANDALONE ARTIFACTS
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(540px, 1fr))",
                gap: "30px",
              }}
            >
              {/* Study 1 */}
              <div style={{ background: "var(--paper2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "20px" }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono tiny" style={{ color: "var(--signal)", fontWeight: 700 }}>STUDY 01 // ASTRAFLOW-ROUTE</span>
                    <span className="mono tiny" style={{ background: "var(--sand)", padding: "2px 6px", borderRadius: "3px" }}>RULES [1, 2, 4, 8, 10]</span>
                  </div>
                  <h3 style={{ fontSize: "17px", margin: "4px 0" }}>The Calibrated Pipeline Conduit</h3>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                    {BESPOKE_HAIRLINE_MANIFEST["astraflow-route"].metaphor}
                  </p>
                </div>
                <AstraflowRouteStudy height={290} />
              </div>

              {/* Study 2 */}
              <div style={{ background: "var(--paper2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "20px" }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono tiny" style={{ color: "var(--action)", fontWeight: 700 }}>STUDY 02 // ASTRAFLOW-ASSEMBLY</span>
                    <span className="mono tiny" style={{ background: "var(--sand)", padding: "2px 6px", borderRadius: "3px" }}>RULES [1, 3, 5, 8, 9]</span>
                  </div>
                  <h3 style={{ fontSize: "17px", margin: "4px 0" }}>The Interlocking Architectural Assembly</h3>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                    {BESPOKE_HAIRLINE_MANIFEST["astraflow-assembly"].metaphor}
                  </p>
                </div>
                <AstraflowAssemblyStudy height={290} />
              </div>

              {/* Study 3 */}
              <div style={{ background: "var(--paper2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "20px" }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono tiny" style={{ color: "var(--signal)", fontWeight: 700 }}>STUDY 03 // ASTRAFLOW-BRANCHWORK</span>
                    <span className="mono tiny" style={{ background: "var(--sand)", padding: "2px 6px", borderRadius: "3px" }}>RULES [1, 2, 4, 8, 10]</span>
                  </div>
                  <h3 style={{ fontSize: "17px", margin: "4px 0" }}>The Open Contribution Circuit</h3>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                    {BESPOKE_HAIRLINE_MANIFEST["astraflow-branchwork"].metaphor}
                  </p>
                </div>
                <AstraflowBranchworkStudy height={290} />
              </div>

              {/* Study 4 */}
              <div style={{ background: "var(--paper2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "20px" }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono tiny" style={{ color: "var(--action)", fontWeight: 700 }}>STUDY 04 // ASTRAFLOW-VERSION-SPINE</span>
                    <span className="mono tiny" style={{ background: "var(--sand)", padding: "2px 6px", borderRadius: "3px" }}>RULES [1, 2, 4, 8, 10]</span>
                  </div>
                  <h3 style={{ fontSize: "17px", margin: "4px 0" }}>The Mechanical Version Folio</h3>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                    {BESPOKE_HAIRLINE_MANIFEST["astraflow-version-spine"].metaphor}
                  </p>
                </div>
                <AstraflowVersionSpineStudy height={290} />
              </div>
            </div>
          </section>
        )}

        {/* Engineering Evaluation Matrix */}
        <section
          style={{
            marginTop: "60px",
            padding: "30px",
            background: "var(--paper2)",
            border: "1px solid var(--line)",
            borderRadius: "8px",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <span className="mono tiny" style={{ color: "var(--action)" }}>
              EVALUATION MATRIX // ARCHITECTURAL TRADE-OFFS
            </span>
            <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "6px 0", letterSpacing: "-0.04em" }}>
              Design Lab Comparison Criteria (CREATIVE-REBUILD-AUTHORIZATION.md § Phase 1)
            </h3>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--ink)" }}>
                  <th style={{ padding: "10px 14px" }} className="mono tiny">Criteria</th>
                  <th style={{ padding: "10px 14px" }} className="mono tiny">Concept A (Chassis / Conduit)</th>
                  <th style={{ padding: "10px 14px" }} className="mono tiny">Concept B (Stratum / Orbital)</th>
                  <th style={{ padding: "10px 14px" }} className="mono tiny">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 700 }}>Spatial Object</td>
                  <td style={{ padding: "12px 14px", color: "var(--ink2)" }}>Horizontal docking chassis & straight trajectory beam</td>
                  <td style={{ padding: "12px 14px", color: "var(--ink2)" }}>Vertical interlocking column & radial orbital chamber</td>
                  <td style={{ padding: "12px 14px", color: "var(--action)", fontWeight: 700 }}>Concept A: Highest legibility on desktop & mobile</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 700 }}>Event Model</td>
                  <td style={{ padding: "12px 14px", color: "var(--ink2)" }}>Deterministic state machine with immediate interruptibility</td>
                  <td style={{ padding: "12px 14px", color: "var(--ink2)" }}>Sector rotation & depth displacement with spring physics</td>
                  <td style={{ padding: "12px 14px", color: "var(--action)", fontWeight: 700 }}>Concept A: Zero stale code flash under rapid switching</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 700 }}>Mobile Adaptation</td>
                  <td style={{ padding: "12px 14px", color: "var(--ink2)" }}>Smoothly stacks to 1-column rail without SVG clipping</td>
                  <td style={{ padding: "12px 14px", color: "var(--ink2)" }}>Compact radial gauge requiring aspect ratio scaling</td>
                  <td style={{ padding: "12px 14px", color: "var(--action)", fontWeight: 700 }}>Concept A: Natural document reflow at 320px–390px</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 700 }}>Accessibility (WCAG)</td>
                  <td style={{ padding: "12px 14px", color: "var(--ink2)" }}>Full roving arrow navigation, aria-pressed, aria-live</td>
                  <td style={{ padding: "12px 14px", color: "var(--ink2)" }}>Roving focus across radial/column tabs</td>
                  <td style={{ padding: "12px 14px", color: "var(--action)", fontWeight: 700 }}>Both: 100% keyboard and screen-reader operable</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
