import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  DocEnhancements,
  DocMobileNavDrawer,
  DocSidebarNav,
} from '@/components/scenes/docs';
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
      <div className={enhancerStyles.articleShell}>
        <div className="site-wrap">
          <div className={enhancerStyles.articleLayout}>
            <aside
              aria-label="Documentation navigation"
              className={enhancerStyles.sidebarColumn}
            >
              <DocSidebarNav
                activeSlugPath={doc.slugPath}
                categories={categories}
              />
            </aside>

            <article
              aria-label={doc.title}
              className={`${enhancerStyles.articleMain} docs-prose`}
            >
              <nav aria-label="Breadcrumb" className="docs-breadcrumbs">
                <Link href="/docs">Docs</Link>
                <span aria-hidden="true">/</span>
                <span>{doc.category}</span>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{doc.title}</span>
              </nav>

              {doc.resolvedFromAlias ? (
                <div className={enhancerStyles.provenanceBanner} role="note">
                  ALIASED ROUTE — You arrived via{' '}
                  <code>{doc.resolvedFromAlias}</code>. The canonical guide
                  lives at{' '}
                  <Link className={enhancerStyles.provenanceLink} href={doc.href}>
                    {doc.href}
                  </Link>
                  .
                </div>
              ) : null}

              {doc.isUnreleasedSource ? (
                <div className={enhancerStyles.unreleasedBanner} role="note">
                  {UNRELEASED_SOURCE_VERSION} UNRELEASED SOURCE — This document
                  covers capabilities on the source branch not yet published to
                  NuGet.
                </div>
              ) : null}

              <DocMobileNavDrawer
                activeSlugPath={doc.slugPath}
                categories={categories}
                totalCount={allDocs.length}
              />

              <DocEnhancements toc={doc.toc} title={doc.title} />

              <div className="docs-article-meta">
                <span>{doc.readingMinutes} min read</span>
                <span>{doc.wordCount} words</span>
                <span>Source: {doc.sourcePath}</span>
                <a href={doc.githubUrl} rel="noreferrer" target="_blank">
                  View markdown source on GitHub ↗
                </a>
              </div>

              <div dangerouslySetInnerHTML={{ __html: doc.html }} />

              {doc.prev || doc.next ? (
                <nav aria-label="Adjacent guides" className="docs-pager">
                  {doc.prev ? (
                    <Link href={doc.prev.href}>
                      <span className="tiny">
                        ← Previous · {doc.prev.category}
                      </span>
                      <strong>{doc.prev.title}</strong>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {doc.next ? (
                    <Link href={doc.next.href}>
                      <span className="tiny">
                        Next · {doc.next.category} →
                      </span>
                      <strong>{doc.next.title}</strong>
                    </Link>
                  ) : (
                    <div />
                  )}
                </nav>
              ) : null}
            </article>

            <aside
              aria-label="On this page"
              className={enhancerStyles.tocAside}
            >
              <div className="docs-toc">
                <p className="eyebrow">On this page</p>
                {doc.toc.length > 0 ? (
                  <ul>
                    {doc.toc.map((heading) => (
                      <li data-level={heading.level} key={heading.id}>
                        <a href={`#${heading.id}`}>{heading.text}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="tiny">Single-section reference note.</p>
                )}
                <a
                  className={enhancerStyles.tocFooterLink}
                  href={doc.githubUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  View markdown source on GitHub ↗
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
