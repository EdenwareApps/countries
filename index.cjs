const { loadData, LANG_MAP } = require('./lib/adapter.cjs');
const Countries = require('./lib/countries.cjs');

const data = loadData();
const instance = new Countries(data, LANG_MAP);

module.exports = instance;
module.exports.Countries = Countries;
module.exports.loadData = loadData;
