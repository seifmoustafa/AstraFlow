import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="hero">
      <div className="site-wrap page-intro grid">
        <div>
          <p className="eyebrow">404 / PATH NOT FOUND</p>
          <h1>
            Flow route
            <br />
            <span className="ital">unmapped.</span>
          </h1>
          <p className="lead">
            The requested resource does not exist in the AstraFlow portal.
            Check the URL or navigate back to the home or documentation hub.
          </p>
          <div className="links">
            <Link className="button button-primary" href="/">
              Return home
              <span aria-hidden="true" className="arrow">
                ↗
              </span>
            </Link>
            <Link className="button button-outline" href="/docs">
              Explore documentation
              <span aria-hidden="true" className="arrow">
                ↗
              </span>
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              padding: '48px',
              border: '1px solid var(--line)',
              background: 'var(--paper2)',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: 'var(--shadow)',
            }}
          >
            <p className="tiny mono" style={{ color: 'var(--signal)', marginBottom: '8px' }}>
              ERROR CODE / HTTP 404
            </p>
            <div style={{ fontSize: '84px', fontWeight: 800, lineHeight: 1, color: 'var(--ink)' }}>
              404
            </div>
            <p className="muted" style={{ marginTop: '16px', fontSize: '14px' }}>
              Documented routes: Home, Packages, Docs, Guides, Changelog, Community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
