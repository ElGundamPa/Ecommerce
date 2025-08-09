const Redis = require('ioredis');

let redis = null;

function getRedis() {
  // Si no hay URL de Redis configurada, retornar null (cache deshabilitado)
  if (!process.env.REDIS_URL) {
    return null;
  }
  
  // Crear conexión singleton
  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true, // No conectar hasta que sea necesario
        enableReadyCheck: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      redis.on('error', (err) => {
        console.error('Redis error:', err);
        // No lanzar error, simplemente log y continuar sin cache
      });

      redis.on('connect', () => {
        console.log('✅ Conectado a Redis');
      });

      redis.on('close', () => {
        console.log('❌ Desconectado de Redis');
      });
    } catch (error) {
      console.error('Error al inicializar Redis:', error);
      return null;
    }
  }
  
  return redis;
}

// Función helper para cerrar la conexión (útil para tests)
function closeRedis() {
  if (redis) {
    redis.disconnect();
    redis = null;
  }
}

// Helper para verificar si Redis está disponible
async function isRedisAvailable() {
  const redisClient = getRedis();
  if (!redisClient) return false;
  
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error('Redis no disponible:', error.message);
    return false;
  }
}

module.exports = { 
  getRedis, 
  closeRedis, 
  isRedisAvailable 
};
