import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getAQIBand, pm25ToUsAqi, identifyDominantPollutant } from '../src/utils/aqiHelper.js';

describe('AQI Helper Tests', () => {
  it('correctly maps AQI values to EPA categories', () => {
    assert.strictEqual(getAQIBand(25).key, 'GOOD');
    assert.strictEqual(getAQIBand(50).key, 'GOOD');
    assert.strictEqual(getAQIBand(51).key, 'MODERATE');
    assert.strictEqual(getAQIBand(100).key, 'MODERATE');
    assert.strictEqual(getAQIBand(101).key, 'SENSITIVE');
    assert.strictEqual(getAQIBand(150).key, 'SENSITIVE');
    assert.strictEqual(getAQIBand(151).key, 'UNHEALTHY');
    assert.strictEqual(getAQIBand(200).key, 'UNHEALTHY');
    assert.strictEqual(getAQIBand(201).key, 'VERY_UNHEALTHY');
    assert.strictEqual(getAQIBand(300).key, 'VERY_UNHEALTHY');
    assert.strictEqual(getAQIBand(301).key, 'HAZARDOUS');
    assert.strictEqual(getAQIBand(450).key, 'HAZARDOUS');
  });

  it('contains valid color hex and labels for each category', () => {
    const hazardous = getAQIBand(350);
    assert.ok(hazardous.color.startsWith('#'));
    assert.strictEqual(hazardous.label, 'Hazardous');
    assert.ok(hazardous.hindiLabel.includes('खतरनाक'));
  });

  it('converts PM2.5 concentrations to US AQI accurately', () => {
    // 0 µg/m³ -> 0 AQI
    assert.strictEqual(pm25ToUsAqi(0), 0);
    // 12 µg/m³ -> 50 AQI
    assert.strictEqual(pm25ToUsAqi(12), 50);
    // 35.4 µg/m³ -> 100 AQI
    assert.strictEqual(pm25ToUsAqi(35.4), 100);
    // 55.4 µg/m³ -> 150 AQI
    assert.strictEqual(pm25ToUsAqi(55.4), 150);
    // 150.4 µg/m³ -> 200 AQI
    assert.strictEqual(pm25ToUsAqi(150.4), 200);
  });

  it('identifies dominant pollutant from relative WHO guidelines', () => {
    const dominantPM25 = identifyDominantPollutant({
      pm2_5: 120, // 8x WHO limit
      pm10: 80,   // 1.7x WHO limit
      nitrogen_dioxide: 15,
      ozone: 30
    });
    assert.strictEqual(dominantPM25, 'PM2.5');

    const dominantOzone = identifyDominantPollutant({
      pm2_5: 5,
      pm10: 10,
      nitrogen_dioxide: 10,
      ozone: 180 // 1.8x WHO limit
    });
    assert.strictEqual(dominantOzone, 'O₃');
  });
});
