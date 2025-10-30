import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { RevNetActions } from '../store/actions/revnet.actions';
import { selectCurrentUser } from '../store/selectors/revnet.selectors';

export enum UserStatus {
  ONLINE = 'online',
  AWAY = 'away',
  DND = 'dnd', // Do Not Disturb
  INVISIBLE = 'invisible'
}

export interface Activity {
  type: 'playing' | 'listening' | 'watching' | 'streaming';
  name: string;
  details?: string;
  state?: string;
  url?: string;
  applicationId?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

export interface CustomStatus {
  text: string;
  emoji?: {
    name: string;
    id?: string;
    animated?: boolean;
  };
  expiresAt?: number;
}

export interface UserPresence {
  status: UserStatus;
  customStatus?: CustomStatus;
  activities: Activity[];
  clientStatus: {
    desktop?: UserStatus;
    mobile?: UserStatus;
    web?: UserStatus;
  };
  lastSeen: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private currentPresence$ = new BehaviorSubject<UserPresence>({
    status: UserStatus.ONLINE,
    activities: [],
    clientStatus: {
      web: UserStatus.ONLINE
    },
    lastSeen: Date.now()
  });

  private statusHistory$ = new BehaviorSubject<UserPresence[]>([]);
  private isAway = false;
  private awayTimer: any = null;
  private lastActivity = Date.now();

  constructor(private store: Store) {
    this.initializeStatusTracking();
    this.setupActivityTracking();
  }

  // Status Management
  getCurrentPresence(): Observable<UserPresence> {
    return this.currentPresence$.asObservable();
  }

  getStatusHistory(): Observable<UserPresence[]> {
    return this.statusHistory$.asObservable();
  }

  setStatus(status: UserStatus): void {
    const currentPresence = this.currentPresence$.value;
    const newPresence: UserPresence = {
      ...currentPresence,
      status,
      clientStatus: {
        ...currentPresence.clientStatus,
        web: status
      },
      lastSeen: Date.now()
    };

    this.updatePresence(newPresence);
    this.broadcastStatusChange(status);
  }

  setCustomStatus(customStatus: CustomStatus): void {
    const currentPresence = this.currentPresence$.value;
    const newPresence: UserPresence = {
      ...currentPresence,
      customStatus,
      lastSeen: Date.now()
    };

    this.updatePresence(newPresence);
  }

  clearCustomStatus(): void {
    const currentPresence = this.currentPresence$.value;
    const newPresence: UserPresence = {
      ...currentPresence,
      customStatus: undefined,
      lastSeen: Date.now()
    };

    this.updatePresence(newPresence);
  }

  // Activity Management
  setActivity(activity: Activity): void {
    const currentPresence = this.currentPresence$.value;
    const existingActivityIndex = currentPresence.activities.findIndex(a => a.type === activity.type);
    
    let newActivities: Activity[];
    if (existingActivityIndex >= 0) {
      newActivities = [...currentPresence.activities];
      newActivities[existingActivityIndex] = activity;
    } else {
      newActivities = [...currentPresence.activities, activity];
    }

    const newPresence: UserPresence = {
      ...currentPresence,
      activities: newActivities,
      lastSeen: Date.now()
    };

    this.updatePresence(newPresence);
  }

  clearActivity(type?: Activity['type']): void {
    const currentPresence = this.currentPresence$.value;
    let newActivities: Activity[];
    
    if (type) {
      newActivities = currentPresence.activities.filter(a => a.type !== type);
    } else {
      newActivities = [];
    }

    const newPresence: UserPresence = {
      ...currentPresence,
      activities: newActivities,
      lastSeen: Date.now()
    };

    this.updatePresence(newPresence);
  }

  // Away Detection
  setAwayTimeout(minutes: number = 5): void {
    this.clearAwayTimeout();
    
    this.awayTimer = setTimeout(() => {
      if (!this.isAway && this.currentPresence$.value.status === UserStatus.ONLINE) {
        this.setStatus(UserStatus.AWAY);
        this.isAway = true;
      }
    }, minutes * 60 * 1000);
  }

  clearAwayTimeout(): void {
    if (this.awayTimer) {
      clearTimeout(this.awayTimer);
      this.awayTimer = null;
    }
  }

  resetAwayTimer(): void {
    this.lastActivity = Date.now();
    this.isAway = false;
    this.clearAwayTimeout();
    this.setAwayTimeout();
  }

  // Private methods
  private updatePresence(presence: UserPresence): void {
    this.currentPresence$.next(presence);
    
    // Add to history
    const currentHistory = this.statusHistory$.value;
    const newHistory = [presence, ...currentHistory.slice(0, 99)]; // Keep last 100
    this.statusHistory$.next(newHistory);

    // Update user in store
    this.store.select(selectCurrentUser).subscribe(user => {
      if (user) {
        const updatedUser = {
          ...user,
          status: presence.status
        };
        this.store.dispatch(RevNetActions.setCurrentUser({ user: updatedUser }));
      }
    });
  }

  private broadcastStatusChange(status: UserStatus): void {
    // In a real app, this would send to WebSocket
    console.log('Broadcasting status change:', status);
    // this.webSocketService.emit('status_change', { status });
  }

  private initializeStatusTracking(): void {
    // Set initial away timeout
    this.setAwayTimeout();
  }

  private setupActivityTracking(): void {
    // Track user activity to detect away status
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.resetAwayTimer();
      }, true);
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.setStatus(UserStatus.AWAY);
      } else {
        this.resetAwayTimer();
        this.setStatus(UserStatus.ONLINE);
      }
    });

    // Handle window focus/blur
    window.addEventListener('focus', () => {
      this.resetAwayTimer();
      this.setStatus(UserStatus.ONLINE);
    });

    window.addEventListener('blur', () => {
      this.setStatus(UserStatus.AWAY);
    });
  }

  // Cleanup
  ngOnDestroy(): void {
    this.clearAwayTimeout();
  }
}
