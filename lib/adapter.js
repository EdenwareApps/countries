/**
 * Adapts world-countries + supplement (tz, population) to internal format.
 */
import countries from 'world-countries';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 2-letter (our API) -> 3-letter (world-countries translations)
const LANG_MAP = {
  da: 'dan',
  de: 'deu',
  en: 'eng',
  es: 'spa',
  fr: 'fra',
  it: 'ita',
  nl: 'nld',
  pt: 'por'
};

function loadSupplement() {
  const path = join(__dirname, '..', 'data', 'supplement.json');
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw);
}

/**
 * @returns {Array<{ code: string, iso: string, da?: string, de?: string, en?: string, es?: string, fr?: string, it?: string, nl?: string, pt?: string, lat: number, lng: number, tz: number[], languages: string[], population: number }>}
 */
export function loadData() {
  const supplement = loadSupplement();
  return countries.map((c) => {
    const code = (c.cca2 || '').toLowerCase();
    const sup = supplement[code] || { tz: [], population: 0 };
    const latlng = c.latlng || [0, 0];
    const languages = c.languages ? Object.keys(c.languages) : [];
    const nameCommon = c.name?.common || '';
    const translations = c.translations || {};

    const row = {
      code,
      iso: nameCommon,
      lat: latlng[0],
      lng: latlng[1],
      tz: Array.isArray(sup.tz) ? sup.tz : [],
      languages,
      population: typeof sup.population === 'number' ? sup.population : 0
    };

    for (const [two, three] of Object.entries(LANG_MAP)) {
      const t = translations[three];
      row[two] = (t && t.common) || nameCommon;
    }
    return row;
  });
}
