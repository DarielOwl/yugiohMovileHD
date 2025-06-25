// Nombre de la caché que vamos a usar.
// Al cambiar este valor manualmente, forzamos la instalación de una nueva versión del Service Worker.
const CACHE_NAME = 'pwa-yugioh-mobile-v1';

/**
 * Evento 'install'
 * Este evento se dispara cuando el Service Worker se instala por primera vez
 * o cuando se detecta una nueva versión del archivo `sw.js`.
 */
self.addEventListener('install', (event) => {
  console.log(`Service Worker instalado ${CACHE_NAME}`);

  // self.skipWaiting() fuerza que este Service Worker se active inmediatamente
  // sin esperar a que se cierren todas las pestañas con el anterior SW.
  self.skipWaiting();

  // Abrimos la caché con el nombre especificado y almacenamos archivos clave para que estén disponibles offline.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
     return cache.addAll([
        './',
        './HomeView/index.html',
        './HomeView/home.js',
        './HomeView/home.css',

        './ForbiddenView/forbidden.html',
        './ForbiddenView/forbidden.js',
        './ForbiddenView/forbidden.css',

        './CardView/card.html',
        './CardView/card.js',
        './CardView/card.css',

        './AddView/add.html',
        './AddView/add.js',
        './AddView/add.css',

        './db/db.js',

        './manifest.json',

        './imagenes/icons/icon_256.png',
        './imagenes/icons/icon_512.png'
      ]);
    })
  );
});

/**
 * Evento 'activate'
 * Este evento se dispara cuando el Service Worker se activa.
 * Aquí es donde limpiamos cachés antiguas que ya no son necesarias.
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');

  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          // Si el nombre de la caché no coincide con la versión actual, la eliminamos
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );

  // clients.claim() permite que el SW tome control inmediato de las pestañas abiertas.
  // Sin esto, el nuevo SW solo tomaría el control después de recargar la página.
  clients.claim();
});

/**
 * Evento 'fetch'
 * Este evento intercepta todas las solicitudes que hace la página.
 * Intenta responder con un recurso cacheado y, si no lo encuentra, hace una petición a la red.
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request) // Busca si el recurso está en caché
      .then((response) => {
        // Si existe en caché, lo devuelve. Si no, lo descarga de la red.
        return response || fetch(event.request);
      })
  );
});
