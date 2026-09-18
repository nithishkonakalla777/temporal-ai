import React from 'react';
import { Compass, CheckCircle2, ChevronRight, X, ArrowRight, Play, ExternalLink } from 'lucide-react';

interface DemoScenarioGuideProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  onSetStep: (step: number) => void;
  onSelectEvent: (eventId: string) => void;
  onOpenGroundModal: () => void;
  onOpenDossier: () => void;
}

export const DemoScenarioGuide: React.FC<DemoScenarioGuideProps> = ({
  isOpen,
  onClose,
  currentStep,
  onSetStep,
  onSelectEvent,
  onOpenGroundModal,
  onOpenDossier,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Step 1: Satellite Thermal Detection',
      desc: 'Point out: "These are thermal hotspots detected by satellite sensors (VIIRS/MODIS radiometry), not yet confirmed fires."',
      actionLabel: 'Select Agricultural Hotspot',
      action: () => onSelectEvent('th-1023'),
    },
    {
      step: 2,
      title: 'Step 2: Inspect Raw Radiometry',
      desc: 'Review brightness temperature (336 K), FRP (24.8 MW), confidence, satellite overpass timing, and why on-demand optical photo may not exist.',
      actionLabel: 'View Radiometry',
      action: () => onSelectEvent('th-1023'),
    },
    {
      step: 3,
      title: 'Step 3: Multi-Context Categorization',
      desc: 'System assesses: "Agricultural Burning — Moderate Evidence". Emphasize: It did NOT just say "fire"—it synthesized land-use, season, and thermal signature.',
      actionLabel: 'Inspect Assessment',
      action: () => onSelectEvent('th-1023'),
    },
    {
      step: 4,
      title: 'Step 4: Explainable "Why This Category?"',
      desc: 'Inspect positive supporting factors (+) like post-harvest season and missing factors (-) like lack of flare stack structures.',
      actionLabel: 'Check Supporting Factors',
      action: () => onSelectEvent('th-1023'),
    },
    {
      step: 5,
      title: 'Step 5: Other Possibilities Engine',
      desc: 'Review the alternative explanation spectrum: Industrial Incident, Wildland Fire, and Waste Burning evaluated with qualitative evidence levels.',
      actionLabel: 'View Alternatives',
      action: () => onSelectEvent('th-1023'),
    },
    {
      step: 6,
      title: 'Step 6: Trigger Ground Verification',
      desc: 'Launch field reporting: upload observer photo or select field report ("Farmer burning stubble in field").',
      actionLabel: 'Open Ground Verification Form',
      action: () => {
        onSelectEvent('th-1023');
        onOpenGroundModal();
      },
    },
    {
      step: 7,
      title: 'Step 7: Watch Evidence Fusion Update',
      desc: 'Evidence Fusion reconciles Satellite Radiometry + Visual Clues + Ground Truth into a combined, high-confidence verdict.',
      actionLabel: 'Review Evidence Fusion',
      action: () => onSelectEvent('th-1023'),
    },
    {
      step: 8,
      title: 'Step 8: Generate Incident Dossier',
      desc: 'One-click printable/exportable Incident Dossier with complete audit trail and operational recommendations.',
      actionLabel: 'Open Dossier Modal',
      action: () => onOpenDossier(),
    },
    {
      step: 9,
      title: 'Step 9: Contrast with Ambiguous Anomaly',
      desc: 'Inspect TH-1027 (Kutch Scrubland). System outputs "Unknown / Insufficient Evidence" instead of guessing. Highlight this as an engineering strength!',
      actionLabel: 'Select Ambiguous Incident (TH-1027)',
      action: () => onSelectEvent('th-1027'),
    },
  ];

  const current = steps[currentStep - 1] || steps[0];

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-md w-full bg-white border border-neutral-300 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className="px-4 py-2.5 bg-neutral-900 text-white flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="font-bold">SIH 2-MINUTE EVALUATION WALKTHROUGH</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 font-normal">
            Step {currentStep}/9
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 text-xs space-y-3">
        <div>
          <h3 className="font-bold text-sm text-neutral-900">{current.title}</h3>
          <p className="text-neutral-600 mt-1 leading-relaxed">{current.desc}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
          <button
            onClick={current.action}
            className="px-3 py-1.5 rounded bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-neutral-950" />
            {current.actionLabel}
          </button>

          <div className="flex items-center gap-1">
            <button
              disabled={currentStep <= 1}
              onClick={() => onSetStep(Math.max(1, currentStep - 1))}
              className="px-2 py-1 rounded border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={currentStep >= steps.length}
              onClick={() => onSetStep(Math.min(steps.length, currentStep + 1))}
              className="px-2.5 py-1 rounded bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40 flex items-center gap-1 font-medium"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
