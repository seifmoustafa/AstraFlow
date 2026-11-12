import type { Metadata } from "next";
import Link from "next/link";
import { getCommunityGovernance } from "@/lib/community";
import { GITHUB_LINKS } from "@/lib/site-config";
import { CommunityContributionCurrent } from "@/components/scenes/community";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Open-source AstraFlow governance grounded in repository files: GitHub repository, issues, pull requests, CONTRIBUTING.md checks, and SECURITY.md disclosures.",
  alternates: {
    canonical: "/community",
  },
};

export default function CommunityPage() {
  const governance = getCommunityGovernance();

  return (
    <main id="main" data-page="community">
      <section
        aria-labelledby="v10-community-title"
        className="hero v10-community-hero"
      >
        <div className="site-wrap v10-community-grid">
          <div className="v10-community-copy">
            <p className="eyebrow">OPEN SOURCE. OPEN DECISIONS.</p>
            <h1 id="v10-community-title">
              The work
              <br />
              is public<span className="v10-period">.</span>
              <span className="v10-community-italic">
                So is the thinking.
              </span>
            </h1>
            <p className="v10-community-lead">
              {governance.repoScope} Issues, pull requests, security
              disclosures, and architectural decisions are tracked openly on
              GitHub under the MIT license.
            </p>
            <div className="links">
              <a
                className="button button-primary"
                href={GITHUB_LINKS.repo}
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore the repository
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
              <a
                className="button button-outline"
                href={GITHUB_LINKS.issues}
                target="_blank"
                rel="noopener noreferrer"
              >
                View open issues
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
            </div>
            <p className="mono v10-community-note">
              NO PRIVATE COMMUNITY GATE. THE WORK IS ON GITHUB.
            </p>
          </div>

          <CommunityContributionCurrent
            pathways={governance.pathways}
            governance={governance}
          />
        </div>

        <div className="site-wrap v10-community-values">
          <div>
            <span>01</span>Read before proposing
          </div>
          <div>
            <span>02</span>Explain the trade-off
          </div>
          <div>
            <span>03</span>Verify the outcome
          </div>
        </div>
      </section>

      <section className="editorial-panel">
        <div className="site-wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">PUBLIC GOVERNANCE</p>
              <h2>Six ways to engage.</h2>
            </div>
            <p className="section-caption">
              Every pathway, build check, and security process below reflects
              CONTRIBUTING.md, SECURITY.md, SUPPORT.md, and CODE_OF_CONDUCT.md.
            </p>
          </div>

          <div className="card-list">
            {governance.pathways.map((pathway) =>
              pathway.isExternal ? (
                <a
                  key={pathway.id}
                  href={pathway.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-card"
                >
                  <span className="tiny index">PATH {pathway.number}</span>
                  <h3>{pathway.title}</h3>
                  <small>{pathway.summary}</small>
                  <div className="community-tag-row">
                    {pathway.tags.map((tag) => (
                      <span key={tag} className="release-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
              ) : (
                <Link
                  key={pathway.id}
                  href={pathway.href}
                  className="line-card"
                >
                  <span className="tiny index">PATH {pathway.number}</span>
                  <h3>{pathway.title}</h3>
                  <small>{pathway.summary}</small>
                  <div className="community-tag-row">
                    {pathway.tags.map((tag) => (
                      <span key={tag} className="release-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              )
            )}
          </div>

          <div className="community-governance-grid">
            <article className="community-governance-card">
              <span className="tiny signal">CONTRIBUTING.MD / CHECKLIST</span>
              <h3>Build &amp; verification baseline</h3>
              <p>
                Run the full solution build and test suite before submitting a
                focused pull request:
              </p>
              <pre className="community-cmd-pre" tabIndex={0}>
                <code>{governance.buildTestCommands.join("\n")}</code>
              </pre>
              <ul className="community-checklist">
                {governance.prChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="links" style={{ marginBlockStart: 20 }}>
                <a
                  className="button button-outline"
                  href={GITHUB_LINKS.contributing}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read CONTRIBUTING.md
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </a>
              </div>
            </article>

            <article className="community-governance-card">
              <span className="tiny signal">
                SECURITY.MD &amp; SUPPORT.MD
              </span>
              <h3>
                Responsible disclosure ({governance.securitySlaHours} target)
              </h3>
              <p>{governance.codeOfConductSummary}</p>
              <ul
                className="community-checklist"
                style={{ marginBlockStart: 14 }}
              >
                {governance.securityScopes.map((scope) => (
                  <li key={scope}>{scope}</li>
                ))}
              </ul>
              <div className="links" style={{ marginBlockStart: 20 }}>
                <a
                  className="button button-primary"
                  href={GITHUB_LINKS.advisories}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open security advisory
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </a>
                <a
                  className="button button-outline"
                  href={governance.buyMeACoffeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy Me a Coffee
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
