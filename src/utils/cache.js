const NodeCache = require('node-cache');

// Cache for 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

const setupCache = () => {
  console.log('📦 Cache initialized with 5-minute TTL');
};

const getCachedData = (key) => {
  return cache.get(key);
};

const setCachedData = (key, data, ttl = 300) => {
  return cache.set(key, data, ttl);
};

const clearCache = () => {
  cache.flushAll();
  console.log('🗑️ Cache cleared');
};

module.exports = {
  setupCache,
  getCachedData,
  setCachedData,
  clearCache
};
