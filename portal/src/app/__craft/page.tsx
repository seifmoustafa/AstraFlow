"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { FlowObservatoryAlternativeA } from "@/components/craft/FlowObservatoryAlternativeA";
import { FlowObservatoryAlternativeB } from "@/components/craft/FlowObservatoryAlternativeB";
import { PackagesChassisAlternative } from "@/components/craft/PackagesChassisAlternative";
import { PackagesStratumAlternative } from "@/components/craft/PackagesStratumAlternative";

type CraftSection = "flow" | "packages" | "all";
type FlowVariant = "conduit" | "chamber";
type PackagesVariant = "chassis" | "stratum";

export default function CraftLabPage() {
  const [section, setSection] = useState<CraftSection>("flow");
  const [flowVariant, setFlowVariant] = useState<FlowVariant>("conduit");
  const [packagesVariant, setPackagesVariant] = useState<PackagesVariant>("chassis");

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#082c26] font-sans antialiased selection:bg-[#f25e3b] selection:text-[#ffffff]">
      {/* Design Lab Top Bar */}
      <header className="sticky top-0 z-50 bg-[#f7f3eb]/90 backdrop-blur-md border-b border-[#d6d3c8] px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono text-[#62766b] hover:text-[#082c26] flex items-center gap-1.5 transition-colors"
            >
              <span>← Back to Portal</span>
            </Link>
            <span className="text-[#d6d3c8]">/</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f25e3b] animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#082c26]">
                AstraFlow Creative Lab (`/__craft`)
              </span>
            </div>
            <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#082c26] text-[#f7f3eb]">
              PHASE 1 SPATIAL INVENTIONS
            </span>
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#eee7dc] border border-[#d6d3c8]">
            <button
              type="button"
              onClick={() => setSection("flow")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                section === "flow"
                  ? "bg-[#082c26] text-[#f7f3eb] font-semibold shadow-sm"
                  : "text-[#62766b] hover:text-[#082c26]"
              }`}
            >
              Flow Observatory (2)
            </button>
            <button
              type="button"
              onClick={() => setSection("packages")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                section === "packages"
                  ? "bg-[#082c26] text-[#f7f3eb] font-semibold shadow-sm"
                  : "text-[#62766b] hover:text-[#082c26]"
              }`}
            >
              Packages Hero (2)
            </button>
            <button
              type="button"
              onClick={() => setSection("all")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                section === "all"
                  ? "bg-[#082c26] text-[#f7f3eb] font-semibold shadow-sm"
                  : "text-[#62766b] hover:text-[#082c26]"
              }`}
            >
              All Spatial Studies
            </button>
          </div>
        </div>
      </header>

      {/* Main Workbench Body */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-16">
        {/* Lab Overview Header */}
        <div className="border-b border-[#d6d3c8] pb-8">
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs text-[#f25e3b] font-semibold uppercase tracking-widest">
              DIRECTIVE: CREATIVE REBUILD AUTHORIZATION
            </span>
            <h1 className="text-3xl md:text-5xl font-serif text-[#082c26] tracking-tight leading-tight">
              Radical Interactive Inventions
            </h1>
            <p className="text-sm md:text-base text-[#62766b] leading-relaxed">
              Evaluating two genuinely distinct spatial objects, event models, and compositions for
              both the Home Flow Observatory and Packages Hero. These are working engineering
              instruments with live C# contracts, not decorative UI skins.
            </p>
          </div>
        </div>

        {/* 1. FLOW OBSERVATORY ALTERNATIVES */}
        {(section === "flow" || section === "all") && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#eee7dc] border border-[#d6d3c8]">
              <div>
                <span className="font-mono text-xs text-[#f25e3b] font-bold uppercase">
                  EXPERIENCE A / HOME OBSERVATORY
                </span>
                <h2 className="text-xl md:text-2xl font-serif text-[#082c26]">
                  Flow Execution Observatory
                </h2>
                <p className="text-xs text-[#62766b] mt-0.5">
                  Replacing the old 3-column rectangular dashboard with an open, living request path.
                </p>
              </div>

              {/* Variant Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFlowVariant("conduit")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    flowVariant === "conduit"
                      ? "bg-[#f25e3b] text-[#ffffff] font-semibold shadow-sm"
                      : "bg-[#f7f3eb] text-[#082c26] border border-[#d6d3c8] hover:border-[#62766b]"
                  }`}
                >
                  Alt A: Calibrated Conduit
                </button>
                <button
                  type="button"
                  onClick={() => setFlowVariant("chamber")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    flowVariant === "chamber"
                      ? "bg-[#f25e3b] text-[#ffffff] font-semibold shadow-sm"
                      : "bg-[#f7f3eb] text-[#082c26] border border-[#d6d3c8] hover:border-[#62766b]"
                  }`}
                >
                  Alt B: Orbital Chamber
                </button>
              </div>
            </div>

            {/* Render Selected Variant */}
            <div className="rounded-2xl border border-[#d6d3c8] bg-[#082c26] p-4 md:p-8 shadow-xl">
              <AnimatePresence mode="wait">
                {flowVariant === "conduit" ? (
                  <motion.div
                    key="flow-conduit"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-4 flex items-center justify-between text-xs font-mono text-[#92a69a] pb-3 border-b border-[#16443a]">
                      <span>VARIANT A: LINEAR MECHANICAL CONDUIT & OPTICAL CODE LENS</span>
                      <span className="text-[#f25e3b]">INTERACTIVE DEMO</span>
                    </div>
                    <FlowObservatoryAlternativeA />
                  </motion.div>
                ) : (
                  <motion.div
                    key="flow-chamber"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-4 flex items-center justify-between text-xs font-mono text-[#92a69a] pb-3 border-b border-[#16443a]">
                      <span>VARIANT B: ORBITAL TRAJECTORY CHAMBER & RADIAL FOCUS</span>
                      <span className="text-[#f25e3b]">INTERACTIVE DEMO</span>
                    </div>
                    <FlowObservatoryAlternativeB />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* 2. PACKAGES HERO ALTERNATIVES */}
        {(section === "packages" || section === "all") && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#eee7dc] border border-[#d6d3c8]">
              <div>
                <span className="font-mono text-xs text-[#f25e3b] font-bold uppercase">
                  EXPERIENCE B / PACKAGES HERO
                </span>
                <h2 className="text-xl md:text-2xl font-serif text-[#082c26]">
                  Modular Package Assembly
                </h2>
                <p className="text-xs text-[#62766b] mt-0.5">
                  Replacing the 3 tilted rectangle cards with a physical composition machine.
                </p>
              </div>

              {/* Variant Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPackagesVariant("chassis")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    packagesVariant === "chassis"
                      ? "bg-[#f25e3b] text-[#ffffff] font-semibold shadow-sm"
                      : "bg-[#f7f3eb] text-[#082c26] border border-[#d6d3c8] hover:border-[#62766b]"
                  }`}
                >
                  Alt A: Modular Chassis
                </button>
                <button
                  type="button"
                  onClick={() => setPackagesVariant("stratum")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    packagesVariant === "stratum"
                      ? "bg-[#f25e3b] text-[#ffffff] font-semibold shadow-sm"
                      : "bg-[#f7f3eb] text-[#082c26] border border-[#d6d3c8] hover:border-[#62766b]"
                  }`}
                >
                  Alt B: Stratum Weaver
                </button>
              </div>
            </div>

            {/* Render Selected Variant */}
            <div className="rounded-2xl border border-[#d6d3c8] bg-[#f7f3eb] p-4 md:p-8 shadow-xl">
              <AnimatePresence mode="wait">
                {packagesVariant === "chassis" ? (
                  <motion.div
                    key="packages-chassis"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-4 flex items-center justify-between text-xs font-mono text-[#62766b] pb-3 border-b border-[#d6d3c8]">
                      <span>VARIANT A: PHYSICAL EQUIPMENT BUS WITH 5 MODULAR BAYS</span>
                      <span className="text-[#f25e3b]">LIVE DOCKING ENGINE</span>
                    </div>
                    <PackagesChassisAlternative />
                  </motion.div>
                ) : (
                  <motion.div
                    key="packages-stratum"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-4 flex items-center justify-between text-xs font-mono text-[#62766b] pb-3 border-b border-[#d6d3c8]">
                      <span>VARIANT B: VERTICAL ISOMETRIC STRATA & DEPTH WEAVER</span>
                      <span className="text-[#f25e3b]">AXONOMETRIC HARNESS</span>
                    </div>
                    <PackagesStratumAlternative />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Evaluation Matrix & Craft Sign-off */}
        <section className="p-6 md:p-8 rounded-2xl bg-[#eee7dc] border border-[#d6d3c8] space-y-6">
          <div className="border-b border-[#d6d3c8] pb-4">
            <span className="font-mono text-xs text-[#f25e3b] font-bold uppercase">
              PHASE 1 EVALUATION SCORECARD
            </span>
            <h3 className="text-2xl font-serif text-[#082c26] mt-1">
              Design Engineering Assessment
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-[#f7f3eb] border border-[#d6d3c8] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm font-bold text-[#082c26]">
                  Flow Observatory: Alt A vs Alt B
                </h4>
                <span className="text-[11px] font-mono text-[#f25e3b] bg-[#f7f3eb] px-2 py-0.5 rounded border border-[#f25e3b]">
                  RECOMMENDED: ALT A
                </span>
              </div>
              <p className="text-xs text-[#62766b] leading-relaxed">
                <strong>Alt A (Calibrated Conduit):</strong> Offers superior linear scanning, immediate
                spatial correlation with C# code lines, and flawless mobile responsiveness. The drop
                connector physically docks with the code lens.
              </p>
              <p className="text-xs text-[#62766b] leading-relaxed">
                <strong>Alt B (Orbital Chamber):</strong> Visually striking radial presence with a
                crosshair reticle, suitable for circular spatial reviews.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f7f3eb] border border-[#d6d3c8] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm font-bold text-[#082c26]">
                  Packages Hero: Alt A vs Alt B
                </h4>
                <span className="text-[11px] font-mono text-[#f25e3b] bg-[#f7f3eb] px-2 py-0.5 rounded border border-[#f25e3b]">
                  RECOMMENDED: ALT A
                </span>
              </div>
              <p className="text-xs text-[#62766b] leading-relaxed">
                <strong>Alt A (Modular Chassis):</strong> Tactile equipment bus with gold contact pins
                and instant `dotnet add` synchronization. Provides unmistakable physical feedback
                when packages dock or undock.
              </p>
              <p className="text-xs text-[#62766b] leading-relaxed">
                <strong>Alt B (Stratum Weaver):</strong> Elegant architectural perspective stack with
                depth elevation and vertical bus line connections.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
