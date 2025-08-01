'use client';

import { useEffect } from 'react';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import { NotificationManager } from '~/lib/notifications';

export function FarcasterNotificationHandler() {
  const { context, isInFrame, sdk } = useFrameSDK();

  useEffect(() => {
    if (!isInFrame || !context?.user?.fid || !sdk) return;

    const setupFarcasterNotifications = async () => {
      try {
        console.log('[FarcasterNotificationHandler] Setting up Farcaster notifications for user:', context.user.fid);
        
        // Check if user has notification permissions in Farcaster
        const hasNotifications = await sdk.actions.requestNotifications();
        console.log('[FarcasterNotificationHandler] Notification permission result:', hasNotifications);
        
        if (hasNotifications) {
          // Update existing guidance reminders with userFid
          const notificationManager = NotificationManager.getInstance();
          const reminders = notificationManager.getReminders();
          
          const updatedReminders = reminders.map(reminder => 
            !reminder.userFid ? { ...reminder, userFid: context.user.fid } : reminder
          );
          
          if (JSON.stringify(reminders) !== JSON.stringify(updatedReminders)) {
            localStorage.setItem('guidanceReminders', JSON.stringify(updatedReminders));
            console.log(`[FarcasterNotificationHandler] Updated ${updatedReminders.length} reminders with userFid: ${context.user.fid}`);
          }
        }
      } catch (error) {
        console.error('[FarcasterNotificationHandler] Error setting up Farcaster notifications:', error);
      }
    };

    setupFarcasterNotifications();
  }, [isInFrame, context?.user?.fid, sdk]);

  return null; // This component doesn't render anything
} 