import React from "react";
import type { Metadata } from "next";
import { getChangelogData } from "@/lib/changelog-loader";
import {
  VersionFolio,
  ReleaseFolioEntry,
} from "@/components/changelog/VersionFolio";

export const metadata: Metadata = {
  title: "Changelog — AstraFlow Visual Exploration",
  description:
    "Explore the AstraFlow version history and understand the difference between source milestones and published packages. Interactive design prototype.",
};

const PINNED_COMMIT_SHA = "b163535864199bfb05cef62807d89509ac2239f8";

export default function ChangelogPage() {
  const { releases } = getChangelogData();

  const folioEntries: ReleaseFolioEntry[] = releases.map((rel, idx) => {
    const is24 = rel.version.startsWith("2.4");
    const is23 = rel.version.startsWith("2.3");
    const is22 = rel.version.startsWith("2.2");
    const is21 = rel.version.startsWith("2.1");

    let statusVariant: "source" | "published" | "neutral" = "neutral";
    let statusLabel = "Historical";
    let versionSublabel: string | undefined = undefined;
    let headline = rel.summary || `AstraFlow ${rel.version} changes`;
    let provenanceNote = "Verified against repository CHANGELOG.md.";

    if (is24) {
      statusVariant = "source";
      statusLabel = "Unpublished";
      versionSublabel = "WORK IN PROGRESS";
      headline = "Work under development.";
      provenanceNote =
        "Future work must never be presented as a NuGet release. Use repository and NuGet evidence before displaying individual planned capabilities.";
    } else if (is23) {
      statusVariant = "source";
      statusLabel = "Verify per package";
      headline = "Source milestone, qualified status.";
      provenanceNote =
        "API governance, CLI graph work and generated mapping extensions in source; exact package publication requires verification. Treat source change, GitHub Release and installability as separate states.";
    } else if (is22) {
      statusVariant = "published";
      statusLabel = "Umbrella verified in supplied evidence";
      headline = "Reproducibility and release discipline.";
      provenanceNote =
        "The supplied project guide reports top-level AstraFlow 2.2.0 on NuGet; separate package IDs require their own check. Never infer NuGet availability of every satellite package from the umbrella package listing.";
    } else if (is21) {
      statusVariant = "source";
      statusLabel = "GitHub Release; NuGet unverified";
      headline = "Compile-time generated mapping foundation.";
      provenanceNote =
        "Roslyn source generator introduced in source with GitHub Release; individual NuGet publication status requires independent verification.";
    } else if (idx < 5) {
      statusVariant = "published";
      statusLabel = "Published milestone";
    }

    return {
      id: `r${rel.version.replace(/[^a-zA-Z0-9]/g, "")}`,
      version: rel.version,
      displayVersion: rel.version.replace(/-.*/, "").replace(/\.0$/, ""),
      versionSublabel,
      rawHeader: rel.rawHeader,
      dateQualification: rel.dateNotice || "Undated source milestone",
      headline,
      summary:
        rel.summary ||
        rel.sections[0]?.items[0] ||
        "Detailed release changes documented in repository source.",
      statusVariant,
      statusLabel,
      provenanceNote,
      sourceUrl: `https://github.com/seifmoustafa/AstraFlow/blob/${PINNED_COMMIT_SHA}/CHANGELOG.md`,
      nugetUrl: "https://www.nuget.org/packages/AstraFlow",
      sections: rel.sections.map((s) => ({
        title: s.title,
        items: s.items,
      })),
    };
  });

  return (
    <>
      <section className="hero">
        <div className="site-wrap page-intro grid">
          <div>
            <p className="eyebrow">THE RECORD / NOT THE HYPE</p>
            <h1>
              Every version.
              <span className="ital">An honest story.</span>
            </h1>
            <p className="lead">
              An editorial changelog for the entire history—not a release
              marketing poster. Publication, repository milestones and work in
              progress must have separate labels.
            </p>
            <a className="button button-outline" href="#releases">
              Explore the chronology
              <span aria-hidden="true" className="arrow">
                ↗
              </span>
            </a>
          </div>
          <div className="release-art">
            <div className="geo-grid"></div>
            <div className="sheet">
              <small>EARLIER SOURCE</small>
              <big>2.2</big>
            </div>
            <div className="sheet">
              <small>SOURCE MILESTONE · VERIFY PUBLICATION</small>
              <big>2.3</big>
            </div>
            <div className="sheet">
              <small>IN PROGRESS / NOT PUBLISHED</small>
              <big>2.4</big>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-panel" id="releases">
        <div className="site-wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">A LIVING HISTORY / DEMONSTRATION</p>
              <h2>
                Progress, with
                <br />
                <span className="ital signal">provenance.</span>
              </h2>
            </div>
            <p className="section-caption">
              The production view must ingest all CHANGELOG.md entries. These
              are illustrative rows only, not a complete release catalog.
            </p>
          </div>

          <VersionFolio
            releases={folioEntries}
            sourceCommitSha={PINNED_COMMIT_SHA}
          />

          <p className="bottom-note" style={{ marginTop: "26px" }}>
            Prototype chronology. Full source: repository CHANGELOG.md; published
            status: per NuGet package ID.
          </p>
        </div>
      </section>
    </>
  );
}
