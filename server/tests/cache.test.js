import { describe, it } from 'node:test';
import assert from 'node:assert';
import { aqiCache, geocodeCache } from '../src/utils/cache.js';

describe('Cache & Efficiency Tests', () => {
  it('stores and retrieves cached items accurately', () => {
    aqiCache.set('test_city', { aqi: 125, name: 'Testville' });
    const cached = aqiCache.get('test_city');
    assert.strictEqual(cached.aqi, 125);
    assert.strictEqual(cached.name, 'Testville');
  });

  it('returns null for nonexistent keys', () => {
    const nonExistent = aqiCache.get('missing_key_xyz');
    assert.strictEqual(nonExistent, null);
  });

  it('correctly isolates geocoding cache', () => {
    geocodeCache.set('delhi', [{ id: 1, name: 'Delhi' }]);
    const results = geocodeCache.get('delhi');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].name, 'Delhi');
  });
});
