const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'public', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Complete definitions of all 32 Kent Grammar Schools
const schoolsData = [
  // Archetype A: Pure Super-Selective
  {
    name: "The Judd School",
    shortName: "Judd",
    urn: 138678,
    dfeNumber: "886/5423",
    postcode: "TN9 2PN",
    address: "Brook Street",
    town: "Tonbridge",
    district: "Tonbridge & Malling",
    gender: "Boys",
    pan2027: 180,
    archetype: "A",
    statutoryThresholdOffset: null, // Pure score rank
    catchmentType: "Inner & Outer Catchment",
    innerCatchmentDistricts: ["Tonbridge & Malling", "Tunbridge Wells", "Sevenoaks"],
    innerQuota: 157,
    outerQuota: 23,
    historicalCutoffs: {
      2022: { marchScore: 374, aprilScore: 371, marchDist: null, aprilDist: null },
      2023: { marchScore: 379, aprilScore: 375, marchDist: null, aprilDist: null },
      2024: { marchScore: 384, aprilScore: 381, marchDist: null, aprilDist: null },
      2025: { marchScore: 386, aprilScore: 383, marchDist: null, aprilDist: null },
      2026: { marchScore: 389, aprilScore: 386, marchDist: null, aprilDist: null }
    },
    projected2027Cutoff: {
      marchScoreInner: 400,
      marchScoreOuter: 408,
      aprilScoreInner: 397,
      aprilScoreOuter: 405
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2023",
      progress8: "+0.84",
      progress8Rating: "Well above average",
      attainment8: 81.2,
      grade5PlusEngMath: 99,
      grade7PlusEngMath: 84,
      russellGroupOxbridge: "78% Russell Group (14% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 45,
      historicAppealsHeard: 38,
      historicAppealsUpheld: 1,
      appealNote: "Appeals are fiercely contested. Prejudicial burden is high as school operates at extreme capacity."
    }
  },
  {
    name: "The Skinners' School",
    shortName: "Skinners'",
    urn: 140489,
    dfeNumber: "886/5400",
    postcode: "TN4 9PG",
    address: "St John's Road",
    town: "Tunbridge Wells",
    district: "Tunbridge Wells",
    gender: "Boys",
    pan2027: 160,
    archetype: "A",
    statutoryThresholdOffset: 40, // Local priority floor: Threshold + 40 = 385
    priorityFloor2026: 385,
    catchmentType: "West Kent Priority Area + Governor Score Places",
    innerCatchmentDistricts: ["Tunbridge Wells", "Tonbridge & Malling", "Sevenoaks"],
    innerQuota: 140,
    outerQuota: 20,
    historicalCutoffs: {
      2022: { marchScore: 367, aprilScore: 363, marchDist: null, aprilDist: null },
      2023: { marchScore: 370, aprilScore: 366, marchDist: null, aprilDist: null },
      2024: { marchScore: 373, aprilScore: 370, marchDist: null, aprilDist: null },
      2025: { marchScore: 374, aprilScore: 371, marchDist: null, aprilDist: null },
      2026: { marchScore: 378, aprilScore: 375, marchDist: null, aprilDist: null }
    },
    projected2027Cutoff: {
      marchScoreInner: 385, // Statutory floor Threshold + 40
      marchScoreOuter: 398,
      aprilScoreInner: 385,
      aprilScoreOuter: 395
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2022",
      progress8: "+0.68",
      progress8Rating: "Well above average",
      attainment8: 78.6,
      grade5PlusEngMath: 98,
      grade7PlusEngMath: 79,
      russellGroupOxbridge: "72% Russell Group (9% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 36,
      historicAppealsHeard: 30,
      historicAppealsUpheld: 2,
      appealNote: "Small chance of successful appeal if academic evidence is stellar and local priority met."
    }
  },
  {
    name: "Tonbridge Grammar School",
    shortName: "TGS",
    urn: 136362,
    dfeNumber: "886/4045",
    postcode: "TN9 2JR",
    address: "Deakin Leas",
    town: "Tonbridge",
    district: "Tonbridge & Malling",
    gender: "Girls",
    pan2027: 180,
    archetype: "A",
    statutoryThresholdOffset: null,
    catchmentType: "Area Area (3 miles radius) + Named Parishes + Governor Outer Score",
    innerCatchmentDistricts: ["Tonbridge & Malling", "Tunbridge Wells", "Sevenoaks"],
    innerQuota: 135,
    outerQuota: 45,
    historicalCutoffs: {
      2022: { marchScore: 378, aprilScore: 374, marchDist: null, aprilDist: null },
      2023: { marchScore: 383, aprilScore: 379, marchDist: null, aprilDist: null },
      2024: { marchScore: 388, aprilScore: 384, marchDist: null, aprilDist: null },
      2025: { marchScore: 391, aprilScore: 388, marchDist: null, aprilDist: null },
      2026: { marchScore: 394, aprilScore: 391, marchDist: null, aprilDist: null }
    },
    projected2027Cutoff: {
      marchScoreInner: 399,
      marchScoreOuter: 414,
      aprilScoreInner: 395,
      aprilScoreOuter: 410
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2024",
      progress8: "+0.92",
      progress8Rating: "Well above average",
      attainment8: 83.5,
      grade5PlusEngMath: 100,
      grade7PlusEngMath: 88,
      russellGroupOxbridge: "81% Russell Group (15% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 40,
      historicAppealsHeard: 35,
      historicAppealsUpheld: 1,
      appealNote: "Operates IB curriculum; requires top tier score or exceptional primary school writing proof."
    }
  },
  {
    name: "Dartford Grammar School",
    shortName: "Dartford Boys",
    urn: 136384,
    dfeNumber: "886/4500",
    postcode: "DA1 2HW",
    address: "West Hill",
    town: "Dartford",
    district: "Dartford",
    gender: "Boys",
    pan2027: 180,
    archetype: "A",
    statutoryThresholdOffset: 40, // Local priority floor: Threshold + 40 = 385
    priorityFloor2026: 385,
    catchmentType: "Inner Parishes (DA1, DA2) + Outer Score Places",
    innerCatchmentDistricts: ["Dartford"],
    innerQuota: 130,
    outerQuota: 50,
    historicalCutoffs: {
      2022: { marchScore: 372, aprilScore: 368, marchDist: null, aprilDist: null },
      2023: { marchScore: 375, aprilScore: 371, marchDist: null, aprilDist: null },
      2024: { marchScore: 377, aprilScore: 373, marchDist: null, aprilDist: null },
      2025: { marchScore: 380, aprilScore: 376, marchDist: null, aprilDist: null },
      2026: { marchScore: 384, aprilScore: 380, marchDist: null, aprilDist: null }
    },
    projected2027Cutoff: {
      marchScoreInner: 385, // statutory Threshold + 40
      marchScoreOuter: 396,
      aprilScoreInner: 385,
      aprilScoreOuter: 393
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2023",
      progress8: "+0.89",
      progress8Rating: "Well above average",
      attainment8: 82.1,
      grade5PlusEngMath: 99,
      grade7PlusEngMath: 86,
      russellGroupOxbridge: "79% Russell Group (12% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 52,
      historicAppealsHeard: 45,
      historicAppealsUpheld: 2,
      appealNote: "Huge volume of Bexley/Greenwich applicants. Appeals strictly bound by net capacity."
    }
  },

  // Archetype B: Hybrid Distance Core + Governor / Outer Score Places
  {
    name: "Dartford Grammar School for Girls",
    shortName: "Dartford Girls",
    urn: 144820,
    dfeNumber: "886/4014",
    postcode: "DA1 2NT",
    address: "Shepherds Lane",
    town: "Dartford",
    district: "Dartford",
    gender: "Girls",
    pan2027: 180,
    archetype: "B",
    statutoryThresholdOffset: null,
    catchmentType: "Distance in Named Parishes + Governor 30 High Score Places",
    innerCatchmentDistricts: ["Dartford"],
    historicalCutoffs: {
      2022: { marchScore: 365, aprilScore: 361, marchDist: 2.85, aprilDist: 3.2 },
      2023: { marchScore: 368, aprilScore: 364, marchDist: 2.65, aprilDist: 3.0 },
      2024: { marchScore: 371, aprilScore: 367, marchDist: 2.45, aprilDist: 2.85 },
      2025: { marchScore: 373, aprilScore: 369, marchDist: 2.30, aprilDist: 2.70 },
      2026: { marchScore: 376, aprilScore: 372, marchDist: 2.15, aprilDist: 2.50 }
    },
    projected2027Cutoff: {
      marchScoreOuter: 388,
      marchDistanceInner: 2.2,
      aprilDistanceInner: 2.6
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2021",
      progress8: "+0.76",
      progress8Rating: "Well above average",
      attainment8: 79.4,
      grade5PlusEngMath: 98,
      grade7PlusEngMath: 81,
      russellGroupOxbridge: "71% Russell Group (7% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 30,
      historicAppealsHeard: 25,
      historicAppealsUpheld: 3,
      appealNote: "Good record of appeal if child just missed single paper floor and lives in Dartford."
    }
  },
  {
    name: "Wilmington Grammar School for Boys",
    shortName: "Wilmington Boys",
    urn: 137397,
    dfeNumber: "886/5401",
    postcode: "DA2 7DA",
    address: "Common Lane",
    town: "Wilmington",
    district: "Dartford",
    gender: "Boys",
    pan2027: 180,
    archetype: "B",
    statutoryThresholdOffset: 20, // Governor high-score tier
    priorityFloor2026: 365,
    catchmentType: "Distance within 3 miles + 10% Governor Top Score Places",
    innerCatchmentDistricts: ["Dartford", "Sevenoaks"],
    historicalCutoffs: {
      2022: { marchScore: 355, aprilScore: 351, marchDist: 4.8, aprilDist: 5.6 },
      2023: { marchScore: 358, aprilScore: 354, marchDist: 4.4, aprilDist: 5.1 },
      2024: { marchScore: 360, aprilScore: 356, marchDist: 4.1, aprilDist: 4.7 },
      2025: { marchScore: 362, aprilScore: 358, marchDist: 3.9, aprilDist: 4.5 },
      2026: { marchScore: 365, aprilScore: 361, marchDist: 3.6, aprilDist: 4.2 }
    },
    projected2027Cutoff: {
      marchScoreOuter: 378,
      marchDistanceInner: 3.8,
      aprilDistanceInner: 4.4
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2022",
      progress8: "+0.45",
      progress8Rating: "Above average",
      attainment8: 73.1,
      grade5PlusEngMath: 95,
      grade7PlusEngMath: 65,
      russellGroupOxbridge: "58% Russell Group (4% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 24,
      historicAppealsHeard: 20,
      historicAppealsUpheld: 4,
      appealNote: "Reasonable appeal success for boys with strong CAT4 and math profiles."
    }
  },
  {
    name: "Wilmington Grammar School for Girls",
    shortName: "Wilmington Girls",
    urn: 137398,
    dfeNumber: "886/4049",
    postcode: "DA2 7BB",
    address: "Parsons Lane",
    town: "Wilmington",
    district: "Dartford",
    gender: "Girls",
    pan2027: 180,
    archetype: "B",
    statutoryThresholdOffset: 20,
    priorityFloor2026: 365,
    catchmentType: "Distance Core + Governor High Score Places",
    innerCatchmentDistricts: ["Dartford", "Sevenoaks", "Gravesham"],
    historicalCutoffs: {
      2022: { marchScore: 352, aprilScore: 348, marchDist: 5.2, aprilDist: 6.0 },
      2023: { marchScore: 355, aprilScore: 350, marchDist: 4.9, aprilDist: 5.5 },
      2024: { marchScore: 358, aprilScore: 353, marchDist: 4.5, aprilDist: 5.2 },
      2025: { marchScore: 360, aprilScore: 355, marchDist: 4.2, aprilDist: 4.9 },
      2026: { marchScore: 364, aprilScore: 359, marchDist: 4.0, aprilDist: 4.6 }
    },
    projected2027Cutoff: {
      marchScoreOuter: 377,
      marchDistanceInner: 4.1,
      aprilDistanceInner: 4.7
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2023",
      progress8: "+0.61",
      progress8Rating: "Above average",
      attainment8: 75.8,
      grade5PlusEngMath: 96,
      grade7PlusEngMath: 70,
      russellGroupOxbridge: "64% Russell Group (5% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 22,
      historicAppealsHeard: 18,
      historicAppealsUpheld: 3,
      appealNote: "Favourable appeals for candidates inside local catchment parishes."
    }
  },
  {
    name: "Weald of Kent Grammar School",
    shortName: "Weald of Kent",
    urn: 136391,
    dfeNumber: "886/4046",
    postcode: "TN9 2JP",
    address: "Tudeley Lane (Tonbridge) & Seal Hollow Rd (Sevenoaks)",
    town: "Tonbridge & Sevenoaks",
    district: "Tonbridge & Malling",
    gender: "Girls",
    pan2027: 300, // Combined Tonbridge + Sevenoaks campus
    archetype: "B",
    statutoryThresholdOffset: null,
    catchmentType: "Dual Campus (Tonbridge & Sevenoaks) Distance + Governor Outer Score",
    innerCatchmentDistricts: ["Tonbridge & Malling", "Sevenoaks", "Tunbridge Wells"],
    additionalCampuses: [
      {
        name: "Sevenoaks Campus",
        postcode: "TN13 3SL",
        eastings: 554043,
        northings: 156494,
        latitude: 51.286754,
        longitude: 0.207635
      }
    ],
    historicalCutoffs: {
      2022: { marchScore: 345, aprilScore: 340, marchDist: 8.5, aprilDist: 10.2 },
      2023: { marchScore: 348, aprilScore: 343, marchDist: 7.8, aprilDist: 9.4 },
      2024: { marchScore: 350, aprilScore: 345, marchDist: 7.2, aprilDist: 8.7 },
      2025: { marchScore: 352, aprilScore: 347, marchDist: 6.9, aprilDist: 8.2 },
      2026: { marchScore: 356, aprilScore: 351, marchDist: 6.5, aprilDist: 7.8 }
    },
    projected2027Cutoff: {
      marchScoreOuter: 368,
      marchDistanceInner: 7.0,
      aprilDistanceInner: 8.5
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2022",
      progress8: "+0.55",
      progress8Rating: "Above average",
      attainment8: 76.2,
      grade5PlusEngMath: 97,
      grade7PlusEngMath: 72,
      russellGroupOxbridge: "66% Russell Group (6% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 28,
      historicAppealsHeard: 24,
      historicAppealsUpheld: 5,
      appealNote: "Good appeal success due to split-campus flexibility and PAN of 300."
    }
  },
  {
    name: "Tunbridge Wells Girls' Grammar School",
    shortName: "TWGGS",
    urn: 136395,
    dfeNumber: "886/4054",
    postcode: "TN4 9UJ",
    address: "Southfield Road",
    town: "Tunbridge Wells",
    district: "Tunbridge Wells",
    gender: "Girls",
    pan2027: 155,
    archetype: "B",
    statutoryThresholdOffset: null,
    catchmentType: "Named Parishes Distance Priority + 14 Governor Top-Score Places",
    innerCatchmentDistricts: ["Tunbridge Wells", "Tonbridge & Malling", "Sevenoaks"],
    historicalCutoffs: {
      2022: { marchScore: 362, aprilScore: 358, marchDist: 2.1, aprilDist: 2.6 },
      2023: { marchScore: 365, aprilScore: 361, marchDist: 1.9, aprilDist: 2.4 },
      2024: { marchScore: 368, aprilScore: 364, marchDist: 1.8, aprilDist: 2.2 },
      2025: { marchScore: 370, aprilScore: 366, marchDist: 1.7, aprilDist: 2.1 },
      2026: { marchScore: 373, aprilScore: 369, marchDist: 1.6, aprilDist: 2.0 }
    },
    projected2027Cutoff: {
      marchScoreOuter: 386,
      marchDistanceInner: 1.8,
      aprilDistanceInner: 2.2
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2023",
      progress8: "+0.74",
      progress8Rating: "Well above average",
      attainment8: 80.5,
      grade5PlusEngMath: 99,
      grade7PlusEngMath: 82,
      russellGroupOxbridge: "75% Russell Group (10% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 25,
      historicAppealsHeard: 20,
      historicAppealsUpheld: 2,
      appealNote: "Tight radius; high competition among in-parish residents."
    }
  },
  {
    name: "Simon Langton Grammar School for Boys",
    shortName: "Simon Langton Boys",
    urn: 136978,
    dfeNumber: "886/5412",
    postcode: "CT4 7AS",
    address: "Langton Lane",
    town: "Canterbury",
    district: "Canterbury",
    gender: "Boys",
    pan2027: 165,
    archetype: "B",
    statutoryThresholdOffset: 20, // Priority tier: Threshold + 20 = 365
    priorityFloor2026: 365,
    catchmentType: "East Kent Priority Parishes (Threshold + 20) + Distance",
    innerCatchmentDistricts: ["Canterbury", "Swale", "Dover", "Thanet", "Ashford"],
    historicalCutoffs: {
      2022: { marchScore: 352, aprilScore: 348, marchDist: 8.5, aprilDist: 10.4 },
      2023: { marchScore: 355, aprilScore: 350, marchDist: 8.0, aprilDist: 9.8 },
      2024: { marchScore: 358, aprilScore: 353, marchDist: 7.4, aprilDist: 9.1 },
      2025: { marchScore: 360, aprilScore: 355, marchDist: 7.1, aprilDist: 8.7 },
      2026: { marchScore: 364, aprilScore: 359, marchDist: 6.8, aprilDist: 8.2 }
    },
    projected2027Cutoff: {
      marchScoreInner: 365, // statutory Threshold + 20
      marchScoreOuter: 378,
      marchDistanceInner: 7.5,
      aprilDistanceInner: 9.0
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2023",
      progress8: "+0.52",
      progress8Rating: "Above average",
      attainment8: 75.2,
      grade5PlusEngMath: 96,
      grade7PlusEngMath: 71,
      russellGroupOxbridge: "68% Russell Group (7% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 26,
      historicAppealsHeard: 22,
      historicAppealsUpheld: 4,
      appealNote: "Renowned for physics and science research. Strong appeals for STEM aptitudes."
    }
  },

  // Archetype C: Pure Catchment & Distance
  {
    name: "Tunbridge Wells Grammar School for Boys",
    shortName: "TWGSB",
    urn: 137399,
    dfeNumber: "886/4044",
    postcode: "TN4 9XB",
    address: "St John's Road (Tunbridge Wells) & Seal Hollow Rd (Sevenoaks)",
    town: "Tunbridge Wells & Sevenoaks",
    district: "Tunbridge Wells",
    gender: "Boys",
    pan2027: 300, // 210 TW + 90 Sevenoaks
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Pure Distance in West Kent (Dual Campus TW & Sevenoaks)",
    innerCatchmentDistricts: ["Tunbridge Wells", "Sevenoaks", "Tonbridge & Malling"],
    additionalCampuses: [
      {
        name: "Sevenoaks Campus",
        postcode: "TN13 3SL",
        eastings: 554043,
        northings: 156494,
        latitude: 51.286754,
        longitude: 0.207635
      }
    ],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 7.5, aprilDist: 9.2 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 6.8, aprilDist: 8.4 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 6.2, aprilDist: 7.9 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 5.8, aprilDist: 7.4 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 5.5, aprilDist: 7.0 }
    },
    projected2027Cutoff: {
      marchScore: 345, // Any qualified
      marchDistanceMiles: 6.0,
      aprilDistanceMiles: 7.5
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2021",
      progress8: "+0.38",
      progress8Rating: "Average",
      attainment8: 71.4,
      grade5PlusEngMath: 94,
      grade7PlusEngMath: 60,
      russellGroupOxbridge: "52% Russell Group (3% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 35,
      historicAppealsHeard: 30,
      historicAppealsUpheld: 7,
      appealNote: "Sevenoaks annex expansion provides higher capacity; appeals viable for borderline boys."
    }
  },
  {
    name: "Maidstone Grammar School",
    shortName: "Maidstone Boys",
    urn: 136709,
    dfeNumber: "886/4052",
    postcode: "ME15 7BT",
    address: "Barton Road",
    town: "Maidstone",
    district: "Maidstone",
    gender: "Boys",
    pan2027: 205,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Pure Distance in Maidstone & Surrounding Parishes",
    innerCatchmentDistricts: ["Maidstone", "Tonbridge & Malling", "Medway"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 6.4, aprilDist: 7.8 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 5.9, aprilDist: 7.2 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 5.5, aprilDist: 6.8 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 5.2, aprilDist: 6.5 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 5.0, aprilDist: 6.2 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 5.5,
      aprilDistanceMiles: 6.8
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2023",
      progress8: "+0.42",
      progress8Rating: "Above average",
      attainment8: 72.8,
      grade5PlusEngMath: 95,
      grade7PlusEngMath: 63,
      russellGroupOxbridge: "59% Russell Group (4% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 22,
      historicAppealsHeard: 18,
      historicAppealsUpheld: 4,
      appealNote: "Healthy appeal success for boys inside 4-mile radius."
    }
  },
  {
    name: "Maidstone Grammar School for Girls",
    shortName: "MGGS",
    urn: 136708,
    dfeNumber: "886/4053",
    postcode: "ME16 0SF",
    address: "Buckland Road",
    town: "Maidstone",
    district: "Maidstone",
    gender: "Girls",
    pan2027: 210,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Pure Distance across Mid Kent",
    innerCatchmentDistricts: ["Maidstone", "Tonbridge & Malling", "Medway"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 7.8, aprilDist: 9.5 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 7.2, aprilDist: 8.8 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 6.7, aprilDist: 8.1 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 6.4, aprilDist: 7.7 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 6.1, aprilDist: 7.4 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 6.8,
      aprilDistanceMiles: 8.2
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2024",
      progress8: "+0.65",
      progress8Rating: "Above average",
      attainment8: 76.9,
      grade5PlusEngMath: 97,
      grade7PlusEngMath: 72,
      russellGroupOxbridge: "65% Russell Group (6% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 20,
      historicAppealsHeard: 16,
      historicAppealsUpheld: 3,
      appealNote: "High-achieving school, strong appeals supported by primary school work samples."
    }
  },
  {
    name: "Invicta Grammar School",
    shortName: "Invicta",
    urn: 136710,
    dfeNumber: "886/4051",
    postcode: "ME14 5DR",
    address: "Huntsman Lane",
    town: "Maidstone",
    district: "Maidstone",
    gender: "Girls",
    pan2027: 240,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Pure Distance across Maidstone and Malling",
    innerCatchmentDistricts: ["Maidstone", "Tonbridge & Malling", "Swale"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 8.9, aprilDist: 11.2 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 8.3, aprilDist: 10.4 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 7.7, aprilDist: 9.6 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 7.4, aprilDist: 9.1 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 7.0, aprilDist: 8.7 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 7.5,
      aprilDistanceMiles: 9.5
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2022",
      progress8: "+0.71",
      progress8Rating: "Well above average",
      attainment8: 78.1,
      grade5PlusEngMath: 98,
      grade7PlusEngMath: 75,
      russellGroupOxbridge: "69% Russell Group (7% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 28,
      historicAppealsHeard: 24,
      historicAppealsUpheld: 5,
      appealNote: "Large PAN of 240 allows flexibility on appeal for local girls."
    }
  },
  {
    name: "Oakwood Park Grammar School",
    shortName: "Oakwood Park",
    urn: 136711,
    dfeNumber: "886/5402",
    postcode: "ME16 8AH",
    address: "Oakwood Park",
    town: "Maidstone",
    district: "Maidstone",
    gender: "Boys",
    pan2027: 210,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Pure Distance across Mid Kent",
    innerCatchmentDistricts: ["Maidstone", "Tonbridge & Malling", "Medway"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 8.1, aprilDist: 10.5 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 7.5, aprilDist: 9.7 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 6.9, aprilDist: 8.9 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 6.6, aprilDist: 8.4 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 6.2, aprilDist: 8.0 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 7.0,
      aprilDistanceMiles: 9.0
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2023",
      progress8: "+0.32",
      progress8Rating: "Average",
      attainment8: 70.1,
      grade5PlusEngMath: 93,
      grade7PlusEngMath: 56,
      russellGroupOxbridge: "50% Russell Group (3% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 20,
      historicAppealsHeard: 17,
      historicAppealsUpheld: 4,
      appealNote: "Popular insurance choice for West Kent boys outside Judd/Skinners distance."
    }
  },
  {
    name: "Gravesend Grammar School",
    shortName: "Gravesend Boys",
    urn: 136712,
    dfeNumber: "886/5408",
    postcode: "DA12 2PR",
    address: "Church Walk",
    town: "Gravesend",
    district: "Gravesham",
    gender: "Boys",
    pan2027: 210,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Parish Priority (Gravesham & Medway borders) + Distance",
    innerCatchmentDistricts: ["Gravesham", "Dartford", "Sevenoaks"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 4.8, aprilDist: 6.2 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 4.4, aprilDist: 5.6 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 4.1, aprilDist: 5.1 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 3.8, aprilDist: 4.8 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 3.5, aprilDist: 4.4 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 4.0,
      aprilDistanceMiles: 5.2
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2024",
      progress8: "+0.63",
      progress8Rating: "Above average",
      attainment8: 75.4,
      grade5PlusEngMath: 96,
      grade7PlusEngMath: 69,
      russellGroupOxbridge: "63% Russell Group (5% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 26,
      historicAppealsHeard: 22,
      historicAppealsUpheld: 4,
      appealNote: "Good appeal success for Gravesham resident boys."
    }
  },
  {
    name: "Mayfield Grammar School",
    shortName: "Mayfield Girls",
    urn: 137835,
    dfeNumber: "886/4006",
    postcode: "DA11 0JE",
    address: "Pelham Road",
    town: "Gravesend",
    district: "Gravesham",
    gender: "Girls",
    pan2027: 180,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Parish Priority (Gravesham) + Distance Core",
    innerCatchmentDistricts: ["Gravesham", "Dartford", "Sevenoaks"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 5.5, aprilDist: 6.9 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 5.1, aprilDist: 6.3 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 4.7, aprilDist: 5.8 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 4.4, aprilDist: 5.4 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 4.1, aprilDist: 5.0 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 4.6,
      aprilDistanceMiles: 5.8
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2023",
      progress8: "+0.59",
      progress8Rating: "Above average",
      attainment8: 74.8,
      grade5PlusEngMath: 96,
      grade7PlusEngMath: 68,
      russellGroupOxbridge: "61% Russell Group (4% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 22,
      historicAppealsHeard: 18,
      historicAppealsUpheld: 3,
      appealNote: "High demand from Gravesham and North Kent borders."
    }
  },
  {
    name: "Simon Langton Girls' Grammar School",
    shortName: "Simon Langton Girls",
    urn: 136713,
    dfeNumber: "886/4050",
    postcode: "CT1 3QR",
    address: "Old Dover Road",
    town: "Canterbury",
    district: "Canterbury",
    gender: "Girls",
    pan2027: 165,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Distance in East Kent Parishes",
    innerCatchmentDistricts: ["Canterbury", "Swale", "Dover", "Thanet", "Ashford"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 9.4, aprilDist: 12.0 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 8.8, aprilDist: 11.2 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 8.2, aprilDist: 10.5 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 7.9, aprilDist: 10.0 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 7.5, aprilDist: 9.5 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 8.2,
      aprilDistanceMiles: 10.5
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2023",
      progress8: "+0.51",
      progress8Rating: "Above average",
      attainment8: 74.3,
      grade5PlusEngMath: 95,
      grade7PlusEngMath: 67,
      russellGroupOxbridge: "64% Russell Group (6% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 24,
      historicAppealsHeard: 20,
      historicAppealsUpheld: 5,
      appealNote: "Pure distance school once qualified; appeals very favorable if nearby."
    }
  },
  {
    name: "Barton Court Grammar School",
    shortName: "Barton Court",
    urn: 136385,
    dfeNumber: "886/4501",
    postcode: "CT1 1PH",
    address: "Longport",
    town: "Canterbury",
    district: "Canterbury",
    gender: "Mixed",
    pan2027: 180,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Pure Distance in Canterbury & Surrounds",
    innerCatchmentDistricts: ["Canterbury", "Thanet", "Dover"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 8.2, aprilDist: 10.6 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 7.6, aprilDist: 9.8 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 7.1, aprilDist: 9.1 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 6.8, aprilDist: 8.6 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 6.4, aprilDist: 8.1 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 7.2,
      aprilDistanceMiles: 9.2
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2023",
      progress8: "+0.64",
      progress8Rating: "Above average",
      attainment8: 75.9,
      grade5PlusEngMath: 97,
      grade7PlusEngMath: 70,
      russellGroupOxbridge: "63% Russell Group (5% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 25,
      historicAppealsHeard: 21,
      historicAppealsUpheld: 4,
      appealNote: "Only co-ed grammar in Canterbury; strong demand from boys and girls."
    }
  },
  {
    name: "Queen Elizabeth's Grammar School",
    shortName: "Queen Elizabeth's (Faversham)",
    urn: 136361,
    dfeNumber: "886/5410",
    postcode: "ME13 7BQ",
    address: "Abbey Place",
    town: "Faversham",
    district: "Swale",
    gender: "Mixed",
    pan2027: 144,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Pure Distance in Faversham & Swale/Canterbury borders",
    innerCatchmentDistricts: ["Swale", "Canterbury"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 7.2, aprilDist: 9.4 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 6.7, aprilDist: 8.7 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 6.2, aprilDist: 8.1 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 5.9, aprilDist: 7.6 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 5.6, aprilDist: 7.2 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 6.3,
      aprilDistanceMiles: 8.0
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2022",
      progress8: "+0.58",
      progress8Rating: "Above average",
      attainment8: 74.6,
      grade5PlusEngMath: 96,
      grade7PlusEngMath: 68,
      russellGroupOxbridge: "62% Russell Group (5% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 18,
      historicAppealsHeard: 15,
      historicAppealsUpheld: 4,
      appealNote: "Excellent option for ME13 and Swale candidates; high HTA admission success."
    }
  },
  {
    name: "Borden Grammar School",
    shortName: "Borden",
    urn: 137396,
    dfeNumber: "886/4055",
    postcode: "ME10 4DB",
    address: "Avenue of Remembrance",
    town: "Sittingbourne",
    district: "Swale",
    gender: "Boys",
    pan2027: 150,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Pure Distance in Sittingbourne, Isle of Sheppey & Swale",
    innerCatchmentDistricts: ["Swale", "Medway", "Maidstone"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 9.5, aprilDist: 12.0 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 8.9, aprilDist: 11.3 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 8.4, aprilDist: 10.7 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 8.0, aprilDist: 10.1 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 7.6, aprilDist: 9.6 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 8.5,
      aprilDistanceMiles: 11.0
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2023",
      progress8: "+0.35",
      progress8Rating: "Average",
      attainment8: 70.8,
      grade5PlusEngMath: 93,
      grade7PlusEngMath: 58,
      russellGroupOxbridge: "51% Russell Group (3% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 16,
      historicAppealsHeard: 13,
      historicAppealsUpheld: 4,
      appealNote: "Wide radius covers Isle of Sheppey and Faversham boys."
    }
  },
  {
    name: "Highsted Grammar School",
    shortName: "Highsted",
    urn: 137400,
    dfeNumber: "886/4056",
    postcode: "ME10 4PT",
    address: "Highsted Road",
    town: "Sittingbourne",
    district: "Swale",
    gender: "Girls",
    pan2027: 150,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Pure Distance in Sittingbourne & Swale",
    innerCatchmentDistricts: ["Swale", "Medway", "Maidstone"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 9.8, aprilDist: 12.5 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 9.2, aprilDist: 11.8 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 8.6, aprilDist: 11.0 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 8.2, aprilDist: 10.4 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 7.8, aprilDist: 9.8 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 8.8,
      aprilDistanceMiles: 11.2
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2023",
      progress8: "+0.62",
      progress8Rating: "Above average",
      attainment8: 75.3,
      grade5PlusEngMath: 96,
      grade7PlusEngMath: 69,
      russellGroupOxbridge: "62% Russell Group (4% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 15,
      historicAppealsHeard: 12,
      historicAppealsUpheld: 3,
      appealNote: "Generous distance radius across Swale."
    }
  },
  {
    name: "Highworth Grammar School",
    shortName: "Highworth",
    urn: 136390,
    dfeNumber: "886/4043",
    postcode: "TN24 8UD",
    address: "Maidstone Road",
    town: "Ashford",
    district: "Ashford",
    gender: "Girls",
    pan2027: 210,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Distance in Ashford District & Surrounds",
    innerCatchmentDistricts: ["Ashford", "Folkestone & Hythe", "Maidstone"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 11.2, aprilDist: 14.5 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 10.5, aprilDist: 13.8 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 9.8, aprilDist: 12.9 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 9.4, aprilDist: 12.2 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 8.9, aprilDist: 11.5 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 10.0,
      aprilDistanceMiles: 13.0
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2023",
      progress8: "+0.67",
      progress8Rating: "Well above average",
      attainment8: 77.4,
      grade5PlusEngMath: 98,
      grade7PlusEngMath: 73,
      russellGroupOxbridge: "67% Russell Group (7% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 24,
      historicAppealsHeard: 20,
      historicAppealsUpheld: 5,
      appealNote: "High intake from rural Ashford villages; high appeal success for local girls."
    }
  },
  {
    name: "The Norton Knatchbull School",
    shortName: "Norton Knatchbull",
    urn: 137833,
    dfeNumber: "886/5407",
    postcode: "TN24 0QJ",
    address: "Hythe Road",
    town: "Ashford",
    district: "Ashford",
    gender: "Boys",
    pan2027: 210,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Distance in Ashford District & Surrounds",
    innerCatchmentDistricts: ["Ashford", "Folkestone & Hythe", "Maidstone"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 11.8, aprilDist: 15.2 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 11.0, aprilDist: 14.4 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 10.3, aprilDist: 13.5 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 9.8, aprilDist: 12.8 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 9.4, aprilDist: 12.1 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 10.5,
      aprilDistanceMiles: 13.5
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2023",
      progress8: "+0.39",
      progress8Rating: "Above average",
      attainment8: 71.9,
      grade5PlusEngMath: 94,
      grade7PlusEngMath: 61,
      russellGroupOxbridge: "54% Russell Group (4% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 20,
      historicAppealsHeard: 16,
      historicAppealsUpheld: 4,
      appealNote: "Established grammar with wide catchment extending into Marsh parishes."
    }
  },
  {
    name: "The Folkestone School for Girls",
    shortName: "Folkestone Girls",
    urn: 136388,
    dfeNumber: "886/4037",
    postcode: "CT20 3RB",
    address: "Coolinge Lane",
    town: "Folkestone",
    district: "Folkestone & Hythe",
    gender: "Girls",
    pan2027: 174,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Distance in Folkestone & Hythe District",
    innerCatchmentDistricts: ["Folkestone & Hythe", "Dover"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 8.5, aprilDist: 11.0 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 7.9, aprilDist: 10.3 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 7.4, aprilDist: 9.6 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 7.1, aprilDist: 9.1 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 6.8, aprilDist: 8.6 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 7.5,
      aprilDistanceMiles: 9.8
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2022",
      progress8: "+0.66",
      progress8Rating: "Well above average",
      attainment8: 76.8,
      grade5PlusEngMath: 97,
      grade7PlusEngMath: 71,
      russellGroupOxbridge: "65% Russell Group (5% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 18,
      historicAppealsHeard: 14,
      historicAppealsUpheld: 4,
      appealNote: "Coastal school; offers places to almost all qualified applicants in Folkestone/Hythe."
    }
  },
  {
    name: "The Harvey Grammar School",
    shortName: "Harvey Boys",
    urn: 136387,
    dfeNumber: "886/5404",
    postcode: "CT19 5JY",
    address: "Cheriton Road",
    town: "Folkestone",
    district: "Folkestone & Hythe",
    gender: "Boys",
    pan2027: 150,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Distance in Folkestone & Hythe District",
    innerCatchmentDistricts: ["Folkestone & Hythe", "Dover"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 9.1, aprilDist: 11.8 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 8.5, aprilDist: 11.0 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 7.9, aprilDist: 10.2 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 7.5, aprilDist: 9.7 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 7.2, aprilDist: 9.2 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 8.0,
      aprilDistanceMiles: 10.2
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2023",
      progress8: "+0.41",
      progress8Rating: "Above average",
      attainment8: 72.5,
      grade5PlusEngMath: 95,
      grade7PlusEngMath: 62,
      russellGroupOxbridge: "56% Russell Group (4% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 16,
      historicAppealsHeard: 13,
      historicAppealsUpheld: 3,
      appealNote: "Historic boys grammar; comfortable distance cut-off for local residents."
    }
  },
  {
    name: "Dover Grammar School for Boys",
    shortName: "Dover Boys",
    urn: 136386,
    dfeNumber: "886/5403",
    postcode: "CT17 0DQ",
    address: "Astor Avenue",
    town: "Dover",
    district: "Dover",
    gender: "Boys",
    pan2027: 150,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Distance in Dover District",
    innerCatchmentDistricts: ["Dover", "Folkestone & Hythe"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 10.5, aprilDist: 13.5 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 9.8, aprilDist: 12.6 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 9.2, aprilDist: 11.9 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 8.8, aprilDist: 11.3 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 8.4, aprilDist: 10.8 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 9.5,
      aprilDistanceMiles: 12.0
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2023",
      progress8: "+0.33",
      progress8Rating: "Average",
      attainment8: 70.4,
      grade5PlusEngMath: 92,
      grade7PlusEngMath: 55,
      russellGroupOxbridge: "48% Russell Group (3% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 14,
      historicAppealsHeard: 11,
      historicAppealsUpheld: 4,
      appealNote: "New building; easily accommodates all qualified local boys."
    }
  },
  {
    name: "Dover Grammar School for Girls",
    shortName: "Dover Girls",
    urn: 136389,
    dfeNumber: "886/4036",
    postcode: "CT16 2PZ",
    address: "Frith Road",
    town: "Dover",
    district: "Dover",
    gender: "Girls",
    pan2027: 140,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Distance in Dover District",
    innerCatchmentDistricts: ["Dover", "Folkestone & Hythe"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 9.8, aprilDist: 12.6 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 9.2, aprilDist: 11.8 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 8.6, aprilDist: 11.1 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 8.3, aprilDist: 10.6 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 7.9, aprilDist: 10.1 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 8.8,
      aprilDistanceMiles: 11.5
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2023",
      progress8: "+0.48",
      progress8Rating: "Above average",
      attainment8: 73.6,
      grade5PlusEngMath: 95,
      grade7PlusEngMath: 64,
      russellGroupOxbridge: "58% Russell Group (4% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 15,
      historicAppealsHeard: 12,
      historicAppealsUpheld: 3,
      appealNote: "Generous allocation for local Dover and Deal applicants."
    }
  },
  {
    name: "Chatham & Clarendon Grammar School",
    shortName: "Chatham & Clarendon",
    urn: 136360,
    dfeNumber: "886/5414",
    postcode: "CT11 7PS",
    address: "Chatham Street",
    town: "Ramsgate",
    district: "Thanet",
    gender: "Mixed",
    pan2027: 250,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Pure Distance in Thanet District",
    innerCatchmentDistricts: ["Thanet", "Dover", "Canterbury"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 8.8, aprilDist: 11.5 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 8.2, aprilDist: 10.7 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 7.7, aprilDist: 10.0 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 7.3, aprilDist: 9.5 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 7.0, aprilDist: 9.1 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 8.0,
      aprilDistanceMiles: 10.5
    },
    academicMetrics: {
      ofsted: "Good",
      ofstedDate: "2023",
      progress8: "+0.44",
      progress8Rating: "Above average",
      attainment8: 72.9,
      grade5PlusEngMath: 94,
      grade7PlusEngMath: 63,
      russellGroupOxbridge: "55% Russell Group (4% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 22,
      historicAppealsHeard: 18,
      historicAppealsUpheld: 5,
      appealNote: "Largest school in Thanet; high intake and strong appeal reception."
    }
  },
  {
    name: "Dane Court Grammar School",
    shortName: "Dane Court",
    urn: 136363,
    dfeNumber: "886/5415",
    postcode: "CT10 2RT",
    address: "Broadstairs Road",
    town: "Broadstairs",
    district: "Thanet",
    gender: "Mixed",
    pan2027: 165,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Pure Distance in Thanet & Surrounds",
    innerCatchmentDistricts: ["Thanet", "Dover"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 7.4, aprilDist: 9.6 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 6.9, aprilDist: 8.9 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 6.4, aprilDist: 8.3 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 6.1, aprilDist: 7.9 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 5.8, aprilDist: 7.5 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 6.8,
      aprilDistanceMiles: 8.8
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2022",
      progress8: "+0.69",
      progress8Rating: "Well above average",
      attainment8: 77.2,
      grade5PlusEngMath: 98,
      grade7PlusEngMath: 74,
      russellGroupOxbridge: "67% Russell Group (6% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 20,
      historicAppealsHeard: 16,
      historicAppealsUpheld: 4,
      appealNote: "Offers IB Middle Years Programme; high academic reputation in East Kent."
    }
  },
  {
    name: "Sir Roger Manwood's School",
    shortName: "Sir Roger Manwood's",
    urn: 136364,
    dfeNumber: "886/5411",
    postcode: "CT13 9JX",
    address: "Manwood Road",
    town: "Sandwich",
    district: "Dover",
    gender: "Mixed",
    pan2027: 150,
    archetype: "C",
    statutoryThresholdOffset: null,
    catchmentType: "Distance in Named Parishes (Sandwich, Deal, Eastry) + Outer",
    innerCatchmentDistricts: ["Dover", "Thanet", "Canterbury"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 8.9, aprilDist: 11.4 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 8.3, aprilDist: 10.6 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 7.7, aprilDist: 9.9 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 7.4, aprilDist: 9.4 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 7.0, aprilDist: 9.0 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 7.8,
      aprilDistanceMiles: 10.0
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2024",
      progress8: "+0.61",
      progress8Rating: "Above average",
      attainment8: 76.1,
      grade5PlusEngMath: 97,
      grade7PlusEngMath: 71,
      russellGroupOxbridge: "65% Russell Group (6% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 18,
      historicAppealsHeard: 15,
      historicAppealsUpheld: 3,
      appealNote: "Day and boarding school; offers high certainty for Dover/Thanet border families."
    }
  },

  // Archetype D: Boarding / Specialised Year 7 Entry
  {
    name: "Cranbrook School",
    shortName: "Cranbrook",
    urn: 136707,
    dfeNumber: "886/5405",
    postcode: "TN17 3JD",
    address: "Waterloo Road",
    town: "Cranbrook",
    district: "Tunbridge Wells",
    gender: "Mixed",
    pan2027: 120, // Day & Boarding entry
    archetype: "D",
    statutoryThresholdOffset: null,
    catchmentType: "Strict 8.5-mile Catchment Radius + Boarding Places",
    innerCatchmentDistricts: ["Tunbridge Wells", "Tonbridge & Malling", "Maidstone", "Ashford"],
    historicalCutoffs: {
      2022: { marchScore: 332, aprilScore: 332, marchDist: 8.5, aprilDist: 8.5 },
      2023: { marchScore: 332, aprilScore: 332, marchDist: 8.5, aprilDist: 8.5 },
      2024: { marchScore: 332, aprilScore: 332, marchDist: 8.5, aprilDist: 8.5 },
      2025: { marchScore: 332, aprilScore: 332, marchDist: 8.5, aprilDist: 8.5 },
      2026: { marchScore: 345, aprilScore: 345, marchDist: 8.5, aprilDist: 8.5 }
    },
    projected2027Cutoff: {
      marchScore: 345,
      marchDistanceMiles: 8.5, // Strict statutory radius
      aprilDistanceMiles: 8.5
    },
    academicMetrics: {
      ofsted: "Outstanding",
      ofstedDate: "2023",
      progress8: "+0.65",
      progress8Rating: "Well above average",
      attainment8: 77.8,
      grade5PlusEngMath: 98,
      grade7PlusEngMath: 76,
      russellGroupOxbridge: "70% Russell Group (8% Oxbridge)"
    },
    appealStats: {
      historicAppealsLodged: 16,
      historicAppealsHeard: 13,
      historicAppealsUpheld: 2,
      appealNote: "Strict statutory 8.5-mile catchment radius enforced for day applicants."
    }
  }
];

