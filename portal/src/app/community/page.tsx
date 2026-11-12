import type { Metadata } from 'next';
import { ContributionNetwork } from '@/components/community/ContributionNetwork';

export const metadata: Metadata = {
  title: 'Community — AstraFlow',
  description:
    'Contribute to AstraFlow through source, issues, pull requests, and documentation.',
  alternates: {
    canonical: '/community',
  },
  openGraph: {
    title: 'Community — AstraFlow',
    description:
      'Contribute to AstraFlow through source, issues, pull requests, and documentation.',
    url: '/community',
  },
};

const COMMUNITY_VALUES = [
  { number: '01', text: 'Read before proposing' },
  { number: '02', text: 'Explain the trade-off' },
  { number: '03', text: 'Verify the outcome' },
] as const;

const PARTICIPATION_CARDS = [
  {
    tag: '01 / UNDERSTAND',
    title: 'Read the code.',
    description: 'Inspect the API and design decisions first.',
    href: 'https://github.com/seifmoustafa/AstraFlow',
  },
  {
    tag: '02 / INVESTIGATE',
    title: 'Report a problem.',
    description: 'Reproducible failures and useful evidence.',
    href: 'https://github.com/seifmoustafa/AstraFlow/issues',
  },
  {
    tag: '03 / CONTRIBUTE',
    title: 'Propose a change.',
    description: 'Focused changes with rationale and verification.',
    href: 'https://github.com/seifmoustafa/AstraFlow/pulls',
  },
] as const;

export default function CommunityPage() {
  return (
    <div data-page="community">
      <section aria-labelledby="v10-community-title" className="hero v10-community-hero">
        <div className="site-wrap v10-community-grid">
          <div className="v10-community-copy">
            <p className="eyebrow">OPEN SOURCE. OPEN DECISIONS.</p>
            <h1 id="v10-community-title">
              The work
              <br />
              is public<span className="v10-period">.</span>
              <span className="v10-community-italic">So is the thinking.</span>
            </h1>
            <p className="v10-community-lead">
              Great engineering gets stronger when people can read it, question it and improve it. Start where you can contribute evidence.
            </p>
            <div className="links">
              <a
                className="button button-primary"
                href="https://github.com/seifmoustafa/AstraFlow"
                rel="noopener noreferrer"
              >
                Explore the repository <span aria-hidden="true">↗</span>
              </a>
              <a
                className="button button-outline"
                href="https://github.com/seifmoustafa/AstraFlow/issues"
                rel="noopener noreferrer"
              >
                View open issues <span aria-hidden="true">↗</span>
              </a>
            </div>
            <p className="v10-community-note mono">
              NO PRIVATE COMMUNITY GATE. THE WORK IS ON GITHUB.
            </p>
          </div>
          <ContributionNetwork />
        </div>
        <div className="site-wrap v10-community-values">
          {COMMUNITY_VALUES.map((item) => (
            <div key={item.number}>
              <span>{item.number}</span> {item.text}
            </div>
          ))}
        </div>
      </section>

      <section className="editorial-panel">
        <div className="site-wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">THREE PATHS TO PARTICIPATION</p>
              <h2>
                Good ideas
                <br />
                <span className="ital signal">leave a trail.</span>
              </h2>
            </div>
            <p className="section-caption">
              No invented Discord, testimonials, star counters, or community statistics.
            </p>
          </div>
          <div className="card-list">
            {PARTICIPATION_CARDS.map((card) => (
              <a
                key={card.tag}
                className="line-card"
                href={card.href}
                rel="noopener noreferrer"
              >
                <span className="tiny signal">{card.tag}</span>
                <h3>{card.title}</h3>
                <small>{card.description}</small>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
