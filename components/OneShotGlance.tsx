'use client';

import React from 'react';
import { UserProfile, QualificationStatus, InflationRankResult, EvaluatedSchool } from '../types/admissions';
import { CheckCircle2, AlertTriangle, XCircle, TrendingDown, Users, ShieldCheck } from 'lucide-react';

interface OneShotGlanceProps {
  profile: UserProfile;
  qualification: QualificationStatus;
  rankResult: InflationRankResult;
  evaluatedSchools: EvaluatedSchool[];
  distributionsData?: any;
}

export default function OneShotGlance({
  profile,
  qualification,
  rankResult,
  evaluatedSchools,
  distributionsData
}: OneShotGlanceProps) {
  const eligibleSchools = evaluatedSchools.filter(s => s.eligibility.badge !== 'INELIGIBLE (GENDER)');

  const safeCount = eligibleSchools.filter(s => s.eligibility.badge === 'SAFE OFFER (MARCH)').length;
  const targetCount = eligibleSchools.filter(s => s.eligibility.badge === 'REALISTIC TARGET').length;
  const waitlistCount = eligibleSchools.filter(s => s.eligibility.badge === 'WAITLIST / APRIL RE-ALLOCATION').length;
  const appealCount = eligibleSchools.filter(s => s.eligibility.badge === 'APPEAL CANDIDATE (MARCH 2027)').length;

  const userDistrict = profile.postcodeData?.district || 'Kent';
  const gender = profile.gender;
  const totalScore = profile.scoreMode === 'detailed'
    ? profile.english + profile.maths + profile.reasoning
    : profile.totalScore;

  // Compute local competition from distributionsData
  let localCompetitors = 0;
  let totalLocalGrammar = 0;
  let westKentBoysPool = 0;

  if (distributionsData?.districtMatrix2026) {
    const matrix = distributionsData.districtMatrix2026;
    // Find district entry
    const matchedDistrictKey = Object.keys(matrix).find(d =>
      d.toLowerCase().includes(userDistrict.toLowerCase()) || userDistrict.toLowerCase().includes(d.toLowerCase())
    ) || (userDistrict.toLowerCase().includes('bromley') || userDistrict.toLowerCase().includes('bexley') || userDistrict.toLowerCase().includes('london') ? 'OOC/Misc' : 'Sevenoaks');

    const distObj = matrix[matchedDistrictKey]?.[gender];
    if (distObj) {
      totalLocalGrammar = distObj.totalGrammar || 0;
      for (let s = totalScore; s <= 423; s++) {
        localCompetitors += (distObj.grammarScores?.[s] || 0);
      }
    }

    // West Kent boys pool for Judd & Skinners comparison
    const westKentDistricts = ['Sevenoaks', 'Tonbridge & Malling', 'Tunbridge Wells', 'Kent independent'];
    westKentDistricts.forEach(d => {
      const gScores = matrix[d]?.['M']?.grammarScores;
      if (gScores) {
        for (let s = totalScore; s <= 423; s++) {
          westKentBoysPool += (gScores[s] || 0);
        }
      }
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* Card 1: 2026 Qualification Status */}
      <div className="bg-[#F7F7F5] border border-notion-border rounded-lg p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-notion-secondary mb-1">
            <span className="font-medium uppercase tracking-wider text-[10px]">2026 Assessment Check</span>
            {qualification.isStandardPass ? (
              <CheckCircle2 className="w-4 h-4 text-[#2B593F]" />
            ) : qualification.isHtaOverrideCohort ? (
              <ShieldCheck className="w-4 h-4 text-[#1F6C9C]" />
            ) : qualification.isSinglePaperFloorFailCohort ? (
              <AlertTriangle className="w-4 h-4 text-[#89632A]" />
            ) : (
              <XCircle className="w-4 h-4 text-[#9E3632]" />
            )}
          </div>
          <div className="text-base font-bold text-notion-text mt-0.5 leading-snug">
            {qualification.headline}
          </div>
          <p className="text-xs text-notion-secondary mt-1.5 line-clamp-3">
            {qualification.description}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-notion-border flex items-center justify-between text-xs">
          <span className="text-[11px] text-notion-muted">Threshold: 345 (Floor 111)</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
            qualification.isStandardPass
              ? 'bg-notion-green-bg text-notion-green-text border border-notion-green-border'
              : qualification.isHtaOverrideCohort
              ? 'bg-notion-blue-bg text-notion-blue-text border border-notion-blue-border'
              : qualification.isSinglePaperFloorFailCohort
              ? 'bg-notion-amber-bg text-notion-amber-text border border-notion-amber-border'
              : 'bg-notion-red-bg text-notion-red-text border border-notion-red-border'
          }`}>
            {qualification.isStandardPass
              ? 'Automatic Pass'
              : qualification.isHtaOverrideCohort
              ? 'HTA Override (733 Cohort)'
              : qualification.isSinglePaperFloorFailCohort
              ? 'Single Floor Trap (520 Cohort)'
              : 'High School Assessed'}
          </span>
        </div>
      </div>

      {/* Card 2: Inflation-Adjusted Rank & 2025 Equivalent */}
      <div className="bg-[#F7F7F5] border border-notion-border rounded-lg p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-notion-secondary mb-1">
            <span className="font-medium uppercase tracking-wider text-[10px]">2026 Score Inflation Adjuster</span>
            <TrendingDown className="w-4 h-4 text-[#89632A]" />
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-notion-text tabular-nums">
              {totalScore}
            </span>
            <span className="text-xs text-notion-secondary">in 2026</span>
            <span className="text-notion-muted">➔</span>
            <span className="text-2xl font-bold font-mono text-[#89632A] tabular-nums">
              ~{rankResult.equiv2025Score}
            </span>
            <span className="text-xs text-notion-secondary">in 2025</span>
          </div>

          <p className="text-xs text-notion-secondary mt-1.5">
            Rank: <strong>#{rankResult.rank2026.toLocaleString()}</strong> out of 8,820 Grammar Passes (Top {rankResult.percentileTop}%).
            Historical comparisons must factor the <strong>{rankResult.pointDiff} pt</strong> cohort shift.
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-notion-border flex items-center justify-between text-xs">
          <span className="text-[11px] text-notion-muted">PAN is fixed; scores shifted</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-notion-amber-bg text-notion-amber-text border border-notion-amber-border">
            {rankResult.pointDiff} pts deflation
          </span>
        </div>
      </div>

      {/* Card 3: Local District x Gender Competition Pressure */}
      <div className="bg-[#F7F7F5] border border-notion-border rounded-lg p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-notion-secondary mb-1">
            <span className="font-medium uppercase tracking-wider text-[10px]">Regional Competition Pressure</span>
            <Users className="w-4 h-4 text-notion-secondary" />
          </div>

          <div className="text-2xl font-bold font-mono text-notion-text mt-1 tabular-nums">
            {localCompetitors} {gender === 'M' ? 'Boys' : 'Girls'}
          </div>

          <p className="text-xs text-notion-secondary mt-1.5">
            scored <strong>≥ {totalScore}</strong> in <strong>{userDistrict}</strong> in 2026
            {totalLocalGrammar > 0 && ` (out of ${totalLocalGrammar} total grammar passes in district)`}.
            {gender === 'M' && westKentBoysPool > 0 && (
              <span className="block mt-1 text-[11px] text-notion-secondary">
                West Kent Boys ≥ {totalScore}: <strong>{westKentBoysPool}</strong> (vs 297 Judd+Skinners seats).
              </span>
            )}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-notion-border flex items-center justify-between text-xs">
          <span className="text-[11px] text-notion-muted">District: {userDistrict}</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-notion-border text-notion-text">
            {gender === 'M' ? 'Male Cohort' : 'Female Cohort'}
          </span>
        </div>
      </div>

      {/* Card 4: Immediate SCAF Summary */}
      <div className="bg-[#F7F7F5] border border-notion-border rounded-lg p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-notion-secondary mb-1">
            <span className="font-medium uppercase tracking-wider text-[10px]">Immediate SCAF Status</span>
            <span className="text-[10px] text-red-700 font-bold">2 Nov Deadline</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center mt-2">
            <div className="bg-white rounded p-1 border border-notion-border">
              <div className="text-sm font-bold font-mono text-[#2B593F] tabular-nums">{safeCount}</div>
              <div className="text-[10px] text-notion-secondary">Safe</div>
            </div>
            <div className="bg-white rounded p-1 border border-notion-border">
              <div className="text-sm font-bold font-mono text-[#1F6C9C] tabular-nums">{targetCount}</div>
              <div className="text-[10px] text-notion-secondary">Target</div>
            </div>
            <div className="bg-white rounded p-1 border border-notion-border">
              <div className="text-sm font-bold font-mono text-[#89632A] tabular-nums">{waitlistCount}</div>
              <div className="text-[10px] text-notion-secondary">Waitlist</div>
            </div>
            <div className="bg-white rounded p-1 border border-notion-border">
              <div className="text-sm font-bold font-mono text-[#9E3632] tabular-nums">{appealCount}</div>
              <div className="text-[10px] text-notion-secondary">Appeal</div>
            </div>
          </div>

          <p className="text-[11px] text-notion-secondary mt-2">
            {qualification.isSinglePaperFloorFailCohort
              ? 'Action: Name schools on SCAF to unlock statutory March 2027 appeal right.'
              : 'Action: Use 4 preferences with at least 1 safe anchor and 1 insurance.'}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-notion-border flex items-center justify-between text-xs">
          <span className="text-[11px] text-notion-muted">Equal Preference System</span>
          <span className="text-[11px] font-medium text-notion-text">4 Choices Allowed</span>
        </div>
      </div>
    </div>
  );
}
