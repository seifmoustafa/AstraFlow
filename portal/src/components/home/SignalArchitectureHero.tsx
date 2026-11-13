"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { UI_COPY } from "@/content/ui-copy";

const SIGNAL_PATH =
  "M54 471 C154 468 225 468 279 468 C355 468 368 439 408 375 C448 304 470 304 530 304 H643 C678 304 710 295 770 250";

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeDocumentVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function getDocumentHiddenSnapshot() {
  return document.hidden;
}

export function SignalArchitectureHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const documentHidden = useSyncExternalStore(
    subscribeDocumentVisibility,
    getDocumentHiddenSnapshot,
    () => false,
  );

  const isPaused = reducedMotion || !isVisible || documentHidden;

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0]?.isIntersecting ?? true);
      },
      { threshold: 0.06 },
    );
    observer.observe(stageEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    try {
      if (isPaused) {
        svg.pauseAnimations?.();
      } else {
        svg.unpauseAnimations?.();
      }
    } catch {
      // Some non-browser SVG engines omit pauseAnimations/unpauseAnimations
    }
  }, [isPaused]);

  return (
    <section
      aria-labelledby="v10-hero-heading"
      className="hero v10-home-hero v12-home-hero"
      data-signal-paused={isPaused ? "true" : "false"}
    >
      <div className="site-wrap v10-home-grid">
        <div className="v10-hero-copy">
          <p className="eyebrow">{UI_COPY.hero.eyebrow}</p>
          <h1 id="v10-hero-heading">
            {UI_COPY.hero.titleTop}
            <br />
            <span className="v10-flow-word">
              {UI_COPY.hero.titleBottom}
              <span className="v10-period">.</span>
            </span>
          </h1>
          <p className="v10-hero-lead">{UI_COPY.hero.lead}</p>
          <p className="v10-hero-description">
            {UI_COPY.hero.descriptionLead}{" "}
            <strong>{UI_COPY.hero.descriptionStrong}</strong>
          </p>
          <div className="links v10-hero-actions">
            <Link
              className="button button-primary"
              href={UI_COPY.hero.primaryHref}
            >
              {UI_COPY.hero.primaryCta} <span aria-hidden="true">↗</span>
            </Link>
            <a
              className="button button-outline"
              href={UI_COPY.hero.secondaryHref}
            >
              {UI_COPY.hero.secondaryCta} <span aria-hidden="true">↘</span>
            </a>
          </div>
          <p className="v10-hero-meta mono">
            <span aria-hidden="true" className="v10-led" />{" "}
            {UI_COPY.hero.metaItems[0]} <i>·</i> {UI_COPY.hero.metaItems[1]}{" "}
            <i>·</i> {UI_COPY.hero.metaItems[2]}
          </p>
        </div>

        <div
          ref={stageRef}
          className="v10-signature-stage v12-signature-stage"
          id="v10-signature-stage"
          data-signal-paused={isPaused ? "true" : "false"}
        >
          <div className="v10-hero-grid" aria-hidden="true" />

          <div className="v10-stage-top">
            <span>{UI_COPY.hero.stageTopLabel}</span>
            <span className="v10-live-status">
              <span className="v10-live-dot" aria-hidden="true" />
              {UI_COPY.hero.liveSignalLabel}
            </span>
          </div>

          <div className="v10-svg-slot">
            <svg
              ref={svgRef}
              aria-label={UI_COPY.hero.svgAriaLabel}
              className="v10-logo-svg"
              role="img"
              viewBox="0 0 830 600"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="aFront" x1="0" x2="1" y1="0" y2="1">
                  <stop stopColor="#143e35" />
                  <stop offset=".43" stopColor="#0b302a" />
                  <stop offset="1" stopColor="#031d19" />
                </linearGradient>
                <linearGradient id="aSide" x1="0" x2="1" y1="0" y2=".8">
                  <stop stopColor="#42695b" />
                  <stop offset="1" stopColor="#05251f" />
                </linearGradient>
                <linearGradient
                  id="routeGradient"
                  x1="0"
                  x2="1"
                  y1=".2"
                  y2=".9"
                >
                  <stop stopColor="#ffd7ad" />
                  <stop offset=".45" stopColor="#ff8d51" />
                  <stop offset="1" stopColor="#dc4826" />
                </linearGradient>
                <linearGradient id="routeTop" x1="0" x2=".6" y1="0" y2="1">
                  <stop stopColor="#f6b07f" />
                  <stop offset="1" stopColor="#d94f2d" />
                </linearGradient>
                <filter height="160%" id="floats" width="160%" x="-30%" y="-30%">
                  <feDropShadow
                    dx="0"
                    dy="23"
                    floodColor="#0b302a"
                    floodOpacity=".19"
                    stdDeviation="20"
                  />
                </filter>
                <filter
                  height="220%"
                  id="routeGlow"
                  width="220%"
                  x="-60%"
                  y="-60%"
                >
                  <feGaussianBlur stdDeviation="10" />
                </filter>
                <pattern
                  height="30"
                  id="plotDots"
                  patternUnits="userSpaceOnUse"
                  width="30"
                >
                  <circle
                    cx="1"
                    cy="1"
                    fill="#144438"
                    opacity=".20"
                    r=".7"
                  />
                </pattern>
              </defs>

              <rect
                fill="url(#plotDots)"
                height="600"
                opacity=".45"
                width="830"
                x="0"
                y="0"
              />

              <g
                className="stage-architecture"
                fill="none"
                opacity="0.22"
                stroke="#6c8475"
                strokeWidth="1"
              >
                <path d="M9 103H816 M9 202H816 M9 308H816 M9 411H816 M9 515H816 M114 32V568 M246 32V568 M382 32V568 M515 32V568 M648 32V568 M762 32V568" />
                <circle
                  cx="445"
                  cy="292"
                  r="235"
                  strokeDasharray="3 10"
                />
                <circle cx="445" cy="292" r="176" />
                <path
                  d="M3 517L808 84 M-18 279L821 479 M0 79L772 580"
                  opacity="0.5"
                />
              </g>

              <g className="signature-a" filter="url(#floats)">
                <path
                  d="M331 99 H448 L574 303 H477 L390 161 L242 405 C232 425 224 434 196 434 H111 Z"
                  fill="#041c17"
                  opacity=".13"
                  transform="translate(13 22)"
                />
                <path
                  d="M330 79 H452 L578 294 H479 L392 150 L245 388 C235 405 226 413 196 413 H112 Z"
                  fill="url(#aSide)"
                />
                <path
                  d="M330 79 H421 L537 264 H450 L386 157 L245 388 C235 405 226 413 196 413 H112 Z"
                  fill="url(#aFront)"
                />
                <path
                  d="M117 450 H280 C329 450 349 431 375 389 L424 310 C445 275 470 260 508 260 H640 L699 354 H520 C492 354 483 360 471 382 L415 472 C384 521 349 528 280 528 H69 Z"
                  fill="#db3e24"
                  opacity=".19"
                  transform="translate(9 15)"
                />
                <path
                  d="M117 450 H280 C329 450 349 431 375 389 L424 310 C445 275 470 260 508 260 H640 L685 333 H520 C492 333 483 345 471 367 L415 455 C384 501 349 510 280 510 H69 Z"
                  fill="url(#routeGradient)"
                />
                <path
                  d="M424 310 C445 275 470 260 508 260 H640 L685 333 H520 C492 333 483 345 471 367"
                  fill="none"
                  stroke="#fff5d7"
                  strokeOpacity=".57"
                  strokeWidth="2"
                />
                <path
                  d="M596 382 H663 L714 464 H648 Z"
                  fill="url(#aFront)"
                />
              </g>

              <path
                d={SIGNAL_PATH}
                fill="none"
                filter="url(#routeGlow)"
                stroke="#f9ae80"
                strokeOpacity=".18"
                strokeWidth="12"
              />
              <path
                className="signature-route"
                d={SIGNAL_PATH}
                fill="none"
                id="signature-route"
                stroke="#fff8d5"
                strokeDasharray="3 13"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              <g className="signature-flow-dot">
                <circle
                  fill="#f25d36"
                  r="8"
                  stroke="#fff7ed"
                  strokeWidth="3"
                >
                  <animateMotion
                    dur="7s"
                    path={SIGNAL_PATH}
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                </circle>
              </g>

              <g
                className="plot-label"
                fill="#163c33"
                fontFamily="Inter, Arial, sans-serif"
                fontSize="13"
              >
                <rect
                  fill="#fffaf3"
                  height="40"
                  rx="10"
                  stroke="#dad6ca"
                  width="135"
                  x="15"
                  y="418"
                />
                <circle cx="34" cy="438" fill="#d84c30" r="4" />
                <text x="48" y="443">
                  REQUEST
                </text>

                <rect
                  fill="#fffaf3"
                  height="40"
                  rx="10"
                  stroke="#dad6ca"
                  width="140"
                  x="377"
                  y="527"
                />
                <circle cx="397" cy="547" fill="#d84c30" r="4" />
                <text x="410" y="552">
                  PIPELINE
                </text>

                <rect
                  fill="#fffaf3"
                  height="40"
                  rx="10"
                  stroke="#dad6ca"
                  width="125"
                  x="573"
                  y="200"
                />
                <circle cx="594" cy="219" fill="#d84c30" r="4" />
                <text x="607" y="225">
                  HANDLER
                </text>

                <rect
                  fill="#08332a"
                  height="40"
                  rx="10"
                  width="108"
                  x="712"
                  y="175"
                />
                <text fill="#fff4e9" x="729" y="200">
                  RESULT ↗
                </text>
              </g>

              <g
                fill="none"
                opacity=".55"
                stroke="#225345"
                strokeDasharray="3 5"
                strokeWidth="1.3"
              >
                <path d="M147 439 H230 V469" />
                <path d="M449 527 V465" />
                <path d="M630 241 V304" />
                <path d="M767 216 V250" />
              </g>

              <g fill="#ed623e">
                <rect height="12" rx="2" width="12" x="225" y="461" />
                <rect height="12" rx="2" width="12" x="445" y="367" />
                <rect height="12" rx="2" width="12" x="643" y="296" />
              </g>
            </svg>
          </div>

          <div className="v10-stage-bottom v12-stage-bottom">
            {UI_COPY.hero.stageSteps.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="site-wrap v10-hero-under">
        <span>{UI_COPY.hero.underStatement}</span>
        <a href={UI_COPY.hero.secondaryHref}>
          {UI_COPY.hero.underAction} <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
