"use client";

import React, { useState } from "react";
import { usePortal } from "@/context/PortalContext";
import {
  BarChart3,
  Cpu,
  Zap,
  Info,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

interface BenchmarkRow {
  method: string;
  category: "warm" | "cold" | "scale";
  mean: string;
  allocated: string;
  relativeRatio: string;
  notes: string;
}

// 100% REAL benchmark data committed in docs/benchmark-results/v2.1-draft/
const realBenchmarkData: BenchmarkRow[] = [
  // Warm Mapping Benchmarks (from generated-mapping-bdn-mapperly-short.md)
  {
    method: "Manual Construction",
    category: "warm",
    mean: "5.641 ns",
    allocated: "32 B",
    relativeRatio: "1.00x (Baseline)",
    notes: "Direct handwritten C# two-property non-null construction (±2.86 ns CI)",
  },
  {
    method: "AstraFlow Generated Mapping (v2.1+)",
    category: "warm",
    mean: "11.987 ns",
    allocated: "32 B",
    relativeRatio: "2.13x",
    notes: "Compile-time generated direct typed call without reflection (±5.54 ns CI)",
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
    allocated: "8,785 B generated code",
    relativeRatio: "No-op Incremental",
    notes: "End-to-end Release rebuild wall time including Roslyn generator execution",
  },
  {
    method: "Incremental Build: 100 Mapping Pairs",
    category: "scale",
    mean: "1.02 s",
    allocated: "35,260 B generated code",
    relativeRatio: "No-op Incremental",
    notes: "Incremental compiler pass remains sub-1.1s with 100 declared mappings",
  },
  {
    method: "Incremental Build: 400 Mapping Pairs",
    category: "scale",
    mean: "0.94 s",
    allocated: "142,360 B generated code",
    relativeRatio: "No-op Incremental",
    notes: "Synthetic map-scale experiment (includes process startup & all generators)",
  },
];

export function BenchmarkShowcase() {
  const { locale } = usePortal();
  const [selectedCategory, setSelectedCategory] = useState<"all" | "warm" | "cold" | "scale">("all");

  const filteredData =
    selectedCategory === "all"
      ? realBenchmarkData
      : realBenchmarkData.filter((r) => r.category === selectedCategory);

  return (
    <section className="py-20 border-b border-[var(--af-border)] bg-[var(--af-bg-canvas)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono font-medium text-[var(--af-accent)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] mb-3">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>SHOWCASE 02 · REPEATABLE BENCHMARK EVIDENCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--af-text-primary)] mb-3">
              {locale === "ar"
                ? "قياسات الأداء والذاكرة الشفافة (عبر BenchmarkDotNet)"
                : "Honest Performance & Memory Allocation Evidence"}
            </h2>
            <p className="text-sm sm:text-base text-[var(--af-text-secondary)] max-w-2xl">
              {locale === "ar"
                ? "نتائج حقيقية موثقة مستخرجة مباشرة من docs/benchmark-results/. لا وعود تسويقية، بل أرقام مقاسة في بيئة الإصدار مع توضيح حدود الاختبار."
                : "Real measurements committed in docs/benchmark-results/v2.1-draft/. We reject marketing superlatives in favor of reproducible methodology and explicit allocation footprints."}
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: locale === "ar" ? "كل القياسات" : `All (${realBenchmarkData.length})` },
              { id: "warm", label: locale === "ar" ? "المطابقة السريعة (Warm)" : "Warm Mapping (ns)" },
              { id: "cold", label: locale === "ar" ? "الإقلاع البارد (Cold)" : "Cold Start JIT (μs)" },
              { id: "scale", label: locale === "ar" ? "قياسات التوسع للمولد" : "Generator Scale (s)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-af cursor-pointer border ${
                  selectedCategory === tab.id
                    ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold border-[var(--af-accent)]"
                    : "bg-[var(--af-bg-surface)] text-[var(--af-text-secondary)] border-[var(--af-border)] hover:border-[var(--af-text-secondary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Benchmark Table */}
        <div className="rounded-[var(--af-radius-card)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] overflow-hidden mb-8 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--af-border)] bg-[var(--af-bg-canvas)]/50 text-[var(--af-text-subtle)]">
                  <th className="py-3.5 px-4 font-semibold uppercase">Execution Method</th>
                  <th className="py-3.5 px-4 font-semibold uppercase text-right">Mean</th>
                  <th className="py-3.5 px-4 font-semibold uppercase text-right">Allocated</th>
                  <th className="py-3.5 px-4 font-semibold uppercase text-right">Ratio vs Manual</th>
                  <th className="py-3.5 px-4 font-semibold uppercase">Methodology Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--af-border)]/60 text-[var(--af-text-secondary)]">
                {filteredData.map((row) => (
                  <tr
                    key={row.method}
                    className="hover:bg-[var(--af-bg-canvas)]/40 transition-af"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[var(--af-text-primary)]">
                      {row.method}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[var(--af-accent)]">
                      {row.mean}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          row.allocated.includes("32 B")
                            ? "bg-[var(--af-success)]/10 text-[var(--af-success)] border border-[var(--af-success)]/30"
                            : row.allocated.includes("264 B")
                            ? "bg-[var(--af-copper)]/10 text-[var(--af-copper)] border border-[var(--af-copper)]/30"
                            : "bg-[var(--af-bg-canvas)] text-[var(--af-text-secondary)] border border-[var(--af-border)]"
                        }`}
                      >
                        {row.allocated}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-[var(--af-text-primary)]">
                      {row.relativeRatio}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--af-text-subtle)] text-[11px] leading-relaxed max-w-xs">
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Honest Methodology & Caveats Box as required by design.md Section 7.4 */}
        <div className="p-5 rounded-lg border border-[var(--af-border)] bg-[var(--af-bg-surface)]/70 text-xs text-[var(--af-text-secondary)]">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-[var(--af-accent)] shrink-0 mt-0.5" />
            <div className="space-y-2">
              <div className="font-semibold text-[var(--af-text-primary)] font-mono uppercase tracking-wider text-[11px]">
                Committed Methodology, Confidence Limits & Caveats (design.md §7.4 &amp; docs/benchmarks.md):
              </div>
              <p className="leading-relaxed">
                Hardware Environment: BenchmarkDotNet v0.14.0 on Windows 11 (10.0.26300.9818), .NET SDK 10.0.400, .NET 10.0.13 RyuJIT AVX2.
                Generated mapping benchmarks compared equivalent two-property mapping calls over the same non-null input: handwritten construction (5.641 ns / 32 B), runtime mapper (133.820 ns / 264 B), and AstraFlow generated method (11.987 ns / 32 B).
                The 99.9% confidence intervals are broad (±2.86 ns manual vs ±5.54 ns generated); direct call means are within uncertainty intervals, so they do not support a dogmatic speed ranking.
              </p>
              <p className="text-[var(--af-text-subtle)] font-mono text-[11px]">
                Cold process launches (10 isolated runs) measured the first invocation after setup at 746.6 μs manual, 691.4 μs AstraFlow generated, and 1,708.2 μs runtime mapper. BenchmarkDotNet noted that sub-2ms iterations fall below its recommended 100ms threshold; they represent exploratory JIT startup observations, not absolute comparative cold-start proof.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
