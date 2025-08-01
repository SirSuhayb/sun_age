'use client';

import { useEffect } from 'react';
import { NotificationManager } from '~/lib/notifications';
import { useFrameSDK } from '~/hooks/useFrameSDK';

export function NotificationChecker() {
  const { context, isInFrame } = useFrameSDK();
  
  useEffect(() => {
    const checkReminders = async () => {
      const notificationManager = NotificationManager.getInstance();
      
      // Clean up old reminders
      notificationManager.cleanupOldReminders();
      
      // Check and send pending reminders
      await notificationManager.checkAndSendReminders();
    };

    // Check reminders when component mounts
    checkReminders();

    // Set up periodic checking (every 30 minutes)
    const interval = setInterval(checkReminders, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Update existing reminders with userFid if we're in a Farcaster frame
  useEffect(() => {
    if (isInFrame && context?.user?.fid) {
      const updateRemindersWithFid = () => {
        const notificationManager = NotificationManager.getInstance();
        const reminders = notificationManager.getReminders();
        
        // Update reminders that don't have userFid
        const updatedReminders = reminders.map(reminder => 
          !reminder.userFid ? { ...reminder, userFid: context.user.fid } : reminder
        );
        
        if (JSON.stringify(reminders) !== JSON.stringify(updatedReminders)) {
          localStorage.setItem('guidanceReminders', JSON.stringify(updatedReminders));
          console.log(`[NotificationChecker] Updated ${updatedReminders.length} reminders with userFid: ${context.user.fid}`);
        }
      };

      updateRemindersWithFid();
    }
  }, [isInFrame, context?.user?.fid]);

  return null; // This component doesn't render anything
} 