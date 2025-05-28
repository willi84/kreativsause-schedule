// import 'vite/dynamic-import-polyfill'; // for prod mode
import './_framework/css/index.css';
import { createSearch } from './components/molecules/search/search.molecule';


createSearch('data-search', 'talks', '[data-talk]');