const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const dataDir = path.join(__dirname, '..', 'data');
const files = [
  'Report-of-Kent-Test-Scores-2017.xlsx',
  'Report-of-Kent-Test-scores-2018.xlsx',
  '2019-Kent-Test-scores-report.xlsx',
  '2020-Kent-Test-scores-report.xlsx',
  'kent-test-scores-report-2021.xlsx',
  'Kent-Test-scores-report-2022.xlsx',
  'Kent-Test-scores-report-2023.xlsx',
  'Report-of-Kent-Test-scores-2024.xlsx',
  'Report-of-Kent-Test-scores-2025.xlsx',
  'Report-of-Kent-Test-scores-2026.xlsx'
];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  const wb = xlsx.readFile(filePath);
  console.log(`\n=================== FILE: ${file} ===================`);
  wb.SheetNames.forEach(sName => {
    const s = wb.Sheets[sName];
    const data = xlsx.utils.sheet_to_json(s, { header: 1 });
    console.log(`Sheet "${sName}": ${data.length} rows`);
    // print row headers
    for (let i = 0; i < Math.min(4, data.length); i++) {
      console.log(`  Row ${i}:`, (data[i] || []).slice(0, 8));
    }
    // inspect last 2 rows
    for (let i = Math.max(4, data.length - 2); i < data.length; i++) {
      console.log(`  Row ${i} (from end):`, (data[i] || []).slice(0, 4), '... last:', (data[i] || []).slice(-3));
    }
  });
});
