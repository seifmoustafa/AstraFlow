"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ProvenanceNotice } from "@/lib/provenance";

export const PINNED_COMMIT_SHA = "b163535864199bfb05cef62807d89509ac2239f8";

export interface DocReferenceTopic {
  title: string;
  subtitle: string;
  href: string;
  slug: string;
  category: string;
  purpose: "core" | "compiler" | "enterprise" | "governance";
  term: string;
  versionNotice: ProvenanceNotice;
  sourcePath: string;
  signaturePreview: string;
  keyConcepts: string[];
}

export const REFERENCE_TOPICS: DocReferenceTopic[] = [
  {
    title: "Getting started",
    subtitle: "Build your first request",
    href: "/docs/getting-started",
    slug: "getting-started",
    category: "Getting Started & Strategy",
    purpose: "core",
    term: "getting started quickstart install setup first request createorder isender",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/getting-started.md",
    signaturePreview: `public sealed record CreateOrder(string Number) : IRequest<OrderCreated>;\nvar response = await sender.Send(new CreateOrder("ORD-1042"), ct);`,
    keyConcepts: ["ISender", "IRequest<T>", "Dependency Injection"],
  },
  {
    title: "Mediator",
    subtitle: "Dispatch and pipelines",
    href: "/docs/mediator",
    slug: "mediator",
    category: "Core Packages",
    purpose: "core",
    term: "mediator dispatch pipeline sender handler request notification stream ipipelinebehavior",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/mediator.md",
    signaturePreview: `services.AddAstraFlowMediator(typeof(Program));\npublic sealed class OrderHandler : IRequestHandler<CreateOrder, OrderCreated>`,
    keyConcepts: ["IPipelineBehavior", "INotificationHandler", "IStreamRequestHandler"],
  },
  {
    title: "Mapping",
    subtitle: "Rules and projections",
    href: "/docs/mapper",
    slug: "mapper",
    category: "Core Packages",
    purpose: "core",
    term: "mapping mapper projection conventions generated rules compile time ideclaredobjectmappingrule",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/mapper.md",
    signaturePreview: `public sealed class InvoiceMapping : IDeclaredObjectMappingRule {\n  public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } = [ObjectMappingPair.Create<Invoice, InvoiceDto>()];\n}`,
    keyConcepts: ["Declared Mappings", "Value Converters", "Zero Reflection"],
  },
  {
    title: "Diagnostics",
    subtitle: "Inspect what is knowable",
    href: "/docs/diagnostics",
    slug: "diagnostics",
    category: "Enterprise & Operations",
    purpose: "enterprise",
    term: "diagnostics telemetry inspect reports analyzers cligraph activity iastraflowdiagnosticsreporter",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/diagnostics.md",
    signaturePreview: `var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();\nAstraFlowDiagnosticReport report = reporter.CreateReport();`,
    keyConcepts: ["Safety Defaults", "Graph Export", "CLI Telemetry"],
  },
  {
    title: "Generators",
    subtitle: "Opt-in build-time code",
    href: "/docs/generators",
    slug: "generators",
    category: "Compiler & Tooling",
    purpose: "compiler",
    term: "generators roslyn source generated mapping registration compile time",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/generators.md",
    signaturePreview: `[AstraFlowGeneratedMapping]\npublic static partial class GeneratedMappers;\n// Emits pure C# IL-level static mapping paths`,
    keyConcepts: ["Roslyn Generators", "Zero Allocation", "AOT Compatible"],
  },
  {
    title: "Testing",
    subtitle: "Harnesses and assertions",
    href: "/docs/testing",
    slug: "testing",
    category: "Compiler & Tooling",
    purpose: "compiler",
    term: "testing harnesses assertions test doubles fakes unit test scenario",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/testing.md",
    signaturePreview: `var scenario = new MediatorTestScenario();\nscenario.RegisterHandler<CreateOrder, OrderCreated>(req => new(req.Number));`,
    keyConcepts: ["Test Doubles", "Pipeline Simulation", "Deterministic Fakes"],
  },
  {
    title: "Architecture",
    subtitle: "Boundaries and contracts",
    href: "/docs/architecture",
    slug: "architecture",
    category: "Getting Started & Strategy",
    purpose: "governance",
    term: "architecture contracts boundaries design philosophy optional dependencies",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/architecture.md",
    signaturePreview: `// Contracts package contains shared primitives;\n// Integrations depend only on what they strictly consume.`,
    keyConcepts: ["Contract Boundaries", "Minimal Coupling", "Target Frameworks"],
  },
  {
    title: "Package Selection",
    subtitle: "Choose the smallest footprint",
    href: "/docs/package-selection",
    slug: "package-selection",
    category: "Getting Started & Strategy",
    purpose: "governance",
    term: "package selection matrix modules dependencies footprint dotnet add package",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/package-selection.md",
    signaturePreview: `dotnet add package AstraFlow.Contracts\ndotnet add package AstraFlow.Mediator`,
    keyConcepts: ["Granular Packages", "Zero Unused Assemblies", "Security Boundary"],
  },
  {
    title: "Projections & EF Core",
    subtitle: "Queryable expression trees",
    href: "/docs/projections",
    slug: "projections",
    category: "Core Packages",
    purpose: "core",
    term: "projections queryable efcore entity framework database sql expression trees",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/projections.md",
    signaturePreview: `db.Orders.Where(o => o.IsActive)\n  .ProjectTo<OrderSummaryDto>(mapperConfiguration)\n  .ToListAsync(ct);`,
    keyConcepts: ["IQueryable Projection", "SQL Translation", "Entity Framework"],
  },
  {
    title: "Analyzers (AFM & AFD)",
    subtitle: "Compile-time diagnostics",
    href: "/docs/analyzers",
    slug: "analyzers",
    category: "Compiler & Tooling",
    purpose: "compiler",
    term: "analyzers afm afd roslyn warnings rules diagnostics compile time",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/analyzers.md",
    signaturePreview: `// AFM001: Unmapped property warning\n// AFD002: Redaction policy required on sensitive field`,
    keyConcepts: ["Roslyn Analyzers", "Build-Time Guardrails", "Warning As Error"],
  },
  {
    title: "Security & Redaction",
    subtitle: "Safe telemetry defaults",
    href: "/docs/security",
    slug: "security",
    category: "Enterprise & Operations",
    purpose: "enterprise",
    term: "security redaction secrets pii safety endpoint data protection",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/security.md",
    signaturePreview: `[SensitiveData(RedactionMode.Mask)]\npublic string CreditCardNumber { get; init; }`,
    keyConcepts: ["Secret Taxonomy", "Automatic Masking", "Zero Leaks"],
  },
  {
    title: "ASP.NET Core & Validation",
    subtitle: "Endpoints and FluentValidation",
    href: "/docs/aspnetcore",
    slug: "aspnetcore",
    category: "Enterprise & Operations",
    purpose: "enterprise",
    term: "aspnetcore minimal api endpoints fluentvalidation pipeline validation",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/aspnetcore.md",
    signaturePreview: `app.MapPost("/orders", async (CreateOrder cmd, ISender sender) =>\n  await sender.Send(cmd));`,
    keyConcepts: ["Minimal APIs", "FluentValidation", "Endpoint Filters"],
  },
  {
    title: "Assertions (2.4 WIP)",
    subtitle: "Unreleased source-only preview",
    href: "/docs/assertions",
    slug: "assertions",
    category: "Core Packages",
    purpose: "core",
    term: "assertions 2.4 preview unreleased runner neutral testing verification",
    versionNotice: "Unreleased · 2.4 Work in progress",
    sourcePath: "docs/assertions.md",
    signaturePreview: `// Runner-neutral assertion library for mediator flows (Work in progress)\nAstraFlowAssert.PipelineVerified(services);`,
    keyConcepts: ["Runner Neutral", "xUnit / NUnit / MSTest", "2.4 Roadmap"],
  },
  {
    title: "Migration Cookbook",
    subtitle: "From MediatR & AutoMapper",
    href: "/docs/migration-cookbook",
    slug: "migration-cookbook",
    category: "Governance & Releases",
    purpose: "governance",
    term: "migration cookbook mediatr automapper upgrade guide side by side",
    versionNotice: "Source milestone · Verify per package",
    sourcePath: "docs/migration-cookbook.md",
    signaturePreview: `// Step-by-step conversion rules with zero behavioral drift\n// Side-by-side coexistence during migration phases`,
    keyConcepts: ["Drop-in Patterns", "Zero Regressions", "Coexistence Phase"],
  },
  {
    title: "ADRs & Strategy Ledger",
    subtitle: "Architectural decision records",
    href: "/docs/adr/0001-generated-mapper",
    slug: "adr/0001-generated-mapper",
    category: "ADRs, Plans & Strategy Archive",
    purpose: "governance",
    term: "adr decisions strategy roadmap governance benchmarks architecture records",
    versionNotice: "Architecture Decision Record",
    sourcePath: "docs/adr/0001-generated-mapper.md",
    signaturePreview: `// ADR 0001: Compile-time Source Generated Mapping\n// Status: Accepted · Replaces runtime reflection for mapping`,
    keyConcepts: ["ADR Records", "Decision Governance", "Proof of Benchmark"],
  },
];

