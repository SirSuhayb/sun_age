'use client';

import { useEffect } from 'react';
import { OfflineDataManager } from '../lib/offlineDataManager';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      .then((registration) => {
        console.log('🌞 Solara Service Worker registered successfully:', registration.scope);
        
        // Initialize offline data cache
        const offlineManager = OfflineDataManager.getInstance();
        offlineManager.initializeOfflineCache().catch(error => {
          console.warn('⚠️ Offline cache initialization failed:', error);
        });
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('🔄 New Service Worker installing...');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('✨ New Service Worker available! Reload to update.');
                // Could show a toast notification here to reload
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('📦 Cache updated:', event.data.payload);
        }
      });

      // Sync offline caches when coming back online
      const offlineManager = OfflineDataManager.getInstance();
      const handleOnline = () => {
        console.log('🌐 Back online - syncing offline caches...');
        offlineManager.syncWhenOnline().catch(error => {
          console.warn('⚠️ Cache sync failed:', error);
        });
      };
      
      window.addEventListener('online', handleOnline);
      
      // Cleanup listener
      return () => {
        window.removeEventListener('online', handleOnline);
      };
    } else {
      console.log('⚠️ Service Workers not supported in this browser');
    }
  }, []);

  return null; // This component doesn't render anything
}