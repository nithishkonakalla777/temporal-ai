import React from 'react';
import { ThermalEvent } from '../types';
import { Radio, AlertTriangle, CheckCircle2, ArrowRight, Camera, MapPin, Clock } from 'lucide-react';

interface VerifyViewProps {
  events: ThermalEvent[];
  onSelectEvent: (eventId: string) => void;
  onOpenGroundVerificationModal: (event: ThermalEvent) => void;
}

export const VerifyView: React.FC<VerifyViewProps> = ({
  events,
  onSelectEvent,
  onOpenGroundVerificationModal,
}) => {
  const pendingEvents = events.filter(
    (e) => e.status === 'VERIFICATION REQUIRED' || e.categorization.evidenceStatus.includes('Insufficient')
  );
  const verifiedEvents = events.filter((e) => e.groundEvidence.length > 0);

  return (
    <div className="space-y-6">
      {/* Verify Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              <Radio className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-mono text-neutral-900">
                FIELD VERIFICATION DISPATCH
              </h1>
              <p className="text-xs text-neutral-500">
                Ground-truth acquisition pipeline for ambiguous or high-priority thermal anomalies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-100 text-neutral-800 border border-neutral-300">
              {pendingEvents.length} Pending Actions
            </span>
          </div>
        </div>
      </div>

      {/* Pending Dispatch Section */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold font-mono text-neutral-900 uppercase">
              HIGH PRIORITY / UNRESOLVED HOTSPOTS REQUIRING GROUND TRUTH
            </h2>
          </div>
          <span className="text-xs text-neutral-500">
            Field rangers & block officers dispatched
          </span>
        </div>

        {pendingEvents.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            No pending anomalies requiring ground verification at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingEvents.map((evt) => (
              <div
                key={evt.id}
                className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50 hover:bg-neutral-50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-neutral-900">
                      🔴 {evt.eventNumber} • {evt.region}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      {evt.categorization.priorityLevel} PRIORITY ({evt.categorization.investigationPriority}/100)
                    </span>
                  </div>

                  <p className="text-xs font-medium text-neutral-800 mt-1">{evt.title}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Land use: {evt.contextualFactors.landUseType} • FRP: {evt.thermalFeatures.frpMW} MW
                  </p>

                  <div className="mt-2 p-2 bg-white border border-neutral-200 rounded text-[11px] text-neutral-700">
                    <strong>Reason for Ground Verification:</strong> {evt.categorization.assessment}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200">
                  <button
                    onClick={() => onSelectEvent(evt.id)}
                    className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
                  >
                    View Radiometry
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onOpenGroundVerificationModal(evt)}
                    className="px-3 py-1.5 rounded bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 flex items-center gap-1.5 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    Submit Ground Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Verified Hotspots */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold font-mono text-neutral-900 uppercase">
              CONFIRMED GROUND OBSERVATIONS ({verifiedEvents.length})
            </h2>
          </div>
          <span className="text-xs text-neutral-500">
            Reconciled with satellite radiometry
          </span>
        </div>

        <div className="divide-y divide-neutral-200">
          {verifiedEvents.map((evt) => (
            <div key={evt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-neutral-900">{evt.eventNumber}</span>
                  <span className="text-neutral-600">• {evt.region}</span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                    {evt.categorization.evidenceStatus}
                  </span>
                </div>
                <div className="text-neutral-500 text-[11px] mt-0.5">
                  Reported: "{evt.groundEvidence[0]?.description}" by {evt.groundEvidence[0]?.reporterRole}
                </div>
              </div>

              <button
                onClick={() => onSelectEvent(evt.id)}
                className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-medium text-xs flex items-center gap-1 self-start sm:self-center"
              >
                Inspect Fusion
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
