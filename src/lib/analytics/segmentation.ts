import { logInfo, logError } from '../logger';
import { UserSegment } from '../ml/models';

export interface SegmentationCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
}

export interface SegmentationRule {
  id: string;
  name: string;
  description: string;
  criteria: SegmentationCriteria[];
  conditions: 'AND' | 'OR';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface SegmentStats {
  segmentId: string;
  totalUsers: number;
  activeUsers: number;
  averageDonation: number;
  totalDonated: number;
  engagementScore: number;
  retentionRate: number;
  growthRate: number;
}

export interface UserProfile {
  userId: string;
  segments: string[];
  characteristics: {
    donationBehavior: {
      totalDonated: number;
      averageDonation: number;
      donationFrequency: number;
      preferredCategories: string[];
    };
    engagementBehavior: {
      loginFrequency: number;
      sessionDuration: number;
      pageViews: number;
      interactions: number;
    };
    projectBehavior: {
      projectsCreated: number;
      projectsSupported: number;
      projectCategories: string[];
    };
    communicationBehavior: {
      emailsOpened: number;
      emailsClicked: number;
      notificationsEnabled: boolean;
      preferredChannels: string[];
    };
  };
  lastUpdated: Date;
}

export class UserSegmentationEngine {
  private static instance: UserSegmentationEngine;
  private segments: Map<string, UserSegment> = new Map();
  private rules: Map<string, SegmentationRule> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();

  static getInstance(): UserSegmentationEngine {
    if (!UserSegmentationEngine.instance) {
      UserSegmentationEngine.instance = new UserSegmentationEngine();
    }
    return UserSegmentationEngine.instance;
  }

  constructor() {
    this.initializeDefaultSegments();
    this.initializeDefaultRules();
  }

  private initializeDefaultSegments(): void {
    // High-Value Donors Segment
    this.segments.set('high-value-donors', {
      segmentId: 'high-value-donors',
      name: 'High-Value Donors',
      description: 'Users who have donated over $1000',
      characteristics: {
        avgDonationAmount: 2500,
        preferredCategories: ['Political Campaign', 'Social Justice'],
        activityLevel: 'high' as const,
        engagementScore: 0.9
      },
      users: [],
      size: 0
    });

    // Frequent Donors Segment
    this.segments.set('frequent-donors', {
      segmentId: 'frequent-donors',
      name: 'Frequent Donors',
      description: 'Users who have made 5+ donations',
      characteristics: {
        avgDonationAmount: 150,
        preferredCategories: ['Community Organization', 'Environmental Protection'],
        activityLevel: 'medium' as const,
        engagementScore: 0.7
      },
      users: [],
      size: 0
    });

    // New Users Segment
    this.segments.set('new-users', {
      segmentId: 'new-users',
      name: 'New Users',
      description: 'Users who joined in the last 30 days',
      characteristics: {
        avgDonationAmount: 75,
        preferredCategories: ['Political Campaign'],
        activityLevel: 'low' as const,
        engagementScore: 0.3
      },
      users: [],
      size: 0
    });

    // Inactive Users Segment
    this.segments.set('inactive-users', {
      segmentId: 'inactive-users',
      name: 'Inactive Users',
      description: 'Users who haven\'t been active in 90+ days',
      characteristics: {
        avgDonationAmount: 100,
        preferredCategories: ['Political Campaign'],
        activityLevel: 'low' as const,
        engagementScore: 0.1
      },
      users: [],
      size: 0
    });

    // Project Creators Segment
    this.segments.set('project-creators', {
      segmentId: 'project-creators',
      name: 'Project Creators',
      description: 'Users who have created projects',
      characteristics: {
        avgDonationAmount: 200,
        preferredCategories: ['Political Campaign', 'Grassroots Movement'],
        activityLevel: 'high' as const,
        engagementScore: 0.8
      },
      users: [],
      size: 0
    });

    // Mobile Users Segment
    this.segments.set('mobile-users', {
      segmentId: 'mobile-users',
      name: 'Mobile Users',
      description: 'Users who primarily access via mobile devices',
      characteristics: {
        avgDonationAmount: 85,
        preferredCategories: ['Political Campaign', 'Social Justice'],
        activityLevel: 'medium' as const,
        engagementScore: 0.6
      },
      users: [],
      size: 0
    });
  }

