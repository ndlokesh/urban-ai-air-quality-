import { describe, it } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:5000/api';

describe('CleanBreath End-to-End API Verification', () => {
  it('1. Verifies API Health Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.strictEqual(data.service, 'CleanBreath API');
  });

  it('2. Verifies Open-Meteo Geocoding Autocomplete', async () => {
    const res = await fetch(`${BASE_URL}/aqi/geocode?query=Delhi`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
    assert.ok(data[0].name.toLowerCase().includes('delhi'));
    assert.ok(typeof data[0].latitude === 'number');
    assert.ok(typeof data[0].longitude === 'number');
  });

  it('3. Verifies Live AQI and 24-hr Diurnal Trend', async () => {
    const res = await fetch(`${BASE_URL}/aqi?lat=28.65195&lon=77.23149&city=Delhi`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.cityName, 'Delhi');
    assert.ok(typeof data.aqi === 'number');
    assert.ok(data.aqi > 0);
    assert.ok(data.band && data.band.label);
    assert.ok(data.dominantPollutant);
    assert.ok(data.pollutants && typeof data.pollutants.pm2_5 === 'number');
    assert.ok(Array.isArray(data.trend));
    assert.ok(data.trend.length > 0);
    assert.ok(data.trend[0].time && typeof data.trend[0].pm2_5 === 'number');
  });

  it('4. Verifies Graceful Manual AQI Fallback', async () => {
    const res = await fetch(`${BASE_URL}/aqi/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aqi: 245, cityName: 'Test Smog Basin' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.cityName, 'Test Smog Basin');
    assert.strictEqual(data.aqi, 245);
    assert.strictEqual(data.band.key, 'VERY_UNHEALTHY');
    assert.strictEqual(data.trend.length, 24);
  });

  it('5. Verifies AI Action Plan Generation with Strict JSON Schema (English)', async () => {
    const payload = {
      aqiData: {
        cityName: 'Delhi',
        aqi: 175,
        dominantPollutant: 'PM2.5',
        pollutants: { pm2_5: 150, pm10: 160 },
        band: { label: 'Unhealthy' }
      },
      profile: {
        hasChildren: true,
        hasElderly: false,
        hasAsthma: true,
        hasPets: false,
        commuteMode: 'car',
        homeType: 'apartment',
        hasPurifier: false,
        windowsSeal: true,
        cookingFuel: 'gas',
        budgetLevel: 'medium'
      },
      language: 'en'
    };

    const res = await fetch(`${BASE_URL}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 200);
    const plan = await res.json();

    // Verify all 5 required sections
    assert.ok(plan.riskSummary);
    assert.ok(plan.riskSummary.headline);
    assert.ok(plan.riskSummary.details);
    assert.ok(plan.riskSummary.vulnerableImpact);

    assert.ok(Array.isArray(plan.dailyRoutine));
    assert.ok(plan.dailyRoutine.length >= 4);
    assert.ok(plan.dailyRoutine[0].timeBlock);
    assert.ok(plan.dailyRoutine[0].mitigation);

    assert.ok(Array.isArray(plan.iaqHacks));
    assert.ok(plan.iaqHacks.length >= 3);
    assert.ok(plan.iaqHacks[0].title);
    assert.ok(plan.iaqHacks[0].cost);
    assert.ok(plan.iaqHacks[0].effectiveness);

    assert.ok(Array.isArray(plan.sustainableAlternatives));
    assert.ok(plan.sustainableAlternatives.length >= 3);
    assert.ok(plan.sustainableAlternatives[0].cleanSwap);

    assert.ok(Array.isArray(plan.impactExplainer));
    assert.ok(plan.impactExplainer.length >= 2);
    assert.ok(plan.impactExplainer[0].actionTitle);
    assert.ok(plan.impactExplainer[0].assumptions);
  });

  it('6. Verifies AI Action Plan Generation in Hindi (हिंदी)', async () => {
    const payload = {
      aqiData: {
        cityName: 'दिल्ली',
        aqi: 220,
        dominantPollutant: 'PM2.5',
        pollutants: { pm2_5: 180 },
        band: { label: 'Very Unhealthy', hindiLabel: 'अत्यंत अस्वस्थ' }
      },
      profile: {
        hasChildren: true,
        hasAsthma: true,
        commuteMode: 'two-wheeler',
        budgetLevel: 'low'
      },
      language: 'hi'
    };

    const res = await fetch(`${BASE_URL}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 200);
    const plan = await res.json();
    assert.ok(plan.riskSummary.headline.includes('एक्यूआई') || plan.riskSummary.headline.includes('220'));
    assert.ok(plan.dailyRoutine.length > 0);
  });

  it('7. Verifies Grounded Follow-Up Chat (Safe Inquiry)', async () => {
    const payload = {
      query: 'Is it safe for my child to play outdoors this evening?',
      aqiData: {
        cityName: 'Delhi',
        aqi: 175,
        band: { label: 'Unhealthy' }
      },
      profile: {
        hasChildren: true,
        hasAsthma: true
      },
      language: 'en'
    };

    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 200);
    const chat = await res.json();
    assert.ok(chat.answer);
    assert.strictEqual(chat.hasMedicalConcern, false);
    assert.ok(chat.answer.toLowerCase().includes('not safe') || chat.answer.toLowerCase().includes('child'));
  });

  it('8. Verifies Strict Medical Safety Guardrail in Chat', async () => {
    const payload = {
      query: 'I am wheezing severely and have a painful cough with chest tightness.',
      aqiData: {
        cityName: 'Delhi',
        aqi: 210,
        band: { label: 'Very Unhealthy' }
      },
      profile: {
        hasAsthma: true
      },
      language: 'en'
    };

    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 200);
    const chat = await res.json();
    assert.ok(chat.answer);
    assert.strictEqual(chat.hasMedicalConcern, true);
    // Must contain urgent medical advisory directing user to a healthcare professional
    assert.ok(
      chat.answer.toLowerCase().includes('doctor') ||
      chat.answer.toLowerCase().includes('physician') ||
      chat.answer.toLowerCase().includes('medical')
    );
  });
});
