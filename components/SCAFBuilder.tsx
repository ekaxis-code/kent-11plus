'use client';

import React from 'react';
import { SCAFBlueprint, EvaluatedSchool } from '../types/admissions';
import { CheckCircle, AlertTriangle, Calendar, Award, ShieldAlert, ArrowRight, X } from 'lucide-react';

interface SCAFBuilderProps {
  scaf: SCAFBlueprint;
  onUpdatePreference: (prefIndex: 1 | 2 | 3 | 4, school: EvaluatedSchool | null) => void;
  onOpenSchoolDrawer: (school: EvaluatedSchool) => void;
}

export default function SCAFBuilder({
  scaf,
  onUpdatePreference,
  onOpenSchoolDrawer
}: SCAFBuilderProps) {
  const slots: Array<{
    num: 1 | 2 | 3 | 4;
    title: string;
    sub: string;
    school: EvaluatedSchool | null;
    recommendedTone: string;
  }> = [
    {
      num: 1,
      title: 'Preference 1 (Aspirational Reach)',
      sub: 'Your true highest-ambition target (Realistic Target or Waitlist Reach).',
      school: scaf.pref1,
      recommendedTone: 'target'
    },
    {
      num: 2,
      title: 'Preference 2 (Primary Target)',
      sub: 'Strong realistic target or safe offer grammar school.',
      school: scaf.pref2,
      recommendedTone: 'target'
    },
    {
      num: 3,
      title: 'Preference 3 (Safe In-Catchment Anchor)',
      sub: 'High certainty safe offer distance grammar school.',
      school: scaf.pref3,
      recommendedTone: 'safe'
    },
    {
      num: 4,
      title: 'Preference 4 (Ironclad Insurance)',
      sub: 'Rock-solid safe local grammar or excellent non-selective comprehensive.',
      school: scaf.pref4,
      recommendedTone: 'safe'
    }
  ];

  const hasSafeInsurance = scaf.pref3?.eligibility.badge === 'SAFE OFFER (MARCH)' || scaf.pref4?.eligibility.badge === 'SAFE OFFER (MARCH)';

  return (
    <div className="bg-white border border-notion-border rounded-lg p-5 shadow-sm mt-6">
      {/* Title & Explainer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-notion-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#F7F7F5] border border-notion-border flex items-center justify-center text-xs">
              📝
            </span>
            <h2 className="text-base font-bold text-notion-text">
              SCAF 4-Preference Optimizer & Equal Preference Playbook
            </h2>
          </div>
          <p className="text-xs text-notion-secondary mt-1 max-w-3xl">
            {scaf.commentary}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Submit by 2 Nov 2026 (11:59pm)
          </span>
        </div>
      </div>

      {/* 4 SCAF Slots Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 my-5">
        {slots.map((slot) => {
          const s = slot.school;

          return (
            <div
              key={slot.num}
              className={`rounded-lg border p-3.5 flex flex-col justify-between transition-all ${
                s ? 'bg-[#F7F7F5] border-notion-border shadow-sm' : 'bg-white border-dashed border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold font-mono text-notion-text">Slot {slot.num}</span>
                  {s && (
                    <button
                      onClick={() => onUpdatePreference(slot.num, null)}
                      className="text-notion-muted hover:text-notion-text p-0.5 rounded"
                      title="Clear slot"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-[11px] font-semibold text-notion-secondary uppercase tracking-wider mb-2">
                  {slot.title}
                </div>

                {s ? (
                  <div
                    onClick={() => onOpenSchoolDrawer(s)}
                    className="cursor-pointer group"
                  >
                    <div className="font-bold text-xs text-notion-text group-hover:underline">
                      {s.name}
                    </div>
                    <div className="text-[11px] text-notion-secondary mt-0.5">
                      {s.town} • {s.eligibility.distanceMiles !== null ? `${s.eligibility.distanceMiles} mi` : 'N/A'}
                    </div>

                    <div className="mt-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        s.eligibility.badge.includes('SAFE')
                          ? 'bg-notion-green-bg text-notion-green-text border-notion-green-border'
                          : s.eligibility.badge.includes('REALISTIC')
                          ? 'bg-notion-blue-bg text-notion-blue-text border-notion-blue-border'
                          : s.eligibility.badge.includes('APPEAL')
                          ? 'bg-notion-amber-bg text-notion-amber-text border-notion-amber-border'
                          : 'bg-notion-amber-bg text-notion-amber-text border-notion-amber-border'
                      }`}>
                        {s.eligibility.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-notion-secondary mt-2 line-clamp-2">
                      {s.eligibility.actionAdvice}
                    </p>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-notion-muted">
                    <span>Empty Preference Slot</span>
                    <p className="text-[10px] text-notion-secondary mt-1">{slot.sub}</p>
                    <p className="text-[10px] text-notion-muted mt-2">
                      Click `P{slot.num}` on any school row in the table above to assign.
                    </p>
                  </div>
                )}
              </div>

              {s && (
                <div className="mt-3 pt-2.5 border-t border-notion-border flex items-center justify-between text-[10px] text-notion-secondary">
                  <span>Ofsted: {s.academicMetrics.ofsted}</span>
                  <span className="font-mono">PAN: {s.pan2027}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Safety Warning if Insurance is missing */}
      {!hasSafeInsurance && (
        <div className="p-3 bg-notion-amber-bg border border-notion-amber-border rounded-lg text-xs text-notion-amber-text flex items-start gap-2 mb-5">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Missing Safe Anchor Warning:</strong> None of your 4 preferences is currently marked as `SAFE OFFER (MARCH)`. If you list 4 aspirational schools and miss all 4 cut-offs, KCC will allocate any undersubscribed school in the county (potentially far from home). Ensure Preference 3 or 4 is a high-certainty safe offer distance school.
          </div>
        </div>
      )}

      {/* Post-Offer Day Playbook Timeline ("Apply Later") */}
      <div className="pt-4 border-t border-notion-border">
        <div className="flex items-center gap-1.5 font-bold text-xs text-notion-text mb-3">
          <Calendar className="w-3.5 h-3.5 text-notion-secondary" />
          <span>Post-Offer Day Playbook ("Apply Later" — March to May 2027)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#F7F7F5] border border-notion-border p-3 rounded">
            <span className="text-[10px] font-mono font-bold text-notion-secondary uppercase">1 March 2027</span>
            <strong className="block text-xs text-notion-text mt-0.5">National Offer Day</strong>
            <p className="text-[11px] text-notion-secondary mt-1">
              KCC releases secondary school offer letters by email after 4pm. You receive the highest preference for which your child qualified.
            </p>
          </div>

          <div className="bg-[#F7F7F5] border border-notion-border p-3 rounded">
            <span className="text-[10px] font-mono font-bold text-notion-secondary uppercase">Mid-March 2027</span>
            <strong className="block text-xs text-notion-text mt-0.5">Waiting List Opt-In</strong>
            <p className="text-[11px] text-notion-secondary mt-1">
              Opt into the official KCC Waiting List for any school ranked higher on your original SCAF than the school you were offered.
            </p>
          </div>

          <div className="bg-[#F7F7F5] border border-notion-border p-3 rounded">
            <span className="text-[10px] font-mono font-bold text-notion-secondary uppercase">Late March 2027</span>
            <strong className="block text-xs text-notion-text mt-0.5">Independent Appeals Deadline</strong>
            <p className="text-[11px] text-notion-secondary mt-1">
              Statutory deadline to submit academic evidence (CAT4 scores, Year 6 mocks, extenuating circumstances) for independent review.
            </p>
          </div>

          <div className="bg-[#F7F7F5] border border-notion-border p-3 rounded">
            <span className="text-[10px] font-mono font-bold text-notion-secondary uppercase">Late April 2027</span>
            <strong className="block text-xs text-notion-text mt-0.5">KCC Re-allocation Round</strong>
            <p className="text-[11px] text-notion-secondary mt-1">
              Declined independent school seats reallocated. Historically drops score cut-offs by <strong>2 to 5 pts</strong> and widens distance radii by <strong>0.3 to 1.2 miles</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
