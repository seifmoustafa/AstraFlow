export const ACTIVE_LOCALES = ['en'] as const;

export type ActiveLocale = (typeof ACTIVE_LOCALES)[number];

export const DEFAULT_LOCALE: ActiveLocale = 'en';

export function isActiveLocale(locale: string | undefined): locale is ActiveLocale {
  return locale !== undefined && ACTIVE_LOCALES.includes(locale as ActiveLocale);
}

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
