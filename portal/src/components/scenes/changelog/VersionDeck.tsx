"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  circ,
  poly,
  seg,
  useReducedMotionSafe,
} from "@/components/hairline";
import type { ChangelogRelease, ChangelogStats } from "@/lib/changelog";
import styles from "./VersionDeck.module.css";

const FEATURED_VERSIONS = [
  "2.4.0",
  "2.3.0",
  "2.2.0",
  "2.1.0",
  "2.0.0",
  "1.0.0",
] as const;

const IDLE_CYCLE_MS = 4500;

export interface VersionDeckProps {
  releases: readonly ChangelogRelease[];
  stats: ChangelogStats;
  onJumpToRelease?: (anchorId: string) => void;
}

function selectFeaturedReleases(
  releases: readonly ChangelogRelease[],
): ChangelogRelease[] {
  const byVersion = new Map(releases.map((release) => [release.version, release]));
  const picked: ChangelogRelease[] = [];

  for (const version of FEATURED_VERSIONS) {
    const match = byVersion.get(version);
    if (match) {
      picked.push(match);
    }
  }

  if (picked.length > 0) {
    return picked;
  }

  return releases.slice(0, 6);
}

/**
 * Pure geometric Hairline seal rendered with iso-kernel circle and tick segments.
 */
function ArchivalSeal({
  isUnreleased,
}: {
  isUnreleased: boolean;
}) {
  const outerRing = useMemo(
    () => poly(circ(29, 32, 34, 34).map((sample) => [sample.u, sample.v])),
    [],
  );
  const innerRing = useMemo(
    () => poly(circ(18, 24, 34, 34).map((sample) => [sample.u, sample.v])),
    [],
  );
  const cardinalTicks = useMemo(
    () => [
      seg([34, 2], [34, 10]),
      seg([34, 58], [34, 66]),
      seg([2, 34], [10, 34]),
      seg([58, 34], [66, 34]),
    ],
    [],
  );

  const ringStroke = isUnreleased
    ? "rgba(255, 250, 242, 0.78)"
    : "rgba(255, 210, 189, 0.72)";
  const accentStroke = isUnreleased ? "#fffaf2" : "#f25e3b";

  return (
    <svg
      className={styles.sheetSeal}
      viewBox="0 0 68 68"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={outerRing}
        stroke={ringStroke}
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />
      <path d={innerRing} stroke={accentStroke} strokeWidth="1.4" />
      {cardinalTicks.map((tick, idx) => (
        <path
          key={idx}
          d={tick}
          stroke={ringStroke}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      ))}
      <circle cx="34" cy="34" r="3.5" fill={accentStroke} />
    </svg>
  );
}

