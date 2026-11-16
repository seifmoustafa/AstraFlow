import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';
import { DEFAULT_LOCALE, getDirection } from '@core/i18n/config';
import { SITE_NAME, SITE_URL } from '@core/config/site-config';
import '@core/design/globals.css';

export const viewport: Viewport = {
  themeColor: '#f7f3eb',
  colorScheme: 'light',
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('core.seo');
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: t('titleTemplate') },
    description: t('description'),
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.svg?v=3', type: 'image/svg+xml' },
        { url: '/favicon-96x96.png?v=3', sizes: '96x96', type: 'image/png' },
        { url: '/favicon.ico?v=3', sizes: 'any', type: 'image/x-icon' },
      ],
      apple: [{ url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' }],
      shortcut: ['/favicon.ico?v=3'],
    },
    appleWebApp: { title: t('appleTitle') },
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: SITE_NAME,
      title: t('title'),
      description: t('description'),
      url: '/',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const messages = await getMessages();

  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={getDirection(DEFAULT_LOCALE)}
      data-theme="warm-forest"
    >
      <body>
        <NextIntlClientProvider locale={DEFAULT_LOCALE} messages={messages}>
          {children}
        </NextIntlClientProvider>
      {process.env.VERCEL === '1' ? <Analytics /> : null}
      </body>
    </html>
  );
}
