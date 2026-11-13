import type { Metadata } from "next";
import Link from "next/link";
import { getLearningMilestones } from "@/lib/guides";
import { UNRELEASED_SOURCE_VERSION } from "@/lib/site-config";
import {
  GuidesHeroQuickJump,
  GuidesKineticRunway,
} from "@/components/scenes/guides";
import runwayStyles from "@/components/scenes/guides/GuidesKineticRunway.module.css";

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
      <section className={`hero ${runwayStyles.heroDraftingWrap}`}>
        <div className="site-wrap guides-hero-grid">
          <div>
            <p className="eyebrow">LEARNING SHOULD FEEL LIKE FORWARD MOTION</p>
            <h1>
              From curious
              <br />
              <span className="ital signal">to confident.</span>
            </h1>
            <GuidesHeroQuickJump
              milestones={milestones.map(({ id, stepNumber, shortTitle }) => ({
                id,
                stepNumber,
                shortTitle,
              }))}
            />
          </div>
          <div>
            <p className="lead" style={{ maxWidth: 380, color: "var(--ink-secondary)" }}>
              Six stepped .NET architecture journeys through verified codebase APIs — from
              zero-dependency contracts and mediator pipelines to compile-time Roslyn
              analyzers, diagnostics, and 2.4.0 source testing harnesses.
            </p>
          </div>
        </div>

        <GuidesKineticRunway milestones={milestones} />
      </section>

      <section className="editorial-panel">
        <div className="site-wrap">
          <div className="section-head" data-reveal="up">
            <div>
              <p className="eyebrow">02 / SIX PRACTICAL PATHS</p>
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
                data-reveal="up"
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
