import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateCommuteEmissionsAvoided,
  calculateExposureReduction,
  calculateCleanAirScore
} from '../src/utils/impactCalc.js';

describe('Impact Calculation Tests', () => {
  it('calculates avoided CO2 emissions for 10km car-to-metro swap', () => {
    const result = calculateCommuteEmissionsAvoided('car', 'public-transit', 10);
    // (170 - 30) * 10 = 1400 g CO2 = 1.4 kg CO2
    assert.strictEqual(result.avoidedGramsCo2, 1400);
    assert.strictEqual(result.avoidedKgCo2, 1.4);
    assert.strictEqual(result.isApproximate, true);
    assert.ok(result.assumptions.includes('170 g CO2/km'));
  });

  it('calculates avoided CO2 emissions for two-wheeler to walking', () => {
    const result = calculateCommuteEmissionsAvoided('two-wheeler', 'walk-cycle', 5);
    // (55 - 0) * 5 = 275 g CO2
    assert.strictEqual(result.avoidedGramsCo2, 275);
    assert.strictEqual(result.avoidedKgCo2, 0.28);
  });

  it('returns valid exposure reductions and explanations for N95 and HEPA', () => {
    const n95 = calculateExposureReduction('n95_mask');
    assert.strictEqual(n95.reductionPct, 90);
    assert.ok(n95.explanation.length > 0);
    assert.ok(n95.assumptions.includes('N95'));

    const hepa = calculateExposureReduction('hepa_purifier');
    assert.strictEqual(hepa.reductionPct, 80);
  });

  it('computes dynamic clean air score within 0 to 100 range', () => {
    const baseScore = calculateCleanAirScore(200, []);
    assert.ok(baseScore >= 30 && baseScore <= 100);

    const improvedScore = calculateCleanAirScore(200, ['action1', 'action2', 'action3']);
    assert.ok(improvedScore > baseScore);
    assert.ok(improvedScore <= 100);
  });
});
