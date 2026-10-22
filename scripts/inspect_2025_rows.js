const path = require('path');
const xlsx = require('xlsx');

const wb2025 = xlsx.readFile(path.join(__dirname, '..', 'data', 'Report-of-Kent-Test-scores-2025.xlsx'));
const g2025 = xlsx.utils.sheet_to_json(wb2025.Sheets['Assessed suitable for grammar'], { header: 1 });
for (let r = 0; r < g2025.length; r++) {
  console.log(`Row ${r}:`, (g2025[r] || []).slice(0, 3), '...', (g2025[r] || []).slice(-3));
}
