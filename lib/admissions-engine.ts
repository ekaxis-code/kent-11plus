import {
  UserProfile,
  School,
  EvaluatedSchool,
  EligibilityVerdict,
  QualificationStatus,
  InflationRankResult,
  SCAFBlueprint,
  SchoolCutoffPair
} from '../types/admissions';

/**
 * Validates qualification status against KCC 2026 thresholds:
 * Aggregate Pass: 345
 * Single Paper Floor: 111 (English, Maths, Reasoning)
 */
export function checkQualificationStatus(profile: UserProfile): QualificationStatus {
  const { scoreMode, english, maths, reasoning, totalScore, kccConfirmedGrammarAssessment } = profile;

  let computedTotal = totalScore;
  const failedPapers: string[] = [];

  if (scoreMode === 'detailed') {
    computedTotal = english + maths + reasoning;
    if (english < 111) failedPapers.push(`English (${english} < 111)`);
    if (maths < 111) failedPapers.push(`Maths (${maths} < 111)`);
    if (reasoning < 111) failedPapers.push(`Reasoning (${reasoning} < 111)`);
  }

  const hasFloorFail = failedPapers.length > 0;
  const isScoreAbovePass = computedTotal >= 345;

  // Anomaly A: HTA Override Cohort (733 pupils)
  // Scored < 345 on test day, but primary school HTA panel awarded Grammar assessment
  if (!isScoreAbovePass && kccConfirmedGrammarAssessment) {
    return {
      isQualified: true,
      isStandardPass: false,
      isHtaOverrideCohort: true,
      isSinglePaperFloorFailCohort: false,
      failedPapers,
      headline: 'Grammar Assessed via Headteacher Assessment (HTA)',
      description: `Your child scored ${computedTotal} (< 345), but received a formal Grammar Assessment from the Headteacher Assessment Panel. They are in the 733-pupil HTA cohort and 100% eligible for pure distance/catchment grammar schools on equal footing with a 423 score.`
    };
  }

  // Anomaly B: Single-Paper Floor Failure Trap (520 pupils)
  // Scored >= 345 Total, but failed single paper floor (< 111)
  if (isScoreAbovePass && (hasFloorFail || !kccConfirmedGrammarAssessment)) {
    return {
      isQualified: false,
      isStandardPass: false,
      isHtaOverrideCohort: false,
      isSinglePaperFloorFailCohort: true,
      failedPapers,
      headline: 'Single-Paper Floor Failure Trap (Assessed High School)',
      description: `Your child scored ${computedTotal} (Total ≥ 345), but fell below the 111 floor in ${failedPapers.join(', ') || 'an individual paper'}. They belong to the 520-pupil cohort assessed for High School. To secure a grammar place, you must name the school on your SCAF by 2 Nov 2026 to receive a formal refusal on 1 March 2027 and lodge an Independent Admission Appeal.`
    };
  }

  // Standard Automatic Grammar Pass
  if (isScoreAbovePass && !hasFloorFail && kccConfirmedGrammarAssessment) {
    return {
      isQualified: true,
      isStandardPass: true,
      isHtaOverrideCohort: false,
      isSinglePaperFloorFailCohort: false,
      failedPapers: [],
      headline: 'Officially Grammar Assessed (Standard Automatic Pass)',
      description: `Total score of ${computedTotal} clears the 345 threshold, and all individual papers meet or exceed the 111 floor. Fully eligible for all Kent grammar admissions pathways.`
    };
  }

  // Standard High School Assessment
  return {
    isQualified: false,
    isStandardPass: false,
    isHtaOverrideCohort: false,
    isSinglePaperFloorFailCohort: false,
    failedPapers,
    headline: 'High School Assessed',
    description: `Total score of ${computedTotal} is below the 345 qualifying threshold. Can be named on SCAF to trigger an Independent Admission Appeal, or targeted towards excellent non-selective comprehensive schools.`
  };
}

/**
 * Calculates 2026 Cumulative Grammar Rank and 2025 Equivalent Score
 */
export function calculate2026RankAndEquivalents(score: number, distributionsData?: any): InflationRankResult {
  const boundedScore = Math.max(207, Math.min(423, Math.round(score)));

  // If precomputed dataset is loaded
  if (distributionsData && distributionsData.cumulativeRanks && distributionsData.equivalents2026) {
    const rank26 = distributionsData.cumulativeRanks['2026']?.[boundedScore] || 4410;
    const totalG = distributionsData.metadata?.cohort2026?.totalGrammarAssessed || 8820;
    const equiv = distributionsData.equivalents2026?.[boundedScore]?.['2025'] || { equivalentScore: boundedScore - 12, diff: -12 };
    const pct = Number(((rank26 / totalG) * 100).toFixed(1));

    return {
      score2026: boundedScore,
      rank2026: rank26,
      totalGrammar2026: totalG,
      percentileTop: pct,
      equiv2025Score: equiv.equivalentScore,
      equiv2025Rank: equiv.histRank || rank26,
      pointDiff: equiv.diff,
      explanation: `A 2026 score of ${boundedScore} holds rank #${rank26} (Top ${pct}% of grammar passes), which corresponds to ${equiv.equivalentScore} in 2025 (${equiv.diff} pts deflation).`
    };
  }

  // Fallback empirical calculation if data not yet in memory
  // Empirical rule: 384 -> 372 (-12 pts)
  const approxDiff = boundedScore >= 350 ? -12 : -10;
  const approxEquiv = boundedScore + approxDiff;
  const approxRank = Math.round(8820 * (1 - (boundedScore - 313) / (423 - 313)));

  return {
    score2026: boundedScore,
    rank2026: Math.max(1, approxRank),
    totalGrammar2026: 8820,
    percentileTop: Number(((approxRank / 8820) * 100).toFixed(1)),
    equiv2025Score: approxEquiv,
    equiv2025Rank: Math.max(1, approxRank),
    pointDiff: approxDiff,
    explanation: `A 2026 score of ${boundedScore} translates to approximately ${approxEquiv} in 2025 (${approxDiff} pts deflation).`
  };
}

/**
 * OSGB36 Euclidean straight-line distance in miles
 */
export function calculateOSGB36DistanceMiles(
  homeE: number,
  homeN: number,
  schoolE: number,
  schoolN: number
): number {
  const dx = homeE - schoolE;
  const dy = homeN - schoolN;
  const meters = Math.sqrt(dx * dx + dy * dy);
  return Number((meters / 1609.344).toFixed(2));
}

/**
 * Internal school eligibility evaluator
 */
