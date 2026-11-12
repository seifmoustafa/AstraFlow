"use client";

import React, { useState } from "react";
import Link from "next/link";

interface TopicTile {
  title: string;
  subtitle: string;
  href: string;
  term: string;
}

const DEFAULT_TOPICS: TopicTile[] = [
  {
    title: "Getting started",
    subtitle: "Build your first request",
    href: "/docs/getting-started",
    term: "getting started quickstart install setup",
  },
  {
    title: "Mediator",
    subtitle: "Dispatch and pipelines",
    href: "/docs/mediator",
    term: "mediator dispatch pipeline sender handler request notification stream",
  },
  {
    title: "Mapping",
    subtitle: "Rules and projections",
    href: "/docs/mapper",
    term: "mapping mapper projection conventions generated rules compile time",
  },
  {
    title: "Diagnostics",
    subtitle: "Inspect what is knowable",
    href: "/docs/diagnostics",
    term: "diagnostics telemetry inspect reports analyzers cligraph activity",
  },
  {
    title: "Generators",
    subtitle: "Opt-in build-time code",
    href: "/docs/generators",
    term: "generators roslyn source generated mapping registration",
  },
  {
    title: "Testing",
    subtitle: "Harnesses and assertions",
    href: "/docs/testing",
    term: "testing harnesses assertions test doubles fakes unit test",
  },
];

export function DocsSearch() {
  const [query, setQuery] = useState("");

  const q = query.toLowerCase().trim();
  const filtered = DEFAULT_TOPICS.filter((t) => {
    if (!q) return true;
    return (
      t.term.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.subtitle.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <p className="tiny">FIND THE RIGHT ANSWER / SOURCE-BASED</p>
      <input
        aria-label="Filter documentation topics"
        className="docs-search"
        id="docs-query"
        placeholder="Search the documentation ↗"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="docs-tiles" id="topics" style={{ marginTop: "36px" }}>
        {filtered.map((topic) => (
          <Link
            key={topic.title}
            className="docs-tile"
            data-term={topic.term}
            href={topic.href}
          >
            <span>
              <strong>{topic.title}</strong>
              <small>{topic.subtitle}</small>
            </span>
            <i>↗</i>
          </Link>
        ))}
      </div>
      <p
        className="muted"
        id="docs-empty"
        hidden={filtered.length > 0}
        style={{ marginTop: "18px" }}
      >
        No matching topics in this preview.
      </p>
    </div>
  );
}
