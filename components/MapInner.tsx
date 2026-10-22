'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { EvaluatedSchool, UserProfile } from '../types/admissions';

interface MapInnerProps {
  profile: UserProfile;
  schools: EvaluatedSchool[];
  selectedSchool: EvaluatedSchool | null;
  onSelectSchool: (school: EvaluatedSchool) => void;
}

// Custom icons using inline SVG
function createSchoolIcon(tone: string, isSelected: boolean) {
  let bgColor = '#787774';
  if (tone === 'safe') bgColor = '#2B593F';
  if (tone === 'target') bgColor = '#1F6C9C';
  if (tone === 'waitlist' || tone === 'appeal') bgColor = '#89632A';
  if (tone === 'danger') bgColor = '#9E3632';

  const size = isSelected ? 32 : 24;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
      <circle cx="12" cy="12" r="${isSelected ? 10 : 8}" fill="${bgColor}" stroke="#ffffff" stroke-width="${isSelected ? 3 : 2}"/>
      <circle cx="12" cy="12" r="${isSelected ? 4 : 3}" fill="#ffffff"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-map-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const homeIcon = L.divIcon({
  html: `
    <div style="position:relative; width:30px; height:30px; display:flex; items-center; justify-content:center;">
      <div style="position:absolute; width:28px; height:28px; border-radius:50%; background:#1F6C9C; opacity:0.3; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position:absolute; width:18px; height:18px; border-radius:50%; background:#37352F; border:2px solid #FFFFFF; box-shadow:0 2px 4px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#FFFFFF; font-size:10px;">🏠</div>
    </div>
  `,
  className: 'home-map-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Helper component to adjust bounds
function MapAutoBounds({ homeCoords, selectedSchool }: { homeCoords?: [number, number]; selectedSchool: EvaluatedSchool | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedSchool) {
      map.setView([selectedSchool.latitude, selectedSchool.longitude], 12, { animate: true });
    } else if (homeCoords) {
      map.setView(homeCoords, 10, { animate: true });
    }
  }, [homeCoords, selectedSchool, map]);

  return null;
}

export default function MapInner({
  profile,
  schools,
  selectedSchool,
  onSelectSchool
}: MapInnerProps) {
  const homeCoords: [number, number] | undefined = profile.postcodeData?.latitude && profile.postcodeData?.longitude
    ? [profile.postcodeData.latitude, profile.postcodeData.longitude]
    : [51.27, 0.52]; // Default center of Kent

  const eligibleSchools = schools.filter(s => s.eligibility.badge !== 'INELIGIBLE (GENDER)');

  return (
    <MapContainer
      center={homeCoords}
      zoom={10}
      scrollWheelZoom={true}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    >
      {/* CartoDB Positron Minimalist Monochrome Basemap */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />

      <MapAutoBounds homeCoords={homeCoords} selectedSchool={selectedSchool} />

      {/* Home Pin */}
      {profile.postcodeData?.latitude && profile.postcodeData?.longitude && (
        <Marker position={[profile.postcodeData.latitude, profile.postcodeData.longitude]} icon={homeIcon}>
          <Popup>
            <div className="font-sans">
              <strong className="block text-xs font-bold text-notion-text">Home Postcode</strong>
              <span className="text-[11px] text-notion-secondary font-mono">{profile.postcode.toUpperCase()}</span>
              <div className="text-[10px] text-notion-muted">{profile.postcodeData.district}</div>
            </div>
          </Popup>
        </Marker>
      )}

      {/* School Pins & Vectors */}
      {eligibleSchools.map((school) => {
        const isSelected = selectedSchool?.urn === school.urn;
        const icon = createSchoolIcon(school.eligibility.tone, isSelected);

        const distMiles = school.eligibility.distanceMiles;
        const radiusMeters = (school.projected2027Cutoff.marchDistanceMiles || school.projected2027Cutoff.marchDistanceInner || 6.0) * 1609.344;

        return (
          <React.Fragment key={school.urn}>
            {/* School Marker */}
            <Marker
              position={[school.latitude, school.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectSchool(school)
              }}
            >
              <Popup>
                <div className="font-sans p-1 max-w-[220px]">
                  <div className="text-[11px] font-bold text-notion-text leading-tight">{school.name}</div>
                  <div className="text-[10px] text-notion-secondary mt-0.5">{school.town} ({school.archetype === 'A' ? 'Super-Selective' : school.archetype === 'B' ? 'Hybrid' : school.archetype === 'C' ? 'Distance' : 'Boarding'})</div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className="font-mono">{distMiles !== null ? `${distMiles} mi` : ''}</span>
                    <span className="px-1.5 py-0.5 rounded font-semibold text-[9px] bg-notion-surface border border-notion-border">
                      {school.eligibility.badge}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectSchool(school)}
                    className="w-full mt-2 text-center text-[10px] font-medium py-1 rounded bg-[#F7F7F5] hover:bg-[#F1F1EF] border border-notion-border text-notion-text"
                  >
                    View School Intelligence ➔
                  </button>
                </div>
              </Popup>
            </Marker>

            {/* Straight-line Vector from Home to Selected School */}
            {isSelected && profile.postcodeData?.latitude && profile.postcodeData?.longitude && (
              <Polyline
                positions={[
                  [profile.postcodeData.latitude, profile.postcodeData.longitude],
                  [school.latitude, school.longitude]
                ]}
                pathOptions={{
                  color: school.eligibility.tone === 'safe' ? '#2B593F' : school.eligibility.tone === 'target' ? '#1F6C9C' : '#89632A',
                  weight: 2,
                  dashArray: '4, 4'
                }}
              />
            )}

            {/* Distance Cut-off Circle for Selected Distance School */}
            {isSelected && school.archetype !== 'A' && radiusMeters > 0 && (
              <Circle
                center={[school.latitude, school.longitude]}
                radius={radiusMeters}
                pathOptions={{
                  color: '#1F6C9C',
                  fillColor: '#E7F3F8',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '3, 6'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}
