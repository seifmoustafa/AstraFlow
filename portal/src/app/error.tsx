"use client";

import Link from "next/link";
import { useEffect } from "react";
import { UI_COPY } from "@/content/ui-copy";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portal route error:", error.digest ?? "unknown");
  }, [error]);

  return (
    <main id="main" data-page="error">
      <section className="hero">
        <div className="site-wrap page-intro">
          <p className="eyebrow">{UI_COPY.errors.errorEyebrow}</p>
          <h1>
            {UI_COPY.errors.errorTitle}
            <span className="ital">{UI_COPY.errors.errorAccent}</span>
          </h1>
          <p className="lead">
            An unexpected rendering error occurred while loading this page. You
            can retry the route or return to the verified portal index.
          </p>
          {error.digest ? (
            <p className="tiny muted" style={{ marginBlockStart: 12 }}>
              REFERENCE DIGEST / {error.digest}
            </p>
          ) : null}
          <div className="links" style={{ marginBlockStart: 28 }}>
            <button
              type="button"
              className="button button-primary"
              onClick={() => reset()}
            >
              {UI_COPY.errors.retryLabel}{" "}
              <span aria-hidden="true" className="arrow">
                ↺
              </span>
            </button>
            <Link className="button button-outline" href="/">
              {UI_COPY.errors.homeLabel}{" "}
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
