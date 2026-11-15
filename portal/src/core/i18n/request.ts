import { getRequestConfig } from 'next-intl/server';
import { en } from '../locales/en';
import { DEFAULT_LOCALE } from './config';

export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  messages: en,
}));
