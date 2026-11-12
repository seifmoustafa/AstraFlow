'use client';

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { HAIRLINE_IVORY_STYLE } from '@/components/motion/HairlineFigures';

export interface StratumLayer {
  id: string;
  name: string;
  elevation: string;
  layerCode: string;
  color: string;
  stroke: string;
  summary: string;
  contract: string;
}

export const STRATUM_LAYERS: readonly StratumLayer[] = [
  {
    id: 'AstraFlow.Contracts',
    name: 'Contracts Stratum',
    elevation: 'LEVEL 00 / BASE',
    layerCode: 'BASE_LAYER',
    color: '#eee0d1',
    stroke: '#365d51',
    summary: 'Immutable contracts that establish message envelopes and boundaries.',
    contract: 'IRequest<TResponse>, INotification, IStreamRequest<T>',
  },
  {
    id: 'AstraFlow.Mediator',
    name: 'Dispatch Stratum',
    elevation: 'LEVEL 01 / CORE',
    layerCode: 'DISPATCH_CORE',
    color: '#082c26',
    stroke: '#81aa95',
    summary: 'Central mediator engine coordinating handlers, pipelines, and notifications.',
    contract: 'IMediator, ISender, IPublisher, IPipelineBehavior',
  },
  {
    id: 'AstraFlow.Mapper',
    name: 'Projection Stratum',
    elevation: 'LEVEL 02 / ADAPT',
    layerCode: 'MAP_PROJECTION',
    color: '#fff9ed',
    stroke: '#c14a2b',
    summary: 'Explicit type projections that compile directly to high-throughput delegates.',
    contract: 'IObjectMapper, IDeclaredObjectMappingRule<TSource, TDest>',
  },
  {
    id: 'AstraFlow.Diagnostics',
    name: 'Inspection Stratum',
    elevation: 'LEVEL 03 / OBSERVE',
    layerCode: 'DIAG_PROBE',
    color: '#f5e6d7',
    stroke: '#e47b54',
    summary: 'Deep architectural verification, dependency graphs, and CLI health audits.',
    contract: 'IAstraFlowDiagnosticsReporter, AstraFlowDiagnosticReport',
  },
  {
    id: 'AstraFlow.Generators',
    name: 'Roslyn Stratum',
    elevation: 'LEVEL 04 / COMPILER',
    layerCode: 'CODEGEN_ROSLYN',
    color: '#ffd2bd',
    stroke: '#b73921',
    summary: 'Compile-time source generation for zero-reflection mapper execution.',
    contract: 'AstraFlowExecutableMapperGenerator',
  },
];

/**
 * Alternative 2: The Isometric Stratum Weaver
 * A vertical architectural column where each package represents an independent
 * stratum layer with precision contact feet and isometric connector rails.
 */
