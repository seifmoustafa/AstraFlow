import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllCategories,
  getDocBySlug,
  getAllDocSlugs,
} from "@/lib/docs-loader";
import { MarkdownRenderer } from "@/components/docs/MarkdownRenderer";

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) {
    return { title: "Document Not Found — AstraFlow" };
  }
  return {
    title: `${doc.title} — AstraFlow Docs`,
    description: `Official AstraFlow documentation for ${doc.title}. Category: ${doc.category}.`,
  };
}

export default async function DynamicDocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const categories = getAllCategories();

  return (
    <section className="editorial-panel" id="reading">
      <div className="site-wrap">
        <p className="eyebrow">
          <Link href="/docs">DOCS</Link> / {doc.category.toUpperCase()}
        </p>

        <div className="docs-reading">
          <nav aria-label="Document sections">
            {categories.flatMap((category) =>
              category.items.map((item) => {
                const isActive = item.slug === doc.slug;
                return (
                  <div key={item.slug}>
                    <Link
                      href={`/docs/${item.slug}`}
                      aria-current={isActive ? "page" : undefined}
                      style={
                        isActive
                          ? { fontWeight: 700, color: "var(--action)" }
                          : undefined
                      }
                    >
                      {item.title}
                    </Link>
                  </div>
                );
              }),
            )}
          </nav>

          <main>
            <p className="tiny muted">
              DOCS / {doc.category.toUpperCase()}
              {doc.versionNotice ? ` • ${doc.versionNotice.toUpperCase()}` : ""}
            </p>
            <h1
              style={{
                fontSize: "clamp(34px, 4vw, 52px)",
                margin: "12px 0 24px",
                lineHeight: 1.04,
              }}
            >
              {doc.title}
            </h1>

            <MarkdownRenderer content={doc.content} />

            <div
              className="links"
              style={{
                marginTop: "42px",
                paddingTop: "24px",
                borderTop: "1px solid var(--line)",
                justifyContent: "space-between",
              }}
            >
              {doc.prev ? (
                <Link className="button button-outline" href={doc.prev.href}>
                  ← {doc.prev.title}
                </Link>
              ) : (
                <Link className="button button-outline" href="/docs">
                  ← All documentation
                </Link>
              )}

              {doc.next ? (
                <Link className="button button-primary" href={doc.next.href}>
                  {doc.next.title} <span aria-hidden="true">↗</span>
                </Link>
              ) : null}
            </div>
          </main>

          <aside>
            <p className="tiny">ON THIS PAGE</p>
            {doc.headings.length > 0 ? (
              doc.headings.map((h, idx) => (
                <p
                  key={`${h.id}-${idx}`}
                  style={{
                    paddingInlineStart:
                      h.level > 2 ? `${(h.level - 2) * 10}px` : 0,
                  }}
                >
                  <a href={`#${h.id}`}>{h.text}</a>
                </p>
              ))
            ) : (
              <p>
                <a href="#reading">{doc.title}</a>
              </p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
