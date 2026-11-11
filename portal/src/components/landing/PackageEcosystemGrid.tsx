"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePortal } from "@/context/PortalContext";
import {
  Package,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Filter,
  Search,
  Sparkles,
} from "lucide-react";

interface PackageInfo {
  name: string;
  category: "core" | "mapping" | "observability" | "testing" | "tooling";
  version: string;
  status: "published" | "preview";
  targetFrameworks: string;
  description: string;
  docHref: string;
  command: string;
}

const allPackages: PackageInfo[] = [
  {
    name: "AstraFlow",
    category: "core",
    version: "2.3.0",
    status: "published",
    targetFrameworks: ".NET 8, .NET 9, .NET 10, netstandard2.0",
    description: "Convenience metapackage referencing Mediator, Mapper, and core abstractions.",
    docHref: "/docs",
    command: "dotnet add package AstraFlow --version 2.3.0",
  },
  {
    name: "AstraFlow.Contracts",
    category: "core",
    version: "2.3.0",
    status: "published",
    targetFrameworks: "netstandard2.0, .NET 8, .NET 9, .NET 10",
    description: "Shared interfaces: IRequest, IMediator, INotification, and IObjectMapper.",
    docHref: "/docs/package-selection",
    command: "dotnet add package AstraFlow.Contracts --version 2.3.0",
  },
  {
    name: "AstraFlow.Mediator",
    category: "core",
    version: "2.3.0",
    status: "published",
    targetFrameworks: "netstandard2.0, .NET 8, .NET 9, .NET 10",
    description: "Zero-unconstrained-reflection mediator dispatch with streaming channel support.",
    docHref: "/docs/mediator",
    command: "dotnet add package AstraFlow.Mediator --version 2.3.0",
  },
  {
    name: "AstraFlow.Mapper",
    category: "mapping",
    version: "2.3.0",
    status: "published",
    targetFrameworks: "netstandard2.0, .NET 8, .NET 9, .NET 10",
    description: "Compile-time and convention-driven object mapping engine.",
    docHref: "/docs/mapper",
    command: "dotnet add package AstraFlow.Mapper --version 2.3.0",
  },
  {
    name: "AstraFlow.Mapper.Conventions",
    category: "mapping",
    version: "2.3.0",
    status: "published",
    targetFrameworks: "netstandard2.0, .NET 8, .NET 9, .NET 10",
    description: "Opt-in naming convention rules and reverse-mapping safeguards.",
    docHref: "/docs/convention-mapping",
    command: "dotnet add package AstraFlow.Mapper.Conventions --version 2.3.0",
  },
  {
    name: "AstraFlow.Mapper.EntityFrameworkCore",
    category: "mapping",
    version: "2.3.0",
    status: "published",
    targetFrameworks: ".NET 8, .NET 9, .NET 10",
    description: "IQueryable.ProjectTo<TSource, TDest> projection extensions for EF Core.",
    docHref: "/docs/entity-framework-core",
    command: "dotnet add package AstraFlow.Mapper.EntityFrameworkCore --version 2.3.0",
  },
  {
    name: "AstraFlow.Assertions",
    category: "testing",
    version: "2.4.0-preview",
    status: "preview",
    targetFrameworks: "netstandard2.0, .NET 8, .NET 9, .NET 10",
    description: "Runner-neutral fluent assertion suite (xUnit, NUnit, MSTest) with PII-safe failure reporting.",
    docHref: "/docs/assertions",
    command: "# Unreleased (v2.4.0 source — see /docs/assertions)",
  },
  {
    name: "AstraFlow.Generators",
    category: "tooling",
    version: "2.3.0",
    status: "published",
    targetFrameworks: "netstandard2.0 (Roslyn 4.0+)",
    description: "Incremental source generators for typed executable mapping and handler registration.",
    docHref: "/docs/generators",
    command: "dotnet add package AstraFlow.Generators --version 2.3.0",
  },
  {
    name: "AstraFlow.Analyzers",
    category: "tooling",
    version: "2.3.0",
    status: "published",
    targetFrameworks: "netstandard2.0 (Roslyn 4.0+)",
    description: "Roslyn diagnostic rules catching missing handlers and dangerous projection writes.",
    docHref: "/docs/analyzers",
    command: "dotnet add package AstraFlow.Analyzers --version 2.3.0",
  },
  {
    name: "AstraFlow.Diagnostics",
    category: "observability",
    version: "2.3.0",
    status: "published",
    targetFrameworks: "netstandard2.0, .NET 8, .NET 9, .NET 10",
    description: "DiagnosticSource and ActivitySource event infrastructure with payload redaction.",
    docHref: "/docs/observability",
    command: "dotnet add package AstraFlow.Diagnostics --version 2.3.0",
  },
  {
    name: "AstraFlow.FluentValidation",
    category: "core",
    version: "2.3.0",
    status: "published",
    targetFrameworks: "netstandard2.0, .NET 8, .NET 9, .NET 10",
    description: "Pre-dispatch validation pipeline behavior integrating with FluentValidation.",
    docHref: "/docs/fluentvalidation",
    command: "dotnet add package AstraFlow.FluentValidation --version 2.3.0",
  },
  {
    name: "AstraFlow.OpenTelemetry",
    category: "observability",
    version: "2.3.0",
    status: "published",
    targetFrameworks: "netstandard2.0, .NET 8, .NET 9, .NET 10",
    description: "OpenTelemetry meter and tracer extensions for automatic distributed span collection.",
    docHref: "/docs/observability",
    command: "dotnet add package AstraFlow.OpenTelemetry --version 2.3.0",
  },
  {
    name: "AstraFlow.Security",
    category: "observability",
    version: "2.3.0",
    status: "published",
    targetFrameworks: "netstandard2.0, .NET 8, .NET 9, .NET 10",
    description: "[Redact] metadata and masking policies preventing PII leakage in telemetry.",
    docHref: "/docs/security",
    command: "dotnet add package AstraFlow.Security --version 2.3.0",
  },
  {
    name: "AstraFlow.AspNetCore",
    category: "core",
    version: "2.3.0",
    status: "published",
    targetFrameworks: ".NET 8, .NET 9, .NET 10",
    description: "ASP.NET Core Minimal API endpoint dispatch adapters and HTTP context propagation.",
    docHref: "/docs/aspnetcore",
    command: "dotnet add package AstraFlow.AspNetCore --version 2.3.0",
  },
  {
    name: "AstraFlow.Testing",
    category: "testing",
    version: "2.3.0",
    status: "published",
    targetFrameworks: "netstandard2.0, .NET 8, .NET 9, .NET 10",
    description: "In-memory test doubles, mediator test harnesses, and pipeline spy utilities.",
    docHref: "/docs/testing",
    command: "dotnet add package AstraFlow.Testing --version 2.3.0",
  },
  {
    name: "AstraFlow.Cli",
    category: "tooling",
    version: "2.3.0",
    status: "published",
    targetFrameworks: ".NET 8, .NET 9, .NET 10",
    description: "dotnet global tool for pipeline visualization, contract linting, and arch audits.",
    docHref: "/docs/cli",
    command: "dotnet tool install -g AstraFlow.Cli --version 2.3.0",
  },
];

