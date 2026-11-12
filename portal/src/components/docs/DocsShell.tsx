import React from 'react';
import Link from 'next/link';
import type { DocCategory, DocPageData } from '@/lib/docs-types';
import { ArticleToc } from '@/components/docs/ArticleToc';

interface DocsShellProps {
  doc: DocPageData;
  categories: DocCategory[];
  children: React.ReactNode;
}

export function DocsShell({ doc, categories, children }: DocsShellProps) {
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
                      aria-current={isActive ? 'page' : undefined}
                      style={
                        isActive
                          ? {
                              fontWeight: 700,
                              color: 'var(--action)',
                              borderInlineStart: '2px solid var(--signal)',
                              paddingInlineStart: '8px',
                            }
                          : undefined
                      }
                    >
                      {item.title}
                    </Link>
                  </div>
                );
              })
            )}
          </nav>

          <main>
            <p className="tiny muted">
              DOCS / {doc.category.toUpperCase()}
              {doc.versionNotice ? ` • ${doc.versionNotice.toUpperCase()}` : ''}
            </p>
            <h1
              style={{
                fontSize: 'clamp(34px, 4vw, 52px)',
                margin: '12px 0 24px',
                lineHeight: 1.04,
              }}
            >
              {doc.title}
            </h1>

            {children}

            <div
              className="links"
              style={{
                marginTop: '42px',
                paddingTop: '24px',
                borderTop: '1px solid var(--line)',
                justifyContent: 'space-between',
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

          <ArticleToc headings={doc.headings} fallbackTitle={doc.title} />
        </div>
      </div>
    </section>
  );
}
