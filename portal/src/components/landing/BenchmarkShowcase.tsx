"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import {
  BarChart3,
  Cpu,
  Zap,
  Info,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  HardDrive,
} from "lucide-react";

interface BenchmarkRow {
  method: string;
  category: "warm" | "cold" | "scale";
  mean: string;
  allocated: string;
  relativeRatio: string;
  notes: string;
  isHero?: boolean;
}

// 100% REAL benchmark data committed in docs/benchmark-results/v2.1-draft/
const realBenchmarkData: BenchmarkRow[] = [
  // Warm Mapping Benchmarks (from generated-mapping-bdn-mapperly-short.md)
  {
    method: "Manual Handwritten Construction",
    category: "warm",
    mean: "5.641 ns",
    allocated: "32 B",
    relativeRatio: "1.00x",
    notes: "Direct handwritten C# two-property non-null construction (±2.86 ns CI)",
  },
  {
    method: "AstraFlow Generated Mapping (v2.1+)",
    category: "warm",
    mean: "11.987 ns",
    allocated: "32 B",
    relativeRatio: "2.13x",
    notes: "Compile-time generated direct typed call without reflection (±5.54 ns CI)",
    isHero: true,
  },
  {
    method: "MapperlyGenerated 4.3.1 (Private Reference)",
    category: "warm",
    mean: "11.645 ns",
    allocated: "32 B",
    relativeRatio: "2.07x",
    notes: "Benchmark-only private dependency; direct-call means too close to support speed ranking",
  },
  {
    method: "AstraFlow Runtime Reflection Mapper",
    category: "warm",
    mean: "133.820 ns",
    allocated: "264 B",
    relativeRatio: "23.73x",
    notes: "Runtime dynamic mapping rule dictionary lookup (8.25x allocation ratio)",
  },

  // Cold Start Process Launches (from generated-mapping-first-call-cold.md)
  {
    method: "Manual First Call (Cold Start)",
    category: "cold",
    mean: "746.6 μs",
    allocated: "N/A (Process JIT)",
    relativeRatio: "1.07x",
    notes: "Mean of 10 isolated cold process launches (±296.4 μs CI)",
  },
  {
    method: "AstraFlow Generated First Call (Cold Start)",
    category: "cold",
    mean: "691.4 μs",
    allocated: "N/A (Process JIT)",
    relativeRatio: "0.99x",
    notes: "First mapping invocation after setup across 10 cold process launches",
    isHero: true,
  },
  {
    method: "Mapperly First Call (Cold Start)",
    category: "cold",
    mean: "530.9 μs",
    allocated: "N/A (Process JIT)",
    relativeRatio: "0.76x",
    notes: "Cold JIT startup observation (sub-2ms iterations below BDN 100ms guideline)",
  },
  {
    method: "Runtime Mapper First Call (Cold Start)",
    category: "cold",
    mean: "1,708.2 μs",
    allocated: "N/A (Process JIT)",
    relativeRatio: "2.45x slower",
    notes: "Initial expression tree compilation & delegate synthesis overhead",
  },

  // Generator Scale / Incremental Build Experiment (from map-scale-incremental-results-final.log)
  {
    method: "Incremental Build: 25 Mapping Pairs",
    category: "scale",
    mean: "0.99 s",
    allocated: "8,785 B",
    relativeRatio: "Baseline (0.99s)",
    notes: "Roslyn incremental source generator cached build footprint",
  },
  {
    method: "Incremental Build: 100 Mapping Pairs",
    category: "scale",
    mean: "1.02 s",
    allocated: "35,260 B",
    relativeRatio: "+0.03s delta",
    notes: "Scales linearly with zero unbounded compiler memory bloat",
    isHero: true,
  },
  {
    method: "Incremental Build: 400 Mapping Pairs",
    category: "scale",
    mean: "0.94 s",
    allocated: "142,360 B",
    relativeRatio: "Sub-second",
    notes: "Roslyn caching isolates unchanged types completely",
  },
];

