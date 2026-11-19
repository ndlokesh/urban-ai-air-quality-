/**
 * Impact Calculation Engine & Scientific Assumptions Model
 * Provides deterministic emission savings and personal exposure reduction estimates.
 */

// Baseline assumptions documented for transparency and scientific rigor
export const IMPACT_ASSUMPTIONS = {
  COMMUTE_DISTANCE_KM_DEFAULT: 10,
  EMISSIONS: {
    CAR_PETROL_DIESEL_G_PER_KM: 170, // Average ICE passenger vehicle (IPCC / EPA avg)
    TWO_WHEELER_PETROL_G_PER_KM: 55,  // Typical 100-150cc commuter motorcycle/scooter
    PUBLIC_TRANSIT_METRO_G_PER_KM: 30, // Electric mass transit passenger allocation
    ELECTRIC_BUS_G_PER_KM: 35,
    WALK_CYCLE_G_PER_KM: 0,
    WORK_FROM_HOME_G_PER_KM: 0
  },
  PM25_EXPOSURE_REDUCTION: {
    N95_MASK_OUTDOOR_TRANSIT_PCT: 90,     // Properly fitted N95/FFP2 respirator reduces inhaled PM2.5 by ~90-95%
    HEPA_PURIFIER_CLOSED_ROOM_PCT: 80,   // Standard HEPA filter CADR reduces PM2.5 in sealed bedroom by 75-85%
    DIY_BOX_FAN_MERV13_PCT: 70,          // Corsi-Rosenthal / Box fan + MERV-13 filter efficiency
    WINDOW_SEAL_WEATHERSTRIP_PCT: 45,    // Foam/rubber draft tape reduces ambient smog infiltration by 40-50%
    VENTILATION_TIMING_POST_NOON_PCT: 35,// Venting only during 12 PM - 3 PM avoids peak morning inversion smog
    WET_MOPPING_PCT: 55,                 // Wet mopping vs dry sweeping eliminates dust re-suspension
    INDUCTION_COOKING_PCT: 85            // Eliminates gas combustion NO2 and ultrafine particulate spikes
  }
};

/**
 * Calculate avoided CO2 emissions for a commute swap
 * @param {string} fromMode - 'car' | 'two-wheeler'
 * @param {string} toMode - 'public-transit' | 'walk-cycle' | 'work-from-home'\n * @param {number} distanceKm - roundtrip or single trip distance
 * @returns {object} { avoidedGramsCo2, explanation, assumptions }
 */
export function calculateCommuteEmissionsAvoided(fromMode = 'car', toMode = 'public-transit', distanceKm = 10) {
  const km = Math.max(1, Number(distanceKm) || 10);
  
  let fromRate = IMPACT_ASSUMPTIONS.EMISSIONS.CAR_PETROL_DIESEL_G_PER_KM;
  if (fromMode === 'two-wheeler') fromRate = IMPACT_ASSUMPTIONS.EMISSIONS.TWO_WHEELER_PETROL_G_PER_KM;

  let toRate = IMPACT_ASSUMPTIONS.EMISSIONS.PUBLIC_TRANSIT_METRO_G_PER_KM;
  if (toMode === 'walk-cycle' || toMode === 'work-from-home') toRate = 0;

  const savedPerKm = Math.max(0, fromRate - toRate);
  const totalAvoidedGrams = Math.round(savedPerKm * km);

  return {
    avoidedGramsCo2: totalAvoidedGrams,
    avoidedKgCo2: Number((totalAvoidedGrams / 1000).toFixed(2)),
    assumptions: `Based on ~${fromRate} g CO2/km for ${fromMode} vs ~${toRate} g CO2/km for ${toMode} over ${km} km.`,
    isApproximate: true
  };
}

/**
 * Calculate personal exposure reduction for a specific mitigation action
 * @param {string} actionType 
 * @param {number} ambientAqi 
 * @returns {object} { exposureReductionPct, explanation, assumptions }
 */
