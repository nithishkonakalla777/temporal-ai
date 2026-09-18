import React from 'react';
import { ThermalEvent } from '../types';
import { X, Printer, Shield, CheckCircle, Download } from 'lucide-react';

interface IncidentDossierModalProps {
  event: ThermalEvent;
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentDossierModal: React.FC<IncidentDossierModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-neutral-300 shadow-2xl max-w-3xl w-full my-8 overflow-hidden">
        {/* Modal Toolbar */}
        <div className="px-6 py-3.5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-neutral-800" />
            <span className="font-mono font-bold text-sm text-neutral-900">
              THERMOSCOPE AI • INCIDENT DOSSIER
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Document Sheet */}
        <div className="p-8 space-y-6 text-neutral-900 font-sans text-xs bg-white">
          {/* Header */}
          <div className="border-b-2 border-neutral-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 block">
                  SMART INDIA HACKATHON PROTOTYPE • RAPID INCIDENT ASSESSMENT
                </span>
                <h1 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 mt-1">
                  THERMAL ANOMALY DOSSIER: #{event.eventNumber}
                </h1>
                <p className="text-xs text-neutral-600 font-mono mt-0.5">
                  Generated at {new Date().toUTCString()}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 font-mono text-xs font-bold rounded bg-neutral-900 text-white">
                  STATUS: {event.status.toUpperCase()}
                </span>
                <p className="text-[11px] font-mono text-neutral-500 mt-1">
                  Priority: {event.categorization.priorityLevel} ({event.categorization.investigationPriority}/100)
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Identification & Location */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-neutral-50 rounded border border-neutral-200">
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">Target Region</span>
              <span className="font-semibold text-neutral-900">{event.region}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">Coordinates</span>
              <span className="font-mono text-neutral-900">{event.latitude.toFixed(4)}°N, {event.longitude.toFixed(4)}°E</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">Detection Time</span>
              <span className="font-mono text-neutral-900">{new Date(event.detectionTimestamp).toUTCString()}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">Sensor Platform</span>
              <span className="font-mono text-neutral-900">{event.satelliteSource} ({event.instrument})</span>
            </div>
          </div>

          {/* Section 2: Sensor Radiometry */}
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1 mb-2">
              1. SATELLITE RADIOMETRIC MEASUREMENTS
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2.5 rounded border border-neutral-200">
                <span className="text-[10px] text-neutral-500 font-mono block">BRIGHTNESS TEMP</span>
                <span className="text-base font-bold font-mono text-neutral-900">
                  {event.thermalFeatures.brightnessK} K ({(event.thermalFeatures.brightnessK - 273.15).toFixed(1)} °C)
                </span>
                <span className="text-[10px] text-neutral-500 block">Band: {event.thermalFeatures.sensorBand}</span>
              </div>
              <div className="p-2.5 rounded border border-neutral-200">
                <span className="text-[10px] text-neutral-500 font-mono block">FIRE RADIATIVE POWER</span>
                <span className="text-base font-bold font-mono text-amber-700">
                  {event.thermalFeatures.frpMW} MW
                </span>
                <span className="text-[10px] text-neutral-500 block">Radiant energy release rate</span>
              </div>
              <div className="p-2.5 rounded border border-neutral-200">
                <span className="text-[10px] text-neutral-500 font-mono block">PERSISTENCE / SAMPLING</span>
                <span className="text-base font-bold font-mono text-neutral-900">
                  ~{event.thermalFeatures.persistenceHours} hrs
                </span>
                <span className="text-[10px] text-neutral-500 block">Quality: {event.thermalFeatures.confidence}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Incident Categorization & Assessment */}
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1 mb-2">
              2. INCIDENT CATEGORIZATION & ASSESSMENT
            </h2>
            <div className="p-3.5 bg-neutral-50 rounded border border-neutral-200 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Primary Category</span>
                  <p className="text-base font-bold text-neutral-900">{event.categorization.categoryLabel}</p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-white border border-neutral-300">
                  {event.categorization.evidenceStatus}
                </span>
              </div>
              <p className="text-neutral-700">
                <strong>Preliminary Assessment:</strong> {event.categorization.assessment}
              </p>
            </div>
          </div>

          {/* Section 4: Why This Category? */}
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1 mb-2">
              3. CAUSAL EVIDENCE & FACTORS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded border border-emerald-200 bg-emerald-50/50">
                <span className="font-bold text-[11px] text-emerald-900 block mb-1.5 font-mono">
                  POSITIVE SUPPORTING FACTORS (+)
                </span>
                <ul className="space-y-1 text-[11px] text-emerald-900">
                  {event.categorization.supportingEvidence.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold">+</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded border border-neutral-200 bg-neutral-50">
                <span className="font-bold text-[11px] text-neutral-700 block mb-1.5 font-mono">
                  MISSING OR CONTRADICTING FACTORS (-)
                </span>
                <ul className="space-y-1 text-[11px] text-neutral-600">
                  {event.categorization.contradictingOrMissing.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold">-</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5: Alternative Possibilities */}
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1 mb-2">
              4. ALTERNATIVE EXPLANATION SPECTRUM
            </h2>
            <div className="border border-neutral-200 rounded divide-y divide-neutral-200">
              {event.categorization.alternativeExplanations.map((alt, idx) => (
                <div key={idx} className="p-2 flex justify-between items-center text-[11px]">
                  <span className="font-medium text-neutral-800">{alt.categoryLabel}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-500">{alt.rationale}</span>
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700">
                      {alt.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Ground Evidence & Cross-Verification */}
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1 mb-2">
              5. GROUND TRUTH VERIFICATION
            </h2>
            {event.groundEvidence.length > 0 ? (
              <div className="space-y-2">
                {event.groundEvidence.map((ge) => (
                  <div key={ge.id} className="p-3 rounded border border-neutral-200 bg-neutral-50 text-[11px]">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-neutral-900">{ge.reporterRole}</span>
                      <span className="font-mono text-neutral-500">
                        {new Date(ge.timestamp).toUTCString()}
                      </span>
                    </div>
                    <p className="text-neutral-700 italic">"{ge.description}"</p>
                    <div className="mt-1 font-mono text-[10px] text-neutral-500">
                      Coordinates: {ge.latitude.toFixed(4)}°N, {ge.longitude.toFixed(4)}°E | Observed: {ge.observedCategory}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-3 text-[11px] text-neutral-500 italic bg-neutral-50 rounded border border-neutral-200">
                Ground verification has not yet been submitted for this incident. Priority dispatch recommended.
              </p>
            )}
          </div>

          {/* Section 7: Recommended Action & Operational Signoff */}
          <div className="p-4 rounded-lg bg-neutral-900 text-white space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 block">
              OPERATIONAL DIRECTIVE & NEXT STEPS
            </span>
            <p className="text-sm font-semibold font-mono text-white">
              {event.evidenceFusion?.combinedAssessment || event.categorization.assessment}
            </p>
            <p className="text-xs text-neutral-300">
              {event.evidenceFusion?.recommendedAction || 'Continue thermal orbital surveillance and alert nearest local responders.'}
            </p>
            <div className="pt-2 border-t border-neutral-800 flex justify-between text-[10px] font-mono text-neutral-400">
              <span>THERMOSCOPE AI ENGINE v1.0.0</span>
              <span>VERIFICATION STAMP: VERIFIED FOR INCIDENT REVIEW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
