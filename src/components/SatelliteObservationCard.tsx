import React, { useState } from 'react';
import { ThermalEvent } from '../types';
import { Satellite, Upload, Sparkles, AlertTriangle, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface SatelliteObservationCardProps {
  event: ThermalEvent;
  onAnalyzeImage: (imageBase64?: string) => Promise<void>;
  isAnalyzing: boolean;
}

export const SatelliteObservationCard: React.FC<SatelliteObservationCardProps> = ({
  event,
  onAnalyzeImage,
  isAnalyzing,
}) => {
  const [demoUploadOpen, setDemoUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetDemo = (url: string) => {
    setSelectedFile(url);
  };

  const handleTriggerAnalysis = async () => {
    if (selectedFile) {
      await onAnalyzeImage(selectedFile);
    } else {
      await onAnalyzeImage();
    }
    setDemoUploadOpen(false);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-neutral-100 text-neutral-800">
            <Satellite className="w-5 h-5 text-neutral-700" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Satellite Observation</h2>
            <p className="text-xs text-neutral-500">
              Sensor data stream & optical overpass verification
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-medium bg-neutral-100 text-neutral-800 px-2 py-1 rounded border border-neutral-200">
            {event.satelliteSource} • {event.instrument}
          </span>
        </div>
      </div>

      {/* Observation Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-2.5 rounded bg-neutral-50 border border-neutral-100">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-mono block">
            Brightness Temp
          </span>
          <span className="text-lg font-bold font-mono text-neutral-900">
            {event.thermalFeatures.brightnessK} K
          </span>
          <span className="text-[11px] text-neutral-500 block">
            {(event.thermalFeatures.brightnessK - 273.15).toFixed(1)} °C
          </span>
        </div>

        <div className="p-2.5 rounded bg-neutral-50 border border-neutral-100">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-mono block">
            Radiative Power (FRP)
          </span>
          <span className="text-lg font-bold font-mono text-amber-700">
            {event.thermalFeatures.frpMW} MW
          </span>
          <span className="text-[11px] text-neutral-500 block">Radiant Heat Rate</span>
        </div>

        <div className="p-2.5 rounded bg-neutral-50 border border-neutral-100">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-mono block">
            Detection Quality
          </span>
          <span className="text-base font-semibold font-mono text-neutral-800">
            {event.thermalFeatures.confidence}
          </span>
          <span className="text-[11px] text-neutral-500 block">
            Pass: {event.thermalFeatures.dayNight === 'D' ? 'Daytime (Solar)' : 'Nighttime'}
          </span>
        </div>

        <div className="p-2.5 rounded bg-neutral-50 border border-neutral-100">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-mono block">
            Persistence / Area
          </span>
          <span className="text-base font-semibold font-mono text-neutral-800">
            {event.thermalFeatures.persistenceHours} hrs
          </span>
          <span className="text-[11px] text-neutral-500 block">
            Pixel: {event.thermalFeatures.scan} × {event.thermalFeatures.track} km
          </span>
        </div>
      </div>

      {/* Associated Satellite Imagery Section */}
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-neutral-600" />
            <span className="text-sm font-semibold text-neutral-900">Associated Satellite Imagery</span>
          </div>

          <button
            onClick={() => setDemoUploadOpen(!demoUploadOpen)}
            className="text-xs font-medium text-neutral-700 hover:text-neutral-950 flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-300 hover:bg-neutral-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Demo Image
          </button>
        </div>

        {/* Demo Upload Form if toggled */}
        {demoUploadOpen && (
          <div className="mb-4 p-3.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 text-xs">
            <div className="flex items-start gap-2 mb-2 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Scientific Honesty Note:</strong> Uploaded images are strictly labeled as{' '}
                <span className="font-mono font-semibold bg-amber-200/80 px-1 py-0.5 rounded">DEMO SATELLITE IMAGE</span>.
                Standard web images are never represented as real orbital sensor captures.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-neutral-900 file:text-white hover:file:bg-neutral-800"
              />
              <div className="flex items-center gap-2 text-neutral-600">
                <span>Or load sample:</span>
                <button
                  type="button"
                  onClick={() => handlePresetDemo('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80')}
                  className="px-2 py-0.5 rounded bg-white border border-neutral-300 hover:bg-neutral-100 text-[11px]"
                >
                  Crop Field
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDemo('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80')}
                  className="px-2 py-0.5 rounded bg-white border border-neutral-300 hover:bg-neutral-100 text-[11px]"
                >
                  Industrial
                </button>
              </div>
            </div>

            {selectedFile && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-emerald-700 font-medium">Image selected for prototype test</span>
                <button
                  onClick={handleTriggerAnalysis}
                  disabled={isAnalyzing}
                  className="px-3 py-1 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAnalyzing ? 'Analyzing with AI...' : 'Run Multimodal Visual Analysis'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Display Satellite Image or Honest Fallback */}
        {event.satelliteImagery.available && event.satelliteImagery.imageUrl ? (
          <div className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-900">
            <img
              src={event.satelliteImagery.imageUrl}
              alt="Associated Observation"
              className="w-full h-48 sm:h-56 object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
            {/* Clear, honest label required by prompt */}
            <div className="absolute top-2 left-2 bg-neutral-950/85 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-1 rounded border border-neutral-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {event.satelliteImagery.isDemoImage ? 'DEMO SATELLITE IMAGE' : 'ORBITAL MULTI-SPECTRAL TILE'}
            </div>

            <div className="absolute bottom-2 right-2 bg-neutral-950/85 text-neutral-300 text-[10px] font-mono px-2 py-0.5 rounded">
              Sensor: {event.satelliteImagery.sensorName || 'Optical/SWIR'}
            </div>
          </div>
        ) : (
          /* Prominent, Honest Unavailable Banner */
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-neutral-200/70 text-neutral-600 mt-0.5">
                <Satellite className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Satellite imagery unavailable for this event
                </p>
                <p className="text-xs text-neutral-500 mt-0.5 max-w-xl">
                  Low-Earth-orbit optical satellites (e.g. Sentinel-2, Landsat) did not have a concurrent daytime overpass during this VIIRS thermal detection. The system proceeds with thermal radiometry, historical trends, and land-use context.
                </p>
              </div>
            </div>

            <button
              onClick={() => setDemoUploadOpen(true)}
              className="shrink-0 px-3 py-1.5 bg-white border border-neutral-300 text-neutral-800 rounded-md text-xs font-medium hover:bg-neutral-100 transition-colors shadow-xs"
            >
              Add Demo Satellite Tile
            </button>
          </div>
        )}

        {/* AI Visual Analysis Breakdown */}
        {event.imageAnalysis && event.imageAnalysis.isAnalyzed && (
          <div className="mt-4 p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-neutral-900">AI Visual Clue Extraction</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700">
                {event.imageAnalysis.modelUsed}
              </span>
            </div>

            <p className="text-xs text-neutral-600 italic mb-3">
              "{event.imageAnalysis.visualSummary}"
            </p>

            {/* Clues Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {event.imageAnalysis.detectedFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded border text-[11px] ${
                    feat.observed
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-white border-neutral-200 text-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {feat.observed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    )}
                    <span className="font-medium">{feat.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono truncate max-w-[130px]" title={feat.confidenceNote}>
                    {feat.confidenceNote}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 text-[11px] text-neutral-500 flex items-center gap-1.5 border-t border-neutral-200/80 pt-2">
              <AlertTriangle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>
                <strong>System Safety Rule:</strong> Visual observations are treated as circumstantial context. The AI never declares "confirmed fire" based purely on a single unverified visual feature.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
