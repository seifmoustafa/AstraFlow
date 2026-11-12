'use client';

import { useState, type ReactNode } from 'react';
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
              <h1>
                Take the parts.
                <span className="ital">Keep the control.</span>
              </h1>
              <p className="lead">
                A family of {packages.length} focused .NET packages. Choose a
                capability, see what it adds, and generate an install plan
                without adopting a platform.
              </p>
              <div className="links">
                <a className="button button-primary" href="#composer">
                  Build your stack
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </a>
                <a className="button button-outline" href="#directory">
                  Browse packages
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </a>
              </div>
            </div>
          )}

          <PackagesModuleLoom
            packages={packages}
            selectedModuleId={selectedModuleId}
            onSelectModule={setSelectedModuleId}
            onStageCapability={handleStageCapability}
            composerAnchorId="composer"
          />
        </div>
      </section>

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
              Backed directly by repository <code>.csproj</code> metadata and
              published <code>2.3.0</code> NuGet release records.
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
          <div className="section-head">
            <div>
              <p className="eyebrow">02 / THE PACKAGE INDEX</p>
              <h2>
                Specific tools.
                <br />
                <span className="ital signal">Clear boundaries.</span>
              </h2>
            </div>
            <p className="section-caption">
              All {packages.length} packages inspected directly from{' '}
              <code>src/*/*.csproj</code>.
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
