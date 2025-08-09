const CACHE_VERSION = '2.0.0';
const STATIC_CACHE = `static-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-v${CACHE_VERSION}`;
const API_CACHE = `api-v${CACHE_VERSION}`;

// Archivos para precache (se cargan durante la instalación)
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  // Se agregarán automáticamente los assets de build
];

// URLs que siempre van a la red (no se cachean)
const NETWORK_ONLY_URLS = [
  '/api/auth/login',
  '/api/orders',
  '/api/health',
  '/metrics'
];

// TTL para diferentes tipos de cache (en segundos)
const CACHE_TTL = {
  API: 5 * 60,      // 5 minutos para API
  IMAGES: 24 * 60 * 60, // 24 horas para imágenes
  STATIC: 7 * 24 * 60 * 60 // 7 días para recursos estáticos
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        console.log('Service Worker: Precacheando archivos...');
        
        // Intentar cachear todos los archivos, pero no fallar si alguno falla
        const cachePromises = PRECACHE_URLS.map(async (url) => {
          try {
            await cache.add(url);
            console.log(`✅ Cacheado: ${url}`);
          } catch (error) {
            console.warn(`⚠️ No se pudo cachear: ${url}`, error);
          }
        });
        
        await Promise.all(cachePromises);
        console.log('Service Worker: Precache completado');
        
        // Forzar activación inmediata
        await self.skipWaiting();
      } catch (error) {
        console.error('Service Worker: Error en instalación', error);
      }
    })()
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  
  event.waitUntil(
    (async () => {
      try {
        // Limpiar caches antiguos
        const cacheNames = await caches.keys();
        const validCaches = [STATIC_CACHE, RUNTIME_CACHE, API_CACHE];
        
        const deletePromises = cacheNames.map((cacheName) => {
          if (!validCaches.includes(cacheName)) {
            console.log(`🗑️ Eliminando cache antiguo: ${cacheName}`);
            return caches.delete(cacheName);
          }
        });
        
        await Promise.all(deletePromises);
        
        // Limpiar entradas de cache expiradas
        await cleanExpiredCacheEntries();
        
        console.log('Service Worker: Activación completada');
        
        // Tomar control de todas las pestañas
        await self.clients.claim();
      } catch (error) {
        console.error('Service Worker: Error en activación', error);
      }
    })()
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests GET de nuestro origen
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // Network-only para URLs específicas
  if (NETWORK_ONLY_URLS.some(pattern => url.pathname.includes(pattern))) {
    return;
  }

  // Estrategias por tipo de recurso
  if (url.pathname.startsWith('/api/')) {
    // API calls: Network First con cache temporal
    event.respondWith(networkFirstWithTTL(request, API_CACHE, CACHE_TTL.API));
  } else if (isStaticAsset(request)) {
    // Assets estáticos: Cache First con TTL largo
    event.respondWith(cacheFirstWithTTL(request, STATIC_CACHE, CACHE_TTL.STATIC));
  } else if (isImageRequest(request)) {
    // Imágenes: Cache First con TTL medio
    event.respondWith(cacheFirstWithTTL(request, RUNTIME_CACHE, CACHE_TTL.IMAGES));
  } else {
    // Otros recursos: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

// Funciones helper para clasificar requests
function isStaticAsset(request) {
  return request.destination === 'style' ||
         request.destination === 'script' ||
         request.destination === 'font' ||
         request.url.includes('/static/');
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

// Función para limpiar entradas de cache expiradas
async function cleanExpiredCacheEntries() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response && isCacheEntryExpired(response)) {
        await cache.delete(request);
        console.log(`🧹 Eliminada entrada expirada: ${request.url}`);
      }
    }
  }
}

// Verificar si una entrada de cache ha expirado
function isCacheEntryExpired(response) {
  const cacheTimestamp = response.headers.get('sw-cache-timestamp');
  const maxAge = response.headers.get('sw-max-age');
  
  if (!cacheTimestamp || !maxAge) {
    return false;
  }
  
  const age = Date.now() - parseInt(cacheTimestamp);
  return age > parseInt(maxAge) * 1000;
}

// Agregar headers de cache a la respuesta
function addCacheHeaders(response, maxAge) {
  const headers = new Headers(response.headers);
  headers.set('sw-cache-timestamp', Date.now().toString());
  headers.set('sw-max-age', maxAge.toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

// Estrategia: Cache First con TTL
async function cacheFirstWithTTL(request, cacheName, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Verificar si el cache es válido
    if (cachedResponse && !isCacheEntryExpired(cachedResponse)) {
      return cachedResponse;
    }
    
    // Si no hay cache válido, ir a la red
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseWithHeaders = addCacheHeaders(networkResponse.clone(), maxAge);
      cache.put(request, responseWithHeaders);
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback a página offline para documentos
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) return offlineResponse;
    }
    throw error;
  }
}

// Estrategia: Network First con TTL
async function networkFirstWithTTL(request, cacheName, maxAge) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseWithHeaders = addCacheHeaders(networkResponse.clone(), maxAge);
      cache.put(request, responseWithHeaders);
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback al cache si existe y es válido
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isCacheEntryExpired(cachedResponse)) {
      // Agregar header para indicar que viene del cache
      const headers = new Headers(cachedResponse.headers);
      headers.set('x-served-from', 'cache');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }
    
    // Retornar respuesta de error para API calls
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Sin conexión a internet',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 
          'Content-Type': 'application/json',
          'x-served-from': 'service-worker'
        }
      }
    );
  }
}

// Estrategia: Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Actualizar cache en segundo plano
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Si falla la red, no hacer nada (el cache se mantiene)
    });
  
  // Retornar cache inmediatamente si existe, sino esperar a la red
  if (cachedResponse) {
    // No esperar al fetchPromise, solo ejecutarlo
    fetchPromise;
    return cachedResponse;
  }
  
  return fetchPromise;
}

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronización en segundo plano', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Función para sincronización en segundo plano
async function doBackgroundSync() {
  try {
    // Sincronizar carrito offline
    const cartData = await getOfflineCart();
    if (cartData && cartData.items.length > 0) {
      // Enviar datos del carrito al servidor
      await syncCartWithServer(cartData);
    }
  } catch (error) {
    console.error('Error en sincronización:', error);
  }
}

// Función para obtener carrito offline
async function getOfflineCart() {
  try {
    const response = await caches.match('/api/cart/offline');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error obteniendo carrito offline:', error);
  }
  return null;
}

// Función para sincronizar carrito con servidor
async function syncCartWithServer(cartData) {
  try {
    const response = await fetch('/api/cart/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartData)
    });
    
    if (response.ok) {
      // Limpiar carrito offline después de sincronización exitosa
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.delete('/api/cart/offline');
    }
  } catch (error) {
    console.error('Error sincronizando carrito:', error);
  }
}

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificación push recibida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver más',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/favicon.ico'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Ecommerce App', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notificación clickeada');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
