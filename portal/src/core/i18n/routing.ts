import { defineRouting } from 'next-intl/routing';
import { ACTIVE_LOCALES, DEFAULT_LOCALE } from './config';

export const routing = defineRouting({
  locales: ACTIVE_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  localeDetection: false,
});
