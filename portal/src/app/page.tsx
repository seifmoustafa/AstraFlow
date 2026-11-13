import type { Metadata } from "next";
import Link from "next/link";
import { SignalArchitectureHero } from "@/components/home/SignalArchitectureHero";
import {
  HomeDetailsMatterSection,
  HomeExplodedArchitecture,
  LivingFlowAtlas,
} from "@/components/scenes/home";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Explore AstraFlow: focused .NET packages for explicit request dispatch, object mapping, diagnostics and testing.",
  alternates: {
    canonical: "/",
  },
};

const PROOF_ITEMS = [
  {
    num: "01",
    title: "Explicit by design.",
    caption: "Declare behavior without guessing.",
  },
  {
    num: "02",
    title: "Composable by default.",
    caption: "Choose the packages you need.",
  },
  {
    num: "03",
    title: "Inspectable decisions.",
    caption: "Understand supported source shapes.",
  },
] as const;

const MODULE_CARDS = [
  {
    index: "01 / REQUEST",
    title: "Mediator",
    summary: "Typed requests, handlers, and pipelines.",
    href: "/packages#directory",
  },
  {
    index: "02 / MAPPING",
    title: "Mapper",
    summary: "Declared mapping rules and projections.",
    href: "/packages#directory",
  },
  {
    index: "03 / INSPECTION",
    title: "Diagnostics",
    summary: "Findings, reports, and CLI exports.",
    href: "/packages#directory",
  },
  {
    index: "04 / CONFIDENCE",
    title: "Testing",
    summary: "Fakes, harnesses, and focused assertions.",
    href: "/packages#directory",
  },
  {
    index: "05 / BUILD TIME",
    title: "Generators",
    summary: "Opt-in generated registration and mapping.",
    href: "/packages#directory",
  },
  {
    index: "06 / TOOLING",
    title: "CLI & more",
    summary: "Reports, graphs, validation, integrations.",
    href: "/packages#directory",
  },
] as const;

export default function HomePage() {
  return (
    <main id="main" data-page="home">
      <SignalArchitectureHero />

      <div className="proof-strip-band">
        <div className="site-wrap">
          <div className="proof-strip">
            {PROOF_ITEMS.map((item) => (
              <div key={item.num} className="proof">
                <span className="num">{item.num}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.caption}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LivingFlowAtlas />

      <HomeExplodedArchitecture />

      <section className="editorial-panel v10-modules-section">
        <div className="site-wrap">
          <div className="section-head" data-reveal="up">
            <div>
              <p className="eyebrow">04 / MODULAR BY CHOICE</p>
              <h2>
                Focused by design.
                <br />
                <span className="v10-ital">Built to compose.</span>
              </h2>
            </div>
            <p className="section-caption">
              Explore the focused packages without installing an entire stack.
              Every capability has a documented boundary.
            </p>
          </div>

          <div className="card-list">
            {MODULE_CARDS.map((card, idx) => (
              <Link
                key={card.index}
                className="line-card"
                href={card.href}
                data-reveal="up"
                data-reveal-delay={String(idx * 45)}
              >
                <span className="index tiny">{card.index}</span>
                <h3>{card.title}</h3>
                <small>{card.summary}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeDetailsMatterSection />

      <section
        className="ending-cta-band"
        aria-labelledby="ending-cta-heading"
      >
        <div className="site-wrap ending-cta-inner">
          <div className="ending-cta-copy" data-reveal="up">
            <p className="eyebrow">06 / READY WHEN YOU ARE</p>
            <h2 id="ending-cta-heading">
              Begin with one
              <br />
              <span className="v10-ital">responsibility.</span>
            </h2>
            <p>
              Read the guide. Choose the smallest useful dependency. Stay in
              control.
            </p>
          </div>
          <div className="ending-cta-actions" data-reveal="up">
            <Link className="button button-primary" href="/docs/getting-started">
              Read the quick start <span aria-hidden="true">↗</span>
            </Link>
            <Link className="button button-outline" href="/packages">
              Explore packages <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
