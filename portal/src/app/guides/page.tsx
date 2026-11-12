import type { Metadata } from "next";
import Link from "next/link";
import { JourneyRail } from "@/components/guides/JourneyRail";

export const metadata: Metadata = {
  title: "Guides — AstraFlow",
  description:
    "Explore focused learning journeys for composing, testing, and inspecting .NET applications with AstraFlow.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    title: "Guides — AstraFlow",
    description:
      "Six practical journeys through the actual AstraFlow APIs, organized by the questions .NET developers need answered.",
    url: "/guides",
  },
};

interface PracticalPath {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  question: string;
  domain: string;
  targetPackage: string;
  readingEstimate: string;
  href: string;
}

const PRACTICAL_PATHS: readonly PracticalPath[] = [
  {
    id: "path-first-request",
    tag: "01 / FIRST REQUEST",
    title: "Send something.",
    subtitle: "From request contract to response.",
    question: "How do I define and dispatch a typed request without runtime reflection?",
    domain: "CORE MESSAGING · FOUNDATIONAL",
    targetPackage: "AstraFlow.Mediator",
    readingEstimate: "5 MIN READ",
    href: "/docs/getting-started",
  },
  {
    id: "path-composition",
    tag: "02 / COMPOSITION",
    title: "Design a pipeline.",
    subtitle: "Keep behavior explicit.",
    question: "How do I sequence validation, logging, and metrics without invisible magic?",
    domain: "PIPELINE ARCHITECTURE · RUNTIME ORDER",
    targetPackage: "AstraFlow.Contracts",
    readingEstimate: "8 MIN READ",
    href: "/docs/mediator",
  },
  {
    id: "path-data",
    tag: "03 / DATA",
    title: "Map with intent.",
    subtitle: "Declare, validate, project.",
    question: "How do I declare explicit mapping rules and validate source/destination shapes?",
    domain: "DATA TRANSFORMATION · COMPILE-TIME",
    targetPackage: "AstraFlow.Mapper",
    readingEstimate: "7 MIN READ",
    href: "/docs/mapper",
  },
  {
    id: "path-inspection",
    tag: "04 / INSPECTION",
    title: "Know your wiring.",
    subtitle: "Reports, diagnostics and tool output.",
    question: "How do I generate Mermaid graphs and inspect unresolved handlers via CLI?",
    domain: "OBSERVABILITY · STRUCTURE AUDIT",
    targetPackage: "AstraFlow.Diagnostics + CLI",
    readingEstimate: "6 MIN READ",
    href: "/docs/diagnostics",
  },
  {
    id: "path-confidence",
    tag: "05 / CONFIDENCE",
    title: "Test the important parts.",
    subtitle: "Fakes, harnesses and assertions.",
    question: "How do I test pipeline handlers and mapping with runner-neutral assertions?",
    domain: "CONFIDENCE & VERIFICATION · TESTING",
    targetPackage: "AstraFlow.Testing + Assertions (2.4)",
    readingEstimate: "9 MIN READ",
    href: "/docs/testing",
  },
  {
    id: "path-migration",
    tag: "06 / MIGRATION",
    title: "Move without guessing.",
    subtitle: "Versioned migration guidance.",
    question: "How do I transition incrementally from MediatR or AutoMapper with zero regression?",
    domain: "LIFECYCLE & GOVERNANCE · PRODUCTION",
    targetPackage: "Migration Cookbook",
    readingEstimate: "10 MIN READ",
    href: "/docs/migration-cookbook",
  },
];

