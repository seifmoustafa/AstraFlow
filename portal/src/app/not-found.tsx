import Link from "next/link";
import { UI_COPY } from "@/content/ui-copy";

export default function NotFound() {
  return (
    <main id="main" data-page="not-found">
      <section className="hero">
        <div className="site-wrap page-intro">
          <p className="eyebrow">{UI_COPY.errors.notFoundEyebrow}</p>
          <h1>
            {UI_COPY.errors.notFoundTitle}
            <span className="ital">{UI_COPY.errors.notFoundAccent}</span>
          </h1>
          <p className="lead">{UI_COPY.errors.notFoundBody}</p>
          <div className="links" style={{ marginBlockStart: 28 }}>
            <Link className="button button-primary" href="/">
              {UI_COPY.errors.homeLabel}{" "}
              <span aria-hidden="true" className="arrow">
                ↗
              </span>
            </Link>
            <Link className="button button-outline" href="/docs">
              {UI_COPY.errors.docsLabel}{" "}
              <span aria-hidden="true" className="arrow">
                ↗
              </span>
            </Link>
            <Link className="button button-outline" href="/packages">
              Browse packages{" "}
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
