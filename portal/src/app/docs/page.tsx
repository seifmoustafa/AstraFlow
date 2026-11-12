import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { DocsReferenceDesk } from "@/components/docs/DocsReferenceDesk";
import { CopyCode } from "@/components/docs/CopyCode";

export const metadata: Metadata = {
  title: "Docs — AstraFlow Living Reference Desk",
  description:
    "Explore AstraFlow documentation, architectural patterns, C# signatures, ADRs, diagnostics safety defaults, and source-generated mapping across all 61 repository documents.",
};

const PREVIEW_CODE = `public sealed record CreateOrder(string Number)
    : IRequest<OrderCreated>;

var response = await sender.Send(
    new CreateOrder("ORD-1042"), ct);`;

export default function DocsPage() {
  return (
    <>
      {/* Living Reference Desk Hero */}
      <section className="hero" style={{ paddingBottom: "48px" }}>
        <div className="site-wrap" style={{ paddingTop: "72px" }}>
          <div style={{ maxWidth: "860px", marginBottom: "40px" }}>
            <p className="eyebrow">THE DOCUMENTATION / ORIGINAL SOURCES</p>
            <h1 style={{ margin: "16px 0 20px" }}>
              Understand it.
              <br />
              <span className="ital">Then build it.</span>
            </h1>
            <p className="lead" style={{ margin: "0 0 28px", maxWidth: "680px" }}>
              Start with a request. Follow the API. Examine the trade-offs. The Living Reference Desk indexes all 61 verified architectural specifications, ADRs, and source guides without promotional fluff.
            </p>
            <div className="links">
              <a className="button button-primary" href="#reading">
                Start with the basics
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
              <a className="button button-outline" href="#topics">
                Explore reference desk
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
            </div>
          </div>

          {/* Living Reference Desk Instrument */}
          <DocsReferenceDesk />
        </div>
      </section>

      {/* Reading System Preview / Deep Article Gateway */}
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
                <a href="/docs/getting-started#next-steps">Next steps</a>
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
