"use client";

import React from "react";
import { HeroSection } from "./HeroSection";
import { FlowSimulatorShowcase } from "./FlowSimulatorShowcase";
import { BenchmarkShowcase } from "./BenchmarkShowcase";
import { CodeComparisonShowcase } from "./CodeComparisonShowcase";
import { AnalyzerDiagnosticsShowcase } from "./AnalyzerDiagnosticsShowcase";
import { PackageEcosystemGrid } from "./PackageEcosystemGrid";

export function LandingView() {
  return (
    <div className="w-full">
      {/* Pattern A Hero Section */}
      <HeroSection />

      {/* Showcase 01: Flow Simulator */}
      <FlowSimulatorShowcase />

      {/* Showcase 02: Transparent Benchmarks */}
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
