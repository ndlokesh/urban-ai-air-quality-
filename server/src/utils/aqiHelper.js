/**
 * AQI Helper & Classification Module
 * Implements US EPA AQI standard bands, colors, health advisories, and breakpoints.
 */

export const AQI_BANDS = {
  GOOD: {
    min: 0,
    max: 50,
    label: 'Good',
    hindiLabel: 'अच्छा (सुरक्षित)',
    color: '#10B981', // Emerald 500
    bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    badgeColor: 'bg-emerald-500 text-white',
    severity: 'low',
    shortDescription: 'Air quality is satisfactory and poses little or no risk.',
    actionGuidance: 'Ideal conditions for outdoor exercise and airing out the home.'
  },
  MODERATE: {
    min: 51,
    max: 100,
    label: 'Moderate',
    hindiLabel: 'मध्यम',
    color: '#EAB308', // Yellow 500
    bgColor: 'bg-yellow-50 text-yellow-900 border-yellow-300',
    badgeColor: 'bg-yellow-500 text-slate-900',
    severity: 'moderate',
    shortDescription: 'Air quality is acceptable; unusually sensitive individuals should take precautions.',
    actionGuidance: 'Sensitive groups should consider limiting prolonged outdoor exertion.'
  },
  SENSITIVE: {
    min: 101,
    max: 150,
    label: 'Unhealthy for Sensitive Groups',
    hindiLabel: 'संवेदनशील समूहों के लिए अस्वस्थ',
    color: '#F97316', // Orange 500
    bgColor: 'bg-orange-50 text-orange-900 border-orange-300',
    badgeColor: 'bg-orange-500 text-white',
    severity: 'elevated',
    shortDescription: 'Members of sensitive groups (children, elderly, asthma) may experience health effects.',
    actionGuidance: 'Sensitive individuals must wear N95 outdoors and run indoor purifiers.'
  },
  UNHEALTHY: {
    min: 151,
    max: 200,
    label: 'Unhealthy',
    hindiLabel: 'अस्वस्थ',
    color: '#EF4444', // Red 500
    bgColor: 'bg-red-50 text-red-900 border-red-300',
    badgeColor: 'bg-red-500 text-white',
    severity: 'high',
    shortDescription: 'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.',
    actionGuidance: 'Avoid outdoor exercise, keep windows sealed, and use N95 masks when stepping out.'
  },
  VERY_UNHEALTHY: {
    min: 201,
    max: 300,
    label: 'Very Unhealthy',
    hindiLabel: 'अत्यंत अस्वस्थ',
    color: '#8B5CF6', // Purple 500
    bgColor: 'bg-purple-50 text-purple-900 border-purple-300',
    badgeColor: 'bg-purple-600 text-white',
    severity: 'very-high',
    shortDescription: 'Health alert: The risk of health effects is increased for everyone.',
    actionGuidance: 'Stay indoors, run air purifiers continuously, wet-mop floors, seal window gaps.'
  },
  HAZARDOUS: {
    min: 301,
    max: 9999,
    label: 'Hazardous',
    hindiLabel: 'खतरनाक (आपातकालीन)',
    color: '#881337', // Rose/Maroon 900
    bgColor: 'bg-rose-100 text-rose-950 border-rose-400',
    badgeColor: 'bg-rose-900 text-white',
    severity: 'hazardous',
    shortDescription: 'Health warning of emergency conditions: Everyone is more likely to be affected.',
    actionGuidance: 'Emergency smog conditions. Eliminate non-essential outdoor trips. Mandatory N95/FFP2 masks.'
  }
};

/**
 * Get AQI category band for a given AQI numerical value
 * @param {number} aqi 
 * @returns {object} AQI band info
 */
export function getAQIBand(aqi) {
  const num = Math.round(Number(aqi) || 0);
  if (num <= 50) return { ...AQI_BANDS.GOOD, aqi: num, key: 'GOOD' };
  if (num <= 100) return { ...AQI_BANDS.MODERATE, aqi: num, key: 'MODERATE' };
  if (num <= 150) return { ...AQI_BANDS.SENSITIVE, aqi: num, key: 'SENSITIVE' };
  if (num <= 200) return { ...AQI_BANDS.UNHEALTHY, aqi: num, key: 'UNHEALTHY' };
  if (num <= 300) return { ...AQI_BANDS.VERY_UNHEALTHY, aqi: num, key: 'VERY_UNHEALTHY' };
  return { ...AQI_BANDS.HAZARDOUS, aqi: num, key: 'HAZARDOUS' };
}

/**
 * Convert PM2.5 (µg/m³) to approximate US AQI using EPA breakpoint formula
 * @param {number} pm25 
 * @returns {number} Calculated US AQI
 */
export function pm25ToUsAqi(pm25) {
  const c = Math.max(0, Number(pm25) || 0);
  const breakpoints = [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
    { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 }
  ];

  for (const bp of breakpoints) {
    if (c >= bp.cLow && c <= bp.cHigh) {
      return Math.round(((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow);
    }
  }

  if (c > 500.4) {
    return Math.min(500, Math.round(c));
  }

  return 0;
}

/**
 * Identify dominant pollutant from concentrations
 * @param {object} pollutants 
 * @returns {string} Dominant pollutant name
 */
export function identifyDominantPollutant(pollutants = {}) {
  const pm25 = pollutants.pm2_5 || 0;
  const pm10 = pollutants.pm10 || 0;
  const no2 = pollutants.nitrogen_dioxide || 0;
  const o3 = pollutants.ozone || 0;

  // Compute normalized ratios against WHO 24-hr guideline thresholds
  // PM2.5: 15 µg/m³, PM10: 45 µg/m³, NO2: 25 µg/m³, O3: 100 µg/m³
  const rPm25 = pm25 / 15;
  const rPm10 = pm10 / 45;
  const rNo2 = no2 / 25;
  const rO3 = o3 / 100;

  const maxRatio = Math.max(rPm25, rPm10, rNo2, rO3);
  if (maxRatio === rPm25) return 'PM2.5';
  if (maxRatio === rPm10) return 'PM10';
  if (maxRatio === rNo2) return 'NO₂';
  if (maxRatio === rO3) return 'O₃';
  return 'PM2.5';
}
