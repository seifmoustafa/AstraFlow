"use client";
import { Button } from '@core/ui';

import Link from "next/link";
import { useEffect } from "react";
import { useTranslations } from 'next-intl';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('core.errors');

  useEffect(() => {
    console.error("Portal route error:", error.digest ?? "unknown");
  }, [error]);

  return (
    <main id="main" data-page="error">
      <section className="hero">
        <div className="site-wrap page-intro">
          <p className="eyebrow">{t('errorEyebrow')}</p>
          <h1>
            {t('errorTitle')}
            <span className="ital">{t('errorAccent')}</span>
          </h1>
          <p className="lead">{t('errorBody')}</p>
          {error.digest ? (
            <p className="tiny muted" style={{ marginBlockStart: 12 }}>
              {t('errorDigestLabel')} / {error.digest}
            </p>
          ) : null}
          <div className="links" style={{ marginBlockStart: 28 }}>
            <Button
              type="button"
              className="button button-primary"
              onClick={() => reset()}
            >
              {t('retryLabel')}{" "}
              <span aria-hidden="true" className="arrow">
                ↺
              </span>
            </Button>
            <Link className="button button-outline" href="/">
              {t('homeLabel')}{" "}
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
