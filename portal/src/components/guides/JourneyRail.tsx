"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface GuideStep {
  number: string;
  stepLabel: string;
  label: string;
  subtitle: string;
  title: string;
  description: string;
  href: string;
}

export const GUIDE_STEPS: readonly GuideStep[] = [
  {
    number: "01",
    stepLabel: "STEP / 01",
    label: "Declare",
    subtitle: "Start with intent",
    title: "Start with a request.",
    description:
      "Install the focused mediator package, register the handler, and dispatch a typed request.",
    href: "/docs/getting-started",
  },
  {
    number: "02",
    stepLabel: "STEP / 02",
    label: "Compose",
    subtitle: "Choose boundaries",
    title: "Design a pipeline.",
    description:
      "Understand composition and keep your chosen behaviors explicit.",
    href: "/docs/mediator",
  },
  {
    number: "03",
    stepLabel: "STEP / 03",
    label: "Verify",
    subtitle: "Inspect decisions",
    title: "Inspect your wiring.",
    description:
      "Use diagnostics and CLI output to validate discoverable relationships.",
    href: "/docs/diagnostics",
  },
  {
    number: "04",
    stepLabel: "STEP / 04",
    label: "Evolve",
    subtitle: "Upgrade deliberately",
    title: "Upgrade deliberately.",
    description:
      "Check migration guidance and NuGet publication before version changes.",
    href: "/docs/version-upgrade-guide",
  },
];

export function JourneyRail() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    document.body.dataset.page = "guides";
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

    setActiveStep(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  const current = GUIDE_STEPS[activeStep] ?? GUIDE_STEPS[0];

  return (
    <>
      <div
        aria-label="Select a learning stage"
        className="timeline-ribbon"
        role="tablist"
        onKeyDown={handleKeyDown}
      >
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
              role="tab"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveStep(index)}
              style={
                isSelected
                  ? { boxShadow: "6px 7px 0 rgba(227, 102, 65, 0.14)" }
                  : undefined
              }
            >
              <i>{step.number}</i>
              <strong>{step.label}</strong>
              <small>{step.subtitle}</small>
            </button>
          );
        })}
      </div>
      <div
        className="guide-detail"
        id="guide-panel"
        role="tabpanel"
        aria-labelledby={`guide-tab-${activeStep}`}
        tabIndex={0}
      >
        <span className="tiny signal" id="guide-n">
          {current.stepLabel}
        </span>
        <h3 id="guide-title">{current.title}</h3>
        <p id="guide-description">{current.description}</p>
        <Link className="button button-outline" href={current.href}>
          Open the guide <span className="arrow" aria-hidden="true">↗</span>
        </Link>
      </div>
    </>
  );
}
export default JourneyRail;
