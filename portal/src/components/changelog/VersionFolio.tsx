"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";
import Link from "next/link";

export const PINNED_COMMIT_SHA = "b163535864199bfb05cef62807d89509ac2239f8";

export interface ChangelogSectionData {
  title: string;
  items: string[];
}

export interface ReleaseFolioEntry {
  id: string;
  version: string;
  displayVersion: string;
  versionSublabel?: string;
  rawHeader: string;
  dateQualification: string;
  headline: string;
  summary: string;
  statusVariant: "source" | "published" | "neutral";
  statusLabel: string;
  provenanceNote: string;
  sourceUrl: string;
  nugetUrl?: string;
  sections: ChangelogSectionData[];
}

export interface VersionFolioProps {
  releases: readonly ReleaseFolioEntry[];
  sourceCommitSha: string;
}

const SPRING_PHYSICAL = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.72,
};

const STRUCTURE_TRANSITION = {
  duration: 0.28,
  ease: [0.22, 0.75, 0.19, 1] as const,
};

const INSTANT_TRANSITION = {
  duration: 0,
};

type ReleaseFilterCategory =
  | "all"
  | "v2"
  | "v1"
  | "published"
  | "preview"
  | "security";

export function VersionFolio({
  releases,
  sourceCommitSha,
}: VersionFolioProps) {
  const { prefersReducedMotion } = useReducedMotionContext();
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    r24: true, // open the active in-development preview by default
  });
  const [selectedId, setSelectedId] = useState<string>("r24");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<ReleaseFilterCategory>("all");
  const toggleRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    document.body.dataset.page = "changelog";
  }, []);

  // Filtered releases based on epoch filter and search query
  const filteredReleases = useMemo(() => {
    let result = releases;

    if (activeFilter === "v2") {
      result = result.filter((r) => r.version.startsWith("2."));
    } else if (activeFilter === "v1") {
      result = result.filter((r) => r.version.startsWith("1.") || r.version.startsWith("0."));
    } else if (activeFilter === "published") {
      result = result.filter((r) => r.statusVariant === "published");
    } else if (activeFilter === "preview") {
      result = result.filter((r) => r.statusVariant === "source");
    } else if (activeFilter === "security") {
      result = result.filter((r) =>
        r.sections.some((s) => s.title.toLowerCase().includes("security")),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.version.toLowerCase().includes(q) ||
          r.headline.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.sections.some(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.items.some((item) => item.toLowerCase().includes(q)),
          ),
      );
    }

    return result;
  }, [releases, activeFilter, searchQuery]);

  const toggleRelease = (id: string) => {
    setSelectedId(id);
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    const total = filteredReleases.length;
    if (total === 0) return;

    event.preventDefault();
    let nextIndex = index;
    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = total - 1;
    } else if (event.key === "ArrowDown") {
      nextIndex = Math.min(total - 1, index + 1);
    } else if (event.key === "ArrowUp") {
      nextIndex = Math.max(0, index - 1);
    }

    const nextRelease = filteredReleases[nextIndex];
    if (nextRelease) {
      setSelectedId(nextRelease.id);
      toggleRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <LayoutGroup id="mechanical-version-folio">
      {/* Mechanical Archive Controls & Caliper Filter Strip */}
      <div
        className="folio-instrument-panel"
        style={{
          background: "var(--paper2)",
          border: "1px solid var(--line)",
          borderRadius: "8px",
          padding: "20px 24px",
          marginBottom: "36px",
          boxShadow: "0 8px 24px rgba(8, 44, 38, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            borderBottom: "1px solid var(--line)",
            paddingBottom: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <span
              className="tiny mono"
              style={{
                color: "var(--action)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--signal)",
                }}
              />
              MECHANICAL VERSION FOLIO / REPOSITORY CHRONOLOGY
            </span>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: "var(--muted)",
              }}
            >
              Showing <strong>{filteredReleases.length}</strong> of {releases.length}{" "}
              recorded releases. SHA: <code style={{ color: "var(--ink)", fontWeight: 700 }}>{sourceCommitSha.slice(0, 10)}</code>
            </p>
          </div>

          {/* Quick Search */}
          <div style={{ position: "relative", minWidth: "260px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search release history & changes..."
              aria-label="Filter releases by keyword"
              style={{
                width: "100%",
                padding: "8px 14px",
                fontSize: "12px",
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: "4px",
                color: "var(--ink)",
                outline: "none",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  fontSize: "11px",
                  color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Caliper Tabs */}
        <div
          role="tablist"
          aria-label="Filter release categories"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {[
            { id: "all", label: `All Releases (${releases.length})` },
            { id: "v2", label: "v2.x Lineage (5)" },
            { id: "v1", label: "v1.x Foundations (31)" },
            { id: "preview", label: "Source Only / Preview" },
            { id: "published", label: "Umbrella Verified" },
            { id: "security", label: "Security & Redaction" },
          ].map((tab) => {
            const isTabActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isTabActive}
                onClick={() => setActiveFilter(tab.id as ReleaseFilterCategory)}
                style={{
                  position: "relative",
                  background: isTabActive ? "var(--ink)" : "var(--paper)",
                  color: isTabActive ? "#ffffff" : "var(--ink)",
                  border: isTabActive ? "1px solid var(--ink)" : "1px solid var(--line)",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Release Rail with Mechanical Caliper Spine */}
      <div
        className="release-rail"
        id="releases"
        data-active-release={selectedId}
        style={{
          position: "relative",
          paddingLeft: "clamp(24px, 4vw, 44px)",
        }}
      >
        {/* Continuous mechanical caliper spine ruler */}
        <div
          aria-hidden="true"
          className="mechanical-caliper-spine"
          style={{
            position: "absolute",
            left: "12px",
            top: 0,
            bottom: 0,
            width: "12px",
            borderRight: "1px solid var(--line)",
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Caliper tick lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(to bottom, var(--line) 1px, transparent 1px)",
              backgroundSize: "100% 24px",
              opacity: 0.6,
            }}
          />
        </div>

        {filteredReleases.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              background: "var(--paper2)",
              border: "1px dashed var(--line)",
              borderRadius: "6px",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            No releases match your current search and filter criteria.{" "}
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--action)",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
                fontSize: "13px",
              }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredReleases.map((release, index) => {
            const isOpen = Boolean(openIds[release.id]);
            const isSelected = selectedId === release.id;
            const statusClassName =
              release.statusVariant === "source"
                ? "status source"
                : release.statusVariant === "published"
                  ? "status published"
                  : "status";

            return (
              <motion.article
                key={release.version}
                layout="position"
                transition={
                  prefersReducedMotion ? INSTANT_TRANSITION : STRUCTURE_TRANSITION
                }
                className="release-row"
                data-release-id={release.id}
                data-selected={isSelected ? "true" : "false"}
                data-expanded={isOpen ? "true" : "false"}
                onClick={(e) => {
                  if (
                    !(e.target as HTMLElement).closest("a") &&
                    !(e.target as HTMLElement).closest("button")
                  ) {
                    setSelectedId(release.id);
                  }
                }}
                style={{
                  position: "relative",
                  transition: "background 0.22s ease",
                  backgroundColor:
                    isOpen || isSelected
                      ? "rgba(255, 253, 247, 0.72)"
                      : undefined,
                  borderRadius: "6px",
                  padding: "24px 20px 24px 16px",
                  marginBottom: "8px",
                }}
              >
                {/* Mechanical Caliper Indicator Needle */}
                {isSelected ? (
                  <motion.span
                    layoutId="mechanical-spine-coordinate"
                    aria-hidden="true"
                    data-testid="release-spine-marker"
                    transition={
                      prefersReducedMotion ? INSTANT_TRANSITION : SPRING_PHYSICAL
                    }
                    style={{
                      position: "absolute",
                      left: "clamp(-36px, -4vw, -56px)",
                      top: "32px",
                      width: "18px",
                      height: "8px",
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: "none",
                      zIndex: 3,
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "2px",
                        background: "var(--signal)",
                      }}
                    />
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "var(--signal)",
                        boxShadow: "0 0 0 3px rgba(242, 94, 59, 0.2)",
                      }}
                    />
                  </motion.span>
                ) : null}

                <div className="release-version" dir="ltr">
                  {release.displayVersion}
                  {release.versionSublabel ? (
                    <span
                      className="tiny"
                      style={{
                        display: "block",
                        fontSize: "9px",
                        letterSpacing: 0,
                        color:
                          release.statusVariant === "source"
                            ? "var(--action)"
                            : "var(--muted)",
                      }}
                    >
                      {release.versionSublabel}
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>
                    {release.headline}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>
                    {release.summary}
                  </p>

                  {/* Expandable Release Detail Panel */}
                  <div
                    className={isOpen ? "release-detail open" : "release-detail"}
                    id={release.id}
                  >
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={
                            prefersReducedMotion
                              ? false
                              : { opacity: 0, height: 0, y: -6 }
                          }
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={
                            prefersReducedMotion
                              ? { opacity: 0 }
                              : { opacity: 0, height: 0, y: -6 }
                          }
                          transition={
                            prefersReducedMotion
                              ? INSTANT_TRANSITION
                              : STRUCTURE_TRANSITION
                          }
                          style={{ overflow: "hidden" }}
                        >
                          {/* Provenance Banner */}
                          <div
                            style={{
                              background: "var(--paper2)",
                              border: "1px solid var(--line)",
                              borderRadius: "4px",
                              padding: "12px 16px",
                              marginBottom: "16px",
                            }}
                          >
                            <p
                              style={{
                                margin: "0 0 8px",
                                color: "var(--ink)",
                                fontWeight: 700,
                                fontSize: "12px",
                                lineHeight: 1.5,
                              }}
                            >
                              {release.provenanceNote}
                            </p>

                            <div
                              className="mono"
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "14px",
                                fontSize: "10px",
                                color: "var(--muted)",
                              }}
                            >
                              <span dir="ltr">RECORD: {release.rawHeader}</span>
                              <span>STATUS: {release.statusLabel}</span>
                              <span dir="ltr">SHA: {sourceCommitSha.slice(0, 10)}</span>
                              <a
                                href={release.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "var(--action)",
                                  textDecoration: "underline",
                                  textUnderlineOffset: "3px",
                                }}
                              >
                                CHANGELOG.md source ↗
                              </a>
                              {release.nugetUrl ? (
                                <a
                                  href={release.nugetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "var(--action)",
                                    textDecoration: "underline",
                                    textUnderlineOffset: "3px",
                                  }}
                                >
                                  NuGet package check ↗
                                </a>
                              ) : null}
                            </div>
                          </div>

                          {/* Categorized Changes */}
                          {release.sections.map((section) => {
                            const isBreaking =
                              section.title.toLowerCase().includes("breaking");
                            const isSecurity =
                              section.title.toLowerCase().includes("security");
                            const isAdded =
                              section.title.toLowerCase().includes("added");
                            const isFixed =
                              section.title.toLowerCase().includes("fixed");

                            return (
                              <div
                                key={`${release.version}-${section.title}`}
                                style={{ marginTop: "14px" }}
                              >
                                <strong
                                  className="tiny mono"
                                  style={{
                                    display: "inline-block",
                                    padding: "2px 6px",
                                    borderRadius: "3px",
                                    background: isBreaking
                                      ? "rgba(183, 57, 33, 0.12)"
                                      : isSecurity
                                        ? "rgba(242, 94, 59, 0.12)"
                                        : isAdded
                                          ? "rgba(10, 52, 43, 0.08)"
                                          : isFixed
                                            ? "rgba(47, 91, 78, 0.08)"
                                            : "rgba(8, 44, 38, 0.05)",
                                    color: isBreaking
                                      ? "var(--action)"
                                      : isSecurity
                                        ? "var(--signal)"
                                        : "var(--ink)",
                                    marginBottom: "6px",
                                    fontSize: "10px",
                                  }}
                                >
                                  {section.title} ({section.items.length})
                                </strong>
                                <ul
                                  style={{
                                    margin: "4px 0 10px",
                                    paddingInlineStart: "20px",
                                    fontSize: "13px",
                                    lineHeight: 1.6,
                                    color: "var(--ink)",
                                  }}
                                >
                                  {section.items.map((item, idx) => (
                                    <li
                                      key={`${release.version}-${section.title}-${idx}`}
                                      style={{ marginBottom: "4px" }}
                                    >
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button
                  ref={(el) => {
                    toggleRefs.current[index] = el;
                  }}
                  type="button"
                  aria-controls={release.id}
                  aria-expanded={isOpen}
                  className="release-toggle"
                  onFocus={() => setSelectedId(release.id)}
                  onKeyDown={(e) => handleToggleKeyDown(e, index)}
                  onClick={() => toggleRelease(release.id)}
                  style={{ cursor: "pointer" }}
                >
                  <span className={statusClassName}>{release.statusLabel}</span>
                  <br />
                  <br />
                  {isOpen ? "Close details ↙" : "Read details ↗"}
                </button>
              </motion.article>
            );
          })
        )}
      </div>
    </LayoutGroup>
  );
}

export default VersionFolio;
