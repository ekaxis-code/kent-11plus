const path = require('path');
const xlsx = require('xlsx');

const filePath = path.join(__dirname, '..', 'data', 'Report-of-Kent-Test-scores-2026.xlsx');
const wb = xlsx.readFile(filePath);

const anySheet = xlsx.utils.sheet_to_json(wb.Sheets['Any outcome'], { header: 1 });
const gSheet = xlsx.utils.sheet_to_json(wb.Sheets['Assessed suitable for grammar'], { header: 1 });
const hSheet = xlsx.utils.sheet_to_json(wb.Sheets['Assessed suitable for High'], { header: 1 });

console.log('--- 2026 Checksums Verification ---');
const totalColIdx = anySheet[0].length - 1;
console.log('Header columns:', anySheet[0][0], anySheet[0][1], 'Scores:', anySheet[0][2], 'to', anySheet[0][totalColIdx - 1], 'Total header:', anySheet[0][totalColIdx]);

const anyTotal = anySheet[29][totalColIdx];
const gTotal = gSheet[29][totalColIdx];
const hTotal = hSheet[29][totalColIdx];
console.log(`Totals -> Any: ${anyTotal}, Grammar: ${gTotal}, High: ${hTotal}`);
console.log(`Grammar %: ${((gTotal / anyTotal) * 100).toFixed(2)}%`);
console.log(`High %: ${((hTotal / anyTotal) * 100).toFixed(2)}%`);

let fAny = 0, mAny = 0, fG = 0, mG = 0, fH = 0, mH = 0;
let cellDiscrepancies = 0;
let districts = {};

for (let r = 1; r <= 28; r++) {
  const dist = anySheet[r][0];
  const gender = anySheet[r][1];
  const rowAnyTot = anySheet[r][totalColIdx];
  const rowGTot = gSheet[r][totalColIdx];
  const rowHTot = hSheet[r][totalColIdx];

  if (gender === 'F') {
    fAny += rowAnyTot;
    fG += rowGTot;
    fH += rowHTot;
  } else if (gender === 'M') {
    mAny += rowAnyTot;
    mG += rowGTot;
    mH += rowHTot;
  }

  if (!districts[dist]) districts[dist] = {};
  districts[dist][gender] = { any: rowAnyTot, g: rowGTot, h: rowHTot };

  for (let c = 2; c < totalColIdx; c++) {
    const valAny = anySheet[r][c] || 0;
    const valG = gSheet[r][c] || 0;
    const valH = hSheet[r][c] || 0;
    if (valAny !== (valG + valH)) {
      cellDiscrepancies++;
      console.error(`Discrepancy at row ${r} (${dist} ${gender}), col ${c} (score ${anySheet[0][c]}): Any=${valAny}, G=${valG}, H=${valH}`);
    }
  }
}

console.log(`Cell-by-cell discrepancies: ${cellDiscrepancies} (across 28 rows x 217 cols)`);
console.log(`F splits -> Any: ${fAny}, G: ${fG}, H: ${fH}`);
console.log(`M splits -> Any: ${mAny}, G: ${mG}, H: ${mH}`);
console.log('Districts grammar breakdown:');
Object.keys(districts).forEach(d => {
  console.log(`  ${d}: ${districts[d]['F']?.g} F, ${districts[d]['M']?.g} M`);
});

// Check Anomaly A: HTA (< 345 on Grammar tab)
let htaCount = 0;
let minHtaScore = 999;
let maxHtaScore = -1;
for (let c = 2; c < totalColIdx; c++) {
  const score = anySheet[0][c];
  if (score < 345) {
    const count = gSheet[29][c] || 0;
    htaCount += count;
    if (count > 0) {
      if (score < minHtaScore) minHtaScore = score;
      if (score > maxHtaScore) maxHtaScore = score;
    }
  }
}
console.log(`Anomaly A (HTA passes < 345): ${htaCount} pupils (range: ${minHtaScore} to ${maxHtaScore})`);

// Check Anomaly B: Single-Paper Floor Fail (>= 345 on High tab)
let floorFailCount = 0;
let minFloorScore = 999;
let maxFloorScore = -1;
let oocFloorFail = 0;
for (let c = 2; c < totalColIdx; c++) {
  const score = anySheet[0][c];
  if (score >= 345) {
    const count = hSheet[29][c] || 0;
    floorFailCount += count;
    if (count > 0) {
      if (score < minFloorScore) minFloorScore = score;
      if (score > maxFloorScore) maxFloorScore = score;
    }
    // Check OOC/Misc rows (rows 17 & 18 typically)
    for (let r = 1; r <= 28; r++) {
      if (hSheet[r][0] === 'OOC/Misc') {
        oocFloorFail += (hSheet[r][c] || 0);
      }
    }
  }
}
console.log(`Anomaly B (Floor fails >= 345 on High tab): ${floorFailCount} pupils (range: ${minFloorScore} to ${maxFloorScore}), OOC/Misc count: ${oocFloorFail}`);
