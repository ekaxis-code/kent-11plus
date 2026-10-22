'use client';

import React, { useState } from 'react';
import { EvaluatedSchool, UserProfile } from '../types/admissions';
import {
  MapPin,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  Plus,
  Check,
  Building,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface SimpleSchoolListProps {
  schools: EvaluatedSchool[];
  profile: UserProfile;
  selectedSchool: EvaluatedSchool | null;
  onSelectSchool: (school: EvaluatedSchool) => void;
  comparedSchoolUrns: number[];
  onToggleCompare: (school: EvaluatedSchool) => void;
  onGoToCompareTab: () => void;
}

export function getCutoffCellText(school: EvaluatedSchool, year: number | '2027'): string {
  if (year === '2027') {
    if (school.archetype === 'A') {
      const score = school.projected2027Cutoff?.marchScoreInner || school.projected2027Cutoff?.marchScore || 385;
      return `${score} pts`;
    }
    if (school.archetype === 'B') {
      const dist = school.projected2027Cutoff?.marchDistanceInner;
      const score = school.projected2027Cutoff?.marchScoreOuter;
      if (dist && score) return `${dist}m / ${score}p`;
      if (dist) return `${dist} mi`;
      return `${score || 365} pts`;
    }
    if (school.archetype === 'C') {
      const dist = school.projected2027Cutoff?.marchDistanceMiles || 6.0;
      return `${dist} mi`;
    }
    return '8.5 mi';
  }

  // Historical years (2022..2026)
  const cutoff = school.historicalCutoffs?.[year];
  if (school.archetype === 'A') {
    return cutoff?.marchScore ? `${cutoff.marchScore} pts` : '—';
  }
  if (school.archetype === 'B') {
    if (cutoff?.marchDist && cutoff?.marchScore) {
      return `${cutoff.marchDist}m / ${cutoff.marchScore}p`;
    }
    if (cutoff?.marchDist) return `${cutoff.marchDist} mi`;
    if (cutoff?.marchScore) return `${cutoff.marchScore} pts`;
    return '—';
  }
  if (school.archetype === 'C') {
    return cutoff?.marchDist ? `${cutoff.marchDist} mi` : '—';
  }
  return '8.5 mi';
}

export default function SimpleSchoolList({
  schools,
  profile,
  selectedSchool,
  onSelectSchool,
  comparedSchoolUrns,
  onToggleCompare,
  onGoToCompareTab
}: SimpleSchoolListProps) {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'SAFE' | 'TARGET' | 'REACH' | 'OUT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Gender-eligible schools
  const eligibleSchools = schools.filter(s => s.eligibility.badge !== 'INELIGIBLE (GENDER)');

  // Filter counts
  const countSafe = eligibleSchools.filter(s => s.eligibility.badge === 'SAFE OFFER (MARCH)').length;
  const countTarget = eligibleSchools.filter(s => s.eligibility.badge === 'REALISTIC TARGET').length;
  const countReach = eligibleSchools.filter(s =>
    s.eligibility.badge === 'WAITLIST / APRIL RE-ALLOCATION' || s.eligibility.badge === 'APPEAL CANDIDATE (MARCH 2027)'
  ).length;
  const countOut = eligibleSchools.filter(s => s.eligibility.badge === 'OUT OF RANGE').length;

  // Filtered list
  const filtered = eligibleSchools.filter(school => {
    const badge = school.eligibility.badge;
    if (filterCategory === 'SAFE' && badge !== 'SAFE OFFER (MARCH)') return false;
    if (filterCategory === 'TARGET' && badge !== 'REALISTIC TARGET') return false;
    if (filterCategory === 'REACH' && !badge.includes('WAITLIST') && !badge.includes('APPEAL') && !badge.includes('BORDERLINE')) return false;
    if (filterCategory === 'OUT' && badge !== 'OUT OF RANGE') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        school.name.toLowerCase().includes(q) ||
        school.town.toLowerCase().includes(q) ||
        school.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort by distance if available, otherwise by name
  filtered.sort((a, b) => {
    const distA = a.eligibility.distanceMiles ?? 999;
    const distB = b.eligibility.distanceMiles ?? 999;
    return distA - distB;
  });

  const currentTotal = profile.english + profile.maths + profile.reasoning;

  // Helper for badge visual styles
  const getVerdictStyle = (badge: string) => {
    if (badge.includes('SAFE')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        label: 'Safe Offer (High Probability)',
        desc: 'Based on your score and distance, an offer on 1 March National Offer Day is highly likely.'
      };
    }
    if (badge.includes('REALISTIC')) {
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-300',
        dot: 'bg-blue-500',
        label: 'Realistic Target (Competitive)',
        desc: 'Your profile meets competitive cut-offs; a solid primary preference choice.'
      };
    }
    if (badge.includes('WAITLIST') || badge.includes('BORDERLINE')) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        label: 'Waitlist / April Reach',
        desc: 'Slightly below March offer cut-off, but in contention for April reallocation or waitlist movement.'
      };
    }
    if (badge.includes('APPEAL')) {
      return {
        bg: 'bg-orange-50 text-orange-800 border-orange-300',
        dot: 'bg-orange-500',
        label: 'Appeal Candidate (March 2027)',
        desc: 'Achieved high aggregate score (≥345) but missed one paper floor. Eligible for independent appeal.'
      };
    }
    return {
      bg: 'bg-gray-100 text-gray-700 border-gray-300',
      dot: 'bg-gray-400',
      label: 'Out of Range',
      desc: 'Score or distance is currently outside the historical allocation range.'
    };
  };

  const getArchetypePlainName = (arch: string) => {
    if (arch === 'A') return 'Super-Selective (Score Ranked)';
    if (arch === 'B') return 'Hybrid (Catchment Distance + Top Score Places)';
    if (arch === 'C') return 'Pure Distance (Once Qualified)';
    return 'Boarding & Day (8.5 mi Radius)';
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Summary Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterCategory === 'ALL'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Matching ({eligibleSchools.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('SAFE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterCategory === 'SAFE'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Safe Offers ({countSafe})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('TARGET')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterCategory === 'TARGET'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Realistic Targets ({countTarget})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('REACH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterCategory === 'REACH'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Waitlist / Reach ({countReach})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('OUT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterCategory === 'OUT'
                ? 'bg-gray-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Out of Range ({countOut})
          </button>
        </div>

        {/* Search & Compare Tracker */}
        <div className="flex items-center gap-2">
          {comparedSchoolUrns.length > 0 && (
            <button
              onClick={onGoToCompareTab}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
            >
              <span>Compare {comparedSchoolUrns.length} Schools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter by school or town..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* School Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <p className="text-sm font-medium">No grammar schools match your current filter.</p>
          <button
            onClick={() => { setFilterCategory('ALL'); setSearchQuery(''); }}
            className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(school => {
            const verdict = getVerdictStyle(school.eligibility.badge);
            const isCompared = comparedSchoolUrns.includes(school.urn);
            const distMiles = school.eligibility.distanceMiles;

            return (
              <div
                key={school.urn}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: School Name, Town, Distance */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3
                        onClick={() => onSelectSchool(school)}
                        className="text-base font-bold text-gray-900 hover:text-blue-600 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{school.name}</span>
                        {school.additionalCampuses && (
                          <span className="text-xs font-normal text-gray-500">(Dual Campus)</span>
                        )}
                      </h3>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>{school.town} ({school.district})</span>
                        <span>•</span>
                        <span className="text-gray-600 font-medium">{getArchetypePlainName(school.archetype)}</span>
                      </div>
                    </div>

                    {/* Distance Pill */}
                    {distMiles !== null ? (
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        <span>{distMiles} mi</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400">Postcode required</span>
                    )}
                  </div>

                  {/* Verdict Badge */}
                  <div className={`mt-3 px-3 py-2 rounded-lg border flex items-start gap-2.5 ${verdict.bg}`}>
                    <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${verdict.dot}`}></span>
                    <div className="text-xs">
                      <strong className="block font-bold">{verdict.label}</strong>
                      <p className="mt-0.5 opacity-90 leading-relaxed text-[11px]">
                        {school.eligibility.rationale}
                      </p>
                    </div>
                  </div>

                  {/* Cutoff Pair & Category Landing Section */}
                  {school.eligibility.cutoffPair && (
                    <div className="mt-3 bg-gray-50/90 rounded-lg border border-gray-200 p-2.5 text-xs">
                      {/* Landing Category Header */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-gray-200 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">You land on:</span>
                          <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                            {school.eligibility.cutoffPair.userCategoryTitle}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            school.eligibility.cutoffPair.isMeetingCategoryCutoff
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {school.eligibility.cutoffPair.categoryMarginText}
                        </span>
                      </div>

                      {/* Side-by-Side Cut-off Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {/* Catchment Cut-off */}
                        <div
                          className={`p-2 rounded border transition-colors ${
                            school.eligibility.cutoffPair.activeEvaluationType === 'catchment' || school.eligibility.cutoffPair.activeEvaluationType === 'distance'
                              ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-gray-500 mb-0.5">
                            <span className="font-medium truncate">{school.eligibility.cutoffPair.catchmentCutoffLabel}</span>
                            {(school.eligibility.cutoffPair.activeEvaluationType === 'catchment' || school.eligibility.cutoffPair.activeEvaluationType === 'distance') && (
                              <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1 rounded flex-shrink-0 ml-1">Active</span>
                            )}
                          </div>
                          <div className="text-sm font-mono font-bold text-gray-900">
                            {school.eligibility.cutoffPair.catchmentCutoffValue}
                          </div>
                          <div className="text-[9px] text-gray-500 mt-0.5 truncate" title={school.eligibility.cutoffPair.catchmentCutoffDetail}>
                            {school.eligibility.cutoffPair.catchmentCutoffDetail}
                          </div>
                        </div>

                        {/* Governor / Outer Cut-off */}
                        <div
                          className={`p-2 rounded border transition-colors ${
                            school.eligibility.cutoffPair.activeEvaluationType === 'governor'
                              ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-300'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-gray-500 mb-0.5">
                            <span className="font-medium truncate">{school.eligibility.cutoffPair.governorCutoffLabel}</span>
                            {school.eligibility.cutoffPair.activeEvaluationType === 'governor' && (
                              <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1 rounded flex-shrink-0 ml-1">Active</span>
                            )}
                          </div>
                          <div className="text-sm font-mono font-bold text-gray-900">
                            {school.eligibility.cutoffPair.governorCutoffValue}
                          </div>
                          <div className="text-[9px] text-gray-500 mt-0.5 truncate" title={school.eligibility.cutoffPair.governorCutoffDetail}>
                            {school.eligibility.cutoffPair.governorCutoffDetail}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5-Year Historical Cut-Off Comparison (Over Period of Time) */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                        <span>Cut-off Movement Over Period of Time:</span>
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {school.archetype === 'C' ? 'Ranked by distance (Requires 345+)' : `Your Score: ${currentTotal}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1 text-center font-mono text-[11px] bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <div>
                        <div className="text-[9px] text-gray-400 font-sans">2022</div>
                        <div className="font-semibold text-gray-800 tabular-nums">
                          {getCutoffCellText(school, 2022)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-400 font-sans">2023</div>
                        <div className="font-semibold text-gray-800 tabular-nums">
                          {getCutoffCellText(school, 2023)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-400 font-sans">2024</div>
                        <div className="font-semibold text-gray-800 tabular-nums">
                          {getCutoffCellText(school, 2024)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-400 font-sans">2025</div>
                        <div className="font-semibold text-gray-800 tabular-nums">
                          {getCutoffCellText(school, 2025)}
                        </div>
                      </div>
                      <div className="bg-white rounded border border-gray-200 shadow-2xs">
                        <div className="text-[9px] text-gray-600 font-sans font-bold">2026</div>
                        <div className="font-bold text-gray-900 tabular-nums">
                          {getCutoffCellText(school, 2026)}
                        </div>
                      </div>
                      <div className="bg-blue-50 text-blue-900 rounded border border-blue-200">
                        <div className="text-[9px] text-blue-700 font-sans font-bold">2027 Est</div>
                        <div className="font-bold tabular-nums">
                          {getCutoffCellText(school, '2027')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  {/* Compare checkbox */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900 font-medium">
                    <input
                      type="checkbox"
                      checked={isCompared}
                      onChange={() => onToggleCompare(school)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Compare Over Time</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => onSelectSchool(school)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                  >
                    <span>Full School Report</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
