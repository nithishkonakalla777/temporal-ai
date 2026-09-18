import React, { useState } from 'react';
import { ThermalEvent } from '../types';
import { ChevronDown, ChevronUp, Cpu, BarChart2, Info, Layers } from 'lucide-react';

interface AdvancedAnalysisSectionProps {
  event: ThermalEvent;
}

export const AdvancedAnalysisSection: React.FC<AdvancedAnalysisSectionProps> = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ml = event.advancedML;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 bg-neutral-50 hover:bg-neutral-100/80 transition-colors flex items-center justify-between text-left border-b border-neutral-200/80"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-neutral-700" />
          <span className="text-sm font-bold text-neutral-900 font-mono tracking-wide">
            ADVANCED ANALYSIS ▾
          </span>
          <span className="text-xs text-neutral-500 hidden sm:inline">
            Technical ML & Isolation Forest evaluation metrics
          </span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600 text-xs font-mono">
          <span>{isOpen ? 'Collapse' : 'Expand Metrics'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && ml && (
        <div className="p-5 space-y-5 bg-white text-xs">
          {/* Note explaining inputs */}
          <div className="p-3 rounded bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-start gap-2">
            <Info className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
            <p>
              <strong>Evaluation Engine Note:</strong> Features are normalized across multi-orbit brightness history, regional land-use vector datasets, and spectral index gradients. The model produces continuous likelihood vectors rather than brittle binary classifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Isolation Forest Card */}
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/60">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                Anomaly Detection Model
              </span>
              <h3 className="text-sm font-bold text-neutral-900 mt-0.5">
                Isolation Forest Outlier Metric
              </h3>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-neutral-900">
                  {ml.isolationForestScore.toFixed(3)}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  [Score range: -1.0 to +1.0]
                </span>
              </div>

              <div className="mt-2 p-2 rounded bg-white border border-neutral-200 text-neutral-800">
                <span className="font-semibold block text-[11px] uppercase font-mono text-neutral-600">
                  Interpretation:
                </span>
                <p className="mt-0.5">{ml.isolationForestLabel}</p>
              </div>
            </div>

            {/* Random Forest Class Probabilities */}
            <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/60">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                Ensemble Classifier
              </span>
              <h3 className="text-sm font-bold text-neutral-900 mt-0.5">
                Random Forest Category Distribution
              </h3>

              <div className="mt-3 space-y-2">
                {ml.randomForestWeights.map((rf, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="font-medium text-neutral-800">{rf.label}</span>
                      <span className="font-mono text-neutral-600">{Math.round(rf.weight * 100)}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-neutral-800 h-1.5 rounded-full"
                        style={{ width: `${Math.round(rf.weight * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Importance Ranking */}
          <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-neutral-700" />
                <h3 className="text-sm font-bold text-neutral-900 font-mono uppercase">
                  Feature Importance Ranking
                </h3>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">Gini Impurity Metric</span>
            </div>

            <div className="space-y-2.5">
              {ml.featureImportance.map((feat, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="w-56 shrink-0 font-medium text-neutral-800">
                    <span className="font-mono text-neutral-400 mr-2">#{idx + 1}</span>
                    {feat.feature}
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 bg-neutral-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-600 h-2 rounded-full"
                        style={{ width: `${Math.round(feat.importance * 100)}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right font-mono text-[11px] text-neutral-700">
                      {(feat.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contextual & Thermal Features Tabular Readout */}
          <div className="border border-neutral-200 rounded-lg p-3 bg-white">
            <span className="text-[11px] font-mono font-semibold uppercase text-neutral-500 block mb-2">
              Raw Feature Extraction Vectors
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-neutral-50">
                <span className="text-neutral-500 block">NDVI Index</span>
                <span className="font-bold text-neutral-900">{event.contextualFactors.ndviValue}</span>
              </div>
              <div className="p-2 rounded bg-neutral-50">
                <span className="text-neutral-500 block">Industry Proximity</span>
                <span className="font-bold text-neutral-900">{event.contextualFactors.industrialProximityKm} km</span>
              </div>
              <div className="p-2 rounded bg-neutral-50">
                <span className="text-neutral-500 block">Settlement Dist</span>
                <span className="font-bold text-neutral-900">{event.contextualFactors.settlementProximityKm} km</span>
              </div>
              <div className="p-2 rounded bg-neutral-50">
                <span className="text-neutral-500 block">Spatial Cluster</span>
                <span className="font-bold text-neutral-900">{event.contextualFactors.clusterCount} hotspots</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
