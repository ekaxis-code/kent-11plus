'use client';

import React, { useState } from 'react';
import { EvaluatedSchool, SCAFBlueprint } from '../types/admissions';
import { Search, Filter, ExternalLink, ArrowUpDown, PlusCircle, Check, Info } from 'lucide-react';

interface SchoolMatrixProps {
  schools: EvaluatedSchool[];
  selectedSchool: EvaluatedSchool | null;
  onSelectSchool: (school: EvaluatedSchool) => void;
  scaf: SCAFBlueprint;
  onUpdateScafPreference: (prefIndex: 1 | 2 | 3 | 4, school: EvaluatedSchool | null) => void;
}

type TabType = 'all' | 'catchment' | 'outer' | 'scaf';

export default function SchoolMatrix({
  schools,
  selectedSchool,
  onSelectSchool,
  scaf,
  onUpdateScafPreference
}: SchoolMatrixProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [archetypeFilter, setArchetypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'distance' | 'name' | 'status'>('distance');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter gender-eligible
  const eligibleSchools = schools.filter(s => s.eligibility.badge !== 'INELIGIBLE (GENDER)');

  // Tab filtering
  let filtered = eligibleSchools.filter(school => {
    if (activeTab === 'catchment' && !school.eligibility.isCatchment) return false;
    if (activeTab === 'outer' && school.archetype === 'C' && school.eligibility.isCatchment) return false;
    if (activeTab === 'scaf') {
      const inScaf = scaf.pref1?.urn === school.urn ||
                     scaf.pref2?.urn === school.urn ||
                     scaf.pref3?.urn === school.urn ||
                     scaf.pref4?.urn === school.urn;
      if (!inScaf) return false;
    }

    if (archetypeFilter !== 'ALL' && school.archetype !== archetypeFilter) return false;
    if (statusFilter !== 'ALL' && school.eligibility.badge !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        school.name.toLowerCase().includes(q) ||
        school.town.toLowerCase().includes(q) ||
        school.district.toLowerCase().includes(q) ||
        school.shortName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortField === 'distance') {
      const distA = a.eligibility.distanceMiles ?? 999;
      const distB = b.eligibility.distanceMiles ?? 999;
      return sortAsc ? distA - distB : distB - distA;
    } else if (sortField === 'name') {
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (sortField === 'status') {
      return sortAsc ? a.eligibility.badge.localeCompare(b.eligibility.badge) : b.eligibility.badge.localeCompare(a.eligibility.badge);
    }
    return 0;
  });

  // Helper for badge pill colors
  const getBadgeStyle = (badge: string) => {
    if (badge.includes('SAFE')) {
      return 'bg-notion-green-bg text-notion-green-text border-notion-green-border';
    }
    if (badge.includes('REALISTIC')) {
      return 'bg-notion-blue-bg text-notion-blue-text border-notion-blue-border';
    }
    if (badge.includes('WAITLIST') || badge.includes('BORDERLINE')) {
      return 'bg-notion-amber-bg text-notion-amber-text border-notion-amber-border';
    }
    if (badge.includes('APPEAL')) {
      return 'bg-notion-amber-bg text-notion-amber-text border-notion-amber-border';
    }
    return 'bg-notion-red-bg text-notion-red-text border-notion-red-border';
  };

  const getArchetypeLabel = (arch: string) => {
    if (arch === 'A') return 'Super-Selective';
    if (arch === 'B') return 'Hybrid (Core + Gov)';
    if (arch === 'C') return 'Pure Distance';
    return 'Boarding / Day';
  };

  // Check if school is in SCAF
  const getScafSlot = (urn: number): number | null => {
    if (scaf.pref1?.urn === urn) return 1;
    if (scaf.pref2?.urn === urn) return 2;
    if (scaf.pref3?.urn === urn) return 3;
    if (scaf.pref4?.urn === urn) return 4;
    return null;
  };

  return (
    <div className="bg-white border border-notion-border rounded-lg overflow-hidden shadow-sm flex flex-col">
      {/* Table Navigation Tabs */}
      <div className="px-4 py-2 bg-[#F7F7F5] border-b border-notion-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-notion-text shadow-sm border border-notion-border'
                : 'text-notion-secondary hover:text-notion-text'
            }`}
          >
            All Eligible ({eligibleSchools.length})
          </button>
          <button
            onClick={() => setActiveTab('catchment')}
            className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
              activeTab === 'catchment'
                ? 'bg-white text-notion-text shadow-sm border border-notion-border'
                : 'text-notion-secondary hover:text-notion-text'
            }`}
          >
            In-Catchment ({eligibleSchools.filter(s => s.eligibility.isCatchment).length})
          </button>
          <button
            onClick={() => setActiveTab('outer')}
            className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
              activeTab === 'outer'
                ? 'bg-white text-notion-text shadow-sm border border-notion-border'
                : 'text-notion-secondary hover:text-notion-text'
            }`}
          >
            Super-Selective / Outer Pool
          </button>
          <button
            onClick={() => setActiveTab('scaf')}
            className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
              activeTab === 'scaf'
                ? 'bg-white text-notion-text shadow-sm border border-notion-border font-bold'
                : 'text-notion-secondary hover:text-notion-text'
            }`}
          >
            SCAF Builder List
          </button>
        </div>

        {/* Quick Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-notion-muted absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search schools, town, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-notion-border rounded bg-white text-notion-text focus:outline-none focus:border-notion-text w-48 sm:w-60"
            />
          </div>

          {/* Archetype Filter */}
          <select
            value={archetypeFilter}
            onChange={(e) => setArchetypeFilter(e.target.value)}
            className="text-xs border border-notion-border rounded bg-white px-2 py-1 text-notion-secondary focus:outline-none"
          >
            <option value="ALL">All Archetypes</option>
            <option value="A">Archetype A (Super-Selective)</option>
            <option value="B">Archetype B (Hybrid)</option>
            <option value="C">Archetype C (Pure Distance)</option>
            <option value="D">Archetype D (Cranbrook)</option>
          </select>
        </div>
      </div>

      {/* Database Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F7F7F5] border-b border-notion-border text-notion-secondary font-medium uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3.5">School Name</th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-notion-text"
                onClick={() => {
                  setSortField('distance');
                  setSortAsc(sortField === 'distance' ? !sortAsc : true);
                }}
              >
                <div className="flex items-center gap-1">
                  <span>Distance</span>
                  <ArrowUpDown className="w-3 h-3 text-notion-muted" />
                </div>
              </th>
              <th className="py-2.5 px-3">Catchment</th>
              <th className="py-2.5 px-3">2027 Projected Cut-Off</th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-notion-text"
                onClick={() => {
                  setSortField('status');
                  setSortAsc(sortField === 'status' ? !sortAsc : true);
                }}
              >
                <div className="flex items-center gap-1">
                  <span>Admissions Verdict</span>
                  <ArrowUpDown className="w-3 h-3 text-notion-muted" />
                </div>
              </th>
              <th className="py-2.5 px-3">Academic KS4/KS5</th>
              <th className="py-2.5 px-3 text-right">SCAF 4-Slot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-notion-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-notion-muted text-xs">
                  No schools found matching the current criteria.
                </td>
              </tr>
            ) : (
              filtered.map((school) => {
                const isSelected = selectedSchool?.urn === school.urn;
                const slot = getScafSlot(school.urn);
                const distMiles = school.eligibility.distanceMiles;

                return (
                  <tr
                    key={school.urn}
                    onClick={() => onSelectSchool(school)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#F1F1EF]'
                        : 'hover:bg-[#F1F1EF]/60'
                    }`}
                  >
                    {/* Name & Archetype */}
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-notion-text flex items-center gap-1.5">
                        <span>{school.name}</span>
                        {school.additionalCampuses && (
                          <span className="text-[10px] text-notion-secondary font-normal font-sans">
                            (Dual Campus)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-notion-secondary">
                        <span>{school.town}</span>
                        <span>•</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-white border border-notion-border">
                          {getArchetypeLabel(school.archetype)}
                        </span>
                      </div>
                    </td>

                    {/* Distance */}
                    <td className="py-2.5 px-3 font-mono tabular-nums text-notion-text">
                      {distMiles !== null ? (
                        <div className="font-medium text-xs">
                          {distMiles} <span className="text-[10px] text-notion-muted font-sans">mi</span>
                        </div>
                      ) : (
                        <span className="text-notion-muted">—</span>
                      )}
                    </td>

                    {/* Catchment Status */}
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        school.eligibility.isCatchment
                          ? 'bg-[#E7F3F8] text-[#1F6C9C] border border-[#C9E4F0]'
                          : 'bg-white text-notion-muted border border-notion-border'
                      }`}>
                        {school.eligibility.isCatchment ? 'In-Catchment' : 'Outer Area'}
                      </span>
                    </td>

                    {/* Projected Cut-Off */}
                    <td className="py-2.5 px-3 font-mono text-[11px] tabular-nums text-notion-text">
                      {school.eligibility.projectedCutoffSummary}
                    </td>

                    {/* Verdict Badge */}
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getBadgeStyle(school.eligibility.badge)}`}>
                        {school.eligibility.badge}
                      </span>
                    </td>

                    {/* Academic KS4/KS5 */}
                    <td className="py-2.5 px-3 text-[11px] text-notion-secondary">
                      <div className="font-medium text-notion-text">{school.academicMetrics.ofsted}</div>
                      <div className="text-[10px] text-notion-muted">
                        P8: <strong className="text-notion-text">{school.academicMetrics.progress8}</strong> • Att8: {school.academicMetrics.attainment8}
                      </div>
                    </td>

                    {/* SCAF Slot Action */}
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        {[1, 2, 3, 4].map((pNum) => {
                          const isAssigned = slot === pNum;
                          return (
                            <button
                              key={pNum}
                              type="button"
                              onClick={() => onUpdateScafPreference(pNum as any, isAssigned ? null : school)}
                              title={isAssigned ? `Assigned to Preference ${pNum}. Click to remove.` : `Set as SCAF Preference ${pNum}`}
                              className={`w-5 h-5 rounded text-[10px] font-mono font-bold transition-colors ${
                                isAssigned
                                  ? 'bg-[#37352F] text-white shadow-sm'
                                  : 'bg-[#F7F7F5] hover:bg-[#E9E9E7] text-notion-secondary border border-notion-border'
                              }`}
                            >
                              P{pNum}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-2 bg-[#F7F7F5] border-t border-notion-border flex items-center justify-between text-xs text-notion-secondary">
        <div>
          Showing <strong>{filtered.length}</strong> of <strong>{eligibleSchools.length}</strong> gender-compatible grammar schools
        </div>
        <div className="text-[11px] text-notion-muted flex items-center gap-1">
          <Info className="w-3 h-3" />
          Click any row to open full 10-year historical cut-offs & appeals drawer
        </div>
      </div>
    </div>
  );
}
