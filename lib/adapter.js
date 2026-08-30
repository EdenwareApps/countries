/**
 * Adapts world-countries + supplement (tz, population) to internal format.
 */
import countries from 'world-countries';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 2-letter (our API) -> 3-letter (world-countries translations)
// Full ISO 639-1 -> ISO 639-2/T mapping (world-countries uses T codes).
const LANG_MAP = {
  aa: 'aar', // Afar
  ab: 'abk', // Abkhazian
  ae: 'ave', // Avestan
  af: 'afr', // Afrikaans
  ak: 'aka', // Akan
  am: 'amh', // Amharic
  an: 'arg', // Aragonese
  ar: 'ara', // Arabic
  as: 'asm', // Assamese
  av: 'ava', // Avaric
  ay: 'aym', // Aymara
  az: 'aze', // Azerbaijani
  ba: 'bak', // Bashkir
  be: 'bel', // Belarusian
  bg: 'bul', // Bulgarian
  bh: 'bih', // Bihari
  bi: 'bis', // Bislama
  bm: 'bam', // Bambara
  bn: 'ben', // Bengali
  bo: 'bod', // Tibetan
  br: 'bre', // Breton
  bs: 'bos', // Bosnian
  ca: 'cat', // Catalan
  ce: 'che', // Chechen
  ch: 'cha', // Chamorro
  co: 'cos', // Corsican
  cr: 'cre', // Cree
  cs: 'ces', // Czech
  cu: 'chu', // Church Slavic
  cv: 'chv', // Chuvash
  cy: 'cym', // Welsh
  da: 'dan', // Danish
  de: 'deu', // German
  dv: 'div', // Dhivehi
  dz: 'dzo', // Dzongkha
  ee: 'ewe', // Ewe
  el: 'ell', // Greek
  en: 'eng', // English
  eo: 'epo', // Esperanto
  es: 'spa', // Spanish
  et: 'est', // Estonian
  eu: 'eus', // Basque
  fa: 'fas', // Persian
  ff: 'ful', // Fulah
  fi: 'fin', // Finnish
  fj: 'fij', // Fijian
  fo: 'fao', // Faroese
  fr: 'fra', // French
  fy: 'fry', // Western Frisian
  ga: 'gle', // Irish
  gd: 'gla', // Scottish Gaelic
  gl: 'glg', // Galician
  gn: 'grn', // Guarani
  gu: 'guj', // Gujarati
  gv: 'glv', // Manx
  ha: 'hau', // Hausa
  he: 'heb', // Hebrew
  hi: 'hin', // Hindi
  ho: 'hmo', // Hiri Motu
  hr: 'hrv', // Croatian
  ht: 'hat', // Haitian
  hu: 'hun', // Hungarian
  hy: 'hye', // Armenian
  hz: 'her', // Herero
  ia: 'ina', // Interlingua
  id: 'ind', // Indonesian
  ie: 'ile', // Interlingue
  ig: 'ibo', // Igbo
  ii: 'iii', // Sichuan Yi
  ik: 'ipk', // Inupiaq
  io: 'ido', // Ido
  is: 'isl', // Icelandic
  it: 'ita', // Italian
  iu: 'iku', // Inuktitut
  ja: 'jpn', // Japanese
  jv: 'jav', // Javanese
  ka: 'kat', // Georgian
  kg: 'kon', // Kongo
  ki: 'kik', // Kikuyu
  kj: 'kua', // Kuanyama
  kk: 'kaz', // Kazakh
  kl: 'kal', // Kalaallisut
  km: 'khm', // Khmer
  kn: 'kan', // Kannada
  ko: 'kor', // Korean
  kr: 'kau', // Kanuri
  ks: 'kas', // Kashmiri
  ku: 'kur', // Kurdish
  kv: 'kom', // Komi
  kw: 'cor', // Cornish
  ky: 'kir', // Kyrgyz
  la: 'lat', // Latin
  lb: 'ltz', // Luxembourgish
  lg: 'lug', // Ganda
  li: 'lim', // Limburgan
  ln: 'lin', // Lingala
  lo: 'lao', // Lao
  lt: 'lit', // Lithuanian
  lu: 'lub', // Luba-Katanga
  lv: 'lav', // Latvian
  mg: 'mlg', // Malagasy
  mh: 'mah', // Marshallese
  mi: 'mri', // Maori
  mk: 'mkd', // Macedonian
  ml: 'mal', // Malayalam
  mn: 'mon', // Mongolian
  mr: 'mar', // Marathi
  ms: 'msa', // Malay
  mt: 'mlt', // Maltese
  my: 'mya', // Burmese
  na: 'nau', // Nauru
  nb: 'nob', // Norwegian Bokmål
  nd: 'nde', // North Ndebele
  ne: 'nep', // Nepali
  ng: 'ndo', // Ndonga
  nl: 'nld', // Dutch
  nn: 'nno', // Norwegian Nynorsk
  no: 'nor', // Norwegian
  nr: 'nbl', // South Ndebele
  nv: 'nav', // Navajo
  ny: 'nya', // Chichewa
  oc: 'oci', // Occitan
  oj: 'oji', // Ojibwa
  om: 'orm', // Oromo
  or: 'ori', // Odia
  os: 'oss', // Ossetian
  pa: 'pan', // Punjabi
  pi: 'pli', // Pali
  pl: 'pol', // Polish
  ps: 'pus', // Pashto
  pt: 'por', // Portuguese
  qu: 'que', // Quechua
  rm: 'roh', // Romansh
  rn: 'run', // Rundi
  ro: 'ron', // Romanian
  ru: 'rus', // Russian
  rw: 'kin', // Kinyarwanda
  sa: 'san', // Sanskrit
  sc: 'srd', // Sardinian
  sd: 'snd', // Sindhi
  se: 'sme', // Northern Sami
  sg: 'sag', // Sango
  si: 'sin', // Sinhala
  sk: 'slk', // Slovak
  sl: 'slv', // Slovenian
  sm: 'smo', // Samoan
  sn: 'sna', // Shona
  so: 'som', // Somali
  sq: 'sqi', // Albanian
  sr: 'srp', // Serbian
  ss: 'ssw', // Swati
  st: 'sot', // Southern Sotho
  su: 'sun', // Sundanese
  sv: 'swe', // Swedish
  sw: 'swa', // Swahili
  ta: 'tam', // Tamil
  te: 'tel', // Telugu
  tg: 'tgk', // Tajik
  th: 'tha', // Thai
  ti: 'tir', // Tigrinya
  tk: 'tuk', // Turkmen
  tl: 'tgl', // Tagalog
  tn: 'tsn', // Tswana
  to: 'ton', // Tonga
  tr: 'tur', // Turkish
  ts: 'tso', // Tsonga
  tt: 'tat', // Tatar
  tw: 'twi', // Twi
  ty: 'tah', // Tahitian
  ug: 'uig', // Uyghur
  uk: 'ukr', // Ukrainian
  ua: 'ukr', // Ukrainian (app uses 'ua' instead of 'uk'; kept after 'uk' so REV maps to 'ua')
  ur: 'urd', // Urdu
  uz: 'uzb', // Uzbek
  ve: 'ven', // Venda
  vi: 'vie', // Vietnamese
  vo: 'vol', // Volapük
  wa: 'wln', // Walloon
  wo: 'wol', // Wolof
  xh: 'xho', // Xhosa
  yi: 'yid', // Yiddish
  yo: 'yor', // Yoruba
  za: 'zha', // Zhuang
  zh: 'zho', // Chinese
  zu: 'zul' // Zulu
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
    // languages keep world-countries' ISO 639-3 (3-letter) codes; getCountriesFromLanguage accepts 2- and 3-letter
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

export { LANG_MAP };
