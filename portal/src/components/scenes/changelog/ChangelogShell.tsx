"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HeroStageEntrance,
  HeroTextReveal,
  MagneticButton,
  scrollToElementOrHash,
} from "@/components/motion";
import type { ChangelogRelease, ChangelogStats } from "@/lib/changelog";
import { GITHUB_LINKS, LATEST_PUBLISHED_DATE } from "@/lib/site-config";
import { ReleaseFolio, type ReleaseFilter } from "./ReleaseFolio";
import { VersionDeck } from "./VersionDeck";
import styles from "./ChangelogShell.module.css";

export interface ChangelogShellProps {
  releases: readonly ChangelogRelease[];
  stats: ChangelogStats;
}

export function ChangelogShell({ releases, stats }: ChangelogShellProps) {
  const [selectedAnchor, setSelectedAnchor] = useState(
    () => releases[0]?.anchorId ?? "",
  );
  const [filter, setFilter] = useState<ReleaseFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash.replace(/^#/, "");
      if (!rawHash || rawHash === "releases") {
        return;
      }
      const match = releases.find((release) => release.anchorId === rawHash);
      if (match) {
        setSelectedAnchor(match.anchorId);
        setFilter("all");
        setSearchQuery("");
        scrollToElementOrHash("releases");
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
      scrollToElementOrHash("releases");
    }
  };

  return (
    <main id="main" data-page="changelog">
      <section className={`hero ${styles.subhero}`}>
        <div className={`site-wrap ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">RELEASE NOTES / VERSION ARCHIVE</p>
            <HeroTextReveal as="h1" className={styles.heroHeading}>
              Every version.
              <span className={`ital signal ${styles.heroItal}`}>
                An honest story.
              </span>
            </HeroTextReveal>
            <p className={styles.heroLead}>
              Every AstraFlow milestone recorded in sequence — new package
              capabilities, generator performance improvements, and breaking
              changes across the suite.
            </p>
            <div className="links">
              <MagneticButton className="button button-primary" href="#releases">
                Explore release notes
                <span aria-hidden="true" className="arrow">
                  ↘
                </span>
              </MagneticButton>
              <MagneticButton
                className="button button-outline"
                href={GITHUB_LINKS.changelog}
                target="_blank"
                rel="noopener noreferrer"
              >
                View CHANGELOG.md
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </MagneticButton>
            </div>

            <div
              className={styles.provenanceStrip}
              aria-label="Release summary"
            >
              <span className={styles.provenanceItem}>
                <span className={styles.provenanceDotSignal} aria-hidden="true" />
                {stats.latestPublishedVersion} Published Suite
              </span>
              <span className={styles.provenanceItem}>
                <span className={styles.provenanceDotForest} aria-hidden="true" />
                Published {LATEST_PUBLISHED_DATE}
              </span>
              <span className={styles.provenanceItem}>
                {stats.totalReleases} Recorded Editions
              </span>
            </div>
          </div>

          <HeroStageEntrance>
            <VersionDeck
              releases={releases}
              stats={stats}
              onJumpToRelease={handleJumpToRelease}
            />
          </HeroStageEntrance>
        </div>
      </section>

      <section className={styles.releasesSection} id="releases">
        <div className={`site-wrap ${styles.sectionWrap}`}>
          <div className={styles.sectionHeader} data-reveal="up">
            <div className={styles.sectionTitleBlock}>
              <p className="eyebrow">01 / RELEASE HISTORY · CHANGELOG</p>
              <h2 className={styles.sectionHeading}>
                Progress, with <span className="ital signal">clarity.</span>
              </h2>
            </div>
            <p className={styles.sectionCaption}>
              All {stats.totalReleases} AstraFlow editions —{" "}
              {stats.latestCount} latest milestone, {stats.majorCount} major
              releases, {stats.featureCount} feature updates,{" "}
              {stats.historicalCount} archive releases
              {stats.deprecatedReleaseCount > 0
                ? `, ${stats.deprecatedReleaseCount} deprecated`
                : ""}
              , and {stats.breakingReleaseCount} with breaking changes.
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
            data-reveal="up"
            aria-label="Upgrade and compatibility guidance"
          >
            <div className={styles.noticeCopy}>
              <span className={styles.noticeEyebrow}>
                UPGRADE &amp; COMPATIBILITY
              </span>
              <p className={styles.noticeText}>
                Upgrading from AstraFlow 1.x or an earlier 2.x release? Check
                package alignment, target-framework compatibility, and step-by-step
                migration recipes before rolling out changes.
              </p>
            </div>
            <Link
              className={styles.noticeLink}
              href="/docs/migration-and-troubleshooting"
            >
              Read upgrade guide ↗
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