// Enrich each school with live Postcodes.io OSGB36 coordinates
async function enrichSchools() {
  console.log(`Enriching ${schoolsData.length} Kent grammar schools via Postcodes.io...`);
  const enriched = [];

  for (const s of schoolsData) {
    const cleanPostcode = s.postcode.replace(/\s+/g, '');
    try {
      const resp = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
      const data = await resp.json();
      if (data.status === 200 && data.result) {
        const r = data.result;
        s.eastings = r.eastings;
        s.northings = r.northings;
        s.latitude = r.latitude;
        s.longitude = r.longitude;
        s.postcodeParish = r.parish;
        s.postcodeDistrict = r.admin_district;
        console.log(`[OK] ${s.name} (${s.postcode}): E=${s.eastings}, N=${s.northings}, Lat=${s.latitude}, Lng=${s.longitude}`);
      } else {
        console.warn(`[WARN] Postcode lookup failed for ${s.name} (${s.postcode}):`, data.error);
      }
    } catch (err) {
      console.error(`[ERROR] Network error for ${s.name}:`, err.message);
    }
    enriched.push(s);
  }

  // Validate all coordinates per PRD Phase 2 step 2:
  // "Validate that all 32 schools have non-null Eastings and Northings within Kent (Eastings in [530000, 645000], Northings in [130000, 180000])."
  let validCount = 0;
  for (const s of enriched) {
    if (!s.eastings || !s.northings) {
      throw new Error(`School ${s.name} missing coordinates!`);
    }
    if (s.eastings < 530000 || s.eastings > 645000 || s.northings < 130000 || s.northings > 180000) {
      throw new Error(`School ${s.name} coordinates outside Kent bounds: E=${s.eastings}, N=${s.northings}`);
    }
    validCount++;
  }
  console.log(`All ${validCount} schools passed OSGB36 coordinate bounds validation ([530000, 645000], [130000, 180000])!`);

  const outputPath = path.join(outputDir, 'kent_schools_32.json');
  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2), 'utf8');
  console.log(`Saved ${enriched.length} schools to ${outputPath}`);
}

enrichSchools().catch(err => {
  console.error('Fatal error building schools metadata:', err);
  process.exit(1);
});
