const API_BASE = '/api';

/**
 * Search locations via geocoding API
 */
export async function searchLocations(query) {
  const res = await fetch(`${API_BASE}/aqi/geocode?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search locations');
  return res.json();
}

/**
 * Fetch live AQI and 24-hr hourly trend
 */
export async function getLiveAQI(lat, lon, cityName) {
  const res = await fetch(`${API_BASE}/aqi?lat=${lat}&lon=${lon}&city=${encodeURIComponent(cityName)}`);
  if (!res.ok) throw new Error('Failed to fetch AQI data');
  return res.json();
}

/**
 * Submit manual AQI fallback
 */
export async function submitManualAQI(aqi, cityName, pm25) {
  const res = await fetch(`${API_BASE}/aqi/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aqi, cityName, pm25 })
  });
  if (!res.ok) throw new Error('Failed to submit manual AQI');
  return res.json();
}

/**
 * Generate personalized AI action plan
 */
export async function generatePlan(aqiData, profile, language = 'en') {
  const res = await fetch(`${API_BASE}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aqiData, profile, language })
  });
  if (!res.ok) throw new Error('Failed to generate action plan');
  return res.json();
}

/**
 * Send grounded follow-up chat query
 */
export async function sendChatMessage(query, aqiData, profile, previousPlan, conversationHistory, language = 'en') {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, aqiData, profile, previousPlan, conversationHistory, language })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}
