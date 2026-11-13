import type { Metadata } from 'next';
import Link from 'next/link';
import { getLearningMilestones } from '@/lib/guides';
import {
  HeroStageEntrance,
  HeroTextReveal,
  MagneticButton,
} from '@/components/motion';
import {
  GuidesHeroQuickJump,
  GuidesKineticRunway,
} from '@/components/scenes/guides';
import styles from '@/components/scenes/guides/GuidesKineticRunway.module.css';

export const metadata: Metadata = {
  title: 'Guides',
  description:
    'Follow six practical learning milestones from dependency-free contracts and mediator pipelines to EF Core projections, analyzers, diagnostics, and fluent assertions.',
  alternates: {
    canonical: '/guides',
  },
};

const PRACTICAL_PATHS = [
  {
    eyebrow: '01 / FIRST REQUEST',
    title: 'Send something.',
    desc: 'From dependency-free contract definition to a typed mediator response without pulling DI or ASP.NET Core into domain assemblies.',
    href: '/docs/getting-started',
  },
  {
    eyebrow: '02 / COMPOSITION',
    title: 'Design a pipeline.',
    desc: 'Keep request behaviors, pre/post processors, notifications, and streaming dispatches explicit and strictly scoped.',
    href: '/docs/pipelines',
  },
  {
    eyebrow: '03 / DATA',
    title: 'Map with intent.',
    desc: 'Declare object pairs explicitly, enforce pairing coverage, and emit EF Core IQueryable projections without runtime surprises.',
    href: '/docs/mapper',
  },
  {
    eyebrow: '04 / INSPECTION',
    title: 'Know your wiring.',
    desc: 'Inspect startup registration reports, redaction guardrails, OpenTelemetry traces, and ASP.NET Core diagnostics defaults.',
    href: '/docs/diagnostics',
  },
  {
    eyebrow: '05 / CONFIDENCE',
    title: 'Test important parts.',
    desc: 'Combine FakeMediator test harnesses with fluent AstraFlow.Assertions expectations for fast, isolated verification.',
    href: '/docs/testing',
  },
  {
    eyebrow: '06 / MIGRATION',
    title: 'Move without guessing.',
    desc: 'Plan package upgrades across versions with compatibility matrices and migration guidance.',
    href: '/docs/migration-and-troubleshooting',
  },
] as const;

export default function GuidesPage() {
  const milestones = getLearningMilestones();

  return (
    <main id="main" data-page="guides">
      <section className={`hero ${styles.heroSection}`}>
        <div className="site-wrap">
          <div className={styles.heroHeaderGrid}>
            <div className={styles.heroCopy}>
              <p className="eyebrow">LEARNING SHOULD FEEL LIKE FORWARD MOTION</p>
              <HeroTextReveal as="h1" className={styles.heroTitle}>
                From curious
                <br />
                <span className="ital signal">to confident.</span>
              </HeroTextReveal>
              <p className={styles.heroLead}>
                Six practical journeys through AstraFlow — from dependency-free
                contracts and mediator pipelines to EF Core projections, Roslyn
                analyzers, diagnostics, and fluent test assertions.
              </p>
              <div className={styles.heroLinks}>
                <MagneticButton
                  className="button button-primary"
                  href="#guides-runway"
                >
                  Start Milestone 01
                  <span aria-hidden="true" className="arrow">
                    ↓
                  </span>
                </MagneticButton>
                <MagneticButton
                  className="button button-outline"
                  href="/docs/getting-started"
                >
                  Getting Started Docs
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </MagneticButton>
              </div>
            </div>

            <HeroStageEntrance>
              <GuidesHeroQuickJump
                milestones={milestones.map(({ id, stepNumber, shortTitle }) => ({
                  id,
                  stepNumber,
                  shortTitle,
                }))}
              />
            </HeroStageEntrance>
          </div>

          <GuidesKineticRunway milestones={milestones} />
        </div>
      </section>

      <section className={styles.pathsSection}>
        <div className="site-wrap">
          <div className={styles.pathsHead} data-reveal="up">
            <div>
              <p className="eyebrow">02 / SIX PRACTICAL PATHS</p>
              <h2 className={styles.pathsTitle}>
                Learn by <span className="ital signal">doing.</span>
              </h2>
            </div>
            <p className={styles.pathsCaption}>
              Every path connects directly to the developer documentation and
              runnable code patterns across the AstraFlow suite.
            </p>
          </div>

          <div className={styles.journeyCards}>
            {PRACTICAL_PATHS.map((pathItem) => (
              <Link
                key={pathItem.href}
                href={pathItem.href}
                data-reveal="up"
                className={styles.journeyCard}
              >
                <div className={styles.journeyCardTop}>
                  <span>{pathItem.eyebrow}</span>
                  <span className={styles.journeyCardArrow} aria-hidden="true">
                    ↗
                  </span>
                </div>
                <h3>{pathItem.title}</h3>
                <p>{pathItem.desc}</p>
                <span className={styles.journeyCardBottom}>
                  READ GUIDE →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
