import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from './auth';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
}

class PushNotificationService {
  private fcmToken: string | null = null;
  private listeners: ((notification: PushNotification) => void)[] = [];

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<void> {
    try {
      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Push notification permission granted');

        // Get FCM token
        this.fcmToken = await messaging().getToken();
        console.log('FCM Token:', this.fcmToken);

        // Store token for server registration
        await this.registerToken();

        // Set up message handlers
        this.setupMessageHandlers();

        // Listen for token refresh
        messaging().onTokenRefresh(async (token) => {
          this.fcmToken = token;
          await this.registerToken();
        });

      } else {
        console.log('Push notification permission denied');
      }
    } catch (error) {
      console.error('Push notification initialization error:', error);
    }
  }

  /**
   * Register FCM token with server
   */
  private async registerToken(): Promise<void> {
    if (!this.fcmToken) return;

    try {
      const token = await authService.getToken();
      if (!token) return;

      const axios = require('axios');
      await axios.post('https://revolutionnetwork.com/api/notifications/register', {
        fcmToken: this.fcmToken,
        platform: Platform.OS,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('FCM token registered successfully');
    } catch (error) {
      console.error('FCM token registration error:', error);
    }
  }

  /**
   * Set up message handlers
   */
  private setupMessageHandlers(): void {
    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      
      const notification: PushNotification = {
        id: remoteMessage.messageId || Date.now().toString(),
        title: remoteMessage.notification?.title || 'Revolution Network',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data,
        timestamp: Date.now(),
        read: false
      };

      // Store notification locally
      await this.storeNotification(notification);

      // Show alert for foreground messages
      Alert.alert(notification.title, notification.body, [
        { text: 'OK', onPress: () => this.markAsRead(notification.id) }
      ]);

      // Notify listeners
      this.notifyListeners(notification);
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage);
      
      const notification: PushNotification = {
        id: remoteMessage.messageId || Date.now().toString(),
        title: remoteMessage.notification?.title || 'Revolution Network',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data,
        timestamp: Date.now(),
        read: false
      };

      await this.storeNotification(notification);
    });

    // Handle notification opened app
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // Handle initial notification (app opened from quit state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Initial notification:', remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });
  }

  /**
   * Handle notification tap
   */
  private handleNotificationTap(remoteMessage: any): void {
    const notification: PushNotification = {
      id: remoteMessage.messageId || Date.now().toString(),
      title: remoteMessage.notification?.title || 'Revolution Network',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data,
      timestamp: Date.now(),
      read: false
    };

    // Mark as read
    this.markAsRead(notification.id);

    // Navigate based on notification data
    if (notification.data?.screen) {
      // Navigate to specific screen
      this.navigateToScreen(notification.data.screen, notification.data.params);
    }
  }

  /**
   * Navigate to specific screen
   */
  private navigateToScreen(screen: string, params?: any): void {
    // This would integrate with your navigation system
    console.log('Navigate to:', screen, params);
  }

  /**
   * Store notification locally
   */
  private async storeNotification(notification: PushNotification): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      
      notifications.unshift(notification);
      
      // Keep only last 100 notifications
      if (notifications.length > 100) {
        notifications.splice(100);
      }
      
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  /**
   * Get stored notifications
   */
  async getNotifications(): Promise<PushNotification[]> {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );
      
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updatedNotifications = notifications.map(notification =>
        ({ ...notification, read: true })
      );
      
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem('notifications');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Subscribe to notification events
   */
  subscribe(listener: (notification: PushNotification) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(notification: PushNotification): void {
    this.listeners.forEach(listener => listener(notification));
  }

  /**
   * Get FCM token
   */
  getToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