export function VersionDeck({
  releases,
  stats,
  onJumpToRelease,
}: VersionDeckProps) {
  const reducedMotion = useReducedMotionSafe();
  const featured = useMemo(() => selectFeaturedReleases(releases), [releases]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusInside, setIsFocusInside] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const safeIndex =
    featured.length > 0 ? Math.min(activeIndex, featured.length - 1) : 0;
  const activeRelease = featured[safeIndex] ?? releases[0];
  const isUserInteracting = isHovered || isFocusInside;
  const shouldAutoCycle =
    !reducedMotion && !isUserInteracting && featured.length > 1;

  useEffect(() => {
    if (!shouldAutoCycle) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featured.length);
    }, IDLE_CYCLE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [shouldAutoCycle, featured.length]);

  if (!activeRelease) {
    return null;
  }

  const selectAndFocus = (nextIndex: number) => {
    const normalized =
      ((nextIndex % featured.length) + featured.length) % featured.length;
    setActiveIndex(normalized);
    tabRefs.current[normalized]?.focus();
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        selectAndFocus(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        selectAndFocus(index - 1);
        break;
      case "Home":
        event.preventDefault();
        selectAndFocus(0);
        break;
      case "End":
        event.preventDefault();
        selectAndFocus(featured.length - 1);
        break;
      default:
        break;
    }
  };

  const handleStageBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget as Node | null;
    if (!event.currentTarget.contains(nextFocused)) {
      setIsFocusInside(false);
    }
  };

  const handleJump = () => {
    if (onJumpToRelease) {
      onJumpToRelease(activeRelease.anchorId);
      return;
    }
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${activeRelease.anchorId}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      document.getElementById("releases")?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  const provenanceStamp =
    activeRelease.releaseDate &&
    !activeRelease.statusLabel.includes(activeRelease.releaseDate)
      ? `${activeRelease.statusLabel} · ${activeRelease.releaseDate}`
      : activeRelease.statusLabel;

  return (
    <div
      className={styles.deckRoot}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusInside(true)}
      onBlurCapture={handleStageBlur}
    >
      <div className={styles.editionStage}>
        <div className={styles.stageTop}>
          <p className={styles.stageKicker}>THE EDITIONS / SELECT TO INSPECT</p>
          <span className={styles.stageStatus}>
            <span className={styles.stagePulse} aria-hidden="true" />
            {isUserInteracting
              ? `INSPECTING · v${activeRelease.version}`
              : "ARCHIVE IS CONTINUOUS"}
          </span>
        </div>

        <svg
          className={styles.stageField}
          viewBox="0 0 640 390"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="changelog-stage-grid"
              width="42"
              height="42"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 42 0 L 0 0 0 42"
                fill="none"
                stroke="rgba(8, 44, 38, 0.055)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect
            x="0"
            y="0"
            width="640"
            height="390"
            fill="url(#changelog-stage-grid)"
          />
          <circle
            cx="320"
            cy="194"
            r="154"
            stroke="rgba(8, 44, 38, 0.1)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <circle
            cx="320"
            cy="194"
            r="112"
            stroke="rgba(8, 44, 38, 0.06)"
            strokeWidth="1"
          />

          <path
            d="M20 325 C150 278 253 350 320 236 S485 120 610 89"
            stroke="rgba(242, 94, 59, 0.2)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M20 325 C150 278 253 350 320 236 S485 120 610 89"
            stroke="#f25e3b"
            strokeWidth="1.65"
            strokeLinecap="round"
            className={styles.conduitFlow}
          />
          <circle cx="20" cy="325" r="3.5" fill="#f25e3b" />
          <circle cx="610" cy="89" r="3.5" fill="#0a342b" />
        </svg>

        <div className={styles.stageDeck}>
          <div className={styles.paperBack} aria-hidden="true">
            <span className={styles.paperBackStamp}>ASTRAFLOW / THE ARCHIVE</span>
            <span className={styles.paperBackRule} />
          </div>

          <div className={styles.paperMiddle} aria-hidden="true">
            <span className={styles.paperMiddleStamp}>ENGINEERED CLARITY</span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeRelease.version}
              id={`edition-panel-${activeRelease.version}`}
              role="tabpanel"
              aria-labelledby={`edition-tab-${activeRelease.version}`}
              className={`${styles.paperActive} ${
                activeRelease.isUnreleased
                  ? styles.paperActiveUnreleased
                  : styles.paperActivePublished
              }`}
              initial={
                reducedMotion
                  ? { opacity: 0, rotate: -3 }
                  : { opacity: 0, y: 18, rotate: -6, scale: 0.96 }
              }
              animate={{ opacity: 1, y: 0, rotate: -3, scale: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0, rotate: -3 }
                  : { opacity: 0, y: -14, rotate: 0, scale: 0.96 }
              }
              transition={{
                duration: reducedMotion ? 0.08 : 0.34,
                ease: [0.22, 0.75, 0.19, 1],
              }}
            >
              <div className={styles.sheetHeader}>
                <span className={styles.sheetPill}>{provenanceStamp}</span>
                <span className={styles.sheetIndex}>
                  {String(safeIndex + 1).padStart(2, "0")} /{" "}
                  {String(featured.length).padStart(2, "0")}
                </span>
              </div>

              <p className={styles.sheetVersion}>v{activeRelease.version}</p>

              <div className={styles.sheetFooter}>
                <div className={styles.sheetCopy}>
                  <p className={styles.sheetHeadline}>{activeRelease.headline}</p>
                  <p className={styles.sheetMeta}>
                    {activeRelease.itemCount} recorded entries ·{" "}
                    {activeRelease.isBreaking
                      ? "Includes breaking changes"
                      : "Non-breaking release"}
                  </p>
                </div>
                <ArchivalSeal isUnreleased={activeRelease.isUnreleased} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.stageControl}>
          <div
            className={styles.tablist}
            role="tablist"
            aria-label="Key AstraFlow release provenance milestones"
          >
            {featured.map((release, index) => {
              const isSelected = index === safeIndex;
              const activeClass = release.isUnreleased
                ? styles.tabButtonUnreleasedActive
                : styles.tabButtonActive;

              return (
                <button
                  key={release.version}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  id={`edition-tab-${release.version}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`edition-panel-${release.version}`}
                  tabIndex={isSelected ? 0 : -1}
                  className={`${styles.tabButton} ${
                    isSelected ? activeClass : ""
                  }`}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  v{release.version}
                </button>
              );
            })}
          </div>

          <div className={styles.controlFooter}>
            <p className={styles.controlSummary}>
              {activeRelease.provenanceNote} ({stats.totalReleases} source
              entries verified).
            </p>
            <button
              type="button"
              className={styles.jumpButton}
              onClick={handleJump}
            >
              Jump to v{activeRelease.version} notes ↘
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
