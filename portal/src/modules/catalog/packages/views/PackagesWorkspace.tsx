'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import {
  HeroStageEntrance,
  HeroTextReveal,
  MagneticButton,
} from '@core/motion';
import type { AstraFlowPackage, ComposerPreset } from '@modules/catalog/packages';
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
  const t = useTranslations('catalog.packages.workspace');
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
              <p className="eyebrow">{t('heroEyebrow')}</p>
              <HeroTextReveal as="h1">
                {t('heroTitleLead')}
                <span className="ital">{t('heroTitleAccent')}</span>
              </HeroTextReveal>
              <HeroTextReveal as="p" className="lead" delayMs={80}>
                {t('heroLead', { count: String(packages.length) })}
              </HeroTextReveal>
              <div className="links">
                <MagneticButton className="button button-primary" href="#composer">
                  {t('buildStack')}
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </MagneticButton>
                <MagneticButton className="button button-outline" href="#directory">
                  {t('browsePackages')}
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
                {t('assemblyEyebrow')}
              </p>
              <h2 className={composerStyles.bandTitle}>
                {t('assemblyTitleLead')}{' '}
                <span className={composerStyles.bandItalic}>
                  {t('assemblyTitleAccent')}
                </span>
              </h2>
            </div>
            <p className={composerStyles.bandCaption}>
              {t('assemblyCaptionLead', { count: String(packages.length) })}{' '}
              <code>PrivateAssets=&quot;all&quot;</code> {t('assemblyCaptionTail')}
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
              <p className="eyebrow">{t('directoryEyebrow')}</p>
              <h2>
                {t('directoryTitleLead')}
                <br />
                <span className="ital signal">{t('directoryTitleAccent')}</span>
              </h2>
            </div>
            <p className="section-caption">
              {t('directoryCaption', { count: String(packages.length) })}
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