export function PackagesStratumAlternative() {
  const [activeLayerIds, setActiveLayerIds] = useState<string[]>([
    'AstraFlow.Contracts',
    'AstraFlow.Mediator',
    'AstraFlow.Mapper',
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('AstraFlow.Mediator');
  const [copied, setCopied] = useState<boolean>(false);
  const prefersReducedMotion = useReducedMotion();
  const layerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const toggleLayer = (id: string) => {
    setActiveLayerIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      setSelectedLayerId(id);
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowDown') {
      nextIndex = (index + 1) % STRATUM_LAYERS.length;
    } else if (e.key === 'ArrowUp') {
      nextIndex = (index + STRATUM_LAYERS.length - 1) % STRATUM_LAYERS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = STRATUM_LAYERS.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const target = STRATUM_LAYERS[nextIndex];
      if (target) {
        setSelectedLayerId(target.id);
        layerRefs.current[nextIndex]?.focus();
      }
    }
  };

  const selectedLayer =
    STRATUM_LAYERS.find((l) => l.id === selectedLayerId) ?? STRATUM_LAYERS[1];

  const installCommands =
    activeLayerIds.length > 0
      ? activeLayerIds.map((id) => `dotnet add package ${id}`).join('\n')
      : '# No strata engaged in column';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(installCommands);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }
    } catch {}
  };

  const spring = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 360, damping: 28, mass: 0.75 };

  return (
    <div
      className="stratum-machine-root hairline-ivory"
      data-concept="isometric-stratum-weaver"
      style={{
        ...HAIRLINE_IVORY_STYLE,
        border: '1px solid var(--line)',
        borderRadius: '8px',
        background: 'var(--paper2)',
        padding: '24px',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderBottom: '1px solid var(--line)',
          paddingBottom: '14px',
          marginBottom: '20px',
        }}
      >
        <div>
          <span className="tiny mono" style={{ color: 'var(--action)' }}>
            ALTERNATIVE B / STRATUM WEAVER
          </span>
          <h3 style={{ margin: '4px 0 0', fontSize: '20px', letterSpacing: '-0.04em' }}>
            The Vertical Stratum Column
          </h3>
        </div>
        <span className="tiny mono" style={{ color: 'var(--muted)' }}>
          {activeLayerIds.length} ACTIVE ARCHITECTURAL STRATA
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) 1.2fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left: Interactive Stratum Selector */}
        <div role="group" aria-label="Stratum layers">
          <div className="tiny mono" style={{ color: 'var(--muted)', marginBottom: '8px' }}>
            SELECT STRATUM TO ENGAGE / DETACH
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {STRATUM_LAYERS.map((layer, idx) => {
              const isActive = activeLayerIds.includes(layer.id);
              const isSelected = selectedLayerId === layer.id;

              return (
                <button
                  key={layer.id}
                  ref={(el) => {
                    layerRefs.current[idx] = el;
                  }}
                  type="button"
                  aria-pressed={isActive}
                  data-active={String(isActive)}
                  data-selected={String(isSelected)}
                  onClick={() => toggleLayer(layer.id)}
                  onFocus={() => setSelectedLayerId(layer.id)}
                  onMouseEnter={() => setSelectedLayerId(layer.id)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: isSelected
                      ? '2px solid var(--signal)'
                      : '1px solid var(--line)',
                    background: isActive ? 'var(--paper)' : 'rgba(236, 229, 217, 0.3)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s, border-color 0.2s',
                  }}
                >
                  <div>
                    <span
                      className="tiny mono"
                      style={{
                        display: 'block',
                        color: isActive ? 'var(--action)' : 'var(--muted)',
                        fontSize: '9px',
                      }}
                    >
                      {layer.elevation}
                    </span>
                    <strong
                      style={{
                        fontSize: '14px',
                        color: isActive ? 'var(--ink)' : 'var(--muted)',
                      }}
                    >
                      {layer.name}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontFamily: 'monospace',
                        background: isActive ? 'var(--action)' : '#d8d0c2',
                        color: isActive ? '#fff' : '#617267',
                        fontWeight: 'bold',
                      }}
                    >
                      {isActive ? 'ENGAGED' : 'DETACHED'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Vertical Isometric Column Graphic + Command Sheet */}
        <div>
          <div
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              className="tiny mono"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--muted)',
                marginBottom: '8px',
              }}
            >
              <span>COLUMN VISUALIZATION / OPTICAL AXIS</span>
              <span style={{ color: 'var(--action)' }}>
                FOCAL: {selectedLayer.layerCode}
              </span>
            </div>

            {/* SVG Stratum Stack */}
            <svg
              viewBox="0 0 460 220"
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                maxHeight: '190px',
                overflow: 'visible',
              }}
            >
              <defs>
                <linearGradient id="stratum-glow" x1="0" x2="1" y1="0" y2="1">
                  <stop stopColor="#f25e3b" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#b73921" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Vertical Guide Axis */}
              <line
                x1="230"
                y1="10"
                x2="230"
                y2="210"
                stroke="#90a89b"
                strokeDasharray="3 5"
                strokeWidth="1.2"
              />

              {/* Render Strata in bottom-up architectural order */}
              {STRATUM_LAYERS.map((layer, idx) => {
                const isActive = activeLayerIds.includes(layer.id);
                const isSelected = selectedLayerId === layer.id;
                const baseY = 36 + idx * 36;
                const targetY = isSelected ? baseY - 4 : baseY;

                return (
                  <motion.g
                    key={layer.id}
                    animate={{
                      y: targetY,
                      opacity: isActive ? 1 : 0.28,
                    }}
                    transition={spring}
                    onClick={() => toggleLayer(layer.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Stratum Rhombus Base */}
                    <path
                      d="M 120 0 L 230 -16 L 340 0 L 230 16 Z"
                      fill={isActive ? layer.color : '#e0d8ca'}
                      stroke={isSelected ? '#f25e3b' : layer.stroke}
                      strokeWidth={isSelected ? '2.2' : '1.2'}
                    />
                    {/* Stratum Label */}
                    <text
                      x="230"
                      y="4"
                      textAnchor="middle"
                      fill={layer.id === 'AstraFlow.Mediator' && isActive ? '#fff' : '#082c26'}
                      fontFamily="monospace"
                      fontSize="9.5"
                      fontWeight="700"
                    >
                      {layer.layerCode}
                    </text>

                    {isSelected && (
                      <g pointerEvents="none">
                        <circle cx="120" cy="0" r="3.5" fill="#f25e3b" />
                        <line
                          x1="340"
                          y1="0"
                          x2="430"
                          y2="0"
                          stroke="#f25e3b"
                          strokeDasharray="2 3"
                          strokeWidth="1.2"
                        />
                        <text
                          x="430"
                          y="-3"
                          textAnchor="end"
                          fill="#b73921"
                          fontFamily="monospace"
                          fontSize="8"
                          fontWeight="bold"
                        >
                          ACTIVE FOCUS
                        </text>
                      </g>
                    )}
                  </motion.g>
                );
              })}
            </svg>
          </div>

          {/* Real-time CLI output */}
          <div
            style={{
              background: 'var(--ink)',
              color: '#ddf1dc',
              borderRadius: '6px',
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--peach)',
                fontSize: '9.5px',
                fontFamily: 'monospace',
                marginBottom: '8px',
              }}
            >
              <span>COLUMN_INSTALL_PLAN.sh</span>
              <span>{activeLayerIds.length} PACKAGES</span>
            </div>
            <pre
              dir="ltr"
              style={{
                margin: 0,
                fontSize: '11px',
                lineHeight: '1.6',
                fontFamily: 'Courier New, monospace',
                whiteSpace: 'pre-wrap',
                color: '#c8ebd9',
              }}
            >
              {installCommands}
            </pre>
            <button
              type="button"
              className="button button-primary"
              onClick={handleCopy}
              style={{
                marginTop: '10px',
                minHeight: '32px',
                padding: '4px 12px',
                fontSize: '11px',
              }}
            >
              {copied ? 'COPIED ✓' : 'COPY COMMANDS ↗'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackagesStratumAlternative;
