const path = require('path');
const xlsx = require('xlsx');

['Report-of-Kent-Test-Scores-2017.xlsx', 'Report-of-Kent-Test-scores-2018.xlsx'].forEach(f => {
  const wb = xlsx.readFile(path.join(__dirname, '..', 'data', f));
  console.log(`\n=== ${f} ===`);
  wb.SheetNames.forEach(sn => {
    const data = xlsx.utils.sheet_to_json(wb.Sheets[sn], { header: 1 });
    console.log(`Sheet "${sn}": ${data.length} rows`);
    console.log('Row 0 headers:', data[0].slice(0, 5), '...', data[0].slice(-3));
    console.log('Last row:', data[data.length - 1].slice(0, 5), '...', data[data.length - 1].slice(-3));
  });
});
