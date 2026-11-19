import { Router } from 'express';
import { answerFollowUpQuestion } from '../services/gemini.js';

const router = Router();

/**
 * POST /api/chat
 * Grounded conversational follow-up with medical safety rules
 */
router.post('/', async (req, res) => {
  try {
    const { query, aqiData, profile, previousPlan, conversationHistory, language } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!aqiData) {
      return res.status(400).json({ error: 'AQI data context is required for grounded answering' });
    }

    const response = await answerFollowUpQuestion({
      query,
      aqiData,
      profile: profile || {},
      previousPlan: previousPlan || null,
      conversationHistory: conversationHistory || [],
      language: language || 'en'
    });

    res.json(response);
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: 'Failed to process chat query' });
  }
});

export default router;