function evaluateSchoolEligibilityInternal(
  profile: UserProfile,
  school: School,
  distributionsData?: any
): EligibilityVerdict {
  // 1. Gender Eligibility Check
  if (school.gender === 'Boys' && profile.gender !== 'M') {
    return {
      badge: 'INELIGIBLE (GENDER)',
      tone: 'muted',
      distanceMiles: null,
      isCatchment: false,
      rationale: `${school.name} admits Boys only at Year 7.`,
      actionAdvice: 'Exclude from SCAF application list.',
      pathwayUsed: 'none',
      projectedCutoffSummary: 'Boys Only'
    };
  }

  if (school.gender === 'Girls' && profile.gender !== 'F') {
    return {
      badge: 'INELIGIBLE (GENDER)',
      tone: 'muted',
      distanceMiles: null,
      isCatchment: false,
      rationale: `${school.name} admits Girls only at Year 7.`,
      actionAdvice: 'Exclude from SCAF application list.',
      pathwayUsed: 'none',
      projectedCutoffSummary: 'Girls Only'
    };
  }

  // Calculate distance if postcode coordinates are available
  let distance: number | null = null;
  if (profile.postcodeData?.eastings && profile.postcodeData?.northings) {
    distance = calculateOSGB36DistanceMiles(
      profile.postcodeData.eastings,
      profile.postcodeData.northings,
      school.eastings,
      school.northings
    );

    // If school has additional campuses (e.g. TWGSB Sevenoaks campus, Weald of Kent Sevenoaks campus),
    // measure to the nearest campus as per KCC admissions arrangements
    if (school.additionalCampuses && school.additionalCampuses.length > 0) {
      for (const campus of school.additionalCampuses) {
        const campusDist = calculateOSGB36DistanceMiles(
          profile.postcodeData.eastings,
          profile.postcodeData.northings,
          campus.eastings,
          campus.northings
        );
        if (campusDist < distance) {
          distance = campusDist;
        }
      }
    }
  }

  const userDistrict = profile.postcodeData?.district || '';
  const isCatchment = school.innerCatchmentDistricts.some(d =>
    userDistrict.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(userDistrict.toLowerCase())
  );

  const qualStatus = checkQualificationStatus(profile);
  const totalScore = profile.scoreMode === 'detailed'
    ? profile.english + profile.maths + profile.reasoning
    : profile.totalScore;

  // 2. Anomaly B: Single-Paper Floor Fail Cohort (520 pupils)
  if (qualStatus.isSinglePaperFloorFailCohort) {
    // For non-super-selective schools (Archetypes B & C), if within commutable radius (<= 12.5 mi)
    // or if score clears governor places, candidate has strong academic grounds for Independent Appeal
    const isNearby = distance !== null ? distance <= 12.5 : true;

    if (school.archetype !== 'A' && isNearby) {
      return {
        badge: 'APPEAL CANDIDATE (MARCH 2027)',
        tone: 'appeal',
        distanceMiles: distance,
        isCatchment,
        rationale: `Child achieved strong aggregate score ${totalScore} (≥ 345) but missed 111 floor in ${qualStatus.failedPapers.join(', ') || 'one paper'}. Highly viable candidate for Independent Admission Appeal on academic grounds.`,
        actionAdvice: 'Apply Now to Trigger Appeal: Must list on SCAF by 2 Nov 2026 to receive official refusal on 1 March 2027, unlocking right to lodge Independent Appeal.',
        pathwayUsed: 'appeal_floor_fail',
        projectedCutoffSummary: distance !== null ? `${distance} mi (Appeal pathway)` : 'Appeal pathway'
      };
    } else {
      return {
        badge: 'OUT OF RANGE',
        tone: 'danger',
        distanceMiles: distance,
        isCatchment,
        rationale: `Super-selective cut-offs or excessive distance make an appeal prejudice argument unviable.`,
        actionAdvice: 'Do not use a SCAF preference here; target schools where academic appeal probability is high.',
        pathwayUsed: 'none',
        projectedCutoffSummary: 'Out of range for appeal'
      };
    }
  }

  // Not qualified and no HTA pass
  if (!qualStatus.isQualified && !qualStatus.isHtaOverrideCohort) {
    return {
      badge: 'OUT OF RANGE',
      tone: 'danger',
      distanceMiles: distance,
      isCatchment,
      rationale: `Score of ${totalScore} is below the 345 qualifying threshold and no HTA pass was awarded.`,
      actionAdvice: 'Focus SCAF slots on suitable local non-selective schools.',
      pathwayUsed: 'none',
      projectedCutoffSummary: 'Threshold not met'
    };
  }

  // 3. Archetype A: Pure Super-Selective (Judd, Skinners, TGS, Dartford Boys)
  if (school.archetype === 'A') {
    // Anomaly A check: HTA pass (< 345) cannot clear super-selective score cut-offs
    if (qualStatus.isHtaOverrideCohort) {
      return {
        badge: 'OUT OF RANGE',
        tone: 'danger',
        distanceMiles: distance,
        isCatchment,
        rationale: `HTA Grammar assessment is valid for distance schools, but super-selective schools rank purely by test score (requires ~385–405+).`,
        actionAdvice: 'Do not list on SCAF; use preferences for pure distance grammar schools where HTA assessment is fully honored.',
        pathwayUsed: 'score_super_selective',
        projectedCutoffSummary: 'Score cut-off requires 385+'
      };
    }

    // Specific School Rules:
    // The Skinners' School (statutory floor 385 for local priority)
    if (school.shortName.includes("Skinners'")) {
      const localFloor = school.priorityFloor2026 || 385;
      if (isCatchment) {
        if (totalScore >= localFloor + 7) {
          return {
            badge: 'SAFE OFFER (MARCH)',
            tone: 'safe',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} comfortably clears the new statutory local priority floor of ${localFloor} (Threshold + 40).`,
            actionAdvice: 'Apply Now (SCAF): Ideal high-confidence preference.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Priority floor: ${localFloor} (Score: ${totalScore})`
          };
        } else if (totalScore >= localFloor) {
          return {
            badge: 'REALISTIC TARGET',
            tone: 'target',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} meets the 2026 statutory local priority floor of ${localFloor} (Threshold + 40).`,
            actionAdvice: 'Apply Now (SCAF): Place as 1st or 2nd preference on SCAF form.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Priority floor: ${localFloor} (Score: ${totalScore})`
          };
        } else if (totalScore >= localFloor - 5) {
          return {
            badge: 'WAITLIST / APRIL RE-ALLOCATION',
            tone: 'waitlist',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} is ${localFloor - totalScore} pts below the new statutory local priority floor of ${localFloor}. May enter outer pool or waitlist.`,
            actionAdvice: 'Borderline / Outer Pool: Consider as aspirational Reach or Waitlist target.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Local floor: ${localFloor} (Miss by ${localFloor - totalScore} pts)`
          };
        } else {
          return {
            badge: 'OUT OF RANGE',
            tone: 'danger',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} is >5 pts below the local priority floor of ${localFloor}.`,
            actionAdvice: 'Do not waste a SCAF preference; rank TWGSB or other distance schools instead.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Cut-off: ${localFloor}`
          };
        }
      } else {
        // Outer catchment for Skinners: requires high score (~398+)
        if (totalScore >= 398) {
          return {
            badge: 'REALISTIC TARGET',
            tone: 'target',
            distanceMiles: distance,
            isCatchment: false,
            rationale: `Outer score of ${totalScore} reaches projected outer pool cut-off of 398.`,
            actionAdvice: 'Apply Now (SCAF): High-ambition choice.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: 'Outer cut-off ~398'
          };
        } else {
          return {
            badge: 'OUT OF RANGE',
            tone: 'danger',
            distanceMiles: distance,
            isCatchment: false,
            rationale: `Outer applicants require ~398+ to gain an outer governor place.`,
            actionAdvice: 'Out of range for outer pool places.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: 'Outer cut-off ~398'
          };
        }
      }
    }

    // The Judd School (2026 entry cut-off 389, projected 2027 entry cut-off Inner 400, Outer 408)
    if (school.shortName.includes("Judd")) {
      const projInner = school.projected2027Cutoff.marchScoreInner || 400;
      const projOuter = school.projected2027Cutoff.marchScoreOuter || 408;
      const targetCutoff = isCatchment ? projInner : projOuter;

      if (totalScore >= targetCutoff + 3) {
        return {
          badge: 'SAFE OFFER (MARCH)',
          tone: 'safe',
          distanceMiles: distance,
          isCatchment,
          rationale: `Score of ${totalScore} clears inflation-adjusted projected cut-off of ${targetCutoff} with margin.`,
          actionAdvice: 'Apply Now (SCAF): Top preference.',
          pathwayUsed: 'score_super_selective',
          projectedCutoffSummary: `Projected cut-off: ${targetCutoff}`
        };
      } else if (totalScore >= targetCutoff - 2) {
        return {
          badge: 'REALISTIC TARGET',
          tone: 'target',
          distanceMiles: distance,
          isCatchment,
          rationale: `Score of ${totalScore} is within competitive range of projected cut-off ${targetCutoff}.`,
          actionAdvice: 'Apply Now (SCAF): Place as Preference 1.',
          pathwayUsed: 'score_super_selective',
          projectedCutoffSummary: `Projected cut-off: ${targetCutoff}`
        };
      } else if (totalScore >= targetCutoff - 7) {
        return {
          badge: 'WAITLIST / APRIL RE-ALLOCATION',
          tone: 'waitlist',
          distanceMiles: distance,
          isCatchment,
          rationale: `Score of ${totalScore} is just below projected March cut-off (${targetCutoff}), but competitive for April waitlist reallocation.`,
          actionAdvice: 'Name high on SCAF to secure automatic waiting list eligibility in March/April 2027.',
          pathwayUsed: 'score_super_selective',
          projectedCutoffSummary: `Projected: ${targetCutoff} (Waitlist: ${targetCutoff - 3})`
        };
      } else {
        return {
          badge: 'OUT OF RANGE',
          tone: 'danger',
          distanceMiles: distance,
          isCatchment,
          rationale: `Score of ${totalScore} (2025 equiv ~${totalScore - 12}) is significantly below projected cut-off of ${targetCutoff} (2026 entry cut-off was 389).`,
          actionAdvice: 'Do not waste a SCAF slot on Judd; reserve preferences for viable targets.',
          pathwayUsed: 'score_super_selective',
          projectedCutoffSummary: `Projected cut-off: ${targetCutoff}`
        };
      }
    }

    // Dartford Grammar School (Boys)
    if (school.shortName.includes("Dartford Boys")) {
      const localFloor = school.priorityFloor2026 || 385;
      const isLocalDartford = userDistrict.toLowerCase().includes('dartford') || (profile.postcode.trim().toUpperCase().startsWith('DA1') || profile.postcode.trim().toUpperCase().startsWith('DA2'));

      if (isLocalDartford) {
        if (totalScore >= localFloor + 6) {
          return {
            badge: 'SAFE OFFER (MARCH)',
            tone: 'safe',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} clears the local statutory priority floor of ${localFloor} (Threshold + 40).`,
            actionAdvice: 'Apply Now (SCAF): Strong anchor.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Local floor: ${localFloor}`
          };
        } else if (totalScore >= localFloor) {
          return {
            badge: 'REALISTIC TARGET',
            tone: 'target',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} meets the local statutory priority floor of ${localFloor}.`,
            actionAdvice: 'Apply Now (SCAF): Place as Preference 1 or 2.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Local floor: ${localFloor}`
          };
        } else if (totalScore >= localFloor - 6) {
          return {
            badge: 'WAITLIST / APRIL RE-ALLOCATION',
            tone: 'waitlist',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} is close to the local priority floor.`,
            actionAdvice: 'Waitlist candidate.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Local floor: ${localFloor}`
          };
        } else {
          return {
            badge: 'OUT OF RANGE',
            tone: 'danger',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} is below local priority floor ${localFloor}.`,
            actionAdvice: 'Out of range for Dartford Boys.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Local floor: ${localFloor}`
          };
        }
      } else {
        // Outer candidates: ranked purely by score (projected ~396)
        if (totalScore >= 399) {
          return {
            badge: 'SAFE OFFER (MARCH)',
            tone: 'safe',
            distanceMiles: distance,
            isCatchment: false,
            rationale: `Outer score of ${totalScore} exceeds projected outer cut-off of 396.`,
            actionAdvice: 'Apply Now (SCAF): Strong outer score candidate.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: 'Outer cut-off ~396'
          };
        } else if (totalScore >= 394) {
          return {
            badge: 'REALISTIC TARGET',
            tone: 'target',
            distanceMiles: distance,
            isCatchment: false,
            rationale: `Outer score of ${totalScore} is in the competitive zone for outer places (est. 396).`,
            actionAdvice: 'Apply Now (SCAF): Preference 1 reach.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: 'Outer cut-off ~396'
          };
        } else {
          return {
            badge: 'OUT OF RANGE',
            tone: 'danger',
            distanceMiles: distance,
            isCatchment: false,
            rationale: `Outer candidates require ~396+ to gain admission.`,
            actionAdvice: 'Out of range for outer pool.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: 'Outer cut-off ~396'
          };
        }
      }
    }

    // Tonbridge Grammar School (TGS)
    if (school.shortName.includes("TGS")) {
      const projInnerMarch = school.projected2027Cutoff.marchScoreInner || 399;
      const projInnerApril = school.projected2027Cutoff.aprilScoreInner || 395;
      const projOuterMarch = school.projected2027Cutoff.marchScoreOuter || 414;
      const projOuterApril = school.projected2027Cutoff.aprilScoreOuter || 410;

      if (isCatchment) {
        if (totalScore >= projInnerMarch + 2) {
          return {
            badge: 'SAFE OFFER (MARCH)',
            tone: 'safe',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} clears projected TGS Inner 1 March cut-off (${projInnerMarch}) with strong margin.`,
            actionAdvice: 'Apply Now (SCAF): Top preference anchor.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `1 Mar: ${projInnerMarch} | Apr: ${projInnerApril}`
          };
        } else if (totalScore >= projInnerMarch - 1) {
          return {
            badge: 'REALISTIC TARGET',
            tone: 'target',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} is right on the bubble of the projected 1 March Inner cut-off (~${projInnerMarch}) and well clear of the projected April second cut-off (~${projInnerApril}).`,
            actionAdvice: 'Apply Now (SCAF): Place as Preference 1. Very strong chance on 1 March and highly likely to clear April reallocation.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `1 Mar: ~${projInnerMarch} | Apr: ~${projInnerApril}`
          };
        } else if (totalScore >= projInnerApril) {
          return {
            badge: 'WAITLIST / APRIL RE-ALLOCATION',
            tone: 'waitlist',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} is slightly below 1 March offer day (~${projInnerMarch}), but competitive for April waitlist reallocation (projected ~${projInnerApril}).`,
            actionAdvice: 'Name high on SCAF to secure automatic waiting list priority.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Apr floor: ~${projInnerApril} (Score: ${totalScore})`
          };
        } else {
          return {
            badge: 'OUT OF RANGE',
            tone: 'danger',
            distanceMiles: distance,
            isCatchment: true,
            rationale: `Score of ${totalScore} is below projected second cut-off (${projInnerApril}).`,
            actionAdvice: 'Out of range; prioritize distance schools like Weald of Kent or TWGGS.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Cut-off: ${projInnerApril}`
          };
        }
      } else {
        // Outer Governor places (45 places)
        if (totalScore >= projOuterMarch + 2) {
          return {
            badge: 'SAFE OFFER (MARCH)',
            tone: 'safe',
            distanceMiles: distance,
            isCatchment: false,
            rationale: `Outer score of ${totalScore} exceeds projected outer cut-off of ${projOuterMarch}.`,
            actionAdvice: 'Apply Now (SCAF): Top outer candidate.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Outer 1 Mar: ${projOuterMarch}`
          };
        } else if (totalScore >= projOuterMarch - 2) {
          return {
            badge: 'REALISTIC TARGET',
            tone: 'target',
            distanceMiles: distance,
            isCatchment: false,
            rationale: `Outer score of ${totalScore} is in contention for the 45 outer governor places (est. ${projOuterMarch}).`,
            actionAdvice: 'Apply Now (SCAF): Preference 1 reach.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Outer 1 Mar: ${projOuterMarch}`
          };
        } else if (totalScore >= projOuterApril) {
          return {
            badge: 'WAITLIST / APRIL RE-ALLOCATION',
            tone: 'waitlist',
            distanceMiles: distance,
            isCatchment: false,
            rationale: `Outer score of ${totalScore} may be competitive on April reallocation (est. ${projOuterApril}).`,
            actionAdvice: 'Outer waitlist candidate.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Outer Apr: ${projOuterApril}`
          };
        } else {
          return {
            badge: 'OUT OF RANGE',
            tone: 'danger',
            distanceMiles: distance,
            isCatchment: false,
            rationale: `Outer candidates require ~${projOuterMarch}+ to gain admission.`,
            actionAdvice: 'Out of range for outer pool.',
            pathwayUsed: 'score_super_selective',
            projectedCutoffSummary: `Outer: ${projOuterMarch}`
          };
        }
      }
    }
  }

  // 4. Archetype B: Hybrid Distance Core + Governor / Outer Score Places
  if (school.archetype === 'B') {
    const marchDist = school.projected2027Cutoff.marchDistanceInner || 4.5;
    const aprilDist = school.projected2027Cutoff.aprilDistanceInner || 5.5;
    const govScore = school.projected2027Cutoff.marchScoreOuter || (school.priorityFloor2026 || 370);

    let distVerdict: EligibilityVerdict | null = null;
    if (distance !== null && isCatchment) {
      if (distance <= marchDist * 0.85) {
        distVerdict = {
          badge: 'SAFE OFFER (MARCH)',
          tone: 'safe',
          distanceMiles: distance,
          isCatchment: true,
          rationale: `Distance of ${distance} miles is well within the 5-year March radius of ${marchDist} miles.`,
          actionAdvice: 'Apply Now (SCAF): High certainty distance anchor.',
          pathwayUsed: 'distance_catchment',
          projectedCutoffSummary: `Radius: ${marchDist} mi (${distance} mi)`
        };
      } else if (distance <= marchDist * 1.15) {
        distVerdict = {
          badge: 'REALISTIC TARGET',
          tone: 'target',
          distanceMiles: distance,
          isCatchment: true,
          rationale: `Distance of ${distance} miles is within the typical March allocation radius (${marchDist} mi).`,
          actionAdvice: 'Apply Now (SCAF): Realistic target preference.',
          pathwayUsed: 'distance_catchment',
          projectedCutoffSummary: `Radius: ${marchDist} mi (${distance} mi)`
        };
      } else if (distance <= aprilDist * 1.1) {
        distVerdict = {
          badge: 'WAITLIST / APRIL RE-ALLOCATION',
          tone: 'waitlist',
          distanceMiles: distance,
          isCatchment: true,
          rationale: `Distance of ${distance} miles is outside March cut-off but within April waitlist reallocation reach (${aprilDist} mi).`,
          actionAdvice: 'Apply on SCAF to activate automatic waiting list allocation.',
          pathwayUsed: 'distance_catchment',
          projectedCutoffSummary: `April radius: ${aprilDist} mi (${distance} mi)`
        };
      }
    }

    // Governor high score pathway
    let scoreVerdict: EligibilityVerdict | null = null;
    if (!qualStatus.isHtaOverrideCohort && totalScore >= govScore) {
      if (totalScore >= govScore + 4) {
        scoreVerdict = {
          badge: 'SAFE OFFER (MARCH)',
          tone: 'safe',
          distanceMiles: distance,
          isCatchment,
          rationale: `Score of ${totalScore} clears the projected governor high-score place cut-off of ${govScore}.`,
          actionAdvice: 'Apply Now (SCAF): Eligible via governor score quota.',
          pathwayUsed: 'governor_score',
          projectedCutoffSummary: `Gov score cut-off: ${govScore} (Score: ${totalScore})`
        };
      } else {
        scoreVerdict = {
          badge: 'REALISTIC TARGET',
          tone: 'target',
          distanceMiles: distance,
          isCatchment,
          rationale: `Score of ${totalScore} is competitive for the governor high-score tier (${govScore}).`,
          actionAdvice: 'Apply Now (SCAF): Viable target via score places.',
          pathwayUsed: 'governor_score',
          projectedCutoffSummary: `Gov score cut-off: ${govScore} (Score: ${totalScore})`
        };
      }
    }

    // Return the best verdict
    if (distVerdict && distVerdict.badge === 'SAFE OFFER (MARCH)') return distVerdict;
    if (scoreVerdict && scoreVerdict.badge === 'SAFE OFFER (MARCH)') return scoreVerdict;
    if (distVerdict && distVerdict.badge === 'REALISTIC TARGET') return distVerdict;
    if (scoreVerdict && scoreVerdict.badge === 'REALISTIC TARGET') return scoreVerdict;
    if (distVerdict) return distVerdict;
    if (scoreVerdict) return scoreVerdict;

    return {
      badge: 'OUT OF RANGE',
      tone: 'danger',
      distanceMiles: distance,
      isCatchment,
      rationale: distance !== null
        ? `Distance of ${distance} miles exceeds catchment radius (${marchDist} mi) and score ${totalScore} does not clear governor places (${govScore}).`
        : `Score of ${totalScore} does not clear governor score quota (${govScore}).`,
      actionAdvice: 'Outside distance and score cut-offs.',
      pathwayUsed: 'none',
      projectedCutoffSummary: `Radius: ${marchDist} mi | Score: ${govScore}`
    };
  }

  // 5. Archetype C: Pure Catchment & Distance
  // Once qualified (by standard pass or HTA override), score does NOT rank candidates!
  if (school.archetype === 'C') {
    const marchDist = school.projected2027Cutoff.marchDistanceMiles || 6.5;
    const aprilDist = school.projected2027Cutoff.aprilDistanceMiles || 8.0;

    if (distance === null) {
      return {
        badge: 'REALISTIC TARGET',
        tone: 'target',
        distanceMiles: null,
        isCatchment,
        rationale: `Candidate is grammar assessed. Admission is determined purely by distance (cut-off ~${marchDist} miles). Enter postcode for exact distance check.`,
        actionAdvice: 'Apply Now (SCAF): Enter postcode to confirm distance eligibility.',
        pathwayUsed: qualStatus.isHtaOverrideCohort ? 'hta_distance' : 'distance_catchment',
        projectedCutoffSummary: `Distance cut-off: ~${marchDist} mi`
      };
    }

    if (distance <= marchDist * 0.85) {
      return {
        badge: 'SAFE OFFER (MARCH)',
        tone: 'safe',
        distanceMiles: distance,
        isCatchment: true,
        rationale: `Distance of ${distance} miles is comfortably within the 5-year March radius of ${marchDist} miles. (Once qualified, score does not rank candidates).`,
        actionAdvice: 'Apply Now (SCAF): Ideal safe anchor or primary target.',
        pathwayUsed: qualStatus.isHtaOverrideCohort ? 'hta_distance' : 'distance_catchment',
        projectedCutoffSummary: `March radius: ${marchDist} mi (${distance} mi)`
      };
    } else if (distance <= marchDist * 1.15) {
      return {
        badge: 'REALISTIC TARGET',
        tone: 'target',
        distanceMiles: distance,
        isCatchment: true,
        rationale: `Distance of ${distance} miles is within the typical 1 March offer radius (${marchDist} miles).`,
        actionAdvice: 'Apply Now (SCAF): Strong target grammar preference.',
        pathwayUsed: qualStatus.isHtaOverrideCohort ? 'hta_distance' : 'distance_catchment',
        projectedCutoffSummary: `March radius: ${marchDist} mi (${distance} mi)`
      };
    } else if (distance <= aprilDist * 1.10) {
      return {
        badge: 'WAITLIST / APRIL RE-ALLOCATION',
        tone: 'waitlist',
        distanceMiles: distance,
        isCatchment: true,
        rationale: `Distance of ${distance} miles is slightly beyond the 1 March radius (${marchDist} mi) but well inside the historical April reallocation radius (${aprilDist} mi).`,
        actionAdvice: 'List high on SCAF to gain automatic waiting list reallocation in April 2027.',
        pathwayUsed: qualStatus.isHtaOverrideCohort ? 'hta_distance' : 'distance_catchment',
        projectedCutoffSummary: `April radius: ${aprilDist} mi (${distance} mi)`
      };
    } else {
      return {
        badge: 'OUT OF RANGE',
        tone: 'danger',
        distanceMiles: distance,
        isCatchment,
        rationale: `Distance of ${distance} miles is beyond the school's historical distance cut-off (${marchDist} mi).`,
        actionAdvice: 'Do not waste a SCAF slot; distance is too far.',
        pathwayUsed: 'none',
        projectedCutoffSummary: `March radius: ${marchDist} mi (${distance} mi)`
      };
    }
  }

  // 6. Archetype D: Cranbrook School (Strict 8.5-mile statutory catchment radius)
  if (school.archetype === 'D') {
    const statutoryRadius = 8.5;
    if (distance === null) {
      return {
        badge: 'REALISTIC TARGET',
        tone: 'target',
        distanceMiles: null,
        isCatchment,
        rationale: `Cranbrook enforces a strict 8.5-mile catchment radius for day places. Enter postcode to check distance.`,
        actionAdvice: 'Enter postcode to verify if within 8.5 miles.',
        pathwayUsed: 'distance_catchment',
        projectedCutoffSummary: '8.5-mile statutory radius'
      };
    }

    if (distance <= 7.0) {
      return {
        badge: 'SAFE OFFER (MARCH)',
        tone: 'safe',
        distanceMiles: distance,
        isCatchment: true,
        rationale: `Distance of ${distance} miles is comfortably inside Cranbrook's strict 8.5-mile statutory day radius.`,
        actionAdvice: 'Apply Now (SCAF): Safe day place target.',
        pathwayUsed: 'distance_catchment',
        projectedCutoffSummary: `8.5 mi radius (${distance} mi)`
      };
    } else if (distance <= 8.5) {
      return {
        badge: 'REALISTIC TARGET',
        tone: 'target',
        distanceMiles: distance,
        isCatchment: true,
        rationale: `Distance of ${distance} miles is inside the statutory 8.5-mile boundary.`,
        actionAdvice: 'Apply Now (SCAF): Strong target choice.',
        pathwayUsed: 'distance_catchment',
        projectedCutoffSummary: `8.5 mi radius (${distance} mi)`
      };
    } else {
      return {
        badge: 'OUT OF RANGE',
        tone: 'danger',
        distanceMiles: distance,
        isCatchment: false,
        rationale: `Distance of ${distance} miles is outside the mandatory 8.5-mile statutory catchment radius. (Only Boarding places available beyond 8.5 miles).`,
        actionAdvice: 'Ineligible for Day places; boarding application required if outside 8.5 miles.',
        pathwayUsed: 'none',
        projectedCutoffSummary: `Outside 8.5 mi (${distance} mi)`
      };
    }
  }

  return {
    badge: 'OUT OF RANGE',
    tone: 'danger',
    distanceMiles: distance,
    isCatchment,
    rationale: 'Does not meet admissions criteria.',
    actionAdvice: 'Check alternative schools.',
    pathwayUsed: 'none',
    projectedCutoffSummary: 'N/A'
  };
}

