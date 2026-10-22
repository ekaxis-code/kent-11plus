'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, BarChart2, ShieldAlert, Award } from 'lucide-react';

interface HistoricalTrendExplorerProps {
  distributionsData: any;
  currentScore?: number;
}

export default function HistoricalTrendExplorer({
  distributionsData,
  currentScore = 382
}: HistoricalTrendExplorerProps) {
  const [activeChart, setActiveChart] = useState<'curves' | 'districts' | 'anomalies'>('curves');

  if (!distributionsData) {
    return (
      <div className="bg-white border border-notion-border rounded-lg p-6 text-center text-xs text-notion-muted">
        Loading historical analytics...
      </div>
    );
  }

  // 1. Prepare Data for Chart A: Cumulative Score Curves (Scores 310 to 423)
  const scoreCurveData = [];
  const cumRanks = distributionsData.cumulativeRanks || {};
  for (let s = 310; s <= 423; s += 2) {
    scoreCurveData.push({
      score: s,
      '2026 (Pass 345)': cumRanks['2026']?.[s] || 0,
      '2025 (Pass 332)': cumRanks['2025']?.[s] || 0,
      '2024 (Pass 332)': cumRanks['2024']?.[s] || 0,
      '2023 (Pass 332)': cumRanks['2023']?.[s] || 0,
      '2020 (Pass 330)': cumRanks['2020']?.[s] || 0,
      '2018 (Pass 320)': cumRanks['2018']?.[s] || 0,
    });
  }

  // 2. Prepare Data for Chart B: 2026 District x Gender Grammar Passes & High Scorers (380+)
  const districtMatrix = distributionsData.districtMatrix2026 || {};
  const districtChartData = Object.keys(districtMatrix).map(distName => {
    const fData = districtMatrix[distName]?.F || {};
    const mData = districtMatrix[distName]?.M || {};

    let f380 = 0, m380 = 0;
    for (let s = 380; s <= 423; s++) {
      f380 += (fData.grammarScores?.[s] || 0);
      m380 += (mData.grammarScores?.[s] || 0);
    }

    return {
      district: distName,
      'Girls Grammar': fData.totalGrammar || 0,
      'Boys Grammar': mData.totalGrammar || 0,
      'Total Grammar': (fData.totalGrammar || 0) + (mData.totalGrammar || 0),
      'Top Scorers (380+)': f380 + m380
    };
  }).sort((a, b) => b['Total Grammar'] - a['Total Grammar']);

  // 3. Prepare Data for Chart C: HTA Overrides (<345) vs Single-Paper Floor Fails (>=345) by District
  const anomalyChartData = Object.keys(districtMatrix).map(distName => {
    const fData = districtMatrix[distName]?.F || {};
    const mData = districtMatrix[distName]?.M || {};

    const totalHta = (fData.htaCount || 0) + (mData.htaCount || 0);
    const totalFloorFail = (fData.floorFailCount || 0) + (mData.floorFailCount || 0);

    return {
      district: distName,
      'HTA Override (<345)': totalHta,
      'Single-Paper Floor Trap (≥345)': totalFloorFail,
      total: totalHta + totalFloorFail
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="bg-white border border-notion-border rounded-lg p-4 sm:p-5 shadow-sm mt-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-notion-border">
        <div>
          <div className="flex items-center gap-1.5 font-bold text-notion-text text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 text-notion-secondary" />
            <span>12-Year Historical Trend & Score Inflation Explorer (2015–2026)</span>
          </div>
          <p className="text-xs text-notion-secondary mt-0.5">
            Empirical evidence of the 2026 +11 to +13 point score shift, regional seat supply, and Headteacher Assessment overrides.
          </p>
        </div>

        <div className="inline-flex rounded border border-notion-border bg-[#F7F7F5] p-0.5 text-xs">
          <button
            onClick={() => setActiveChart('curves')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeChart === 'curves'
                ? 'bg-white text-notion-text shadow-sm'
                : 'text-notion-secondary hover:text-notion-text'
            }`}
          >
            Score Shift Curves
          </button>
          <button
            onClick={() => setActiveChart('districts')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeChart === 'districts'
                ? 'bg-white text-notion-text shadow-sm'
                : 'text-notion-secondary hover:text-notion-text'
            }`}
          >
            District Pass Volumes
          </button>
          <button
            onClick={() => setActiveChart('anomalies')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeChart === 'anomalies'
                ? 'bg-white text-notion-text shadow-sm'
                : 'text-notion-secondary hover:text-notion-text'
            }`}
          >
            HTA & Floor Fails
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="pt-4 h-[380px] w-full">
        {activeChart === 'curves' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreCurveData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E7" />
              <XAxis
                dataKey="score"
                stroke="#787774"
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                label={{ value: 'Kent Test Aggregate Score (Score Range: 310 to 423)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#787774' }}
              />
              <YAxis
                stroke="#787774"
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                label={{ value: 'Cumulative Rank (Pupils Scoring ≥ X)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: '#787774' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7', borderRadius: '6px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceLine x={345} stroke="#37352F" strokeDasharray="3 3" label={{ value: '2026 Pass: 345', fill: '#37352F', fontSize: 10, position: 'top' }} />
              <ReferenceLine x={332} stroke="#89632A" strokeDasharray="3 3" label={{ value: '2021-2025 Pass: 332', fill: '#89632A', fontSize: 10, position: 'insideTopLeft' }} />
              <ReferenceLine x={currentScore} stroke="#1F6C9C" strokeWidth={2} label={{ value: `Your Score: ${currentScore}`, fill: '#1F6C9C', fontSize: 10, position: 'top' }} />

              <Line type="monotone" dataKey="2026 (Pass 345)" stroke="#37352F" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="2025 (Pass 332)" stroke="#1F6C9C" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="2024 (Pass 332)" stroke="#2B593F" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="2023 (Pass 332)" stroke="#89632A" strokeWidth={1.5} dot={false} strokeDasharray="2 2" />
              <Line type="monotone" dataKey="2020 (Pass 330)" stroke="#9E3632" strokeWidth={1.2} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'districts' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={districtChartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 110, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E7" />
              <XAxis type="number" stroke="#787774" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis dataKey="district" type="category" stroke="#787774" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7', borderRadius: '6px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Girls Grammar" fill="#E7F3F8" stroke="#1F6C9C" strokeWidth={1} stackId="a" />
              <Bar dataKey="Boys Grammar" fill="#EDF3EC" stroke="#2B593F" strokeWidth={1} stackId="a" />
              <Bar dataKey="Top Scorers (380+)" fill="#37352F" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'anomalies' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={anomalyChartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 110, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E7" />
              <XAxis type="number" stroke="#787774" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis dataKey="district" type="category" stroke="#787774" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7', borderRadius: '6px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="HTA Override (<345)" fill="#E7F3F8" stroke="#1F6C9C" strokeWidth={1} />
              <Bar dataKey="Single-Paper Floor Trap (≥345)" fill="#FBF3DB" stroke="#89632A" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Explanatory Callout Footer */}
      <div className="mt-4 pt-3 border-t border-notion-border text-xs text-notion-secondary grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#F7F7F5] p-2.5 rounded border border-notion-border">
          <strong className="text-notion-text block text-[11px] mb-0.5">The +13 pt Cohort Shift:</strong>
          KCC raised the pass mark from 332 to 345 because the whole cohort surged. Raw score comparisons to 2021-2025 are invalid without applying rank equivalence.
        </div>
        <div className="bg-[#F7F7F5] p-2.5 rounded border border-notion-border">
          <strong className="text-notion-text block text-[11px] mb-0.5">733 HTA Overrides:</strong>
          Children scoring &lt;345 who won Grammar assessment at panel. They are 100% equal for distance grammars, but cannot clear super-selective score cut-offs.
        </div>
        <div className="bg-[#F7F7F5] p-2.5 rounded border border-notion-border">
          <strong className="text-notion-text block text-[11px] mb-0.5">520 Single Floor Failures:</strong>
          Scored ≥345 (up to 388) but missed 111 on one paper. Must name grammar schools on SCAF by 2 Nov 2026 to activate statutory Spring 2027 Independent Appeals.
        </div>
      </div>
    </div>
  );
}
