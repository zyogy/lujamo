/**
 * Languages and route slugs.
 *
 * Finnish is the default and lives at the site root; other languages are
 * prefixed (/en/, /sv/). Slugs are shared English slugs for now – to localise
 * one later, change its value for that language here. Service and project
 * slugs live in their own content files (src/content/units/<lang>/*.yaml).
 */
export const languages = {
  fi: { name: 'Suomi', code: 'FI', htmlLang: 'fi', hreflang: 'fi', ogLocale: 'fi_FI', switchLabel: 'Suomeksi', flag: 'fi' },
  en: { name: 'English', code: 'EN', htmlLang: 'en', hreflang: 'en', ogLocale: 'en_GB', switchLabel: 'In English', flag: 'gb' },
  sv: { name: 'Svenska', code: 'SV', htmlLang: 'sv', hreflang: 'sv', ogLocale: 'sv_FI', switchLabel: 'På svenska', flag: 'se' },
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'fi';
export const langs = Object.keys(languages) as Lang[];

/** Fixed pages. Key → slug per language ('' = language root). */
export const pageSlugs = {
  home: { fi: '', en: '', sv: '' },
  about: { fi: 'about', en: 'about', sv: 'about' },
  projects: { fi: 'projects', en: 'projects', sv: 'projects' },
  contact: { fi: 'contact', en: 'contact', sv: 'contact' },
  thanks: { fi: 'contact/thanks', en: 'contact/thanks', sv: 'contact/thanks' },
  privacy: { fi: 'privacy', en: 'privacy', sv: 'privacy' },
} satisfies Record<string, Record<Lang, string>>;

export type PageKey = keyof typeof pageSlugs;

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && value in languages;
}
