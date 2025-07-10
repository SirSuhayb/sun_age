// Solara Service Worker - Offline Sol Age Tracking
const CACHE_NAME = 'solara-v1';
const OFFLINE_URL = '/offline';

// Assets to cache immediately when service worker installs
const ESSENTIAL_ASSETS = [
  '/',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/sunsun.png',
  '/noise.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('🌞 Solara Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching essential Solara assets');
        return cache.addAll(ESSENTIAL_ASSETS);
      })
      .then(() => {
        console.log('✅ Solara assets cached successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache Solara assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Solara Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Solara Service Worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - intelligent caching for Solara
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests and chrome-extension requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle different types of requests
  if (event.request.url.includes('/api/')) {
    // API requests: Network first, cache fallback
    event.respondWith(handleApiRequest(event.request));
  } else if (event.request.destination === 'image') {
    // Images: Cache first for speed
    event.respondWith(handleImageRequest(event.request));
  } else {
    // HTML pages: Network first with offline fallback
    event.respondWith(handlePageRequest(event.request));
  }
});

// Network first strategy for API calls (sol age calculations)
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📱 API request failed, checking cache for:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('💾 Serving cached API response');
      return cachedResponse;
    }
    
    // No cache available, return error
    throw error;
  }
}

// Cache first strategy for images
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🖼️ Image request failed:', request.url);
    // Could return a default offline image here
    throw error;
  }
}

// Network first with offline fallback for pages
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful HTML responses
    if (networkResponse.ok && request.destination === 'document') {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📄 Page request failed, checking cache for:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('💾 Serving cached page');
      return cachedResponse;
    }
    
    // No cache available, serve offline page for navigation requests
    if (request.destination === 'document') {
      console.log('🔌 Serving offline page');
      return cache.match(OFFLINE_URL);
    }
    
    throw error;
  }
}

// Background sync for journal entries and sol age calculations
self.addEventListener('sync', (event) => {
  if (event.tag === 'journal-sync') {
    console.log('📝 Background syncing journal entries...');
    event.waitUntil(syncJournalEntries());
  } else if (event.tag === 'solara-calc-sync') {
    console.log('🔄 Background syncing sol age calculations...');
    event.waitUntil(syncSolAgeCalculations());
  }
});

async function syncJournalEntries() {
  console.log('📝 Syncing offline journal entries');
  
  try {
    // Get local journal entries from localStorage
    const stored = self.localStorage?.getItem?.('solara_journal_entries');
    if (!stored) return;
    
    const entries = JSON.parse(stored);
    const localEntries = entries.filter(e => e.preservation_status === 'local');
    
    if (localEntries.length === 0) {
      console.log('📝 No local journal entries to sync');
      return;
    }
    
    console.log(`📝 Found ${localEntries.length} local journal entries to sync`);
    
    // Note: Actual migration would happen when user opens app
    // Service worker can't directly call the migration API without userFid
    // But we can notify the app to trigger sync
    
    // Send message to all clients to trigger sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'JOURNAL_SYNC_NEEDED',
        count: localEntries.length
      });
    });
    
  } catch (error) {
    console.error('📝 Error syncing journal entries:', error);
  }
}

async function syncSolAgeCalculations() {
  // This would sync any offline calculations when connection returns
  // Implementation depends on your data storage strategy
  console.log('📊 Syncing offline sol age calculations');
}

// Handle push notifications (for future milestone alerts)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('🔔 Push notification received:', data);
    
    const options = {
      body: data.body || 'New cosmic milestone available!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'solara-notification',
      data: {
        url: data.url || '/',
        timestamp: Date.now()
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Solara',
        options
      )
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window/tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

console.log('🌞 Solara Service Worker loaded and ready!');