import { Router } from 'express';
import { searchLocations, fetchLiveAQI, getFallbackAQIData } from '../services/openMeteo.js';

const router = Router();

/**
 * GET /api/geocode?query=...
 * Search matching locations
 */
router.get('/geocode', async (req, res) => {
  try {
    const query = req.query.query || '';
    if (!query || query.length < 2) {
      return res.json([]);
    }
    const locations = await searchLocations(query);
    res.json(locations);
  } catch (error) {
    console.error('Geocode route error:', error);
    res.status(500).json({ error: 'Failed to search locations' });
  }
});

/**
 * GET /api/aqi?lat=...&lon=...&city=...
 * Fetch live AQI and 24-hr trend
 */
router.get('/', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const city = req.query.city || 'Your Location';

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required' });
    }

    const aqiData = await fetchLiveAQI(lat, lon, city);
    res.json(aqiData);
  } catch (error) {
    console.error('AQI fetch route error:', error);
    res.status(500).json({ error: 'Failed to retrieve AQI data' });
  }
});

/**
 * POST /api/aqi/manual
 * Graceful fallback when user manually enters AQI / PM2.5
 */
router.post('/manual', (req, res) => {
  try {
    const { aqi, cityName, pm25 } = req.body;
    const resolvedAqi = aqi ? parseInt(aqi, 10) : (pm25 ? Math.round(pm25 * 1.5) : 150);
    const data = getFallbackAQIData(cityName || 'Custom Location', 0, 0, resolvedAqi);
    res.json(data);
  } catch (error) {
    console.error('Manual AQI error:', error);
    res.status(500).json({ error: 'Failed to process manual AQI input' });
  }
});

export default router;
