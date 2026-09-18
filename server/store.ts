import fs from 'fs';
import path from 'path';
import { ThermalEvent, GroundEvidence, MonitoringStats, ThermalFeatures, ContextualFactors } from '../src/types.js';
import { runCategorizationEngine } from './categorizationEngine.js';
import { runPrototypeVisualAnalysis } from './geminiService.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

// In-memory cache synced to disk
let eventsCache: ThermalEvent[] = [];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialSeededEvents(): ThermalEvent[] {
  // Seed Event 1: Punjab Agricultural Burning (The primary 2-minute demo scenario event)
  const e1Thermal = {
    brightnessK: 332.4,
    frpMW: 18.5,
    confidence: 'nominal (84%)',
    scan: 0.38,
    track: 0.36,
    persistenceHours: 1.8,
    dayNight: 'D' as const,
    sensorBand: 'VIIRS I-4 (3.74 μm)',
  };
  const e1Context = {
    landUseType: 'Intensive Cropland (Paddy/Wheat)',
    landUseDescription: 'Agricultural field parcels in Sangrur district, Punjab, India.',
    agriculturalContext: 'Active post-monsoon paddy harvest clearing window.',
    isCropHarvestSeason: true,
    industrialProximityKm: 8.4,
    nearestIndustrialFacility: null,
    vegetationContext: 'Harvested cropland parcels with low vegetative moisture, stubble load.',
    ndviValue: 0.28,
    historicalPattern: 'Repeated seasonal hotspot cluster recorded annually in October-November.',
    clusterCount: 2,
    settlementProximityKm: 2.8,
  };
  const e1Imagery = {
    available: false, // CRITICAL: Realistically unavailable!
    statusText: 'Satellite imagery unavailable for this event — Thermal observation available',
    imageType: 'none' as const,
    imageUrl: null,
    isDemoImage: false,
    sensorName: 'Sentinel-2 MSI (Next pass in 28 hrs)',
    passTime: null,
  };
  const e1ImgAnalysis = {
    isAnalyzed: false,
    isPrototype: true,
    modelUsed: 'Prototype Visual Analysis',
    detectedFeatures: [],
    visualSummary: 'No high-resolution optical overpass coincided with this thermal detection time.',
    analyzedAt: null,
  };
  const e1Engine = runCategorizationEngine(e1Thermal, e1Context, e1ImgAnalysis, []);

  const e1: ThermalEvent = {
    id: 'th-1023',
    eventNumber: 'TH-1023',
    title: 'Sangrur Agricultural Field Thermal Cluster',
    region: 'Punjab, India',
    latitude: 30.2458,
    longitude: 75.8421,
    detectionTimestamp: '2026-09-18T10:32:00Z',
    satelliteSource: 'VIIRS (NOAA-20)',
    instrument: 'VIIRS',
    isSimulation: false,
    status: 'CATEGORIZED',
    thermalFeatures: e1Thermal,
    contextualFactors: e1Context,
    satelliteImagery: e1Imagery,
    imageAnalysis: e1ImgAnalysis,
    categorization: e1Engine.categorization,
    groundEvidence: [],
    evidenceFusion: undefined,
    advancedML: e1Engine.advancedML,
    timeline: [
      {
        id: 'tl-1',
        time: '10:32',
        title: 'Thermal anomaly detected',
        description: 'VIIRS 375m sensor registered 18.5 MW FRP hotspot at 30.2458°N, 75.8421°E.',
        stage: 'DETECTED',
      },
      {
        id: 'tl-2',
        time: '10:34',
        title: 'Contextual and land-use analysis',
        description: 'Overlayed with Bhuvan/Copernicus land cover. Cropland identified, no industrial assets within 8km.',
        stage: 'ANALYSIS',
      },
      {
        id: 'tl-3',
        time: '10:35',
        title: 'Incident categorized',
        description: 'Categorized as Possible Agricultural Burning (Moderate Evidence). Priority score: 48/100.',
        stage: 'CATEGORIZED',
      },
    ],
  };

  // Seed Event 2: Dahej Petrochemical Refinery Flare / Incident
  const e2Thermal = {
    brightnessK: 368.1,
    frpMW: 58.2,
    confidence: 'high (98%)',
    scan: 0.42,
    track: 0.38,
    persistenceHours: 5.2,
    dayNight: 'N' as const,
    sensorBand: 'VIIRS I-4 (3.74 μm)',
  };
  const e2Context = {
    landUseType: 'Heavy Industrial / Chemical Processing Zone',
    landUseDescription: 'Petrochemical manufacturing and hydrocarbon processing corridor, Dahej PCPIR, Gujarat.',
    agriculturalContext: 'Non-agricultural industrial saltpan and reclaimed coastal infrastructure.',
    isCropHarvestSeason: false,
    industrialProximityKm: 0.3,
    nearestIndustrialFacility: 'Dahej Hydrocarbon Cracking Complex (Unit B)',
    facilityType: 'Petrochemical Refinery & Cracking Plant',
    vegetationContext: 'Industrial paved surface and storage tank bunds, NDVI: 0.08.',
    ndviValue: 0.08,
    historicalPattern: 'Persistent thermal venting footprint during plant turnaround cycles.',
    clusterCount: 4,
    settlementProximityKm: 4.5,
  };
  const e2ImgAnalysis = runPrototypeVisualAnalysis('industrial petrochemical plant high radiance');
  const e2Engine = runCategorizationEngine(e2Thermal, e2Context, e2ImgAnalysis, []);

  const e2: ThermalEvent = {
    id: 'th-1087',
    eventNumber: 'TH-1087',
    title: 'Dahej PCPIR Petrochemical Flare / Incident',
    region: 'Gujarat, India',
    latitude: 21.7142,
    longitude: 72.5891,
    detectionTimestamp: '2026-09-18T08:14:00Z',
    satelliteSource: 'VIIRS (Suomi NPP)',
    instrument: 'VIIRS',
    isSimulation: false,
    status: 'INVESTIGATION REQUIRED',
    thermalFeatures: e2Thermal,
    contextualFactors: e2Context,
    satelliteImagery: {
      available: true,
      statusText: 'Associated satellite imagery available (Nighttime SWIR Band)',
      imageType: 'false_color_swir',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      isDemoImage: true,
      sensorName: 'VIIRS Nighttime High-Radiance Band',
      passTime: '2026-09-18T08:14:00Z',
    },
    imageAnalysis: e2ImgAnalysis,
    categorization: e2Engine.categorization,
    groundEvidence: [],
    evidenceFusion: e2Engine.fusion,
    advancedML: e2Engine.advancedML,
    timeline: [
      {
        id: 'tl-201',
        time: '08:14',
        title: 'High-radiance thermal anomaly detected',
        description: 'Suomi NPP detected high FRP (58.2 MW) persistent thermal source.',
        stage: 'DETECTED',
      },
      {
        id: 'tl-202',
        time: '08:16',
        title: 'Infrastructure proximity matched',
        description: 'Hotspot located 300m from Unit B cracking furnace.',
        stage: 'ANALYSIS',
      },
      {
        id: 'tl-203',
        time: '08:18',
        title: 'Categorized as Industrial Incident',
        description: 'Investigation Priority: 88/100 (HIGH PRIORITY). Facility safety notification flagged.',
        stage: 'CATEGORIZED',
      },
    ],
  };

  // Seed Event 3: Ghazipur Landfill Peri-Urban Open Burning (With Ground Evidence pre-loaded!)
  const e3Thermal = {
    brightnessK: 322.5,
    frpMW: 8.4,
    confidence: 'nominal (78%)',
    scan: 0.5,
    track: 0.4,
    persistenceHours: 2.1,
    dayNight: 'D' as const,
    sensorBand: 'MODIS Band 21 (3.96 μm)',
  };
  const e3Context = {
    landUseType: 'Solid Waste Disposal / Peri-Urban Landfill',
    landUseDescription: 'Municipal dumping facility boundary, East Delhi / Ghaziabad border.',
    agriculturalContext: 'Non-agricultural municipal utility zone.',
    isCropHarvestSeason: false,
    industrialProximityKm: 2.9,
    nearestIndustrialFacility: 'Patparganj Light Engineering Estate (2.9 km)',
    vegetationContext: 'Barren waste accumulation slopes, sparse scrub, NDVI: 0.12.',
    ndviValue: 0.12,
    historicalPattern: 'Recurrent methane-induced combustion pockets along north face.',
    clusterCount: 1,
    settlementProximityKm: 0.7,
  };
  const e3Ground: GroundEvidence = {
    id: 'ge-301',
    eventId: 'th-1142',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    description: 'Dense white-grey smoke issuing from waste accumulation tier 3 near perimeter ditch.',
    latitude: 28.6258,
    longitude: 77.3292,
    timestamp: '2026-09-18T09:40:00Z',
    reporterRole: 'Municipal Environmental Patrol',
    visualIndicators: ['Smoke visible', 'Open/waste area', 'Urban surroundings'],
    observedCategory: 'waste_burning',
    notes: 'No structural fire or agricultural fields. Surface refuse combustion confirmed.',
  };
  const e3ImgAnalysis = runPrototypeVisualAnalysis('waste landfill dumping ground smoke');
  const e3Engine = runCategorizationEngine(e3Thermal, e3Context, e3ImgAnalysis, [e3Ground]);

  const e3: ThermalEvent = {
    id: 'th-1142',
    eventNumber: 'TH-1142',
    title: 'Ghazipur Perimeter Waste Thermal Anomaly',
    region: 'Delhi NCR, India',
    latitude: 28.6264,
    longitude: 77.3298,
    detectionTimestamp: '2026-09-18T09:12:00Z',
    satelliteSource: 'MODIS (Terra)',
    instrument: 'MODIS',
    isSimulation: false,
    status: 'GROUND EVIDENCE RECEIVED',
    thermalFeatures: e3Thermal,
    contextualFactors: e3Context,
    satelliteImagery: {
      available: false,
      statusText: 'Satellite imagery unavailable for this event — Thermal observation available',
      imageType: 'none',
      imageUrl: null,
      isDemoImage: false,
      sensorName: null,
      passTime: null,
    },
    imageAnalysis: e3ImgAnalysis,
    categorization: e3Engine.categorization,
    groundEvidence: [e3Ground],
    evidenceFusion: e3Engine.fusion,
    advancedML: e3Engine.advancedML,
    timeline: [
      {
        id: 'tl-301',
        time: '09:12',
        title: 'Thermal anomaly detected',
        description: 'MODIS Terra registered 8.4 MW thermal emission at 28.6264°N, 77.3298°E.',
        stage: 'DETECTED',
      },
      {
        id: 'tl-302',
        time: '09:15',
        title: 'Peri-urban context matched',
        description: 'Located in solid waste management boundary, 700m from dense settlement.',
        stage: 'ANALYSIS',
      },
      {
        id: 'tl-303',
        time: '09:20',
        title: 'Ground verification requested',
        description: 'Proximity to residential pocket prompted dispatch of municipal inspector.',
        stage: 'VERIFICATION REQUIRED',
      },
      {
        id: 'tl-304',
        time: '09:40',
        title: 'Ground evidence received',
        description: 'Inspector uploaded photo: "Dense white-grey smoke issuing from waste tier 3".',
        stage: 'GROUND EVIDENCE RECEIVED',
      },
      {
        id: 'tl-305',
        time: '09:44',
        title: 'Combined assessment generated',
        description: 'Evidence fusion confirms Waste / Open Burning — Strong Evidence.',
        stage: 'FUSION',
      },
    ],
  };

  // Seed Event 4: Unknown / Insufficient Evidence (Crucial for Honest AI requirement!)
  const e4Thermal = {
    brightnessK: 314.2,
    frpMW: 6.8,
    confidence: 'low (48%)',
    scan: 0.62,
    track: 0.54,
    persistenceHours: 0.6,
    dayNight: 'D' as const,
    sensorBand: 'MODIS Band 21 (3.96 μm)',
  };
  const e4Context = {
    landUseType: 'Mixed Semi-Arid Scrub & Stone Quarry Edge',
    landUseDescription: 'Transitional scrubland border in Pali district, Rajasthan.',
    agriculturalContext: 'Non-arable dry stony terrain.',
    isCropHarvestSeason: false,
    industrialProximityKm: 3.8,
    nearestIndustrialFacility: 'Limestone Crushing Yard (3.8 km)',
    vegetationContext: 'Sparse thorny xerophytic vegetation, rock outcrops, NDVI: 0.16.',
    ndviValue: 0.16,
    historicalPattern: 'Occasional solar reflection glint or small campfire flagged by algorithm.',
    clusterCount: 1,
    settlementProximityKm: 6.2,
  };
  const e4ImgAnalysis = {
    isAnalyzed: false,
    isPrototype: true,
    modelUsed: 'Prototype Visual Analysis',
    detectedFeatures: [],
    visualSummary: 'No optical imagery available to disambiguate thermal source from surface glint.',
    analyzedAt: null,
  };
  const e4Engine = runCategorizationEngine(e4Thermal, e4Context, e4ImgAnalysis, []);

  const e4: ThermalEvent = {
    id: 'th-1195',
    eventNumber: 'TH-1195',
    title: 'Pali Scrubland Ambiguous Hotspot',
    region: 'Rajasthan, India',
    latitude: 25.7712,
    longitude: 73.3245,
    detectionTimestamp: '2026-09-18T07:22:00Z',
    satelliteSource: 'MODIS (Aqua)',
    instrument: 'MODIS',
    isSimulation: false,
    status: 'VERIFICATION REQUIRED',
    thermalFeatures: e4Thermal,
    contextualFactors: e4Context,
    satelliteImagery: {
      available: false,
      statusText: 'Satellite imagery unavailable for this event — Thermal observation available',
      imageType: 'none',
      imageUrl: null,
      isDemoImage: false,
      sensorName: null,
      passTime: null,
    },
    imageAnalysis: e4ImgAnalysis,
    categorization: e4Engine.categorization,
    groundEvidence: [],
    evidenceFusion: undefined,
    advancedML: e4Engine.advancedML,
    timeline: [
      {
        id: 'tl-401',
        time: '07:22',
        title: 'Marginal thermal anomaly detected',
        description: 'MODIS Aqua recorded low-confidence (48%) thermal reading: 6.8 MW FRP.',
        stage: 'DETECTED',
      },
      {
        id: 'tl-402',
        time: '07:25',
        title: 'Contextual analysis completed',
        description: 'Mixed scrub and quarry edge. No dominant single source signature.',
        stage: 'ANALYSIS',
      },
      {
        id: 'tl-403',
        time: '07:26',
        title: 'Insufficient evidence flagged',
        description: 'Categorized as Unknown / Insufficient Evidence. AI refused forced classification.',
        stage: 'CATEGORIZED',
      },
      {
        id: 'tl-404',
        time: '07:28',
        title: 'Ground verification recommended',
        description: 'System requests field inspection before any operational intervention.',
        stage: 'VERIFICATION REQUIRED',
      },
    ],
  };

  // Seed Event 5: Simlipal Forest / Wildland Vegetation Fire (Simulated demonstration event)
  const e5Thermal = {
    brightnessK: 341.6,
    frpMW: 42.0,
    confidence: 'high (92%)',
    scan: 0.375,
    track: 0.375,
    persistenceHours: 6.5,
    dayNight: 'D' as const,
    sensorBand: 'VIIRS I-4 (3.74 μm)',
  };
  const e5Context = {
    landUseType: 'Dense Deciduous Forest / Reserve Canopy',
    landUseDescription: 'Continuous Sal forest parcel in Simlipal Tiger Reserve buffer, Odisha.',
    agriculturalContext: 'Zero agricultural activity within 15 km reserve boundary.',
    isCropHarvestSeason: false,
    industrialProximityKm: 26.0,
    nearestIndustrialFacility: null,
    vegetationContext: 'Dry deciduous Sal leaf litter, high fuel load, NDVI: 0.64.',
    ndviValue: 0.64,
    historicalPattern: 'Pre-monsoon forest floor leaf litter fire corridor.',
    clusterCount: 8,
    settlementProximityKm: 12.0,
  };
  const e5ImgAnalysis = runPrototypeVisualAnalysis('dense forest wildland vegetation smoke plume');
  const e5Engine = runCategorizationEngine(e5Thermal, e5Context, e5ImgAnalysis, []);

  const e5: ThermalEvent = {
    id: 'th-1210',
    eventNumber: 'TH-1210',
    title: 'Simlipal Reserve Buffer Forest Fire Front',
    region: 'Odisha, India',
    latitude: 21.8492,
    longitude: 86.3214,
    detectionTimestamp: '2026-09-18T06:45:00Z',
    satelliteSource: 'VIIRS (NOAA-20)',
    instrument: 'VIIRS',
    isSimulation: true,
    status: 'INVESTIGATION REQUIRED',
    thermalFeatures: e5Thermal,
    contextualFactors: e5Context,
    satelliteImagery: {
      available: true,
      statusText: 'Associated satellite imagery available (DEMO SATELLITE IMAGE)',
      imageType: 'demo_uploaded',
      imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
      isDemoImage: true,
      sensorName: 'Sentinel-2 MSI (Demonstration Tile)',
      passTime: '2026-09-18T06:50:00Z',
    },
    imageAnalysis: e5ImgAnalysis,
    categorization: e5Engine.categorization,
    groundEvidence: [],
    evidenceFusion: e5Engine.fusion,
    advancedML: e5Engine.advancedML,
    timeline: [
      {
        id: 'tl-501',
        time: '06:45',
        title: 'Multi-pixel thermal anomaly detected',
        description: 'VIIRS NOAA-20 recorded 8 contiguous thermal pixels totaling 42 MW FRP.',
        stage: 'DETECTED',
      },
      {
        id: 'tl-502',
        time: '06:48',
        title: 'Reserve boundary buffer identified',
        description: 'Located in Sal forest reserve. High biomass index (NDVI: 0.64).',
        stage: 'ANALYSIS',
      },
      {
        id: 'tl-503',
        time: '06:50',
        title: 'Categorized as Vegetation / Wildland Fire',
        description: 'Investigation priority: 84/100 (HIGH PRIORITY). Range office alert prepared.',
        stage: 'CATEGORIZED',
      },
    ],
  };

  return [e1, e2, e3, e4, e5];
}

