const NodeCache = require('node-cache');

// Configurar caché en memoria
const cache = new NodeCache({
  stdTTL: 300, // 5 minutos por defecto
  checkperiod: 60, // Revisar expiración cada minuto
  useClones: false
});

// Middleware de caché
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Interceptar la respuesta para cachearla
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, data, duration);
      originalJson.call(this, data);
    };

    next();
  };
};

// Limpiar caché específico
const clearCache = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  cache.del(matchingKeys);
};

// Limpiar todo el caché
const clearAllCache = () => {
  cache.flushAll();
};

// Middleware para invalidar caché en operaciones de escritura
const invalidateCache = (patterns = []) => {
  return (req, res, next) => {
    // Interceptar después de la operación exitosa
    const originalJson = res.json;
    res.json = function(data) {
      if (data.success) {
        patterns.forEach(pattern => {
          clearCache(pattern);
        });
      }
      originalJson.call(this, data);
    };
    next();
  };
};

// Estadísticas del caché
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    keys: cache.keys()
  };
};

module.exports = {
  cache,
  cacheMiddleware,
  clearCache,
  clearAllCache,
  invalidateCache,
  getCacheStats
};
