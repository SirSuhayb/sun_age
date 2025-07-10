'use client';

import { useState, useEffect } from 'react';

interface OfflineStatus {
  isOnline: boolean;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
}

export function JournalOfflineEnhancements() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator?.onLine ?? true,
    pendingSyncCount: 0,
    lastSyncTime: null
  });

  useEffect(() => {
    // Listen for online/offline status changes
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      checkPendingEntries();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending local entries
    checkPendingEntries();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingEntries = () => {
    try {
      const stored = localStorage.getItem('solara_journal_entries');
      if (stored) {
        const entries = JSON.parse(stored);
        const localEntries = entries.filter((e: any) => e.preservation_status === 'local');
        setStatus(prev => ({ 
          ...prev, 
          pendingSyncCount: localEntries.length 
        }));
      }
    } catch (error) {
      console.error('Error checking pending entries:', error);
    }
  };

  const triggerBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Type assertion for Background Sync API
        await (registration as any).sync.register('journal-sync');
        console.log('🔄 Background sync registered for journal entries');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  };

  // Show status indicator
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!status.isOnline && (
        <div className="backdrop-blur-md bg-[#FFFCF2]/90 border border-gray-200 p-3 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="text-lg">🌙</div>
            <div>
              <div className="text-xs font-mono text-gray-500 tracking-widest uppercase">
                Offline Mode
              </div>
              <div className="text-sm text-gray-600">
                Journal saves locally
              </div>
            </div>
          </div>
          
          {status.pendingSyncCount > 0 && (
            <div className="mt-2 text-xs text-amber-600">
              {status.pendingSyncCount} entries pending sync
            </div>
          )}
        </div>
      )}

      {status.isOnline && status.pendingSyncCount > 0 && (
        <div className="backdrop-blur-md bg-[#FFFCF2]/90 border border-green-200 p-3 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="text-lg">🔄</div>
            <div>
              <div className="text-xs font-mono text-green-600 tracking-widest uppercase">
                Syncing Journal
              </div>
              <div className="text-sm text-gray-600">
                {status.pendingSyncCount} entries uploading...
              </div>
            </div>
          </div>
          
          <button
            onClick={triggerBackgroundSync}
            className="mt-2 text-xs btn-gold py-1 px-2 font-mono tracking-widest uppercase"
          >
            ⚡ Sync Now
          </button>
        </div>
      )}
    </div>
  );
}