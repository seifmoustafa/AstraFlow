import React from "react";
import Link from "next/link";
import { SignatureA } from "./SignatureA";
import { SignalTrace } from "./SignalTrace";

export function HomeHero() {
  return (
    <>
      <section
        aria-labelledby="v10-hero-heading"
        className="hero v10-home-hero v12-home-hero"
      >
        <div className="site-wrap v10-home-grid">
          <div className="v10-hero-copy">
            <p className="eyebrow">OPEN SOURCE / THE .NET FLOW ENGINE</p>
            <h1 id="v10-hero-heading">
              Control
              <br />
              <span className="v10-flow-word">
                the flow<span className="v10-period">.</span>
              </span>
            </h1>
            <p className="v10-hero-lead">Make intent explicit.</p>
            <p className="v10-hero-description">
              A focused family of .NET packages for request dispatch, object
              mapping, diagnostics and testing.{" "}
              <strong>Compose only what your application needs.</strong>
            </p>
            <div className="links v10-hero-actions">
              <Link className="button button-primary" href="/docs">
                Start building <span aria-hidden="true">↗</span>
              </Link>
              <a className="button button-outline" href="#experience">
                Explore the flow <span aria-hidden="true">↘</span>
              </a>
            </div>
            <p className="v10-hero-meta mono">
              <span aria-hidden="true" className="v10-led" /> MIT LICENSED{" "}
              <i>·</i> MODULAR PACKAGES <i>·</i> DOCUMENTED APIS
            </p>
          </div>
          <SignalTrace>
            <SignatureA />
          </SignalTrace>
        </div>
        <div className="site-wrap v10-hero-under">
          <span>THE SIGNAL MOVES. THE SYSTEM STAYS PUT.</span>
          <a href="#experience">
            SEE HOW IT WORKS <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      <div className="site-wrap">
        <div className="proof-strip">
          <div className="proof">
            <span className="num">01</span>
            <div>
              <strong>Explicit by design.</strong>
              <small>Declare behavior without guessing.</small>
            </div>
          </div>
          <div className="proof">
            <span className="num">02</span>
            <div>
              <strong>Composable by default.</strong>
              <small>Choose the packages you need.</small>
            </div>
          </div>
          <div className="proof">
            <span className="num">03</span>
            <div>
              <strong>Inspectable decisions.</strong>
              <small>Understand supported source shapes.</small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