export function loadEvents(): ThermalEvent[] {
  ensureDataDir();
  if (eventsCache.length > 0) {
    return eventsCache;
  }

  if (fs.existsSync(EVENTS_FILE)) {
    try {
      const data = fs.readFileSync(EVENTS_FILE, 'utf-8');
      eventsCache = JSON.parse(data);
      if (eventsCache.length > 0) {
        return eventsCache;
      }
    } catch (err) {
      console.error('Error reading events.json, re-seeding:', err);
    }
  }

  eventsCache = getInitialSeededEvents();
  saveEvents();
  return eventsCache;
}

export function saveEvents(): void {
  ensureDataDir();
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(eventsCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing events.json:', err);
  }
}

export function getEventById(id: string): ThermalEvent | undefined {
  const events = loadEvents();
  return events.find((e) => e.id.toLowerCase() === id.toLowerCase() || e.eventNumber.toLowerCase() === id.toLowerCase());
}

export function addGroundEvidence(
  eventId: string,
  evidenceInput: {
    description: string;
    imageUrl?: string | null;
    latitude: number;
    longitude: number;
    reporterRole?: string;
    observedCategory?: any;
    visualIndicators?: string[];
  }
): { event: ThermalEvent; evidence: GroundEvidence } | null {
  const events = loadEvents();
  const event = events.find((e) => e.id.toLowerCase() === eventId.toLowerCase() || e.eventNumber.toLowerCase() === eventId.toLowerCase());
  if (!event) return null;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const evidence: GroundEvidence = {
    id: `ge-${Date.now()}`,
    eventId: event.id,
    imageUrl: evidenceInput.imageUrl || null,
    description: evidenceInput.description,
    latitude: evidenceInput.latitude,
    longitude: evidenceInput.longitude,
    timestamp: now.toISOString(),
    reporterRole: evidenceInput.reporterRole || 'Field Observer',
    visualIndicators: evidenceInput.visualIndicators || ['Ground Observation Registered'],
    observedCategory: evidenceInput.observedCategory || 'agricultural_burning',
    notes: 'Submitted via Thermoscope Ground Verification Protocol.',
  };

  event.groundEvidence.push(evidence);
  event.status = 'GROUND EVIDENCE RECEIVED';

  // Re-run categorization engine with new ground truth
  const reResult = runCategorizationEngine(
    event.thermalFeatures,
    event.contextualFactors,
    event.imageAnalysis,
    event.groundEvidence
  );

  event.categorization = reResult.categorization;
  event.evidenceFusion = reResult.fusion;
  event.advancedML = reResult.advancedML;

  event.timeline.push({
    id: `tl-g-${Date.now()}`,
    time: timeStr,
    title: 'Ground evidence received',
    description: `${evidence.reporterRole}: "${evidence.description}"`,
    stage: 'GROUND EVIDENCE RECEIVED',
  });

  event.timeline.push({
    id: `tl-f-${Date.now() + 1}`,
    time: timeStr,
    title: 'Combined assessment generated',
    description: reResult.fusion?.combinedAssessment || 'Evidence fusion updated',
    stage: 'FUSION',
  });

  saveEvents();
  return { event, evidence };
}

