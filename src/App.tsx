import React, { useState, useEffect } from 'react';
import { ThermalEvent, MonitoringStats, IncidentCategory } from './types';
import { Header } from './components/Header';
import { MonitoringView } from './components/MonitoringView';
import { EventDetailView } from './components/EventDetailView';
import { VerifyView } from './components/VerifyView';
import { GroundVerificationModal } from './components/GroundVerificationModal';
import { IncidentDossierModal } from './components/IncidentDossierModal';
import { DemoScenarioGuide } from './components/DemoScenarioGuide';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'monitoring' | 'events' | 'verify'>('monitoring');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<ThermalEvent[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Guide States
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [groundModalOpen, setGroundModalOpen] = useState(false);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [demoGuideOpen, setDemoGuideOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(1);

  // Action Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmittingGround, setIsSubmittingGround] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReCategorizing, setIsReCategorizing] = useState(false);

  // Fetch Events & Stats
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [eventsRes, statsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/stats'),
      ]);

      if (!eventsRes.ok || !statsRes.ok) {
        throw new Error('Failed to load thermal monitoring data');
      }

      const eventsData = await eventsRes.json();
      const statsData = await statsRes.json();

      setEvents(eventsData);
      setStats(statsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to THERMOSCOPE AI server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  // Navigation handlers
  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    setCurrentTab('events');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToEvents = () => {
    setSelectedEventId(null);
    setCurrentTab('monitoring');
  };

  // Trigger Visual AI Analysis
  const handleAnalyzeImage = async (imageBase64?: string) => {
    if (!selectedEvent) return;
    try {
      setIsAnalyzing(true);
      const res = await fetch(`/api/events/${selectedEvent.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze satellite imagery');
      }

      const updated = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err: any) {
      alert(`AI Analysis Note: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Ground Evidence
  const handleSubmitGroundEvidence = async (data: {
    description: string;
    imageUrl?: string | null;
    latitude: number;
    longitude: number;
    reporterRole: string;
    observedCategory: IncidentCategory | 'other';
  }) => {
    if (!selectedEvent) return;
    try {
      setIsSubmittingGround(true);
      const res = await fetch(`/api/events/${selectedEvent.id}/ground-evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to record ground evidence');
      }

      const updated = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setGroundModalOpen(false);

      // Advance demo guide if in demo step 6
      if (demoStep === 6) {
        setDemoStep(7);
      }
    } catch (err: any) {
      alert(`Ground Submission Error: ${err.message}`);
    } finally {
      setIsSubmittingGround(false);
    }
  };

  // Re-run Categorization Engine
  const handleReCategorize = async () => {
    if (!selectedEvent) return;
    try {
      setIsReCategorizing(true);
      const res = await fetch(`/api/events/${selectedEvent.id}/categorize`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to re-run categorization engine');
      const updated = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err: any) {
      alert(`Engine Error: ${err.message}`);
    } finally {
      setIsReCategorizing(false);
    }
  };

  // Generate Simulated Scenario Granule
  const handleGenerateSimulation = async (scenario: 'agricultural' | 'industrial' | 'wildland' | 'waste' | 'ambiguous') => {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/simulation/generate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioType: scenario }),
      });
      if (!res.ok) throw new Error('Simulation failed');
      const newEvent = await res.json();
      setEvents((prev) => [newEvent, ...prev]);
      handleSelectEvent(newEvent.id);
    } catch (err: any) {
      alert(`Simulation Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset to default seed
  const handleResetData = async () => {
    if (confirm('Reset prototype data to original demo seed?')) {
      try {
        await fetch('/api/simulation/reset', { method: 'POST' });
        await fetchData();
        setSelectedEventId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col font-sans antialiased selection:bg-neutral-900 selection:text-white">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'monitoring') setSelectedEventId(null);
        }}
        isSimulationMode={isSimulationMode}
        onToggleSimulationMode={() => setIsSimulationMode(!isSimulationMode)}
        onOpenDemoGuide={() => setDemoGuideOpen(true)}
        activeCount={events.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="px-2.5 py-1 bg-white border border-rose-300 rounded font-medium text-rose-900 hover:bg-rose-100"
            >
              Retry Connection
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-6 h-6 text-neutral-600 animate-spin mb-3" />
            <p className="text-sm font-mono font-medium text-neutral-800">
              CONNECTING TO THERMOSCOPE AI ORBITAL SENSORS...
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Loading NASA FIRMS radiometric feeds & context layers
            </p>
          </div>
        ) : (
          <>
            {/* View Switching */}
            {currentTab === 'monitoring' && (
              <MonitoringView
                events={events}
                stats={stats}
                onSelectEvent={handleSelectEvent}
                onGenerateSimulatedEvent={handleGenerateSimulation}
                onResetData={handleResetData}
                isGenerating={isGenerating}
              />
            )}

            {currentTab === 'events' && (
              <>
                {selectedEvent ? (
                  <EventDetailView
                    event={selectedEvent}
                    onBack={handleBackToEvents}
                    onAnalyzeImage={handleAnalyzeImage}
                    isAnalyzing={isAnalyzing}
                    onOpenGroundVerification={() => setGroundModalOpen(true)}
                    onGenerateDossier={() => setDossierModalOpen(true)}
                    onReCategorize={handleReCategorize}
                    isReCategorizing={isReCategorizing}
                  />
                ) : (
                  <MonitoringView
                    events={events}
                    stats={stats}
                    onSelectEvent={handleSelectEvent}
                    onGenerateSimulatedEvent={handleGenerateSimulation}
                    onResetData={handleResetData}
                    isGenerating={isGenerating}
                  />
                )}
              </>
            )}

            {currentTab === 'verify' && (
              <VerifyView
                events={events}
                onSelectEvent={handleSelectEvent}
                onOpenGroundVerificationModal={(evt) => {
                  setSelectedEventId(evt.id);
                  setGroundModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-neutral-800">THERMOSCOPE AI</span>
            <span>• SIH Prototype</span>
            <span className="text-neutral-400">|</span>
            <span>Categorization & Ground Verification Engine</span>
          </div>
          <div className="font-mono text-[11px]">
            Sensor Feeds: VIIRS 375m / MODIS 1km / Multi-Spectral Optical Context
          </div>
        </div>
      </footer>

      {/* Ground Verification Modal */}
      {selectedEvent && (
        <GroundVerificationModal
          event={selectedEvent}
          isOpen={groundModalOpen}
          onClose={() => setGroundModalOpen(false)}
          onSubmit={handleSubmitGroundEvidence}
          isSubmitting={isSubmittingGround}
        />
      )}

      {/* Incident Dossier Modal */}
      {selectedEvent && (
        <IncidentDossierModal
          event={selectedEvent}
          isOpen={dossierModalOpen}
          onClose={() => setDossierModalOpen(false)}
        />
      )}

      {/* 2-Minute SIH Evaluator Guided Walkthrough */}
      <DemoScenarioGuide
        isOpen={demoGuideOpen}
        onClose={() => setDemoGuideOpen(false)}
        currentStep={demoStep}
        onSetStep={setDemoStep}
        onSelectEvent={handleSelectEvent}
        onOpenGroundModal={() => setGroundModalOpen(true)}
        onOpenDossier={() => setDossierModalOpen(true)}
      />
    </div>
  );
}
