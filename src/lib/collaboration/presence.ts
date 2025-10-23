export interface UserPresenceData {
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  userColor: string;
  status: 'active' | 'idle' | 'away' | 'offline';
  lastSeen: Date;
  currentPage?: string;
  currentDocument?: string;
  cursorPosition?: number;
  selection?: {
    start: number;
    end: number;
  };
  isTyping?: boolean;
  metadata?: Record<string, any>;
}

export interface PresenceState {
  users: Map<string, UserPresenceData>;
  subscribers: Set<(users: UserPresenceData[]) => void>;
}

class PresenceManager {
  private state: PresenceState;
  private localUserId: string | null = null;
  private idleTimeout: NodeJS.Timeout | null = null;
  private awayTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      users: new Map(),
      subscribers: new Set()
    };
  }

  /**
   * Initialize presence for local user
   */
  public initialize(user: Partial<UserPresenceData>): void {
    if (!user.userId) {
      throw new Error('User ID is required');
    }

    this.localUserId = user.userId;

    const presenceData: UserPresenceData = {
      userId: user.userId,
      userName: user.userName || 'Anonymous',
      userEmail: user.userEmail,
      userAvatar: user.userAvatar,
      userColor: user.userColor || this.generateRandomColor(),
      status: 'active',
      lastSeen: new Date(),
      currentPage: user.currentPage,
      currentDocument: user.currentDocument,
      metadata: user.metadata || {}
    };

    this.state.users.set(user.userId, presenceData);
    this.notifySubscribers();
    this.startIdleDetection();
    this.startHeartbeat();
  }

  /**
   * Update local user presence
   */
  public updatePresence(updates: Partial<UserPresenceData>): void {
    if (!this.localUserId) {
      console.error('Presence not initialized');
      return;
    }

    const currentPresence = this.state.users.get(this.localUserId);
    if (!currentPresence) return;

    const updatedPresence: UserPresenceData = {
      ...currentPresence,
      ...updates,
      lastSeen: new Date(),
      status: 'active'
    };

    this.state.users.set(this.localUserId, updatedPresence);
    this.notifySubscribers();
    this.resetIdleTimers();
  }

  /**
   * Update cursor position
   */
  public updateCursor(position: number, selection?: { start: number; end: number }): void {
    this.updatePresence({
      cursorPosition: position,
      selection
    });
  }

  /**
   * Set typing indicator
   */
  public setTyping(isTyping: boolean): void {
    this.updatePresence({ isTyping });
  }

  /**
   * Add remote user presence
   */
  public addUser(user: UserPresenceData): void {
    this.state.users.set(user.userId, user);
    this.notifySubscribers();
  }

  /**
   * Update remote user presence
   */
  public updateUser(userId: string, updates: Partial<UserPresenceData>): void {
    const user = this.state.users.get(userId);
    if (!user) return;

    const updatedUser: UserPresenceData = {
      ...user,
      ...updates,
      lastSeen: new Date()
    };

    this.state.users.set(userId, updatedUser);
    this.notifySubscribers();
  }

  /**
   * Remove user presence
   */
  public removeUser(userId: string): void {
    this.state.users.delete(userId);
    this.notifySubscribers();
  }

  /**
   * Get all active users
   */
  public getActiveUsers(): UserPresenceData[] {
    return Array.from(this.state.users.values()).filter(
      user => user.status === 'active' || user.status === 'idle'
    );
  }

  /**
   * Get specific user presence
   */
  public getUser(userId: string): UserPresenceData | undefined {
    return this.state.users.get(userId);
  }

  /**
   * Get all users in document
   */
  public getUsersInDocument(documentId: string): UserPresenceData[] {
    return Array.from(this.state.users.values()).filter(
      user => user.currentDocument === documentId
    );
  }

  /**
   * Get typing users
   */
  public getTypingUsers(): UserPresenceData[] {
    return Array.from(this.state.users.values()).filter(
      user => user.isTyping && user.userId !== this.localUserId
    );
  }

  /**
   * Subscribe to presence changes
   */
  public subscribe(callback: (users: UserPresenceData[]) => void): () => void {
    this.state.subscribers.add(callback);
    
    // Immediately notify with current state
    callback(Array.from(this.state.users.values()));

    // Return unsubscribe function
    return () => {
      this.state.subscribers.delete(callback);
    };
  }

  /**
   * Clean up and disconnect
   */
  public destroy(): void {
    this.stopIdleDetection();
    this.stopHeartbeat();
    
    if (this.localUserId) {
      this.updatePresence({ status: 'offline' });
    }

    this.state.users.clear();
    this.state.subscribers.clear();
  }

  /**
   * Private: Notify all subscribers
   */
  private notifySubscribers(): void {
    const users = Array.from(this.state.users.values());
    this.state.subscribers.forEach(callback => callback(users));
  }

  /**
   * Private: Start idle detection
   */
  private startIdleDetection(): void {
    this.resetIdleTimers();

    // Listen for user activity
    if (typeof window !== 'undefined') {
      const resetActivity = () => this.resetIdleTimers();
      
      window.addEventListener('mousemove', resetActivity);
      window.addEventListener('keydown', resetActivity);
      window.addEventListener('click', resetActivity);
      window.addEventListener('scroll', resetActivity);
    }
  }

  /**
   * Private: Reset idle timers
   */
  private resetIdleTimers(): void {
    // Clear existing timers
    if (this.idleTimeout) clearTimeout(this.idleTimeout);
    if (this.awayTimeout) clearTimeout(this.awayTimeout);

    // Set to idle after 5 minutes of inactivity
    this.idleTimeout = setTimeout(() => {
      this.updatePresence({ status: 'idle' });
    }, 5 * 60 * 1000);

    // Set to away after 15 minutes of inactivity
    this.awayTimeout = setTimeout(() => {
      this.updatePresence({ status: 'away' });
    }, 15 * 60 * 1000);
  }

  /**
   * Private: Stop idle detection
   */
  private stopIdleDetection(): void {
    if (this.idleTimeout) clearTimeout(this.idleTimeout);
    if (this.awayTimeout) clearTimeout(this.awayTimeout);
  }

  /**
   * Private: Start heartbeat
   */
  private startHeartbeat(): void {
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.localUserId) {
        const user = this.state.users.get(this.localUserId);
        if (user) {
          user.lastSeen = new Date();
          this.state.users.set(this.localUserId, user);
        }
      }
    }, 30 * 1000);
  }

  /**
   * Private: Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  /**
   * Private: Generate random color for user
   */
  private generateRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA15E', '#BC6C25', '#F4A261', '#E76F51', '#264653'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Clean up stale users (offline > 5 minutes)
   */
  public cleanupStaleUsers(): void {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    this.state.users.forEach((user, userId) => {
      if (userId === this.localUserId) return;

      const timeSinceLastSeen = now.getTime() - user.lastSeen.getTime();
      if (timeSinceLastSeen > staleThreshold) {
        this.state.users.delete(userId);
      }
    });

    this.notifySubscribers();
  }

  /**
   * Get presence statistics
   */
  public getStatistics() {
    const users = Array.from(this.state.users.values());
    
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      idle: users.filter(u => u.status === 'idle').length,
      away: users.filter(u => u.status === 'away').length,
      offline: users.filter(u => u.status === 'offline').length,
      typing: users.filter(u => u.isTyping).length
    };
  }
}

// Singleton instance
let presenceManagerInstance: PresenceManager | null = null;

export function getPresenceManager(): PresenceManager {
  if (!presenceManagerInstance) {
    presenceManagerInstance = new PresenceManager();
  }
  return presenceManagerInstance;
}

export function resetPresenceManager(): void {
  if (presenceManagerInstance) {
    presenceManagerInstance.destroy();
  }
  presenceManagerInstance = null;
}

export default PresenceManager;
