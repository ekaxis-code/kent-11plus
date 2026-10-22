const fs = require('fs');
const path = require('path');

// Load distributions and schools metadata
const distPath = path.join(__dirname, '..', 'public', 'data', 'kent_distributions_2015_2026.json');
const schoolsPath = path.join(__dirname, '..', 'public', 'data', 'kent_schools_32.json');

const distributionsData = JSON.parse(fs.readFileSync(distPath, 'utf8'));
const schools = JSON.parse(fs.readFileSync(schoolsPath, 'utf8'));

// Import or replicate engine functions for verification
const {
  checkQualificationStatus,
  calculate2026RankAndEquivalents,
  calculateOSGB36DistanceMiles,
  evaluateSchoolEligibility,
  generateSCAFRecommendations
} = require('../dist-test/lib/admissions-engine.cjs');

console.log('=== Running Automated Admissions Engine Test Suite ===\n');

// TEST CASE 1: Sevenoaks Boy Score 382
console.log('--- TEST CASE 1: West Kent Super-Selective Inflation Check ---');
const tc1Profile = {
  scoreMode: 'detailed',
  english: 130,
  maths: 126,
  reasoning: 126,
  totalScore: 382,
  gender: 'M',
  postcode: 'TN13 1AA',
  kccConfirmedGrammarAssessment: true,
  pupilPremium: false,
  hasSibling: false,
  ehcpOrLookedAfter: false,
  postcodeData: {
    eastings: 553000,
    northings: 154500,
    latitude: 51.27,
    longitude: 0.19,
    district: 'Sevenoaks',
    parish: 'Sevenoaks'
  }
};

const rank1 = calculate2026RankAndEquivalents(382, distributionsData);
console.log(`Score 382 -> 2025 Equiv: ${rank1.equiv2025Score} (diff: ${rank1.pointDiff}), Rank: #${rank1.rank2026}`);

const tc1Evaluated = schools.map(s => ({
  ...s,
  eligibility: evaluateSchoolEligibility(tc1Profile, s, distributionsData)
}));

const judd1 = tc1Evaluated.find(s => s.shortName.includes('Judd'));
const skinners1 = tc1Evaluated.find(s => s.shortName.includes("Skinners'"));
const twgsb1 = tc1Evaluated.find(s => s.shortName.includes('TWGSB'));
const wilmingtonB1 = tc1Evaluated.find(s => s.shortName.includes('Wilmington Boys'));

console.log(`Judd: ${judd1.eligibility.badge} (Rationale: ${judd1.eligibility.rationale})`);
console.log(`Skinners': ${skinners1.eligibility.badge} (Rationale: ${skinners1.eligibility.rationale})`);
console.log(`TWGSB: ${twgsb1.eligibility.badge} (Rationale: ${twgsb1.eligibility.rationale})`);
console.log(`Wilmington Boys: ${wilmingtonB1.eligibility.badge} (Rationale: ${wilmingtonB1.eligibility.rationale})`);

if (judd1.eligibility.badge !== 'OUT OF RANGE') throw new Error('Test Case 1 Failed: Judd should be OUT OF RANGE');
if (!skinners1.eligibility.badge.includes('WAITLIST') && !skinners1.eligibility.badge.includes('BORDERLINE')) {
  throw new Error('Test Case 1 Failed: Skinners should be WAITLIST / BORDERLINE');
}
if (!twgsb1.eligibility.badge.includes('SAFE') && !twgsb1.eligibility.badge.includes('REALISTIC')) {
  throw new Error('Test Case 1 Failed: TWGSB should be SAFE or REALISTIC TARGET');
}
console.log('[PASS] Test Case 1 Passed!\n');


// TEST CASE 2: Single-Paper Floor Fail (Bromley Girl Score 380: 140 M, 132 R, 108 E)
console.log('--- TEST CASE 2: Single-Paper Floor Fail Appeal Check ---');
const tc2Profile = {
  scoreMode: 'detailed',
  english: 108,
  maths: 140,
  reasoning: 132,
  totalScore: 380,
  gender: 'F',
  postcode: 'BR1 1AA',
  kccConfirmedGrammarAssessment: false,
  pupilPremium: false,
  hasSibling: false,
  ehcpOrLookedAfter: false,
  postcodeData: {
    eastings: 540500,
    northings: 169500,
    latitude: 51.40,
    longitude: 0.02,
    district: 'Bromley',
    parish: 'Bromley'
  }
};

