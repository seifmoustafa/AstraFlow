import React from 'react';
import { Metadata } from 'next';
import { ArchifyViewer } from '@/components/architecture/ArchifyViewer';
import { FlowTraceBlueprints } from '@/components/architecture/FlowTraceBlueprints';
import { Network, FileText, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Architecture Hub & Archify SSOT | AstraFlow',
  description: 'Inspect AstraFlow architecture blueprints, layer isolation boundaries, and verified Archify interactive explainers.'
};

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[var(--af-bg-canvas)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--af-accent)]/30 bg-[var(--af-accent)]/10 text-xs font-mono font-medium text-[var(--af-accent)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Pillar 3: Archify Architectural Governance & SSOT</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--af-text-primary)]">
            AstraFlow Architecture Hub
          </h1>

          <p className="max-w-3xl text-sm sm:text-base text-[var(--af-text-secondary)] leading-relaxed">
            Every architectural decision, package boundary, and request execution flow in AstraFlow is codified as a
            formally verified <strong className="text-[var(--af-text-primary)]">Archify Single Source of Truth (SSOT)</strong> artifact.
            Explore interactive blueprints, trace diagrams, and delivery receipts below.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--af-text-subtle)] bg-[var(--af-bg-surface)] px-3 py-1 rounded-md border border-[var(--af-border)]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--af-success)]" />
              16-Package Strict Isolation
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--af-text-subtle)] bg-[var(--af-bg-surface)] px-3 py-1 rounded-md border border-[var(--af-border)]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--af-success)]" />
              Compile-Time Source Generators
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--af-text-subtle)] bg-[var(--af-bg-surface)] px-3 py-1 rounded-md border border-[var(--af-border)]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--af-success)]" />
              Defense-in-Depth OpenTelemetry Redaction
            </span>
          </div>
        </div>

        {/* Section 1: Live Archify Artifact Viewer */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--af-border)] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--af-accent)]" />
              <h2 className="text-xl font-bold text-[var(--af-text-primary)]">
                Live Archify Interactive Artifacts
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--af-text-subtle)]">
              Powered by Archify CLI v26
            </span>
          </div>

          <ArchifyViewer />
        </section>

        {/* Section 2: Interactive Flow Trace Blueprints */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--af-border)] pb-3">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-[var(--af-accent)]" />
              <h2 className="text-xl font-bold text-[var(--af-text-primary)]">
                Native Flow Trace Blueprints & Boundaries
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--af-text-subtle)]">
              Section 7 Flow Primitives
            </span>
          </div>

          <FlowTraceBlueprints />
        </section>
      </div>
    </div>
  );
}