export function PackageEcosystemGrid() {
  const { locale } = usePortal();
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedPkg, setCopiedPkg] = useState<string | null>(null);

  const handleCopy = (pkgName: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedPkg(pkgName);
    setTimeout(() => setCopiedPkg(null), 2000);
  };

  const filteredPackages = allPackages.filter((pkg) => {
    const matchesCat = selectedCat === "all" || pkg.category === selectedCat;
    const matchesQuery =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <section className="py-20 border-b border-[var(--af-border)] bg-[var(--af-bg-surface)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono font-medium text-[var(--af-accent)] bg-[var(--af-bg-canvas)] border border-[var(--af-border)] mb-3">
              <Package className="w-3.5 h-3.5" />
              <span>SHOWCASE 05 · MODULAR 16-PACKAGE ECOSYSTEM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--af-text-primary)] mb-3">
              {locale === "ar"
                ? "مستكشف حزم AstraFlow الستة عشر (16 Packages)"
                : "The 16-Package Modular Ecosystem Navigator"}
            </h2>
            <p className="text-sm sm:text-base text-[var(--af-text-secondary)] max-w-2xl">
              {locale === "ar"
                ? "حزم مستقلة تماماً ومصممة لتعمل معاً أو منفردة. انسخ أمر التثبيت، وتفقد أطر العمل المدعومة وروابط التوثيق المباشرة."
                : "Explore all 16 first-party NuGet packages. High cohesion, low coupling, with explicit target framework support across .NET 8, 9, 10, and netstandard2.0."}
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-64 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--af-text-subtle)]" />
            <input
              type="text"
              placeholder={locale === "ar" ? "ابحث عن حزمة..." : "Search packages..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md bg-[var(--af-bg-canvas)] border border-[var(--af-border)] text-xs font-mono text-[var(--af-text-primary)] placeholder-[var(--af-text-subtle)] focus:outline-none focus:border-[var(--af-accent)] transition-af"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {[
            { id: "all", label: `All (${allPackages.length})` },
            { id: "core", label: "Core Dispatch & Mediator" },
            { id: "mapping", label: "Mapping & EF Core" },
            { id: "observability", label: "Diagnostics & Security" },
            { id: "testing", label: "Testing & Assertions" },
            { id: "tooling", label: "Generators, Analyzers & CLI" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-af cursor-pointer border ${
                selectedCat === cat.id
                  ? "bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold border-[var(--af-accent)]"
                  : "bg-[var(--af-bg-canvas)] text-[var(--af-text-secondary)] border-[var(--af-border)] hover:border-[var(--af-text-secondary)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 16 Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const isCopied = copiedPkg === pkg.name;
            return (
              <div
                key={pkg.name}
                className="flex flex-col justify-between p-5 rounded-[var(--af-radius-card)] bg-[var(--af-bg-canvas)] border border-[var(--af-border)] hover:border-[var(--af-accent)] transition-af group shadow-sm"
              >
                <div>
                  {/* Top Bar: Name + Version Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <h3 className="font-mono text-sm font-bold text-[var(--af-text-primary)] group-hover:text-[var(--af-accent)] transition-af break-all">
                      {pkg.name}
                    </h3>
                    {pkg.status === "preview" ? (
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--af-copper)]/15 text-[var(--af-copper)] border border-[var(--af-copper)]/30">
                        v2.4 Preview
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--af-success)]/10 text-[var(--af-success)] border border-[var(--af-success)]/25">
                        v{pkg.version}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[var(--af-text-secondary)] leading-relaxed mb-4">
                    {pkg.description}
                  </p>
                </div>

                <div>
                  {/* Target Frameworks */}
                  <div className="text-[11px] font-mono text-[var(--af-text-subtle)] pb-3 mb-3 border-b border-[var(--af-border)] flex items-center justify-between">
                    <span className="truncate">{pkg.targetFrameworks}</span>
                  </div>

                  {/* Bottom Action Row: Copy CLI Command + Doc Link */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopy(pkg.name, pkg.command)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono border border-[var(--af-border)] bg-[var(--af-bg-surface)] text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:border-[var(--af-accent)] active:scale-95 transition-af cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[var(--af-success)]" />
                          <span className="text-[var(--af-success)]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy CLI</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={pkg.docHref}
                      className="inline-flex items-center gap-1 text-xs font-mono text-[var(--af-accent)] hover:underline"
                    >
                      <span>Docs</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