  private initializeDefaultRules(): void {
    // High-Value Donors Rule
    this.rules.set('high-value-donors-rule', {
      id: 'high-value-donors-rule',
      name: 'High-Value Donors Rule',
      description: 'Users who have donated over $1000',
      criteria: [
        { field: 'totalDonated', operator: 'greater_than', value: 1000 }
      ],
      conditions: 'AND',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    // Frequent Donors Rule
    this.rules.set('frequent-donors-rule', {
      id: 'frequent-donors-rule',
      name: 'Frequent Donors Rule',
      description: 'Users who have made 5+ donations',
      criteria: [
        { field: 'donationCount', operator: 'greater_than', value: 5 }
      ],
      conditions: 'AND',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    // New Users Rule
    this.rules.set('new-users-rule', {
      id: 'new-users-rule',
      name: 'New Users Rule',
      description: 'Users who joined in the last 30 days',
      criteria: [
        { field: 'createdAt', operator: 'greater_than', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      ],
      conditions: 'AND',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    // Inactive Users Rule
    this.rules.set('inactive-users-rule', {
      id: 'inactive-users-rule',
      name: 'Inactive Users Rule',
      description: 'Users who haven\'t been active in 90+ days',
      criteria: [
        { field: 'lastLoginAt', operator: 'less_than', value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      ],
      conditions: 'AND',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    // Project Creators Rule
    this.rules.set('project-creators-rule', {
      id: 'project-creators-rule',
      name: 'Project Creators Rule',
      description: 'Users who have created projects',
      criteria: [
        { field: 'projectCount', operator: 'greater_than', value: 0 }
      ],
      conditions: 'AND',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    // Mobile Users Rule
    this.rules.set('mobile-users-rule', {
      id: 'mobile-users-rule',
      name: 'Mobile Users Rule',
      description: 'Users who primarily access via mobile devices',
      criteria: [
        { field: 'mobileUsage', operator: 'greater_than', value: 0.7 }
      ],
      conditions: 'AND',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
  }

  async segmentUsers(users: any[]): Promise<UserSegment[]> {
    try {
      const segments: UserSegment[] = [];

      for (const [segmentId, segment] of this.segments.entries()) {
        const rule = this.rules.get(`${segmentId}-rule`);
        if (!rule || !rule.isActive) continue;

        const matchingUsers = this.applySegmentationRule(users, rule);
        
        if (matchingUsers.length > 0) {
          const updatedSegment: UserSegment = {
            ...segment,
            users: matchingUsers.map(u => u._id),
            size: matchingUsers.length,
            characteristics: this.calculateSegmentCharacteristics(matchingUsers)
          };

          segments.push(updatedSegment);
          this.segments.set(segmentId, updatedSegment);
        }
      }

      // Update user profiles with segment information
      await this.updateUserProfiles(users, segments);

      logInfo('User segmentation completed', { 
        totalSegments: segments.length,
        totalUsers: users.length 
      });

      return segments;
    } catch (error) {
      logError(error as Error, { context: 'user_segmentation' });
      throw error;
    }
  }

  private applySegmentationRule(users: any[], rule: SegmentationRule): any[] {
    return users.filter(user => {
      if (rule.conditions === 'AND') {
        return rule.criteria.every(criteria => this.evaluateCriteria(user, criteria));
      } else {
        return rule.criteria.some(criteria => this.evaluateCriteria(user, criteria));
      }
    });
  }

  private evaluateCriteria(user: any, criteria: SegmentationCriteria): boolean {
    const userValue = this.getNestedProperty(user, criteria.field);
    
    switch (criteria.operator) {
      case 'equals':
        return userValue === criteria.value;
      case 'not_equals':
        return userValue !== criteria.value;
      case 'greater_than':
        return userValue > criteria.value;
      case 'less_than':
        return userValue < criteria.value;
      case 'contains':
        return String(userValue).includes(String(criteria.value));
      case 'in':
        return Array.isArray(criteria.value) && criteria.value.includes(userValue);
      case 'not_in':
        return Array.isArray(criteria.value) && !criteria.value.includes(userValue);
      default:
        return false;
    }
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private calculateSegmentCharacteristics(users: any[]): any {
    const totalDonated = users.reduce((sum, user) => sum + (user.totalDonated || 0), 0);
    const avgDonation = totalDonated / users.length;
    
    // Calculate preferred categories
    const categoryCount: Record<string, number> = {};
    users.forEach(user => {
      user.preferredCategories?.forEach((category: string) => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });
    
    const preferredCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Calculate engagement score
    const totalEngagement = users.reduce((sum, user) => {
      let engagement = 0;
      if (user.donationCount > 0) engagement += 0.3;
      if (user.projectCount > 0) engagement += 0.3;
      if (user.commentCount > 0) engagement += 0.2;
      if (user.shareCount > 0) engagement += 0.2;
      return sum + engagement;
    }, 0);
    
    const engagementScore = totalEngagement / users.length;

    // Determine activity level
    let activityLevel: 'high' | 'medium' | 'low' = 'low';
    if (engagementScore > 0.7) activityLevel = 'high';
    else if (engagementScore > 0.4) activityLevel = 'medium';

    return {
      avgDonationAmount: avgDonation,
      preferredCategories,
      activityLevel,
      engagementScore
    };
  }

  private async updateUserProfiles(users: any[], segments: UserSegment[]): Promise<void> {
    for (const user of users) {
      const userSegments = segments.filter(segment => 
        segment.users.includes(user._id)
      ).map(segment => segment.segmentId);

      const profile: UserProfile = {
        userId: user._id,
        segments: userSegments,
        characteristics: {
          donationBehavior: {
            totalDonated: user.totalDonated || 0,
            averageDonation: user.averageDonation || 0,
            donationFrequency: user.donationCount || 0,
            preferredCategories: user.preferredCategories || []
          },
          engagementBehavior: {
            loginFrequency: user.loginFrequency || 0,
            sessionDuration: user.avgSessionDuration || 0,
            pageViews: user.pageViews || 0,
            interactions: user.interactions || 0
          },
          projectBehavior: {
            projectsCreated: user.projectCount || 0,
            projectsSupported: user.supportedProjects || 0,
            projectCategories: user.projectCategories || []
          },
          communicationBehavior: {
            emailsOpened: user.emailsOpened || 0,
            emailsClicked: user.emailsClicked || 0,
            notificationsEnabled: user.notificationsEnabled || false,
            preferredChannels: user.preferredChannels || []
          }
        },
        lastUpdated: new Date()
      };

      this.userProfiles.set(user._id, profile);
    }
  }

  getUserProfile(userId: string): UserProfile | undefined {
    return this.userProfiles.get(userId);
  }

  getSegment(segmentId: string): UserSegment | undefined {
    return this.segments.get(segmentId);
  }

  getAllSegments(): UserSegment[] {
    return Array.from(this.segments.values());
  }

  getSegmentStats(segmentId: string): SegmentStats | null {
    const segment = this.segments.get(segmentId);
    if (!segment) return null;

    const users = Array.from(this.userProfiles.values()).filter(profile => 
      profile.segments.includes(segmentId)
    );

    const totalUsers = users.length;
    const activeUsers = users.filter(user => 
      user.characteristics.engagementBehavior.loginFrequency > 0
    ).length;

    const totalDonated = users.reduce((sum, user) => 
      sum + user.characteristics.donationBehavior.totalDonated, 0
    );

    const averageDonation = totalDonated / totalUsers || 0;
    const engagementScore = users.reduce((sum, user) => 
      sum + (user.characteristics.engagementBehavior.loginFrequency > 0 ? 1 : 0), 0
    ) / totalUsers || 0;

    const retentionRate = this.calculateRetentionRate(users);
    const growthRate = this.calculateGrowthRate(segmentId);

    return {
      segmentId,
      totalUsers,
      activeUsers,
      averageDonation,
      totalDonated,
      engagementScore,
      retentionRate,
      growthRate
    };
  }

  private calculateRetentionRate(users: UserProfile[]): number {
    // Mock implementation - would calculate actual retention
    return Math.random() * 0.5 + 0.3; // Random retention between 30-80%
  }

  private calculateGrowthRate(segmentId: string): number {
    // Mock implementation - would calculate actual growth
    return Math.random() * 0.2 - 0.1; // Random growth between -10% and +10%
  }

  createCustomSegment(name: string, description: string, criteria: SegmentationCriteria[]): string {
    const segmentId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const segment: UserSegment = {
      segmentId,
      name,
      description,
      characteristics: {
        avgDonationAmount: 0,
        preferredCategories: [],
        activityLevel: 'low' as const,
        engagementScore: 0
      },
      users: [],
      size: 0
    };

    const rule: SegmentationRule = {
      id: `${segmentId}-rule`,
      name: `${name} Rule`,
      description,
      criteria,
      conditions: 'AND',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    this.segments.set(segmentId, segment);
    this.rules.set(`${segmentId}-rule`, rule);

    logInfo('Custom segment created', { segmentId, name });
    return segmentId;
  }

  updateSegment(segmentId: string, updates: Partial<UserSegment>): boolean {
    const segment = this.segments.get(segmentId);
    if (!segment) return false;

    const updatedSegment = { ...segment, ...updates };
    this.segments.set(segmentId, updatedSegment);

    logInfo('Segment updated', { segmentId, updates });
    return true;
  }

  deleteSegment(segmentId: string): boolean {
    const segment = this.segments.get(segmentId);
    if (!segment || segmentId.startsWith('default-')) return false; // Can't delete default segments

    this.segments.delete(segmentId);
    this.rules.delete(`${segmentId}-rule`);

    // Remove segment from user profiles
    for (const [userId, profile] of this.userProfiles.entries()) {
      const updatedProfile = {
        ...profile,
        segments: profile.segments.filter(id => id !== segmentId)
      };
      this.userProfiles.set(userId, updatedProfile);
    }

    logInfo('Segment deleted', { segmentId });
    return true;
  }

  exportSegmentData(segmentId: string): string {
    const segment = this.segments.get(segmentId);
    const stats = this.getSegmentStats(segmentId);
    
    if (!segment || !stats) return '';

    return JSON.stringify({
      segment,
      stats,
      users: Array.from(this.userProfiles.values()).filter(profile => 
        profile.segments.includes(segmentId)
      )
    }, null, 2);
  }
}

export const userSegmentationEngine = UserSegmentationEngine.getInstance();