export function updateEventSatelliteImage(
  eventId: string,
  imageUrl: string,
  imageAnalysis: any
): ThermalEvent | null {
  const events = loadEvents();
  const event = events.find((e) => e.id.toLowerCase() === eventId.toLowerCase());
  if (!event) return null;

  event.satelliteImagery = {
    available: true,
    statusText: 'DEMO SATELLITE IMAGE',
    imageType: 'demo_uploaded',
    imageUrl,
    isDemoImage: true,
    sensorName: 'Uploaded Prototype Satellite Imagery',
    passTime: new Date().toISOString(),
  };

  event.imageAnalysis = imageAnalysis;

  // Re-categorize with visual context
  const reResult = runCategorizationEngine(
    event.thermalFeatures,
    event.contextualFactors,
    event.imageAnalysis,
    event.groundEvidence
  );

  event.categorization = reResult.categorization;
  event.evidenceFusion = reResult.fusion;
  event.advancedML = reResult.advancedML;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  event.timeline.push({
    id: `tl-img-${Date.now()}`,
    time: timeStr,
    title: 'Demo satellite image analyzed',
    description: `Visual clues evaluated: ${imageAnalysis.visualSummary || 'Features cataloged'}`,
    stage: 'ANALYSIS',
  });

  saveEvents();
  return event;
}

