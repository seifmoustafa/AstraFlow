"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";

export type GuideStageSlug = "declare" | "compose" | "verify" | "evolve";

export interface GuideStep {
  index: 0 | 1 | 2 | 3;
  slug: GuideStageSlug;
  number: string;
  stepLabel: string;
  label: string;
  subtitle: string;
  title: string;
  description: string;
  rationale: string;
  packageFocus: string;
  domainBadge: string;
  codeSnippet: string;
  nextPreview: string;
  href: string;
}

export const GUIDE_STEPS: readonly GuideStep[] = [
  {
    index: 0,
    slug: "declare",
    number: "01",
    stepLabel: "STEP / 01",
    label: "Declare",
    subtitle: "Start with intent",
    title: "Start with a request.",
    description:
      "Install the focused mediator package, register the handler, and dispatch a typed request.",
    rationale:
      "Every workflow begins as an immutable contract (IRequest<TResponse>). Handlers are decoupled from callers at compile time, eliminating runtime reflection and service locator lookups.",
    packageFocus: "AstraFlow.Mediator",
    domainBadge: "CORE MESSAGING · INTENT DECLARATION",
    codeSnippet: `// 1. Declare the immutable typed contract
public sealed record CreateOrder(string Number)
    : IRequest<OrderCreated>;

// 2. Dispatch with compile-time type safety
var response = await sender.Send(
    new CreateOrder("ORD-1042"), ct);`,
    nextPreview: "02 / COMPOSE → Design a pipeline",
    href: "/docs/getting-started",
  },
  {
    index: 1,
    slug: "compose",
    number: "02",
    stepLabel: "STEP / 02",
    label: "Compose",
    subtitle: "Choose boundaries",
    title: "Design a pipeline.",
    description:
      "Understand composition and keep your chosen behaviors explicit.",
    rationale:
      "Middlewares are declared in explicit order without hidden interceptors. Cross-cutting concerns like validation and logging wrap handlers deterministically.",
    packageFocus: "AstraFlow.Contracts + Pipeline",
    domainBadge: "PIPELINE ARCHITECTURE · RUNTIME ORDER",
    codeSnippet: `// Register behaviors in deliberate execution sequence
services.AddAstraFlow(options => {
    options.AddBehavior(typeof(ValidationBehavior<,>));
    options.AddBehavior(typeof(LoggingBehavior<,>));
    options.RegisterHandlersFromAssemblyContaining<CreateOrderHandler>();
});`,
    nextPreview: "03 / VERIFY → Inspect your wiring",
    href: "/docs/mediator",
  },
  {
    index: 2,
    slug: "verify",
    number: "03",
    stepLabel: "STEP / 03",
    label: "Verify",
    subtitle: "Inspect decisions",
    title: "Inspect your wiring.",
    description:
      "Use diagnostics and CLI output to validate discoverable relationships.",
    rationale:
      "Static analyzers and diagnostic reporters surface missing handlers and circular dependencies before runtime deployment, outputting Mermaid and JSON graphs.",
    packageFocus: "AstraFlow.Diagnostics + CLI",
    domainBadge: "STATIC & RUNTIME AUDIT · STRUCTURAL EVIDENCE",
    codeSnippet: `// Extract verified graph representation of all registered flows
var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();
AstraFlowDiagnosticReport report = reporter.CreateReport();

// Check for unresolved handlers or circular dependencies
bool hasErrors = report.Summary.HasErrors;`,
    nextPreview: "04 / EVOLVE → Upgrade deliberately",
    href: "/docs/diagnostics",
  },
  {
    index: 3,
    slug: "evolve",
    number: "04",
    stepLabel: "STEP / 04",
    label: "Evolve",
    subtitle: "Upgrade deliberately",
    title: "Upgrade deliberately.",
    description:
      "Check migration guidance and NuGet publication before version changes.",
    rationale:
      "Use API baseline diffs and release migration checklists to upgrade versions with predictable binary and source compatibility.",
    packageFocus: "AstraFlow Governance & Migration",
    domainBadge: "LIFECYCLE GOVERNANCE · ZERO UNEXPECTED DRIFT",
    codeSnippet: `// Check public API drift between releases via AstraFlow CLI
// dotnet astraflow diff --baseline v2.2.0 --target v2.3.0
// Review Migration Cookbook for MediatR & AutoMapper conversions:
// /docs/migration-cookbook`,
    nextPreview: "COMPLETE ROUTE → Back to 01 / Declare",
    href: "/docs/version-upgrade-guide",
  },
];

function resolveStepFromLocation(): number | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash.replace(/^#/, "").trim().toLowerCase();
  if (hash) {
    const bySlug = GUIDE_STEPS.findIndex(
      (s) =>
        s.slug === hash ||
        `step-${s.index + 1}` === hash ||
        `step-0${s.index + 1}` === hash ||
        `guide-${s.index}` === hash,
    );
    if (bySlug >= 0) return bySlug;
  }

  const params = new URLSearchParams(window.location.search);
  const stepParam = params.get("step")?.trim().toLowerCase();
  if (stepParam) {
    const byParam = GUIDE_STEPS.findIndex(
      (s) =>
        s.slug === stepParam ||
        String(s.index + 1) === stepParam ||
        s.number === stepParam,
    );
    if (byParam >= 0) return byParam;
  }

  return null;
}

