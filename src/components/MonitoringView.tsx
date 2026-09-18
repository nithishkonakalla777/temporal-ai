import React, { useState } from 'react';
import { ThermalEvent, MonitoringStats, IncidentCategory } from '../types';
import {
  Activity,
  AlertCircle,
  Radio,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  Flame,
  Factory,
  Trees,
  Trash2,
  HelpCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface MonitoringViewProps {
  events: ThermalEvent[];
  stats: MonitoringStats | null;
  onSelectEvent: (eventId: string) => void;
  onGenerateSimulatedEvent: (scenario: 'agricultural' | 'industrial' | 'wildland' | 'waste' | 'ambiguous') => Promise<void>;
  onResetData: () => Promise<void>;
  isGenerating: boolean;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  events,
  stats,
  onSelectEvent,
  onGenerateSimulatedEvent,
  onResetData,
  isGenerating,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((e) => {
    if (selectedFilter !== 'all' && e.categorization.primaryCategory !== selectedFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.eventNumber.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.categorization.categoryLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryIcon = (cat: IncidentCategory) => {
    switch (cat) {
      case 'agricultural_burning':
        return <Flame className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'industrial_incident':
        return <Factory className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'vegetation_fire':
        return <Trees className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'waste_burning':
        return <Trash2 className="w-4 h-4 text-orange-600 shrink-0" />;
      default:
        return <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0" />;
    }
  };

  const getStatusBadge = (status: ThermalEvent['status']) => {
    switch (status) {
      case 'VERIFICATION REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            VERIFY REQUIRED
          </span>
        );
      case 'GROUND EVIDENCE RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            GROUND RECEIVED
          </span>
        );
      case 'CATEGORIZED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            CATEGORIZED
          </span>
        );
      case 'INVESTIGATION REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            HIGH PRIORITY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-neutral-100 text-neutral-700 border border-neutral-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 3 Compact KPI stats required by Section 13 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Active Events */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-neutral-500">
              Active Events
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-neutral-900">
                {stats?.activeEventsCount ?? events.length}
              </span>
              <span className="text-xs text-neutral-500 font-mono">hotspots</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              FIRMS & Sentinel radiometric overpasses
            </p>
          </div>
          <div className="p-3 bg-neutral-100 rounded-lg text-neutral-800">
            <Activity className="w-5 h-5 text-neutral-700" />
          </div>
        </div>

        {/* KPI 2: Verification Required */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-neutral-500">
              Verification Required
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-rose-600">
                {stats?.verificationRequiredCount ?? events.filter((e) => e.status === 'VERIFICATION REQUIRED').length}
              </span>
              <span className="text-xs text-rose-700 font-mono">unresolved</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Low optical data or anomalous signatures
            </p>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-rose-700">
            <Radio className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        {/* KPI 3: System Status */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-neutral-500">
              System Status
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xl font-bold font-mono text-neutral-900 tracking-tight">
                {stats?.systemStatus ?? 'OPERATIONAL'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              SIH Categorization Engine v1.0.0 Active
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-700">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Simulation Scenario Controls */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-neutral-800 uppercase tracking-wide">
            RAPID SIMULATION INJECTOR:
          </span>
          <span className="text-neutral-500 hidden md:inline">
            Generate synthetic FIRMS-format granules to test categorization:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onGenerateSimulatedEvent('agricultural')}
            disabled={isGenerating}
            className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded font-medium hover:bg-amber-50 disabled:opacity-50"
          >
            + 🌾 Stubble Burning
          </button>
          <button
            onClick={() => onGenerateSimulatedEvent('industrial')}
            disabled={isGenerating}
            className="px-2.5 py-1 bg-white border border-rose-300 text-rose-900 rounded font-medium hover:bg-rose-50 disabled:opacity-50"
          >
            + 🏭 Smelting / Flare
          </button>
          <button
            onClick={() => onGenerateSimulatedEvent('ambiguous')}
            disabled={isGenerating}
            className="px-2.5 py-1 bg-white border border-neutral-300 text-neutral-800 rounded font-medium hover:bg-neutral-100 disabled:opacity-50"
          >
            + ❓ Ambiguous Hotspot
          </button>
          <button
            onClick={onResetData}
            title="Reset to default seed data"
            className="p-1 rounded text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-neutral-900 text-white font-medium'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setSelectedFilter('agricultural_burning')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                selectedFilter === 'agricultural_burning'
                  ? 'bg-amber-900 text-white font-medium'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              🌾 Agricultural
            </button>
            <button
              onClick={() => setSelectedFilter('industrial_incident')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                selectedFilter === 'industrial_incident'
                  ? 'bg-rose-900 text-white font-medium'
                  : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              🏭 Industrial
            </button>
            <button
              onClick={() => setSelectedFilter('vegetation_fire')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                selectedFilter === 'vegetation_fire'
                  ? 'bg-emerald-900 text-white font-medium'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              🌳 Forest/Wildland
            </button>
            <button
              onClick={() => setSelectedFilter('waste_burning')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                selectedFilter === 'waste_burning'
                  ? 'bg-orange-900 text-white font-medium'
                  : 'bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              🗑️ Waste Burning
            </button>
            <button
              onClick={() => setSelectedFilter('unknown_insufficient')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                selectedFilter === 'unknown_insufficient'
                  ? 'bg-neutral-900 text-white font-medium'
                  : 'bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-neutral-200'
              }`}
            >
              ❓ Ambiguous / Insufficient
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search ID, region, land-use..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-neutral-900"
            />
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto border border-neutral-200 rounded-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-mono uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Location & Sensor</th>
                <th className="py-2.5 px-3">Primary Category</th>
                <th className="py-2.5 px-3">Thermal Signal</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-500 italic">
                    No thermal anomaly events match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => onSelectEvent(evt.id)}
                    className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        {evt.eventNumber}
                      </div>
                      {evt.isSimulation && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-mono block mt-0.5">
                          SIMULATED
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-neutral-900">{evt.region}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {evt.satelliteSource} • {new Date(evt.detectionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-neutral-900">
                        {getCategoryIcon(evt.categorization.primaryCategory)}
                        <span>{evt.categorization.categoryLabel}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {evt.categorization.evidenceStatus}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-neutral-900">{evt.thermalFeatures.frpMW} MW</span>
                      <span className="text-neutral-500 block text-[11px]">
                        {evt.thermalFeatures.brightnessK} K
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(evt.status)}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          evt.categorization.priorityLevel === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : evt.categorization.priorityLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {evt.categorization.investigationPriority}/100
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt.id);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded transition-colors"
                      >
                        Investigate
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
