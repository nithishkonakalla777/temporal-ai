import React, { useState } from 'react';
import { ThermalEvent, IncidentCategory } from '../types';
import { X, Upload, Camera, Radio, CheckCircle2, AlertCircle } from 'lucide-react';

interface GroundVerificationModalProps {
  event: ThermalEvent;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    description: string;
    imageUrl?: string | null;
    latitude: number;
    longitude: number;
    reporterRole: string;
    observedCategory: IncidentCategory | 'other';
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const GroundVerificationModal: React.FC<GroundVerificationModalProps> = ({
  event,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [description, setDescription] = useState('Smoke visible near the field, farmer burning harvested paddy stubble.');
  const [reporterRole, setReporterRole] = useState('District Agriculture Field Officer');
  const [observedCategory, setObservedCategory] = useState<IncidentCategory | 'other'>('agricultural_burning');
  const [imagePreview, setImagePreview] = useState<string | null>('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80');
  const [lat, setLat] = useState(event.latitude);
  const [lon, setLon] = useState(event.longitude);

  if (!isOpen) return null;

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetScenario = (type: 'agri' | 'ind' | 'waste' | 'veg') => {
    if (type === 'agri') {
      setDescription('Smoke visible near agricultural field boundary. Crop stubble burning observed with localized fire front.');
      setObservedCategory('agricultural_burning');
      setReporterRole('Block Agriculture Inspector');
      setImagePreview('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80');
    } else if (type === 'ind') {
      setDescription('High chimney flame flare visible at refinery boundary fence. Chemical odor detected.');
      setObservedCategory('industrial_incident');
      setReporterRole('Industrial Safety Marshal');
      setImagePreview('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80');
    } else if (type === 'waste') {
      setDescription('Waste dump perimeter combustion. Dense white plastic and organic refuse smoke.');
      setObservedCategory('waste_burning');
      setReporterRole('Municipal Sanitary Officer');
      setImagePreview('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80');
    } else {
      setDescription('Wildfire understorey leaf combustion spreading up forest buffer ridge.');
      setObservedCategory('vegetation_fire');
      setReporterRole('Forest Range Guard');
      setImagePreview('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    await onSubmit({
      description,
      imageUrl: imagePreview,
      latitude: Number(lat),
      longitude: Number(lon),
      reporterRole,
      observedCategory,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-neutral-300 shadow-xl max-w-lg w-full overflow-hidden my-8">
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="text-base font-bold text-neutral-900">REQUEST GROUND VERIFICATION</h2>
              <p className="text-xs text-neutral-500 font-mono">
                Event {event.eventNumber} [{event.latitude.toFixed(4)}°, {event.longitude.toFixed(4)}°]
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Preset Buttons for Quick Demo Testing */}
          <div className="p-2.5 rounded bg-neutral-100 border border-neutral-200">
            <span className="font-semibold text-neutral-700 block mb-1.5 font-mono text-[11px]">
              QUICK DEMO SCENARIO PRESETS:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handlePresetScenario('agri')}
                className="px-2 py-1 rounded bg-white border border-neutral-300 hover:bg-amber-50 text-[11px] text-amber-900 font-medium"
              >
                🌾 Stubble Smoke
              </button>
              <button
                type="button"
                onClick={() => handlePresetScenario('ind')}
                className="px-2 py-1 rounded bg-white border border-neutral-300 hover:bg-rose-50 text-[11px] text-rose-900 font-medium"
              >
                🏭 Factory Flare
              </button>
              <button
                type="button"
                onClick={() => handlePresetScenario('waste')}
                className="px-2 py-1 rounded bg-white border border-neutral-300 hover:bg-orange-50 text-[11px] text-orange-900 font-medium"
              >
                🗑️ Landfill Dump
              </button>
              <button
                type="button"
                onClick={() => handlePresetScenario('veg')}
                className="px-2 py-1 rounded bg-white border border-neutral-300 hover:bg-emerald-50 text-[11px] text-emerald-900 font-medium"
              >
                🌳 Forest Edge
              </button>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Field Observation Description <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Smoke visible near the field, farmer burning harvested stubble..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-neutral-900 text-xs font-sans"
            />
            <span className="text-[11px] text-neutral-500">
              Provide factual visual observations without speculating on liability.
            </span>
          </div>

          {/* Reporter Role & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Reporter Role / Designation</label>
              <select
                value={reporterRole}
                onChange={(e) => setReporterRole(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-xs bg-white"
              >
                <option value="District Agriculture Field Officer">District Agriculture Field Officer</option>
                <option value="Forest Range Guard">Forest Range Guard</option>
                <option value="Industrial Safety Inspector">Industrial Safety Inspector</option>
                <option value="Municipal Pollution Marshal">Municipal Pollution Marshal</option>
                <option value="Community Observer">Community Observer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Observed Source Category</label>
              <select
                value={observedCategory}
                onChange={(e) => setObservedCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-xs bg-white font-medium"
              >
                <option value="agricultural_burning">🌾 Agricultural Burning</option>
                <option value="industrial_incident">🏭 Industrial Incident</option>
                <option value="vegetation_fire">🌳 Vegetation / Wildland Fire</option>
                <option value="waste_burning">🗑️ Waste / Open Burning</option>
                <option value="other">❓ Other / False Alarm</option>
              </select>
            </div>
          </div>

          {/* Coordinates & Timestamp */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={lon}
                onChange={(e) => setLon(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md text-xs font-mono"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block font-semibold text-neutral-800 mb-1">Ground Photograph (Optional)</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-neutral-800 file:text-white"
              />
            </div>

            {imagePreview && (
              <div className="mt-2 relative w-full h-32 rounded border border-neutral-300 overflow-hidden bg-neutral-100">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-neutral-900/80 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">
                  Field Photo Attached
                </span>
              </div>
            )}
          </div>

          {/* Submission Info */}
          <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px]">
              Upon submission, status updates to <strong>GROUND EVIDENCE RECEIVED</strong>. The evidence fusion engine will immediately reconcile satellite data with ground observations.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded bg-neutral-900 text-white font-medium hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5" />
              {isSubmitting ? 'Submitting...' : 'Submit Ground Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
