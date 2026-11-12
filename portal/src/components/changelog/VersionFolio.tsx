"use client";

import React, { useEffect, useState } from "react";

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

export function VersionFolio({
  releases,
  sourceCommitSha,
}: VersionFolioProps) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.body.dataset.page = "changelog";
  }, []);

  const toggleRelease = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="release-rail">
      {releases.map((release) => {
        const isOpen = Boolean(openIds[release.id]);
        const statusClassName =
          release.statusVariant === "source"
            ? "status source"
            : release.statusVariant === "published"
              ? "status published"
              : "status";

        return (
          <article key={release.version} className="release-row">
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
              </div>
            </div>

            <button
              type="button"
              aria-controls={release.id}
              aria-expanded={isOpen}
              className="release-toggle"
              onClick={() => toggleRelease(release.id)}
            >
              <span className={statusClassName}>{release.statusLabel}</span>
              <br />
              <br />
              Read details ↗
            </button>
          </article>
        );
      })}
    </div>
  );
}

export default VersionFolio;
