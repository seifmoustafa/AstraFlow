'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { HAIRLINE_IVORY_STYLE } from '@/components/motion/HairlineFigures';
import { usePackageStack } from './PackageStackContext';

const PLATES = ['CONTRACTS', 'MEDIATOR', 'MAPPER'] as const;
type PlateName = (typeof PLATES)[number];

const PLATE_TO_PKG: Record<PlateName, string | null> = {
  CONTRACTS: null,
  MEDIATOR: 'AstraFlow.Mediator',
  MAPPER: 'AstraFlow.Mapper',
};

export function PackagesHeroAssembly() {
  const {
    selectedPkgs,
    focusedPkgId,
    hasInteracted,
    selectAndEnsurePackage,
  } = usePackageStack();
  const [manualPlate, setManualPlate] = useState<PlateName | null>(null);
  const prefersReducedMotion = useReducedMotion();

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

  // Derive active hero plate when user interacts with either hero plates or the composer below
  const derivedPlate: PlateName | null = (() => {
    if (manualPlate) return manualPlate;
    if (!hasInteracted) return null;
    if (focusedPkgId === 'AstraFlow.Mapper') return 'MAPPER';
    if (focusedPkgId === 'AstraFlow.Mediator') return 'MEDIATOR';
    if (selectedPkgs.includes('AstraFlow.Mapper')) return 'MAPPER';
    if (selectedPkgs.includes('AstraFlow.Mediator')) return 'MEDIATOR';
    return 'CONTRACTS';
  })();

  const handlePlateClick = (plate: PlateName) => {
    setManualPlate(plate);
    const mappedPkg = PLATE_TO_PKG[plate];
    if (mappedPkg) {
      selectAndEnsurePackage(mappedPkg);
    }
  };

  const mediatorActive = selectedPkgs.includes('AstraFlow.Mediator');
  const mapperActive = selectedPkgs.includes('AstraFlow.Mapper');

  return (
    <div
      className="overlap-scene v12-packages-scene hairline-ivory"
      data-active-plate={derivedPlate ?? 'none'}
      data-stack-size={String(selectedPkgs.length)}
      style={HAIRLINE_IVORY_STYLE}
    >
      <div className="geo-grid" />

      {/* Isometric connection spine linking selected hero plates */}
      <svg
        aria-hidden="true"
        className="v12-hero-connector-svg"
        viewBox="0 0 600 480"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <motion.path
          d="M 195 140 L 290 232"
          fill="none"
          stroke="#e96843"
          strokeDasharray="4 5"
          strokeWidth="1.8"
          initial={false}
          animate={{
            pathLength: hasInteracted && mediatorActive ? 1 : 0,
            opacity: hasInteracted && mediatorActive ? 0.85 : 0,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
          }
        />
        <motion.path
          d="M 290 232 L 385 325"
          fill="none"
          stroke="#e96843"
          strokeDasharray="4 5"
          strokeWidth="1.8"
          initial={false}
          animate={{
            pathLength: hasInteracted && mapperActive ? 1 : 0,
            opacity: hasInteracted && mapperActive ? 0.85 : 0,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
          }
        />
      </svg>

      <span className="scene-tag tiny">ISOMETRIC / PACKAGE COMPOSITION</span>

      {PLATES.map((plate) => {
        const isSelected = derivedPlate === plate;
        return (
          <button
            key={plate}
            type="button"
            className={`plate${isSelected ? ' selected' : ''}`}
            aria-pressed={isSelected}
            onClick={() => handlePlateClick(plate)}
          >
            {isSelected && (
              <motion.span
                aria-hidden="true"
                layoutId="packages-hero-focal-dot"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                        mass: 0.7,
                      }
                }
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '16px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'var(--signal)',
                  boxShadow: '0 0 0 4px rgba(242, 94, 59, 0.18)',
                  pointerEvents: 'none',
                }}
              />
            )}
            {plate}
          </button>
        );
      })}

      <span className="scene-tag2 tiny">EACH PACKAGE STANDS ON ITS OWN</span>
    </div>
  );
}

export default PackagesHeroAssembly;
