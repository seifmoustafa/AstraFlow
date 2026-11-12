"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotionContext } from "@/components/motion/ReducedMotionProvider";
import { PINNED_COMMIT_SHA } from "@/components/changelog/VersionFolio";

export interface LandmarkRelease {
  version: string;
  epochLabel: string;
  statusVariant: "source" | "published" | "neutral";
  statusBadge: string;
  headline: string;
  description: string;
  highlights: string[];
  sourceSha: string;
  targetId: string;
}

const LANDMARK_RELEASES: readonly LandmarkRelease[] = [
  {
    version: "2.4.0",
    epochLabel: "01 / CURRENT WORK IN PROGRESS",
    statusVariant: "source",
    statusBadge: "Unpublished · Active Dev",
    headline: "Clean-room Assertions & Expanded Generated Mapping",
    description:
      "First clean-room AstraFlow.Assertions package foundation (value, string, sequence, sync/async exception assertions with zero package dependencies) and expanded compile-time generated mapping for inherited properties, records, and init-only DTOs.",
    highlights: [
      "AstraFlow.Assertions: Runner-neutral test assertions with no third-party dependencies",
      "Safe generated mapping for Guid/date scalars and nullable value flows",
      "Sensitive-value redaction preserved in assertion diagnostics by default",
    ],
    sourceSha: PINNED_COMMIT_SHA,
    targetId: "r24",
  },
  {
    version: "2.3.0",
    epochLabel: "02 / SOURCE MILESTONE",
    statusVariant: "source",
    statusBadge: "Source Milestone · Verify per package",
    headline: "Target API Baselines, Relational CLI Graphs & Collection Mapping",
    description:
      "Target-specific public API baselines, XML documentation drift gates, relational request/handler/response Mermaid graphs in AstraFlow.Cli, direct collection projections, and [AstraValueConverter] scalar methods.",
    highlights: [
      "Version-controlled public API baselines and baseline drift detection",
      "Relational Mermaid graphs and Canvas JSON export in AstraFlow.Cli",
      "Explicit polymorphic collection mapping with declared subtype dispatch",
    ],
    sourceSha: PINNED_COMMIT_SHA,
    targetId: "r23",
  },
  {
    version: "2.2.0",
    epochLabel: "03 / PUBLISHED BASELINE",
    statusVariant: "published",
    statusBadge: "Umbrella Verified on NuGet",
    headline: "Reproducible Builds, Sigstore Signing & Provenance",
    description:
      "Release artifact integrity with repeat package hashes, SourceLink metadata verification, SPDX SBOMs, keyless Sigstore/gitsign signed tags, and NuGet repository signature verification.",
    highlights: [
      "Sigstore/gitsign identity-checked keyless signed tags",
      "SPDX SBOM and GitHub OIDC provenance for release packages",
      "Umbrella AstraFlow 2.2.0 verified in supplied NuGet evidence",
    ],
    sourceSha: PINNED_COMMIT_SHA,
    targetId: "r22",
  },
  {
    version: "2.0.0",
    epochLabel: "04 / ARCHITECTURAL LEAP",
    statusVariant: "neutral",
    statusBadge: "Source Milestone · Verify per package",
    headline: "Shared Security Governance & Redaction Primitives",
    description:
      "Introduced AstraFlow.Security with a shared sensitive-name taxonomy (passwords, tokens, keys, credentials, connection strings) unified across AstraFlow.OpenTelemetry and convention mapping.",
    highlights: [
      "AstraFlow.Security shared sensitive-name classification",
      "Deterministic value redaction policy primitives across packages",
      "Zero payload leakage in telemetry traces and diagnostics reports",
    ],
    sourceSha: PINNED_COMMIT_SHA,
    targetId: "r200",
  },
  {
    version: "1.13.0",
    epochLabel: "05 / CONFIDENCE GATE",
    statusVariant: "published",
    statusBadge: "Prior Baseline · Verify per package",
    headline: "Automated API Compatibility & Previous-Version Upgrade Smoke",
    description:
      "Automated scripts comparing public XML doc member IDs against prior releases and clean-consumer upgrade smoke tests compiled in CI before publication.",
    highlights: [
      "scripts/verify-api-compatibility.ps1 member-ID checks in CI",
      "scripts/verify-upgrade-smoke.ps1 clean consumer upgrade checks",
      "Formal version and upgrade migration cookbook guidance",
    ],
    sourceSha: PINNED_COMMIT_SHA,
    targetId: "r1130",
  },
];

const SHEET_SPRING = {
  type: "spring" as const,
  stiffness: 340,
  damping: 30,
  mass: 0.75,
};

