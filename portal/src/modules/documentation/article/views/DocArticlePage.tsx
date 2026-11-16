import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  DocEnhancements,
  DocMobileNavDrawer,
  DocSidebarNav,
} from './DocEnhancements';
import enhancerStyles from './DocEnhancements.module.css';
import {
  DOC_CATEGORY_MESSAGE_KEYS,
  getAllDocRouteParams,
  getAllDocs,
  getDocBySlug,
  getDocCategories,
} from '@modules/documentation/data';

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
  const t = await getTranslations('documentation.article');
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) {
    return {
      title: t('missingTitle'),
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
  const t = await getTranslations('documentation.article');
  const tCategory = await getTranslations('documentation.categories');

  return (
    <main id="main" data-page="docs">
      <div className={enhancerStyles.articleShell}>
        <div className="site-wrap">
          <div className={enhancerStyles.articleLayout}>
            <aside
              aria-label={t('navigationAriaLabel')}
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
              <nav aria-label={t('breadcrumbAriaLabel')} className="docs-breadcrumbs">
                <Link href="/docs">{t('docsLink')}</Link>
                <span aria-hidden="true">/</span>
                <span>{tCategory(DOC_CATEGORY_MESSAGE_KEYS[doc.category])}</span>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{doc.title}</span>
              </nav>

              {doc.resolvedFromAlias ? (
                <div className={enhancerStyles.provenanceBanner} role="note">
                  {t('aliasLead')}{' '}
                  <code>{doc.resolvedFromAlias}</code>. {t('aliasMiddle')}{' '}
                  <Link className={enhancerStyles.provenanceLink} href={doc.href}>
                    {doc.href}
                  </Link>
                  .
                </div>
              ) : null}

              <DocMobileNavDrawer
                activeSlugPath={doc.slugPath}
                categories={categories}
                totalCount={allDocs.length}
              />

              <DocEnhancements toc={doc.toc} title={doc.title} />

              <div className="docs-article-meta">
                <span>{t('readingMinutes', { count: String(doc.readingMinutes) })}</span>
                <span>{t('wordCount', { count: String(doc.wordCount) })}</span>
                <span>
                  {t('track', {
                    category: tCategory(DOC_CATEGORY_MESSAGE_KEYS[doc.category]),
                  })}
                </span>
                <a href={doc.githubUrl} rel="noreferrer" target="_blank">
                  {t('githubGuide')}
                </a>
              </div>

              <div dangerouslySetInnerHTML={{ __html: doc.html }} />

              {doc.prev || doc.next ? (
                <nav
                  aria-label={t('adjacentGuidesAriaLabel')}
                  className="docs-pager"
                  data-reveal="fade"
                >
                  {doc.prev ? (
                    <Link href={doc.prev.href}>
                      <span className="tiny">
                        {t('previousGuide', {
                          category: tCategory(DOC_CATEGORY_MESSAGE_KEYS[doc.prev.category]),
                        })}
                      </span>
                      <strong>{doc.prev.title}</strong>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {doc.next ? (
                    <Link href={doc.next.href}>
                      <span className="tiny">
                        {t('nextGuide', {
                          category: tCategory(DOC_CATEGORY_MESSAGE_KEYS[doc.next.category]),
                        })}
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
              aria-label={t('onThisPageAriaLabel')}
              className={enhancerStyles.tocAside}
            >
              <div className="docs-toc">
                <p className="eyebrow">{t('onThisPage')}</p>
                {doc.toc.length > 0 ? (
                  <ul>
                    {doc.toc.map((heading) => (
                      <li data-level={heading.level} key={heading.id}>
                        <a href={`#${heading.id}`}>{heading.text}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="tiny">{t('oneSectionNote')}</p>
                )}
                <a
                  className={enhancerStyles.tocFooterLink}
                  href={doc.githubUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t('viewGuideOnGitHub')}
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
