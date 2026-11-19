/**
 * High-performance In-Memory TTL Cache
 * Boosts API efficiency and prevents redundant external network requests.
 */

class SimpleCache {
  constructor(defaultTtlMs = 600000) { // 10 minutes default
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    // Avoid unbounded memory growth
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const aqiCache = new SimpleCache(10 * 60 * 1000); // 10 minutes cache for AQI
export const geocodeCache = new SimpleCache(60 * 60 * 1000); // 1 hour cache for Geocoding
