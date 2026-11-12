"use client";

import React, { useState } from "react";
import {
  IsometricAssemblySvg,
  HAIRLINE_IVORY_STYLE,
} from "@/components/motion/HairlineFigures";

export type LayerIndex = 0 | 1 | 2;

const LAYER_DETAILS: Record<LayerIndex, readonly [string, string]> = {
  0: [
    "01 / INPUT SELECTED",
    "Typed requests declare intent without hiding the contract behind infrastructure.",
  ],
  1: [
    "02 / EXECUTION SELECTED",
    "Handlers, pipeline behaviors and mapping rules are distinct, opt-in responsibilities.",
  ],
  2: [
    "03 / INSPECTION SELECTED",
    "Use diagnostics, analyzers and testing helpers to inspect supported relationships and validate decisions.",
  ],
};

const LAYER_CONTROLS: ReadonlyArray<{
  index: LayerIndex;
  code: string;
  title: string;
  subtitle: string;
}> = [
  {
    index: 0,
    code: "01 / INPUT",
    title: "Declare intent",
    subtitle: "Typed requests and contracts",
  },
  {
    index: 1,
    code: "02 / EXECUTION",
    title: "Compose behavior",
    subtitle: "Handlers, pipelines and mappings",
  },
  {
    index: 2,
    code: "03 / INSPECTION",
    title: "Verify decisions",
    subtitle: "Diagnostics and test workflows",
  },
];

export function ArchitectureAssembly() {
  const [activeLayer, setActiveLayer] = useState<LayerIndex>(1);
  const [selectedLabel, selectedDescription] = LAYER_DETAILS[activeLayer];

  return (
    <section
      aria-labelledby="v10-assembly-title"
      className="v10-assembly v12-assembly"
      id="composition"
    >
      <div className="site-wrap v10-assembly-head">
        <div>
          <p className="eyebrow">03 / ENGINEERED TO CONNECT</p>
          <h2 id="v10-assembly-title">
            Every piece
            <br />
            <span className="v10-ital">has a purpose.</span>
          </h2>
        </div>
        <p>
          Not a monolithic framework. Clearly separated responsibilities you can
          compose deliberately. Explore how each layer contributes to the whole.
        </p>
      </div>

      <div className="site-wrap v10-assembly-layout">
        <div
          aria-label="Architecture layers"
          className="v10-assembly-controls"
          role="group"
        >
          {LAYER_CONTROLS.map((layer) => {
            const isActive = activeLayer === layer.index;
            return (
              <button
                key={layer.index}
                aria-pressed={isActive}
                className="v10-layer-control"
                data-layer={String(layer.index)}
                data-active={isActive ? "true" : "false"}
                type="button"
                onClick={() => setActiveLayer(layer.index)}
              >
                <span>{layer.code}</span>
                <strong>{layer.title}</strong>
                <small>{layer.subtitle}</small>
                <b aria-hidden="true">↗</b>
              </button>
            );
          })}
        </div>

        <div
          aria-label="Conceptual interlocking illustration of three independent layers"
          className="v10-assembly-figure hairline-ivory"
          data-active-layer={String(activeLayer)}
          style={HAIRLINE_IVORY_STYLE}
        >
          <div className="v10-figure-top mono">
            <span>FIGURE 02 / COMPOSITION</span>
            <span>SELECT A LAYER TO INSPECT</span>
          </div>

          <IsometricAssemblySvg
            activeLayer={activeLayer}
            onSelectLayer={setActiveLayer}
          />

          <div className="v10-figure-foot">
            <span id="v10-layer-label">{selectedLabel}</span>
            <p aria-live="polite" id="v10-layer-description">
              {selectedDescription}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
