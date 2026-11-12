import type { Metadata } from "next";
import Link from "next/link";
import { getLearningMilestones } from "@/lib/guides";
import { UNRELEASED_SOURCE_VERSION } from "@/lib/site-config";
import { GuidesKineticRunway } from "@/components/scenes/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Follow six practical learning milestones from dependency-free contracts and mediator pipelines to EF Core projections, analyzers, diagnostics, and 2.4.0 assertions.",
  alternates: {
    canonical: "/guides",
  },
};

export default function GuidesPage() {
  const milestones = getLearningMilestones();

  return (
    <main id="main" data-page="guides">
      <section className="hero">
        <div className="site-wrap guides-hero-grid">
          <div>
            <p className="eyebrow">LEARNING SHOULD FEEL LIKE FORWARD MOTION</p>
            <h1>
              From curious
              <br />
              <span className="ital signal">to confident.</span>
            </h1>
          </div>
          <p className="lead" style={{ maxWidth: 340, color: "var(--muted)" }}>
            Four progression stages and six runnable .NET milestones — from
            dependency-free contracts to Roslyn analyzers and testing harnesses.
          </p>
        </div>

        <GuidesKineticRunway milestones={milestones} />
      </section>

      <section className="editorial-panel">
        <div className="site-wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">SIX PRACTICAL PATHS</p>
              <h2>Learn by doing.</h2>
            </div>
            <p className="section-caption">
              Inspect each milestone snippet above or jump straight into the full
              repository documentation for each capability.
            </p>
          </div>

          <div className="card-list">
            {milestones.map((milestone) => (
              <Link
                key={milestone.id}
                href={milestone.docHref}
                className="line-card"
              >
                <span className="tiny index">
                  MILESTONE {milestone.stepNumber}
                  {milestone.unreleasedNote
                    ? ` • ${UNRELEASED_SOURCE_VERSION} PREVIEW`
                    : ""}
                </span>
                <h3>{milestone.shortTitle}</h3>
                <small>{milestone.subtitle}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