export function ChangelogFolioHero() {
  const { prefersReducedMotion } = useReducedMotionContext();
  const [activeVersion, setActiveVersion] = useState<string>("2.4.0");

  const current =
    LANDMARK_RELEASES.find((r) => r.version === activeVersion) ??
    LANDMARK_RELEASES[0];

  const scrollToRelease = (targetId: string) => {
    const el = document.getElementById(targetId) || document.getElementById("releases");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      const toggle = el.querySelector<HTMLButtonElement>("button.release-toggle");
      if (toggle && toggle.getAttribute("aria-expanded") !== "true") {
        toggle.click();
      }
    }
  };

  return (
    <section className="hero">
      <div
        className="site-wrap"
        style={{
          paddingTop: "90px",
          paddingBottom: "60px",
        }}
      >
        {/* Editorial Headline & Mechanical Subtitle */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 1.15fr) minmax(320px, 0.85fr)",
            gap: "clamp(30px, 4vw, 64px)",
            alignItems: "end",
            marginBottom: "48px",
          }}
        >
          <div>
            <p className="eyebrow" style={{ color: "var(--action)", marginBottom: "14px" }}>
              THE RECORD / NOT THE HYPE
            </p>
            <h1
              style={{
                fontSize: "clamp(54px, 7vw, 108px)",
                lineHeight: 0.95,
                margin: "0 0 20px",
                letterSpacing: "-0.065em",
              }}
            >
              Every version.
              <br />
              <span className="ital signal">An honest story.</span>
            </h1>
            <p
              className="lead"
              style={{
                fontSize: "17px",
                lineHeight: 1.65,
                color: "var(--ink2)",
                maxWidth: "520px",
                margin: 0,
              }}
            >
              An engineered mechanical folio tracking the complete 36-release lineage
              from root <code className="mono" style={{ color: "var(--action)", fontWeight: 700 }}>CHANGELOG.md</code>.
              Source milestones, verified NuGet packages, and active work in progress
              maintain strictly separate statuses.
            </p>
          </div>

          {/* Provenance HUD Box */}
          <div
            style={{
              background: "var(--paper2)",
              border: "1px solid var(--line)",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(8, 44, 38, 0.06)",
            }}
          >
            <span
              className="tiny mono"
              style={{
                display: "block",
                color: "var(--muted)",
                letterSpacing: "0.12em",
                marginBottom: "12px",
              }}
            >
              AUDIT PROVENANCE / COMMIT METADATA
            </span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                borderBottom: "1px solid var(--line)",
                paddingBottom: "14px",
                marginBottom: "14px",
              }}
            >
              <div>
                <small className="tiny" style={{ color: "var(--muted)", display: "block" }}>
                  PINNED COMMIT SHA
                </small>
                <code
                  className="mono"
                  style={{ fontSize: "12px", color: "var(--action)", fontWeight: 700 }}
                  dir="ltr"
                >
                  {PINNED_COMMIT_SHA.slice(0, 12)}
                </code>
              </div>
              <div>
                <small className="tiny" style={{ color: "var(--muted)", display: "block" }}>
                  CANONICAL REPOSITORY
                </small>
                <span className="mono" style={{ fontSize: "11px", fontWeight: 700 }} dir="ltr">
                  seifmoustafa/AstraFlow
                </span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="tiny" style={{ color: "var(--muted)" }}>
                36 Releases Recorded
              </span>
              <a
                className="button button-outline"
                href="#releases"
                style={{
                  minHeight: "36px",
                  padding: "8px 16px",
                  fontSize: "12px",
                }}
              >
                Inspect Chronology <span className="arrow" aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>

        {/* Spatial Bound Folio Desk (`astraflow-version-spine`) */}
        <div
          className="mechanical-folio-stage"
          style={{
            position: "relative",
            background: "var(--forest0)",
            color: "var(--paper)",
            borderRadius: "10px",
            border: "1px solid rgba(235, 248, 231, 0.2)",
            boxShadow: "0 32px 70px rgba(0, 15, 11, 0.24)",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "minmax(240px, 320px) 1fr",
          }}
        >
          {/* Folio Mechanical Spine Tabs (Left) */}
          <div
            role="tablist"
            aria-label="Mechanical version folio sheets"
            style={{
              background: "#082c26",
              borderRight: "1px solid rgba(235, 248, 231, 0.16)",
              padding: "24px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <span
              className="tiny mono"
              style={{
                color: "#a8c6b7",
                letterSpacing: "0.14em",
                marginBottom: "8px",
                display: "block",
              }}
            >
              BINDER SPINES / PULL SHEET
            </span>

            {LANDMARK_RELEASES.map((rel) => {
              const isSelected = rel.version === activeVersion;
              return (
                <button
                  key={rel.version}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveVersion(rel.version)}
                  style={{
                    position: "relative",
                    textAlign: "left",
                    padding: "12px 14px",
                    borderRadius: "6px",
                    border: isSelected
                      ? "1px solid var(--signal)"
                      : "1px solid rgba(235, 248, 231, 0.12)",
                    background: isSelected ? "var(--forest)" : "rgba(3, 31, 26, 0.6)",
                    color: isSelected ? "#ffffff" : "#c2d8c9",
                    cursor: "pointer",
                    transition: "background 0.2s, border-color 0.2s, transform 0.2s",
                    transform: isSelected ? "translateX(6px)" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: "16px",
                        fontWeight: 800,
                        color: isSelected ? "var(--signal)" : "#ffffff",
                      }}
                      dir="ltr"
                    >
                      v{rel.version}
                    </span>
                    <span
                      className="tiny"
                      style={{
                        fontSize: "9px",
                        padding: "2px 5px",
                        borderRadius: "2px",
                        background:
                          rel.statusVariant === "source"
                            ? "rgba(242, 94, 59, 0.2)"
                            : "rgba(137, 203, 164, 0.2)",
                        color:
                          rel.statusVariant === "source" ? "var(--peach)" : "#a2dfbe",
                      }}
                    >
                      {rel.version === "2.4.0" ? "WIP" : rel.statusVariant.toUpperCase()}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      display: "block",
                      color: isSelected ? "#ddf1dc" : "rgba(194, 216, 201, 0.7)",
                      lineHeight: 1.35,
                    }}
                  >
                    {rel.headline}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Sheet Surface (Right) */}
          <div
            style={{
              padding: "clamp(24px, 4vw, 40px)",
              background: "radial-gradient(ellipse at 80% 20%, rgba(33, 93, 72, 0.18), transparent 70%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.version}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={prefersReducedMotion ? { duration: 0 } : SHEET_SPRING}
              >
                {/* Sheet Metadata Topbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.16)",
                    paddingBottom: "14px",
                    marginBottom: "24px",
                  }}
                >
                  <span className="tiny mono" style={{ color: "var(--peach)" }}>
                    {current.epochLabel}
                  </span>
                  <span
                    className="tiny mono"
                    style={{
                      padding: "4px 8px",
                      borderRadius: "3px",
                      background:
                        current.statusVariant === "source"
                          ? "rgba(242, 94, 59, 0.25)"
                          : "rgba(137, 203, 164, 0.25)",
                      color: current.statusVariant === "source" ? "#ffc4aa" : "#a2dfbe",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {current.statusBadge}
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: "clamp(28px, 3.5vw, 44px)",
                    lineHeight: 1.05,
                    margin: "0 0 16px",
                    color: "#ffffff",
                    letterSpacing: "-0.05em",
                  }}
                >
                  {current.headline}
                </h2>

                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.7,
                    color: "#c5ddd0",
                    margin: "0 0 24px",
                    maxWidth: "680px",
                  }}
                >
                  {current.description}
                </p>

                {/* Key Architectural Highlights */}
                <div style={{ marginBottom: "32px" }}>
                  <span
                    className="tiny mono"
                    style={{
                      display: "block",
                      color: "var(--signal)",
                      marginBottom: "10px",
                      letterSpacing: "0.12em",
                    }}
                  >
                    ARCHITECTURAL CAPABILITIES & GATES
                  </span>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "20px",
                      color: "#e2f2e7",
                      fontSize: "13px",
                      lineHeight: 1.7,
                    }}
                  >
                    {current.highlights.map((h, i) => (
                      <li key={i} style={{ marginBottom: "4px" }}>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Actions: Jump to chronological spine & GitHub SHA */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "16px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255, 255, 255, 0.14)",
              }}
            >
              <button
                type="button"
                className="button button-primary"
                onClick={() => scrollToRelease(current.targetId)}
                style={{
                  minHeight: "42px",
                  padding: "10px 20px",
                  fontSize: "13px",
                }}
              >
                Inspect full v{current.version} entry <span className="arrow">↓</span>
              </button>

              <a
                href={`https://github.com/seifmoustafa/AstraFlow/blob/${PINNED_COMMIT_SHA}/CHANGELOG.md`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#aad1c0",
                  fontSize: "12px",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                View raw CHANGELOG.md on GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChangelogFolioHero;
