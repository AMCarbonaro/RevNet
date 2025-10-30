import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'friend_request' | 'friend_accepted' | 'dm_message' | 'group_dm_message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);

  public notifications$ = this.notifications.asObservable();
  public unreadCount$ = this.unreadCount.asObservable();

  constructor() {
    // Listen for browser notifications permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  // Add a new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notifications.value;
    this.notifications.next([newNotification, ...currentNotifications]);
    this.updateUnreadCount();

    // Show browser notification if permission is granted
    this.showBrowserNotification(newNotification);
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
  }

  // Remove notification
  removeNotification(notificationId: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.filter(
      notification => notification.id !== notificationId
    );
    this.notifications.next(updatedNotifications);
    this.updateUnreadCount();
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications.next([]);
    this.updateUnreadCount();
  }

  // Friend request notification
  showFriendRequestNotification(fromUsername: string): void {
    this.addNotification({
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${fromUsername} wants to be your friend`,
      data: { fromUsername }
    });
  }

  // Friend accepted notification
  showFriendAcceptedNotification(byUsername: string): void {
    this.addNotification({
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `${byUsername} accepted your friend request`,
      data: { byUsername }
    });
  }

  // DM message notification
  showDMMessageNotification(fromUsername: string, message: string, channelId: string): void {
    this.addNotification({
      type: 'dm_message',
      title: `Message from ${fromUsername}`,
      message: message.length > 50 ? message.substring(0, 50) + '...' : message,
      data: { fromUsername, channelId, message }
    });
  }

  // Group DM message notification
  showGroupDMMessageNotification(groupName: string, fromUsername: string, message: string, channelId: string): void {
    this.addNotification({
      type: 'group_dm_message',
      title: `${groupName}`,
      message: `${fromUsername}: ${message.length > 40 ? message.substring(0, 40) + '...' : message}`,
      data: { groupName, fromUsername, channelId, message }
    });
  }

  // Private methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notifications.value.filter(n => !n.read).length;
    this.unreadCount.next(unreadCount);
  }

  private showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);

      // Handle click to focus window
      browserNotification.onclick = () => {
        window.focus();
        this.markAsRead(notification.id);
        browserNotification.close();
      };
    }
  }
}