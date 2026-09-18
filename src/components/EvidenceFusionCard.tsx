import React from 'react';
import { ThermalEvent } from '../types';
import { Layers, Satellite, Image, Radio, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface EvidenceFusionCardProps {
  event: ThermalEvent;
  onOpenGroundVerification: () => void;
}

export const EvidenceFusionCard: React.FC<EvidenceFusionCardProps> = ({
  event,
  onOpenGroundVerification,
}) => {
  const fusion = event.evidenceFusion;
  const hasGround = event.groundEvidence.length > 0;
  const hasImage = event.satelliteImagery.available;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-neutral-700" />
          <h2 className="text-base font-semibold text-neutral-900">EVIDENCE FUSION</h2>
        </div>
        <span className="text-xs font-mono text-neutral-500">
          Multi-Source Cross-Verification
        </span>
      </div>

      {/* 3 Evidence Streams Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {/* Stream 1: Satellite Evidence */}
        <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-1.5 mb-2 font-semibold text-xs text-neutral-900 font-mono">
            <Satellite className="w-4 h-4 text-neutral-700" />
            <span>1. SATELLITE EVIDENCE</span>
          </div>
          <ul className="text-xs space-y-1.5 text-neutral-700">
            <li>
              <strong>Anomaly:</strong> {event.thermalFeatures.brightnessK} K (Band {event.thermalFeatures.sensorBand})
            </li>
            <li>
              <strong>Intensity:</strong> {event.thermalFeatures.frpMW} MW Fire Radiative Power
            </li>
            <li>
              <strong>Persistence:</strong> ~{event.thermalFeatures.persistenceHours} hrs across orbits
            </li>
            <li>
              <strong>Location:</strong> {event.latitude.toFixed(4)}°N, {event.longitude.toFixed(4)}°E
            </li>
            <li>
              <strong>Source:</strong> {event.satelliteSource}
            </li>
            <li>
              <strong>Detection:</strong> {new Date(event.detectionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
            </li>
          </ul>
        </div>

        {/* Stream 2: Image Evidence */}
        <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-1.5 mb-2 font-semibold text-xs text-neutral-900 font-mono">
            <Image className="w-4 h-4 text-neutral-700" />
            <span>2. IMAGE EVIDENCE</span>
          </div>

          {hasImage && event.imageAnalysis.isAnalyzed ? (
            <ul className="text-xs space-y-1.5 text-neutral-700">
              <li>
                <strong>Status:</strong> {event.satelliteImagery.isDemoImage ? 'Demo Tile Available' : 'Orbital Overpass'}
              </li>
              <li>
                <strong>Land-use:</strong> {event.contextualFactors.landUseType}
              </li>
              <li>
                <strong>Visual indicators:</strong>{' '}
                {event.imageAnalysis.detectedFeatures
                  .filter((f) => f.observed)
                  .map((f) => f.name)
                  .join(', ') || 'No distinctive spectral features'}
              </li>
              <li>
                <strong>Summary:</strong> {event.imageAnalysis.visualSummary.slice(0, 90)}...
              </li>
            </ul>
          ) : (
            <div className="text-xs text-neutral-500 py-4 flex flex-col items-center justify-center text-center">
              <span className="font-medium text-neutral-700">Imagery Unavailable</span>
              <span className="text-[11px] mt-1">Satellite overpass did not coincide with detection time.</span>
            </div>
          )}
        </div>

        {/* Stream 3: Ground Evidence */}
        <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-neutral-900 font-mono">
              <Radio className="w-4 h-4 text-rose-600" />
              <span>3. GROUND EVIDENCE</span>
            </div>
            {hasGround && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.2 rounded font-medium">
                RECEIVED
              </span>
            )}
          </div>

          {hasGround ? (
            <div className="text-xs space-y-1.5 text-neutral-700">
              {event.groundEvidence.map((ge) => (
                <div key={ge.id} className="border-b border-neutral-200/60 pb-1.5 last:border-b-0">
                  <p>
                    <strong>Observation:</strong> "{ge.description}"
                  </p>
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                    By: {ge.reporterRole} • {new Date(ge.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {ge.imageUrl && (
                    <div className="mt-1 w-16 h-12 rounded overflow-hidden border border-neutral-300">
                      <img src={ge.imageUrl} alt="Ground" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-neutral-500 py-3 text-center flex flex-col items-center justify-center">
              <span className="text-neutral-700 font-medium">Ground verification pending</span>
              <p className="text-[11px] text-neutral-500 mt-1 mb-2">
                Field photos or local patrol notes not yet attached.
              </p>
              <button
                onClick={onOpenGroundVerification}
                className="px-2.5 py-1 bg-white border border-neutral-300 text-neutral-800 rounded text-xs font-medium hover:bg-neutral-100 transition-colors"
              >
                Submit Ground Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* COMBINED ASSESSMENT RESULT */}
      <div className="mt-4 p-4 rounded-lg bg-neutral-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
            Combined Assessment
          </span>
          <div className="text-base sm:text-lg font-bold font-mono text-amber-400 mt-0.5 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>{fusion?.combinedAssessment || `${event.categorization.categoryLabel} — ${event.categorization.evidenceStatus}`}</span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            <strong>Recommended Next Step:</strong> {fusion?.recommendedAction || 'Monitor next orbital overpass pass.'}
          </p>
        </div>

        <div className="text-right font-mono text-xs text-neutral-400 shrink-0">
          <div>Confidence: <span className="text-white font-semibold">{event.categorization.evidenceStatus}</span></div>
          <div>Fusion state: <span className="text-emerald-400 font-semibold">{hasGround ? 'Full Multi-Modal' : 'Remote Satellite Only'}</span></div>
        </div>
      </div>
    </div>
  );
};
