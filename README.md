# @edenware/countries

Country data with query API, distance, nearest countries, and multi-language names. Powered by [world-countries](https://www.npmjs.com/package/world-countries) with a supplemental dataset for timezone offsets and population.

## Features

- **Country database**: ISO codes, names (da, de, en, es, fr, it, nl, pt), coordinates, languages
- **Timezone**: Offsets in minutes per country (from supplement)
- **Population**: From supplement data
- **Query API**: Filter, order, select fields
- **Distance**: Haversine distance between countries; nearest / nearest-by-population
- **Case-insensitive**: All country code arguments (`getCountry`, `getCountryName`, `getNearest`, etc.) accept any case (`'US'`, `'us'`). Returned objects use lowercase `code` (e.g. `country.code === 'us'`).

## Installation

```bash
npm install @edenware/countries
```

## Usage

### ESM

```javascript
import geo from '@edenware/countries';

const country = geo.getCountry('US');
console.log(country?.iso); // United States

const name = geo.getCountryName('US', 'pt');
console.log(name); // Estados Unidos

const us = geo.getCountry('US');
const ca = geo.getCountry('CA');
const distanceKm = geo.getDistance(us, ca);

const nearest = geo.getNearest('US', ['CA', 'MX', 'BR'], 2);
```

### CommonJS

```javascript
const geo = require('@edenware/countries');

const country = geo.getCountry('us');
console.log(country?.iso);
```

### Custom instance

```javascript
import geo, { Countries, loadData } from '@edenware/countries';

const data = loadData();
const instance = new Countries(data);
```

## API

- `getCountry(code)` – country object by ISO 3166-1 alpha-2 (case-insensitive)
- `getCountryName(code, lang)` – name in language (da, de, en, es, fr, it, nl, pt) or `iso`
- `getCountries()` – array of all codes
- `getCountriesFromTZ(tzMins)` – codes in that timezone offset (minutes)
- `getCountryLanguages(code)` – array of language codes (ISO 639-3)
- `getCountriesFromLanguage(locale)` – codes where that language is used (accepts ISO 639-1 2-letter like `'pt'` or ISO 639-3 3-letter like `'por'`)
- `query(fields, where, orderBy, desc)` – filter/order; `fields` can be string (e.g. `'code,iso'`) or empty for all
- `getRow(fields, where, orderBy, desc)` – first row of query
- `getVar(field, where, orderBy, desc)` – single field value
- `countryCodeExists(code)` – boolean
- `orderCodesBy(codes, field, desc)` – sort codes by field (default desc)
- `extractCountryCodes(text)` – extract valid 2-letter codes from text
- `getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2)` – Haversine km
- `getDistance(country1, country2)` – distance in km
- `getNearest(fromCode, destCodes, amount)` – nearest by distance
- `getNearestPopulous(fromCode, destCodes, amount)` – nearest by distance + population score

## Data

- Country list and translations: [world-countries](https://www.npmjs.com/package/world-countries).
- Timezone offsets and population: `data/supplement.json` (shipped with the package).

---

**By [Edenware](https://edenware.app)** — developing open-source software for simpler digital lives. Multi-platform apps, transparency, and collaboration.
