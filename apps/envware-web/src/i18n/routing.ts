import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'pt'],
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Don't add locale prefix to default locale (keeps same URL)
  localePrefix: 'never'
});