/**
 * Computes Catchment Cut-off, Governor Cut-off, and the candidate's exact landing category
 */
export function computeSchoolCutoffPair(
  profile: UserProfile,
  school: School,
  distance: number | null,
  isCatchment: boolean,
  qualStatus: QualificationStatus,
  totalScore: number
): SchoolCutoffPair {
  const isGenderMismatch =
    (school.gender === 'Boys' && profile.gender !== 'M') ||
    (school.gender === 'Girls' && profile.gender !== 'F');

  const userDistrict = profile.postcodeData?.district || '';

  // 1. Gender Ineligible
  if (isGenderMismatch) {
    let catchVal = '—';
    let govVal = '—';
    if (school.archetype === 'A') {
      catchVal = `${school.projected2027Cutoff.marchScoreInner || 385} pts`;
      govVal = `${school.projected2027Cutoff.marchScoreOuter || 398} pts`;
    } else if (school.archetype === 'B') {
      catchVal = `${school.projected2027Cutoff.marchDistanceInner || 4.5} mi`;
      govVal = `${school.projected2027Cutoff.marchScoreOuter || 378} pts`;
    } else if (school.archetype === 'C') {
      catchVal = `${school.projected2027Cutoff.marchDistanceMiles || 6.0} mi`;
      govVal = 'N/A (Pure Distance)';
    }

    return {
      catchmentCutoffLabel: school.archetype === 'A' ? 'Inner Catchment Cut-off' : 'Catchment Distance Cut-off',
      catchmentCutoffValue: catchVal,
      catchmentCutoffDetail: 'Catchment criteria',
      governorCutoffLabel: school.archetype === 'C' ? 'Governor Score Cut-off' : 'Governor / Outer Cut-off',
      governorCutoffValue: govVal,
      governorCutoffDetail: school.archetype === 'C' ? 'No governor score quota' : 'Governor / open score quota',
      userCategory: 'INELIGIBLE',
      userCategoryTitle: 'Ineligible (Single-Sex)',
      userCategoryDescription: `${school.name} is a single-sex ${school.gender} school. Candidate is ${profile.gender === 'M' ? 'Boy' : 'Girl'}.`,
      isMeetingCategoryCutoff: false,
      categoryMarginText: 'Ineligible (Gender)',
      activeEvaluationType: 'none'
    };
  }

  // 2. Archetype A: Pure Super-Selective (TGS, Judd, Skinners', Dartford Boys)
  if (school.archetype === 'A') {
    if (school.shortName.includes('TGS')) {
      const innerCutoff = school.projected2027Cutoff.marchScoreInner || 399;
      const innerAprilCutoff = school.projected2027Cutoff.aprilScoreInner || 395;
      const outerCutoff = school.projected2027Cutoff.marchScoreOuter || 414;

      if (isCatchment) {
        const clearsMarch = totalScore >= innerCutoff;
        const clearsApril = totalScore >= innerAprilCutoff;
        let marginText = '';
        if (clearsMarch) {
          marginText = `+${totalScore - innerCutoff} pts above 1 March cut-off`;
        } else if (clearsApril) {
          marginText = `-1 pt from 1 Mar; clears April floor by +${totalScore - innerAprilCutoff} pts`;
        } else {
          marginText = `-${innerAprilCutoff - totalScore} pts below April floor`;
        }

        return {
          catchmentCutoffLabel: 'Inner Area Cut-off (135 Places)',
          catchmentCutoffValue: `~${innerCutoff} pts (1 Mar) / ~${innerAprilCutoff} pts (Apr)`,
          catchmentCutoffDetail: '135 places for TM, TW & Sevenoaks. Only 117 mainstream girls in area scored ≥398.',
          governorCutoffLabel: 'Outer Governor Cut-off (45 Places)',
          governorCutoffValue: `${outerCutoff} pts`,
          governorCutoffDetail: 'Open competition across London/OOC and non-area Kent',
          userCategory: 'CATCHMENT',
          userCategoryTitle: 'Inner Catchment Area (135 Places)',
          userCategoryDescription: `Resident in ${userDistrict || 'West Kent priority area'}. You compete within the 135-place Inner quota where only 117 mainstream girls scored ≥398.`,
          isMeetingCategoryCutoff: clearsApril,
          categoryMarginText: marginText,
          activeEvaluationType: 'catchment'
        };
      } else {
        const clears = totalScore >= outerCutoff;
        return {
          catchmentCutoffLabel: 'Inner Area Cut-off (135 Places)',
          catchmentCutoffValue: `${innerCutoff} pts`,
          catchmentCutoffDetail: 'Reserved for West Kent priority area residents',
          governorCutoffLabel: 'Outer Governor Cut-off (45 Places)',
          governorCutoffValue: `${outerCutoff} pts`,
          governorCutoffDetail: 'Open competition across London/OOC and non-area Kent',
          userCategory: 'GOVERNOR',
          userCategoryTitle: 'Outer Governor Pool (45 Places)',
          userCategoryDescription: `Resident outside West Kent priority area. You compete exclusively for the 45 open Governor places.`,
          isMeetingCategoryCutoff: clears,
          categoryMarginText: clears ? `+${totalScore - outerCutoff} pts above Outer cut-off` : `-${outerCutoff - totalScore} pts below Outer cut-off`,
          activeEvaluationType: 'governor'
        };
      }
    }

    if (school.shortName.includes('Judd')) {
      const innerCutoff = school.projected2027Cutoff.marchScoreInner || 400;
      const outerCutoff = school.projected2027Cutoff.marchScoreOuter || 408;

      if (isCatchment) {
        const clears = totalScore >= innerCutoff;
        return {
          catchmentCutoffLabel: 'Inner Area Cut-off',
          catchmentCutoffValue: `${innerCutoff} pts`,
          catchmentCutoffDetail: 'Inner catchment places for TM, TW & Sevenoaks',
          governorCutoffLabel: 'Outer Governor Cut-off',
          governorCutoffValue: `${outerCutoff} pts`,
          governorCutoffDetail: 'Outer high-score places',
          userCategory: 'CATCHMENT',
          userCategoryTitle: 'Inner Catchment Area',
          userCategoryDescription: `Resident in ${userDistrict || 'West Kent priority area'}. Evaluated against Inner cut-off.`,
          isMeetingCategoryCutoff: clears,
          categoryMarginText: clears ? `+${totalScore - innerCutoff} pts above Inner cut-off` : `-${innerCutoff - totalScore} pts below Inner cut-off`,
          activeEvaluationType: 'catchment'
        };
      } else {
        const clears = totalScore >= outerCutoff;
        return {
          catchmentCutoffLabel: 'Inner Area Cut-off',
          catchmentCutoffValue: `${innerCutoff} pts`,
          catchmentCutoffDetail: 'Reserved for West Kent residents',
          governorCutoffLabel: 'Outer Governor Cut-off',
          governorCutoffValue: `${outerCutoff} pts`,
          governorCutoffDetail: 'Outer open score places',
          userCategory: 'GOVERNOR',
          userCategoryTitle: 'Outer Governor Pool',
          userCategoryDescription: 'Resident outside priority area; competing for outer score places.',
          isMeetingCategoryCutoff: clears,
          categoryMarginText: clears ? `+${totalScore - outerCutoff} pts above Outer cut-off` : `-${outerCutoff - totalScore} pts below Outer cut-off`,
          activeEvaluationType: 'governor'
        };
      }
    }

    if (school.shortName.includes("Skinners'")) {
      const localFloor = school.priorityFloor2026 || 385;
      const outerCutoff = school.projected2027Cutoff.marchScoreOuter || 398;

      if (isCatchment) {
        const clears = totalScore >= localFloor;
        return {
          catchmentCutoffLabel: 'Local Priority Floor',
          catchmentCutoffValue: `${localFloor} pts`,
          catchmentCutoffDetail: 'Statutory score floor (Threshold + 40) for West Kent area',
          governorCutoffLabel: 'Outer Governor Cut-off',
          governorCutoffValue: `${outerCutoff} pts`,
          governorCutoffDetail: 'Outer candidates ranked strictly by aggregate score',
          userCategory: 'CATCHMENT',
          userCategoryTitle: 'Local Priority Catchment',
          userCategoryDescription: `Resident in West Kent priority area. Evaluated against statutory local floor of ${localFloor}.`,
          isMeetingCategoryCutoff: clears,
          categoryMarginText: clears ? `+${totalScore - localFloor} pts above local floor` : `-${localFloor - totalScore} pts below local floor`,
          activeEvaluationType: 'catchment'
        };
      } else {
        const clears = totalScore >= outerCutoff;
        return {
          catchmentCutoffLabel: 'Local Priority Floor',
          catchmentCutoffValue: `${localFloor} pts`,
          catchmentCutoffDetail: 'West Kent residents only',
          governorCutoffLabel: 'Outer Governor Cut-off',
          governorCutoffValue: `${outerCutoff} pts`,
          governorCutoffDetail: 'Outer candidates ranked strictly by aggregate score',
          userCategory: 'GOVERNOR',
          userCategoryTitle: 'Outer Governor Pool',
          userCategoryDescription: 'Resident outside West Kent area; competing for outer places.',
          isMeetingCategoryCutoff: clears,
          categoryMarginText: clears ? `+${totalScore - outerCutoff} pts above Outer cut-off` : `-${outerCutoff - totalScore} pts below Outer cut-off`,
          activeEvaluationType: 'governor'
        };
      }
    }

    if (school.shortName.includes('Dartford Boys')) {
      const localFloor = school.priorityFloor2026 || 385;
      const outerCutoff = school.projected2027Cutoff.marchScoreOuter || 396;
      const isLocalDartford = userDistrict.toLowerCase().includes('dartford') || (profile.postcode.trim().toUpperCase().startsWith('DA1') || profile.postcode.trim().toUpperCase().startsWith('DA2'));

      if (isLocalDartford) {
        const clears = totalScore >= localFloor;
        return {
          catchmentCutoffLabel: 'Dartford Priority Floor',
          catchmentCutoffValue: `${localFloor} pts`,
          catchmentCutoffDetail: 'Statutory floor for Dartford / DA1 / DA2 residents',
          governorCutoffLabel: 'Outer Governor Cut-off',
          governorCutoffValue: `${outerCutoff} pts`,
          governorCutoffDetail: 'Open competition for non-Dartford candidates',
          userCategory: 'CATCHMENT',
          userCategoryTitle: 'Dartford Local Priority',
          userCategoryDescription: 'Resident in Dartford / DA1 / DA2 postcode area.',
          isMeetingCategoryCutoff: clears,
          categoryMarginText: clears ? `+${totalScore - localFloor} pts above Dartford floor` : `-${localFloor - totalScore} pts below Dartford floor`,
          activeEvaluationType: 'catchment'
        };
      } else {
        const clears = totalScore >= outerCutoff;
        return {
          catchmentCutoffLabel: 'Dartford Priority Floor',
          catchmentCutoffValue: `${localFloor} pts`,
          catchmentCutoffDetail: 'Dartford / DA1 / DA2 residents only',
          governorCutoffLabel: 'Outer Governor Cut-off',
          governorCutoffValue: `${outerCutoff} pts`,
          governorCutoffDetail: 'Non-Dartford candidates ranked purely by score',
          userCategory: 'GOVERNOR',
          userCategoryTitle: 'Outer Governor Pool',
          userCategoryDescription: 'Non-Dartford candidate; competing in open score pool.',
          isMeetingCategoryCutoff: clears,
          categoryMarginText: clears ? `+${totalScore - outerCutoff} pts above Outer cut-off` : `-${outerCutoff - totalScore} pts below Outer cut-off`,
          activeEvaluationType: 'governor'
        };
      }
    }
  }

  // 3. Archetype B: Hybrid Distance Core + Governor High-Score Places
  if (school.archetype === 'B') {
    const marchDist = school.projected2027Cutoff.marchDistanceInner || 4.5;
    const govScore = school.projected2027Cutoff.marchScoreOuter || 378;

    if (distance !== null && distance <= marchDist) {
      return {
        catchmentCutoffLabel: 'Catchment Distance Core',
        catchmentCutoffValue: `${marchDist} miles`,
        catchmentCutoffDetail: 'Local core places allocated by straight-line distance',
        governorCutoffLabel: 'Governor High-Score Quota',
        governorCutoffValue: `${govScore} pts`,
        governorCutoffDetail: 'Governor places ranked purely by score regardless of distance',
        userCategory: 'CATCHMENT',
        userCategoryTitle: 'Catchment Distance Core',
        userCategoryDescription: `Your distance of ${distance} miles is within the ${marchDist}-mile catchment core.`,
        isMeetingCategoryCutoff: true,
        categoryMarginText: `Within radius by ${(marchDist - distance).toFixed(1)} miles`,
        activeEvaluationType: 'distance'
      };
    } else if (totalScore >= govScore) {
      return {
        catchmentCutoffLabel: 'Catchment Distance Core',
        catchmentCutoffValue: `${marchDist} miles`,
        catchmentCutoffDetail: 'Local core places allocated by straight-line distance',
        governorCutoffLabel: 'Governor High-Score Quota',
        governorCutoffValue: `${govScore} pts`,
        governorCutoffDetail: 'Governor places ranked purely by score regardless of distance',
        userCategory: 'GOVERNOR',
        userCategoryTitle: 'Governor High-Score Quota',
        userCategoryDescription: distance !== null
          ? `Outside distance core (${distance} mi > ${marchDist} mi), but score qualifies for Governor Quota.`
          : 'Score qualifies for Governor High-Score Quota.',
        isMeetingCategoryCutoff: true,
        categoryMarginText: `+${totalScore - govScore} pts above Governor cut-off`,
        activeEvaluationType: 'governor'
      };
    } else {
      return {
        catchmentCutoffLabel: 'Catchment Distance Core',
        catchmentCutoffValue: `${marchDist} miles`,
        catchmentCutoffDetail: 'Local core places allocated by straight-line distance',
        governorCutoffLabel: 'Governor High-Score Quota',
        governorCutoffValue: `${govScore} pts`,
        governorCutoffDetail: 'Governor places ranked purely by score regardless of distance',
        userCategory: distance !== null ? 'CATCHMENT' : 'GOVERNOR',
        userCategoryTitle: distance !== null ? 'Outside Distance & Governor Quotas' : 'Governor Pool (Distance Unknown)',
        userCategoryDescription: distance !== null
          ? `Distance (${distance} mi) exceeds ${marchDist} mi; Score (${totalScore}) is below Governor cut-off (${govScore}).`
          : `Score (${totalScore}) is below Governor cut-off (${govScore}). Enter postcode for distance check.`,
        isMeetingCategoryCutoff: false,
        categoryMarginText: distance !== null
          ? `Exceeds distance by ${(distance - marchDist).toFixed(1)} mi; Misses score by ${govScore - totalScore} pts`
          : `-${govScore - totalScore} pts below Governor cut-off`,
        activeEvaluationType: distance !== null ? 'distance' : 'governor'
      };
    }
  }

  // 4. Archetype C: Pure Catchment & Distance
  if (school.archetype === 'C') {
    const marchDist = school.projected2027Cutoff.marchDistanceMiles || 6.0;

    let isWithin = false;
    let marginText = 'Enter postcode to verify distance radius';
    if (distance !== null) {
      isWithin = distance <= marchDist;
      marginText = isWithin
        ? `Within radius by ${(marchDist - distance).toFixed(1)} miles`
        : `Exceeds 1 March cut-off by ${(distance - marchDist).toFixed(1)} miles`;
    }

    return {
      catchmentCutoffLabel: 'Catchment Distance Cut-off',
      catchmentCutoffValue: `${marchDist} miles`,
      catchmentCutoffDetail: 'All places allocated strictly by straight-line distance (threshold ≥345)',
      governorCutoffLabel: 'Governor Score Cut-off',
      governorCutoffValue: 'N/A (Pure Distance)',
      governorCutoffDetail: 'No governor score quota (once qualified, score does not rank candidates)',
      userCategory: 'DISTANCE_ONLY',
      userCategoryTitle: 'Catchment Distance Core',
      userCategoryDescription: 'Pure distance school. Once grammar-qualified, admission is ranked solely by straight-line distance.',
      isMeetingCategoryCutoff: distance !== null ? isWithin : (qualStatus.isQualified || qualStatus.isHtaOverrideCohort),
      categoryMarginText: marginText,
      activeEvaluationType: 'distance'
    };
  }

  // 5. Archetype D: Cranbrook School
  const dayDist = 8.5;
  const isWithinDay = distance !== null ? distance <= dayDist : false;
  return {
    catchmentCutoffLabel: 'Day Catchment Cut-off',
    catchmentCutoffValue: `${dayDist} miles`,
    catchmentCutoffDetail: 'Statutory Cranbrook Day Catchment Area',
    governorCutoffLabel: 'Governor / Boarding Cut-off',
    governorCutoffValue: 'N/A (Boarding Interview)',
    governorCutoffDetail: 'Boarding places allocated via suitability interview',
    userCategory: 'CATCHMENT',
    userCategoryTitle: isWithinDay ? 'Day Catchment Area' : 'Outside Day Area (Boarding Available)',
    userCategoryDescription: isWithinDay
      ? `Within Cranbrook's ${dayDist}-mile statutory day catchment boundary.`
      : `Outside ${dayDist}-mile day area. Boarding application required.`,
    isMeetingCategoryCutoff: isWithinDay,
    categoryMarginText: distance !== null
      ? (isWithinDay ? `Within day area by ${(dayDist - distance).toFixed(1)} mi` : `Exceeds 8.5 mi radius (${distance} mi)`)
      : 'Postcode needed',
    activeEvaluationType: 'distance'
  };
}

