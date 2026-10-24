import fi from './fi.json';
import en from './en.json';
import sv from './sv.json';
import { defaultLang, type Lang } from './config';

type Dict = { [key: string]: string | Dict };
const dictionaries: Record<Lang, Dict> = { fi, en, sv };

function lookup(dict: Dict, key: string): string | undefined {
  let node: string | Dict | undefined = dict;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

/**
 * Returns a translator for one language. Missing keys fall back to Finnish,
 * then to the key itself, so a page never breaks. `npm run check:i18n`
 * lists missing keys.
 */
export function useTranslations(lang: Lang) {
  return function t(key: string, vars?: Record<string, string>): string {
    let value = lookup(dictionaries[lang], key) ?? lookup(dictionaries[defaultLang], key) ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) value = value.replaceAll(`{${k}}`, v);
    return value;
  };
}

/** Prefix a root-relative path with the configured base path. */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

/** Build the public URL for a slug in a language: /, /en/, /digital/, /sv/digital/turva/ … */
export function localizedPath(lang: Lang, slug: string): string {
  const parts = [lang === defaultLang ? '' : lang, slug].filter(Boolean).join('/');
  return withBase(parts ? `/${parts}/` : '/');
}
