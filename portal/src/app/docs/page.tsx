import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { DocsSearch } from "@/components/docs/DocsSearch";
import { CopyCode } from "@/components/docs/CopyCode";

export const metadata: Metadata = {
  title: "Docs — AstraFlow Visual Exploration",
  description:
    "Find AstraFlow concepts and documentation topics for mediator, mapping, diagnostics, generators and testing. Interactive design prototype.",
};

const PREVIEW_CODE = `public sealed record CreateOrder(string Number)
    : IRequest<OrderCreated>;

var response = await sender.Send(
    new CreateOrder("ORD-1042"), ct);`;

export default function DocsPage() {
  return (
    <>
      <section className="hero">
        <div className="site-wrap page-intro grid">
          <div>
            <p className="eyebrow">THE DOCUMENTATION / ORIGINAL SOURCES</p>
            <h1>
              Understand it.
              <br />
              <span className="ital">Then build it.</span>
            </h1>
            <p className="lead">
              Start with a request. Follow the API. Examine the trade-offs. The
              documentation must work as an instrument, not as another giant
              marketing hero.
            </p>
            <div className="links">
              <a className="button button-primary" href="#reading">
                Start with the basics
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
              <a className="button button-outline" href="#topics">
                Explore topics
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
            </div>
          </div>
          <div>
            <DocsSearch />
          </div>
        </div>
      </section>

      <section className="editorial-panel" id="reading">
        <div className="site-wrap">
          <p className="eyebrow">READING SYSTEM / PREVIEW</p>
          <div className="docs-reading">
            <nav aria-label="Document sections">
              <div>
                <Link
                  href="/docs/getting-started"
                  style={{ fontWeight: 700, color: "var(--action)" }}
                >
                  01 / Quick start
                </Link>
              </div>
              <div>
                <Link href="/docs/architecture">02 / Concepts</Link>
              </div>
              <div>
                <Link href="/docs/mediator">03 / Mediator</Link>
              </div>
              <div>
                <Link href="/docs/mapper">04 / Mapping</Link>
              </div>
              <div>
                <Link href="/docs/diagnostics">05 / Diagnostics</Link>
              </div>
              <div>
                <Link href="/docs/testing">06 / Testing</Link>
              </div>
              <div>
                <Link href="/docs/generators">07 / Generators</Link>
              </div>
            </nav>
            <main>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <p className="tiny muted" style={{ margin: 0 }}>
                  DOCS / GETTING STARTED
                </p>
                <CopyCode
                  code={PREVIEW_CODE}
                  label="Copy getting started preview code"
                />
              </div>
              <h3>Make the first request.</h3>
              <p>
                This area connects directly to repository source markdown. Stable
                line lengths, working anchors, copyable code and context are
                more valuable than a dramatic illustration.
              </p>
              <pre className="mono" dir="ltr" tabIndex={0}>
                {PREVIEW_CODE}
              </pre>
              <p>
                Example is illustrative; compile it against the exact package
                version before production publishing.
              </p>
              <div className="links" style={{ marginTop: "24px" }}>
                <Link
                  className="button button-primary"
                  href="/docs/getting-started"
                >
                  Open full article
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </Link>
                <Link
                  className="button button-outline"
                  href="/docs/package-selection"
                >
                  Package selection guide
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </Link>
              </div>
            </main>
            <aside>
              <p className="tiny">ON THIS PAGE</p>
              <p>
                <a href="#reading">Quick start</a>
              </p>
              <p>
                <a href="/docs/getting-started#register-astraflow">
                  Registration
                </a>
              </p>
              <p>
                <a href="/docs/getting-started#send-a-request">Dispatch</a>
              </p>
              <p>
                <a href="/docs/getting-started">Next steps</a>
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
