import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLang, langs, pageSlugs, type Lang, type PageKey } from '../i18n/config';
import { localizedPath } from '../i18n/utils';

type UnitData = CollectionEntry<'units'>['data'];
type PageEntry = CollectionEntry<'pages'>;

export interface Unit extends UnitData {
  id: string;
  /** true when this language has no file and Finnish content is shown instead */
  fallback: boolean;
}

/** "fi/digital" → { lang: "fi", id: "digital" } */
function splitId(entryId: string) {
  const [lang, ...rest] = entryId.split('/');
  return { lang: lang as Lang, id: rest.join('/') };
}

function groupByLang<T extends { id: string }>(entries: T[]) {
  const map = new Map<string, Partial<Record<Lang, T>>>();
  for (const entry of entries) {
    const { lang, id } = splitId(entry.id);
    map.set(id, { ...map.get(id), [lang]: entry });
  }
  return map;
}

/**
 * All units for a language, sorted by `order`.
 * A unit exists if it has a Finnish file; other languages fall back to it.
 */
export async function getUnits(lang: Lang): Promise<Unit[]> {
  const grouped = groupByLang(await getCollection('units'));
  const units: Unit[] = [];
  for (const [id, byLang] of grouped) {
    const base = byLang[defaultLang];
    if (!base) continue;
    const entry = byLang[lang] ?? base;
    units.push({ ...entry.data, id, fallback: !byLang[lang] });
  }
  return units.sort((a, b) => a.order - b.order);
}

/** What Lujamo offers (shown in the main nav), e.g. app development. */
export async function getServices(lang: Lang) {
  return (await getUnits(lang)).filter((u) => u.kind === 'service');
}

/** Lujamo's own projects (Projects page, references on the front page). */
export async function getProjects(lang: Lang) {
  return (await getUnits(lang)).filter((u) => u.kind === 'project');
}

export function unitPath(unit: Pick<Unit, 'slug'>, lang: Lang) {
  return localizedPath(lang, unit.slug);
}

/** Path of one unit in every language (slugs may differ per language). */
export async function unitAlternates(id: string) {
  const out = {} as Record<Lang, string>;
  for (const lang of langs) {
    const unit = (await getUnits(lang)).find((u) => u.id === id);
    if (unit) out[lang] = unitPath(unit, lang);
  }
  return out;
}

export function pagePath(key: PageKey, lang: Lang) {
  return localizedPath(lang, pageSlugs[key][lang]);
}

export function pageAlternates(key: PageKey) {
  return Object.fromEntries(langs.map((lang) => [lang, pagePath(key, lang)])) as Record<Lang, string>;
}

/** A fixed page's content, falling back to Finnish. */
export async function getPage(lang: Lang, key: PageKey): Promise<{ entry: PageEntry; fallback: boolean }> {
  const pages = await getCollection('pages');
  const own = pages.find((p) => p.id === `${lang}/${key}`);
  const base = pages.find((p) => p.id === `${defaultLang}/${key}`);
  const entry = own ?? base;
  if (!entry) throw new Error(`Missing content: src/content/pages/${defaultLang}/${key}`);
  return { entry, fallback: !own };
}

/** Inline style that scopes a unit's accent colour. */
export function accentStyle(accent: string) {
  return `--accent: var(--${accent})`;
}

/** Split a text block into paragraphs on blank lines. */
export function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
