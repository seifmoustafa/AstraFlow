'use client';

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { HAIRLINE_IVORY_STYLE } from '@/components/motion/HairlineFigures';
import {
  COMPOSER_OPTIONS,
  ComposerPackageOption,
  usePackageStack,
} from './PackageStackContext';

export { COMPOSER_OPTIONS };
export type { ComposerPackageOption };

/**
 * Computes the vertical center Y coordinate (in viewBox 0..540 x 0..210)
 * for each plate in the active isometric stack so adding/removing a package
 * smoothly re-centers and interlocks all active plates.
 */
function getStackPlateY(index: number, total: number): number {
  const centerY = 108;
  const step =
    total <= 1 ? 0 : total === 2 ? 34 : total === 3 ? 29 : total === 4 ? 24 : 20;
  const startY = centerY - ((total - 1) * step) / 2;
  return startY + index * step;
}

export function PackageComposer() {
  const {
    selectedPkgs,
    focusedPkgId,
    togglePackage,
    focusPackage,
  } = usePackageStack();

  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'fallback'>(
    'idle'
  );
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const prefersReducedMotion = useReducedMotion();

  const stackCountText = `${selectedPkgs.length} package${
    selectedPkgs.length === 1 ? '' : 's'
  } selected.`;

  const installCommands =
    selectedPkgs.length > 0
      ? selectedPkgs.map((n) => `dotnet add package ${n}`).join('\n')
      : '# Select a focused package from the list';

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(installCommands);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 1400);
    } catch {
      setCopyStatus('fallback');
      setTimeout(() => setCopyStatus('idle'), 1400);
    }
  };

  const handleOptionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    let nextIdx: number | null = null;
    if (event.key === 'ArrowDown') {
      nextIdx = (idx + 1) % COMPOSER_OPTIONS.length;
    } else if (event.key === 'ArrowUp') {
      nextIdx = (idx + COMPOSER_OPTIONS.length - 1) % COMPOSER_OPTIONS.length;
    } else if (event.key === 'Home') {
      nextIdx = 0;
    } else if (event.key === 'End') {
      nextIdx = COMPOSER_OPTIONS.length - 1;
    }

    if (nextIdx !== null) {
      event.preventDefault();
      const targetOpt = COMPOSER_OPTIONS[nextIdx];
      if (targetOpt) {
        focusPackage(targetOpt.id);
        optionRefs.current[nextIdx]?.focus();
      }
    }
  };

  const buttonText =
    copyStatus === 'copied'
      ? 'Copied! '
      : copyStatus === 'fallback'
      ? 'Select text to copy '
      : 'Copy commands ';

  // Active package metadata in canonical architectural stratum order
  const selectedOptions = COMPOSER_OPTIONS.filter((opt) =>
    selectedPkgs.includes(opt.id)
  );
  // Render bottom-to-top in SVG so upper plates naturally occlude lower plates without z-index glitches
  const paintOrderedPlates = selectedOptions
    .map((opt, idx) => ({
      opt,
      stackIndex: idx,
      targetY: getStackPlateY(idx, selectedOptions.length),
    }))
    .reverse();

  const focusedOption =
    COMPOSER_OPTIONS.find((opt) => opt.id === focusedPkgId) ??
    selectedOptions[0] ??
    COMPOSER_OPTIONS[0];

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 350, damping: 29, mass: 0.75 };

  return (
    <section className="editorial-panel" id="composer">
      <div className="site-wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">01 / THE ASSEMBLY BENCH</p>
            <h2>
              Your stack.
              <br />
              <span className="ital signal">Your decision.</span>
            </h2>
          </div>
          <p className="section-caption">
            The interface reacts to your choices. It is a configuration helper,
            not a visual code generator.
          </p>
        </div>
        <div className="finder">
          <div>
            <span className="tiny muted">CHOOSE ONLY WHAT YOU NEED</span>
            {COMPOSER_OPTIONS.map((option, idx) => {
              const isSelected = selectedPkgs.includes(option.id);
              const isFocused = focusedPkgId === option.id;
              return (
                <button
                  key={option.id}
                  ref={(el) => {
                    optionRefs.current[idx] = el;
                  }}
                  type="button"
                  aria-pressed={isSelected}
                  className="finder-option"
                  data-pkg={option.id}
                  data-focused={isFocused ? 'true' : 'false'}
                  onClick={() => togglePackage(option.id)}
                  onFocus={() => focusPackage(option.id)}
                  onMouseEnter={() => focusPackage(option.id)}
                  onKeyDown={(e) => handleOptionKeyDown(e, idx)}
                  style={{ position: 'relative' }}
                >
                  {isFocused && (
                    <motion.span
                      aria-hidden="true"
                      className="v12-finder-focus-bar"
                      layoutId="composer-picker-focus-bar"
                      transition={springTransition}
                      style={{
                        position: 'absolute',
                        insetBlock: '6px',
                        insetInlineStart: '-8px',
                        width: '3px',
                        borderRadius: '2px',
                        background: 'var(--signal)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  <span>
                    {option.label}{' '}
                    <span className="tiny muted">{option.sublabel}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="tiny mono"
                    style={{
                      marginLeft: 'auto',
                      fontSize: '9px',
                      color: isSelected ? 'var(--action)' : 'var(--muted)',
                      opacity: isSelected ? 0.95 : 0.55,
                    }}
                  >
                    {option.stratumCode}
                  </span>
                </button>
              );
            })}

            {/* Connected Isometric Stack Assembly Bench */}
            <div
              aria-label="Assembled isometric package stack"
              className="v12-composer-assembly hairline-ivory"
              data-stack-count={String(selectedOptions.length)}
              data-focused-pkg={focusedPkgId}
              id="composer-stack-assembly"
              role="region"
              style={{
                ...HAIRLINE_IVORY_STYLE,
                marginTop: '18px',
                padding: '12px 14px 10px',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                background: 'var(--paper)',
                position: 'relative',
              }}
            >
              <div
                className="mono tiny"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: 'var(--muted)',
                  marginBottom: '4px',
                  fontSize: '9px',
                }}
              >
                <span>STACK ASSEMBLY / ISOMETRIC AXIS</span>
                <span style={{ color: 'var(--action)' }}>
                  FOCAL: {focusedOption.shortTag}
                </span>
              </div>

              <svg
                aria-label={`Isometric stack assembly containing ${selectedOptions.length} selected package plates`}
                className="v12-stack-assembly-svg hairline-ivory"
                role="img"
                viewBox="0 0 540 196"
                style={{
                  ...HAIRLINE_IVORY_STYLE,
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  maxHeight: '180px',
                  overflow: 'visible',
                }}
              >
                {/* Isometric construction grid & vertical optical spine */}
                <g
                  fill="none"
                  opacity="0.38"
                  stroke="#90a89b"
                  strokeWidth="1"
                >
                  <path d="M 35 108 L 245 20 L 455 108 L 245 188 Z" />
                  <path
                    d="M 245 12 V 188 M 20 108 H 520"
                    strokeDasharray="3 6"
                  />
                </g>

                {/* Vertical connector spine between top and bottom selected plates */}
                {selectedOptions.length > 1 && (
                  <motion.line
                    x1="245"
                    x2="245"
                    initial={false}
                    animate={{
                      y1: getStackPlateY(0, selectedOptions.length),
                      y2: getStackPlateY(
                        selectedOptions.length - 1,
                        selectedOptions.length
                      ),
                    }}
                    transition={springTransition}
                    stroke="#e96843"
                    strokeDasharray="3 4"
                    strokeWidth="1.8"
                  />
                )}

                {/* Empty state footprint when 0 packages selected */}
                {selectedOptions.length === 0 && (
                  <g transform="translate(0, 108)">
                    <path
                      d="M 115 0 L 245 -24 L 375 0 L 245 24 Z"
                      fill="none"
                      stroke="#81998c"
                      strokeDasharray="4 6"
                      strokeWidth="1.4"
                    />
                    <text
                      x="245"
                      y="4"
                      textAnchor="middle"
                      fill="#617267"
                      fontFamily="monospace"
                      fontSize="10"
                    >
                      SELECT A PACKAGE TO ASSEMBLE
                    </text>
                  </g>
                )}

                {/* Dynamic interlocking package plates */}
                <AnimatePresence initial={false}>
                  {paintOrderedPlates.map(({ opt, stackIndex, targetY }) => {
                    const isPlateFocused = focusedPkgId === opt.id;
                    const yPos = isPlateFocused ? targetY - 3 : targetY;
                    const xOffset = isPlateFocused ? -5 : 0;

                    return (
                      <motion.g
                        key={opt.id}
                        className="v12-stack-plate-group"
                        data-stack-plate={opt.id}
                        data-stack-index={String(stackIndex)}
                        data-focused={String(isPlateFocused)}
                        initial={
                          prefersReducedMotion
                            ? false
                            : { opacity: 0, y: targetY - 18, x: 0 }
                        }
                        animate={{
                          opacity: 1,
                          y: yPos,
                          x: xOffset,
                        }}
                        exit={
                          prefersReducedMotion
                            ? { opacity: 0 }
                            : {
                                opacity: 0,
                                y: targetY + 14,
                                transition: { duration: 0.16 },
                              }
                        }
                        transition={springTransition}
                        onClick={() => focusPackage(opt.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Drop shadow plate */}
                        <path
                          d="M 115 0 L 245 -24 L 375 0 L 245 24 Z"
                          fill="#082c26"
                          opacity={isPlateFocused ? '0.16' : '0.09'}
                          transform="translate(5, 7)"
                        />
                        {/* Opaque isometric plate surface (--hairline-plate compatible) */}
                        <path
                          d="M 115 0 L 245 -24 L 375 0 L 245 24 Z"
                          fill={opt.plateFill}
                          stroke={isPlateFocused ? '#f25e3b' : opt.plateStroke}
                          strokeWidth={isPlateFocused ? '2.1' : '1.5'}
                        />
                        {/* Inner dashed technical keyline */}
                        <path
                          d="M 155 0 L 245 -16 L 335 0 L 245 16 Z"
                          fill="none"
                          stroke={isPlateFocused ? '#f25e3b' : opt.innerStroke}
                          strokeDasharray="4 5"
                          strokeWidth="0.9"
                        />
                        {/* Plate label */}
                        <text
                          x="245"
                          y="4"
                          textAnchor="middle"
                          fill={opt.plateText}
                          fontFamily="monospace"
                          fontSize="11"
                          fontWeight="700"
                        >
                          {opt.shortTag}
                        </text>

                        {/* Shared focal connector rule to CLI output */}
                        {isPlateFocused && (
                          <g pointerEvents="none">
                            <line
                              x1="375"
                              y1="0"
                              x2="522"
                              y2="0"
                              stroke="#f25e3b"
                              strokeDasharray="3 4"
                              strokeWidth="1.5"
                            />
                            <circle
                              cx="375"
                              cy="0"
                              r="3.5"
                              fill="#f25e3b"
                            />
                            <rect
                              x="432"
                              y="-15"
                              width="88"
                              height="12"
                              rx="2"
                              fill="#f7f3eb"
                            />
                            <text
                              x="520"
                              y="-6"
                              textAnchor="end"
                              fill="#b73921"
                              fontFamily="monospace"
                              fontSize="8.5"
                              fontWeight="700"
                            >
                              {opt.stratumCode}
                            </text>
                          </g>
                        )}
                      </motion.g>
                    );
                  })}
                </AnimatePresence>
              </svg>
            </div>
          </div>

          <div className="finder-code">
            <div className="frame-dots" style={{ marginBottom: '25px' }}>
              <i />
              <i />
              <i />
            </div>
            <span className="tiny">INSTALL_PLAN.sh / NuGet CLI</span>
            <h3 id="stack-count" aria-live="polite">
              {stackCountText}
            </h3>
            <pre id="install-commands" dir="ltr">
              {selectedPkgs.length > 0
                ? selectedPkgs.map((pkgId, idx) => {
                    const isFocused = focusedPkgId === pkgId;
                    return (
                      <React.Fragment key={pkgId}>
                        <span
                          data-cmd-pkg={pkgId}
                          data-cmd-focused={isFocused ? 'true' : 'false'}
                          onClick={() => focusPackage(pkgId)}
                          style={{
                            display: 'inline-block',
                            width: '100%',
                            paddingInline: '6px',
                            marginInline: '-6px',
                            borderRadius: '3px',
                            background: isFocused
                              ? 'rgba(242, 94, 59, 0.16)'
                              : 'transparent',
                            borderInlineStart: isFocused
                              ? '2px solid #f25e3b'
                              : '2px solid transparent',
                            color: isFocused ? '#ffffff' : undefined,
                            cursor: 'pointer',
                            transition: 'background-color 160ms ease',
                          }}
                        >{`dotnet add package ${pkgId}`}</span>
                        {idx < selectedPkgs.length - 1 ? '\n' : ''}
                      </React.Fragment>
                    );
                  })
                : '# Select a focused package from the list'}
            </pre>
            <p className="finder-copy">
              Version deliberately omitted: use the published version
              appropriate for your target and package ID.
            </p>
            <button
              type="button"
              className="button button-primary"
              id="copy-install"
              onClick={handleCopy}
            >
              {buttonText}
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PackageComposer;
