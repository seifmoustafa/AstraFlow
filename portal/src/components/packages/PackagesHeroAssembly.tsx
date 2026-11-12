'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { HAIRLINE_IVORY_STYLE } from '@/components/motion/HairlineFigures';
import {
  COMPOSER_OPTIONS,
  usePackageStack,
  ComposerPackageOption,
} from './PackageStackContext';

/**
 * Spatial coordinate map for the 5 modular package bays within the
 * Purpose-Built Composition Machine (viewBox="0 0 680 440").
 */
interface BayGeometry {
  socketX: number;
  socketY: number;
  width: number;
  height: number;
  labelX: number;
  labelY: number;
}

const BAY_GEOMETRIES: Record<string, BayGeometry> = {
  'AstraFlow.Mediator': {
    socketX: 200,
    socketY: 70,
    width: 280,
    height: 64,
    labelX: 340,
    labelY: 108,
  },
  'AstraFlow.Mapper': {
    socketX: 140,
    socketY: 155,
    width: 280,
    height: 64,
    labelX: 280,
    labelY: 193,
  },
  'AstraFlow.Diagnostics': {
    socketX: 260,
    socketY: 240,
    width: 280,
    height: 64,
    labelX: 400,
    labelY: 278,
  },
  'AstraFlow.Testing': {
    socketX: 80,
    socketY: 325,
    width: 260,
    height: 64,
    labelX: 210,
    labelY: 363,
  },
  'AstraFlow.Generators': {
    socketX: 360,
    socketY: 325,
    width: 260,
    height: 64,
    labelX: 490,
    labelY: 363,
  },
};

/**
 * Radical Rebuild: Purpose-Built Composition Machine
 * Replaces the 3 tilted generic cards with an open-frame modular docking instrument.
 * Real packages snap into dedicated chassis sockets with illuminated gold pins,
 * structural bus lines, and tactile latch states.
 */
