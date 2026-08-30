/**
 * Tests for geo-countries (ESM entry and API).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import geo, { Countries, loadData } from '../index.js';

describe('geo-countries', () => {
  describe('exports', () => {
    it('default export is an instance with getCountry', () => {
      assert.strictEqual(typeof geo.getCountry, 'function');
      assert.strictEqual(typeof geo.getCountries, 'function');
    });
    it('named export Countries is a class', () => {
      assert.strictEqual(typeof Countries, 'function');
      const c = new Countries([]);
      assert.ok(c instanceof Countries);
      assert.strictEqual(c.data.length, 0);
    });
    it('named export loadData is a function', () => {
      assert.strictEqual(typeof loadData, 'function');
    });
  });

  describe('getCountry', () => {
    it('returns country by code (lowercase)', () => {
      const c = geo.getCountry('br');
      assert.ok(c);
      assert.strictEqual(c.code, 'br');
      assert.strictEqual(c.iso, 'Brazil');
    });
    it('returns country by code (uppercase)', () => {
      const c = geo.getCountry('US');
      assert.ok(c);
      assert.strictEqual(c.code, 'us');
      assert.strictEqual(c.iso, 'United States');
    });
    it('returns undefined for invalid code', () => {
      assert.strictEqual(geo.getCountry('xx'), undefined);
      assert.strictEqual(geo.getCountry(''), undefined);
    });
  });

  describe('getCountryName', () => {
    it('returns name in requested language', () => {
      assert.strictEqual(geo.getCountryName('us', 'pt'), 'Estados Unidos');
      assert.strictEqual(geo.getCountryName('br', 'en'), 'Brazil');
    });
    it('falls back to iso for missing language', () => {
      const name = geo.getCountryName('us', 'en');
      assert.ok(name.length > 0);
      assert.strictEqual(name, 'United States');
    });
    it('returns empty string for invalid code', () => {
      assert.strictEqual(geo.getCountryName('xx', 'en'), '');
    });
  });

  describe('getCountries', () => {
    it('returns array of codes', () => {
      const codes = geo.getCountries();
      assert.ok(Array.isArray(codes));
      assert.ok(codes.length > 200);
      assert.ok(codes.includes('br'));
      assert.ok(codes.includes('us'));
    });
  });

  describe('countryCodeExists', () => {
    it('returns true for valid code', () => {
      assert.strictEqual(geo.countryCodeExists('us'), true);
      assert.strictEqual(geo.countryCodeExists('US'), true);
    });
    it('returns false for invalid code', () => {
      assert.strictEqual(geo.countryCodeExists('xx'), false);
    });
  });

  describe('getCountriesFromTZ', () => {
    it('returns codes for timezone offset in minutes', () => {
      const codes = geo.getCountriesFromTZ(-180);
      assert.ok(Array.isArray(codes));
      assert.ok(codes.includes('ar'));
    });
  });

  describe('getCountryLanguages', () => {
    it('returns array of language codes', () => {
      const langs = geo.getCountryLanguages('br');
      assert.ok(Array.isArray(langs));
      assert.ok(langs.includes('por'));
    });
    it('returns empty array for invalid code', () => {
      assert.deepStrictEqual(geo.getCountryLanguages('xx'), []);
    });
  });

  describe('getCountriesFromLanguage', () => {
    it('returns codes where language is used', () => {
      const codes = geo.getCountriesFromLanguage('por');
      assert.ok(Array.isArray(codes));
      assert.ok(codes.includes('br'));
    });
    it('accepts ISO 639-1 (2-letter) codes too', () => {
      const codes = geo.getCountriesFromLanguage('pt');
      assert.ok(Array.isArray(codes));
      assert.ok(codes.includes('br'));
    });
  });

  describe('query', () => {
    it('filters by where and returns selected fields', () => {
      const rows = geo.query('code,iso', { code: 'br' });
      assert.strictEqual(rows.length, 1);
      assert.strictEqual(rows[0].code, 'br');
      assert.strictEqual(rows[0].iso, 'Brazil');
    });
    it('returns all fields when fields is empty', () => {
      const rows = geo.query('', { code: 'us' });
      assert.strictEqual(rows.length, 1);
      assert.ok('code' in rows[0]);
      assert.ok('iso' in rows[0]);
      assert.ok('lat' in rows[0]);
      assert.ok('lng' in rows[0]);
    });
    it('orders by field when orderBy provided', () => {
      const rows = geo.query('code,population', {}, 'population', true);
      assert.ok(rows.length > 1);
      const pops = rows.map((r) => r.population);
      for (let i = 1; i < pops.length; i++) {
        assert.ok(pops[i] <= pops[i - 1]);
      }
    });
  });

  describe('getRow', () => {
    it('returns first matching row', () => {
      const row = geo.getRow('code,iso', { code: 'jp' });
      assert.ok(row);
      assert.strictEqual(row.code, 'jp');
      assert.strictEqual(row.iso, 'Japan');
    });
  });

  describe('getVar', () => {
    it('returns single field value', () => {
      const iso = geo.getVar('iso', { code: 'de' });
      assert.strictEqual(iso, 'Germany');
    });
  });

  describe('orderCodesBy', () => {
    it('sorts codes by field (desc by default)', () => {
      const sorted = geo.orderCodesBy(['br', 'us', 'ca'], 'population', true);
      assert.strictEqual(sorted[0], 'us');
      assert.ok(['br', 'ca'].includes(sorted[1]));
      assert.ok(['br', 'ca'].includes(sorted[2]));
    });
  });

  describe('extractCountryCodes', () => {
    it('extracts valid codes from text', () => {
      const codes = geo.extractCountryCodes('we have us and br here');
      assert.ok(Array.isArray(codes));
      assert.ok(codes.includes('us'));
      assert.ok(codes.includes('br'));
    });
    it('returns empty array for text with no valid codes', () => {
      const codes = geo.extractCountryCodes('xy zz aa');
      assert.ok(Array.isArray(codes));
      assert.strictEqual(codes.length, 0);
    });
  });

  describe('getDistance', () => {
    it('returns distance in km between two countries', () => {
      const us = geo.getCountry('us');
      const ca = geo.getCountry('ca');
      assert.ok(us && ca);
      const d = geo.getDistance(us, ca);
      assert.ok(typeof d === 'number');
      assert.ok(d > 0);
      assert.ok(d < 10000);
    });
  });

  describe('getNearest', () => {
    it('returns nearest countries by distance', () => {
      const nearest = geo.getNearest('us', ['ca', 'mx', 'br'], 2);
      assert.strictEqual(nearest.length, 2);
      assert.ok(['ca', 'mx'].includes(nearest[0]));
      assert.ok(['ca', 'mx'].includes(nearest[1]));
    });
    it('returns empty array for invalid fromCode', () => {
      const nearest = geo.getNearest('xx', ['ca', 'mx'], 2);
      assert.deepStrictEqual(nearest, []);
    });
  });

  describe('getNearestPopulous', () => {
    it('returns countries by distance + population score', () => {
      const result = geo.getNearestPopulous('us', ['ca', 'mx', 'br'], 2);
      assert.strictEqual(result.length, 2);
      assert.ok(Array.isArray(result));
    });
    it('returns empty array for invalid fromCode', () => {
      const result = geo.getNearestPopulous('xx', ['ca', 'mx'], 2);
      assert.deepStrictEqual(result, []);
    });
  });

  describe('loadData + custom instance', () => {
    it('loadData returns array of country objects', () => {
      const data = loadData();
      assert.ok(Array.isArray(data));
      assert.ok(data.length > 200);
      const first = data[0];
      assert.ok('code' in first);
      assert.ok('iso' in first);
      assert.ok('lat' in first);
      assert.ok('lng' in first);
    });
    it('custom Countries instance works with loadData', () => {
      const data = loadData();
      const instance = new Countries(data);
      const c = instance.getCountry('br');
      assert.ok(c);
      assert.strictEqual(c.iso, 'Brazil');
    });
  });
});
