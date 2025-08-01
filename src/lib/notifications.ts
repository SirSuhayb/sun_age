// Notification system for guidance reminders

export interface GuidanceReminder {
  id: string;
  title: string;
  prompt: string;
  scheduledFor: string; // ISO date string
  completed: boolean;
  userFid?: number; // For Farcaster notifications
}

export class NotificationManager {
  private static instance: NotificationManager;
  private storageKey = 'guidanceReminders';

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Check if notifications are enabled
  isNotificationEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Save guidance for later with reminder
  saveGuidanceForLater(guidanceId: string, title: string, prompt: string, userFid?: number): void {
    const reminders = this.getReminders();
    
    // Remove any existing reminder for this guidance
    const filteredReminders = reminders.filter(r => r.id !== guidanceId);
    
    // Add new reminder for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10 AM tomorrow
    
    const newReminder: GuidanceReminder = {
      id: guidanceId,
      title,
      prompt,
      scheduledFor: tomorrow.toISOString(),
      completed: false,
      userFid
    };

    filteredReminders.push(newReminder);
    localStorage.setItem(this.storageKey, JSON.stringify(filteredReminders));
  }

  // Get all reminders
  getReminders(): GuidanceReminder[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  // Mark guidance as completed
  markGuidanceCompleted(guidanceId: string): void {
    const reminders = this.getReminders();
    const updatedReminders = reminders.map(r => 
      r.id === guidanceId ? { ...r, completed: true } : r
    );
    localStorage.setItem(this.storageKey, JSON.stringify(updatedReminders));
  }

  // Get pending reminders for today
  getPendingReminders(): GuidanceReminder[] {
    const reminders = this.getReminders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return reminders.filter(r => {
      if (r.completed) return false;
      
      const reminderDate = new Date(r.scheduledFor);
      reminderDate.setHours(0, 0, 0, 0);
      
      return reminderDate.getTime() <= today.getTime();
    });
  }

  // Send notification for guidance reminder
  async sendGuidanceReminder(reminder: GuidanceReminder): Promise<void> {
    // Try Farcaster notification first if userFid is available
    if (reminder.userFid) {
      try {
        const { sendFarcasterNotification } = await import('~/lib/notifs');
        const success = await sendFarcasterNotification(reminder.userFid, {
          title: '🌞 Sol Oracle Guidance Reminder',
          body: `Time to complete your guidance: "${reminder.title}"`,
          targetUrl: `${window.location.origin}/surprise-me/guidance/${reminder.id}`
        });
        
        if (success) {
          console.log(`[NotificationManager] Farcaster notification sent successfully for guidance ${reminder.id}`);
          return;
        }
      } catch (error) {
        console.error(`[NotificationManager] Failed to send Farcaster notification for guidance ${reminder.id}:`, error);
      }
    }

    // Fallback to browser notification
    if (!this.isNotificationEnabled()) {
      console.log(`[NotificationManager] Browser notifications not enabled, skipping reminder for guidance ${reminder.id}`);
      return;
    }

    const notification = new Notification('🌞 Sol Oracle Guidance Reminder', {
      body: `Time to complete your guidance: "${reminder.title}"`,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: `guidance-${reminder.id}`,
      requireInteraction: true,
      actions: [
        {
          action: 'complete',
          title: 'Complete Now'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });

    notification.onclick = () => {
      window.open(`/surprise-me/guidance/${reminder.id}`, '_blank');
      notification.close();
    };

    notification.onaction = (event) => {
      if (event.action === 'complete') {
        window.open(`/surprise-me/guidance/${reminder.id}`, '_blank');
      }
      notification.close();
    };
  }

  // Check and send pending reminders
  async checkAndSendReminders(): Promise<void> {
    const pendingReminders = this.getPendingReminders();
    
    for (const reminder of pendingReminders) {
      await this.sendGuidanceReminder(reminder);
    }
  }

  // Clear old completed reminders (older than 7 days)
  cleanupOldReminders(): void {
    const reminders = this.getReminders();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeReminders = reminders.filter(r => {
      if (!r.completed) return true;
      
      const completedDate = new Date(r.scheduledFor);
      return completedDate.getTime() > sevenDaysAgo.getTime();
    });
    
    localStorage.setItem(this.storageKey, JSON.stringify(activeReminders));
  }
} 