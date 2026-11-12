import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllDocRouteParams,
  getDocBySlug,
  getDocCategories,
} from "@/lib/docs";
import { DocArticleEnhancer } from "@/components/scenes/docs";

interface DocArticlePageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return getAllDocRouteParams();
}

export async function generateMetadata({
  params,
}: DocArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) {
    return {
      title: "Documentation Not Found",
    };
  }

  return {
    title: doc.title,
    description: doc.summary,
    alternates: {
      canonical: doc.href,
    },
  };
}

export default async function DocArticlePage({ params }: DocArticlePageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) {
    notFound();
  }

  const categories = getDocCategories();

  return (
    <main id="main" data-page="docs">
      <section
        className="editorial-panel"
        style={{ paddingBlock: "48px 96px", borderBlockStart: 0 }}
      >
        <div className="site-wrap">
          <div className="docs-breadcrumbs">
            <Link href="/docs">Docs</Link>
            <span aria-hidden="true">/</span>
            <span>{doc.category}</span>
            <span aria-hidden="true">/</span>
            <span style={{ color: "var(--ink)" }}>{doc.title}</span>
          </div>

          {doc.resolvedFromAlias ? (
            <p
              className="tiny"
              style={{
                background: "var(--sand)",
                borderInlineStart: "3px solid var(--signal)",
                padding: "10px 14px",
                marginBlockEnd: 20,
              }}
            >
              ALIASED ROUTE ({doc.resolvedFromAlias}) · CANONICAL SOURCE:{" "}
              <Link href={doc.href} style={{ color: "var(--action)" }}>
                {doc.href}
              </Link>
            </p>
          ) : null}

          <DocArticleEnhancer toc={doc.toc} title={doc.title} />

          <div className="docs-reading" style={{ borderBlockStart: 0, paddingBlockStart: 12 }}>
            <nav aria-label="Documentation navigation">
              <Link href="/docs" style={{ fontWeight: 700, color: "var(--action)" }}>
                ← All documentation
              </Link>
              {categories.map((group) => (
                <div
                  key={group.category}
                  style={{ borderBlockEnd: 0, paddingBlock: "14px 4px" }}
                >
                  <p
                    className="tiny muted"
                    style={{ marginBlockEnd: 8, paddingInlineStart: 8 }}
                  >
                    {group.category}
                  </p>
                  {group.docs.map((item) => (
                    <Link
                      key={item.slugPath}
                      href={item.href}
                      aria-current={
                        item.slugPath === doc.slugPath ? "page" : undefined
                      }
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>

            <article aria-label={doc.title} className="docs-prose">
              <p className="eyebrow" style={{ marginBlockEnd: 12 }}>
                {doc.category}
              </p>

              <div className="docs-article-meta">
                <span>{doc.readingMinutes} min read</span>
                <span>{doc.wordCount} words</span>
                <span>Source: {doc.sourcePath}</span>
                <a
                  href={doc.githubUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                  style={{ marginInlineStart: "auto" }}
                >
                  View source on GitHub ↗
                </a>
              </div>

              <div dangerouslySetInnerHTML={{ __html: doc.html }} />

              {(doc.prev || doc.next) && (
                <nav className="docs-pager" aria-label="Adjacent documentation pages">
                  {doc.prev ? (
                    <Link href={doc.prev.href}>
                      <span className="tiny muted" style={{ display: "block" }}>
                        ← PREVIOUS
                      </span>
                      <strong style={{ display: "block", marginBlockStart: 6 }}>
                        {doc.prev.title}
                      </strong>
                    </Link>
                  ) : (
                    <span />
                  )}

                  {doc.next ? (
                    <Link href={doc.next.href} style={{ textAlign: "end" }}>
                      <span className="tiny muted" style={{ display: "block" }}>
                        NEXT →
                      </span>
                      <strong style={{ display: "block", marginBlockStart: 6 }}>
                        {doc.next.title}
                      </strong>
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              )}
            </article>

            <aside aria-label="On this page">
              <div className="docs-toc">
                <p className="tiny" style={{ color: "var(--ink)", marginBlockEnd: 12 }}>
                  ON THIS PAGE
                </p>
                {doc.toc.length > 0 ? (
                  doc.toc.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      data-level={heading.level}
                    >
                      {heading.text}
                    </a>
                  ))
                ) : (
                  <p className="muted">Single-section reference document.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
