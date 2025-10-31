import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { interval, Subscription } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class KeepAliveService {
  private readonly http = inject(HttpClient);
  private keepAliveInterval?: Subscription;
  
  // Ping interval: 10 minutes (600000ms) - enough to keep Render awake
  // Render free tier typically spins down after 15 minutes of inactivity
  private readonly PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
  
  // Start delay: Wait 30 seconds after app load before first ping
  private readonly START_DELAY_MS = 30 * 1000; // 30 seconds
  
  private isActive = false;

  /**
   * Start the keep-alive mechanism
   * This will ping the backend health endpoint periodically to prevent Render from spinning down
   */
  start(): void {
    if (this.isActive) {
      console.log('[KeepAlive] Already running');
      return;
    }

    console.log('[KeepAlive] Starting keep-alive service');
    this.isActive = true;

    // Wait for initial delay, then start pinging
    setTimeout(() => {
      // Initial ping
      this.ping();
      
      // Set up periodic pings
      this.keepAliveInterval = interval(this.PING_INTERVAL_MS).subscribe(() => {
        // Only ping if tab is visible (user is active)
        if (!document.hidden) {
          this.ping();
        }
      });
    }, this.START_DELAY_MS);

    // Also ping on visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Stop the keep-alive mechanism
   */
  stop(): void {
    if (this.keepAliveInterval) {
      this.keepAliveInterval.unsubscribe();
      this.keepAliveInterval = undefined;
    }
    this.isActive = false;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    console.log('[KeepAlive] Stopped');
  }

  /**
   * Ping the backend health endpoint
   * This is a silent request that keeps the server awake
   */
  private ping(): void {
    // Only ping if we're in production (on Render)
    // In development, we don't need to keep localhost alive
    if (!environment.production) {
      return;
    }

    const healthUrl = `${environment.apiUrl}/health`;
    
    // Use a simple GET request to the health endpoint
    // This is lightweight and keeps the server active
    this.http.get(healthUrl, {
      observe: 'body',
      responseType: 'json',
      // Don't show loading indicators or error toasts for this silent ping
      headers: {
        'X-Silent-Request': 'true'
      }
    }).pipe(
      tap(() => {
        // Silent success - no user-visible feedback needed
      }),
      catchError((error) => {
        // Silent error handling - server might be spinning up
        // This is expected on Render free tier, so we don't show errors
        return [];
      })
    ).subscribe();
  }

  /**
   * Handle visibility change - ping immediately when user returns to tab
   */
  private handleVisibilityChange(): void {
    if (!document.hidden && this.isActive) {
      // User returned to tab, ping immediately to wake up server if needed
      this.ping();
    }
  }
}

