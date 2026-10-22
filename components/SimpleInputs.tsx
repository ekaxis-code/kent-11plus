'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, QualificationStatus } from '../types/admissions';
import { lookupPostcode } from '../lib/postcode';
import { MapPin, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Sparkles, User, Calculator } from 'lucide-react';

interface SimpleInputsProps {
  profile: UserProfile;
  onChange: (updated: UserProfile) => void;
  qualification: QualificationStatus;
}

export default function SimpleInputs({ profile, onChange, qualification }: SimpleInputsProps) {
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [postcodeLocation, setPostcodeLocation] = useState<string>('');

  // Handle score change
  const handleScoreChange = (field: 'english' | 'maths' | 'reasoning', rawValue: string) => {
    const val = parseInt(rawValue, 10);
    const num = isNaN(val) ? 69 : Math.max(69, Math.min(141, val));
    const next = { ...profile, [field]: num };
    next.totalScore = next.english + next.maths + next.reasoning;
    onChange(next);
  };

  // Postcode lookup
  useEffect(() => {
    let isMounted = true;
    const clean = profile.postcode.trim().replace(/\s+/g, '').toUpperCase();
    if (clean.length >= 3) {
      setPostcodeLoading(true);
      lookupPostcode(profile.postcode).then(res => {
        if (!isMounted) return;
        setPostcodeLoading(false);
        if (res) {
          setPostcodeLocation(`${res.district}${res.parish && res.parish !== res.district ? ` (${res.parish})` : ''}`);
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
          setPostcodeLocation('Unrecognized UK Postcode');
        }
      });
    } else {
      setPostcodeLocation('');
    }
    return () => { isMounted = false; };
  }, [profile.postcode]);

  // Presets
  const setPreset = (preset: 'sevenoaks' | 'bromley' | 'faversham') => {
    if (preset === 'sevenoaks') {
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
    } else if (preset === 'bromley') {
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
    } else if (preset === 'faversham') {
      onChange({
        scoreMode: 'detailed',
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

  const currentTotal = profile.english + profile.maths + profile.reasoning;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:p-6 mb-6">
      {/* Title & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>Enter Your Kent 11+ Details</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Select your child&apos;s gender, enter paper scores, and provide your home postcode to see all eligible grammar schools.
          </p>
        </div>

        {/* Quick Sample Scenarios */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-400 font-medium mr-1 hidden md:inline">Quick Examples:</span>
          <button
            type="button"
            onClick={() => setPreset('sevenoaks')}
            className="text-xs px-2.5 py-1 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium transition-colors"
          >
            👦 Sevenoaks (382)
          </button>
          <button
            type="button"
            onClick={() => setPreset('bromley')}
            className="text-xs px-2.5 py-1 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium transition-colors"
          >
            👧 Bromley Floor Miss (380)
          </button>
          <button
            type="button"
            onClick={() => setPreset('faversham')}
            className="text-xs px-2.5 py-1 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium transition-colors"
          >
            👧 Faversham HTA (336)
          </button>
        </div>
      </div>

      {/* Main Form: 3 Clean Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5">
        {/* Column 1: Gender Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            1. Child&apos;s Gender
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onChange({ ...profile, gender: 'M' })}
              className={`p-3 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                profile.gender === 'M'
                  ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm ring-1 ring-blue-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">👦</span>
              <span>Boy (M)</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...profile, gender: 'F' })}
              className={`p-3 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                profile.gender === 'F'
                  ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-sm ring-1 ring-purple-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">👧</span>
              <span>Girl (F)</span>
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Filters out single-sex schools of the opposite gender while including mixed grammar schools.
          </p>
        </div>

        {/* Column 2: Score Split */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              2. Kent Test Paper Scores
            </label>
            <span className="text-xs font-mono font-bold text-gray-900">
              Total: {currentTotal} <span className="text-gray-400 font-normal">/ 423</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="block text-[11px] text-gray-500 font-medium mb-1">English</span>
              <input
                type="number"
                min={69}
                max={141}
                value={profile.english}
                onChange={(e) => handleScoreChange('english', e.target.value)}
                className={`w-full p-2 text-center text-sm font-mono font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums ${
                  profile.english < 111 ? 'border-amber-400 bg-amber-50/50 text-amber-900' : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
              <span className="block text-[10px] text-gray-400 text-center mt-0.5">Floor: 111</span>
            </div>

            <div>
              <span className="block text-[11px] text-gray-500 font-medium mb-1">Maths</span>
              <input
                type="number"
                min={69}
                max={141}
                value={profile.maths}
                onChange={(e) => handleScoreChange('maths', e.target.value)}
                className={`w-full p-2 text-center text-sm font-mono font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums ${
                  profile.maths < 111 ? 'border-amber-400 bg-amber-50/50 text-amber-900' : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
              <span className="block text-[10px] text-gray-400 text-center mt-0.5">Floor: 111</span>
            </div>

            <div>
              <span className="block text-[11px] text-gray-500 font-medium mb-1">Reasoning</span>
              <input
                type="number"
                min={69}
                max={141}
                value={profile.reasoning}
                onChange={(e) => handleScoreChange('reasoning', e.target.value)}
                className={`w-full p-2 text-center text-sm font-mono font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums ${
                  profile.reasoning < 111 ? 'border-amber-400 bg-amber-50/50 text-amber-900' : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
              <span className="block text-[10px] text-gray-400 text-center mt-0.5">Floor: 111</span>
            </div>
          </div>

          {/* Quick HTA toggle if total is under 345 */}
          {currentTotal < 345 && (
            <label className="flex items-center gap-2 mt-2 cursor-pointer bg-gray-50 p-1.5 rounded border border-gray-200">
              <input
                type="checkbox"
                checked={profile.kccConfirmedGrammarAssessment}
                onChange={(e) => onChange({ ...profile, kccConfirmedGrammarAssessment: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] text-gray-700 font-medium">Awarded Grammar via Headteacher Assessment (HTA)</span>
            </label>
          )}
        </div>

        {/* Column 3: Home Postcode */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            3. Home Postcode
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="e.g. TN13 1AA or DA1 2HW"
              value={profile.postcode}
              onChange={(e) => onChange({ ...profile, postcode: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-sm font-mono font-bold uppercase border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="mt-2 text-xs">
            {postcodeLoading ? (
              <span className="text-gray-400 animate-pulse">Resolving location...</span>
            ) : postcodeLocation ? (
              <div className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-medium">{postcodeLocation}</span>
                <span className="text-gray-400 text-[11px]">(Calculates exact straight-line miles)</span>
              </div>
            ) : (
              <span className="text-gray-400 text-[11px]">Enter your postcode to calculate exact straight-line distance to schools.</span>
            )}
          </div>
        </div>
      </div>

      {/* Qualification Status Banner */}
      <div className={`mt-5 p-3.5 rounded-lg border flex items-start gap-3 transition-colors ${
        qualification.isStandardPass
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : qualification.isHtaOverrideCohort
          ? 'bg-blue-50 border-blue-200 text-blue-950'
          : qualification.isSinglePaperFloorFailCohort
          ? 'bg-amber-50 border-amber-200 text-amber-950'
          : 'bg-red-50 border-red-200 text-red-950'
      }`}>
        {qualification.isStandardPass ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
        ) : qualification.isHtaOverrideCohort ? (
          <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        ) : qualification.isSinglePaperFloorFailCohort ? (
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        )}

        <div className="text-xs sm:text-sm">
          <div className="font-bold flex items-center gap-2">
            <span>{qualification.headline}</span>
            <span className="text-xs font-normal opacity-80 font-mono">
              (Total {currentTotal} / 423)
            </span>
          </div>
          <p className="mt-0.5 text-xs opacity-90 leading-relaxed">
            {qualification.description}
          </p>
        </div>
      </div>
    </div>
  );
}
