import { logInfo, logError } from '../logger';

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  page: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
}

export interface UserBehavior {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  sessionStart: Date;
  sessionEnd?: Date;
  duration?: number;
  pageViews: number;
  interactions: number;
}

export interface HeatmapData {
  element: string;
  x: number;
  y: number;
  width: number;
  height: number;
  clicks: number;
  hovers: number;
  scrollDepth: number;
}

export interface FunnelStep {
  step: string;
  users: number;
  conversions: number;
  conversionRate: number;
  dropOffRate: number;
  averageTime: number;
}

export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private events: AnalyticsEvent[] = [];
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private heatmapData: HeatmapData[] = [];
  private sessionId: string;
  private userId?: string;

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page views
    this.trackPageView();

    // Track user interactions
    this.trackClicks();
    this.trackScrolls();
    this.trackFormInteractions();
    this.trackTimeOnPage();

    // Track performance metrics
    this.trackPerformanceMetrics();

    // Track errors
    this.trackErrors();

    // Set up session tracking
    this.initializeSessionTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(event: string, properties: Record<string, any> = {}): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId
      },
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    this.events.push(analyticsEvent);
    this.updateUserBehavior(analyticsEvent);

    // Send to analytics service
    this.sendToAnalytics(analyticsEvent);

    logInfo('Analytics event tracked', { event, properties });
  }

  trackPageView(page?: string): void {
    const pageName = page || (typeof window !== 'undefined' ? window.location.pathname : '');
    
    this.track('page_view', {
      page: pageName,
      title: typeof document !== 'undefined' ? document.title : '',
      url: typeof window !== 'undefined' ? window.location.href : ''
    });
  }

  trackUserAction(action: string, element: string, properties: Record<string, any> = {}): void {
    this.track('user_action', {
      action,
      element,
      ...properties
    });
  }

  trackConversion(conversionType: string, value?: number, properties: Record<string, any> = {}): void {
    this.track('conversion', {
      conversionType,
      value,
      ...properties
    });
  }

  trackError(error: Error, context?: string): void {
    this.track('error', {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      page: typeof window !== 'undefined' ? window.location.pathname : ''
    });
  }

  trackPerformance(metric: string, value: number, properties: Record<string, any> = {}): void {
    this.track('performance', {
      metric,
      value,
      ...properties
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.track('user_identified', { userId });
  }

  private updateUserBehavior(event: AnalyticsEvent): void {
    const behaviorKey = `${event.userId || 'anonymous'}_${event.sessionId}`;
    let behavior = this.userBehaviors.get(behaviorKey);

    if (!behavior) {
      behavior = {
        userId: event.userId || 'anonymous',
        sessionId: event.sessionId,
        events: [],
        sessionStart: event.timestamp,
        pageViews: 0,
        interactions: 0
      };
    }

    behavior.events.push(event);

    if (event.event === 'page_view') {
      behavior.pageViews++;
    } else if (event.event === 'user_action') {
      behavior.interactions++;
    }

    this.userBehaviors.set(behaviorKey, behavior);
  }

  private trackClicks(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const element = this.getElementSelector(target);
      
      this.trackUserAction('click', element, {
        text: target.textContent?.substring(0, 100),
        href: target.getAttribute('href'),
        className: target.className,
        id: target.id
      });
    });
  }

  private trackScrolls(): void {
    if (typeof window === 'undefined') return;

    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollDepth = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        this.track('scroll', {
          scrollDepth: Math.round(scrollDepth),
          scrollY: window.scrollY,
          windowHeight: window.innerHeight,
          documentHeight: document.documentElement.scrollHeight
        });
      }, 100);
    });
  }

  private trackFormInteractions(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      const formFields: Record<string, string> = {};
      
      for (const [key, value] of formData.entries()) {
        formFields[key] = value.toString();
      }

      this.track('form_submit', {
        formId: form.id,
        formClass: form.className,
        formAction: form.action,
        formMethod: form.method,
        fieldCount: Object.keys(formFields).length
      });
    });

    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        this.trackUserAction('form_focus', this.getElementSelector(target), {
          fieldType: target.getAttribute('type'),
          fieldName: target.getAttribute('name'),
          fieldId: target.id
        });
      }
    }, true);
  }

  private trackTimeOnPage(): void {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - startTime;
      this.track('time_on_page', {
        duration: timeOnPage,
        page: window.location.pathname
      });
    });
  }

  private trackPerformanceMetrics(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
        this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
        this.trackPerformance('first_paint', navigation.loadEventEnd - navigation.fetchStart);
      }

      // Track Core Web Vitals
      this.trackCoreWebVitals();
    });
  }

  private trackCoreWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.trackPerformance('largest_contentful_paint', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.trackPerformance('first_input_delay', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          this.trackPerformance('cumulative_layout_shift', entry.value);
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private trackErrors(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.trackError(new Error(event.message), 'javascript_error');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), 'unhandled_promise_rejection');
    });
  }

  private initializeSessionTracking(): void {
    if (typeof window === 'undefined') return;

    // Track session start
    this.track('session_start', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });

    // Track session end
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        sessionId: this.sessionId,
        duration: Date.now() - performance.now(),
        timestamp: new Date().toISOString()
      });
    });
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private sendToAnalytics(event: AnalyticsEvent): void {
    // Send to multiple analytics services
    this.sendToGoogleAnalytics(event);
    this.sendToCustomAnalytics(event);
    this.sendToMixpanel(event);
  }

  private sendToGoogleAnalytics(event: AnalyticsEvent): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', event.event, {
        ...event.properties,
        custom_map: {
          dimension1: event.userId,
          dimension2: event.sessionId
        }
      });
    }
  }

  private sendToCustomAnalytics(event: AnalyticsEvent): void {
    // Send to custom analytics endpoint
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event)
    }).catch(error => {
      logError(error as Error, { context: 'analytics_tracking' });
    });
  }

  private sendToMixpanel(event: AnalyticsEvent): void {
    if (typeof mixpanel !== 'undefined') {
      mixpanel.track(event.event, {
        ...event.properties,
        distinct_id: event.userId || event.sessionId
      });
    }
  }

  // Analytics data retrieval methods
  getUserBehavior(userId: string): UserBehavior[] {
    return Array.from(this.userBehaviors.values()).filter(behavior => behavior.userId === userId);
  }

  getSessionData(sessionId: string): UserBehavior | undefined {
    return Array.from(this.userBehaviors.values()).find(behavior => behavior.sessionId === sessionId);
  }

  getHeatmapData(): HeatmapData[] {
    return this.heatmapData;
  }

  getFunnelData(steps: string[]): FunnelStep[] {
    const funnelSteps: FunnelStep[] = [];
    let previousUsers = this.events.length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepUsers = this.events.filter(event => event.event === step).length;
      const conversionRate = i === 0 ? 1 : stepUsers / previousUsers;
      const dropOffRate = 1 - conversionRate;
      const averageTime = this.calculateAverageTimeForStep(step);

      funnelSteps.push({
        step,
        users: stepUsers,
        conversions: stepUsers,
        conversionRate,
        dropOffRate,
        averageTime
      });

      previousUsers = stepUsers;
    }

    return funnelSteps;
  }

  private calculateAverageTimeForStep(step: string): number {
    const stepEvents = this.events.filter(event => event.event === step);
    if (stepEvents.length === 0) return 0;

    const totalTime = stepEvents.reduce((sum, event) => {
      return sum + event.timestamp.getTime();
    }, 0);

    return totalTime / stepEvents.length;
  }

  // Analytics export methods
  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV();
    }
    return JSON.stringify({
      events: this.events,
      userBehaviors: Array.from(this.userBehaviors.values()),
      heatmapData: this.heatmapData,
      sessionId: this.sessionId,
      userId: this.userId
    }, null, 2);
  }

  private exportToCSV(): string {
    const headers = ['timestamp', 'event', 'userId', 'sessionId', 'page', 'properties'];
    const rows = this.events.map(event => [
      event.timestamp.toISOString(),
      event.event,
      event.userId || '',
      event.sessionId,
      event.page,
      JSON.stringify(event.properties)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  clearData(): void {
    this.events = [];
    this.userBehaviors.clear();
    this.heatmapData = [];
  }
}

export const analyticsTracker = AnalyticsTracker.getInstance();
