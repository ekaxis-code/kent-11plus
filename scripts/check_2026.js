const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const filePath = path.join(__dirname, '..', 'data', 'Report-of-Kent-Test-scores-2026.xlsx');
const wb = xlsx.readFile(filePath);

console.log('Sheets in 2026:', wb.SheetNames);

wb.SheetNames.forEach(sheetName => {
  const sheet = wb.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`\nSheet: ${sheetName}`);
  console.log(`Row count: ${json.length}`);
  for (let r = 0; r < Math.min(5, json.length); r++) {
    console.log(`Row ${r}:`, json[r].slice(0, 5), '...', json[r].slice(-3));
  }
  // Check last row
  console.log(`Last row (${json.length - 1}):`, json[json.length - 1].slice(0, 5), '...', json[json.length - 1].slice(-3));
});
