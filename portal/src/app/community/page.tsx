import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  GitPullRequest, 
  ShieldCheck, 
  Package, 
  FileCode2, 
  Terminal, 
  ExternalLink, 
  CheckCircle2, 
  Scale, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  Cpu,
  Download,
  Palette
} from 'lucide-react';
import Image from 'next/image';

export const metadata = {
  title: 'Community & Ecosystem — AstraFlow Open Source Governance',
  description: 'GitHub contribution standards, security disclosure policy, ADR decision logs, and the 16-package NuGet ecosystem matrix.',
};

export default function CommunityPage() {
  const packages = [
    {
      name: 'AstraFlow',
      desc: 'Top-level convenience meta-package referencing core runtime modules for streamlined adoption.',
      status: 'Published v2.3.0',
      tag: 'Meta Package',
      featured: true,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Contracts',
      desc: 'Shared abstractions (IMediator, IRequestHandler, IObjectMapper). Zero dependencies.',
      status: 'Published v2.3.0',
      tag: 'Core Abstractions',
      featured: true,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Mediator',
      desc: 'High-performance request/response and notification dispatch engine.',
      status: 'Published v2.3.0',
      tag: 'Dispatch Engine',
      featured: true,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Mapper',
      desc: 'Flexible object mapping engine with static value converters and declared subtype dispatch.',
      status: 'Published v2.3.0',
      tag: 'Object Mapping',
      featured: true,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Mapper.Conventions',
      desc: 'Opt-in convention-based name and structure matching for automated property mapping.',
      status: 'Published v2.3.0',
      tag: 'Convention Mapping',
      featured: false,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Generators',
      desc: 'Compile-time Roslyn source generator for zero-allocation C# execution mappings.',
      status: 'Published v2.3.0',
      tag: 'Source Generator',
      featured: true,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Analyzers',
      desc: 'Roslyn analyzers detecting missing handlers, unbound mappings, and taxonomy violations.',
      status: 'Published v2.3.0',
      tag: 'Roslyn Analyzers',
      featured: false,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Assertions',
      desc: 'Runner-neutral test assertions foundation with strict privacy-safe failure messages.',
      status: 'Preview v2.4.0 (Unreleased)',
      tag: 'Testing Foundation',
      featured: true,
      isPublished: false,
    },
    {
      name: 'AstraFlow.AspNetCore',
      desc: 'Minimal API and controller endpoints with route-to-request pipeline binding.',
      status: 'Published v2.3.0',
      tag: 'Web Integration',
      featured: false,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Mapper.EntityFrameworkCore',
      desc: 'Queryable projection extensions compiling directly into Entity Framework Core queries.',
      status: 'Published v2.3.0',
      tag: 'Data Access',
      featured: false,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Security',
      desc: 'Sensitive name classification, secret taxonomy, and zero-leak value redaction.',
      status: 'Published v2.3.0',
      tag: 'Security Governance',
      featured: true,
      isPublished: true,
    },
    {
      name: 'AstraFlow.OpenTelemetry',
      desc: 'Distributed tracing spans and diagnostic activity listeners.',
      status: 'Published v2.3.0',
      tag: 'Observability',
      featured: false,
      isPublished: true,
    },
    {
      name: 'AstraFlow.FluentValidation',
      desc: 'Mediator pipeline behaviors validating requests prior to handler dispatch.',
      status: 'Published v2.3.0',
      tag: 'Validation Pipeline',
      featured: false,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Testing',
      desc: 'Pipeline harness and test doubles for isolated unit and integration suites.',
      status: 'Published v2.3.0',
      tag: 'Testing Doubles',
      featured: false,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Cli',
      desc: 'Command-line tool for static architecture audits and Canvas graph exports.',
      status: 'Published v2.3.0',
      tag: 'CLI Tooling',
      featured: false,
      isPublished: true,
    },
    {
      name: 'AstraFlow.Diagnostics',
      desc: 'Structured metrics, diagnostic sources, and health counters.',
      status: 'Published v2.3.0',
      tag: 'Telemetry',
      featured: false,
      isPublished: true,
    },
  ];

  const adrs = [
    {
      id: 'ADR-0001',
      title: 'Compile-Time Roslyn Generated Mappings',
      date: '2026-05-12',
      status: 'Accepted',
      summary: 'Replace runtime reflection and IL emit with deterministic compile-time C# generated partial methods with static scalar conversion verification.',
    },
    {
      id: 'ADR-0002',
      title: 'Generated Mediator Dispatch & Pipeline Optimization',
      date: '2026-06-18',
      status: 'Candidate',
      summary: 'Evaluate source-generated mediator registration and ValueTask pipeline dispatch to eliminate reflection during service provider initialization.',
    },
    {
      id: 'ADR-0003',
      title: 'Flow Manifest & Static Graph Export Specification',
      date: '2026-08-22',
      status: 'Candidate (v2.5)',
      summary: 'Standardize relational JSON canvas and Mermaid graph export schemas in AstraFlow.Cli for external architecture governance and portal visualization.',
    },
    {
      id: 'DEC-14',
      title: 'Permanent Public API Baseline Drift Verification',
      date: '2026-11-08',
      status: 'Accepted (Enforced)',
      summary: 'Enforce strict binary API baseline verification and Obsolete attribute replacement guidance in CI to prevent accidental breaking changes.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--af-bg-canvas)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--af-accent)]/10 text-[var(--af-accent)] text-xs font-mono font-semibold border border-[var(--af-accent)]/20">
            <Users className="w-3.5 h-3.5" />
            <span>Open Source Ecosystem & Governance</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--af-text-primary)] tracking-tight font-display">
            AstraFlow Community & Governance
          </h1>
          <p className="text-base sm:text-lg text-[var(--af-text-secondary)] leading-relaxed">
            Engineered clarity through strict package boundaries, architectural decision records (ADRs), reproducible builds with Sigstore provenance, and collaborative contribution gates.
          </p>
        </div>

        {/* 3 Pillars of Community Governance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[var(--af-accent)]/15 text-[var(--af-accent)] flex items-center justify-center">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[var(--af-text-primary)] font-display">
              Contribution Workflow
            </h2>
            <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
              All contributions adhere to Test-Driven Development (TDD). Every PR requires verification against public API baselines and an updated <code className="font-mono text-[var(--af-accent)]">CHANGELOG.md</code> entry.
            </p>
            <div className="pt-2">
              <Link
                href="/docs/community-release-guide"
                className="text-xs font-medium text-[var(--af-accent)] hover:underline inline-flex items-center gap-1"
              >
                Read Contributor Guide <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[var(--af-copper)]/15 text-[var(--af-copper)] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[var(--af-text-primary)] font-display">
              Security & Disclosure
            </h2>
            <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
              We treat security with defense-in-depth. Sensitive data is automatically redacted via <code className="font-mono text-[var(--af-copper)]">AstraFlow.Security</code>, and vulnerabilities are reported via private advisory channels.
            </p>
            <div className="pt-2">
              <Link
                href="/docs/security"
                className="text-xs font-medium text-[var(--af-copper)] hover:underline inline-flex items-center gap-1"
              >
                Security Policy <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[var(--af-success)]/15 text-[var(--af-success)] flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[var(--af-text-primary)] font-display">
              Supply Chain & Provenance
            </h2>
            <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
              Every package release generates an SPDX Software Bill of Materials (SBOM) and uses Sigstore/GitHub OIDC keyless artifact signing for tamper-proof delivery.
            </p>
            <div className="pt-2">
              <Link
                href="/docs/publishing"
                className="text-xs font-medium text-[var(--af-success)] hover:underline inline-flex items-center gap-1"
              >
                Verification Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ADR Explorer Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--af-border)] pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--af-text-primary)] font-display">
                Architectural Decision Records (ADRs)
              </h2>
              <p className="text-xs text-[var(--af-text-secondary)]">
                Transparent design decisions governing internal architecture and performance contracts.
              </p>
            </div>
            <Link
              href="/docs/architecture"
              className="text-xs font-semibold text-[var(--af-accent)] hover:underline inline-flex items-center gap-1"
            >
              All Decisions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adrs.map((adr) => (
              <div
                key={adr.id}
                className="p-5 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--af-accent)]">
                    {adr.id}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[var(--af-success)]/15 text-[var(--af-success)] border border-[var(--af-success)]/30 font-semibold">
                    {adr.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--af-text-primary)] font-display">
                  {adr.title}
                </h3>
                <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
                  {adr.summary}
                </p>
                <div className="pt-2 text-[10px] font-mono text-[var(--af-text-subtle)]">
                  Ratified: {adr.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 16-Package Ecosystem Matrix */}
        <div className="space-y-6">
          <div className="border-b border-[var(--af-border)] pb-4">
            <h2 className="text-2xl font-bold text-[var(--af-text-primary)] font-display">
              AstraFlow NuGet Package Ecosystem
            </h2>
            <p className="text-xs text-[var(--af-text-secondary)]">
              Modular, independent packages ensuring zero transitive bloat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`p-4 rounded-xl border bg-[var(--af-bg-surface)] flex flex-col justify-between transition-all ${
                  pkg.featured
                    ? 'border-[var(--af-accent)]/50 ring-1 ring-[var(--af-accent)]/20'
                    : 'border-[var(--af-border)]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--af-bg-canvas)] text-[var(--af-text-subtle)] border border-[var(--af-border)]">
                      {pkg.tag}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                        pkg.status.includes('Preview')
                          ? 'bg-[var(--af-copper)]/15 text-[var(--af-copper)] border border-[var(--af-copper)]/30'
                          : 'bg-[var(--af-success)]/15 text-[var(--af-success)] border border-[var(--af-success)]/30'
                      }`}
                    >
                      {pkg.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold font-mono text-[var(--af-text-primary)] truncate">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed">
                    {pkg.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--af-border)]/50 flex items-center justify-between text-xs">
                  <code className="text-[11px] font-mono text-[var(--af-text-subtle)] truncate max-w-[180px]">
                    {pkg.isPublished ? `dotnet add package ${pkg.name}` : 'unreleased (v2.4.0 preview)'}
                  </code>
                  {pkg.isPublished ? (
                    <a
                      href={`https://www.nuget.org/packages/${pkg.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--af-accent)] hover:underline inline-flex items-center"
                      title={`View ${pkg.name} on NuGet`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      href="/docs/assertions"
                      className="text-[var(--af-copper)] hover:underline inline-flex items-center text-[11px] font-mono"
                      title="View preview docs"
                    >
                      preview docs <ArrowRight className="w-3 h-3 ml-0.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand & Media Kit Section */}
        <div className="space-y-8 pt-8 border-t border-[var(--af-border)]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--af-copper)]/10 text-[var(--af-copper)] text-xs font-mono font-semibold border border-[var(--af-copper)]/20">
              <Palette className="w-3.5 h-3.5" />
              <span>Brand & Media Kit</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--af-text-primary)] font-display tracking-tight">
              The Trace (v0.2 Identity Standards)
            </h2>
            <p className="text-sm text-[var(--af-text-secondary)] max-w-3xl leading-relaxed">
              Official vector marks, hero banners, and editorial campaign assets for AstraFlow. All assets honor <code className="text-xs font-mono text-[var(--af-accent)]">design.md</code> Section 2.4 reference lock and Section 11 export guidelines.
            </p>
          </div>

          {/* Vector Mark & Hero Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--af-accent)] font-display">
                  Canonical Vector Logo
                </span>
                <a
                  href="/logo-mark-color.svg"
                  download
                  className="px-2.5 py-1 text-xs font-mono rounded bg-[var(--af-bg-canvas)] border border-[var(--af-border)] text-[var(--af-text-primary)] hover:border-[var(--af-accent)] inline-flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3 h-3 text-[var(--af-accent)]" /> SVG
                </a>
              </div>
              <div className="h-44 rounded-xl bg-[var(--af-bg-canvas)] border border-[var(--af-border)]/60 flex items-center justify-center p-6">
                <img
                  src="/logo-mark-color.svg"
                  alt="AstraFlow Canonical Logo Mark"
                  className="h-28 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-[var(--af-text-subtle)] leading-relaxed">
                Locked 3-path geometry (<code className="font-mono text-[11px]">viewBox="0 0 270 215"</code>): Mineral White apex, Ion Cyan flow ribbon, and Warm Copper terminal (<span className="text-[var(--af-copper)] font-medium">&lt; 5% surface</span>).
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--af-accent)] font-display">
                  Official README Hero Banner
                </span>
                <a
                  href="/images/brand/astraflow-readme-hero.jpg"
                  download
                  className="px-2.5 py-1 text-xs font-mono rounded bg-[var(--af-bg-canvas)] border border-[var(--af-border)] text-[var(--af-text-primary)] hover:border-[var(--af-accent)] inline-flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3 h-3 text-[var(--af-accent)]" /> JPG
                </a>
              </div>
              <div className="h-44 rounded-xl bg-[var(--af-bg-canvas)] border border-[var(--af-border)]/60 overflow-hidden relative">
                <img
                  src="/images/brand/astraflow-readme-hero.jpg"
                  alt="AstraFlow README Hero Banner"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-[var(--af-text-subtle)] leading-relaxed">
                Clean 2D vector-minimal Trace banner for GitHub repository headers and developer documentation heroes.
              </p>
            </div>
          </div>

          {/* Campaign & Release Visuals Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[var(--af-text-primary)] font-display">
              Editorial Campaign & Release Exploration Visuals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'v2.4 Bento Architecture',
                  file: '/images/brand/astraflow-campaign-bento-v24.jpg',
                  desc: 'Multi-package pipeline & testing bento grid',
                },
                {
                  title: 'Pipeline Monolith',
                  file: '/images/brand/astraflow-campaign-monolith.jpg',
                  desc: 'High-throughput mediator dispatch monolith',
                },
                {
                  title: 'Layered Engine Stack',
                  file: '/images/brand/astraflow-campaign-stack.jpg',
                  desc: 'Modular decoupled stack visualization',
                },
                {
                  title: 'Compiler Toolkit',
                  file: '/images/brand/astraflow-campaign-toolkit.jpg',
                  desc: 'Roslyn analyzers & CLI diagnostics preview',
                },
              ].map((item) => (
                <div
                  key={item.file}
                  className="group rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] overflow-hidden flex flex-col justify-between hover:border-[var(--af-accent)] transition-all shadow-xs"
                >
                  <div className="h-36 overflow-hidden relative bg-[var(--af-bg-canvas)]">
                    <img
                      src={item.file}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[var(--af-text-primary)] truncate">
                        {item.title}
                      </h4>
                      <a
                        href={item.file}
                        download
                        className="text-[var(--af-text-subtle)] hover:text-[var(--af-accent)] transition-colors"
                        title={`Download ${item.title}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-[11px] text-[var(--af-text-secondary)] leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
