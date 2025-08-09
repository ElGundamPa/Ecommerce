const { getRedis } = require('./redis');

/**
 * Middleware para obtener datos del cache
 * Se ejecuta antes del controlador
 */
async function cacheGet(req, res, next) {
  const redis = getRedis();
  if (!redis) {
    // Si Redis no está disponible, continuar sin cache
    return next();
  }
  
  try {
    // Generar clave de cache basada en la URL y query parameters
    const cacheKey = `cache:${req.method}:${req.originalUrl}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      // Cache hit - retornar datos cacheados
      const parsedData = JSON.parse(cachedData);
      res.setHeader('X-Cache', 'HIT');
      return res.json(parsedData);
    }
    
    // Cache miss - continuar al controlador
    res.setHeader('X-Cache', 'MISS');
    req.__cacheKey = cacheKey; // Guardar clave para usar en cacheSet
    next();
  } catch (error) {
    console.error('Error en cacheGet:', error);
    // En caso de error, continuar sin cache
    next();
  }
}

/**
 * Factory para crear middleware de cache set con TTL personalizado
 * Se ejecuta después del controlador
 */
function cacheSet(ttlSeconds = 60) {
  return (req, res, next) => {
    const redis = getRedis();
    if (!redis || !req.__cacheKey) {
      return next();
    }
    
    // Interceptar res.json para cachear la respuesta
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {
      // Solo cachear respuestas exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Cachear de forma asíncrona (no bloquear la respuesta)
        setImmediate(async () => {
          try {
            await redis.setex(req.__cacheKey, ttlSeconds, JSON.stringify(body));
          } catch (error) {
            console.error('Error al guardar en cache:', error);
          }
        });
      }
      
      // Enviar respuesta original
      return originalJson(body);
    };
    
    next();
  };
}

/**
 * Función helper para invalidar cache por patrón
 */
async function invalidateCache(pattern) {
  const redis = getRedis();
  if (!redis) return;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Invalidado cache: ${keys.length} claves eliminadas`);
    }
  } catch (error) {
    console.error('Error al invalidar cache:', error);
  }
}

/**
 * Función helper para invalidar cache de productos
 */
async function invalidateProductCache() {
  await invalidateCache('cache:GET:/api/products*');
}

/**
 * Función helper para invalidar cache de un producto específico
 */
async function invalidateProductByIdCache(productId) {
  await invalidateCache(`cache:GET:/api/products/${productId}*`);
  await invalidateProductCache(); // También invalidar listados
}

module.exports = {
  cacheGet,
  cacheSet,
  invalidateCache,
  invalidateProductCache,
  invalidateProductByIdCache
};
