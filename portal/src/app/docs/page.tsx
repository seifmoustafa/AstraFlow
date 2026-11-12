import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllDocs,
  getDocBySlug,
  getDocCategories,
} from "@/lib/docs";
import {
  DocsReferenceDesk,
  DocsTracksAndIndex,
} from "@/components/scenes/docs";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Find AstraFlow concepts and repository-backed documentation for mediator, mapping, diagnostics, generators, ADRs, and testing.",
  alternates: {
    canonical: "/docs",
  },
};

export default function DocsPage() {
  const allDocs = getAllDocs();
  const categories = getDocCategories();
  const gettingStarted = getDocBySlug("getting-started");

  return (
    <main id="main" data-page="docs">
      <section className="hero">
        <div className="site-wrap page-intro grid">
          <div>
            <p className="eyebrow">THE DOCUMENTATION / ORIGINAL SOURCES</p>
            <h1>
              Understand it.<span className="ital">Then build it.</span>
            </h1>
            <p className="lead">
              Start with a request. Follow the API. Examine the trade-offs. All{" "}
              {allDocs.length} documentation pages are rendered directly from the
              AstraFlow repository markdown.
            </p>
            <div className="links">
              <Link
                className="button button-primary"
                href="/docs/getting-started"
              >
                Start with the basics
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </Link>
              <a className="button button-outline" href="#category-index">
                Browse all topics
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
            </div>
          </div>

          <DocsReferenceDesk docs={allDocs} categories={categories} />
        </div>
      </section>

      <section className="editorial-panel" id="reading">
        <div className="site-wrap">
          <p className="eyebrow">READING SYSTEM / VERIFIED SOURCE</p>
          <div className="docs-reading">
            <nav aria-label="Featured documentation sections">
              <Link href="/docs/getting-started" aria-current="page">
                01 / Getting started
              </Link>
              <Link href="/docs/package-selection">02 / Package selection</Link>
              <Link href="/docs/mediator">03 / Mediator</Link>
              <Link href="/docs/mapper">04 / Mapper</Link>
              <Link href="/docs/diagnostics">05 / Diagnostics</Link>
            </nav>

            <div className="docs-reading-main">
              <p className="tiny muted">DOCS / GETTING STARTED</p>
              <h3>Make the first request.</h3>
              <p>
                {gettingStarted?.plainExcerpt ??
                  "This reading system renders real repository Markdown with stable line lengths, working section anchors, copyable syntax-highlighted code, and source links."}
              </p>
              <pre tabIndex={0}>{`public sealed record CreateOrder(string Number)
    : IRequest<OrderCreated>;

var response = await sender.Send(
    new CreateOrder("ORD-1042"), ct);`}</pre>
              <p>
                <Link
                  className="button button-outline"
                  href="/docs/getting-started"
                >
                  Open full Getting Started guide{" "}
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </Link>
              </p>
            </div>

            <aside>
              <p className="tiny">ON THIS PAGE</p>
              {(gettingStarted?.toc.slice(0, 6) ?? []).map((item) => (
                <p key={item.id}>
                  <Link href={`/docs/getting-started#${item.id}`}>
                    {item.text}
                  </Link>
                </p>
              ))}
            </aside>
          </div>
        </div>
      </section>

      <DocsTracksAndIndex categories={categories} docs={allDocs} />
    </main>
  );
}