const PURPOSE_FILTERS = [
  { id: "all", label: "All Topics (61)" },
  { id: "core", label: "Core Mechanics" },
  { id: "compiler", label: "Compiler & Tooling" },
  { id: "enterprise", label: "Enterprise & Safety" },
  { id: "governance", label: "Architecture & ADRs" },
] as const;

type PurposeFilterId = (typeof PURPOSE_FILTERS)[number]["id"];

export function DocsReferenceDesk() {
  const [query, setQuery] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<PurposeFilterId>("all");
  const [activeTopic, setActiveTopic] = useState<DocReferenceTopic>(REFERENCE_TOPICS[0]);
  const [copiedLink, setCopiedLink] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const tileRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();
  const searchInputId = "docs-query";
  const statusId = useId();

  const q = query.toLowerCase().trim();

  // Filter topics based on query and selected purpose
  const filteredTopics = useMemo(() => {
    return REFERENCE_TOPICS.filter((t) => {
      const matchesPurpose = selectedPurpose === "all" || t.purpose === selectedPurpose;
      if (!matchesPurpose) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [q, selectedPurpose]);

  // Keep activeTopic pointing to something valid in filtered results
  useEffect(() => {
    if (filteredTopics.length > 0) {
      const stillThere = filteredTopics.find((t) => t.slug === activeTopic.slug);
      if (!stillThere) {
        setActiveTopic(filteredTopics[0]);
      }
    }
  }, [filteredTopics, activeTopic.slug]);

  // Keyboard shortcut listener (/ or Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      if (!isEditable && e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (query) {
        e.preventDefault();
        setQuery("");
        inputRef.current?.focus();
      } else {
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === "ArrowDown" && filteredTopics.length > 0) {
      e.preventDefault();
      tileRefs.current[0]?.focus();
      setActiveTopic(filteredTopics[0]);
    }
  };

  const handleTileKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = (index + 1) % filteredTopics.length;
      tileRefs.current[nextIdx]?.focus();
      setActiveTopic(filteredTopics[nextIdx]);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      if (index === 0) {
        inputRef.current?.focus();
      } else {
        const prevIdx = index - 1;
        tileRefs.current[prevIdx]?.focus();
        setActiveTopic(filteredTopics[prevIdx]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  const handleCopyDocUri = async () => {
    const fullUrl = `${window.location.origin}${activeTopic.href}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1600);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="reference-desk-container" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Search Controls & Purpose Filter */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <p className="tiny" style={{ margin: 0, letterSpacing: "0.08em", fontWeight: 700 }}>
            LIVING REFERENCE DESK / 61 REPOSITORY DOCUMENTS
          </p>
          <span className="tiny muted" style={{ fontFeatureSettings: '"tnum"' }}>
            PINNED SOURCE SHA: <code style={{ color: "var(--ink)", fontWeight: 600 }}>{PINNED_COMMIT_SHA.slice(0, 10)}</code>
          </span>
        </div>

        {/* Search Input Bar with Keyboard Hint */}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            ref={inputRef}
            aria-label="Filter documentation topics"
            aria-keyshortcuts="/ Control+K Meta+K"
            aria-describedby={statusId}
            className="docs-search"
            id={searchInputId}
            placeholder="Search documentation, ADRs, pipelines, signatures ↗"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            style={{
              paddingRight: "84px",
              boxShadow: "0 1px 3px rgba(8, 44, 38, 0.05)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              pointerEvents: "none",
            }}
          >
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                style={{
                  pointerEvents: "auto",
                  border: "none",
                  background: "transparent",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "4px",
                }}
                aria-label="Clear search query"
              >
                ✕
              </button>
            ) : null}
            <kbd
              style={{
                font: "10px/1.2 var(--font-mono, monospace)",
                padding: "3px 6px",
                borderRadius: "3px",
                background: "#ece5d9",
                color: "var(--ink)",
                border: "1px solid var(--line)",
              }}
            >
              /
            </kbd>
          </div>
        </div>

        {/* Purpose Category Filter Chips */}
        <div
          role="radiogroup"
          aria-label="Filter documentation by architectural purpose"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {PURPOSE_FILTERS.map((filter) => {
            const isSelected = selectedPurpose === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedPurpose(filter.id)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "#ffffff" : "var(--ink)",
                  background: isSelected ? "var(--ink)" : "var(--paper2)",
                  border: isSelected ? "1px solid var(--ink)" : "1px solid var(--line)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 140ms ease",
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Surface: Results Grid on Left, Reference Lens on Right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Left Column: Topics Results (Contains exact #topics and .docs-tile elements for Playwright verification) */}
        <div>
          <div className="docs-tiles" id="topics" style={{ marginTop: 0 }}>
            {filteredTopics.map((topic, idx) => {
              const isSelected = activeTopic.slug === topic.slug;
              return (
                <Link
                  key={topic.href}
                  ref={(el) => {
                    tileRefs.current[idx] = el;
                  }}
                  className="docs-tile"
                  data-term={topic.term}
                  href={topic.href}
                  onMouseEnter={() => setActiveTopic(topic)}
                  onFocus={() => setActiveTopic(topic)}
                  onKeyDown={(e) => handleTileKeyDown(e, idx)}
                  style={{
                    position: "relative",
                    background: isSelected ? "var(--paper)" : undefined,
                    borderColor: isSelected ? "var(--signal)" : undefined,
                  }}
                >
                  {isSelected ? (
                    <motion.span
                      layoutId="docs-tile-focus-keyline"
                      aria-hidden="true"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 34, mass: 0.7 }
                      }
                      style={{
                        position: "absolute",
                        insetInlineStart: 0,
                        insetInlineEnd: 0,
                        bottom: -1,
                        height: "2px",
                        background: "var(--signal)",
                        pointerEvents: "none",
                      }}
                    />
                  ) : null}
                  <span>
                    <strong style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {topic.title}
                      {topic.versionNotice.includes("2.4") ? (
                        <span
                          style={{
                            fontSize: "9px",
                            padding: "1px 5px",
                            borderRadius: "2px",
                            background: "#efe9de",
                            color: "var(--action)",
                            border: "1px solid var(--line)",
                          }}
                        >
                          PREVIEW
                        </span>
                      ) : null}
                    </strong>
                    <small>{topic.subtitle}</small>
                  </span>
                  <i aria-hidden="true">↗</i>
                </Link>
              );
            })}
          </div>

          {/* Empty search results status */}
          <div
            id="docs-empty"
            role="status"
            aria-live="polite"
            hidden={filteredTopics.length > 0}
            style={{
              padding: "24px 20px",
              background: "var(--paper2)",
              border: "1px dashed var(--line)",
              borderRadius: "4px",
              marginTop: "16px",
            }}
          >
            <p className="tiny muted" style={{ margin: "0 0 6px" }}>
              NO MATCHING DOCUMENTATION
            </p>
            <p style={{ margin: "0 0 14px", fontSize: "14px", color: "var(--ink)" }}>
              No articles match &ldquo;{query}&rdquo; in the selected filter. Try searching &ldquo;diagnostics&rdquo;, &ldquo;mediator&rdquo;, or &ldquo;mapper&rdquo;.
            </p>
            <button
              type="button"
              className="button button-outline"
              style={{ fontSize: "11px", padding: "6px 12px" }}
              onClick={() => {
                setQuery("");
                setSelectedPurpose("all");
                inputRef.current?.focus();
              }}
            >
              Reset Search & Filters ↺
            </button>
          </div>
        </div>

        {/* Right Column: The Living Reference Lens (astraflow-reference-lens) */}
        {activeTopic ? (
          <div
            className="reference-lens-panel"
            aria-label="Reference Lens Inspector"
            style={{
              background: "var(--paper2)",
              border: "1px solid var(--line)",
              borderRadius: "6px",
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 2px 8px rgba(8, 44, 38, 0.04)",
              position: "sticky",
              top: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span className="tiny" style={{ color: "var(--action)", fontWeight: 700 }}>
                REFERENCE LENS / INSPECTOR
              </span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "3px",
                  background: activeTopic.versionNotice.includes("2.4") ? "#faeee9" : "#efe9de",
                  color: activeTopic.versionNotice.includes("2.4") ? "var(--action)" : "var(--ink)",
                  fontWeight: 600,
                  border: "1px solid var(--line)",
                }}
              >
                {activeTopic.versionNotice}
              </span>
            </div>

            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: "20px", color: "var(--ink)", lineHeight: 1.2 }}>
                {activeTopic.title}
              </h3>
              <p className="tiny muted" style={{ margin: 0 }}>
                CATEGORY: {activeTopic.category.toUpperCase()} • SOURCE: <code>{activeTopic.sourcePath}</code>
              </p>
            </div>

            {/* Signature Preview Box */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span className="tiny" style={{ color: "var(--muted)", fontWeight: 600 }}>
                DOCUMENTED C# PATTERN / SIGNATURE
              </span>
              <pre
                dir="ltr"
                tabIndex={0}
                style={{
                  margin: 0,
                  padding: "12px 14px",
                  background: "var(--ink)",
                  color: "#ddf1dc",
                  borderRadius: "4px",
                  font: "11px/1.65 'Courier New', monospace",
                  whiteSpace: "pre-wrap",
                  overflowX: "auto",
                }}
              >
                <code>{activeTopic.signaturePreview}</code>
              </pre>
            </div>

            {/* Key Concepts Chips */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span className="tiny" style={{ color: "var(--muted)", fontWeight: 600 }}>
                KEY ARCHITECTURAL CONCEPTS
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {activeTopic.keyConcepts.map((concept) => (
                  <span
                    key={concept}
                    style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      background: "#efe9de",
                      color: "var(--ink)",
                      borderRadius: "3px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Lens Quick Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "4px",
                paddingTop: "14px",
                borderTop: "1px solid var(--line)",
                flexWrap: "wrap",
              }}
            >
              <Link className="button button-primary" href={activeTopic.href} style={{ fontSize: "12px", padding: "8px 16px" }}>
                Read full document
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </Link>
              <button
                type="button"
                className="button button-outline"
                onClick={handleCopyDocUri}
                style={{ fontSize: "12px", padding: "8px 14px" }}
                aria-label="Copy document URL"
              >
                {copiedLink ? "Link Copied ✓" : "Copy URI ↗"}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <span id={statusId} className="sr-only">
        {filteredTopics.length} documentation topics found
      </span>
    </div>
  );
}
