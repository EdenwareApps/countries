import { loadData } from './lib/adapter.js';
import Countries from './lib/countries.js';

const data = loadData();
const instance = new Countries(data);

export default instance;
export { Countries, loadData };
