import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  loadEvents,
  getEventById,
  addGroundEvidence,
  updateEventSatelliteImage,
  generateSimulatedEvent,
  getStats,
  saveEvents,
} from './server/store.js';
import { runCategorizationEngine } from './server/categorizationEngine.js';
import { analyzeSatelliteOrGroundImage } from './server/geminiService.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'THERMOSCOPE AI API',
      version: '1.0.0-sih',
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  app.get('/api/stats', (req, res) => {
    try {
      const stats = getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/events', (req, res) => {
    try {
      const events = loadEvents();
      const { category, status, isSimulation, search } = req.query;

      let filtered = [...events];

      if (category && typeof category === 'string' && category !== 'all') {
        filtered = filtered.filter((e) => e.categorization.primaryCategory === category);
      }

      if (status && typeof status === 'string' && status !== 'all') {
        filtered = filtered.filter((e) => e.status === status);
      }

      if (isSimulation !== undefined && isSimulation !== 'all') {
        const isSim = isSimulation === 'true';
        filtered = filtered.filter((e) => e.isSimulation === isSim);
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.eventNumber.toLowerCase().includes(q) ||
            e.title.toLowerCase().includes(q) ||
            e.region.toLowerCase().includes(q) ||
            e.categorization.primaryCategory.toLowerCase().includes(q)
        );
      }

      res.json(filtered);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/events/:event_id', (req, res) => {
    try {
      const event = getEventById(req.params.event_id);
      if (!event) {
        return res.status(404).json({ error: `Event ${req.params.event_id} not found` });
      }
      res.json(event);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Re-run categorization on demand
  app.post('/api/events/:event_id/categorize', (req, res) => {
    try {
      const event = getEventById(req.params.event_id);
      if (!event) {
        return res.status(404).json({ error: `Event ${req.params.event_id} not found` });
      }

      const result = runCategorizationEngine(
        event.thermalFeatures,
        event.contextualFactors,
        event.imageAnalysis,
        event.groundEvidence
      );

      event.categorization = result.categorization;
      event.evidenceFusion = result.fusion;
      event.advancedML = result.advancedML;
      saveEvents();

      res.json(event);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Visual analysis endpoint (Gemini or Prototype Visual Engine)
  app.post('/api/events/:event_id/analyze', async (req, res) => {
    try {
      const event = getEventById(req.params.event_id);
      if (!event) {
        return res.status(404).json({ error: `Event ${req.params.event_id} not found` });
      }

      const { imageBase64, mimeType } = req.body;
      const targetImage = imageBase64 || event.satelliteImagery.imageUrl;

      if (!targetImage) {
        return res.status(400).json({
          error: 'No image available for visual analysis. Satellite imagery is currently unavailable for this event.',
        });
      }

      const contextHint = `${event.contextualFactors.landUseType} ${event.region} ${event.contextualFactors.nearestIndustrialFacility || ''}`;
      const analysisResult = await analyzeSatelliteOrGroundImage(targetImage, mimeType || 'image/jpeg', contextHint);

      const updated = updateEventSatelliteImage(event.id, targetImage, analysisResult);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Submit ground evidence
  app.post('/api/events/:event_id/ground-evidence', (req, res) => {
    try {
      const { description, imageUrl, latitude, longitude, reporterRole, observedCategory, visualIndicators } = req.body;

      if (!description) {
        return res.status(400).json({ error: 'Description is required for ground evidence submission' });
      }

      const event = getEventById(req.params.event_id);
      if (!event) {
        return res.status(404).json({ error: `Event ${req.params.event_id} not found` });
      }

      const result = addGroundEvidence(event.id, {
        description,
        imageUrl,
        latitude: Number(latitude) || event.latitude,
        longitude: Number(longitude) || event.longitude,
        reporterRole: reporterRole || 'Field Observer',
        observedCategory,
        visualIndicators,
      });

      if (!result) {
        return res.status(500).json({ error: 'Failed to record ground evidence' });
      }

      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/events/:event_id/ground-evidence', (req, res) => {
    try {
      const event = getEventById(req.params.event_id);
      if (!event) {
        return res.status(404).json({ error: `Event ${req.params.event_id} not found` });
      }
      res.json(event.groundEvidence);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Generate simulated events
  app.post('/api/simulation/generate-event', (req, res) => {
    try {
      const { scenarioType = 'agricultural' } = req.body;
      const validTypes = ['agricultural', 'industrial', 'wildland', 'waste', 'ambiguous'];
      const chosenType = validTypes.includes(scenarioType) ? scenarioType : 'agricultural';

      const newEvent = generateSimulatedEvent(chosenType as any);
      res.status(201).json(newEvent);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset demo events
  app.post('/api/simulation/reset', (req, res) => {
    try {
      // Re-seed
      const events = loadEvents();
      events.length = 0;
      saveEvents();
      const fresh = loadEvents();
      res.json({ message: 'Events reset to default seed', count: fresh.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Direct multimodal image analysis test endpoint
  app.post('/api/ai/analyze-image', async (req, res) => {
    try {
      const { imageBase64, mimeType, contextHint } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 required' });
      }
      const result = await analyzeSatelliteOrGroundImage(imageBase64, mimeType || 'image/jpeg', contextHint);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development vs static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`THERMOSCOPE AI server running on http://localhost:${PORT}`);
  });
}

startServer();
