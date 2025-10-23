import { logInfo, logError } from './logger';

// Push notification service for Revolution Network
export class PushNotificationService {
  private vapidPublicKey: string;
  private vapidPrivateKey: string;
  private serverUrl: string;

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
    this.serverUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }

  // Send push notification to a specific user
  async sendToUser(userId: string, notification: PushNotificationPayload) {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notification,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`);
      }

      logInfo('Push notification sent to user', { userId, notification });
      return await response.json();
    } catch (error) {
      logError(error as Error, { userId, notification });
      throw error;
    }
  }

  // Send push notification to multiple users
  async sendToUsers(userIds: string[], notification: PushNotificationPayload) {
    try {
      const response = await fetch('/api/notifications/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds,
          notification,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send bulk notifications: ${response.statusText}`);
      }

      logInfo('Bulk push notifications sent', { userIds: userIds.length, notification });
      return await response.json();
    } catch (error) {
      logError(error as Error, { userIds, notification });
      throw error;
    }
  }

  // Send push notification to all subscribed users
  async sendToAll(notification: PushNotificationPayload) {
    try {
      const response = await fetch('/api/notifications/send-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send notifications to all: ${response.statusText}`);
      }

      logInfo('Push notification sent to all users', { notification });
      return await response.json();
    } catch (error) {
      logError(error as Error, { notification });
      throw error;
    }
  }

  // Schedule push notification for later
  async scheduleNotification(
    userId: string,
    notification: PushNotificationPayload,
    scheduledFor: Date
  ) {
    try {
      const response = await fetch('/api/notifications/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notification,
          scheduledFor: scheduledFor.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to schedule notification: ${response.statusText}`);
      }

      logInfo('Push notification scheduled', { userId, notification, scheduledFor });
      return await response.json();
    } catch (error) {
      logError(error as Error, { userId, notification, scheduledFor });
      throw error;
    }
  }

  // Create notification payload
  createNotificationPayload(
    title: string,
    body: string,
    options: NotificationOptions = {}
  ): PushNotificationPayload {
    return {
      title,
      body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge-72x72.png',
      image: options.image,
      tag: options.tag || 'revnet-notification',
      data: options.data || {},
      actions: options.actions || [
        {
          action: 'open',
          title: 'Open',
          icon: '/icons/open-24x24.png',
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/close-24x24.png',
        },
      ],
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      vibrate: options.vibrate || [200, 100, 200],
      timestamp: Date.now(),
    };
  }

  // Notification templates
  getNotificationTemplates() {
    return {
      projectUpdate: (projectTitle: string, updateTitle: string) =>
        this.createNotificationPayload(
          `Project Update: ${projectTitle}`,
          `New update: ${updateTitle}`,
          {
            tag: 'project-update',
            data: { type: 'project-update', projectTitle },
            requireInteraction: true,
          }
        ),

      letterCompleted: (letterNumber: number, letterTitle: string) =>
        this.createNotificationPayload(
          'Letter Completed!',
          `You've completed Letter ${letterNumber}: ${letterTitle}`,
          {
            tag: 'letter-completed',
            data: { type: 'letter-completed', letterNumber, letterTitle },
            requireInteraction: false,
          }
        ),

      donationReceived: (amount: number, projectTitle: string) =>
        this.createNotificationPayload(
          'Donation Received!',
          `You received $${amount} for ${projectTitle}`,
          {
            tag: 'donation-received',
            data: { type: 'donation-received', amount, projectTitle },
            requireInteraction: true,
          }
        ),

      chatMessage: (senderName: string, message: string) =>
        this.createNotificationPayload(
          `New message from ${senderName}`,
          message.length > 100 ? `${message.substring(0, 100)}...` : message,
          {
            tag: 'chat-message',
            data: { type: 'chat-message', senderName },
            requireInteraction: false,
          }
        ),

      systemAnnouncement: (title: string, message: string) =>
        this.createNotificationPayload(
          title,
          message,
          {
            tag: 'system-announcement',
            data: { type: 'system-announcement' },
            requireInteraction: true,
          }
        ),

      reminder: (title: string, message: string) =>
        this.createNotificationPayload(
          title,
          message,
          {
            tag: 'reminder',
            data: { type: 'reminder' },
            requireInteraction: false,
          }
        ),
    };
  }
}

// Notification payload interface
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

// Notification action interface
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Notification subscription interface
export interface NotificationSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification preferences interface
export interface NotificationPreferences {
  userId: string;
  projectUpdates: boolean;
  letterCompleted: boolean;
  donations: boolean;
  chatMessages: boolean;
  systemAnnouncements: boolean;
  reminders: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  createdAt: Date;
  updatedAt: Date;
}

// Notification analytics interface
export interface NotificationAnalytics {
  notificationId: string;
  userId: string;
  type: string;
  sentAt: Date;
  deliveredAt?: Date;
  clickedAt?: Date;
  dismissedAt?: Date;
  actionTaken?: string;
  error?: string;
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService();

// Utility functions
export const formatNotificationBody = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
};

export const createNotificationUrl = (type: string, id: string): string => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  switch (type) {
    case 'project-update':
      return `${baseUrl}/projects/${id}`;
    case 'letter-completed':
      return `${baseUrl}/letters/${id}`;
    case 'donation-received':
      return `${baseUrl}/projects/${id}`;
    case 'chat-message':
      return `${baseUrl}/chat`;
    case 'system-announcement':
      return `${baseUrl}/announcements`;
    default:
      return `${baseUrl}/dashboard`;
  }
};

export const validateNotificationPayload = (payload: PushNotificationPayload): boolean => {
  if (!payload.title || !payload.body) {
    return false;
  }
  
  if (payload.title.length > 100) {
    return false;
  }
  
  if (payload.body.length > 500) {
    return false;
  }
  
  return true;
};

export default pushNotificationService;
