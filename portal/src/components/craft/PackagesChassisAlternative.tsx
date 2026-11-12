'use client';

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { HAIRLINE_IVORY_STYLE } from '@/components/motion/HairlineFigures';

export interface ChassisModule {
  id: string;
  name: string;
  role: string;
  bayNumber: string;
  description: string;
  busColor: string;
  pinCount: number;
  apiSample: string;
}

export const CHASSIS_MODULES: readonly ChassisModule[] = [
  {
    id: 'AstraFlow.Contracts',
    name: 'Contracts',
    role: 'FOUNDATION BUS',
    bayNumber: 'BAY 01',
    description: 'Shared interfaces and request/notification contracts without infrastructure overhead.',
    busColor: '#365d51',
    pinCount: 8,
    apiSample: 'IRequest<TResponse>, INotification',
  },
  {
    id: 'AstraFlow.Mediator',
    name: 'Mediator',
    role: 'DISPATCH CORE',
    bayNumber: 'BAY 02',
    description: 'Pipeline execution, handler discovery, and request/notification dispatching.',
    busColor: '#0a3d33',
    pinCount: 16,
    apiSample: 'IMediator, IPipelineBehavior<TReq, TRes>',
  },
  {
    id: 'AstraFlow.Mapper',
    name: 'Mapper',
    role: 'TRANSFORM MATRIX',
    bayNumber: 'BAY 03',
    description: 'Explicit, compile-time verified mapping rules and projection configuration.',
    busColor: '#c14a2b',
    pinCount: 12,
    apiSample: 'IDeclaredObjectMappingRule, IObjectMapper',
  },
  {
    id: 'AstraFlow.Diagnostics',
    name: 'Diagnostics',
    role: 'OBSERVABILITY PROBE',
    bayNumber: 'BAY 04',
    description: 'Registration analysis, circular dependency verification, and report generators.',
    busColor: '#62766b',
    pinCount: 10,
    apiSample: 'IAstraFlowDiagnosticsReporter',
  },
  {
    id: 'AstraFlow.Testing',
    name: 'Testing',
    role: 'VERIFICATION HARNESS',
    bayNumber: 'BAY 05',
    description: 'Runner-neutral test fixtures, assertions, and in-memory test dispatchers.',
    busColor: '#b73921',
    pinCount: 8,
    apiSample: 'MediatorTestHost, AssertionScope',
  },
];

/**
 * Alternative 1: The Modular Sockets Chassis
 * A horizontal open-frame mechanical bus with 5 dedicated socket bays.
 * Modules snap into their bay with illuminated contact pins and live terminal link.
 */
