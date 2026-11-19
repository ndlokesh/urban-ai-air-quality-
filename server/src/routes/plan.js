import { Router } from 'express';
import { generateActionPlan } from '../services/gemini.js';

const router = Router();

/**
 * POST /api/plan
 * Generates structured AI action plan based on AQI data + lifestyle profile
 */
router.post('/', async (req, res) => {
  try {
    const { aqiData, profile, language } = req.body;

    if (!aqiData) {
      return res.status(400).json({ error: 'AQI data is required' });
    }

    const defaultProfile = {
      hasChildren: false,
      hasElderly: false,
      hasAsthma: false,
      hasPets: false,
      commuteMode: 'public transit',
      homeType: 'apartment',
      hasPurifier: false,
      windowsSeal: true,
      cookingFuel: 'gas',
      budgetLevel: 'medium'
    };

    const mergedProfile = { ...defaultProfile, ...(profile || {}) };
    const plan = await generateActionPlan({
      aqiData,
      profile: mergedProfile,
      language: language || 'en'
    });

    res.json(plan);
  } catch (error) {
    console.error('Plan generation route error:', error);
    res.status(500).json({ error: 'Failed to generate action plan' });
  }
});

export default router;
