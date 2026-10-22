const path = require('path');
const xlsx = require('xlsx');

const wb2025 = xlsx.readFile(path.join(__dirname, '..', 'data', 'Report-of-Kent-Test-scores-2025.xlsx'));
const g2025 = xlsx.utils.sheet_to_json(wb2025.Sheets['Assessed suitable for grammar'], { header: 1 });
const headers2025 = g2025[2];
const totalRow2025 = g2025[9]; // Row 9 is grand total (8558)

console.log('Grand total cell in 2025:', totalRow2025[totalRow2025.length - 1]);

const scoreCounts2025 = {};
for (let c = 2; c < headers2025.length - 1; c++) {
  const score = Number(headers2025[c]);
  let val = totalRow2025[c];
  if (val === '5 or less' || val === '<=5' || val === '*') {
    val = 2.5; // midpoint
  } else {
    val = Number(val || 0);
  }
  scoreCounts2025[score] = val;
}

const cumRank2025 = {};
let running2025 = 0;
for (let s = 423; s >= 207; s--) {
  running2025 += (scoreCounts2025[s] || 0);
  cumRank2025[s] = running2025;
}

console.log('2025 S=372 Cumulative Rank:', cumRank2025[372], 'Total grammar:', cumRank2025[207]);

// Now check with 2026
const wb2026 = xlsx.readFile(path.join(__dirname, '..', 'data', 'Report-of-Kent-Test-scores-2026.xlsx'));
const g2026 = xlsx.utils.sheet_to_json(wb2026.Sheets['Assessed suitable for grammar'], { header: 1 });
const totalCol2026 = g2026[0].length - 1;

const scoreCounts2026 = {};
for (let c = 2; c < totalCol2026; c++) {
  const score = Number(g2026[0][c]);
  const count = Number(g2026[29][c] || 0);
  scoreCounts2026[score] = count;
}

const cumRank2026 = {};
let running2026 = 0;
for (let s = 423; s >= 207; s--) {
  running2026 += (scoreCounts2026[s] || 0);
  cumRank2026[s] = running2026;
}

console.log('2026 S=384 Cumulative Rank:', cumRank2026[384]);

const targetRank = cumRank2026[384];
let bestScore = 207;
let minDiff = Infinity;
for (let s = 423; s >= 207; s--) {
  const diff = Math.abs(cumRank2025[s] - targetRank);
  if (diff < minDiff) {
    minDiff = diff;
    bestScore = s;
  }
}
console.log(`For 2026 Score 384 (Rank ${targetRank}):`);
console.log(`Equivalent in 2025: ${bestScore} (Rank ${cumRank2025[bestScore]}, diff ${minDiff})`);
console.log(`Point difference: ${bestScore - 384}`);
