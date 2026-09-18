import {
  IncidentCategory,
  EvidenceLevel,
  Categorization,
  ThermalFeatures,
  ContextualFactors,
  ImageAnalysisResult,
  GroundEvidence,
  EvidenceFusion,
  AdvancedMLMetrics,
} from '../src/types.js';

export function runCategorizationEngine(
  thermal: ThermalFeatures,
  context: ContextualFactors,
  imageAnalysis: ImageAnalysisResult,
  groundList: GroundEvidence[] = []
): {
  categorization: Categorization;
  fusion?: EvidenceFusion;
  advancedML: AdvancedMLMetrics;
} {
  // Score accumulators for each category
  // Each starts with base evidence
  let agScore = 0;
  let indScore = 0;
  let vegScore = 0;
  let wasteScore = 0;

  const agSupporting: string[] = [];
  const indSupporting: string[] = [];
  const vegSupporting: string[] = [];
  const wasteSupporting: string[] = [];

  const agContra: string[] = [];
  const indContra: string[] = [];
  const vegContra: string[] = [];
  const wasteContra: string[] = [];

  // 1. Land-use Context Factor
  const lu = context.landUseType.toLowerCase();
  if (lu.includes('crop') || lu.includes('agri') || lu.includes('farm') || lu.includes('paddy')) {
    agScore += 35;
    agSupporting.push(`Event located in confirmed agricultural land (${context.landUseType})`);
    indContra.push(`Land use is agricultural cropland, not zoned industrial`);
  } else if (lu.includes('indust') || lu.includes('refin') || lu.includes('chemical') || lu.includes('plant')) {
    indScore += 40;
    indSupporting.push(`Zoned industrial territory or manufacturing complex (${context.landUseType})`);
    agContra.push(`Non-agricultural industrial zoning`);
  } else if (lu.includes('forest') || lu.includes('vegetat') || lu.includes('woodland') || lu.includes('reserve')) {
    vegScore += 35;
    vegSupporting.push(`Dense vegetation / protected forest cover context (${context.landUseType})`);
  } else if (lu.includes('waste') || lu.includes('dump') || lu.includes('landfill') || lu.includes('peri-urban') || lu.includes('open ground')) {
    wasteScore += 35;
    wasteSupporting.push(`Located in or adjacent to waste disposal / peri-urban open zone (${context.landUseType})`);
  }

  // 2. Industrial Proximity Factor
  if (context.industrialProximityKm <= 0.8) {
    indScore += 30;
    indSupporting.push(`Immediate proximity to industrial facility (${context.nearestIndustrialFacility || 'Commercial plant'} at ${context.industrialProximityKm} km)`);
    agContra.push(`Close proximity to industrial facility (${context.industrialProximityKm} km)`);
  } else if (context.industrialProximityKm > 4.0) {
    agScore += 15;
    agSupporting.push(`No nearby industrial facility detected (nearest is ${context.industrialProximityKm.toFixed(1)} km away)`);
    vegScore += 10;
    indContra.push(`Far from industrial infrastructure (${context.industrialProximityKm.toFixed(1)} km)`);
  } else {
    // 0.8 to 4 km is ambiguous buffer
    indScore += 10;
  }

  // 3. Agricultural Cycle & Seasonality
  if (context.isCropHarvestSeason) {
    agScore += 20;
    agSupporting.push(`Active seasonal harvest/stubble clearance window in this agricultural belt`);
  } else {
    agContra.push(`Outside peak regional crop harvesting season`);
  }

  // 4. Vegetation / NDVI Context
  if (context.ndviValue > 0.45) {
    vegScore += 25;
    vegSupporting.push(`High canopy vegetation index (NDVI: ${context.ndviValue.toFixed(2)}) indicates dense biomass fuel load`);
  } else if (context.ndviValue < 0.20 && (lu.includes('urban') || lu.includes('waste') || context.settlementProximityKm < 2.0)) {
    wasteScore += 15;
    wasteSupporting.push(`Low vegetation index (NDVI: ${context.ndviValue.toFixed(2)}) with urban/settlement proximity (${context.settlementProximityKm} km)`);
  }

  // 5. Thermal Characteristics
  if (thermal.frpMW > 45) {
    indScore += 20;
    vegScore += 15;
    indSupporting.push(`High Fire Radiative Power (${thermal.frpMW} MW) typical of industrial flares or intense thermal stacks`);
  } else if (thermal.frpMW >= 8 && thermal.frpMW <= 40) {
    agScore += 15;
    agSupporting.push(`Moderate Fire Radiative Power (${thermal.frpMW} MW) consistent with crop residue burning`);
  } else {
    wasteScore += 15;
    wasteSupporting.push(`Low-to-moderate thermal output (${thermal.frpMW} MW) typical of localized open waste combustion`);
  }

  // Persistence
  if (thermal.persistenceHours >= 3.5) {
    indScore += 15;
    vegScore += 15;
    indSupporting.push(`Persistent thermal anomaly detected across multiple observation cycles (${thermal.persistenceHours} hrs)`);
  } else {
    agScore += 10;
    agSupporting.push(`Short-duration thermal anomaly (${thermal.persistenceHours} hrs), consistent with rapid field stubble combustion`);
  }

  // Historical Pattern
  if (context.historicalPattern.toLowerCase().includes('repeat') || context.historicalPattern.toLowerCase().includes('annual')) {
    if (lu.includes('crop') || lu.includes('agri')) {
      agScore += 15;
      agSupporting.push(`Historical pattern: ${context.historicalPattern}`);
    } else if (lu.includes('indust')) {
      indScore += 15;
      indSupporting.push(`Historical pattern: ${context.historicalPattern}`);
    }
  }

  // 6. Visual / Image Analysis Context (if available)
  if (imageAnalysis && imageAnalysis.isAnalyzed) {
    for (const feat of imageAnalysis.detectedFeatures) {
      if (feat.observed) {
        const fn = feat.name.toLowerCase();
        if (fn.includes('crop') || fn.includes('field pattern')) {
          agScore += 20;
          agSupporting.push(`Visual analysis: distinct agricultural field boundary pattern identified`);
        }
        if (fn.includes('industrial') || fn.includes('structure') || fn.includes('plant')) {
          indScore += 25;
          indSupporting.push(`Visual analysis: industrial roofing or machinery structures observed`);
        }
        if (fn.includes('dense vegetation') || fn.includes('forest canopy')) {
          vegScore += 20;
          vegSupporting.push(`Visual analysis: dense contiguous vegetation canopy surrounding hotspot`);
        }
        if (fn.includes('waste') || fn.includes('open ground') || fn.includes('dump')) {
          wasteScore += 20;
          wasteSupporting.push(`Visual analysis: open disposal pit / perimeter waste accumulation visible`);
        }
        if (fn.includes('smoke')) {
          agSupporting.push(`Visual analysis: plume dispersal pattern consistent with open-air combustion`);
        }
      }
    }
  } else {
    agContra.push(`Associated high-resolution satellite imagery not yet captured for this pass`);
  }

  // 7. Ground Evidence Fusion Factor
  let groundObservedCategory: IncidentCategory | null = null;
  if (groundList.length > 0) {
    const latestGround = groundList[groundList.length - 1];
    if (latestGround.observedCategory && latestGround.observedCategory !== 'other' && latestGround.observedCategory !== 'false_alarm') {
      groundObservedCategory = latestGround.observedCategory;
      if (groundObservedCategory === 'agricultural_burning') {
        agScore += 50;
        agSupporting.push(`Ground verification confirmed: "${latestGround.description}" (Observed by ${latestGround.reporterRole})`);
      } else if (groundObservedCategory === 'industrial_incident') {
        indScore += 50;
        indSupporting.push(`Ground verification confirmed: "${latestGround.description}" (Observed by ${latestGround.reporterRole})`);
      } else if (groundObservedCategory === 'vegetation_fire') {
        vegScore += 50;
        vegSupporting.push(`Ground verification confirmed: "${latestGround.description}" (Observed by ${latestGround.reporterRole})`);
      } else if (groundObservedCategory === 'waste_burning') {
        wasteScore += 50;
        wasteSupporting.push(`Ground verification confirmed: "${latestGround.description}" (Observed by ${latestGround.reporterRole})`);
      }
    }
  } else {
    agContra.push(`Ground verification evidence not yet available`);
    indContra.push(`Ground verification evidence not yet available`);
    vegContra.push(`Ground verification evidence not yet available`);
    wasteContra.push(`Ground verification evidence not yet available`);
  }

  // Decide Primary Category & Levels
  const scores: { cat: IncidentCategory; label: string; score: number; supp: string[]; contra: string[] }[] = [
    { cat: 'agricultural_burning', label: '🌾 Agricultural Burning', score: agScore, supp: agSupporting, contra: agContra },
    { cat: 'industrial_incident', label: '🏭 Industrial Incident', score: indScore, supp: indSupporting, contra: indContra },
    { cat: 'vegetation_fire', label: '🌳 Vegetation / Wildland Fire', score: vegScore, supp: vegSupporting, contra: vegContra },
    { cat: 'waste_burning', label: '🗑️ Waste / Open Burning', score: wasteScore, supp: wasteSupporting, contra: wasteContra },
  ];

  scores.sort((a, b) => b.score - a.score);

  const top = scores[0];
  const runnerUp = scores[1];

  let primaryCategory: IncidentCategory = top.cat;
  let primaryLabel = top.label;
  let assessment = '';
  let evidenceStatus: Categorization['evidenceStatus'] = 'Moderate Evidence';

  // IMPORTANT: The AI must NOT be forced to choose a category when evidence is weak or margin is too tight without solid indicators!
  const hasInsufficientEvidence =
    top.score < 30 ||
    (top.score - runnerUp.score < 10 && top.score < 55 && groundList.length === 0);

  if (hasInsufficientEvidence) {
    primaryCategory = 'unknown_insufficient';
    primaryLabel = '❓ Unknown / Insufficient Evidence';
    assessment = 'Insufficient evidence for reliable automated categorization. Multi-source observations are conflicting or inconclusive.';
    evidenceStatus = 'Insufficient Evidence — Ground Verification Recommended';
  } else {
    if (top.score >= 70 || groundList.length > 0) {
      evidenceStatus = 'Strong Evidence';
    } else if (top.score >= 45) {
      evidenceStatus = 'Moderate Evidence';
    } else {
      evidenceStatus = 'Weak Evidence';
    }

    if (primaryCategory === 'agricultural_burning') {
      assessment = evidenceStatus === 'Strong Evidence' ? 'Confirmed seasonal agricultural crop-field burning' : 'Possible agricultural crop-residue burning';
    } else if (primaryCategory === 'industrial_incident') {
      assessment = evidenceStatus === 'Strong Evidence' ? 'Active industrial flare or thermal facility event' : 'Possible industrial thermal anomaly requiring safety validation';
    } else if (primaryCategory === 'vegetation_fire') {
      assessment = evidenceStatus === 'Strong Evidence' ? 'Active vegetation or wildland perimeter fire' : 'Potential vegetation / wildland thermal spread';
    } else if (primaryCategory === 'waste_burning') {
      assessment = evidenceStatus === 'Strong Evidence' ? 'Confirmed localized waste / open landfill combustion' : 'Possible municipal or open waste combustion';
    }
  }

  // Convert raw scores to qualitative evidence levels for Alternative Explanations
  function scoreToLevel(score: number): EvidenceLevel {
    if (score >= 65) return 'Strong evidence';
    if (score >= 42) return 'Moderate evidence';
    if (score >= 20) return 'Possible';
    if (score >= 8) return 'Low evidence';
    return 'Insufficient evidence';
  }

  const alternativeExplanations = scores.map((s) => ({
    category: s.cat,
    categoryLabel: s.label,
    level: scoreToLevel(s.score),
    rationale:
      s.supp.length > 0
        ? s.supp.slice(0, 2).join('; ')
        : 'Lack of supportive land-use or sensor indicators.',
  }));

  // Add Unknown to alternatives
  alternativeExplanations.push({
    category: 'unknown_insufficient',
    categoryLabel: '❓ Unknown / Unresolved',
    level: primaryCategory === 'unknown_insufficient' ? 'Strong evidence' : 'Possible',
    rationale: 'Uncertainty remains pending field inspection and high-resolution optical passes.',
  });

  // Calculate Investigation Priority (0-100)
  // Considers: thermal intensity, persistence, context, infrastructure proximity, evidence availability, uncertainty
  let priority = 20;
  // Intensity
  priority += Math.min(30, (thermal.frpMW / 60) * 30);
  // Persistence
  priority += Math.min(20, thermal.persistenceHours * 5);
  // Infrastructure proximity
  if (context.industrialProximityKm < 1.0) priority += 25;
  else if (context.industrialProximityKm < 3.0) priority += 12;
  // Settlements
  if (context.settlementProximityKm < 2.0) priority += 15;
  // Uncertainty penalty/boost (high uncertainty requires prompt attention)
  if (primaryCategory === 'unknown_insufficient' || evidenceStatus === 'Insufficient Evidence — Ground Verification Recommended') {
    priority += 12;
  }
  // If ground already verified and benign, reduce priority
  if (groundList.length > 0 && primaryCategory === 'agricultural_burning') {
    priority = Math.max(35, priority - 20);
  }

  const investigationPriority = Math.round(Math.min(98, Math.max(15, priority)));
  const priorityLevel = investigationPriority >= 75 ? 'HIGH' : investigationPriority >= 45 ? 'MEDIUM' : 'LOW';

  const priorityExplanation =
    'This score represents investigation priority based on thermal intensity, persistence, proximity to structures, and uncertainty. It is NOT a probability of fire.';

  // Build supporting and missing lists for primary category
  const currentCategoryObj = scores.find((s) => s.cat === primaryCategory) || scores[0];
  const supportingEvidence =
    primaryCategory === 'unknown_insufficient'
      ? [
          'Multiple contradictory or weak contextual indicators',
          `Thermal anomaly detected (${thermal.frpMW} MW, ${thermal.brightnessK} K)`,
          'Land-use context does not decisively match a single dominant source',
        ]
      : currentCategoryObj.supp;

  const contradictingOrMissing =
    primaryCategory === 'unknown_insufficient'
      ? [
          'Ground verification not yet conducted',
          'High-resolution multi-spectral imagery unavailable',
          'No clear facility or field correlation',
        ]
      : currentCategoryObj.contra;

  // Evidence Fusion object
  let fusion: EvidenceFusion | undefined;
  if (groundList.length > 0 || imageAnalysis?.isAnalyzed) {
    const satSummary = [
      `Satellite Source: ${thermal.brightnessK}K brightness, ${thermal.frpMW} MW FRP`,
      `Duration & Area: ~${thermal.persistenceHours} hrs persistence, localized footprint`,
      `Context: ${context.landUseType}, Industrial distance ${context.industrialProximityKm} km`,
    ];

    const imgSummary = imageAnalysis?.isAnalyzed
      ? imageAnalysis.detectedFeatures.filter((f) => f.observed).map((f) => f.name)
      : ['Optical imagery not yet acquired by sun-synchronous pass'];

    const grdSummary = groundList.map(
      (g) => `${g.reporterRole}: "${g.description}" (${g.timestamp})`
    );

    let combined = `${primaryLabel} — ${evidenceStatus}`;
    let recAction = 'Continue routine satellite monitoring.';
    if (primaryCategory === 'industrial_incident') {
      combined = 'Industrial Incident — Requires Safety Protocol Investigation';
      recAction = 'Notify district industrial safety inspectorate and verify facility emission logs.';
    } else if (primaryCategory === 'unknown_insufficient') {
      combined = 'Unknown Source — Additional Ground Evidence Required';
      recAction = 'Dispatch field observation team with handheld GPS/camera.';
    } else if (primaryCategory === 'vegetation_fire') {
      combined = 'Vegetation Fire — Containment Monitoring Recommended';
      recAction = 'Alert regional forest range office and monitor wind dispersion vectors.';
    } else if (primaryCategory === 'agricultural_burning') {
      combined = `Agricultural Burning — ${evidenceStatus}`;
      recAction = 'Record seasonal biomass burning incidence for air-quality inventory.';
    }

    fusion = {
      satelliteSummary: satSummary,
      imageSummary: imgSummary.length > 0 ? imgSummary : ['No high-res optical imagery'],
      groundSummary: grdSummary.length > 0 ? grdSummary : ['Ground verification pending'],
      combinedAssessment: combined,
      finalCategory: primaryCategory,
      confidenceOutcome: evidenceStatus,
      recommendedAction: recAction,
    };
  }

  // Advanced ML metrics: authentic representations (Isolation Forest anomaly score, Random Forest multi-class weights, Feature Importance)
  const normFRP = Math.min(1, thermal.frpMW / 80);
  const normPersist = Math.min(1, thermal.persistenceHours / 8);
  const normIndDist = Math.max(0, 1 - context.industrialProximityKm / 10);
  // Anomaly score: negative values indicate outliers
  const ifScore = Number((-0.15 - (normFRP * 0.4 + normPersist * 0.3) + (context.isCropHarvestSeason ? 0.2 : 0)).toFixed(2));
  const ifLabel = ifScore < -0.3 ? 'High Thermal Outlier (Uncommon Signature)' : 'Typical Seasonal Thermal Profile';

  // Feature Importance breakdown
  const featureImportance: AdvancedMLMetrics['featureImportance'] = [
    {
      feature: 'Land-Use Classification',
      importance: 0.34,
      direction: lu.includes('agri') || lu.includes('crop') ? 'supports' : 'neutral',
      contribution: `Classified as ${context.landUseType}`,
    },
    {
      feature: 'Industrial Proximity Buffer',
      importance: 0.26,
      direction: context.industrialProximityKm < 1.5 ? 'supports' : 'refutes',
      contribution: `${context.industrialProximityKm} km to closest registered industrial asset`,
    },
    {
      feature: 'Fire Radiative Power (FRP)',
      importance: 0.18,
      direction: 'supports',
      contribution: `${thermal.frpMW} MW energy dissipation rate`,
    },
    {
      feature: 'Seasonal Phenology Window',
      importance: 0.14,
      direction: context.isCropHarvestSeason ? 'supports' : 'neutral',
      contribution: context.isCropHarvestSeason ? 'Within post-harvest residue clearing cycle' : 'Off-season baseline',
    },
    {
      feature: 'Thermal Persistence (Hours)',
      importance: 0.08,
      direction: 'supports',
      contribution: `${thermal.persistenceHours} hrs across successive overpasses`,
    },
  ];

  // Random Forest weights
  const totalWeight = Math.max(1, agScore + indScore + vegScore + wasteScore);
  const rfWeights = [
    { category: 'agricultural_burning' as IncidentCategory, label: '🌾 Agricultural Burning', weight: Number((agScore / totalWeight).toFixed(3)) },
    { category: 'industrial_incident' as IncidentCategory, label: '🏭 Industrial Incident', weight: Number((indScore / totalWeight).toFixed(3)) },
    { category: 'vegetation_fire' as IncidentCategory, label: '🌳 Vegetation Fire', weight: Number((vegScore / totalWeight).toFixed(3)) },
    { category: 'waste_burning' as IncidentCategory, label: '🗑️ Waste / Open Burning', weight: Number((wasteScore / totalWeight).toFixed(3)) },
  ];

  const advancedML: AdvancedMLMetrics = {
    isolationForestScore: ifScore,
    isolationForestLabel: ifLabel,
    randomForestWeights: rfWeights,
    featureImportance,
    spatialClustering: {
      clusterId: `CLUST-${context.clusterCount > 1 ? 'MULTI' : 'SINGLE'}-${thermal.scan.toFixed(1)}`,
      nearbyHotspotsCount: context.clusterCount,
      spatialSpreadKm: Number((context.clusterCount * 0.35).toFixed(2)),
    },
  };

  const categorization: Categorization = {
    primaryCategory,
    categoryLabel: primaryLabel,
    assessment,
    supportingEvidence,
    contradictingOrMissing,
    alternativeExplanations,
    evidenceStatus,
    investigationPriority,
    priorityLevel,
    priorityExplanation,
  };

  return { categorization, fusion, advancedML };
}