/**
 * Evaluates school eligibility for a given user profile
 */
export function evaluateSchoolEligibility(
  profile: UserProfile,
  school: School,
  distributionsData?: any
): EligibilityVerdict {
  const rawVerdict = evaluateSchoolEligibilityInternal(profile, school, distributionsData);
  const totalScore = profile.scoreMode === 'detailed'
    ? profile.english + profile.maths + profile.reasoning
    : profile.totalScore;
  const qualStatus = checkQualificationStatus(profile);

  const cutoffPair = computeSchoolCutoffPair(
    profile,
    school,
    rawVerdict.distanceMiles,
    rawVerdict.isCatchment,
    qualStatus,
    totalScore
  );

  return {
    ...rawVerdict,
    cutoffPair
  };
}

/**
 * Generates an automated 4-Preference SCAF Blueprint enforcing KCC's Equal Preference System
 */
export function generateSCAFRecommendations(
  evaluatedSchools: EvaluatedSchool[],
  profile: UserProfile
): SCAFBlueprint {
  const eligibleGenderSchools = evaluatedSchools.filter(s => s.eligibility.badge !== 'INELIGIBLE (GENDER)');
  const qualStatus = checkQualificationStatus(profile);

  // If in Single-Paper Floor Fail Cohort
  if (qualStatus.isSinglePaperFloorFailCohort) {
    const appealCandidates = eligibleGenderSchools.filter(s => s.eligibility.badge === 'APPEAL CANDIDATE (MARCH 2027)');
    const safeLocalComp = eligibleGenderSchools.find(s => s.eligibility.distanceMiles && s.eligibility.distanceMiles < 4);

    return {
      pref1: appealCandidates[0] || null,
      pref2: appealCandidates[1] || null,
      pref3: appealCandidates[2] || null,
      pref4: safeLocalComp || appealCandidates[3] || null,
      commentary: `CRITICAL SCAF APPEAL STRATEGY: Under KCC rules, you CANNOT appeal to a school unless you named it on your SCAF by 2 November 2026. Name your top target grammar schools in Preferences 1–3 to trigger official refusal letters on 1 March 2027, unlocking statutory Independent Appeals. Reserve Preference 4 for an ironclad insurance school.`
    };
  }

  // Sort candidates by strategic role
  const safeOffers = eligibleGenderSchools.filter(s => s.eligibility.badge === 'SAFE OFFER (MARCH)')
    .sort((a, b) => (a.eligibility.distanceMiles || 99) - (b.eligibility.distanceMiles || 99));

  const realisticTargets = eligibleGenderSchools.filter(s => s.eligibility.badge === 'REALISTIC TARGET')
    .sort((a, b) => (a.eligibility.distanceMiles || 99) - (b.eligibility.distanceMiles || 99));

  const waitlistReach = eligibleGenderSchools.filter(s => s.eligibility.badge === 'WAITLIST / APRIL RE-ALLOCATION');

  let pref1: EvaluatedSchool | null = null;
  let pref2: EvaluatedSchool | null = null;
  let pref3: EvaluatedSchool | null = null;
  let pref4: EvaluatedSchool | null = null;

  // Pref 1: Aspirational Reach or Top Target
  if (waitlistReach.length > 0 && realisticTargets.length > 0) {
    pref1 = waitlistReach[0];
  } else if (realisticTargets.length > 0) {
    pref1 = realisticTargets[0];
  } else if (safeOffers.length > 0) {
    pref1 = safeOffers[0];
  }

  // Pref 2: Primary Target
  const remainingFor2 = [...realisticTargets, ...safeOffers].filter(s => s.urn !== pref1?.urn);
  pref2 = remainingFor2[0] || null;

  // Pref 3: Safe In-Catchment Anchor
  const remainingFor3 = safeOffers.filter(s => s.urn !== pref1?.urn && s.urn !== pref2?.urn);
  pref3 = remainingFor3[0] || (realisticTargets.find(s => s.urn !== pref1?.urn && s.urn !== pref2?.urn) || null);

  // Pref 4: Ironclad Insurance
  const remainingFor4 = safeOffers.filter(s => s.urn !== pref1?.urn && s.urn !== pref2?.urn && s.urn !== pref3?.urn);
  pref4 = remainingFor4[0] || null;

  return {
    pref1,
    pref2,
    pref3,
    pref4,
    commentary: `KCC EQUAL PREFERENCE RULE: Schools never see the order you list them (1st, 2nd, 3rd, 4th). If your child qualifies for multiple schools, KCC will automatically offer the highest preference. Therefore, you should always list your true dream school 1st without fear of hurting your chances at your safe 3rd or 4th choice.`
  };
}