export function calculateExposureReduction(actionType, ambientAqi = 150) {
  let reductionPct = 50;
  let explanation = '';
  let assumptions = '';

  switch (actionType) {
    case 'n95_mask':
      reductionPct = IMPACT_ASSUMPTIONS.PM25_EXPOSURE_REDUCTION.N95_MASK_OUTDOOR_TRANSIT_PCT;
      explanation = 'Blocks ≥95% of airborne particulate matter when sealed properly over nose and mouth.';
      assumptions = 'Assumes NIOSH-approved N95 or EN149 FFP2 without exhalation valves and good facial seal.';
      break;
    case 'hepa_purifier':
      reductionPct = IMPACT_ASSUMPTIONS.PM25_EXPOSURE_REDUCTION.HEPA_PURIFIER_CLOSED_ROOM_PCT;
      explanation = 'Achieves high clean air delivery rate (CADR) in an enclosed room within 60 minutes.';
      assumptions = 'Assumes True HEPA filter running in a room sized appropriately for the CADR rating with doors closed.';
      break;
    case 'diy_box_filter':
      reductionPct = IMPACT_ASSUMPTIONS.PM25_EXPOSURE_REDUCTION.DIY_BOX_FAN_MERV13_PCT;
      explanation = 'Low-cost box fan fitted with MERV-13 filter dramatically captures fine PM2.5 particulates.';
      assumptions = 'Assumes 20-inch standard box fan taped securely to a 20x20 MERV-13 HVAC filter without edge air leaks.';
      break;
    case 'window_sealing':
      reductionPct = IMPACT_ASSUMPTIONS.PM25_EXPOSURE_REDUCTION.WINDOW_SEAL_WEATHERSTRIP_PCT;
      explanation = 'Weatherstripping or foam tape blocks dirty outdoor air drafting through window and door jambs.';
      assumptions = 'Tested reduction in ambient particulate infiltration during severe winter temperature inversions.';
      break;
    case 'ventilation_timing':
      reductionPct = IMPACT_ASSUMPTIONS.PM25_EXPOSURE_REDUCTION.VENTILATION_TIMING_POST_NOON_PCT;
      explanation = 'Opening windows strictly between 12 PM - 3 PM avoids trapped ground-level winter morning smog.';
      assumptions = 'Ground boundary layer rises in the afternoon due to solar warming, dispersing peak surface PM2.5.';
      break;
    case 'wet_mopping':
      reductionPct = IMPACT_ASSUMPTIONS.PM25_EXPOSURE_REDUCTION.WET_MOPPING_PCT;
      explanation = 'Wet mopping captures settled micro-particles instead of kicking them back into breathing zone.';
      assumptions = 'Dry sweeping re-suspends up to 60% of PM10 and PM2.5 indoor dust into respiratory level.';
      break;
    case 'induction_cooking':
      reductionPct = IMPACT_ASSUMPTIONS.PM25_EXPOSURE_REDUCTION.INDUCTION_COOKING_PCT;
      explanation = 'Eliminates gas flame combustion byproducts (NO2, CO, ultrafine soot particles).';
      assumptions = 'Unvented gas stoves can cause indoor NO2 spikes exceeding outdoor EPA limits within 20 minutes.';
      break;
    default:
      reductionPct = 40;
      explanation = 'Practical preventative measure reducing overall ambient air intake.';
      assumptions = 'Standard indoor air mitigation average.';
  }

  return {
    actionType,
    reductionPct,
    explanation,
    assumptions,
    isApproximate: true
  };
}

/**
 * Calculate overall Clean Air Score based on AQI and completed mitigation actions
 * @param {number} ambientAqi 
 * @param {Array<string>} completedActionIds 
 * @returns {number} Score from 0 to 100
 */
export function calculateCleanAirScore(ambientAqi = 100, completedActionIds = []) {
  // Base score: 100 at 0 AQI, dropping as AQI worsens
  const rawBase = 100 - (Math.min(ambientAqi, 400) * 0.15); // e.g. at AQI 200: 100 - 30 = 70 base
  const baseScore = Math.max(30, Math.round(rawBase));

  // Each action completed adds +6 to +12 points up to 100
  const actionsBonus = Math.min(50, completedActionIds.length * 10);
  const totalScore = Math.min(100, baseScore + actionsBonus);

  return totalScore;
}
