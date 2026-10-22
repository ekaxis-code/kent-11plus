const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const dataDir = path.join(__dirname, '..', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));

console.log('Found files:', files);

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  try {
    const workbook = xlsx.readFile(filePath);
    console.log(`\n=== File: ${file} ===`);
    console.log('Sheet names:', workbook.SheetNames);
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const range = xlsx.utils.decode_range(sheet['!ref'] || 'A1');
      console.log(`  Sheet [${sheetName}]: range ${sheet['!ref']} (rows: ${range.e.r + 1}, cols: ${range.e.c + 1})`);
      // print first 3 rows
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
      console.log(`  Preview (first 2 rows):`, data.slice(0, 2).map(row => (row || []).slice(0, 6)));
    });
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
});
