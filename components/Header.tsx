'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, Gender } from '../types/admissions';
import { lookupPostcode } from '../lib/postcode';
import { Sparkles, MapPin, AlertCircle, CheckCircle2, SlidersHorizontal, BookOpen } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  onChange: (updated: UserProfile) => void;
}

export default function Header({ profile, onChange }: HeaderProps) {
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [postcodeStatus, setPostcodeStatus] = useState<string>('');

  // Handle score calculation
  const handleScoreChange = (field: 'english' | 'maths' | 'reasoning', val: number) => {
    const clamped = Math.max(69, Math.min(141, isNaN(val) ? 69 : val));
    const next = { ...profile, [field]: clamped };
    next.totalScore = next.english + next.maths + next.reasoning;
    onChange(next);
  };

  const handleTotalChange = (val: number) => {
    const clamped = Math.max(207, Math.min(423, isNaN(val) ? 207 : val));
    onChange({ ...profile, totalScore: clamped });
  };

  // Resolve postcode
  useEffect(() => {
    let active = true;
    const clean = profile.postcode.trim().replace(/\s+/g, '').toUpperCase();
    if (clean.length >= 3) {
      setPostcodeLoading(true);
      lookupPostcode(profile.postcode).then(res => {
        if (!active) return;
        setPostcodeLoading(false);
        if (res) {
          setPostcodeStatus(`${res.district}${res.parish && res.parish !== res.district ? ` (${res.parish})` : ''}`);
          onChange({
            ...profile,
            postcodeData: {
              eastings: res.eastings,
              northings: res.northings,
              latitude: res.latitude,
              longitude: res.longitude,
              district: res.district,
              parish: res.parish
            }
          });
        } else {
          setPostcodeStatus('Unrecognized UK Postcode');
        }
      });
    } else {
      setPostcodeStatus('');
    }
    return () => { active = false; };
  }, [profile.postcode]);

  // Presets from PRD test cases
  const applyPreset = (presetId: number) => {
    if (presetId === 1) {
      onChange({
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
        ehcpOrLookedAfter: false
      });
    } else if (presetId === 2) {
      onChange({
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
        ehcpOrLookedAfter: false
      });
    } else if (presetId === 3) {
      onChange({
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
        ehcpOrLookedAfter: false
      });
    }
  };

  const calculatedTotal = profile.scoreMode === 'detailed'
    ? profile.english + profile.maths + profile.reasoning
    : profile.totalScore;

  const hasFloorMiss = profile.scoreMode === 'detailed' && (profile.english < 111 || profile.maths < 111 || profile.reasoning < 111);

  return (
    <div className="w-full bg-white border-b border-notion-border">
      {/* Top Banner */}
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 pt-5 pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#F7F7F5] border border-notion-border text-base">
                🏛️
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-notion-text">
                Kent 11+ Admissions Intelligence Platform
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#EDF3EC] text-[#2B593F] border border-[#D4E4D2]">
                September 2027 Entry
              </span>
            </div>
            <p className="text-xs text-notion-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>📅 KCC Results Released: <strong>15 Oct 2026</strong></span>
              <span>•</span>
              <span className="text-red-700 font-medium">⚠️ SCAF Deadline: <strong>2 Nov 2026 (11:59pm)</strong></span>
              <span>•</span>
              <span>National Offer Day: <strong>1 Mar 2027</strong></span>
              <span>•</span>
              <span>2026 Qualifying Threshold: <strong>345 (Floor: 111)</strong></span>
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <span className="text-notion-muted text-[11px] font-medium mr-1">PRD Verification Presets:</span>
            <button
              onClick={() => applyPreset(1)}
              className="px-2.5 py-1 rounded bg-[#F7F7F5] hover:bg-[#F1F1EF] border border-notion-border text-notion-text transition-colors flex items-center gap-1"
              title="Sevenoaks Boy, Score 382 (Inflation & Super-Selective Check)"
            >
              <span>👦 Sevenoaks (382)</span>
            </button>
            <button
              onClick={() => applyPreset(2)}
              className="px-2.5 py-1 rounded bg-[#F7F7F5] hover:bg-[#F1F1EF] border border-notion-border text-notion-text transition-colors flex items-center gap-1"
              title="Bromley OOC Girl, Score 380 with English 108 (Single Paper Floor Fail Appeal Check)"
            >
              <span>👧 Bromley Floor Fail (380)</span>
            </button>
            <button
              onClick={() => applyPreset(3)}
              className="px-2.5 py-1 rounded bg-[#F7F7F5] hover:bg-[#F1F1EF] border border-notion-border text-notion-text transition-colors flex items-center gap-1"
              title="Faversham Girl, Score 336 with HTA Grammar Assessed (HTA Distance Check)"
            >
              <span>👧 Faversham HTA (336)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Command Bar */}
      <div className="sticky top-0 z-30 bg-[#F7F7F5] border-t border-b border-notion-border shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            {/* Left Controls: Scores, Mode, Gender */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Score Mode Toggle */}
              <div className="inline-flex rounded border border-notion-border bg-white p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => onChange({ ...profile, scoreMode: 'detailed' })}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    profile.scoreMode === 'detailed'
                      ? 'bg-[#F7F7F5] text-notion-text shadow-sm'
                      : 'text-notion-secondary hover:text-notion-text'
                  }`}
                >
                  Paper Breakdown
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...profile, scoreMode: 'quick' })}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    profile.scoreMode === 'quick'
                      ? 'bg-[#F7F7F5] text-notion-text shadow-sm'
                      : 'text-notion-secondary hover:text-notion-text'
                  }`}
                >
                  Quick Total
                </button>
              </div>

              {/* Detailed Papers */}
              {profile.scoreMode === 'detailed' ? (
                <div className="flex items-center gap-1.5 bg-white border border-notion-border rounded px-2.5 py-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-notion-muted font-medium">Eng</span>
                    <input
                      type="number"
                      min={69}
                      max={141}
                      value={profile.english}
                      onChange={(e) => handleScoreChange('english', parseInt(e.target.value))}
                      className="w-12 text-center text-xs font-mono font-medium border border-notion-border rounded py-0.5 focus:outline-none focus:border-notion-text tabular-nums"
                    />
                  </div>
                  <span className="text-notion-muted">+</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-notion-muted font-medium">Math</span>
                    <input
                      type="number"
                      min={69}
                      max={141}
                      value={profile.maths}
                      onChange={(e) => handleScoreChange('maths', parseInt(e.target.value))}
                      className="w-12 text-center text-xs font-mono font-medium border border-notion-border rounded py-0.5 focus:outline-none focus:border-notion-text tabular-nums"
                    />
                  </div>
                  <span className="text-notion-muted">+</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-notion-muted font-medium">Reas</span>
                    <input
                      type="number"
                      min={69}
                      max={141}
                      value={profile.reasoning}
                      onChange={(e) => handleScoreChange('reasoning', parseInt(e.target.value))}
                      className="w-12 text-center text-xs font-mono font-medium border border-notion-border rounded py-0.5 focus:outline-none focus:border-notion-text tabular-nums"
                    />
                  </div>
                  <span className="text-notion-muted">=</span>
                  <div className="flex items-center gap-1 pl-1">
                    <span className="text-xs font-bold font-mono text-notion-text tabular-nums">
                      {calculatedTotal}
                    </span>
                    <span className="text-[10px] text-notion-muted">/423</span>
                  </div>
                  {hasFloorMiss && (
                    <span className="ml-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-notion-amber-bg text-notion-amber-text border border-notion-amber-border">
                      Floor Miss (&lt;111)
                    </span>
                  )}
                </div>
              ) : (
                /* Quick Total Mode */
                <div className="flex items-center gap-2 bg-white border border-notion-border rounded px-2.5 py-1">
                  <span className="text-xs text-notion-secondary font-medium">Total:</span>
                  <input
                    type="number"
                    min={207}
                    max={423}
                    value={profile.totalScore}
                    onChange={(e) => handleTotalChange(parseInt(e.target.value))}
                    className="w-16 text-center text-xs font-mono font-bold border border-notion-border rounded py-0.5 tabular-nums focus:outline-none focus:border-notion-text"
                  />
                  <input
                    type="range"
                    min={207}
                    max={423}
                    value={profile.totalScore}
                    onChange={(e) => handleTotalChange(parseInt(e.target.value))}
                    className="w-24 sm:w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#37352F]"
                  />
                  {/* Grammar confirmation toggle for Quick mode */}
                  <label className="flex items-center gap-1 text-[11px] text-notion-secondary cursor-pointer border-l border-notion-border pl-2 ml-1">
                    <input
                      type="checkbox"
                      checked={profile.kccConfirmedGrammarAssessment}
                      onChange={(e) => onChange({ ...profile, kccConfirmedGrammarAssessment: e.target.checked })}
                      className="rounded border-notion-border text-[#37352F] focus:ring-0"
                    />
                    <span>KCC Grammar Assessed</span>
                  </label>
                </div>
              )}

              {/* Gender Selector */}
              <div className="inline-flex rounded border border-notion-border bg-white p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => onChange({ ...profile, gender: 'F' })}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    profile.gender === 'F'
                      ? 'bg-notion-blue-bg text-notion-blue-text font-semibold border border-notion-blue-border'
                      : 'text-notion-secondary hover:text-notion-text'
                  }`}
                >
                  Girl (F)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...profile, gender: 'M' })}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    profile.gender === 'M'
                      ? 'bg-notion-blue-bg text-notion-blue-text font-semibold border border-notion-blue-border'
                      : 'text-notion-secondary hover:text-notion-text'
                  }`}
                >
                  Boy (M)
                </button>
              </div>

              {/* Postcode Input */}
              <div className="flex items-center gap-1.5 bg-white border border-notion-border rounded px-2.5 py-1">
                <MapPin className="w-3.5 h-3.5 text-notion-muted" />
                <input
                  type="text"
                  placeholder="Postcode (e.g. TN13 1AA)"
                  value={profile.postcode}
                  onChange={(e) => onChange({ ...profile, postcode: e.target.value })}
                  className="w-28 text-xs font-mono font-medium focus:outline-none uppercase"
                />
                {postcodeLoading && <span className="text-[10px] text-notion-muted animate-pulse">Checking...</span>}
                {postcodeStatus && !postcodeLoading && (
                  <span className={`text-[11px] font-medium truncate max-w-[150px] ${
                    postcodeStatus.includes('Unrecognized') ? 'text-notion-red-text' : 'text-notion-secondary'
                  }`}>
                    {postcodeStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Right Controls: Priority Modifier Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-notion-muted hidden lg:inline">Priority:</span>
              <button
                type="button"
                onClick={() => onChange({ ...profile, pupilPremium: !profile.pupilPremium })}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  profile.pupilPremium
                    ? 'bg-notion-green-bg text-notion-green-text border-notion-green-border'
                    : 'bg-white text-notion-secondary border-notion-border hover:bg-[#F1F1EF]'
                }`}
              >
                FSM / Pupil Premium
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...profile, hasSibling: !profile.hasSibling })}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  profile.hasSibling
                    ? 'bg-notion-green-bg text-notion-green-text border-notion-green-border'
                    : 'bg-white text-notion-secondary border-notion-border hover:bg-[#F1F1EF]'
                }`}
              >
                Sibling Attending
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...profile, ehcpOrLookedAfter: !profile.ehcpOrLookedAfter })}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  profile.ehcpOrLookedAfter
                    ? 'bg-notion-green-bg text-notion-green-text border-notion-green-border'
                    : 'bg-white text-notion-secondary border-notion-border hover:bg-[#F1F1EF]'
                }`}
              >
                EHCP / LAC
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
