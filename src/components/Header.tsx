import React from 'react';
import { Shield, Radio, Activity, Compass, AlertCircle, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentTab: 'monitoring' | 'events' | 'verify';
  onSelectTab: (tab: 'monitoring' | 'events' | 'verify') => void;
  isSimulationMode: boolean;
  onToggleSimulationMode: () => void;
  onOpenDemoGuide: () => void;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isSimulationMode,
  onToggleSimulationMode,
  onOpenDemoGuide,
  activeCount,
}) => {
  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-40">
      {/* Simulation Mode Banner when active */}
      {isSimulationMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="font-semibold uppercase tracking-wider">SIMULATION MODE — DEMONSTRATION DATA</span>
            <span className="text-amber-700 hidden sm:inline">| Non-operational test granules active</span>
          </div>
          <button
            onClick={onToggleSimulationMode}
            className="text-amber-800 hover:text-amber-950 underline font-medium text-xs ml-4"
          >
            Switch to Standard Data
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-neutral-900 flex items-center justify-center text-white font-mono font-bold text-lg shadow-sm">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-neutral-900 font-mono">THERMOSCOPE AI</span>
                  <span className="bg-neutral-100 text-neutral-700 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-neutral-300">
                    SIH PROTOTYPE
                  </span>
                </div>
                <p className="text-xs text-neutral-500 hidden md:block">
                  AI-Powered Thermal Anomaly Categorization & Ground Verification
                </p>
              </div>
            </div>
          </div>

          {/* Simple Navigation as required: Monitoring, Events, Verify */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('monitoring')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                currentTab === 'monitoring'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Monitoring
            </button>
            <button
              onClick={() => onSelectTab('events')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                currentTab === 'events'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Events
              <span
                className={`text-xs px-1.5 py-0.2 rounded-full font-mono ${
                  currentTab === 'events' ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {activeCount}
              </span>
            </button>
            <button
              onClick={() => onSelectTab('verify')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                currentTab === 'verify'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-500" />
              Verify
            </button>
          </nav>

          {/* System Control & 2-Minute Demo Flow Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDemoGuide}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-neutral-200 transition-colors shadow-xs"
              title="Interactive 2-minute SIH walkthrough"
            >
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">2-Min</span> Demo Guide
            </button>

            <button
              onClick={onToggleSimulationMode}
              className={`text-xs font-mono px-2.5 py-1.5 rounded border transition-colors hidden lg:flex items-center gap-1.5 ${
                isSimulationMode
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSimulationMode ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                }`}
              ></span>
              {isSimulationMode ? 'SIMULATION' : 'REAL DATA (FIRMS)'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
