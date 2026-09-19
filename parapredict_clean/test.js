import { generateHistory, generateForecast } from './src/data/mockRealData.js'; const h = generateHistory('south', 'sheet'); const f = generateForecast(h, 7); console.log('OK');
