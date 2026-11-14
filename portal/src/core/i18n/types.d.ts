import type { ActiveLocale } from './config';
import type { en } from '../locales/en';

declare module 'next-intl' {
  interface AppConfig {
    Locale: ActiveLocale;
    Messages: typeof en;
  }
}
