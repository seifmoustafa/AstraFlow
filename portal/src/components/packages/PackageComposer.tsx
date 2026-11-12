'use client';

import React, { useState } from 'react';

export interface ComposerPackageOption {
  id: string;
  label: string;
  sublabel: string;
}

export const COMPOSER_OPTIONS: ComposerPackageOption[] = [
  {
    id: 'AstraFlow.Mediator',
    label: 'Mediator',
    sublabel: 'requests + pipelines',
  },
  {
    id: 'AstraFlow.Mapper',
    label: 'Mapper',
    sublabel: 'explicit mapping',
  },
  {
    id: 'AstraFlow.Diagnostics',
    label: 'Diagnostics',
    sublabel: 'inspect registrations',
  },
  {
    id: 'AstraFlow.Testing',
    label: 'Testing',
    sublabel: 'focused test support',
  },
  {
    id: 'AstraFlow.Generators',
    label: 'Generators',
    sublabel: 'opt-in generated code',
  },
];

export function PackageComposer() {
  const [selectedPkgs, setSelectedPkgs] = useState<string[]>([
    'AstraFlow.Mediator',
  ]);
  const [copyStatus, setCopyStatus] = useState<
    'idle' | 'copied' | 'fallback'
  >('idle');

  const togglePackage = (pkgId: string) => {
    setSelectedPkgs((prev) =>
      prev.includes(pkgId)
        ? prev.filter((item) => item !== pkgId)
        : [...prev, pkgId]
    );
  };

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

  const buttonText =
    copyStatus === 'copied'
      ? 'Copied! '
      : copyStatus === 'fallback'
      ? 'Select text to copy '
      : 'Copy commands ';

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
            {COMPOSER_OPTIONS.map((option) => {
              const isSelected = selectedPkgs.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isSelected}
                  className="finder-option"
                  data-pkg={option.id}
                  onClick={() => togglePackage(option.id)}
                >
                  {option.label}{' '}
                  <span className="tiny muted">{option.sublabel}</span>
                </button>
              );
            })}
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
              {installCommands}
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
