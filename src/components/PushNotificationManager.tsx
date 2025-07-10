'use client';

import { useState, useEffect } from 'react';

interface NotificationPermission {
  state: 'default' | 'granted' | 'denied';
  subscription: PushSubscription | null;
}

export function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>({
    state: 'default',
    subscription: null
  });
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported(
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );

    if ('Notification' in window) {
      setPermission(prev => ({
        ...prev,
        state: Notification.permission
      }));
    }

    // Get existing subscription
    getExistingSubscription();
  }, []);

  const getExistingSubscription = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setPermission(prev => ({
          ...prev,
          subscription
        }));
      } catch (error) {
        console.error('Error getting push subscription:', error);
      }
    }
  };

  const requestPermission = async () => {
    if (!isSupported) return;

    try {
      const permission = await Notification.requestPermission();
      setPermission(prev => ({ ...prev, state: permission }));

      if (permission === 'granted') {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // You'll need to replace this with your actual VAPID public key
      const publicKey = 'YOUR_VAPID_PUBLIC_KEY';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      setPermission(prev => ({ ...prev, subscription }));

      // Send subscription to your server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          type: 'solara-milestones'
        }),
      });

      console.log('🔔 Subscribed to Solara notifications!');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  const unsubscribe = async () => {
    if (permission.subscription) {
      try {
        await permission.subscription.unsubscribe();
        setPermission(prev => ({ ...prev, subscription: null }));

        // Notify your server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: permission.subscription.endpoint
          }),
        });

        console.log('🔕 Unsubscribed from Solara notifications');
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  return (
    <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-md">
      <div className="text-lg font-serif font-bold mb-2" style={{ letterSpacing: '-0.06em' }}>
        🌟 Cosmic Milestone Alerts
      </div>
      
      <div className="text-xs font-mono text-gray-500 tracking-widest uppercase mb-4">
        Never miss a sol milestone
      </div>

      <div className="text-sm text-gray-600 mb-6">
        Get notified when you reach special cosmic milestones like:
        <div className="mt-2 space-y-1 text-xs">
          • 10,000 sol days
          • Mercury orbit completions  
          • Solar cycle anniversaries
          • Custom milestone reminders
        </div>
      </div>

      {permission.state === 'default' && (
        <button
          onClick={requestPermission}
          className="w-full btn-gold py-3 px-6 font-mono text-sm tracking-widest uppercase"
        >
          🔔 Enable Cosmic Alerts
        </button>
      )}

      {permission.state === 'granted' && !permission.subscription && (
        <button
          onClick={subscribeToPush}
          className="w-full btn-gold py-3 px-6 font-mono text-sm tracking-widest uppercase"
        >
          📡 Subscribe to Milestones
        </button>
      )}

      {permission.state === 'granted' && permission.subscription && (
        <div className="space-y-3">
          <div className="text-sm text-green-600 font-medium">
            ✅ Cosmic alerts enabled!
          </div>
          <button
            onClick={unsubscribe}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 font-mono text-sm tracking-widest uppercase hover:bg-gray-300 transition-colors"
          >
            🔕 Disable Alerts
          </button>
        </div>
      )}

      {permission.state === 'denied' && (
        <div className="text-sm text-red-600">
          🚫 Notifications blocked. Enable in browser settings to receive cosmic milestone alerts.
        </div>
      )}
    </div>
  );
}