"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
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
  href: string;
  packageFocus: string;
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
    href: "/docs/getting-started",
    packageFocus: "AstraFlow.Mediator",
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
    href: "/docs/mediator",
    packageFocus: "AstraFlow.Contracts + Pipeline",
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
    href: "/docs/diagnostics",
    packageFocus: "AstraFlow.Diagnostics + CLI",
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
    href: "/docs/version-upgrade-guide",
    packageFocus: "Migration & Governance",
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

  const current = GUIDE_STEPS[activeStep] ?? GUIDE_STEPS[0];
  const progressRatio = activeStep / (GUIDE_STEPS.length - 1);

  return (
    <>
      <div
        aria-label="Select a learning stage"
        className="timeline-ribbon"
        role="tablist"
        onKeyDown={handleKeyDown}
        data-active-guide={activeStep}
      >
        {/* True connector rail progress trace along the horizontal axis (0% at resting step 0) */}
        <motion.span
          aria-hidden="true"
          className="guides-rail-progress max-[770px]:hidden"
          initial={false}
          animate={{
            scaleX: progressRatio,
            opacity: activeStep === 0 ? 0 : 1,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.36, ease: [0.2, 0.8, 0.2, 1] }
          }
          style={{
            position: "absolute",
            insetInlineStart: "10%",
            insetInlineEnd: "10%",
            top: "64px",
            height: "2px",
            background: "var(--signal)",
            transformOrigin: "0 50%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {GUIDE_STEPS.map((step, index) => {
          const isSelected = activeStep === index;
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
              className="timeline-step"
              data-guide={index}
              data-guide-slug={step.slug}
              role="tab"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => selectStep(index, true)}
              style={
                isSelected
                  ? { boxShadow: "6px 7px 0 rgba(227, 102, 65, 0.14)" }
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
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    boxShadow: "6px 7px 0 rgba(227, 102, 65, 0.14)",
                    zIndex: -1,
                  }}
                />
              )}
              <i>{step.number}</i>
              <strong>{step.label}</strong>
              <small>{step.subtitle}</small>
            </button>
          );
        })}
      </div>

      <motion.div
        key={current.slug}
        className="guide-detail"
        id="guide-panel"
        role="tabpanel"
        aria-labelledby={`guide-tab-${activeStep}`}
        tabIndex={0}
        initial={prefersReducedMotion ? false : { opacity: 0.78, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.22, ease: [0.22, 0.75, 0.19, 1] }
        }
      >
        <span className="tiny signal" id="guide-n">
          {current.stepLabel}
        </span>
        <h3 id="guide-title">{current.title}</h3>
        <p id="guide-description">{current.description}</p>
        <Link className="button button-outline" href={current.href}>
          Open the guide <span className="arrow" aria-hidden="true">↗</span>
        </Link>
      </motion.div>
    </>
  );
}
export default JourneyRail;
