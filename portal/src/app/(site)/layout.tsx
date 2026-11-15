import type { ReactNode } from 'react';
import { SmoothScrollProvider } from '@core/motion/SmoothScrollProvider';
import { SiteFooter } from '@core/shell/SiteFooter';
import { SiteHeader } from '@core/shell/SiteHeader';
import { getTranslations } from 'next-intl/server';

export default async function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  const t = await getTranslations('core.brand');

  return (
    <SmoothScrollProvider>
      <a className="v11-skip" href="#main">
        {t('skipToMain')}
      </a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </SmoothScrollProvider>
  );
}