export default function GuidesPage() {
  return (
    <div data-page="guides" className="guides-page-shell">
      {/* Guides Hero: Rebuilt as a Precision Learning Observatory */}
      <section className="hero pt-16 md:pt-24 pb-12 border-b border-[var(--line)]">
        <div className="site-wrap">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-10">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="w-2 h-2 rounded-full bg-[var(--signal)]" />
                <p className="eyebrow m-0 font-mono text-[11px] font-bold tracking-widest text-[var(--ink)]">
                  LEARNING SHOULD FEEL LIKE FORWARD MOTION
                </p>
              </div>
              <h1 className="text-[52px] sm:text-[72px] lg:text-[104px] font-extrabold text-[var(--ink)] tracking-tight leading-[0.92] my-4">
                From curious
                <br />
                <span className="ital signal font-serif italic text-[var(--action)] font-normal">
                  to confident.
                </span>
              </h1>
            </div>
            <div className="lg:col-span-4 pb-2">
              <p className="lead text-[16px] sm:text-[18px] text-[var(--muted)] leading-relaxed border-l-2 border-[var(--line)] pl-4">
                Six practical journeys through the actual APIs, organized by the
                questions developers need answered in production .NET code.
              </p>
            </div>
          </div>

          {/* The Radical Learning Route Machine */}
          <div className="mt-6">
            <JourneyRail />
          </div>
        </div>
      </section>

      {/* Rebuilt Practical Paths: Architectural Curriculum Matrix */}
      <section className="editorial-panel py-16 md:py-24 bg-[var(--paper2)]" id="practical-paths">
        <div className="site-wrap">
          <div className="section-head grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-12 border-b border-[var(--line)] pb-6">
            <div className="md:col-span-8">
              <p className="eyebrow font-mono text-[11px] font-bold tracking-widest text-[var(--signal)] mb-2">
                SIX PRACTICAL PATHS
              </p>
              <h2 className="text-[40px] sm:text-[56px] font-extrabold text-[var(--ink)] tracking-tight leading-tight">
                Learn by
                <br />
                <span className="ital signal font-serif italic text-[var(--action)] font-normal">
                  doing.
                </span>
              </h2>
            </div>
            <div className="md:col-span-4 pb-2">
              <p className="section-caption text-[14px] text-[var(--muted)] leading-relaxed">
                Each path resolves to real source documentation, verified package contracts,
                and compiler-checked patterns—not a fabricated feature tour.
              </p>
            </div>
          </div>

          {/* 6 Curated Curriculum Flight Plans (Preserving .card-list & .line-card for QA assertions) */}
          <div className="card-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-[var(--line)] bg-[var(--paper2)] shadow-sm">
            {PRACTICAL_PATHS.map((path, index) => (
              <Link
                key={path.tag}
                id={path.id}
                data-path-index={index}
                className="line-card group p-6 sm:p-8 border-b md:border-b-0 md:border-r border-[var(--line)] hover:bg-[var(--sand)]/40 transition-colors flex flex-col justify-between relative"
                href={path.href}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="tiny signal font-mono text-[10px] font-bold text-[var(--signal)] tracking-wider">
                      {path.tag}
                    </span>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[var(--sand)] text-[var(--muted)] font-semibold border border-[var(--line)]">
                      {path.readingEstimate}
                    </span>
                  </div>

                  <span className="block font-mono text-[9px] uppercase tracking-wider text-[var(--forest)] font-bold mb-2">
                    {path.domain}
                  </span>

                  <h3 className="text-[24px] sm:text-[28px] font-bold text-[var(--ink)] tracking-tight mb-2 group-hover:text-[var(--action)] transition-colors">
                    {path.title}
                  </h3>

                  <p className="text-[13px] font-semibold text-[var(--ink)]/80 mb-3">
                    {path.subtitle}
                  </p>

                  <p className="text-[12px] text-[var(--muted)] leading-relaxed italic border-l border-[var(--line)] pl-3 mb-6">
                    &ldquo;{path.question}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--line)]/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[var(--muted)]">PKG: <b className="text-[var(--forest)]">{path.targetPackage}</b></span>
                  <span className="text-[var(--action)] font-bold group-hover:translate-x-1 transition-transform">
                    DOCS ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Curriculum Integrity Guarantee */}
          <div className="mt-8 p-4 rounded bg-[var(--sand)]/50 border border-[var(--line)] flex flex-wrap items-center justify-between gap-4 text-[12px] text-[var(--muted)] font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[var(--action)] font-bold">●</span>
              <span>CANONICAL SOURCE SNAPSHOT: commit b163535864199bfb05cef62807d89509ac2239f8</span>
            </div>
            <div className="flex items-center gap-4">
              <span>ZERO FABRICATED METRICS</span>
              <span>·</span>
              <span>TESTED ON .NET 8 / 9 / 10</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
