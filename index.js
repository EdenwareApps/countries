import { loadData, LANG_MAP } from './lib/adapter.js';
import Countries from './lib/countries.js';

const data = loadData();
const instance = new Countries(data, LANG_MAP);

export default instance;
export { Countries, loadData };