export const BenchmarkShowcase: React.FC = () => {
  const { locale } = usePortal();
  const [selectedCategory, setSelectedCategory] = useState<"warm" | "cold" | "scale">("warm");

  const filteredData = realBenchmarkData.filter((row) => row.category === selectedCategory);

  return (
    <div className="w-full rounded-2xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] overflow-hidden shadow-2xl transition-all duration-300">
      {/* Top Header Dock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--af-border)] px-6 py-4 bg-[var(--af-bg-canvas)]/80 backdrop-blur-md gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--af-accent)]/15 border border-[var(--af-accent)]/30 text-[var(--af-accent)]">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-[var(--af-text-primary)]">
                Committed Benchmark Laboratory
              </h3>
              <span className="rounded-full bg-[var(--af-success)]/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--af-success)] border border-[var(--af-success)]/20">
                100% Real BDN Evidence
              </span>
            </div>
            <p className="text-xs text-[var(--af-text-secondary)]">
              Published measurements directly from <code className="text-[var(--af-accent)] font-mono">docs/benchmark-results/</code>. Zero synthetic claims.
            </p>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-[var(--af-border)] p-1 bg-[var(--af-bg-canvas)] self-start md:self-auto">
          <button
            onClick={() => setSelectedCategory("warm")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              selectedCategory === "warm"
                ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] shadow-xs"
                : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)]"
            }`}
          >
            Warm DTO Mapping
          </button>
          <button
            onClick={() => setSelectedCategory("cold")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              selectedCategory === "cold"
                ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] shadow-xs"
                : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)]"
            }`}
          >
            Cold JIT Startup
          </button>
          <button
            onClick={() => setSelectedCategory("scale")}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              selectedCategory === "scale"
                ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] shadow-xs"
                : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)]"
            }`}
          >
            Roslyn Generator Scale
          </button>
        </div>
      </div>

      {/* Main Benchmarks Table & Visualization */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-canvas)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--af-border)] bg-[var(--af-bg-surface)] text-[var(--af-text-subtle)] font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Implementation / Method</th>
                  <th className="py-3 px-4">Mean Time</th>
                  <th className="py-3 px-4">Allocated Memory</th>
                  <th className="py-3 px-4">Relative Ratio</th>
                  <th className="py-3 px-4">Verification Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--af-border)] font-mono">
                {filteredData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      row.isHero
                        ? "bg-[var(--af-accent)]/5 hover:bg-[var(--af-accent)]/10"
                        : "hover:bg-[var(--af-surface-2)]/60"
                    }`}
                  >
                    <td className="py-3.5 px-4 font-sans font-medium text-[var(--af-text-primary)]">
                      <div className="flex items-center gap-2">
                        {row.isHero && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--af-accent)] shrink-0" />
                        )}
                        <span>{row.method}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--af-accent)] font-semibold">
                      {row.mean}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--af-text-secondary)]">
                      {row.allocated}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--af-text-primary)] font-medium">
                      {row.relativeRatio}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-[11px] text-[var(--af-text-subtle)] max-w-xs truncate" title={row.notes}>
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Honest Methodology & Engineering Caveats Box */}
        <div className="rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-canvas)] p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--af-text-primary)] font-semibold">
              <Cpu className="h-4 w-4 text-[var(--af-accent)]" />
              <span>Benchmark Environment</span>
            </div>
            <p className="text-[var(--af-text-secondary)] leading-relaxed">
              .NET 8.0.x / 9.0.x SDK, RyuJIT x64 with AVX2 instruction sets enabled on isolated Windows workstation cores.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--af-text-primary)] font-semibold">
              <Clock className="h-4 w-4 text-[var(--af-accent)]" />
              <span>BDN Confidence Intervals</span>
            </div>
            <p className="text-[var(--af-text-secondary)] leading-relaxed">
              Measurements reflect published runs with confidence intervals included. Sub-2ms cold iteration metrics are noted where iterations fall below the 100ms guideline.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[var(--af-text-primary)] font-semibold">
              <ShieldCheck className="h-4 w-4 text-[var(--af-success)]" />
              <span>Methodology Disclaimers</span>
            </div>
            <p className="text-[var(--af-text-secondary)] leading-relaxed">
              Mapperly comparison is a benchmark-only private reference dependency. Microbenchmarks do not represent entire real-world application throughput.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
