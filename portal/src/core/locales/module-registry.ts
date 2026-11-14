import { coreEn } from './core.en';
import { homeEn } from '@modules/site/home/home.en';
import { packagesEn } from '@modules/catalog/packages/packages.en';
import { documentationEn } from '@modules/documentation/documentation.en';
import { changelogEn } from '@modules/releases/changelog/changelog.en';
import { guidesEn } from '@modules/learning/guides/guides.en';
import { communityEn } from '@modules/community/contribution/community.en';

/** Active English messages composed from the owning core and feature dictionaries. */
export const en = {
  core: coreEn,
  site: {
    home: homeEn,
  },
  catalog: {
    packages: packagesEn,
  },
  documentation: documentationEn,
  learning: {
    guides: guidesEn,
  },
  community: communityEn,
  releases: {
    changelog: changelogEn,
  },
} as const;
