"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export interface TopicTile {
  title: string;
  subtitle: string;
  href: string;
  term: string;
  isCore?: boolean;
}

const DEFAULT_TOPICS: TopicTile[] = [
  {
    title: "Getting started",
    subtitle: "Build your first request",
    href: "/docs/getting-started",
    term: "getting started quickstart install setup first request",
    isCore: true,
  },
  {
    title: "Mediator",
    subtitle: "Dispatch and pipelines",
    href: "/docs/mediator",
    term: "mediator dispatch pipeline sender handler request notification stream",
    isCore: true,
  },
  {
    title: "Mapping",
    subtitle: "Rules and projections",
    href: "/docs/mapper",
    term: "mapping mapper projection conventions generated rules compile time",
    isCore: true,
  },
  {
    title: "Diagnostics",
    subtitle: "Inspect what is knowable",
    href: "/docs/diagnostics",
    term: "diagnostics telemetry inspect reports analyzers cligraph activity",
    isCore: true,
  },
  {
    title: "Generators",
    subtitle: "Opt-in build-time code",
    href: "/docs/generators",
    term: "generators roslyn source generated mapping registration",
    isCore: true,
  },
  {
    title: "Testing",
    subtitle: "Harnesses and assertions",
    href: "/docs/testing",
    term: "testing harnesses assertions test doubles fakes unit test",
    isCore: true,
  },
];

const EXTENDED_REPOSITORY_TOPICS: TopicTile[] = [
  {
    title: "Architecture",
    subtitle: "Boundaries and contracts",
    href: "/docs/architecture",
    term: "architecture contracts boundaries design philosophy",
  },
  {
    title: "Package Selection",
    subtitle: "Choose the smallest footprint",
    href: "/docs/package-selection",
    term: "package selection matrix modules dependencies",
  },
  {
    title: "Projections & EF Core",
    subtitle: "Queryable expression trees",
    href: "/docs/projections",
    term: "projections queryable efcore entity framework database sql",
  },
  {
    title: "Analyzers (AFM & AFD)",
    subtitle: "Compile-time diagnostics",
    href: "/docs/analyzers",
    term: "analyzers afm afd roslyn warnings rules",
  },
  {
    title: "Security & Redaction",
    subtitle: "Safe telemetry defaults",
    href: "/docs/security",
    term: "security redaction secrets pii safety endpoint",
  },
  {
    title: "ASP.NET Core & Validation",
    subtitle: "Endpoints and FluentValidation",
    href: "/docs/aspnetcore",
    term: "aspnetcore minimal api endpoints fluentvalidation",
  },
  {
    title: "Assertions (2.4 WIP)",
    subtitle: "Unreleased source-only preview",
    href: "/docs/assertions",
    term: "assertions 2.4 preview unreleased runner neutral",
  },
  {
    title: "Migration Cookbook",
    subtitle: "From MediatR & AutoMapper",
    href: "/docs/migration-cookbook",
    term: "migration cookbook mediatr automapper upgrade guide",
  },
  {
    title: "ADRs & Strategy Ledger",
    subtitle: "Architectural decision records",
    href: "/docs/adr/0001-generated-mapper",
    term: "adr decisions strategy roadmap governance benchmarks",
  },
];

export function DocsSearch() {
  const [query, setQuery] = useState("");
  const [activeTileHref, setActiveTileHref] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tileRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const q = query.toLowerCase().trim();

  const filtered = React.useMemo(() => {
    if (!q) {
      return DEFAULT_TOPICS;
    }
    const pool = [...DEFAULT_TOPICS, ...EXTENDED_REPOSITORY_TOPICS];
    return pool.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q)
    );
  }, [q]);

  // Global "/" and Cmd/Ctrl+K keyboard shortcut to focus #docs-query
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      if (!isEditable && e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (query) {
        e.preventDefault();
        setQuery("");
        // Preserve focus inside #docs-query
        inputRef.current?.focus();
      } else {
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === "ArrowDown" && filtered.length > 0) {
      e.preventDefault();
      const firstTile = tileRefs.current[0];
      if (firstTile) {
        firstTile.focus();
        setActiveTileHref(filtered[0].href);
      }
    }
  };

  const handleTileKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = (index + 1) % filtered.length;
      tileRefs.current[nextIdx]?.focus();
      setActiveTileHref(filtered[nextIdx]?.href ?? null);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      if (index === 0) {
        inputRef.current?.focus();
        setActiveTileHref(null);
      } else {
        const prevIdx = index - 1;
        tileRefs.current[prevIdx]?.focus();
        setActiveTileHref(filtered[prevIdx]?.href ?? null);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      inputRef.current?.focus();
      setActiveTileHref(null);
    }
  };

  return (
    <div>
      <p className="tiny">FIND THE RIGHT ANSWER / SOURCE-BASED</p>
      <input
        ref={inputRef}
        aria-label="Filter documentation topics"
        aria-keyshortcuts="/ Control+K Meta+K"
        className="docs-search"
        id="docs-query"
        placeholder="Search the documentation ↗"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleInputKeyDown}
      />
      <div
        className="docs-tiles"
        id="topics"
        style={{ marginTop: "36px" }}
        onMouseLeave={() => setActiveTileHref(null)}
      >
        {filtered.map((topic, idx) => {
          const isHighlighted = activeTileHref === topic.href;
          return (
            <Link
              key={topic.href}
              ref={(el) => {
                tileRefs.current[idx] = el;
              }}
              className="docs-tile"
              data-term={topic.term}
              href={topic.href}
              onMouseEnter={() => setActiveTileHref(topic.href)}
              onFocus={() => setActiveTileHref(topic.href)}
              onBlur={() => setActiveTileHref((prev) => (prev === topic.href ? null : prev))}
              onKeyDown={(e) => handleTileKeyDown(e, idx)}
              style={{ position: "relative" }}
            >
              {isHighlighted ? (
                <motion.span
                  layoutId="docs-tile-focus-keyline"
                  aria-hidden="true"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34, mass: 0.7 }
                  }
                  style={{
                    position: "absolute",
                    insetInlineStart: 0,
                    insetInlineEnd: 0,
                    bottom: -1,
                    height: "2px",
                    background: "var(--signal)",
                    pointerEvents: "none",
                  }}
                />
              ) : null}
              <span>
                <strong>{topic.title}</strong>
                <small>{topic.subtitle}</small>
              </span>
              <i aria-hidden="true">↗</i>
            </Link>
          );
        })}
      </div>
      <p
        className="muted"
        id="docs-empty"
        role="status"
        aria-live="polite"
        hidden={filtered.length > 0}
        style={{ marginTop: "18px" }}
      >
        No matching topics in this preview.
      </p>
    </div>
  );
}
