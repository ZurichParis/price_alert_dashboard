const CACHE_NAME = 'crypto-dashboard-v1';
const HISTORICAL_DATA_CACHE = 'crypto-historical-data-v1';

// Cache duration: 1 hour for historical data (since it doesn't change frequently)
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Clean up old caches
          if (cacheName !== CACHE_NAME && cacheName !== HISTORICAL_DATA_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only cache historical data API calls (not current price calls)
  if (isHistoricalDataRequest(url)) {
    event.respondWith(handleHistoricalDataRequest(event.request));
  }
});

function isHistoricalDataRequest(url) {
  // Cache CoinGecko historical data requests
  return (
    url.hostname === 'api.coingecko.com' && 
    url.pathname.includes('/market_chart') &&
    !url.pathname.includes('/simple/price') // Don't cache current price requests
  ) || (
    // Also cache proxy requests for historical data
    url.hostname === 'api.allorigins.win' &&
    url.searchParams.get('url') && 
    url.searchParams.get('url').includes('market_chart')
  );
}

async function handleHistoricalDataRequest(request) {
  const cache = await caches.open(HISTORICAL_DATA_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get('sw-cached-time'));
    const now = new Date();
    
    // Check if cached data is still valid (within cache duration)
    if (now.getTime() - cachedDate.getTime() < CACHE_DURATION) {
      console.log('Serving historical data from cache:', request.url);
      return cachedResponse;
    } else {
      console.log('Cache expired, removing old data:', request.url);
      await cache.delete(request);
    }
  }
  
  try {
    console.log('Fetching fresh historical data:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      // Clone the response before caching
      const responseToCache = response.clone();
      
      // Add cache timestamp header
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-time', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      // Cache the response
      cache.put(request, cachedResponse);
      console.log('Cached historical data:', request.url);
    }
    
    return response;
  } catch (error) {
    console.error('Network request failed, checking cache:', error);
    
    // Try to serve stale cache data if network fails
    const staleResponse = await cache.match(request);
    if (staleResponse) {
      console.log('Serving stale cache data due to network error');
      return staleResponse;
    }
    
    // Return network error if no cache available
    throw error;
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(HISTORICAL_DATA_CACHE).then(() => {
        console.log('Historical data cache cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    event.waitUntil(
      getCacheInfo().then(info => {
        event.ports[0].postMessage({ cacheInfo: info });
      })
    );
  }
});

async function getCacheInfo() {
  const cache = await caches.open(HISTORICAL_DATA_CACHE);
  const keys = await cache.keys();
  
  const info = {
    totalEntries: keys.length,
    entries: keys.map(req => ({
      url: req.url,
      method: req.method
    }))
  };
  
  return info;
}