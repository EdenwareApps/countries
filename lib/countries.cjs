const { EventEmitter } = require('node:events');

function normCode(v) {
  return typeof v === 'string' ? v.toLowerCase() : v;
}

function sortByProp(arr, prop, desc = false) {
  return arr.slice().sort((a, b) => {
    const va = a[prop];
    const vb = b[prop];
    if (va === vb) return 0;
    const out = va > vb ? 1 : -1;
    return desc ? -out : out;
  });
}

class Countries extends EventEmitter {
  constructor(data, langMap = {}) {
    super();
    this.data = Array.isArray(data) ? data : [];
    this.langMap = langMap || {};
  }

  query(fields, where = {}, orderBy, desc) {
    const ret = [];
    let fieldList = fields;
    if (typeof fieldList === 'string' && fieldList) {
      fieldList = fieldList.split(',');
    } else if (typeof fieldList === 'string' && !fieldList) {
      fieldList = null;
    }
    if (orderBy) {
      if (fieldList && !fieldList.includes(orderBy)) {
        fieldList = [...fieldList, orderBy];
      } else if (!fieldList) {
        fieldList = [orderBy];
      }
    }

    for (let i = 0; i < this.data.length; i++) {
      const row = this.data[i];
      const fine = Object.keys(where).every((by) => {
        const cond = where[by];
        const val = row[by];
        if (typeof cond === 'function') return cond(val);
        if (Array.isArray(cond)) return cond.some((c) => normCode(c) === normCode(val));
        if (by === 'code') return normCode(val) === normCode(cond);
        return val === cond;
      });
      if (fine) {
        const result = {};
        if (fieldList && fieldList.length) {
          fieldList.forEach((k) => (result[k] = row[k]));
        } else {
          Object.assign(result, row);
        }
        ret.push(result);
      }
    }

    if (orderBy) {
      let sorter;
      if (typeof orderBy === 'function') {
        sorter = orderBy;
      } else if (desc) {
        sorter = (a, b) => (a[orderBy] > b[orderBy] ? -1 : a[orderBy] < b[orderBy] ? 1 : 0);
      } else {
        sorter = (a, b) => (a[orderBy] > b[orderBy] ? 1 : a[orderBy] < b[orderBy] ? -1 : 0);
      }
      return ret.sort(sorter);
    }
    return ret;
  }

  getRow(fields, where = {}, orderBy, desc) {
    const results = this.query(fields, where, orderBy, desc);
    return results.shift();
  }

  getVar(field, where = {}, orderBy, desc) {
    const result = this.getRow(field, where, orderBy, desc);
    return result != null ? result[field] : undefined;
  }

  countryCodeExists(code) {
    const c = normCode(code);
    return this.data.some((row) => normCode(row.code) === c);
  }

  getCountry(code) {
    return this.getRow(null, { code });
  }

  getCountryName(code, targetLanguage) {
    const row = this.getCountry(code);
    return row ? row[targetLanguage] || row.iso || '' : '';
  }

  getCountries() {
    return this.data.map((c) => c.code);
  }

  getCountriesFromTZ(tzMins) {
    return this.data
      .map((c) => (c.tz && c.tz.includes(tzMins) ? c.code : false))
      .filter(Boolean);
  }

  getCountryLanguages(code) {
    const row = this.getCountry(code);
    return row && Array.isArray(row.languages) ? row.languages : [];
  }

  getCountriesFromLanguage(locale) {
    // Accept both ISO 639-1 (2-letter, e.g. 'pt') and ISO 639-3 (3-letter, e.g. 'por')
    const target = this.langMap[locale] || locale;
    const list = [];
    for (const row of this.data) {
      const langs = row.languages;
      if (Array.isArray(langs) && langs.includes(target)) list.push(row.code);
    }
    return list;
  }

  orderCodesBy(codes, field, desc = true) {
    const results = this.query('code', { code: codes }, field, desc);
    return results.map((c) => c.code);
  }

  extractCountryCodes(text) {
    const re = /(^|[^a-z])([a-z]{2})(?=[^a-z]|$)/g;
    const seen = new Set();
    let m;
    while ((m = re.exec(text.toLowerCase())) !== null) {
      const cc = m[2];
      if (!seen.has(cc)) seen.add(cc);
    }
    const codes = [...seen].filter((cc) => this.countryCodeExists(cc));
    return codes.reverse();
  }

  getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  getDistance(country1, country2) {
    return this.getDistanceFromLatLonInKm(
      country1.lat,
      country1.lng,
      country2.lat,
      country2.lng
    );
  }

  getNearest(fromCode, dests, amount) {
    const fromCountry = this.getCountry(fromCode);
    if (!fromCountry) return [];
    const dists = dests
      .map((code) => {
        const country = this.getCountry(code);
        if (country) {
          return { ...country, dist: this.getDistance(fromCountry, country) };
        }
        return null;
      })
      .filter(Boolean);
    const sorted = sortByProp(dists, 'dist', false);
    return sorted.slice(0, amount).map((c) => c.code);
  }

  getNearestPopulous(fromCode, dests, amount) {
    const fromCountry = this.getCountry(fromCode);
    if (!fromCountry) return [];
    const countries = {};
    let maxDistance = 0;
    let maxPopulation = 0;
    let minPopulation = Number.MAX_SAFE_INTEGER;
    let minDistance = Number.MAX_SAFE_INTEGER;

    for (const code of dests) {
      const country = this.getCountry(code);
      if (country) {
        const dist = this.getDistance(fromCountry, country);
        country.dist = dist;
        if (minDistance > dist) minDistance = dist;
        if (maxDistance < dist) maxDistance = dist;
        const pop = country.population ?? 0;
        if (minPopulation > pop) minPopulation = pop;
        if (maxPopulation < pop) maxPopulation = pop;
        countries[code] = country;
      }
    }

    const scores = [];
    const rangePop = maxPopulation - minPopulation || 1;
    const rangeDist = maxDistance || 1;
    for (const code of Object.keys(countries)) {
      const c = countries[code];
      const scorePopulation = (c.population - minPopulation) / rangePop;
      const scoreDistance = 1 - c.dist / rangeDist;
      scores.push({ code, score: scorePopulation * 2 + scoreDistance });
    }
    const sorted = sortByProp(scores, 'score', true);
    return sorted.slice(0, amount).map((s) => s.code);
  }
}

module.exports = Countries;
