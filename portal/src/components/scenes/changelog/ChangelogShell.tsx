"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotionSafe } from "@/components/hairline";
import type { ChangelogRelease, ChangelogStats } from "@/lib/changelog";
import { GITHUB_LINKS } from "@/lib/site-config";
import { ReleaseFolio, type ReleaseFilter } from "./ReleaseFolio";
import { VersionDeck } from "./VersionDeck";
import styles from "./ChangelogShell.module.css";

export interface ChangelogShellProps {
  releases: readonly ChangelogRelease[];
  stats: ChangelogStats;
}

export function ChangelogShell({ releases, stats }: ChangelogShellProps) {
  const reducedMotion = useReducedMotionSafe();
  const [selectedAnchor, setSelectedAnchor] = useState(
    () => releases[0]?.anchorId ?? "",
  );
  const [filter, setFilter] = useState<ReleaseFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash.replace(/^#/, "");
      if (!rawHash) {
        return;
      }
      const match = releases.find((release) => release.anchorId === rawHash);
      if (match) {
        setSelectedAnchor(match.anchorId);
        setFilter("all");
        setSearchQuery("");
      }
    };

    const frame = window.requestAnimationFrame(syncFromHash);
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [releases]);

  const handleSelectRelease = (anchorId: string) => {
    setSelectedAnchor(anchorId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${anchorId}`);
    }
  };

  const handleJumpToRelease = (anchorId: string) => {
    setFilter("all");
    setSearchQuery("");
    setSelectedAnchor(anchorId);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${anchorId}`);
      document.getElementById("releases")?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  return (
    <main id="main" data-page="changelog">
      <section className={`hero ${styles.subhero}`}>
        <div className={`site-wrap ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">THE RECORD / NOT THE HYPE</p>
            <h1 className={styles.heroHeading}>
              Every version.
              <span className={`ital signal ${styles.heroItal}`}>
                An honest story.
              </span>
            </h1>
            <p className={styles.heroLead}>
              Engineering decisions are recorded here. Source milestones, GitHub
              Releases, and NuGet package publication are separate states — not
              interchangeable labels.
            </p>
            <div className="links">
              <a className="button button-primary" href="#releases">
                Explore the chronology
                <span aria-hidden="true" className="arrow">
                  ↘
                </span>
              </a>
              <a
                className="button button-outline"
                href={GITHUB_LINKS.changelog}
                target="_blank"
                rel="noopener noreferrer"
              >
                View CHANGELOG.md
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
            </div>

            <div
              className={styles.provenanceStrip}
              aria-label="Release provenance summary"
            >
              <span className={styles.provenanceItem}>
                <span className={styles.provenanceDotSignal} aria-hidden="true" />
                {stats.latestUnreleasedVersion} Unreleased Source
              </span>
              <span className={styles.provenanceItem}>
                <span className={styles.provenanceDotForest} aria-hidden="true" />
                {stats.latestPublishedVersion} Latest NuGet (2026-11-10)
              </span>
              <span className={styles.provenanceItem}>
                {stats.totalReleases} Recorded Editions
              </span>
            </div>
          </div>

          <VersionDeck
            releases={releases}
            stats={stats}
            onJumpToRelease={handleJumpToRelease}
          />
        </div>
      </section>

      <section className={styles.releasesSection} id="releases">
        <div className={`site-wrap ${styles.sectionWrap}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleBlock}>
              <p className="eyebrow">01 / RELEASE HISTORY · SOURCE VERIFIED</p>
              <h2 className={styles.sectionHeading}>
                Progress, with <span className="ital signal">provenance.</span>
              </h2>
            </div>
            <p className={styles.sectionCaption}>
              All {stats.totalReleases} releases parsed directly from
              CHANGELOG.md — {stats.publishedCount} published or historical
              baseline entries, {stats.unreleasedCount} unreleased source
              milestone, {stats.githubUnverifiedCount} GitHub-only tag, and{" "}
              {stats.breakingReleaseCount} with breaking changes.
            </p>
          </div>

          <ReleaseFolio
            releases={releases}
            stats={stats}
            selectedAnchor={selectedAnchor}
            onSelectRelease={handleSelectRelease}
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

          <aside
            className={styles.releasesNotice}
            aria-label="Release accuracy and provenance policy"
          >
            <div className={styles.noticeCopy}>
              <span className={styles.noticeEyebrow}>PROVENANCE STANDARD</span>
              <p className={styles.noticeText}>
                NuGet publication ({stats.latestPublishedVersion} on
                2026-11-10), active unreleased source (
                {stats.latestUnreleasedVersion} in Directory.Build.props), and
                GitHub Release tags with unverified package parity (2.1.0)
                remain strictly separated across this record.
              </p>
            </div>
            <Link
              className={styles.noticeLink}
              href="/docs/version-upgrade-guide"
            >
              Read upgrade guide ↗
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
