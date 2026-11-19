/**
 * Client-side AQI constants and style helpers
 */

export const AQI_LEVELS = [
  { max: 50, label: 'Good', hindiLabel: 'अच्छा', color: '#10B981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-700', borderClass: 'border-emerald-300' },
  { max: 100, label: 'Moderate', hindiLabel: 'मध्यम', color: '#EAB308', bgClass: 'bg-yellow-500', textClass: 'text-yellow-700', borderClass: 'border-yellow-300' },
  { max: 150, label: 'Sensitive', hindiLabel: 'संवेदनशील', color: '#F97316', bgClass: 'bg-orange-500', textClass: 'text-orange-700', borderClass: 'border-orange-300' },
  { max: 200, label: 'Unhealthy', hindiLabel: 'अस्वस्थ', color: '#EF4444', bgClass: 'bg-red-500', textClass: 'text-red-700', borderClass: 'border-red-300' },
  { max: 300, label: 'Very Unhealthy', hindiLabel: 'अत्यंत अस्वस्थ', color: '#8B5CF6', bgClass: 'bg-purple-600', textClass: 'text-purple-700', borderClass: 'border-purple-300' },
  { max: 9999, label: 'Hazardous', hindiLabel: 'खतरनाक', color: '#881337', bgClass: 'bg-rose-900', textClass: 'text-rose-900', borderClass: 'border-rose-400' }
];

export function getAqiCategory(aqi) {
  const num = Math.round(Number(aqi) || 0);
  for (const level of AQI_LEVELS) {
    if (num <= level.max) return level;
  }
  return AQI_LEVELS[AQI_LEVELS.length - 1];
}