export function PackagesChassisAlternative() {
  const [dockedModuleIds, setDockedModuleIds] = useState<string[]>([
    'AstraFlow.Contracts',
    'AstraFlow.Mediator',
  ]);
  const [focalModuleId, setFocalModuleId] = useState<string>('AstraFlow.Mediator');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const prefersReducedMotion = useReducedMotion();
  const bayRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const toggleDock = (id: string) => {
    setDockedModuleIds((prev) => {
      const isDocked = prev.includes(id);
      const next = isDocked ? prev.filter((item) => item !== id) : [...prev, id];
      setFocalModuleId(id);
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % CHASSIS_MODULES.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index + CHASSIS_MODULES.length - 1) % CHASSIS_MODULES.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = CHASSIS_MODULES.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const target = CHASSIS_MODULES[nextIndex];
      if (target) {
        setFocalModuleId(target.id);
        bayRefs.current[nextIndex]?.focus();
      }
    }
  };

  const focalModule =
    CHASSIS_MODULES.find((m) => m.id === focalModuleId) ?? CHASSIS_MODULES[1];

  const installCommands =
    dockedModuleIds.length > 0
      ? dockedModuleIds.map((id) => `dotnet add package ${id}`).join('\n')
      : '# No packages docked in chassis';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(installCommands);
        setCopyState('copied');
        setTimeout(() => setCopyState('idle'), 1400);
      }
    } catch {}
  };

  const spring = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 30, mass: 0.7 };

  return (
    <div
      className="chassis-machine-root hairline-ivory"
      data-concept="modular-sockets-chassis"
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
            ALTERNATIVE A / MODULAR CHASSIS
          </span>
          <h3 style={{ margin: '4px 0 0', fontSize: '20px', letterSpacing: '-0.04em' }}>
            The Hardware Sockets Engine
          </h3>
        </div>
        <span className="tiny mono" style={{ color: 'var(--muted)' }}>
          {dockedModuleIds.length} / {CHASSIS_MODULES.length} BAYS ENGAGED
        </span>
      </div>

      {/* 5 Socket Bays */}
      <div
        role="group"
        aria-label="Modular package chassis bays"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {CHASSIS_MODULES.map((module, idx) => {
          const isDocked = dockedModuleIds.includes(module.id);
          const isFocal = focalModuleId === module.id;

          return (
            <button
              key={module.id}
              ref={(el) => {
                bayRefs.current[idx] = el;
              }}
              type="button"
              aria-pressed={isDocked}
              data-docked={String(isDocked)}
              data-focal={String(isFocal)}
              onClick={() => toggleDock(module.id)}
              onFocus={() => setFocalModuleId(module.id)}
              onMouseEnter={() => setFocalModuleId(module.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{
                position: 'relative',
                padding: '16px 12px 14px',
                background: isDocked ? 'var(--paper)' : 'rgba(236, 229, 217, 0.4)',
                border: isFocal ? '2px solid var(--signal)' : '1px solid var(--line)',
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background-color 0.2s, border-color 0.2s, transform 0.2s',
                transform: isDocked ? 'translateY(-3px)' : 'none',
              }}
            >
              {isFocal && (
                <motion.span
                  layoutId="chassis-focal-indicator"
                  transition={spring}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '12px',
                    right: '12px',
                    height: '2px',
                    background: 'var(--signal)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <span className="tiny mono" style={{ color: 'var(--muted)', fontSize: '9px' }}>
                  {module.bayNumber}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: isDocked ? 'var(--signal)' : '#9eb0a5',
                    boxShadow: isDocked ? '0 0 6px rgba(242, 94, 59, 0.5)' : 'none',
                    transition: 'background-color 0.2s',
                  }}
                />
              </div>

              <strong
                style={{
                  display: 'block',
                  fontSize: '14px',
                  letterSpacing: '-0.03em',
                  color: isDocked ? 'var(--ink)' : 'var(--muted)',
                  marginBottom: '4px',
                }}
              >
                {module.name}
              </strong>
              <span
                className="tiny mono"
                style={{
                  display: 'block',
                  color: isDocked ? 'var(--action)' : 'var(--muted)',
                  fontSize: '8.5px',
                  marginBottom: '12px',
                }}
              >
                {module.role}
              </span>

              {/* Pin contact socket visualization */}
              <div
                style={{
                  display: 'flex',
                  gap: '3px',
                  paddingTop: '8px',
                  borderTop: '1px dashed var(--line)',
                }}
              >
                {Array.from({ length: 6 }).map((_, pIdx) => (
                  <span
                    key={pIdx}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '1px',
                      background: isDocked ? '#e98a66' : '#d8d0c2',
                      transition: 'background-color 0.24s',
                    }}
                  />
                ))}
              </div>

              <div
                style={{
                  marginTop: '10px',
                  fontSize: '10px',
                  color: isDocked ? 'var(--action)' : 'var(--muted)',
                  fontWeight: 'bold',
                }}
              >
                {isDocked ? 'DOCKED ✓' : '+ CLICK TO DOCK'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Lower Instrument Plane: Active Module Spec + Real Terminal */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '20px',
          alignItems: 'stretch',
        }}
      >
        {/* Module Spec Panel */}
        <div
          style={{
            padding: '16px',
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: '6px',
          }}
        >
          <div className="tiny mono" style={{ color: 'var(--action)', marginBottom: '6px' }}>
            SELECTED MODULE INSPECTION
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: '17px', letterSpacing: '-0.03em' }}>
            {focalModule.id}
          </h4>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
            {focalModule.description}
          </p>
          <div
            style={{
              padding: '8px 10px',
              background: 'rgba(8, 44, 38, 0.05)',
              borderRadius: '4px',
              borderLeft: '2px solid var(--signal)',
            }}
          >
            <span className="tiny mono" style={{ display: 'block', color: 'var(--ink)' }}>
              CORE APIS:
            </span>
            <code style={{ fontSize: '11px', color: 'var(--ink2)', fontFamily: 'monospace' }}>
              {focalModule.apiSample}
            </code>
          </div>
        </div>

        {/* Live Terminal Output */}
        <div
          style={{
            background: 'var(--ink)',
            color: '#ddf1dc',
            borderRadius: '6px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--peach)',
                fontSize: '10px',
                fontFamily: 'monospace',
                marginBottom: '10px',
              }}
            >
              <span>CLI_SOCKET_BUS.sh</span>
              <span>{dockedModuleIds.length} PACKAGES</span>
            </div>
            <pre
              dir="ltr"
              style={{
                margin: 0,
                fontSize: '11px',
                lineHeight: '1.7',
                fontFamily: 'Courier New, monospace',
                whiteSpace: 'pre-wrap',
                color: '#c8ebd9',
              }}
            >
              {installCommands}
            </pre>
          </div>
          <button
            type="button"
            className="button button-primary"
            onClick={handleCopy}
            style={{
              marginTop: '12px',
              minHeight: '36px',
              padding: '6px 14px',
              fontSize: '12px',
              alignSelf: 'flex-start',
            }}
          >
            {copyState === 'copied' ? 'COPIED ✓' : 'COPY COMMANDS ↗'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PackagesChassisAlternative;
