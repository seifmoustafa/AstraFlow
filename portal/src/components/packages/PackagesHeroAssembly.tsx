'use client';

import React, { useEffect, useState } from 'react';
import { HAIRLINE_IVORY_STYLE } from '@/components/motion/HairlineFigures';

const PLATES = ['CONTRACTS', 'MEDIATOR', 'MAPPER'] as const;
type PlateName = (typeof PLATES)[number];

export function PackagesHeroAssembly() {
  const [selectedPlate, setSelectedPlate] = useState<PlateName | null>(null);

  useEffect(() => {
    const prevPage = document.body.getAttribute('data-page');
    document.body.setAttribute('data-page', 'packages');
    return () => {
      if (prevPage) {
        document.body.setAttribute('data-page', prevPage);
      } else {
        document.body.removeAttribute('data-page');
      }
    };
  }, []);

  return (
    <div
      className="overlap-scene v12-packages-scene hairline-ivory"
      style={HAIRLINE_IVORY_STYLE}
    >
      <div className="geo-grid" />
      <span className="scene-tag tiny">ISOMETRIC / PACKAGE COMPOSITION</span>
      {PLATES.map((plate) => (
        <button
          key={plate}
          type="button"
          className={`plate${selectedPlate === plate ? ' selected' : ''}`}
          aria-pressed={selectedPlate === plate}
          onClick={() => setSelectedPlate(plate)}
        >
          {plate}
        </button>
      ))}
      <span className="scene-tag2 tiny">EACH PACKAGE STANDS ON ITS OWN</span>
    </div>
  );
}

export default PackagesHeroAssembly;
