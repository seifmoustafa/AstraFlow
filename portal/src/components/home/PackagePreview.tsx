import React from "react";
import Link from "next/link";

interface ModuleItem {
  code: string;
  name: string;
  description: string;
}

const MODULES: readonly ModuleItem[] = [
  {
    code: "01 / REQUEST",
    name: "Mediator",
    description: "Typed requests, handlers, and pipelines.",
  },
  {
    code: "02 / MAPPING",
    name: "Mapper",
    description: "Declared mapping rules and projections.",
  },
  {
    code: "03 / INSPECTION",
    name: "Diagnostics",
    description: "Findings, reports, and CLI exports.",
  },
  {
    code: "04 / CONFIDENCE",
    name: "Testing",
    description: "Fakes, harnesses, and focused assertions.",
  },
  {
    code: "05 / BUILD TIME",
    name: "Generators",
    description: "Opt-in generated registration and mapping.",
  },
  {
    code: "06 / TOOLING",
    name: "CLI & more",
    description: "Reports, graphs, validation, integrations.",
  },
];

export function PackagePreview() {
  return (
    <section className="editorial-panel v10-modules-section">
      <div className="site-wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">04 / MODULAR BY CHOICE</p>
            <h2>
              Focused by design.
              <br />
              <span className="v10-ital">Built to compose.</span>
            </h2>
          </div>
          <p className="section-caption">
            Explore the focused packages without installing an entire stack.
            Every capability has a documented boundary.
          </p>
        </div>

        <div className="card-list">
          {MODULES.map((mod) => (
            <Link key={mod.code} className="line-card" href="/packages">
              <span className="index tiny">{mod.code}</span>
              <h3>{mod.name}</h3>
              <small>{mod.description}</small>
            </Link>
          ))}
        </div>

        <div className="v10-start-strip">
          <div>
            <span className="tiny">READY WHEN YOU ARE</span>
            <h3>Begin with one responsibility.</h3>
            <p>
              Use the package-selection guide to choose the smallest useful
              dependency.
            </p>
          </div>
          <Link className="button button-primary" href="/docs">
            Read the quick start <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
