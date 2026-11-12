import type { Metadata } from "next";
import Link from "next/link";
import { JourneyRail } from "@/components/guides/JourneyRail";

export const metadata: Metadata = {
  title: "Guides — AstraFlow",
  description:
    "Explore focused learning journeys for composing, testing, and inspecting .NET applications with AstraFlow.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    title: "Guides — AstraFlow",
    description:
      "Six practical journeys through the actual AstraFlow APIs, organized by the questions .NET developers need answered.",
    url: "/guides",
  },
};

interface PracticalPath {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  href: string;
}

const PRACTICAL_PATHS: readonly PracticalPath[] = [
  {
    id: "path-first-request",
    tag: "01 / FIRST REQUEST",
    title: "Send something.",
    subtitle: "From request contract to response.",
    href: "/docs/getting-started",
  },
  {
    id: "path-composition",
    tag: "02 / COMPOSITION",
    title: "Design a pipeline.",
    subtitle: "Keep behavior explicit.",
    href: "/docs/mediator",
  },
  {
    id: "path-data",
    tag: "03 / DATA",
    title: "Map with intent.",
    subtitle: "Declare, validate, project.",
    href: "/docs/mapper",
  },
  {
    id: "path-inspection",
    tag: "04 / INSPECTION",
    title: "Know your wiring.",
    subtitle: "Reports, diagnostics and tool output.",
    href: "/docs/diagnostics",
  },
  {
    id: "path-confidence",
    tag: "05 / CONFIDENCE",
    title: "Test the important parts.",
    subtitle: "Fakes, harnesses and assertions.",
    href: "/docs/testing",
  },
  {
    id: "path-migration",
    tag: "06 / MIGRATION",
    title: "Move without guessing.",
    subtitle: "Versioned migration guidance.",
    href: "/docs/migration-cookbook",
  },
];

export default function GuidesPage() {
  return (
    <div data-page="guides">
      <section className="hero">
        <div
          className="site-wrap"
          style={{
            paddingTop: "95px",
            paddingBottom: "42px",
            display: "grid",
            gridTemplateColumns: "1.2fr .7fr",
            alignItems: "end",
            gap: "40px",
          }}
        >
          <div>
            <p className="eyebrow">LEARNING SHOULD FEEL LIKE FORWARD MOTION</p>
            <h1
              style={{
                fontSize: "clamp(65px,7.5vw,119px)",
                margin: "32px 0 17px",
              }}
            >
              From curious
              <br />
              <span className="ital signal">to confident.</span>
            </h1>
          </div>
          <p
            className="lead"
            style={{ maxWidth: "340px", color: "var(--muted)" }}
          >
            Six practical journeys through the actual APIs, organized by the
            questions developers need answered.
          </p>
        </div>
        <div className="site-wrap">
          <JourneyRail />
        </div>
      </section>

      <section className="editorial-panel" id="practical-paths">
        <div className="site-wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">SIX PRACTICAL PATHS</p>
              <h2>
                Learn by
                <br />
                <span className="ital signal">doing.</span>
              </h2>
            </div>
            <p className="section-caption">
              Each path resolves to real source documentation, not a fabricated
              feature tour.
            </p>
          </div>
          <div className="card-list">
            {PRACTICAL_PATHS.map((path, index) => (
              <Link
                key={path.tag}
                id={path.id}
                data-path-index={index}
                className="line-card"
                href={path.href}
              >
                <span className="tiny signal">{path.tag}</span>
                <h3>{path.title}</h3>
                <small>{path.subtitle}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
