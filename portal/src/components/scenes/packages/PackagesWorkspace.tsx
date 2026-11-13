'use client';

import { useState, type ReactNode } from 'react';
import {
  HeroStageEntrance,
  HeroTextReveal,
  MagneticButton,
} from '@/components/motion';
import type { AstraFlowPackage, ComposerPreset } from '@/lib/packages';
import { PackagesDirectory } from './PackagesDirectory';
import {
  PackagesModuleLoom,
  type LoomModuleId,
} from './PackagesModuleLoom';
import {
  PackagesStackComposer,
  type StagedStackPayload,
} from './PackagesStackComposer';
import composerStyles from './PackagesStackComposer.module.css';

export interface PackagesWorkspaceProps {
  packages: AstraFlowPackage[];
  presets: ComposerPreset[];
  /** Optional custom left hero narrative slot; defaults to the canonical /packages editorial copy. */
  heroCopy?: ReactNode;
}

export function PackagesWorkspace({
  packages,
  presets,
  heroCopy,
}: PackagesWorkspaceProps) {
  const [selectedModuleId, setSelectedModuleId] =
    useState<LoomModuleId>('mediator');
  const [stagedRequest, setStagedRequest] =
    useState<StagedStackPayload | null>(null);

  const handleStageCapability = (
    packageIds: string[],
    moduleId: LoomModuleId,
  ) => {
    setStagedRequest((prev) => ({
      packageIds,
      moduleId,
      mode: 'replace',
      seq: (prev?.seq ?? 0) + 1,
    }));
  };

  const handleStagePackageFromDirectory = (packageId: string) => {
    setStagedRequest((prev) => ({
      packageIds: [packageId],
      label: packageId,
      mode: 'add',
      seq: (prev?.seq ?? 0) + 1,
    }));
  };

  return (
    <>
      <section className="hero">
        <div className="site-wrap page-intro grid">
          {heroCopy ?? (
            <div>
              <p className="eyebrow">A DIFFERENT WAY TO COMPOSE</p>
              <HeroTextReveal as="h1">
                Take the parts.
                <span className="ital">Keep the control.</span>
              </HeroTextReveal>
              <HeroTextReveal as="p" className="lead" delayMs={80}>
                A family of {packages.length} focused .NET packages. Choose a
                capability, see what it adds, and generate an install plan
                without adopting a platform.
              </HeroTextReveal>
              <div className="links">
                <MagneticButton className="button button-primary" href="#composer">
                  Build your stack
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </MagneticButton>
                <MagneticButton className="button button-outline" href="#directory">
                  Browse packages
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </MagneticButton>
              </div>
            </div>
          )}

          <HeroStageEntrance>
            <PackagesModuleLoom
              packages={packages}
              selectedModuleId={selectedModuleId}
              onSelectModule={setSelectedModuleId}
              onStageCapability={handleStageCapability}
              composerAnchorId="composer"
            />
          </HeroStageEntrance>
        </div>
      </section>

      {/* Full-viewport-width Deep Forest Assembly Bench band */}
      <section className={composerStyles.fullBand} id="composer">
        <div className={composerStyles.bandInner}>
          <div className={composerStyles.bandHeader} data-reveal="up">
            <div className={composerStyles.bandHeaderCopy}>
              <p className={composerStyles.bandEyebrow}>
                <span className={composerStyles.topDot} aria-hidden="true" />
                01 / THE ASSEMBLY BENCH
              </p>
              <h2 className={composerStyles.bandTitle}>
                Compose only what{' '}
                <span className={composerStyles.bandItalic}>
                  your application needs.
                </span>
              </h2>
            </div>
            <p className={composerStyles.bandCaption}>
              All {packages.length} AstraFlow packages resolved with target
              frameworks, transitive references, and explicit{' '}
              <code>PrivateAssets=&quot;all&quot;</code> build rules.
            </p>
          </div>

          <PackagesStackComposer
            packages={packages}
            presets={presets}
            stagedRequest={stagedRequest}
            showDirectory={false}
          />
        </div>
      </section>

      <section className="section" id="directory">
        <div className="site-wrap">
          <div className="section-head" data-reveal="up">
            <div>
              <p className="eyebrow">02 / COMPLETE PACKAGE DIRECTORY</p>
              <h2>
                Specific tools.
                <br />
                <span className="ital signal">Clear boundaries.</span>
              </h2>
            </div>
            <p className="section-caption">
              All {packages.length} AstraFlow packages organized by architecture
              layer, target frameworks, and integration boundary.
            </p>
          </div>

          <PackagesDirectory
            packages={packages}
            onStagePackage={handleStagePackageFromDirectory}
            composerAnchorId="composer"
          />
        </div>
      </section>
    </>
  );
}

export const PackagesInteractiveView = PackagesWorkspace;
