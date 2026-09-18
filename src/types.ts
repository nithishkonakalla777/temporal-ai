export type IncidentCategory =
  | 'agricultural_burning'
  | 'industrial_incident'
  | 'vegetation_fire'
  | 'waste_burning'
  | 'unknown_insufficient';

export type EvidenceLevel =
  | 'Strong evidence'
  | 'Moderate evidence'
  | 'Low evidence'
  | 'Insufficient evidence'
  | 'Possible';

export type EventStatus =
  | 'DETECTED'
  | 'ANALYZING'
  | 'CATEGORIZED'
  | 'VERIFICATION REQUIRED'
  | 'GROUND EVIDENCE RECEIVED'
  | 'INVESTIGATION REQUIRED'
  | 'CLOSED';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ThermalFeatures {
  brightnessK: number;         // Brightness temperature in Kelvin (e.g. 332.5)
  frpMW: number;               // Fire Radiative Power in Megawatts (e.g. 18.4)
  confidence: string;          // e.g. "nominal", "high", or percentage
  scan: number;                // Along-scan pixel size (km)
  track: number;               // Along-track pixel size (km)
  persistenceHours: number;    // Observed persistence across passes
  dayNight: 'D' | 'N';
  sensorBand: string;          // e.g. "I-4 (3.74 um)", "Band 21"
}

export interface ContextualFactors {
  landUseType: string;
  landUseDescription: string;
  agriculturalContext: string;
  isCropHarvestSeason: boolean;
  industrialProximityKm: number;
  nearestIndustrialFacility: string | null;
  facilityType?: string;
  vegetationContext: string;
  ndviValue: number;
  historicalPattern: string;
  clusterCount: number;
  settlementProximityKm: number;
}

export interface SatelliteImageryInfo {
  available: boolean;
  statusText: string;
  imageType: 'optical' | 'false_color_swir' | 'thermal_band' | 'demo_uploaded' | 'none';
  imageUrl: string | null;
  isDemoImage: boolean;
  sensorName: string | null;
  passTime: string | null;
  cloudCoverPercent?: number;
}

export interface ImageAnalysisFeature {
  name: string;
  observed: boolean;
  confidenceNote: string;
}

export interface ImageAnalysisResult {
  isAnalyzed: boolean;
  isPrototype: boolean;
  modelUsed: string;
  detectedFeatures: ImageAnalysisFeature[];
  visualSummary: string;
  analyzedAt: string | null;
}

export interface AlternativeExplanation {
  category: IncidentCategory;
  categoryLabel: string;
  level: EvidenceLevel;
  rationale: string;
}

export interface Categorization {
  primaryCategory: IncidentCategory;
  categoryLabel: string;
  assessment: string;
  supportingEvidence: string[];
  contradictingOrMissing: string[];
  alternativeExplanations: AlternativeExplanation[];
  evidenceStatus:
    | 'Strong Evidence'
    | 'Moderate Evidence'
    | 'Weak Evidence'
    | 'Insufficient Evidence — Ground Verification Recommended';
  investigationPriority: number; // 0 - 100
  priorityLevel: PriorityLevel;
  priorityExplanation: string;
}

export interface GroundEvidence {
  id: string;
  eventId: string;
  imageUrl: string | null;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  reporterRole: string;
  visualIndicators: string[];
  observedCategory: IncidentCategory | 'false_alarm' | 'other';
  notes?: string;
}

export interface EvidenceFusion {
  satelliteSummary: string[];
  imageSummary: string[];
  groundSummary: string[];
  combinedAssessment: string;
  finalCategory: IncidentCategory;
  confidenceOutcome: string;
  recommendedAction: string;
}

export interface AdvancedMLMetrics {
  isolationForestScore: number; // -1 (extreme anomaly) to +1 (normal)
  isolationForestLabel: string;
  randomForestWeights: {
    category: IncidentCategory;
    label: string;
    weight: number;
  }[];
  featureImportance: {
    feature: string;
    importance: number;
    direction: 'supports' | 'refutes' | 'neutral';
    contribution: string;
  }[];
  spatialClustering: {
    clusterId: string;
    nearbyHotspotsCount: number;
    spatialSpreadKm: number;
  };
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  stage: EventStatus | 'ANALYSIS' | 'FUSION' | 'DOSSIER';
}

export interface ThermalEvent {
  id: string;
  eventNumber: string;         // e.g. "TH-1023"
  title: string;
  region: string;
  latitude: number;
  longitude: number;
  detectionTimestamp: string;
  satelliteSource: string;     // e.g. "VIIRS (NOAA-20)"
  instrument: string;          // e.g. "VIIRS", "MODIS"
  isSimulation: boolean;
  status: EventStatus;
  thermalFeatures: ThermalFeatures;
  contextualFactors: ContextualFactors;
  satelliteImagery: SatelliteImageryInfo;
  imageAnalysis: ImageAnalysisResult;
  categorization: Categorization;
  groundEvidence: GroundEvidence[];
  evidenceFusion?: EvidenceFusion;
  advancedML: AdvancedMLMetrics;
  timeline: TimelineItem[];
}

export interface MonitoringStats {
  activeEventsCount: number;
  verificationRequiredCount: number;
  categorizedCount: number;
  systemStatus: 'OPERATIONAL' | 'DEGRADED' | 'STANDBY';
  lastSatelliteIngest: string;
  totalMonitoredAreaSqKm: number;
}