export function PackagesHeroAssembly() {
  const {
    selectedPkgs,
    focusedPkgId,
    togglePackage,
    focusPackage,
  } = usePackageStack();

  const prefersReducedMotion = useReducedMotion();
  const plateRefs = useRef<Array<HTMLButtonElement | null>>([]);

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

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % COMPOSER_OPTIONS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index + COMPOSER_OPTIONS.length - 1) % COMPOSER_OPTIONS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = COMPOSER_OPTIONS.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const targetOpt = COMPOSER_OPTIONS[nextIndex];
      if (targetOpt) {
        focusPackage(targetOpt.id);
        plateRefs.current[nextIndex]?.focus();
      }
    }
  };

  const spring = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 360, damping: 28, mass: 0.75 };

  return (
    <div
      className="overlap-scene v12-packages-scene hairline-ivory composition-machine-scene"
      data-testid="packages-composition-machine"
      style={{
        ...HAIRLINE_IVORY_STYLE,
        position: 'relative',
        minHeight: '460px',
        background: 'transparent',
      }}
    >
      <div className="geo-grid" />

      {/* Machine Head Telemetry */}
      <div
        className="scene-tag tiny mono"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '94%',
          left: '3%',
          top: '3%',
          color: 'var(--muted)',
          zIndex: 4,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--signal)',
              boxShadow: '0 0 6px rgba(242, 94, 59, 0.4)',
            }}
          />
          COMPOSITION MACHINE // CHASSIS 01
        </span>
        <span style={{ color: 'var(--action)' }}>
          {selectedPkgs.length} / {COMPOSER_OPTIONS.length} MODULES DOCKED
        </span>
      </div>

      {/* Open Engineered SVG Machine Chassis */}
      <svg
        aria-label="Modular package composition machine showing docked and undocked packages"
        className="v12-composition-machine-svg"
        viewBox="0 0 680 440"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          overflow: 'visible',
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* Chassis Motherboard & Construction Lines */}
        <g stroke="#90a89b" strokeWidth="1" opacity="0.35" fill="none">
          {/* Main frame border */}
          <rect x="40" y="45" width="600" height="360" rx="8" strokeDasharray="4 6" />
          {/* Central bus conduit */}
          <line x1="340" y1="45" x2="340" y2="405" strokeDasharray="2 4" strokeWidth="1.5" />
          <line x1="40" y1="225" x2="640" y2="225" strokeDasharray="2 4" />
          {/* Sockets alignment axes */}
          <circle cx="340" cy="102" r="16" />
          <circle cx="280" cy="187" r="16" />
          <circle cx="400" cy="272" r="16" />
        </g>

        {/* Dynamic Bus Traces connecting docked packages */}
        <g className="chassis-bus-traces" fill="none" strokeWidth="2">
          {selectedPkgs.includes('AstraFlow.Mediator') &&
            selectedPkgs.includes('AstraFlow.Mapper') && (
              <motion.path
                d="M 340 102 L 280 187"
                stroke="#f25e3b"
                strokeDasharray="4 4"
                initial={false}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={spring}
              />
            )}
          {selectedPkgs.includes('AstraFlow.Mediator') &&
            selectedPkgs.includes('AstraFlow.Diagnostics') && (
              <motion.path
                d="M 340 102 L 400 272"
                stroke="#f25e3b"
                strokeDasharray="4 4"
                initial={false}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={spring}
              />
            )}
          {selectedPkgs.includes('AstraFlow.Mapper') &&
            selectedPkgs.includes('AstraFlow.Generators') && (
              <motion.path
                d="M 280 187 L 490 357"
                stroke="#f25e3b"
                strokeDasharray="4 4"
                initial={false}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={spring}
              />
            )}
          {selectedPkgs.includes('AstraFlow.Mediator') &&
            selectedPkgs.includes('AstraFlow.Testing') && (
              <motion.path
                d="M 340 102 L 210 357"
                stroke="#f25e3b"
                strokeDasharray="4 4"
                initial={false}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={spring}
              />
            )}
        </g>

        {/* Empty Socket Footprints */}
        {COMPOSER_OPTIONS.map((opt) => {
          const geo = BAY_GEOMETRIES[opt.id];
          if (!geo) return null;
          const isDocked = selectedPkgs.includes(opt.id);

          return (
            <g key={`socket-${opt.id}`} opacity={isDocked ? 0.35 : 0.85}>
              <rect
                x={geo.socketX}
                y={geo.socketY}
                width={geo.width}
                height={geo.height}
                rx="6"
                fill="rgba(236, 229, 217, 0.25)"
                stroke="#90a89b"
                strokeDasharray="4 5"
                strokeWidth="1.2"
              />
              {!isDocked && (
                <text
                  x={geo.labelX}
                  y={geo.labelY}
                  textAnchor="middle"
                  fill="#7a8c80"
                  fontFamily="monospace"
                  fontSize="10"
                  letterSpacing="0.08em"
                >
                  [ OPEN BAY: {opt.shortTag} ]
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Interactive Modular Plates (Rendered as accessible button elements) */}
      <div
        role="group"
        aria-label="Modular package plates in composition machine"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {COMPOSER_OPTIONS.map((opt, idx) => {
          const geo = BAY_GEOMETRIES[opt.id];
          if (!geo) return null;
          const isDocked = selectedPkgs.includes(opt.id);
          const isFocal = focusedPkgId === opt.id;

          // Spatial positions: docked rests in its bay; undocked floats slightly offset with dashed border
          const leftPercent = (geo.socketX / 680) * 100;
          const topPercent = (geo.socketY / 440) * 100;
          const widthPercent = (geo.width / 680) * 100;
          const heightPercent = (geo.height / 440) * 100;

          return (
            <button
              key={opt.id}
              ref={(el) => {
                plateRefs.current[idx] = el;
              }}
              type="button"
              className={`plate composition-plate${isDocked ? ' selected' : ''}`}
              aria-pressed={isDocked}
              data-pkg={opt.id}
              data-docked={String(isDocked)}
              data-focal={String(isFocal)}
              onClick={() => togglePackage(opt.id)}
              onFocus={() => focusPackage(opt.id)}
              onMouseEnter={() => focusPackage(opt.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                pointerEvents: 'auto',
                padding: '10px 14px',
                borderRadius: '6px',
                background: isDocked ? opt.plateFill : 'rgba(247, 243, 235, 0.65)',
                border: isFocal
                  ? '2px solid var(--signal)'
                  : isDocked
                  ? `1.5px solid ${opt.plateStroke}`
                  : '1px dashed #a0b2a7',
                color: isDocked ? opt.plateText : 'var(--muted)',
                boxShadow: isDocked
                  ? '0 8px 24px rgba(8, 44, 38, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : 'none',
                transform: isDocked ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.97)',
                opacity: isDocked ? 1 : 0.65,
                transition:
                  'transform 0.28s var(--ease), opacity 0.24s, background-color 0.2s, border-color 0.2s, box-shadow 0.28s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                zIndex: isFocal ? 5 : isDocked ? 3 : 1,
              }}
            >
              {/* Latch Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  className="tiny mono"
                  style={{
                    fontSize: '9px',
                    color: isDocked && opt.id === 'AstraFlow.Mediator' ? '#aad1c0' : 'var(--action)',
                    fontWeight: 700,
                  }}
                >
                  {opt.stratumCode}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '8.5px',
                    fontFamily: 'monospace',
                    color: isDocked ? (opt.id === 'AstraFlow.Mediator' ? '#fff' : 'var(--ink)') : 'var(--muted)',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: isDocked ? 'var(--signal)' : '#9eb0a5',
                    }}
                  />
                  {isDocked ? 'SLOTTED' : 'DETACHED'}
                </span>
              </div>

              {/* Module Name & Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong
                  style={{
                    fontSize: '14px',
                    letterSpacing: '-0.02em',
                    color: isDocked ? opt.plateText : 'var(--ink)',
                  }}
                >
                  {opt.label}
                </strong>
                <span
                  className="tiny muted"
                  style={{
                    fontSize: '10px',
                    color: isDocked && opt.id === 'AstraFlow.Mediator' ? '#c2dac9' : undefined,
                  }}
                >
                  {opt.sublabel}
                </span>
              </div>

              {/* Gold Contact Pins Visualization */}
              <div
                style={{
                  display: 'flex',
                  gap: '3px',
                  paddingTop: '4px',
                  borderTop: isDocked ? '1px solid rgba(255,255,255,0.15)' : '1px dashed #d8d0c2',
                }}
              >
                {Array.from({ length: 8 }).map((_, p) => (
                  <span
                    key={p}
                    style={{
                      flex: 1,
                      height: '3px',
                      borderRadius: '1px',
                      background: isDocked ? '#e98a66' : '#c8c2b5',
                      opacity: isDocked ? 0.9 : 0.4,
                      transition: 'background-color 0.2s',
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Machine Footer Tag */}
      <span
        className="scene-tag2 tiny mono"
        style={{
          position: 'absolute',
          bottom: '2%',
          right: '3%',
          color: 'var(--muted)',
          zIndex: 4,
        }}
      >
        MODULAR CHASSIS // EACH MODULE STANDS ON ITS OWN
      </span>
    </div>
  );
}

export default PackagesHeroAssembly;
