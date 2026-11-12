import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="site-wrap">
        <div className="footer-in">
          <div>
            <Link href="/" className="brand" aria-label="AstraFlow home">
              <img src="/brand/mark-on-dark.svg" alt="" width={43} height={39} />
              <strong>AstraFlow</strong>
              <small className="mono v11-footer-tagline">ENGINEERED CLARITY</small>
            </Link>
            <h2>
              Complexity is optional.
              <br />
              <span className="ital" style={{ color: "var(--peach)" }}>
                Clarity isn't.
              </span>
            </h2>
            <p style={{ color: "#b5cabb" }}>
              Focused .NET packages. One deliberate engineering language.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <b className="tiny">Explore</b>
              <Link href="/packages">Packages</Link>
              <Link href="/docs">Documentation</Link>
              <Link href="/guides">Guides</Link>
            </div>
            <div>
              <b className="tiny">Project</b>
              <Link href="/changelog">Changelog</Link>
              <Link href="/community">Community</Link>
              <a
                href="https://github.com/seifmoustafa/AstraFlow"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗
              </a>
            </div>
            <div>
              <b className="tiny">Build</b>
              <Link href="/docs">Quick start</Link>
              <Link href="/packages">Package selection</Link>
              <Link href="/changelog">Release history</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>ASTRAFLOW / THE COMPONENTS OF CLARITY</span>
          <span>MIT LICENSED • BUILT FOR .NET 8, 9 & 10</span>
        </div>
      </div>
    </footer>
  );
}
