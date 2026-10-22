export type Gender = 'M' | 'F';

export interface UserProfile {
  scoreMode: 'detailed' | 'quick';
  english: number;
  maths: number;
  reasoning: number;
  totalScore: number;
  gender: Gender;
  postcode: string;
  kccConfirmedGrammarAssessment: boolean;
  pupilPremium: boolean;
  hasSibling: boolean;
  ehcpOrLookedAfter: boolean;
  // Resolved postcode details
  postcodeData?: {
    eastings: number;
    northings: number;
    latitude: number;
    longitude: number;
    district: string;
    parish: string;
  } | null;
}

export type AdmissionArchetype = 'A' | 'B' | 'C' | 'D';

export type VerdictBadge =
  | 'SAFE OFFER (MARCH)'
  | 'REALISTIC TARGET'
  | 'WAITLIST / APRIL RE-ALLOCATION'
  | 'APPEAL CANDIDATE (MARCH 2027)'
  | 'OUT OF RANGE'
  | 'INELIGIBLE (GENDER)';

export type BadgeTone = 'safe' | 'target' | 'waitlist' | 'appeal' | 'danger' | 'muted';

export interface SchoolCutoffPair {
  catchmentCutoffLabel: string;
  catchmentCutoffValue: string;
  catchmentCutoffDetail: string;

  governorCutoffLabel: string;
  governorCutoffValue: string;
  governorCutoffDetail: string;

  userCategory: 'CATCHMENT' | 'GOVERNOR' | 'DISTANCE_ONLY' | 'INELIGIBLE';
  userCategoryTitle: string;
  userCategoryDescription: string;
  isMeetingCategoryCutoff: boolean;
  categoryMarginText: string;
  activeEvaluationType: 'catchment' | 'governor' | 'distance' | 'none';
}

export interface EligibilityVerdict {
  badge: VerdictBadge;
  tone: BadgeTone;
  distanceMiles: number | null;
  isCatchment: boolean;
  rationale: string;
  actionAdvice: string;
  pathwayUsed: 'score_super_selective' | 'distance_catchment' | 'governor_score' | 'appeal_floor_fail' | 'hta_distance' | 'none';
  projectedCutoffSummary: string;
  cutoffPair?: SchoolCutoffPair;
}

export interface HistoricalCutoffYear {
  marchScore?: number | null;
  aprilScore?: number | null;
  marchDist?: number | null;
  aprilDist?: number | null;
}

export interface AcademicMetrics {
  ofsted: string;
  ofstedDate: string;
  progress8: string;
  progress8Rating: string;
  attainment8: number;
  grade5PlusEngMath: number;
  grade7PlusEngMath: number;
  russellGroupOxbridge: string;
}

export interface AppealStats {
  historicAppealsLodged: number;
  historicAppealsHeard: number;
  historicAppealsUpheld: number;
  appealNote: string;
}

export interface School {
  name: string;
  shortName: string;
  urn: number;
  dfeNumber: string;
  postcode: string;
  address: string;
  town: string;
  district: string;
  gender: 'Boys' | 'Girls' | 'Mixed';
  pan2027: number;
  archetype: AdmissionArchetype;
  statutoryThresholdOffset: number | null;
  priorityFloor2026?: number;
  catchmentType: string;
  innerCatchmentDistricts: string[];
  additionalCampuses?: Array<{
    name: string;
    postcode: string;
    eastings: number;
    northings: number;
    latitude: number;
    longitude: number;
  }>;
  innerQuota?: number;
  outerQuota?: number;
  historicalCutoffs: Record<string, HistoricalCutoffYear>;
  projected2027Cutoff: {
    marchScoreInner?: number;
    marchScoreOuter?: number;
    aprilScoreInner?: number;
    aprilScoreOuter?: number;
    marchScore?: number;
    marchDistanceMiles?: number;
    aprilDistanceMiles?: number;
    marchDistanceInner?: number;
    aprilDistanceInner?: number;
  };
  academicMetrics: AcademicMetrics;
  appealStats: AppealStats;
  eastings: number;
  northings: number;
  latitude: number;
  longitude: number;
  postcodeParish?: string;
  postcodeDistrict?: string;
}

export interface EvaluatedSchool extends School {
  eligibility: EligibilityVerdict;
}

export interface SCAFBlueprint {
  pref1: EvaluatedSchool | null;
  pref2: EvaluatedSchool | null;
  pref3: EvaluatedSchool | null;
  pref4: EvaluatedSchool | null;
  customPreferences?: (EvaluatedSchool | null)[];
  commentary: string;
}

export interface QualificationStatus {
  isQualified: boolean;
  isStandardPass: boolean;
  isHtaOverrideCohort: boolean;
  isSinglePaperFloorFailCohort: boolean;
  failedPapers: string[];
  headline: string;
  description: string;
}

export interface InflationRankResult {
  score2026: number;
  rank2026: number;
  totalGrammar2026: number;
  percentileTop: number;
  equiv2025Score: number;
  equiv2025Rank: number;
  pointDiff: number;
  explanation: string;
}
