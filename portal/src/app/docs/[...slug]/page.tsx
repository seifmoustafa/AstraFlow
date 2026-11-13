import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DocEnhancements } from '@/components/scenes/docs';
import enhancerStyles from '@/components/scenes/docs/DocEnhancements.module.css';
import {
  getAllDocRouteParams,
  getAllDocs,
  getDocBySlug,
  getDocCategories,
} from '@/lib/docs';
import { UNRELEASED_SOURCE_VERSION } from '@/lib/site-config';

export const dynamicParams = false;

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  return getAllDocRouteParams();
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) {
    return {
      title: 'Documentation Not Found',
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

export default async function DocArticlePage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) {
    notFound();
  }

  const allDocs = getAllDocs();
  const categories = getDocCategories();

  return (
    <main id="main" data-page="docs">
      <DocEnhancements toc={doc.toc} title={doc.title} />

      <section className="section">
        <div className="site-wrap">
          <nav className="docs-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/docs">Docs</Link>
            <span aria-hidden="true">/</span>
            <span>{doc.category}</span>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{doc.title}</span>
          </nav>

          {doc.resolvedFromAlias ? (
            <div className={enhancerStyles.provenanceBanner} role="note">
              ALIASED ROUTE — You arrived via <code>{doc.resolvedFromAlias}</code>. The canonical guide lives at{' '}
              <Link className={enhancerStyles.provenanceLink} href={doc.href}>
                {doc.href}
              </Link>
              .
            </div>
          ) : null}

          {doc.isUnreleasedSource ? (
            <div className={enhancerStyles.unreleasedBanner} role="note">
              {UNRELEASED_SOURCE_VERSION} UNRELEASED SOURCE — This document covers capabilities on the source branch not yet published to NuGet.
            </div>
          ) : null}

          <details className={enhancerStyles.mobileNavDetails}>
            <summary className={enhancerStyles.mobileNavSummary}>
              <span>Browse {allDocs.length} docs across {categories.length} tracks</span>
              <span className={enhancerStyles.mobileNavSummaryTag}>INDEX ▾</span>
            </summary>
            <div className={enhancerStyles.mobileNavBody}>
              {categories.map((group) => (
                <div key={group.category}>
                  <p className={enhancerStyles.mobileNavCatLabel}>{group.category}</p>
                  <div className={enhancerStyles.mobileNavLinks}>
                    {group.docs.map((item) => {
                      const isCurrent = item.slugPath === doc.slugPath;
                      return (
                        <Link
                          key={item.slugPath}
                          href={item.href}
                          className={
                            isCurrent
                              ? `${enhancerStyles.mobileNavLink} ${enhancerStyles.mobileNavLinkCurrent}`
                              : enhancerStyles.mobileNavLink
                          }
                          aria-current={isCurrent ? 'page' : undefined}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </details>

          <div className={`docs-reading ${enhancerStyles.readerLayout}`}>
            <nav
              className={enhancerStyles.desktopNavColumn}
              aria-label="Documentation navigation"
            >
              <Link href="/docs" className={enhancerStyles.desktopNavBack}>
                ← All documentation
              </Link>
              {categories.map((group) => (
                <div key={group.category} className={enhancerStyles.desktopNavGroup}>
                  <p className={enhancerStyles.desktopNavCategory}>{group.category}</p>
                  {group.docs.map((item) => {
                    const isCurrent = item.slugPath === doc.slugPath;
                    return (
                      <Link
                        key={item.slugPath}
                        href={item.href}
                        aria-current={isCurrent ? 'page' : undefined}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <article className="docs-prose" aria-label={doc.title}>
              <p className="eyebrow">{doc.category}</p>
              <div className="docs-article-meta">
                <span>{doc.readingMinutes} min read</span>
                <span>{doc.wordCount} words</span>
                <span>Source: {doc.sourcePath}</span>
                <a href={doc.githubUrl} target="_blank" rel="noreferrer">
                  View markdown source on GitHub ↗
                </a>
              </div>

              <div dangerouslySetInnerHTML={{ __html: doc.html }} />

              {doc.prev || doc.next ? (
                <nav className="docs-pager" aria-label="Adjacent guides">
                  {doc.prev ? (
                    <Link href={doc.prev.href}>
                      <span className="tiny">← Previous · {doc.prev.category}</span>
                      <strong>{doc.prev.title}</strong>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {doc.next ? (
                    <Link href={doc.next.href}>
                      <span className="tiny">Next · {doc.next.category} →</span>
                      <strong>{doc.next.title}</strong>
                    </Link>
                  ) : (
                    <div />
                  )}
                </nav>
              ) : null}
            </article>

            <aside aria-label="On this page">
              <div className="docs-toc">
                <p className="eyebrow">On this page</p>
                {doc.toc.length > 0 ? (
                  <ul>
                    {doc.toc.map((heading) => (
                      <li key={heading.id} data-level={heading.level}>
                        <a href={`#${heading.id}`}>{heading.text}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="tiny">Single-section reference note.</p>
                )}
                <a
                  href={doc.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={enhancerStyles.tocFooterLink}
                >
                  View markdown source on GitHub ↗
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
