"use client";

import React, { useEffect, useRef, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";

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

const SPINE_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.7,
};

const STRUCTURE_TRANSITION = {
  duration: 0.26,
  ease: [0.22, 0.75, 0.19, 1] as const,
};

const INSTANT_TRANSITION = {
  duration: 0,
};

export function VersionFolio({
  releases,
  sourceCommitSha,
}: VersionFolioProps) {
  const { prefersReducedMotion } = useReducedMotionContext();
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string>(
    releases[0]?.id ?? "r240",
  );
  const toggleRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    document.body.dataset.page = "changelog";
  }, []);

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

    const total = releases.length;
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

    const nextRelease = releases[nextIndex];
    if (nextRelease) {
      setSelectedId(nextRelease.id);
      toggleRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <LayoutGroup id="changelog-release-spine">
      <div
        className="release-rail"
        data-active-release={selectedId}
        style={{ position: "relative" }}
      >
        {/* Continuous editorial vertical hairline spine */}
        <span
          aria-hidden="true"
          className="release-spine-hairline"
          style={{
            position: "absolute",
            insetBlock: 0,
            insetInlineStart: "-14px",
            width: "1px",
            background:
              "linear-gradient(180deg, rgba(8, 44, 38, 0.22), rgba(8, 44, 38, 0.12) 85%, transparent)",
            pointerEvents: "none",
          }}
        />

        {releases.map((release, index) => {
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
                // Allow clicking anywhere on the row header area to move the spine marker
                if (
                  !(e.target as HTMLElement).closest("a") &&
                  !(e.target as HTMLElement).closest("button")
                ) {
                  setSelectedId(release.id);
                }
              }}
              style={{
                backgroundColor:
                  isOpen || isSelected
                    ? "rgba(255, 253, 247, 0.52)"
                    : undefined,
              }}
            >
              {/* Shared active marker attached to the actual selected/expanded release */}
              {isSelected ? (
                <motion.span
                  layoutId="changelog-release-spine-marker"
                  aria-hidden="true"
                  className="release-spine-marker"
                  data-testid="release-spine-marker"
                  transition={
                    prefersReducedMotion ? INSTANT_TRANSITION : SPINE_SPRING
                  }
                  style={{
                    position: "absolute",
                    insetBlock: "14px",
                    insetInlineStart: "-15px",
                    width: "3px",
                    borderRadius: "2px",
                    background: "var(--signal)",
                    boxShadow: "0 0 12px rgba(242, 94, 59, 0.28)",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      insetBlockStart: "22px",
                      insetInlineStart: "-2px",
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "var(--signal)",
                      boxShadow: "0 0 0 4px rgba(242, 94, 59, 0.14)",
                    }}
                  />
                </motion.span>
              ) : null}

              <div className="release-version" dir="ltr">
                {release.displayVersion}
                {release.versionSublabel ? (
                  <>
                    {" "}
                    <span
                      className="tiny"
                      style={{
                        display: "block",
                        fontSize: "9px",
                        letterSpacing: 0,
                      }}
                    >
                      {release.versionSublabel}
                    </span>
                  </>
                ) : null}
              </div>

              <div>
                <h3>{release.headline}</h3>
                <p>{release.summary}</p>
                <div
                  className={isOpen ? "release-detail open" : "release-detail"}
                  id={release.id}
                >
                  <motion.div
                    initial={false}
                    animate={
                      isOpen
                        ? { opacity: 1, y: 0 }
                        : { opacity: prefersReducedMotion ? 1 : 0, y: -4 }
                    }
                    transition={
                      prefersReducedMotion
                        ? INSTANT_TRANSITION
                        : STRUCTURE_TRANSITION
                    }
                    style={{ transformOrigin: "top" }}
                  >
                    <p
                      style={{
                        margin: "0 0 12px",
                        color: "var(--ink)",
                        fontWeight: 700,
                        fontSize: "13px",
                      }}
                    >
                      {release.provenanceNote}
                    </p>

                    <div
                      className="mono"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        fontSize: "10px",
                        color: "var(--muted)",
                        marginBottom: "12px",
                        paddingBottom: "10px",
                        borderBottom: "1px solid var(--line)",
                      }}
                    >
                      <span dir="ltr">RECORD: {release.rawHeader}</span>
                      <span>DATE: {release.dateQualification}</span>
                      <span dir="ltr">SHA: {sourceCommitSha.slice(0, 12)}</span>
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

                    {release.sections.map((section) => (
                      <div
                        key={`${release.version}-${section.title}`}
                        style={{ marginTop: "10px" }}
                      >
                        <strong
                          className="tiny"
                          style={{
                            display: "block",
                            color: "var(--action)",
                            marginBottom: "4px",
                          }}
                        >
                          {section.title}
                        </strong>
                        <ul
                          style={{
                            margin: "0 0 8px",
                            paddingInlineStart: "18px",
                            fontSize: "13px",
                            lineHeight: 1.55,
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
                    ))}
                  </motion.div>
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
              >
                <span className={statusClassName}>{release.statusLabel}</span>
                <br />
                <br />
                Read details ↗
              </button>
            </motion.article>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export default VersionFolio;
