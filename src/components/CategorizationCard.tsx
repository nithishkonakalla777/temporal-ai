import React from 'react';
import { Categorization, ThermalEvent } from '../types';
import {
  HelpCircle,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  Radio,
  FileText,
  Flame,
  Factory,
  Trees,
  Trash2,
} from 'lucide-react';

interface CategorizationCardProps {
  event: ThermalEvent;
  onOpenGroundVerification: () => void;
  onGenerateDossier: () => void;
}

export const CategorizationCard: React.FC<CategorizationCardProps> = ({
  event,
  onOpenGroundVerification,
  onGenerateDossier,
}) => {
  const cat = event.categorization;

  const getCategoryTheme = () => {
    switch (cat.primaryCategory) {
      case 'agricultural_burning':
        return {
          border: 'border-amber-300',
          bg: 'bg-amber-50/60',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <Flame className="w-5 h-5 text-amber-600" />,
        };
      case 'industrial_incident':
        return {
          border: 'border-rose-300',
          bg: 'bg-rose-50/60',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: <Factory className="w-5 h-5 text-rose-600" />,
        };
      case 'vegetation_fire':
        return {
          border: 'border-emerald-300',
          bg: 'bg-emerald-50/60',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <Trees className="w-5 h-5 text-emerald-600" />,
        };
      case 'waste_burning':
        return {
          border: 'border-orange-300',
          bg: 'bg-orange-50/60',
          badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
          icon: <Trash2 className="w-5 h-5 text-orange-600" />,
        };
      default:
        return {
          border: 'border-neutral-300',
          bg: 'bg-neutral-50',
          badgeBg: 'bg-neutral-200 text-neutral-800 border-neutral-300',
          icon: <HelpCircle className="w-5 h-5 text-neutral-600" />,
        };
    }
  };

  const theme = getCategoryTheme();

  const getEvidenceStatusBadge = (status: Categorization['evidenceStatus']) => {
    if (status.includes('Insufficient')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    }
    if (status === 'Strong Evidence') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    }
    if (status === 'Moderate Evidence') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <CheckCircle className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-300">
        {status}
      </span>
    );
  };

  const getPriorityBadge = () => {
    if (cat.priorityLevel === 'HIGH') {
      return 'bg-rose-600 text-white';
    }
    if (cat.priorityLevel === 'MEDIUM') {
      return 'bg-amber-600 text-white';
    }
    return 'bg-neutral-700 text-white';
  };

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'Strong evidence':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Moderate evidence':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Possible':
        return 'text-sky-800 bg-sky-50 border-sky-200';
      case 'Low evidence':
        return 'text-neutral-600 bg-neutral-50 border-neutral-200';
      default:
        return 'text-neutral-500 bg-neutral-100 border-neutral-200';
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-6">
      {/* INCIDENT CATEGORIZATION HEADER */}
      <div className={`p-4 rounded-lg border ${theme.border} ${theme.bg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-600 block">
              Incident Categorization Result
            </span>
            <div className="flex items-center gap-2 mt-1">
              {theme.icon}
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                {cat.categoryLabel}
              </h1>
            </div>
            <p className="text-sm font-medium text-neutral-700 mt-1">
              Assessment: <span className="font-semibold text-neutral-900">{cat.assessment}</span>
            </p>
          </div>

          <div className="self-start sm:self-center">
            {getEvidenceStatusBadge(cat.evidenceStatus)}
          </div>
        </div>

        {cat.primaryCategory === 'unknown_insufficient' && (
          <div className="mt-3 p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>
              <strong>Crucial Safeguard:</strong> THERMOSCOPE AI does not guess or force a category when satellite resolution and contextual evidence are ambiguous. Ground verification is strongly advised before taking containment actions.
            </p>
          </div>
        )}
      </div>

      {/* WHY THIS CATEGORY? (Mandatory Key Feature from Section 9) */}
      <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide font-mono flex items-center gap-1.5">
            <span>WHY THIS CATEGORY?</span>
            <span className="text-neutral-400 font-normal">| Explainable Rationale</span>
          </h2>
          <span className="text-[11px] font-mono text-neutral-500">
            Multi-factor synthesis
          </span>
        </div>

        <div className="space-y-2">
          {/* Positive Supporting Factors */}
          {cat.supportingEvidence.map((item, idx) => (
            <div key={`supp-${idx}`} className="flex items-start gap-2 text-xs text-neutral-800">
              <span className="font-mono font-bold text-emerald-600 text-sm leading-none mt-0.5">+</span>
              <span className="leading-snug">{item}</span>
            </div>
          ))}

          {/* Missing or Contradicting Factors */}
          {cat.contradictingOrMissing.map((item, idx) => (
            <div key={`contra-${idx}`} className="flex items-start gap-2 text-xs text-neutral-500">
              <span className="font-mono font-bold text-neutral-400 text-sm leading-none mt-0.5">-</span>
              <span className="leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* OTHER POSSIBILITIES (Alternative Explanation Engine - Section 10) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide font-mono">
            OTHER POSSIBILITIES
          </h2>
          <span className="text-[11px] text-neutral-500">
            Qualitative evidence spectrum (No artificial percentages)
          </span>
        </div>

        <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-200 overflow-hidden text-xs">
          {cat.alternativeExplanations.map((alt, idx) => (
            <div
              key={idx}
              className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                alt.category === cat.primaryCategory ? 'bg-neutral-50 font-medium' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">{alt.categoryLabel}</span>
                {alt.category === cat.primaryCategory && (
                  <span className="text-[10px] bg-neutral-900 text-white px-1.5 py-0.2 rounded font-mono">
                    PRIMARY
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-neutral-500 text-[11px] hidden md:inline truncate max-w-xs">
                  {alt.rationale}
                </span>
                <span
                  className={`px-2 py-0.5 rounded border text-[11px] font-mono whitespace-nowrap ${getLevelStyle(
                    alt.level
                  )}`}
                >
                  {alt.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INVESTIGATION PRIORITY (Section 11) */}
      <div className="border border-neutral-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 font-mono">
            INVESTIGATION PRIORITY
          </span>
          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${getPriorityBadge()}`}>
            {cat.priorityLevel} PRIORITY
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight">
            {cat.investigationPriority}
          </span>
          <span className="text-sm font-mono text-neutral-500">/ 100</span>
        </div>

        {/* Priority Progress Track */}
        <div className="w-full bg-neutral-100 rounded-full h-2 my-2 overflow-hidden">
          <div
            className={`h-2 rounded-full ${
              cat.investigationPriority >= 75
                ? 'bg-rose-600'
                : cat.investigationPriority >= 45
                ? 'bg-amber-500'
                : 'bg-neutral-600'
            }`}
            style={{ width: `${cat.investigationPriority}%` }}
          ></div>
        </div>

        {/* Mandatory Explanation Requirement */}
        <p className="text-xs text-neutral-600 mt-2 bg-neutral-50 p-2.5 rounded border border-neutral-200">
          <strong className="text-neutral-800">Operational Note:</strong> {cat.priorityExplanation}
        </p>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onOpenGroundVerification}
          className="flex-1 px-4 py-2.5 rounded-md bg-neutral-900 text-white font-medium text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          <Radio className="w-4 h-4 text-rose-400" />
          Verify on Ground
        </button>

        <button
          onClick={onGenerateDossier}
          className="px-4 py-2.5 rounded-md bg-white border border-neutral-300 text-neutral-800 font-medium text-sm hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          <FileText className="w-4 h-4 text-neutral-600" />
          Generate Incident Dossier
        </button>
      </div>
    </div>
  );
};
