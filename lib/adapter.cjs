/**
 * Adapts world-countries + supplement (tz, population) to internal format. (CJS)
 */
const countries = require('world-countries');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

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

function loadData() {
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

module.exports = { loadData };
