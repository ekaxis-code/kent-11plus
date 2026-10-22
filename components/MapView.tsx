'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { EvaluatedSchool, UserProfile } from '../types/admissions';
import { Map, Layers } from 'lucide-react';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] bg-[#F7F7F5] border border-notion-border rounded-lg flex flex-col items-center justify-center text-xs text-notion-muted">
      <Map className="w-6 h-6 mb-2 animate-pulse text-notion-secondary" />
      <span>Loading Minimalist GIS Map...</span>
    </div>
  )
});

interface MapViewProps {
  profile: UserProfile;
  schools: EvaluatedSchool[];
  selectedSchool: EvaluatedSchool | null;
  onSelectSchool: (school: EvaluatedSchool) => void;
}

export default function MapView({
  profile,
  schools,
  selectedSchool,
  onSelectSchool
}: MapViewProps) {
  return (
    <div className="w-full h-full flex flex-col bg-white border border-notion-border rounded-lg overflow-hidden shadow-sm">
      {/* Map Header */}
      <div className="px-3.5 py-2.5 bg-[#F7F7F5] border-b border-notion-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-notion-text">
          <Layers className="w-3.5 h-3.5 text-notion-secondary" />
          <span>GIS Admissions Map</span>
          <span className="text-[10px] text-notion-muted">OSGB36 Euclidean Vectors</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-notion-secondary">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2B593F]"></span> Safe
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#1F6C9C]"></span> Target
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#89632A]"></span> Waitlist/Appeal
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full min-h-[440px] relative">
        <MapInner
          profile={profile}
          schools={schools}
          selectedSchool={selectedSchool}
          onSelectSchool={onSelectSchool}
        />
      </div>
    </div>
  );
}
