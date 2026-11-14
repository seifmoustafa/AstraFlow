import { GITHUB_URL } from '@core/config/site-config';

export const HEADER_NAV_ITEMS = [
  { key: 'home', href: '/' },
  { key: 'packages', href: '/packages' },
  { key: 'docs', href: '/docs' },
  { key: 'guides', href: '/guides' },
  { key: 'changelog', href: '/changelog' },
  { key: 'community', href: '/community' },
] as const;

export const FOOTER_COLUMNS = [
  {
    key: 'explore',
    links: [
      { key: 'packages', href: '/packages' },
      { key: 'documentation', href: '/docs' },
      { key: 'guides', href: '/guides' },
    ],
  },
  {
    key: 'project',
    links: [
      { key: 'changelog', href: '/changelog' },
      { key: 'community', href: '/community' },
      { key: 'github', href: GITHUB_URL },
    ],
  },
  {
    key: 'build',
    links: [
      { key: 'gettingStarted', href: '/docs/getting-started' },
      { key: 'packageSelection', href: '/docs/package-selection' },
      { key: 'releaseHistory', href: '/changelog' },
    ],
  },
] as const;
