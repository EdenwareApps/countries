const { loadData } = require('./lib/adapter.cjs');
const Countries = require('./lib/countries.cjs');

const data = loadData();
const instance = new Countries(data);

module.exports = instance;
module.exports.Countries = Countries;
module.exports.loadData = loadData;
