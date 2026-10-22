'use client';

import React from 'react';
import { EvaluatedSchool, UserProfile } from '../types/admissions';
import { getCutoffCellText } from './SimpleSchoolList';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Scale, Check, X, MapPin, Building, ArrowRight } from 'lucide-react';

interface TimeComparisonViewProps {
  schools: EvaluatedSchool[];
  profile: UserProfile;
  comparedSchoolUrns: number[];
  onToggleCompare: (school: EvaluatedSchool) => void;
  onSelectSchool: (school: EvaluatedSchool) => void;
  distributionsData?: any;
}

export default function TimeComparisonView({
  schools,
  profile,
  comparedSchoolUrns,
  onToggleCompare,
  onSelectSchool,
  distributionsData
}: TimeComparisonViewProps) {
  const currentTotal = profile.english + profile.maths + profile.reasoning;

  // Filter gender-eligible
  const eligibleSchools = schools.filter(s => s.eligibility.badge !== 'INELIGIBLE (GENDER)');

  // If user selected schools to compare, use those; otherwise pick the top 3-4 nearest/relevant schools as default
  const comparedSchools = comparedSchoolUrns.length > 0
    ? eligibleSchools.filter(s => comparedSchoolUrns.includes(s.urn))
    : eligibleSchools.slice(0, 4);

  // Prepare line chart data comparing cut-offs over time (2022 to 2027)
  const years = [2022, 2023, 2024, 2025, 2026, 2027];
  const chartData = years.map(yr => {
    const point: any = { year: yr === 2027 ? '2027 (Est)' : yr.toString() };

    comparedSchools.forEach(s => {
      if (yr === 2027) {
        point[s.shortName] = s.projected2027Cutoff?.marchScoreInner || s.projected2027Cutoff?.marchScore || 345;
      } else {
        const hist = s.historicalCutoffs?.[yr];
        // If score cut-off exists, use it; if pure distance, standard pass was 332 (or 345 in 2026)
        point[s.shortName] = hist?.marchScore || (yr === 2026 ? 345 : 332);
      }
    });

    point['Child Score'] = currentTotal;
    return point;
  });

  const lineColors = ['#1F6C9C', '#2B593F', '#89632A', '#6366F1', '#D97706'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Admissions & Cut-Off Comparison Over Period of Time (2022–2027)</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Compare historical cut-offs, distance requirements, and the 2026 score inflation impact across target schools.
          </p>
        </div>

        {/* Selected count */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-medium">
            Comparing <strong>{comparedSchools.length}</strong> schools
          </span>
          {comparedSchoolUrns.length > 0 && (
            <button
              onClick={() => comparedSchools.forEach(s => onToggleCompare(s))}
              className="text-xs text-red-600 hover:underline font-semibold"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* 1. Side-by-Side School Comparison Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm text-gray-800">
          Side-by-Side Historical Cut-Off Progression
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                <th className="p-3 w-48">School Name</th>
                <th className="p-3">Distance</th>
                <th className="p-3">Archetype</th>
                <th className="p-3 bg-blue-50/70 text-blue-900 font-bold border-l border-blue-200">Catchment Cut-off</th>
                <th className="p-3 bg-purple-50/70 text-purple-900 font-bold border-l border-purple-200">Governor Cut-off</th>
                <th className="p-3 bg-amber-50/70 text-amber-900 font-bold border-l border-amber-200">Your Category & Margin</th>
                <th className="p-3 text-center font-mono">2024</th>
                <th className="p-3 text-center font-mono">2025</th>
                <th className="p-3 text-center font-mono bg-gray-200/60 text-gray-900">2026</th>
                <th className="p-3 text-center font-mono bg-blue-100/70 text-blue-900">2027 Est</th>
                <th className="p-3">Your Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comparedSchools.map(school => {
                const distMiles = school.eligibility.distanceMiles;
                const isSafe = school.eligibility.badge.includes('SAFE');
                const isTarget = school.eligibility.badge.includes('REALISTIC');
                const isWaitlist = school.eligibility.badge.includes('WAITLIST') || school.eligibility.badge.includes('BORDERLINE');
                const cutoff = school.eligibility.cutoffPair;

                return (
                  <tr key={school.urn} className="hover:bg-gray-50/80 transition-colors">
                    {/* School Name */}
                    <td className="p-3">
                      <div
                        onClick={() => onSelectSchool(school)}
                        className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer text-xs sm:text-sm"
                      >
                        {school.name}
                      </div>
                      <div className="text-[11px] text-gray-500">{school.town} • PAN {school.pan2027}</div>
                    </td>

                    {/* Distance */}
                    <td className="p-3 font-mono font-semibold text-gray-800">
                      {distMiles !== null ? `${distMiles} mi` : '—'}
                    </td>

                    {/* Type */}
                    <td className="p-3 text-gray-600">
                      {school.archetype === 'A'
                        ? 'Super-Selective'
                        : school.archetype === 'B'
                        ? 'Hybrid Core+Gov'
                        : school.archetype === 'C'
                        ? 'Pure Distance'
                        : 'Day Catchment'}
                    </td>

                    {/* Catchment Cut-off */}
                    <td className="p-3 bg-blue-50/30 border-l border-blue-100">
                      <div className="font-mono font-bold text-gray-900 flex items-center gap-1">
                        <span>{cutoff?.catchmentCutoffValue || '—'}</span>
                        {(cutoff?.activeEvaluationType === 'catchment' || cutoff?.activeEvaluationType === 'distance') && (
                          <span className="text-[9px] bg-blue-100 text-blue-800 font-sans font-bold px-1 rounded">Active</span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[140px]" title={cutoff?.catchmentCutoffDetail}>
                        {cutoff?.catchmentCutoffLabel}
                      </div>
                    </td>

                    {/* Governor Cut-off */}
                    <td className="p-3 bg-purple-50/30 border-l border-purple-100">
                      <div className="font-mono font-bold text-gray-900 flex items-center gap-1">
                        <span>{cutoff?.governorCutoffValue || '—'}</span>
                        {cutoff?.activeEvaluationType === 'governor' && (
                          <span className="text-[9px] bg-purple-100 text-purple-800 font-sans font-bold px-1 rounded">Active</span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[140px]" title={cutoff?.governorCutoffDetail}>
                        {cutoff?.governorCutoffLabel}
                      </div>
                    </td>

                    {/* Your Category & Margin */}
                    <td className="p-3 bg-amber-50/30 border-l border-amber-100">
                      <div className="font-bold text-gray-900 text-[11px] leading-tight">
                        {cutoff?.userCategoryTitle || '—'}
                      </div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${
                        cutoff?.isMeetingCategoryCutoff ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {cutoff?.categoryMarginText || '—'}
                      </div>
                    </td>

                    {/* 2024 to 2025 */}
                    <td className="p-3 text-center font-mono text-gray-600">
                      {getCutoffCellText(school, 2024)}
                    </td>
                    <td className="p-3 text-center font-mono text-gray-600">
                      {getCutoffCellText(school, 2025)}
                    </td>

                    {/* 2026 Entry */}
                    <td className="p-3 text-center font-mono font-bold bg-gray-50 text-gray-900">
                      {getCutoffCellText(school, 2026)}
                    </td>

                    {/* 2027 Entry (Projected from Oct 2026 test) */}
                    <td className="p-3 text-center font-mono font-bold bg-blue-50 text-blue-900">
                      {getCutoffCellText(school, '2027')}
                    </td>

                    {/* Verdict */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isSafe
                          ? 'bg-emerald-100 text-emerald-800'
                          : isTarget
                          ? 'bg-blue-100 text-blue-800'
                          : isWaitlist
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {school.eligibility.badge}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Visual Cut-Off Trajectory Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-gray-800">
            Cut-Off Score Trajectory Over Time (2022 to 2027)
          </h3>
          <p className="text-xs text-gray-500">
            Shows how qualifying cut-offs shifted higher over time. The dashed line marks your child&apos;s score ({currentTotal}).
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis domain={['auto', 'auto']} stroke="#6b7280" tick={{ fontSize: 12, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <ReferenceLine
                y={currentTotal}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{ value: `Your Score: ${currentTotal}`, fill: '#dc2626', fontSize: 11, position: 'top' }}
              />

              {comparedSchools.map((s, idx) => (
                <Line
                  key={s.urn}
                  type="monotone"
                  dataKey={s.shortName}
                  stroke={lineColors[idx % lineColors.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Kent Test Statutory Pass Mark Evolution (2015–2026) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-bold text-sm text-gray-800 mb-2">
          Kent County Council Qualifying Standards Evolution (2015–2026)
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          In 2026, KCC raised the automatic qualifying standard to 345 (up +13 points from 332 held between 2021 and 2025).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <span className="text-[11px] text-gray-400 block font-semibold">2015–2018</span>
            <span className="text-base font-bold font-mono text-gray-800">320</span>
            <span className="text-[10px] text-gray-500 block">Floor: 106</span>
          </div>
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <span className="text-[11px] text-gray-400 block font-semibold">2019</span>
            <span className="text-base font-bold font-mono text-gray-800">323</span>
            <span className="text-[10px] text-gray-500 block">Floor: 107</span>
          </div>
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <span className="text-[11px] text-gray-400 block font-semibold">2020</span>
            <span className="text-base font-bold font-mono text-gray-800">330</span>
            <span className="text-[10px] text-gray-500 block">Floor: 110</span>
          </div>
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <span className="text-[11px] text-gray-400 block font-semibold">2021–2025</span>
            <span className="text-base font-bold font-mono text-gray-800">332</span>
            <span className="text-[10px] text-gray-500 block">Floor: 108</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300">
            <span className="text-[11px] text-amber-700 block font-bold">2026 (Current)</span>
            <span className="text-base font-bold font-mono text-amber-900">345</span>
            <span className="text-[10px] text-amber-700 block font-semibold">Floor: 111 (+13 pts)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-300">
            <span className="text-[11px] text-blue-700 block font-bold">Your 2026 Score</span>
            <span className="text-base font-bold font-mono text-blue-900">{currentTotal}</span>
            <span className="text-[10px] text-blue-700 block">
              {currentTotal >= 345 ? 'Clears 345' : 'Below 345'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
