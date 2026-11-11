import React from 'react';
import { Metadata } from 'next';
import { ExploreClientView } from '@/components/explore/ExploreClientView';
import { Compass, CheckCircle2, ShieldCheck, Sparkles, Network } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Knowledge Graph & Architecture Tours | AstraFlow Explore',
  description: 'Interactive codebase knowledge graph, dependency path tracer, and guided architectural tours modeled after Understand Anything.'
};

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[var(--af-bg-canvas)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--af-accent)]/30 bg-[var(--af-accent)]/10 text-xs font-mono font-medium text-[var(--af-accent)]">
            <Compass className="h-3.5 w-3.5" />
            <span>Pillar 4: Understand Anything Codebase Knowledge Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--af-text-primary)]">
            AstraFlow Knowledge Explorer
          </h1>

          <p className="max-w-3xl text-sm sm:text-base text-[var(--af-text-secondary)] leading-relaxed">
            Navigate the entire 16-package AstraFlow ecosystem through an interactive multi-layer dependency graph,
            trace architectural paths between packages, or follow curated <strong className="text-[var(--af-text-primary)]">Guided Architecture Tours</strong> with
            real C# source code from <code className="text-xs font-mono text-[var(--af-accent)] bg-[var(--af-bg-surface)] px-1.5 py-0.5 rounded border border-[var(--af-border)]">src/</code>.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--af-text-subtle)] bg-[var(--af-bg-surface)] px-3 py-1 rounded-md border border-[var(--af-border)]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--af-success)]" />
              16 Packages & Core Interfaces
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--af-text-subtle)] bg-[var(--af-bg-surface)] px-3 py-1 rounded-md border border-[var(--af-border)]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--af-success)]" />
              Interactive Shortest-Path Finder
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--af-text-subtle)] bg-[var(--af-bg-surface)] px-3 py-1 rounded-md border border-[var(--af-border)]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--af-success)]" />
              4 Real-World C# Deep Dives
            </span>
          </div>
        </div>

        {/* Client Interactive Workspace */}
        <ExploreClientView />
      </div>
    </div>
  );
}
