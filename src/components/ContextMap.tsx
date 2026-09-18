import React, { useState } from 'react';
import { ThermalEvent } from '../types';
import { Layers, ZoomIn, ZoomOut, Compass, MapPin } from 'lucide-react';

interface ContextMapProps {
  event: ThermalEvent;
}

export const ContextMap: React.FC<ContextMapProps> = ({ event }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeLayers, setActiveLayers] = useState({
    thermal: true,
    buffers: true,
    infrastructure: true,
    groundEvidence: true,
    landUse: true,
  });

  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isAgri = event.categorization.primaryCategory === 'agricultural_burning';
  const isInd = event.categorization.primaryCategory === 'industrial_incident';
  const isVeg = event.categorization.primaryCategory === 'vegetation_fire';
  const isWaste = event.categorization.primaryCategory === 'waste_burning';

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-neutral-600" />
          <h3 className="text-sm font-semibold text-neutral-900">Geospatial Context Map</h3>
          <span className="text-xs font-mono text-neutral-500">
            [{event.latitude.toFixed(4)}°N, {event.longitude.toFixed(4)}°E]
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => toggleLayer('buffers')}
            className={`px-2 py-0.5 rounded border text-[11px] font-mono transition-colors ${
              activeLayers.buffers
                ? 'bg-neutral-800 text-white border-neutral-800'
                : 'bg-white text-neutral-600 border-neutral-300'
            }`}
          >
            Buffers
          </button>
          <button
            onClick={() => toggleLayer('infrastructure')}
            className={`px-2 py-0.5 rounded border text-[11px] font-mono transition-colors ${
              activeLayers.infrastructure
                ? 'bg-neutral-800 text-white border-neutral-800'
                : 'bg-white text-neutral-600 border-neutral-300'
            }`}
          >
            Assets
          </button>
          <div className="flex items-center gap-1 ml-2 border-l border-neutral-200 pl-2">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.2))}
              className="p-1 rounded hover:bg-neutral-200 text-neutral-600"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
              className="p-1 rounded hover:bg-neutral-200 text-neutral-600"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Geospatial Canvas */}
      <div className="relative w-full h-72 sm:h-80 bg-neutral-100 overflow-hidden select-none">
        <svg
          viewBox="0 0 600 320"
          className="w-full h-full"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
        >
          <defs>
            {/* Agricultural field grid pattern */}
            <pattern id="agriGrid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 40 0 L 40 30 L 0 30 Z" fill="#fcf9ee" stroke="#ebd9af" strokeWidth="0.8" />
              <path d="M 0 15 L 40 15" stroke="#ebd9af" strokeDasharray="2,2" strokeWidth="0.5" />
            </pattern>

            {/* Forest texture pattern */}
            <pattern id="forestPattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect width="30" height="30" fill="#f0f7f2" />
              <circle cx="10" cy="10" r="3" fill="#cfe6d5" opacity="0.6" />
              <circle cx="22" cy="20" r="4" fill="#beddc7" opacity="0.6" />
            </pattern>

            {/* Industrial zone pattern */}
            <pattern id="industrialPattern" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#f4f4f6" />
              <path d="M 0 24 L 24 0 M 12 24 L 24 12 M 0 12 L 12 0" stroke="#e0e0e5" strokeWidth="0.8" />
            </pattern>

            {/* Radar thermal glow pulse */}
            <radialGradient id="thermalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base Land Use Background */}
          {activeLayers.landUse && (
            <>
              {isAgri && <rect x="0" y="0" width="600" height="320" fill="url(#agriGrid)" />}
              {isVeg && <rect x="0" y="0" width="600" height="320" fill="url(#forestPattern)" />}
              {isInd && <rect x="0" y="0" width="600" height="320" fill="url(#industrialPattern)" />}
              {isWaste && (
                <rect x="0" y="0" width="600" height="320" fill="#f5f5f4" />
              )}
              {!isAgri && !isVeg && !isInd && !isWaste && (
                <rect x="0" y="0" width="600" height="320" fill="#fafafa" />
              )}
            </>
          )}

          {/* Cartographic Coordinate Graticule */}
          <line x1="150" y1="0" x2="150" y2="320" stroke="#e5e5e5" strokeWidth="0.8" strokeDasharray="3,3" />
          <line x1="300" y1="0" x2="300" y2="320" stroke="#e5e5e5" strokeWidth="0.8" strokeDasharray="3,3" />
          <line x1="450" y1="0" x2="450" y2="320" stroke="#e5e5e5" strokeWidth="0.8" strokeDasharray="3,3" />
          <line x1="0" y1="80" x2="600" y2="80" stroke="#e5e5e5" strokeWidth="0.8" strokeDasharray="3,3" />
          <line x1="0" y1="160" x2="600" y2="160" stroke="#e5e5e5" strokeWidth="0.8" strokeDasharray="3,3" />
          <line x1="0" y1="240" x2="600" y2="240" stroke="#e5e5e5" strokeWidth="0.8" strokeDasharray="3,3" />

          {/* Distance Proximity Buffers around Hotspot (Center at 300, 160) */}
          {activeLayers.buffers && (
            <g opacity="0.85">
              {/* 1km radius buffer */}
              <circle cx="300" cy="160" r="45" fill="none" stroke="#fca5a5" strokeWidth="1" strokeDasharray="4,2" />
              <text x="348" y="164" fill="#dc2626" fontSize="9" fontFamily="monospace">
                1 km buffer
              </text>

              {/* 5km radius buffer */}
              <circle cx="300" cy="160" r="110" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,3" />
              <text x="415" y="164" fill="#64748b" fontSize="9" fontFamily="monospace">
                5 km buffer
              </text>
            </g>
          )}

          {/* Agricultural Crop Parcels if in Agri context */}
          {isAgri && activeLayers.landUse && (
            <g opacity="0.6">
              <rect x="180" y="80" width="80" height="60" fill="none" stroke="#ca8a04" strokeWidth="1.2" />
              <text x="186" y="96" fill="#854d0e" fontSize="10" fontWeight="500">
                🌾 Plot #412 (Paddy)
              </text>
              <rect x="270" y="70" width="90" height="65" fill="#fef08a" fillOpacity="0.2" stroke="#ca8a04" strokeWidth="1.2" />
              <text x="276" y="86" fill="#854d0e" fontSize="10" fontWeight="500">
                🌾 Plot #413 (Harvested)
              </text>
              <rect x="220" y="145" width="110" height="85" fill="#fef08a" fillOpacity="0.25" stroke="#ca8a04" strokeWidth="1.2" />
              <text x="226" y="222" fill="#854d0e" fontSize="10" fontWeight="500">
                🌾 Target Parcel (Active Stubble)
              </text>
            </g>
          )}

          {/* Forest Reserve Boundary if in Veg context */}
          {isVeg && activeLayers.landUse && (
            <g opacity="0.7">
              <path
                d="M 120,40 Q 220,90 320,60 T 520,110 L 580,280 L 100,290 Z"
                fill="#86efac"
                fillOpacity="0.15"
                stroke="#16a34a"
                strokeWidth="1.5"
                strokeDasharray="6,3"
              />
              <text x="140" y="70" fill="#15803d" fontSize="11" fontWeight="600">
                🌳 Simlipal Reserve Zone (NDVI 0.64)
              </text>
            </g>
          )}

          {/* Industrial Assets if in Industrial context or nearby */}
          {activeLayers.infrastructure && event.contextualFactors.nearestIndustrialFacility && (
            <g>
              {/* Position industrial complex based on proximity */}
              {event.contextualFactors.industrialProximityKm <= 1.0 ? (
                // Very close: place around 335, 140
                <g transform="translate(340, 130)">
                  <rect x="0" y="0" width="55" height="40" fill="#334155" rx="3" />
                  <path d="M 15 0 L 15 -12 M 35 0 L 35 -16" stroke="#475569" strokeWidth="3" />
                  <text x="-10" y="55" fill="#1e293b" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                    🏭 {event.contextualFactors.nearestIndustrialFacility.slice(0, 24)}
                  </text>
                  <line x1="-35" y1="20" x2="-5" y2="20" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="3,2" />
                  <text x="-40" y="15" fill="#dc2626" fontSize="8" fontFamily="monospace">
                    {event.contextualFactors.industrialProximityKm} km
                  </text>
                </g>
              ) : (
                // Further away: place at periphery
                <g transform="translate(480, 70)">
                  <rect x="0" y="0" width="40" height="30" fill="#64748b" rx="2" />
                  <text x="-30" y="44" fill="#475569" fontSize="9" fontWeight="500">
                    🏭 {event.contextualFactors.nearestIndustrialFacility.slice(0, 20)}
                  </text>
                  <text x="-30" y="55" fill="#64748b" fontSize="8" fontFamily="monospace">
                    Distance: {event.contextualFactors.industrialProximityKm} km
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Ground Evidence Pins */}
          {activeLayers.groundEvidence &&
            event.groundEvidence.map((ge, idx) => (
              <g key={ge.id} transform="translate(325, 185)">
                <circle cx="0" cy="0" r="16" fill="#3b82f6" fillOpacity="0.2" />
                <circle cx="0" cy="0" r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                {/* Pin callout */}
                <rect x="10" y="-18" width="145" height="34" rx="4" fill="#ffffff" stroke="#93c5fd" strokeWidth="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))" />
                <text x="16" y="-5" fill="#1d4ed8" fontSize="9" fontWeight="600">
                  📷 Ground Evidence #{idx + 1}
                </text>
                <text x="16" y="8" fill="#475569" fontSize="8">
                  {ge.reporterRole}: {ge.description.slice(0, 22)}...
                </text>
              </g>
            ))}

          {/* Thermal Anomaly Point (Center at 300, 160) */}
          {activeLayers.thermal && (
            <g transform="translate(300, 160)">
              {/* Outer pulsing radiance field */}
              <circle cx="0" cy="0" r="28" fill="url(#thermalGlow)" className="animate-pulse" />
              {/* Mid radiance ring */}
              <circle cx="0" cy="0" r="12" fill="#f97316" fillOpacity="0.4" stroke="#ef4444" strokeWidth="1.5" />
              {/* Core Hotspot center */}
              <circle cx="0" cy="0" r="5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />

              {/* Hotspot Label & Sensor specs */}
              <rect x="-85" y="-48" width="170" height="38" rx="4" fill="#18181b" fillOpacity="0.95" />
              <text x="0" y="-33" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                🔴 HOTSPOT {event.eventNumber}
              </text>
              <text x="0" y="-20" fill="#fca5a5" fontSize="9" textAnchor="middle" fontFamily="monospace">
                FRP: {event.thermalFeatures.frpMW} MW | {event.thermalFeatures.brightnessK} K
              </text>
            </g>
          )}

          {/* Map Compass & Scale */}
          <g transform="translate(25, 25)">
            <circle cx="15" cy="15" r="14" fill="#ffffff" stroke="#d4d4d8" strokeWidth="1" />
            <path d="M 15 5 L 18 15 L 15 13 L 12 15 Z" fill="#ef4444" />
            <path d="M 15 25 L 18 15 L 15 17 L 12 15 Z" fill="#71717a" />
            <text x="15" y="4" fill="#18181b" fontSize="8" fontWeight="bold" textAnchor="middle">
              N
            </text>
          </g>

          <g transform="translate(25, 290)">
            <rect x="0" y="0" width="90" height="18" fill="#ffffff" fillOpacity="0.9" rx="2" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="10" y1="9" x2="80" y2="9" stroke="#18181b" strokeWidth="2" />
            <line x1="10" y1="5" x2="10" y2="13" stroke="#18181b" strokeWidth="1" />
            <line x1="80" y1="5" x2="80" y2="13" stroke="#18181b" strokeWidth="1" />
            <text x="45" y="16" fill="#18181b" fontSize="8" textAnchor="middle" fontFamily="monospace">
              2.0 km
            </text>
          </g>
        </svg>

        {/* Floating Context Legend */}
        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs border border-neutral-200 rounded p-2 text-[11px] shadow-xs flex flex-wrap gap-x-3 gap-y-1 text-neutral-700">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Thermal Anomaly
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span> 📷 Ground Truth
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-neutral-700 inline-block"></span> 🏭 Infrastructure
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded border border-amber-500 bg-amber-100 inline-block"></span> 🌾 Agriculture
          </span>
        </div>
      </div>
    </div>
  );
};
