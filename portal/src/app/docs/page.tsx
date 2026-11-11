import React from 'react';
import Link from 'next/link';
import { getAllCategories, getDocBySlug } from '@/lib/docs-loader';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { BookOpen, ArrowRight, ShieldCheck, Zap, GitBranch, Layers, Cpu, Compass } from 'lucide-react';

export const metadata = {
  title: 'Documentation — AstraFlow v2.3.0 Engine',
  description: 'Comprehensive developer guides, API specifications, and architectural documentation for AstraFlow.',
};

export default function DocsIndexPage() {
  const categories = getAllCategories();

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Left Sidebar */}
      <DocsSidebar categories={categories} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-10">
        {/* Version Status Banner */}
        <div className="mb-8 p-4 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--af-success)] ring-4 ring-[var(--af-success)]/20" />
            <div>
              <p className="text-sm font-semibold text-[var(--af-text-primary)]">
                Latest Published Line: <span className="font-mono text-[var(--af-accent)] font-bold">v2.3.0</span>
              </p>
              <p className="text-xs text-[var(--af-text-subtle)]">
                Strict API baselines, Roslyn source generation, and Sigstore provenance active.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono rounded bg-[var(--af-copper)]/15 text-[var(--af-copper)] border border-[var(--af-copper)]/30 font-medium">
              v2.4.0 Preview Active
            </span>
            <Link
              href="/docs/roadmap"
              className="text-xs font-medium text-[var(--af-accent)] hover:underline inline-flex items-center gap-1"
            >
              Roadmap <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--af-text-primary)] tracking-tight font-display mb-4">
            AstraFlow Documentation
          </h1>
          <p className="text-lg text-[var(--af-text-secondary)] leading-relaxed max-w-3xl">
            A modular .NET ecosystem providing zero-boilerplate mediator dispatch, compile-time Roslyn mapping & projections, privacy-first diagnostic telemetry, and runner-neutral assertions.
          </p>
        </div>

        {/* Fast Track Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
          <Link
            href="/docs/getting-started"
            className="group p-5 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] hover:border-[var(--af-accent)] transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--af-accent)]/15 flex items-center justify-center text-[var(--af-accent)] mb-3 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[var(--af-text-primary)] mb-1 group-hover:text-[var(--af-accent)] transition-colors">
                Quickstart & Installation
              </h2>
              <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
                Add `AstraFlow.Mediator` and `AstraFlow.Mapper` to your ASP.NET Core project in 3 minutes.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-[var(--af-accent)]">
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/docs/package-selection"
            className="group p-5 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] hover:border-[var(--af-accent)] transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--af-copper)]/15 flex items-center justify-center text-[var(--af-copper)] mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[var(--af-text-primary)] mb-1 group-hover:text-[var(--af-copper)] transition-colors">
                Package Selection Guide
              </h2>
              <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
                Choose precisely which of the 16 modular packages fit your architecture without dependency bloat.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-[var(--af-copper)]">
              Explore Packages <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/docs/assertions"
            className="group p-5 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] hover:border-[var(--af-accent)] transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--af-accent)]/15 flex items-center justify-center text-[var(--af-accent)] mb-3 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[var(--af-text-primary)] mb-1 group-hover:text-[var(--af-accent)] transition-colors">
                Runner-Neutral Assertions (v2.4.0)
              </h2>
              <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
                Clean-room, zero-dependency testing foundation replacing proprietary assertion runners with privacy defaults.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-[var(--af-accent)]">
              View Assertions <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/docs/generators"
            className="group p-5 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] hover:border-[var(--af-accent)] transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--af-accent)]/15 flex items-center justify-center text-[var(--af-accent)] mb-3 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[var(--af-text-primary)] mb-1 group-hover:text-[var(--af-accent)] transition-colors">
                Roslyn Source Generators
              </h2>
              <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
                Zero-reflection executable C# mappings generated directly during compilation with zero runtime overhead.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-[var(--af-accent)]">
              Learn Generators <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Categorized Documentation Directory */}
        <div className="space-y-10">
          <h2 className="text-2xl font-bold text-[var(--af-text-primary)] font-display border-b border-[var(--af-border)] pb-3">
            Explore All Guides & Reference
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div key={category.slug} className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--af-accent)] font-display flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--af-accent)]" />
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        className="text-sm text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] flex items-center justify-between group py-1"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {item.title}
                        </span>
                        {item.versionNotice === 'v2.4.0 Preview' && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--af-copper)]/15 text-[var(--af-copper)]">
                            Preview
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