export function generateSimulatedEvent(scenarioType: 'agricultural' | 'industrial' | 'wildland' | 'waste' | 'ambiguous'): ThermalEvent {
  const events = loadEvents();
  const randIdNum = 1000 + events.length + Math.floor(Math.random() * 50);
  const eventId = `th-${randIdNum}`;
  const eventNumber = `TH-${randIdNum}`;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let title = 'Simulated Thermal Hotspot';
  let region = 'Central India';
  let lat = 23.18;
  let lon = 79.98;
  let thermal: ThermalFeatures = {
    brightnessK: 328.0,
    frpMW: 16.0,
    confidence: 'nominal (80%)',
    scan: 0.4,
    track: 0.4,
    persistenceHours: 1.5,
    dayNight: 'D',
    sensorBand: 'VIIRS I-4 (3.74 μm)',
  };
  let context: ContextualFactors = {
    landUseType: 'Agricultural Cropland',
    landUseDescription: 'Simulated cropland parcel.',
    agriculturalContext: 'Seasonal harvesting clearing phase.',
    isCropHarvestSeason: true,
    industrialProximityKm: 7.5,
    nearestIndustrialFacility: null,
    vegetationContext: 'Dry crop biomass.',
    ndviValue: 0.25,
    historicalPattern: 'Recurring seasonal burning.',
    clusterCount: 1,
    settlementProximityKm: 3.2,
  };

  if (scenarioType === 'agricultural') {
    title = 'Karnal Stubble Burning Simulation';
    region = 'Haryana, India';
    lat = 29.6857;
    lon = 76.9905;
    thermal = {
      brightnessK: 334.2,
      frpMW: 21.4,
      confidence: 'high (89%)',
      scan: 0.38,
      track: 0.36,
      persistenceHours: 1.4,
      dayNight: 'D',
      sensorBand: 'VIIRS I-4 (3.74 μm)',
    };
    context = {
      landUseType: 'Intensive Paddy Cropland',
      landUseDescription: 'Agricultural field near Karnal.',
      agriculturalContext: 'Post-harvest paddy straw combustion period.',
      isCropHarvestSeason: true,
      industrialProximityKm: 9.1,
      nearestIndustrialFacility: null,
      vegetationContext: 'Harvested field with low soil moisture.',
      ndviValue: 0.22,
      historicalPattern: 'Annual post-harvest burning hotspot cluster.',
      clusterCount: 2,
      settlementProximityKm: 2.1,
    };
  } else if (scenarioType === 'industrial') {
    title = 'Manesar Auto-Manufacturing Thermal Emission';
    region = 'Haryana, India';
    lat = 28.3512;
    lon = 76.9421;
    thermal = {
      brightnessK: 362.8,
      frpMW: 54.0,
      confidence: 'high (96%)',
      scan: 0.4,
      track: 0.4,
      persistenceHours: 4.8,
      dayNight: 'N',
      sensorBand: 'VIIRS I-4 (3.74 μm)',
    };
    context = {
      landUseType: 'Heavy Engineering Industrial Corridor',
      landUseDescription: 'Manufacturing plant boiler and heat treatment building.',
      agriculturalContext: 'Non-agricultural industrial sector.',
      isCropHarvestSeason: false,
      industrialProximityKm: 0.2,
      nearestIndustrialFacility: 'Automotive Component Die-Casting Facility (200m)',
      facilityType: 'Foundry & Thermal Smelting Plant',
      vegetationContext: 'Asphalt & concrete, NDVI: 0.05.',
      ndviValue: 0.05,
      historicalPattern: 'Continuous manufacturing shift heat signature.',
      clusterCount: 3,
      settlementProximityKm: 3.5,
    };
  } else if (scenarioType === 'wildland') {
    title = 'Satpura Tiger Reserve Ridge Fire';
    region = 'Madhya Pradesh, India';
    lat = 22.4512;
    lon = 78.2415;
    thermal = {
      brightnessK: 338.9,
      frpMW: 38.6,
      confidence: 'high (91%)',
      scan: 0.38,
      track: 0.38,
      persistenceHours: 5.0,
      dayNight: 'D',
      sensorBand: 'VIIRS I-4 (3.74 μm)',
    };
    context = {
      landUseType: 'Dry Teak & Mixed Deciduous Forest',
      landUseDescription: 'Protected forest ridgeline, steep gradient.',
      agriculturalContext: 'Zero agricultural land in protected park.',
      isCropHarvestSeason: false,
      industrialProximityKm: 34.0,
      nearestIndustrialFacility: null,
      vegetationContext: 'Dense dry leaf litter on ridge slope, NDVI: 0.58.',
      ndviValue: 0.58,
      historicalPattern: 'Dry season understorey leaf fire corridor.',
      clusterCount: 6,
      settlementProximityKm: 14.0,
    };
  } else if (scenarioType === 'waste') {
    title = 'Deonar Peri-Urban Dumping Ground Hotspot';
    region = 'Maharashtra, India';
    lat = 19.0624;
    lon = 72.9214;
    thermal = {
      brightnessK: 320.1,
      frpMW: 7.2,
      confidence: 'nominal (74%)',
      scan: 0.5,
      track: 0.4,
      persistenceHours: 2.4,
      dayNight: 'D',
      sensorBand: 'MODIS Band 21 (3.96 μm)',
    };
    context = {
      landUseType: 'Solid Waste Landfill / Peri-Urban Edge',
      landUseDescription: 'Municipal waste disposal boundary.',
      agriculturalContext: 'Non-agricultural urban dump area.',
      isCropHarvestSeason: false,
      industrialProximityKm: 2.1,
      nearestIndustrialFacility: 'Municipal Pumping Station',
      vegetationContext: 'Refuse mound, zero canopy, NDVI: 0.09.',
      ndviValue: 0.09,
      historicalPattern: 'Recurrent subsurface landfill methane fires.',
      clusterCount: 1,
      settlementProximityKm: 0.6,
    };
  } else if (scenarioType === 'ambiguous') {
    title = 'Kutch Saltpan & Scrub Ambiguous Anomaly';
    region = 'Gujarat, India';
    lat = 23.8124;
    lon = 70.1245;
    thermal = {
      brightnessK: 312.4,
      frpMW: 5.4,
      confidence: 'low (42%)',
      scan: 0.6,
      track: 0.6,
      persistenceHours: 0.5,
      dayNight: 'D',
      sensorBand: 'MODIS Band 21 (3.96 μm)',
    };
    context = {
      landUseType: 'Barren Saline Flat / Sparse Halophytic Scrub',
      landUseDescription: 'Marginal terrain with solar reflectance.',
      agriculturalContext: 'Uncultivated wasteland.',
      isCropHarvestSeason: false,
      industrialProximityKm: 12.0,
      nearestIndustrialFacility: null,
      vegetationContext: 'Virtually no vegetation, NDVI: 0.06.',
      ndviValue: 0.06,
      historicalPattern: 'Sporadic solar glint false alarms.',
      clusterCount: 1,
      settlementProximityKm: 8.5,
    };
  }

  const engine = runCategorizationEngine(thermal, context, {
    isAnalyzed: false,
    isPrototype: true,
    modelUsed: 'Prototype Visual Analysis',
    detectedFeatures: [],
    visualSummary: 'Imagery not yet acquired for this simulated event.',
    analyzedAt: null,
  }, []);

  const newEvent: ThermalEvent = {
    id: eventId,
    eventNumber,
    title,
    region,
    latitude: lat,
    longitude: lon,
    detectionTimestamp: now.toISOString(),
    satelliteSource: 'VIIRS (NOAA-20)',
    instrument: 'VIIRS',
    isSimulation: true,
    status: engine.categorization.evidenceStatus.includes('Insufficient') ? 'VERIFICATION REQUIRED' : 'CATEGORIZED',
    thermalFeatures: thermal,
    contextualFactors: context,
    satelliteImagery: {
      available: false,
      statusText: 'Satellite imagery unavailable for this event — Thermal observation available',
      imageType: 'none',
      imageUrl: null,
      isDemoImage: false,
      sensorName: null,
      passTime: null,
    },
    imageAnalysis: {
      isAnalyzed: false,
      isPrototype: true,
      modelUsed: 'Prototype Visual Analysis',
      detectedFeatures: [],
      visualSummary: 'Satellite imagery unavailable for this event.',
      analyzedAt: null,
    },
    categorization: engine.categorization,
    groundEvidence: [],
    evidenceFusion: undefined,
    advancedML: engine.advancedML,
    timeline: [
      {
        id: `tl-sim-1-${Date.now()}`,
        time: timeStr,
        title: 'Simulated thermal anomaly generated',
        description: `Generated ${scenarioType.toUpperCase()} test scenario with authentic FIRMS parameter envelope.`,
        stage: 'DETECTED',
      },
      {
        id: `tl-sim-2-${Date.now() + 1}`,
        time: timeStr,
        title: 'Multi-factor context evaluated',
        description: `Land use: ${context.landUseType}. Industrial distance: ${context.industrialProximityKm} km.`,
        stage: 'ANALYSIS',
      },
      {
        id: `tl-sim-3-${Date.now() + 2}`,
        time: timeStr,
        title: 'Initial categorization completed',
        description: `${engine.categorization.categoryLabel} (${engine.categorization.evidenceStatus}).`,
        stage: 'CATEGORIZED',
      },
    ],
  };

  events.unshift(newEvent);
  saveEvents();
  return newEvent;
}

export function getStats(): MonitoringStats {
  const events = loadEvents();
  const activeEventsCount = events.filter((e) => e.status !== 'CLOSED').length;
  const verificationRequiredCount = events.filter(
    (e) => e.status === 'VERIFICATION REQUIRED' || e.categorization.evidenceStatus.includes('Insufficient')
  ).length;
  const categorizedCount = events.filter((e) => e.status === 'CATEGORIZED' || e.status === 'GROUND EVIDENCE RECEIVED' || e.status === 'INVESTIGATION REQUIRED').length;

  return {
    activeEventsCount,
    verificationRequiredCount,
    categorizedCount,
    systemStatus: 'OPERATIONAL',
    lastSatelliteIngest: '2026-09-18T10:32:00Z (VIIRS NOAA-20 Granule N20_20260918_1032)',
    totalMonitoredAreaSqKm: 3287263,
  };
}
