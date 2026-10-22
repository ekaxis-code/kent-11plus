'use client';

import React, { useState, useEffect, useMemo } from 'react';
import SimpleInputs from '../components/SimpleInputs';
import SimpleSchoolList from '../components/SimpleSchoolList';
import TimeComparisonView from '../components/TimeComparisonView';
import MapView from '../components/MapView';
import SCAFBuilder from '../components/SCAFBuilder';
import SchoolDrawer from '../components/SchoolDrawer';
import {
  UserProfile,
  School,
  EvaluatedSchool,
  SCAFBlueprint
} from '../types/admissions';
import {
  checkQualificationStatus,
  calculate2026RankAndEquivalents,
  evaluateSchoolEligibility,
  generateSCAFRecommendations
} from '../lib/admissions-engine';
import { Building2, TrendingUp, Map, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

import rawDistributions from '../public/data/kent_distributions_2015_2026.json';
import rawSchools from '../public/data/kent_schools_32.json';

export default function Home() {
  const [distributionsData] = useState<any>(rawDistributions);
  const [schools] = useState<School[]>(rawSchools as unknown as School[]);
  const [selectedSchool, setSelectedSchool] = useState<EvaluatedSchool | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'list' | 'compare' | 'map' | 'scaf'>('list');
  const [comparedSchoolUrns, setComparedSchoolUrns] = useState<number[]>([]);

  // User Profile: Defaults to Sevenoaks Boy 382
  const [profile, setProfile] = useState<UserProfile>({
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
    ehcpOrLookedAfter: false,
    postcodeData: {
      eastings: 553000,
      northings: 154500,
      latitude: 51.27,
      longitude: 0.19,
      district: 'Sevenoaks',
      parish: 'Sevenoaks'
    }
  });

  // Custom SCAF Slots
  const [customScafSlots, setCustomScafSlots] = useState<{
    pref1: EvaluatedSchool | null;
    pref2: EvaluatedSchool | null;
    pref3: EvaluatedSchool | null;
    pref4: EvaluatedSchool | null;
  }>({
    pref1: null,
    pref2: null,
    pref3: null,
    pref4: null
  });

  // Real-time calculations
  const qualification = useMemo(() => {
    return checkQualificationStatus(profile);
  }, [profile]);

  const currentTotal = profile.english + profile.maths + profile.reasoning;

  const evaluatedSchools: EvaluatedSchool[] = useMemo(() => {
    if (!schools || schools.length === 0) return [];
    return schools.map(school => ({
      ...school,
      eligibility: evaluateSchoolEligibility(profile, school, distributionsData)
    }));
  }, [schools, profile, distributionsData]);

  // Keep selectedSchool up to date with recalculated values
  useEffect(() => {
    if (selectedSchool) {
      const updated = evaluatedSchools.find(s => s.urn === selectedSchool.urn);
      if (updated) setSelectedSchool(updated);
    }
  }, [evaluatedSchools]);

  // SCAF Blueprint
  const autoScaf = useMemo(() => {
    if (evaluatedSchools.length === 0) {
      return { pref1: null, pref2: null, pref3: null, pref4: null, commentary: '' };
    }
    return generateSCAFRecommendations(evaluatedSchools, profile);
  }, [evaluatedSchools, profile]);

  const activeScaf: SCAFBlueprint = useMemo(() => {
    return {
      pref1: customScafSlots.pref1 ?? autoScaf.pref1,
      pref2: customScafSlots.pref2 ?? autoScaf.pref2,
      pref3: customScafSlots.pref3 ?? autoScaf.pref3,
      pref4: customScafSlots.pref4 ?? autoScaf.pref4,
      commentary: autoScaf.commentary
    };
  }, [customScafSlots, autoScaf]);

  const handleUpdateScafPreference = (prefIndex: 1 | 2 | 3 | 4, school: EvaluatedSchool | null) => {
    setCustomScafSlots(prev => ({
      ...prev,
      [`pref${prefIndex}`]: school
    }));
  };

  // Toggle compare school
  const handleToggleCompare = (school: EvaluatedSchool) => {
    setComparedSchoolUrns(prev => {
      if (prev.includes(school.urn)) {
        return prev.filter(id => id !== school.urn);
      } else {
        return [...prev, school.urn];
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shadow-2xs">
              🏛️
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                Kent 11+ Grammar School Admissions & Historical Tracker
              </h1>
              <p className="text-xs text-gray-500">
                Official KCC 2015–2026 Data Engine • September 2027 Entry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              SCAF Deadline: 2 Nov 2026
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Step 1: Accessible Inputs Panel */}
        <SimpleInputs
          profile={profile}
          onChange={setProfile}
          qualification={qualification}
        />

        {/* View Selection Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto">
            <button
              onClick={() => setActiveMainTab('list')}
              className={`py-3 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeMainTab === 'list'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>1. Grammar Schools List</span>
            </button>

            <button
              onClick={() => setActiveMainTab('compare')}
              className={`py-3 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeMainTab === 'compare'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>2. Compare Over Time</span>
              {comparedSchoolUrns.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-mono">
                  {comparedSchoolUrns.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMainTab('map')}
              className={`py-3 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeMainTab === 'map'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>3. Catchment Distance Map</span>
            </button>

            <button
              onClick={() => setActiveMainTab('scaf')}
              className={`py-3 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeMainTab === 'scaf'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>4. SCAF Application Guide</span>
            </button>
          </nav>
        </div>

        {/* Tab 1: Primary Schools List */}
        {activeMainTab === 'list' && (
          <SimpleSchoolList
            schools={evaluatedSchools}
            profile={profile}
            selectedSchool={selectedSchool}
            onSelectSchool={setSelectedSchool}
            comparedSchoolUrns={comparedSchoolUrns}
            onToggleCompare={handleToggleCompare}
            onGoToCompareTab={() => setActiveMainTab('compare')}
          />
        )}

        {/* Tab 2: Comparison Over Period of Time */}
        {activeMainTab === 'compare' && (
          <TimeComparisonView
            schools={evaluatedSchools}
            profile={profile}
            comparedSchoolUrns={comparedSchoolUrns}
            onToggleCompare={handleToggleCompare}
            onSelectSchool={setSelectedSchool}
            distributionsData={distributionsData}
          />
        )}

        {/* Tab 3: Interactive GIS Distance Map */}
        {activeMainTab === 'map' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-[650px]">
            <MapView
              profile={profile}
              schools={evaluatedSchools}
              selectedSchool={selectedSchool}
              onSelectSchool={setSelectedSchool}
            />
          </div>
        )}

        {/* Tab 4: SCAF 4-Choice Guide */}
        {activeMainTab === 'scaf' && (
          <SCAFBuilder
            scaf={activeScaf}
            onUpdatePreference={handleUpdateScafPreference}
            onOpenSchoolDrawer={setSelectedSchool}
          />
        )}
      </main>

      {/* School Deep-Dive Slide-Over Drawer */}
      <SchoolDrawer
        school={selectedSchool}
        onClose={() => setSelectedSchool(null)}
        profile={profile}
        onUpdateScafPreference={handleUpdateScafPreference}
        distributionsData={distributionsData}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Kent 11+ Admissions Intelligence Platform • Kent County Council Official Data (2015–2026)
          </p>
          <p className="text-gray-400">
            For guidance purposes. Final allocations are determined by KCC on 1 March 2027.
          </p>
        </div>
      </footer>
    </div>
  );
}
