import React from 'react';
import { ThermalEvent } from '../types';
import { SatelliteObservationCard } from './SatelliteObservationCard';
import { CategorizationCard } from './CategorizationCard';
import { EvidenceFusionCard } from './EvidenceFusionCard';
import { ContextMap } from './ContextMap';
import { AdvancedAnalysisSection } from './AdvancedAnalysisSection';
import { EventTimeline } from './EventTimeline';
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  Radio,
  MapPin,
  Clock,
  Satellite,
  AlertTriangle,
} from 'lucide-react';

interface EventDetailViewProps {
  event: ThermalEvent;
  onBack: () => void;
  onAnalyzeImage: (imageBase64?: string) => Promise<void>;
  isAnalyzing: boolean;
  onOpenGroundVerification: () => void;
  onGenerateDossier: () => void;
  onReCategorize: () => Promise<void>;
  isReCategorizing: boolean;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  event,
  onBack,
  onAnalyzeImage,
  isAnalyzing,
  onOpenGroundVerification,
  onGenerateDossier,
  onReCategorize,
  isReCategorizing,
}) => {
  const getStatusBadge = () => {
    switch (event.status) {
      case 'VERIFICATION REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            VERIFICATION REQUIRED
          </span>
        );
      case 'GROUND EVIDENCE RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            GROUND EVIDENCE RECEIVED
          </span>
        );
      case 'CATEGORIZED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            CATEGORIZED
          </span>
        );
      case 'INVESTIGATION REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            INVESTIGATION REQUIRED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
            {event.status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Header Banner */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={onBack}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 mr-2 px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Events
              </button>
              <span className="text-xs font-mono text-neutral-400">/</span>
              <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                INCIDENT {event.eventNumber}
              </span>
              {event.isSimulation && (
                <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
                  SIMULATION GRANULE
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-900">
              THERMAL EVENT {event.eventNumber}
            </h1>
            <p className="text-xs text-neutral-600 mt-0.5 font-medium">
              {event.title} • {event.region}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 font-mono mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                {event.latitude.toFixed(4)}°N, {event.longitude.toFixed(4)}°E
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                Detected: {new Date(event.detectionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
              </span>
              <span className="flex items-center gap-1">
                <Satellite className="w-3.5 h-3.5 text-neutral-400" />
                {event.satelliteSource}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div>{getStatusBadge()}</div>

            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={onReCategorize}
                disabled={isReCategorizing}
                title="Re-run Multi-Factor Categorization Logic"
                className="px-2.5 py-1.5 rounded border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReCategorizing ? 'animate-spin' : ''}`} />
                <span>Re-Evaluate</span>
              </button>

              <button
                onClick={onOpenGroundVerification}
                className="px-3 py-1.5 rounded bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 flex items-center gap-1.5 shadow-xs"
              >
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                Verify
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Satellite Telemetry, Categorization, Fusion & ML (7 of 12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Satellite Observation Card */}
          <SatelliteObservationCard
            event={event}
            onAnalyzeImage={onAnalyzeImage}
            isAnalyzing={isAnalyzing}
          />

          {/* Categorization Card with Why This Category and Other Possibilities */}
          <CategorizationCard
            event={event}
            onOpenGroundVerification={onOpenGroundVerification}
            onGenerateDossier={onGenerateDossier}
          />

          {/* Evidence Fusion */}
          <EvidenceFusionCard
            event={event}
            onOpenGroundVerification={onOpenGroundVerification}
          />

          {/* Advanced ML Analysis (Collapsible) */}
          <AdvancedAnalysisSection event={event} />
        </div>

        {/* Right Column: Context Map & Timeline (5 of 12 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Geospatial Context Map */}
          <ContextMap event={event} />

          {/* Chronological Audit Timeline */}
          <EventTimeline timeline={event.timeline} />

          {/* Contextual Intelligence Summary Box */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-xs space-y-2.5">
            <span className="font-mono font-bold text-neutral-900 uppercase text-[11px] block">
              GEOGRAPHIC & HISTORICAL CONTEXT
            </span>
            <div className="space-y-1.5 text-neutral-700">
              <p>
                <strong>Land-use:</strong> {event.contextualFactors.landUseDescription}
              </p>
              <p>
                <strong>Vegetation / NDVI:</strong> {event.contextualFactors.vegetationContext}
              </p>
              <p>
                <strong>Agricultural phenology:</strong> {event.contextualFactors.agriculturalContext}
              </p>
              <p>
                <strong>Historical frequency:</strong> {event.contextualFactors.historicalPattern}
              </p>
              {event.contextualFactors.nearestIndustrialFacility && (
                <p>
                  <strong>Industrial proximity:</strong> {event.contextualFactors.nearestIndustrialFacility} ({event.contextualFactors.industrialProximityKm} km)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
