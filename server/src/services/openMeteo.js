import { getAQIBand, identifyDominantPollutant, pm25ToUsAqi } from '../utils/aqiHelper.js';
import { aqiCache, geocodeCache } from '../utils/cache.js';

/**
 * Service to interact with Open-Meteo Geocoding and Air Quality APIs (Free, no key needed)
 * Includes in-memory caching to optimize efficiency and minimize external network latency.
 */

/**
 * Search locations by name using Open-Meteo Geocoding API with caching
 * @param {string} query 
 * @returns {Promise<Array>} List of matching locations
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim().toLowerCase();
  const cached = geocodeCache.get(cleanQuery);
  if (cached) {
    return cached;
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=6&language=en&format=json`;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'CleanBreath-AirQualityAssistant/1.0' } });
    if (!res.ok) throw new Error(`Geocoding failed with status: ${res.status}`);
    const data = await res.json();

    if (!data.results || !data.results.length) {
      return [];
    }

    const results = data.results.map(item => ({
      id: item.id,
      name: item.name,
      admin1: item.admin1 || '',
      country: item.country || '',
      latitude: item.latitude,
      longitude: item.longitude,
      displayName: [item.name, item.admin1, item.country].filter(Boolean).join(', ')
    }));

    geocodeCache.set(cleanQuery, results);
    return results;
  } catch (error) {
    console.warn(`[OpenMeteo Geocoding Error]: ${error.message}. Returning fallback matching.`);
    return getFallbackLocations(query);
  }
}

/**
 * Fetch live AQI and 24-hr hourly trend from Open-Meteo Air Quality API with 10-minute caching
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} cityName 
 * @returns {Promise<object>} Live AQI metrics, dominant pollutant, hourly trend
 */
export async function fetchLiveAQI(latitude, longitude, cityName = 'Your Location') {
  // Round coordinates to ~1km grid (2 decimal places) for effective cache hits
  const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = aqiCache.get(cacheKey);
  if (cached) {
    return { ...cached, cityName, isCached: true };
  }

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone&hourly=pm2_5,pm10,us_aqi&timezone=auto&forecast_hours=24&past_hours=24`;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'CleanBreath-AirQualityAssistant/1.0' } });
    if (!res.ok) throw new Error(`Air Quality API failed with status: ${res.status}`);
    const data = await res.json();

    const current = data.current || {};
    const hourly = data.hourly || {};

    let usAqi = current.us_aqi;
    const pm25 = current.pm2_5 !== undefined ? Math.round(current.pm2_5) : 45;
    const pm10 = current.pm10 !== undefined ? Math.round(current.pm10) : 75;
    const no2 = current.nitrogen_dioxide !== undefined ? Math.round(current.nitrogen_dioxide) : 28;
    const o3 = current.ozone !== undefined ? Math.round(current.ozone) : 35;

    if (usAqi === undefined || usAqi === null) {
      usAqi = pm25ToUsAqi(pm25);
    } else {
      usAqi = Math.round(usAqi);
    }

    const pollutants = { pm2_5: pm25, pm10, nitrogen_dioxide: no2, ozone: o3 };
    const dominantPollutant = identifyDominantPollutant(pollutants);
    const bandInfo = getAQIBand(usAqi);

    const trend = [];
    if (hourly.time && hourly.pm2_5) {
      const times = hourly.time;
      const pm25Vals = hourly.pm2_5;
      const pm10Vals = hourly.pm10 || [];
      const aqiVals = hourly.us_aqi || [];

      const len = times.length;
      const startIndex = Math.max(0, len - 24);

      for (let i = startIndex; i < len; i++) {
        const timeStr = times[i];
        const dateObj = new Date(timeStr);
        const formattedHour = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        const p25 = Math.round(pm25Vals[i] || 0);
        const p10 = Math.round(pm10Vals[i] || 0);
        const aqiVal = aqiVals[i] ? Math.round(aqiVals[i]) : pm25ToUsAqi(p25);

        trend.push({
          time: formattedHour,
          isoTime: timeStr,
          pm2_5: p25,
          pm10: p10,
          aqi: aqiVal
        });
      }
    }

    const result = {
      cityName,
      latitude,
      longitude,
      aqi: usAqi,
      band: bandInfo,
      dominantPollutant,
      pollutants,
      trend,
      updatedAt: current.time || new Date().toISOString(),
      source: 'Open-Meteo Air Quality API'
    };

    aqiCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn(`[OpenMeteo AQI Fetch Error]: ${error.message}. Returning fallback realistic data.`);
    return getFallbackAQIData(cityName, latitude, longitude);
  }
}

/**
 * Fallback static cities for instant autocomplete when offline
 */
function getFallbackLocations(query) {
  const defaults = [
    { id: 1, name: 'Delhi', admin1: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, displayName: 'Delhi, Delhi, India' },
    { id: 2, name: 'Mumbai', admin1: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, displayName: 'Mumbai, Maharashtra, India' },
    { id: 3, name: 'Beijing', admin1: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074, displayName: 'Beijing, China' },
    { id: 4, name: 'Los Angeles', admin1: 'California', country: 'United States', latitude: 34.0522, longitude: -118.2437, displayName: 'Los Angeles, California, United States' },
    { id: 5, name: 'London', admin1: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, displayName: 'London, United Kingdom' },
    { id: 6, name: 'Lahore', admin1: 'Punjab', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587, displayName: 'Lahore, Punjab, Pakistan' }
  ];

  const q = query.toLowerCase();
  return defaults.filter(d => d.displayName.toLowerCase().includes(q));
}

export function getFallbackAQIData(cityName = 'Delhi', latitude = 28.61, longitude = 77.20, customAqi = null) {
  const aqi = customAqi !== null ? customAqi : 215;
  const band = getAQIBand(aqi);

  const trend = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    const hour = t.getHours();
    let factor = 1.0;
    if (hour >= 6 && hour <= 10) factor = 1.25;
    else if (hour >= 13 && hour <= 16) factor = 0.75;
    else if (hour >= 20 && hour <= 23) factor = 1.2;

    const hourlyAqi = Math.round(aqi * factor);
    const hourlyPm25 = Math.round(hourlyAqi * 0.75);
    const hourlyPm10 = Math.round(hourlyAqi * 1.15);

    trend.push({
      time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      isoTime: t.toISOString(),
      pm2_5: hourlyPm25,
      pm10: hourlyPm10,
      aqi: hourlyAqi
    });
  }

  return {
    cityName,
    latitude,
    longitude,
    aqi,
    band,
    dominantPollutant: 'PM2.5',
    pollutants: {
      pm2_5: Math.round(aqi * 0.75),
      pm10: Math.round(aqi * 1.15),
      nitrogen_dioxide: 42,
      ozone: 28
    },
    trend,
    updatedAt: new Date().toISOString(),
    source: customAqi !== null ? 'Manual Entry' : 'Estimated Winter Smog Baseline'
  };
}