const qual2 = checkQualificationStatus(tc2Profile);
console.log(`Qualification Headline: ${qual2.headline}`);
console.log(`Failed papers: ${qual2.failedPapers.join(', ')}`);
console.log(`Single-Paper Floor Fail Cohort Flag: ${qual2.isSinglePaperFloorFailCohort}`);

const tc2Evaluated = schools.map(s => ({
  ...s,
  eligibility: evaluateSchoolEligibility(tc2Profile, s, distributionsData)
}));

const appealSchools = tc2Evaluated.filter(s => s.eligibility.badge === 'APPEAL CANDIDATE (MARCH 2027)');
console.log(`Found ${appealSchools.length} viable schools for March 2027 Academic Appeal.`);
appealSchools.slice(0, 3).forEach(s => {
  console.log(`  - ${s.name}: ${s.eligibility.badge}`);
});

const scaf2 = generateSCAFRecommendations(tc2Evaluated, tc2Profile);
console.log(`SCAF Strategy Commentary: ${scaf2.commentary}`);

if (!qual2.isSinglePaperFloorFailCohort) throw new Error('Test Case 2 Failed: Should be in Single-Paper Floor Fail Cohort');
if (appealSchools.length === 0) throw new Error('Test Case 2 Failed: Should identify appeal candidate schools');
console.log('[PASS] Test Case 2 Passed!\n');


// TEST CASE 3: HTA Override Check (Faversham Girl Score 336, HTA = True)
console.log('--- TEST CASE 3: HTA Override Distance Check ---');
const tc3Profile = {
  scoreMode: 'quick',
  english: 112,
  maths: 112,
  reasoning: 112,
  totalScore: 336,
  gender: 'F',
  postcode: 'ME13 7BQ',
  kccConfirmedGrammarAssessment: true,
  pupilPremium: false,
  hasSibling: false,
  ehcpOrLookedAfter: false,
  postcodeData: {
    eastings: 601923,
    northings: 161598,
    latitude: 51.317,
    longitude: 0.896,
    district: 'Swale',
    parish: 'Faversham'
  }
};

const qual3 = checkQualificationStatus(tc3Profile);
console.log(`Qualification Headline: ${qual3.headline}`);
console.log(`HTA Override Cohort Flag: ${qual3.isHtaOverrideCohort}`);

const tc3Evaluated = schools.map(s => ({
  ...s,
  eligibility: evaluateSchoolEligibility(tc3Profile, s, distributionsData)
}));

const qe3 = tc3Evaluated.find(s => s.shortName.includes('Queen Elizabeth'));
const highsted3 = tc3Evaluated.find(s => s.shortName.includes('Highsted'));
const tgs3 = tc3Evaluated.find(s => s.shortName.includes('TGS'));

console.log(`Queen Elizabeth's: ${qe3.eligibility.badge} (Distance: ${qe3.eligibility.distanceMiles} mi)`);
console.log(`Highsted: ${highsted3.eligibility.badge} (Distance: ${highsted3.eligibility.distanceMiles} mi)`);
console.log(`TGS (Super-Selective): ${tgs3.eligibility.badge}`);

if (!qual3.isHtaOverrideCohort) throw new Error('Test Case 3 Failed: Should be HTA Override Cohort');
if (!qe3.eligibility.badge.includes('SAFE') && !qe3.eligibility.badge.includes('REALISTIC')) {
  throw new Error('Test Case 3 Failed: Queen Elizabeth should be SAFE or REALISTIC TARGET');
}
if (!highsted3.eligibility.badge.includes('SAFE') && !highsted3.eligibility.badge.includes('REALISTIC')) {
  throw new Error('Test Case 3 Failed: Highsted should be SAFE or REALISTIC TARGET');
}
if (tgs3.eligibility.badge !== 'OUT OF RANGE') throw new Error('Test Case 3 Failed: TGS should be OUT OF RANGE for HTA');

console.log('[PASS] Test Case 3 Passed!\n');
console.log('>>> ALL ACCEPTANCE TEST CASES PASSED CLEANLY! <<<');
