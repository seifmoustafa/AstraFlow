import Link from "next/link";
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('core.errors');

  return (
    <main id="main" data-page="not-found">
      <section className="hero">
        <div className="site-wrap page-intro">
          <p className="eyebrow">{t('notFoundEyebrow')}</p>
          <h1>
            {t('notFoundTitle')}
            <span className="ital">{t('notFoundAccent')}</span>
          </h1>
          <p className="lead">{t('notFoundBody')}</p>
          <div className="links" style={{ marginBlockStart: 28 }}>
            <Link className="button button-primary" href="/">
              {t('homeLabel')}{" "}
              <span aria-hidden="true" className="arrow">
                ↗
              </span>
            </Link>
            <Link className="button button-outline" href="/docs">
              {t('docsLabel')}{" "}
              <span aria-hidden="true" className="arrow">
                ↗
              </span>
            </Link>
            <Link className="button button-outline" href="/packages">
              {t('packagesLabel')}{" "}
              <span aria-hidden="true" className="arrow">
                ↗
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
