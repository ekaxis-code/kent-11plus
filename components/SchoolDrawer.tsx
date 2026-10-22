'use client';

import React from 'react';
import { EvaluatedSchool, UserProfile } from '../types/admissions';
import { X, MapPin, Award, BookOpen, Scale, CheckCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface SchoolDrawerProps {
  school: EvaluatedSchool | null;
  onClose: () => void;
  profile: UserProfile;
  onUpdateScafPreference: (prefIndex: 1 | 2 | 3 | 4, school: EvaluatedSchool | null) => void;
  distributionsData?: any;
}

export default function SchoolDrawer({
  school,
  onClose,
  profile,
  onUpdateScafPreference,
  distributionsData
}: SchoolDrawerProps) {
  if (!school) return null;

  const totalScore = profile.scoreMode === 'detailed'
    ? profile.english + profile.maths + profile.reasoning
    : profile.totalScore;

  // Girls Cohort Intelligence Calculations
  const isGirlsSchool = school.gender === 'Girls';
  const boundedScore = Math.max(207, Math.min(423, Math.round(totalScore)));
  const girlsData = distributionsData?.genderCohortData?.girls;
  const girlsCountyRank = girlsData?.cumulativeRanksCounty?.[boundedScore] ?? Math.max(1, Math.round(4227 * (1 - (boundedScore - 313) / 110)));
  const girlsWestKentRank = girlsData?.cumulativeRanksWestKent?.[boundedScore] ?? Math.max(1, Math.round(632 * (1 - (boundedScore - 313) / 110)));
  const girlsEquiv2025 = girlsData?.equivalents2026?.[boundedScore]?.equiv2025Score ?? (boundedScore - 13);
  const girlsDeflationDiff = girlsData?.equivalents2026?.[boundedScore]?.diff ?? -13;
  const girlsPct = Number(((girlsCountyRank / 4227) * 100).toFixed(1));

  const getArchetypeDesc = (arch: string) => {
    if (arch === 'A') return 'Pure Super-Selective (Score-Ranked across Inner & Outer Catchments)';
    if (arch === 'B') return 'Hybrid Distance Core + Governor / Outer Score Places';
    if (arch === 'C') return 'Pure Catchment & Distance (Once Qualified ≥345, Score Does Not Rank Candidates)';
    return 'Boarding / Specialised Year 7 Entry';
  };

  const getBadgeStyle = (badge: string) => {
    if (badge.includes('SAFE')) return 'bg-notion-green-bg text-notion-green-text border-notion-green-border';
    if (badge.includes('REALISTIC')) return 'bg-notion-blue-bg text-notion-blue-text border-notion-blue-border';
    if (badge.includes('WAITLIST') || badge.includes('APPEAL')) return 'bg-notion-amber-bg text-notion-amber-text border-notion-amber-border';
    return 'bg-notion-red-bg text-notion-red-text border-notion-red-border';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/20 backdrop-blur-[1px] flex justify-end transition-opacity">
      <div
        className="w-full max-w-[560px] bg-white h-full shadow-2xl flex flex-col border-l border-notion-border animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#F7F7F5] border-b border-notion-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white border border-notion-border">
                Archetype {school.archetype}
              </span>
              <span className="text-xs text-notion-secondary font-mono">
                URN: {school.urn} • DfE: {school.dfeNumber}
              </span>
            </div>

            <h2 className="text-lg font-bold text-notion-text mt-1 leading-snug">
              {school.name}
            </h2>

            <div className="flex items-center gap-2 text-xs text-notion-secondary mt-1">
              <span>{school.address}, {school.town}</span>
              <span>•</span>
              <span className="font-mono">{school.postcode}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-notion-secondary hover:text-notion-text hover:bg-white border border-transparent hover:border-notion-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs text-notion-text">
          {/* Eligibility Verdict Banner */}
          <div className="p-3.5 rounded-lg border bg-[#F7F7F5] border-notion-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-notion-secondary uppercase tracking-wider">
                Admissions Diagnostic
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(school.eligibility.badge)}`}>
                {school.eligibility.badge}
              </span>
            </div>

            <p className="text-xs font-medium text-notion-text mt-1">
              {school.eligibility.rationale}
            </p>

            <div className="mt-2 text-[11px] text-notion-secondary pt-2 border-t border-notion-border">
              <strong>Recommended Action:</strong> {school.eligibility.actionAdvice}
            </div>
          </div>

          {/* Admissions Category Allocation & Cutoff Pair Matrix */}
          {school.eligibility.cutoffPair && (
            <div className="p-3.5 rounded-lg border bg-white border-notion-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-notion-border">
                <div>
                  <span className="text-[10px] font-bold text-notion-secondary uppercase tracking-wider block">
                    Admissions Category Allocation
                  </span>
                  <div className="text-sm font-bold text-notion-text mt-0.5 flex items-center gap-2">
                    <span>You land on:</span>
                    <span className="bg-notion-blue-bg text-notion-blue-text px-2 py-0.5 rounded text-xs border border-notion-blue-border font-bold">
                      {school.eligibility.cutoffPair.userCategoryTitle}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold border ${
                    school.eligibility.cutoffPair.isMeetingCategoryCutoff
                      ? 'bg-notion-green-bg text-notion-green-text border-notion-green-border'
                      : 'bg-notion-amber-bg text-notion-amber-text border-notion-amber-border'
                  }`}
                >
                  {school.eligibility.cutoffPair.categoryMarginText}
                </span>
              </div>

              <p className="text-[11px] text-notion-secondary leading-relaxed">
                {school.eligibility.cutoffPair.userCategoryDescription}
              </p>

              {/* Side-by-Side Cut-off Comparison */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {/* Catchment Cut-off */}
                <div
                  className={`p-3 rounded border ${
                    school.eligibility.cutoffPair.activeEvaluationType === 'catchment' || school.eligibility.cutoffPair.activeEvaluationType === 'distance'
                      ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300'
                      : 'bg-[#F7F7F5] border-notion-border'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-notion-secondary mb-1">
                    <span className="font-semibold">{school.eligibility.cutoffPair.catchmentCutoffLabel}</span>
                    {(school.eligibility.cutoffPair.activeEvaluationType === 'catchment' || school.eligibility.cutoffPair.activeEvaluationType === 'distance') && (
                      <span className="text-[9px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">Your Quota</span>
                    )}
                  </div>
                  <div className="text-base font-mono font-bold text-notion-text">
                    {school.eligibility.cutoffPair.catchmentCutoffValue}
                  </div>
                  <p className="text-[10px] text-notion-secondary mt-1 leading-normal">
                    {school.eligibility.cutoffPair.catchmentCutoffDetail}
                  </p>
                </div>

                {/* Governor Cut-off */}
                <div
                  className={`p-3 rounded border ${
                    school.eligibility.cutoffPair.activeEvaluationType === 'governor'
                      ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-300'
                      : 'bg-[#F7F7F5] border-notion-border'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-notion-secondary mb-1">
                    <span className="font-semibold">{school.eligibility.cutoffPair.governorCutoffLabel}</span>
                    {school.eligibility.cutoffPair.activeEvaluationType === 'governor' && (
                      <span className="text-[9px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">Your Quota</span>
                    )}
                  </div>
                  <div className="text-base font-mono font-bold text-notion-text">
                    {school.eligibility.cutoffPair.governorCutoffValue}
                  </div>
                  <p className="text-[10px] text-notion-secondary mt-1 leading-normal">
                    {school.eligibility.cutoffPair.governorCutoffDetail}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick SCAF Preference Assigner */}
          <div className="bg-white p-3 rounded-lg border border-notion-border flex items-center justify-between">
            <span className="text-xs font-semibold text-notion-text">Assign to SCAF 4-Slot List:</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => onUpdateScafPreference(pNum as any, school)}
                  className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-[#F7F7F5] hover:bg-[#37352F] hover:text-white border border-notion-border transition-colors"
                >
                  Set P{pNum}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Catchment & Distance Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-notion-secondary mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Catchment & Straight-Line Distance</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#F7F7F5] p-2.5 rounded border border-notion-border">
                <span className="text-notion-muted text-[10px] block">OSGB36 Euclidean Distance</span>
                <span className="text-sm font-bold font-mono text-notion-text">
                  {school.eligibility.distanceMiles !== null ? `${school.eligibility.distanceMiles} miles` : 'Postcode needed'}
                </span>
              </div>
              <div className="bg-[#F7F7F5] p-2.5 rounded border border-notion-border">
                <span className="text-notion-muted text-[10px] block">Catchment Area Priority</span>
                <span className="text-sm font-bold text-notion-text">
                  {school.eligibility.isCatchment ? 'In Priority Area' : 'Outer Pool'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-notion-secondary mt-2">
              <strong>Catchment Definition:</strong> {school.catchmentType}.
              {school.innerCatchmentDistricts?.length > 0 && (
                <span className="block mt-0.5">
                  Priority Districts: {school.innerCatchmentDistricts.join(', ')}.
                </span>
              )}
            </p>
          </div>

          {/* Section 1b: Girls-Only Cohort Intelligence (Specifically for Girls Schools like TGS) */}
          {isGirlsSchool && (
            <div className="bg-purple-50/60 p-3.5 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Girls-Only Cohort Analytics (2026/27)</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                  4,227 Grammar Girls Countywide
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2.5">
                <div className="bg-white p-2 rounded border border-purple-200 shadow-2xs">
                  <span className="text-[10px] text-gray-500 block">Girls Countywide Rank</span>
                  <span className="text-sm font-bold font-mono text-purple-900">
                    #{girlsCountyRank}
                  </span>
                  <span className="text-[9px] text-purple-700 block">Top {girlsPct}% of girls</span>
                </div>
                <div className="bg-white p-2 rounded border border-purple-200 shadow-2xs">
                  <span className="text-[10px] text-gray-500 block">West Kent Girls Rank</span>
                  <span className="text-sm font-bold font-mono text-purple-900">
                    #{girlsWestKentRank}
                  </span>
                  <span className="text-[9px] text-purple-700 block">of 632 in TM/TW/Sev</span>
                </div>
                <div className="bg-white p-2 rounded border border-purple-200 shadow-2xs">
                  <span className="text-[10px] text-gray-500 block">2025 Equivalent</span>
                  <span className="text-sm font-bold font-mono text-purple-900">
                    {girlsEquiv2025} pts
                  </span>
                  <span className="text-[9px] text-amber-700 block">{girlsDeflationDiff} pts deflation</span>
                </div>
              </div>

              {school.shortName.includes('TGS') && (
                <div className="text-[11px] text-purple-950 bg-white/80 p-2.5 rounded border border-purple-200 space-y-1">
                  <div className="font-semibold text-purple-900">
                    Tonbridge Grammar School Quota Mapping:
                  </div>
                  <div>
                    • <strong>Inner Catchment Area (135 Places)</strong>: Only 117 mainstream girls in all 3 West Kent districts scored ≥398 (and only 79 scored ≥405). Factoring in 30–40 girls choosing TWGGS (Tunbridge Wells), Weald of Kent (Sevenoaks), or private schools, the Inner cut-off projects at <strong>~398–400 pts on 1 March</strong>, dropping to <strong>~394–396 pts on April reallocation</strong>.
                  </div>
                  <div>
                    • <strong>Outer Governor Places (45 Places)</strong>: Highly contested across London/OOC (1,720 OOC girls, 127 scoring ≥415). Outer cut-off projects at <strong>≥414 pts</strong>.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 2: 5-Year Historical Cut-Offs & 2027 Projections */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-notion-secondary mb-2 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>Historical Cut-Offs (2022–2026) & 2027 Projections</span>
            </h3>

            <div className="border border-notion-border rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F7F7F5] border-b border-notion-border text-notion-secondary text-[10px]">
                    <th className="py-2 px-2.5">Year</th>
                    <th className="py-2 px-2.5">Pass Mark</th>
                    <th className="py-2 px-2.5">1 Mar Offer Day</th>
                    <th className="py-2 px-2.5">April Re-allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-notion-border font-mono text-[11px] tabular-nums">
                  {[2022, 2023, 2024, 2025, 2026].map((yr) => {
                    const cutoff = school.historicalCutoffs?.[yr];
                    const passMark = yr === 2026 ? 345 : 332;

                    let marchVal = cutoff?.marchScore ? `${cutoff.marchScore} pts` : cutoff?.marchDist ? `${cutoff.marchDist} mi` : '—';
                    let aprilVal = cutoff?.aprilScore ? `${cutoff.aprilScore} pts` : cutoff?.aprilDist ? `${cutoff.aprilDist} mi` : '—';

                    return (
                      <tr key={yr} className={yr === 2026 ? 'bg-[#F7F7F5] font-semibold' : ''}>
                        <td className="py-1.5 px-2.5">{yr}</td>
                        <td className="py-1.5 px-2.5 text-notion-secondary">{passMark}</td>
                        <td className="py-1.5 px-2.5">{marchVal}</td>
                        <td className="py-1.5 px-2.5 text-notion-secondary">{aprilVal}</td>
                      </tr>
                    );
                  })}
                  {/* Projected 2027 Row */}
                  <tr className="bg-notion-blue-bg font-bold text-notion-blue-text">
                    <td className="py-2 px-2.5 font-sans">2027 (Est)</td>
                    <td className="py-2 px-2.5">345</td>
                    <td className="py-2 px-2.5">
                      {school.projected2027Cutoff.marchScoreInner
                        ? `${school.projected2027Cutoff.marchScoreInner} pts (Inner)`
                        : school.projected2027Cutoff.marchDistanceMiles
                        ? `~${school.projected2027Cutoff.marchDistanceMiles} mi`
                        : school.projected2027Cutoff.marchDistanceInner
                        ? `~${school.projected2027Cutoff.marchDistanceInner} mi`
                        : `${school.projected2027Cutoff.marchScore} pts`}
                    </td>
                    <td className="py-2 px-2.5">
                      {school.projected2027Cutoff.aprilScoreInner
                        ? `${school.projected2027Cutoff.aprilScoreInner} pts`
                        : school.projected2027Cutoff.aprilDistanceMiles
                        ? `~${school.projected2027Cutoff.aprilDistanceMiles} mi`
                        : school.projected2027Cutoff.aprilDistanceInner
                        ? `~${school.projected2027Cutoff.aprilDistanceInner} mi`
                        : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-notion-muted mt-1.5">
              * Note: 2027 projections incorporate the +11 to +13 point score inflation resulting from the 345 qualifying threshold.
            </p>
          </div>

          {/* Section 3: Academic Excellence & DfE Performance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-notion-secondary mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>DfE Academic Performance (KS4 & KS5)</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#F7F7F5] p-2 rounded border border-notion-border">
                <div className="text-[10px] text-notion-muted">Ofsted Rating</div>
                <div className="text-xs font-bold text-notion-text mt-0.5">{school.academicMetrics.ofsted}</div>
                <div className="text-[9px] text-notion-muted">{school.academicMetrics.ofstedDate}</div>
              </div>
              <div className="bg-[#F7F7F5] p-2 rounded border border-notion-border">
                <div className="text-[10px] text-notion-muted">Progress 8</div>
                <div className="text-xs font-bold font-mono text-notion-text mt-0.5">{school.academicMetrics.progress8}</div>
                <div className="text-[9px] text-notion-secondary">{school.academicMetrics.progress8Rating}</div>
              </div>
              <div className="bg-[#F7F7F5] p-2 rounded border border-notion-border">
                <div className="text-[10px] text-notion-muted">Attainment 8</div>
                <div className="text-xs font-bold font-mono text-notion-text mt-0.5">{school.academicMetrics.attainment8}</div>
                <div className="text-[9px] text-notion-secondary">County Top 10%</div>
              </div>
            </div>

            <div className="mt-2 p-2.5 bg-[#F7F7F5] rounded border border-notion-border text-[11px] text-notion-secondary space-y-1">
              <div>
                Grade 5+ Eng & Maths: <strong>{school.academicMetrics.grade5PlusEngMath}%</strong> • Grade 7+: <strong>{school.academicMetrics.grade7PlusEngMath}%</strong>
              </div>
              <div>
                Higher Education: <strong>{school.academicMetrics.russellGroupOxbridge}</strong>
              </div>
            </div>
          </div>

          {/* Section 4: Appeals Intelligence & Advice */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-notion-secondary mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Independent Appeals Intelligence</span>
            </h3>

            <div className="bg-[#F7F7F5] p-3 rounded border border-notion-border text-xs">
              <div className="flex items-center justify-between text-[11px] font-medium text-notion-secondary pb-1.5 border-b border-notion-border mb-2">
                <span>Appeals Lodged: {school.appealStats.historicAppealsLodged}</span>
                <span>Heard: {school.appealStats.historicAppealsHeard}</span>
                <span className="font-bold text-notion-text">Upheld: {school.appealStats.historicAppealsUpheld}</span>
              </div>
              <p className="text-[11px] text-notion-secondary">
                {school.appealStats.appealNote}
              </p>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#F7F7F5] border-t border-notion-border flex items-center justify-between">
          <span className="text-[11px] text-notion-secondary">
            PAN: <strong>{school.pan2027}</strong> places for Sept 2027
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#37352F] text-white hover:bg-black transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
