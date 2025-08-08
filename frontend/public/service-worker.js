const CACHE_NAME = 'ecommerce-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Archivos para cache estático
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error en instalación', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Eliminando cache antiguo', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activación completada');
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia: Cache First para archivos estáticos
  if (request.method === 'GET' && isStaticFile(request)) {
    event.respondWith(cacheFirst(request));
  }
  // Estrategia: Network First para API calls
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
  }
  // Estrategia: Stale While Revalidate para otros recursos
  else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Función para determinar si es un archivo estático
function isStaticFile(request) {
  return request.destination === 'style' ||
         request.destination === 'script' ||
         request.destination === 'image' ||
         request.destination === 'font';
}

// Estrategia: Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Retornar página offline si no hay conexión
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Estrategia: Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar respuesta de error para API calls
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Sin conexión a internet' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estrategia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
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
