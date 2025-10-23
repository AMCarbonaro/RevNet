import { logInfo, logError } from './logger';

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failed'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verified'
  | '2fa_failed'
  | 'webauthn_registered'
  | 'webauthn_used'
  | 'password_changed'
  | 'account_locked'
  | 'account_unlocked'
  | 'suspicious_activity'
  | 'unusual_location'
  | 'brute_force_attempt'
  | 'api_abuse'
  | 'data_breach_attempt'
  | 'privilege_escalation'
  | 'session_hijack_attempt'
  | 'malicious_request';

export interface SecurityAlert {
  id: string;
  eventId: string;
  type: 'immediate' | 'scheduled' | 'threshold';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<string, number>;
  topThreats: Array<{
    type: SecurityEventType;
    count: number;
    lastOccurrence: Date;
  }>;
  riskScore: number;
  lastUpdated: Date;
}

export interface ThreatDetectionRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  threshold: number;
  timeWindow: number; // in minutes
  actions: string[];
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: Map<string, SecurityEvent> = new Map();
  private alerts: Map<string, SecurityAlert> = new Map();
  private detectionRules: Map<string, ThreatDetectionRule> = new Map();
  private ipWhitelist: Set<string> = new Set();
  private ipBlacklist: Set<string> = new Set();
  private userRiskScores: Map<string, number> = new Map();

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  constructor() {
    this.initializeDetectionRules();
  }

  /**
   * Initialize default threat detection rules
   */
  private initializeDetectionRules(): void {
    const rules: ThreatDetectionRule[] = [
      {
        id: 'brute_force_login',
        name: 'Brute Force Login Attempts',
        description: 'Detects multiple failed login attempts from the same IP',
        pattern: 'login_failed',
        severity: 'high',
        enabled: true,
        threshold: 5,
        timeWindow: 15,
        actions: ['block_ip', 'alert_admin', 'lock_account']
      },
      {
        id: 'rapid_api_calls',
        name: 'Rapid API Calls',
        description: 'Detects unusually high API call frequency',
        pattern: 'api_abuse',
        severity: 'medium',
        enabled: true,
        threshold: 100,
        timeWindow: 5,
        actions: ['rate_limit', 'alert_admin']
      },
      {
        id: 'unusual_location',
        name: 'Unusual Location Access',
        description: 'Detects login from unusual geographic location',
        pattern: 'unusual_location',
        severity: 'medium',
        enabled: true,
        threshold: 1,
        timeWindow: 60,
        actions: ['require_2fa', 'alert_user']
      },
      {
        id: 'privilege_escalation',
        name: 'Privilege Escalation Attempt',
        description: 'Detects attempts to gain unauthorized privileges',
        pattern: 'privilege_escalation',
        severity: 'critical',
        enabled: true,
        threshold: 1,
        timeWindow: 30,
        actions: ['block_user', 'alert_admin', 'audit_log']
      },
      {
        id: 'session_anomaly',
        name: 'Session Anomaly',
        description: 'Detects suspicious session activity',
        pattern: 'session_hijack_attempt',
        severity: 'high',
        enabled: true,
        threshold: 1,
        timeWindow: 15,
        actions: ['terminate_session', 'require_reauth', 'alert_user']
      }
    ];

    rules.forEach(rule => {
      this.detectionRules.set(rule.id, rule);
    });
  }

  /**
   * Log a security event
   */
  logEvent(
    type: SecurityEventType,
    ip: string,
    userAgent: string,
    userId?: string,
    metadata: Record<string, any> = {}
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      userId,
      ip,
      userAgent,
      timestamp: new Date(),
      severity: this.getEventSeverity(type),
      description: this.getEventDescription(type, metadata),
      metadata,
      resolved: false
    };

    this.events.set(event.id, event);

    // Check for threats
    this.checkThreats(event);

    // Update user risk score
    if (userId) {
      this.updateUserRiskScore(userId, event);
    }

    logInfo('Security event logged', { 
      eventId: event.id, 
      type, 
      userId, 
      severity: event.severity 
    });

    return event;
  }

  /**
   * Check for threats based on detection rules
   */
  private checkThreats(event: SecurityEvent): void {
    for (const rule of this.detectionRules.values()) {
      if (!rule.enabled || !this.matchesPattern(event, rule.pattern)) {
        continue;
      }

      const recentEvents = this.getRecentEvents(
        event.type,
        event.ip,
        event.userId,
        rule.timeWindow
      );

      if (recentEvents.length >= rule.threshold) {
        this.createAlert(event, rule, recentEvents.length);
      }
    }
  }

  /**
   * Create a security alert
   */
  private createAlert(
    event: SecurityEvent, 
    rule: ThreatDetectionRule, 
    eventCount: number
  ): void {
    const alert: SecurityAlert = {
      id: this.generateAlertId(),
      eventId: event.id,
      type: 'threshold',
      message: `${rule.name}: ${eventCount} occurrences in ${rule.timeWindow} minutes`,
      severity: rule.severity,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false
    };

    this.alerts.set(alert.id, alert);

    // Execute alert actions
    this.executeAlertActions(alert, rule);

    logError(new Error(`Security alert triggered: ${rule.name}`), {
      context: 'security_monitoring',
      alertId: alert.id,
      ruleId: rule.id,
      eventCount,
      severity: rule.severity
    });
  }

  /**
   * Execute alert actions
   */
  private executeAlertActions(alert: SecurityAlert, rule: ThreatDetectionRule): void {
    for (const action of rule.actions) {
      switch (action) {
        case 'block_ip':
          this.blockIP(alert.eventId);
          break;
        case 'alert_admin':
          this.sendAdminAlert(alert);
          break;
        case 'lock_account':
          this.lockAccount(alert.eventId);
          break;
        case 'rate_limit':
          this.applyRateLimit(alert.eventId);
          break;
        case 'require_2fa':
          this.require2FA(alert.eventId);
          break;
        case 'alert_user':
          this.sendUserAlert(alert);
          break;
        case 'terminate_session':
          this.terminateSession(alert.eventId);
          break;
        case 'require_reauth':
          this.requireReauth(alert.eventId);
          break;
        case 'audit_log':
          this.auditLog(alert);
          break;
      }
    }
  }

  /**
   * Get recent events matching criteria
   */
  private getRecentEvents(
    type: SecurityEventType,
    ip?: string,
    userId?: string,
    timeWindowMinutes: number = 15
  ): SecurityEvent[] {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    
    return Array.from(this.events.values()).filter(event => {
      return event.type === type &&
             event.timestamp >= cutoffTime &&
             (ip === undefined || event.ip === ip) &&
             (userId === undefined || event.userId === userId);
    });
  }

  /**
   * Check if event matches pattern
   */
  private matchesPattern(event: SecurityEvent, pattern: string): boolean {
    return event.type === pattern || event.type.includes(pattern);
  }

  /**
   * Get event severity
   */
  private getEventSeverity(type: SecurityEventType): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<SecurityEventType, 'low' | 'medium' | 'high' | 'critical'> = {
      login_attempt: 'low',
      login_success: 'low',
      login_failed: 'medium',
      '2fa_enabled': 'low',
      '2fa_disabled': 'medium',
      '2fa_verified': 'low',
      '2fa_failed': 'medium',
      webauthn_registered: 'low',
      webauthn_used: 'low',
      password_changed: 'medium',
      account_locked: 'high',
      account_unlocked: 'medium',
      suspicious_activity: 'high',
      unusual_location: 'medium',
      brute_force_attempt: 'high',
      api_abuse: 'medium',
      data_breach_attempt: 'critical',
      privilege_escalation: 'critical',
      session_hijack_attempt: 'high',
      malicious_request: 'high'
    };

    return severityMap[type] || 'low';
  }

  /**
   * Get event description
   */
  private getEventDescription(type: SecurityEventType, metadata: Record<string, any>): string {
    const descriptions: Record<SecurityEventType, string> = {
      login_attempt: 'Login attempt initiated',
      login_success: 'Successful login',
      login_failed: 'Failed login attempt',
      '2fa_enabled': 'Two-factor authentication enabled',
      '2fa_disabled': 'Two-factor authentication disabled',
      '2fa_verified': 'Two-factor authentication verified',
      '2fa_failed': 'Two-factor authentication failed',
      webauthn_registered: 'WebAuthn credential registered',
      webauthn_used: 'WebAuthn authentication used',
      password_changed: 'Password changed',
      account_locked: 'Account locked due to security concerns',
      account_unlocked: 'Account unlocked',
      suspicious_activity: 'Suspicious activity detected',
      unusual_location: 'Login from unusual location',
      brute_force_attempt: 'Brute force attack detected',
      api_abuse: 'API abuse detected',
      data_breach_attempt: 'Potential data breach attempt',
      privilege_escalation: 'Privilege escalation attempt',
      session_hijack_listed: 'Potential session hijacking attempt',
      malicious_request: 'Malicious request detected'
    };

    return descriptions[type] || 'Security event occurred';
  }

  /**
   * Update user risk score
   */
  private updateUserRiskScore(userId: string, event: SecurityEvent): void {
    const currentScore = this.userRiskScores.get(userId) || 0;
    const eventScore = this.getEventRiskScore(event);
    const newScore = Math.min(100, currentScore + eventScore);
    
    this.userRiskScores.set(userId, newScore);
  }

  /**
   * Get event risk score
   */
  private getEventRiskScore(event: SecurityEvent): number {
    const riskScores: Record<string, number> = {
      low: 1,
      medium: 3,
      high: 7,
      critical: 15
    };

    return riskScores[event.severity] || 1;
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): SecurityMetrics {
    const events = Array.from(this.events.values());
    const eventsByType: Record<SecurityEventType, number> = {} as any;
    const eventsBySeverity: Record<string, number> = {};

    // Initialize counters
    const severities = ['low', 'medium', 'high', 'critical'];
    severities.forEach(severity => {
      eventsBySeverity[severity] = 0;
    });

    // Count events
    events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    });

    // Get top threats
    const topThreats = Object.entries(eventsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({
        type: type as SecurityEventType,
        count,
        lastOccurrence: events
          .filter(e => e.type === type)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]?.timestamp || new Date()
      }));

    // Calculate overall risk score
    const riskScore = this.calculateOverallRiskScore(events);

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      topThreats,
      riskScore,
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate overall risk score
   */
  private calculateOverallRiskScore(events: SecurityEvent[]): number {
    if (events.length === 0) return 0;

    const recentEvents = events.filter(
      event => event.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );

    const totalRisk = recentEvents.reduce((sum, event) => {
      return sum + this.getEventRiskScore(event);
    }, 0);

    return Math.min(100, totalRisk);
  }

  /**
   * Get user risk score
   */
  getUserRiskScore(userId: string): number {
    return this.userRiskScores.get(userId) || 0;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): SecurityAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy;

    logInfo('Security alert acknowledged', { alertId, acknowledgedBy });
    return true;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy;

    logInfo('Security alert resolved', { alertId, resolvedBy });
    return true;
  }

  /**
   * Add IP to whitelist
   */
  whitelistIP(ip: string): void {
    this.ipWhitelist.add(ip);
    logInfo('IP whitelisted', { ip });
  }

  /**
   * Add IP to blacklist
   */
  blacklistIP(ip: string): void {
    this.ipBlacklist.add(ip);
    logInfo('IP blacklisted', { ip });
  }

  /**
   * Check if IP is whitelisted
   */
  isIPWhitelisted(ip: string): boolean {
    return this.ipWhitelist.has(ip);
  }

  /**
   * Check if IP is blacklisted
   */
  isIPBlacklisted(ip: string): boolean {
    return this.ipBlacklist.has(ip);
  }

  /**
   * Remove IP from whitelist
   */
  removeFromWhitelist(ip: string): boolean {
    const removed = this.ipWhitelist.delete(ip);
    if (removed) {
      logInfo('IP removed from whitelist', { ip });
    }
    return removed;
  }

  /**
   * Remove IP from blacklist
   */
  removeFromBlacklist(ip: string): boolean {
    const removed = this.ipBlacklist.delete(ip);
    if (removed) {
      logInfo('IP removed from blacklist', { ip });
    }
    return removed;
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mock alert actions (in real implementation, these would perform actual actions)
   */
  private blockIP(eventId: string): void {
    logInfo('IP blocking action triggered', { eventId });
  }

  private sendAdminAlert(alert: SecurityAlert): void {
    logInfo('Admin alert sent', { alertId: alert.id, severity: alert.severity });
  }

  private lockAccount(eventId: string): void {
    logInfo('Account locking action triggered', { eventId });
  }

  private applyRateLimit(eventId: string): void {
    logInfo('Rate limiting action triggered', { eventId });
  }

  private require2FA(eventId: string): void {
    logInfo('2FA requirement action triggered', { eventId });
  }

  private sendUserAlert(alert: SecurityAlert): void {
    logInfo('User alert sent', { alertId: alert.id });
  }

  private terminateSession(eventId: string): void {
    logInfo('Session termination action triggered', { eventId });
  }

  private requireReauth(eventId: string): void {
    logInfo('Re-authentication requirement action triggered', { eventId });
  }

  private auditLog(alert: SecurityAlert): void {
    logInfo('Audit log entry created', { alertId: alert.id });
  }
}

export const securityMonitor = SecurityMonitor.getInstance();