export function JourneyRail() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { prefersReducedMotion } = useReducedMotionContext();

  useEffect(() => {
    document.body.dataset.page = "guides";

    const syncFromUrl = () => {
      const resolved = resolveStepFromLocation();
      if (resolved !== null) {
        setActiveStep(resolved);
      }
    };

    syncFromUrl();
    window.addEventListener("hashchange", syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncFromUrl);
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, []);

  const selectStep = useCallback((index: number, updateUrlHash = true) => {
    const clamped = Math.max(0, Math.min(GUIDE_STEPS.length - 1, index));
    setActiveStep(clamped);
    setCopied(false);

    if (updateUrlHash && typeof window !== "undefined") {
      const targetSlug = GUIDE_STEPS[clamped]?.slug;
      if (targetSlug && window.history?.replaceState) {
        const nextUrl = `${window.location.pathname}${window.location.search}#${targetSlug}`;
        window.history.replaceState(null, "", nextUrl);
      }
    }
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
      return;
    }

    const activeElement = document.activeElement;
    const currentIndex = tabRefs.current.findIndex((el) => el === activeElement);
    const baseIndex = currentIndex >= 0 ? currentIndex : activeStep;
    const total = GUIDE_STEPS.length;

    event.preventDefault();

    let nextIndex = baseIndex;
    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = total - 1;
    } else if (event.key === "ArrowRight") {
      nextIndex = (baseIndex + 1) % total;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (baseIndex - 1 + total) % total;
    }

    selectStep(nextIndex, true);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleCopy = async (code: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // Fallback
    }
  };

  const current = GUIDE_STEPS[activeStep] ?? GUIDE_STEPS[0];
  const progressRatio = activeStep / (GUIDE_STEPS.length - 1);

  // Optical alignment for the origin anchor triangle
  const originPercent = (activeStep / (GUIDE_STEPS.length - 1)) * 75 + 12.5;

  return (
    <div className="learning-route-instrument" data-active-step={activeStep}>
      {/* Route Architecture Conduit Header */}
      <div className="route-conduit-bar flex items-center justify-between border-b border-[var(--line)] pb-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--signal)] animate-pulse" />
          <span className="font-mono text-[11px] font-bold tracking-widest text-[var(--ink)] uppercase">
            AstraFlow Architecture Flight Plan · Milestone Track
          </span>
        </div>
        <div className="font-mono text-[11px] text-[var(--muted)] hidden sm:block">
          MILESTONE {current.number} OF 04 · {current.label.toUpperCase()}
        </div>
      </div>

      {/* The 4-Waypoint Progression Rail */}
      <div
        aria-label="Select a learning stage"
        className="timeline-ribbon relative grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-0 pb-6"
        role="tablist"
        onKeyDown={handleKeyDown}
        data-active-guide={activeStep}
      >
        {/* Background track line */}
        <div
          aria-hidden="true"
          className="absolute inset-x-[12%] top-[38px] h-[2px] bg-[var(--line)] hidden md:block z-0 pointer-events-none"
        />

        {/* Active Route Growth Conduit (travels along track) */}
        <motion.div
          aria-hidden="true"
          className="guides-rail-progress absolute inset-x-[12%] top-[38px] h-[2px] bg-[var(--signal)] hidden md:block z-0 pointer-events-none"
          initial={false}
          animate={{
            scaleX: progressRatio,
            opacity: activeStep === 0 ? 0.35 : 1,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }
          }
          style={{
            transformOrigin: "0 50%",
            boxShadow: "0 0 12px rgba(242, 94, 59, 0.35)",
          }}
        />

        {GUIDE_STEPS.map((step, index) => {
          const isSelected = activeStep === index;
          const isPast = activeStep > index;

          return (
            <button
              key={step.number}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              id={`guide-tab-${index}`}
              aria-controls="guide-panel"
              aria-selected={isSelected}
              className={`timeline-step group text-left relative z-10 transition-all p-3 md:p-4 rounded-md ${
                isSelected
                  ? "bg-[var(--paper2)] shadow-sm border border-[var(--signal)]/40"
                  : "hover:bg-[var(--sand)]/50"
              }`}
              data-guide={index}
              data-guide-slug={step.slug}
              role="tab"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => selectStep(index, true)}
              style={
                isSelected
                  ? {
                      boxShadow: "0 8px 24px rgba(242, 94, 59, 0.12)",
                    }
                  : undefined
              }
            >
              {isSelected && (
                <motion.span
                  layoutId="guides-active-step-marker"
                  aria-hidden="true"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                          mass: 0.7,
                        }
                  }
                  className="absolute inset-0 rounded-md border-2 border-[var(--signal)] pointer-events-none -z-10"
                />
              )}

              {/* Waypoint Station Hub */}
              <div className="flex items-center gap-3 mb-3">
                <i
                  className={`flex items-center justify-center w-[46px] h-[46px] rounded-md font-mono text-[16px] font-bold transition-all duration-300 ${
                    isSelected
                      ? "bg-[var(--signal)] text-white shadow-[0_4px_12px_rgba(242,94,59,0.35)] -translate-y-1"
                      : isPast
                      ? "bg-[var(--forest)] text-[var(--paper)] border border-[var(--line)]"
                      : "bg-[var(--paper2)] text-[var(--ink)] border border-[var(--line)]"
                  }`}
                >
                  {isPast ? "✓" : step.number}
                </i>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--muted)]">
                    {isPast ? "COMPLETED" : isSelected ? "ACTIVE FOCUS" : "UPCOMING"}
                  </span>
                  <strong className="text-[17px] tracking-tight text-[var(--ink)] font-bold">
                    {step.label}
                  </strong>
                </div>
              </div>

              <small className="block text-[12px] text-[var(--muted)] leading-relaxed pl-1">
                {step.subtitle}
              </small>
            </button>
          );
        })}
      </div>

      {/* Docked Origin Conduit Indicator (Origin-aware anchor) */}
      <div className="hidden md:flex justify-start relative px-4 pointer-events-none">
        <motion.div
          className="w-4 h-4 bg-[var(--paper2)] border-t border-l border-[var(--line)] rotate-45 -mb-2 z-20"
          animate={{ left: `${originPercent}%` }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 360, damping: 30 }
          }
          style={{ position: "absolute" }}
        />
      </div>

      {/* Integrated Docked Learning Route Detail (Replaces separated disconnected panel) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.slug}
          className="guide-detail bg-[var(--paper2)] border border-[var(--line)] rounded-lg p-6 md:p-8 mt-2 shadow-[0_12px_40px_rgba(8,44,38,0.06)]"
          id="guide-panel"
          role="tabpanel"
          aria-labelledby={`guide-tab-${activeStep}`}
          tabIndex={0}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.22, 0.75, 0.19, 1] }}
        >
          {/* Header Bar with Step designation & Domain Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="tiny signal font-mono font-bold tracking-widest" id="guide-n">
                {current.stepLabel}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--line)]" />
              <span className="font-mono text-[11px] font-bold text-[var(--forest)] tracking-wider">
                {current.domainBadge}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-[var(--sand)]/60 px-2.5 py-1 rounded text-[11px] font-mono font-semibold text-[var(--forest)] border border-[var(--line)]">
              <span>TARGET PKG:</span>
              <span className="text-[var(--action)] font-bold">{current.packageFocus}</span>
            </div>
          </div>

          {/* Title & Core Intent */}
          <div className="mb-6">
            <h3 id="guide-title" className="text-[28px] md:text-[36px] font-extrabold text-[var(--ink)] tracking-tight mb-2">
              {current.title}
            </h3>
            <p id="guide-description" className="text-[16px] text-[var(--muted)] leading-relaxed max-w-[850px]">
              {current.description}
            </p>
          </div>

          {/* Architectural Blueprint Grid (Decision + Code pattern) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 p-5 bg-[var(--paper)] rounded-md border border-[var(--line)]">
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-[var(--signal)] mb-2 block">
                  ARCHITECTURAL SCOPE & DECISION
                </span>
                <p className="text-[14px] text-[var(--ink)] leading-relaxed">
                  {current.rationale}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--line)]">
                <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--muted)] block mb-1">
                  ONWARD TRAJECTORY
                </span>
                <span className="text-[13px] font-bold text-[var(--forest)] flex items-center gap-1">
                  {current.nextPreview}
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[var(--forest0)] text-[#ecf8f0] p-4 rounded-md font-mono text-[12px] relative overflow-x-auto shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-[var(--peach)]">
                <span>VERIFIED PATTERN // C# .NET 8/9/10</span>
                <button
                  type="button"
                  onClick={() => handleCopy(current.codeSnippet)}
                  className="hover:text-white transition-colors underline cursor-pointer"
                  aria-label="Copy code snippet"
                >
                  {copied ? "COPIED ✓" : "COPY SNIPPET ↗"}
                </button>
              </div>
              <pre className="leading-relaxed whitespace-pre font-mono">
                {current.codeSnippet}
              </pre>
            </div>
          </div>

          {/* Action Callout Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-[13px] text-[var(--muted)] flex items-center gap-2">
              <span className="text-[var(--action)] font-bold">✓</span>
              <span>All examples tested against pinned AstraFlow source & verified contracts.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => selectStep((activeStep + 1) % GUIDE_STEPS.length, true)}
                className="button button-outline text-[13px] py-2.5 px-4 cursor-pointer"
              >
                {activeStep === 3 ? "Restart Cycle ↺" : "Next Milestone →"}
              </button>
              <Link className="button button-primary text-[13px] py-2.5 px-5" href={current.href}>
                Open the guide <span className="arrow ml-1" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default JourneyRail;
