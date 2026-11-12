"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePortal } from "@/context/PortalContext";
import { HeroSection } from "./HeroSection";
import { FlowSimulatorShowcase } from "./FlowSimulatorShowcase";
import { BenchmarkShowcase } from "./BenchmarkShowcase";
import { CodeComparisonShowcase } from "./CodeComparisonShowcase";
import { AnalyzerDiagnosticsShowcase } from "./AnalyzerDiagnosticsShowcase";
import { PackageEcosystemGrid } from "./PackageEcosystemGrid";
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  GitBranch,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export function LandingView() {
  const { locale } = usePortal();
  const [activeVisualTab, setActiveVisualTab] = useState<number>(0);

  const visuals = [
    {
      title: "v2.4 Bento Architecture & Ecosystem",
      tag: "Architectural Overview",
      description:
        "High-craft layout illustrating the layered boundaries between Contracts, Core Dispatch, Compile-Time Mapping, and Runner-Neutral Assertions.",
      src: "/images/brand/astraflow-campaign-bento-v24.jpg",
      alt: "AstraFlow v2.4 Bento Architecture",
    },
    {
      title: "Pipeline Monolith & Explicit Trace",
      tag: "Execution Discipline",
      description:
        "Visualizing deterministic request progression through validation, security redaction, telemetry tracing, and handler execution.",
      src: "/images/brand/astraflow-campaign-monolith.jpg",
      alt: "AstraFlow Pipeline Monolith",
    },
    {
      title: "Layered Engine Stack",
      tag: "Modular Anatomy",
      description:
        "Separation of concerns across runtime abstractions and optional EF Core / OpenTelemetry integrations.",
      src: "/images/brand/astraflow-campaign-stack.jpg",
      alt: "AstraFlow Layered Engine Stack",
    },
    {
      title: "Roslyn Compiler Toolkit",
      tag: "Tooling & Diagnostics",
      description:
        "Statically verifying application flows during compilation with custom analyzers and source generators.",
      src: "/images/brand/astraflow-campaign-toolkit.jpg",
      alt: "AstraFlow Compiler Toolkit",
    },
  ];

  return (
    <div className="w-full">
      {/* Pattern A Editorial Hero Section */}
      <HeroSection />

      {/* Visual Architectural Showcase (Bento / Editorial Gallery) */}
      <section className="py-16 border-b border-[var(--af-border)] bg-[var(--af-bg-canvas)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono font-medium text-[var(--af-accent)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] mb-3">
                <Layers className="w-3.5 h-3.5" />
                <span>ARCHITECTURAL GALLERY · THE TRACE V0.2</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--af-text-primary)]">
                {locale === "ar"
                  ? "معرض المعمارية والهوية البصرية"
                  : "Engineered Architecture in Detail"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--af-text-secondary)] mt-1 max-w-xl">
                {locale === "ar"
                  ? "استكشف الرسوم البيانية والمعمارية عالية الدقة التي توضح حدود الحزم وتدفق البيانات الصريح."
                  : "Inspect visual architectures, bento overviews, and execution pipelines engineered for absolute clarity."}
              </p>
            </div>

            {/* Visual Switcher Tabs */}
            <div className="flex flex-wrap gap-2">
              {visuals.map((vis, idx) => (
                <button
                  key={vis.title}
                  onClick={() => setActiveVisualTab(idx)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-af cursor-pointer border ${
                    activeVisualTab === idx
                      ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold border-[var(--af-accent)]"
                      : "bg-[var(--af-bg-surface)] text-[var(--af-text-secondary)] border-[var(--af-border)] hover:border-[var(--af-text-secondary)]"
                  }`}
                >
                  {vis.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Active Image Showcase Box */}
          <div className="rounded-[var(--af-radius-card)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] overflow-hidden shadow-lg">
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-[var(--af-bg-canvas)] overflow-hidden">
              <Image
                src={visuals[activeVisualTab].src}
                alt={visuals[activeVisualTab].alt}
                fill
                priority
                className="object-cover object-center transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--af-bg-surface)] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="bg-[var(--af-bg-surface)]/90 backdrop-blur-md p-4 rounded-lg border border-[var(--af-border)] max-w-2xl shadow-md">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--af-accent)] font-semibold block mb-1">
                    {visuals[activeVisualTab].tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--af-text-primary)] mb-1">
                    {visuals[activeVisualTab].title}
                  </h3>
                  <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
                    {visuals[activeVisualTab].description}
                  </p>
                </div>

                <Link
                  href="/architecture"
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold text-xs hover:opacity-90 transition-af shadow-xs"
                >
                  <span>{locale === "ar" ? "افتح في مركز المعمارية" : "Explore in Architecture Hub"}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase 01: Flow Trace Pipeline Simulator */}
      <FlowSimulatorShowcase />

      {/* Showcase 02: Transparent Benchmarks & Allocations */}
      <BenchmarkShowcase />

      {/* Showcase 03: Split-View Code Comparisons */}
      <CodeComparisonShowcase />

      {/* Showcase 04: Roslyn Analyzers & Generators */}
      <AnalyzerDiagnosticsShowcase />

      {/* Showcase 05: 16-Package Modular Ecosystem */}
      <PackageEcosystemGrid />
    </div>
  );
}
