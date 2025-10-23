// Feature Flags system for Revolution Network

export type FeatureFlag = 
  | 'advanced_search'
  | 'pwa_features'
  | 'admin_dashboard'
  | 'real_time_collaboration'
  | 'blockchain_payments'
  | 'ai_recommendations'
  | 'advanced_analytics'
  | 'mobile_app'
  | 'beta_features'
  | 'maintenance_mode'
  | 'new_ui_theme'
  | 'social_features'
  | 'gamification'
  | 'advanced_moderation'
  | 'api_v2'
  | 'webhooks'
  | 'multi_language'
  | 'dark_mode'
  | 'offline_mode'
  | 'push_notifications';

export type FeatureFlagType = 'boolean' | 'string' | 'number' | 'json';
export type FeatureFlagStatus = 'enabled' | 'disabled' | 'experimental' | 'deprecated';

export interface FeatureFlagConfig {
  name: FeatureFlag;
  type: FeatureFlagType;
  status: FeatureFlagStatus;
  defaultValue: any;
  description: string;
  targetUsers?: string[]; // User IDs to target
  targetRoles?: string[]; // Roles to target
  targetPercentage?: number; // Percentage of users to enable for
  conditions?: FeatureFlagCondition[];
  rolloutStrategy?: 'immediate' | 'gradual' | 'canary' | 'a_b_test';
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlagCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
}

export interface FeatureFlagEvaluation {
  flagName: FeatureFlag;
  value: any;
  reason: string;
  source: 'default' | 'user_targeting' | 'role_targeting' | 'percentage' | 'condition';
}

// Feature Flags Manager class
export class FeatureFlagsManager {
  private flags: Map<FeatureFlag, FeatureFlagConfig> = new Map();
  private userFlags: Map<string, Map<FeatureFlag, any>> = new Map();

  constructor() {
    this.initializeDefaultFlags();
  }

  private initializeDefaultFlags() {
    // Initialize with default feature flags
    const defaultFlags: FeatureFlagConfig[] = [
      {
        name: 'advanced_search',
        type: 'boolean',
        status: 'enabled',
        defaultValue: true,
        description: 'Enable advanced search functionality with Algolia',
        rolloutStrategy: 'immediate',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'pwa_features',
        type: 'boolean',
        status: 'enabled',
        defaultValue: true,
        description: 'Enable Progressive Web App features',
        rolloutStrategy: 'immediate',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'admin_dashboard',
        type: 'boolean',
        status: 'enabled',
        defaultValue: false,
        description: 'Enable comprehensive admin dashboard',
        targetRoles: ['admin', 'moderator'],
        rolloutStrategy: 'immediate',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'real_time_collaboration',
        type: 'boolean',
        status: 'experimental',
        defaultValue: false,
        description: 'Enable real-time collaborative editing',
        targetPercentage: 10,
        rolloutStrategy: 'canary',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'blockchain_payments',
        type: 'boolean',
        status: 'experimental',
        defaultValue: false,
        description: 'Enable cryptocurrency payment processing',
        targetPercentage: 5,
        rolloutStrategy: 'canary',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ai_recommendations',
        type: 'boolean',
        status: 'experimental',
        defaultValue: false,
        description: 'Enable AI-powered project recommendations',
        targetPercentage: 20,
        rolloutStrategy: 'gradual',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'advanced_analytics',
        type: 'boolean',
        status: 'enabled',
        defaultValue: false,
        description: 'Enable advanced analytics and reporting',
        targetRoles: ['admin', 'moderator'],
        rolloutStrategy: 'immediate',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'mobile_app',
        type: 'boolean',
        status: 'experimental',
        defaultValue: false,
        description: 'Enable mobile app features',
        targetPercentage: 15,
        rolloutStrategy: 'canary',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'beta_features',
        type: 'boolean',
        status: 'experimental',
        defaultValue: false,
        description: 'Enable beta features for testing',
        targetUsers: [], // Would be populated with beta testers
        rolloutStrategy: 'immediate',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'maintenance_mode',
        type: 'boolean',
        status: 'disabled',
        defaultValue: false,
        description: 'Enable maintenance mode',
        rolloutStrategy: 'immediate',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'new_ui_theme',
        type: 'string',
        status: 'experimental',
        defaultValue: 'cyberpunk',
        description: 'New UI theme selection',
        targetPercentage: 25,
        rolloutStrategy: 'a_b_test',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'social_features',
        type: 'boolean',
        status: 'experimental',
        defaultValue: false,
        description: 'Enable social features like following and sharing',
        targetPercentage: 30,
        rolloutStrategy: 'gradual',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'gamification',
        type: 'boolean',
        status: 'experimental',
        defaultValue: false,
        description: 'Enable gamification features like achievements and leaderboards',
        targetPercentage: 20,
        rolloutStrategy: 'canary',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'advanced_moderation',
        type: 'boolean',
        status: 'enabled',
        defaultValue: false,
        description: 'Enable advanced content moderation tools',
        targetRoles: ['admin', 'moderator'],
        rolloutStrategy: 'immediate',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'api_v2',
        type: 'boolean',
        status: 'experimental',
        defaultValue: false,
        description: 'Enable API v2 endpoints',
        targetPercentage: 10,
        rolloutStrategy: 'canary',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'webhooks',
        type: 'boolean',
        status: 'experimental',
        defaultValue: false,
        description: 'Enable webhook functionality',
        targetPercentage: 5,
        rolloutStrategy: 'canary',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'multi_language',
        type: 'boolean',
        status: 'experimental',
        defaultValue: false,
        description: 'Enable multi-language support',
        targetPercentage: 15,
        rolloutStrategy: 'gradual',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'dark_mode',
        type: 'boolean',
        status: 'enabled',
        defaultValue: true,
        description: 'Enable dark mode theme',
        rolloutStrategy: 'immediate',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'offline_mode',
        type: 'boolean',
        status: 'enabled',
        defaultValue: true,
        description: 'Enable offline mode functionality',
        rolloutStrategy: 'immediate',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'push_notifications',
        type: 'boolean',
        status: 'enabled',
        defaultValue: true,
        description: 'Enable push notifications',
        rolloutStrategy: 'immediate',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultFlags.forEach(flag => {
      this.flags.set(flag.name, flag);
    });
  }

  // Evaluate feature flag for a specific user
  evaluateFlag(flagName: FeatureFlag, userId: string, userContext: any = {}): FeatureFlagEvaluation {
    const flag = this.flags.get(flagName);
    if (!flag) {
      return {
        flagName,
        value: false,
        reason: 'Flag not found',
        source: 'default'
      };
    }

    // Check if flag is disabled
    if (flag.status === 'disabled') {
      return {
        flagName,
        value: false,
        reason: 'Flag is disabled',
        source: 'default'
      };
    }

    // Check if flag has expired
    if (flag.endDate && flag.endDate < new Date()) {
      return {
        flagName,
        value: false,
        reason: 'Flag has expired',
        source: 'default'
      };
    }

    // Check if flag has started
    if (flag.startDate && flag.startDate > new Date()) {
      return {
        flagName,
        value: false,
        reason: 'Flag has not started yet',
        source: 'default'
      };
    }

    // Check user-specific override
    const userFlags = this.userFlags.get(userId);
    if (userFlags && userFlags.has(flagName)) {
      return {
        flagName,
        value: userFlags.get(flagName),
        reason: 'User-specific override',
        source: 'user_targeting'
      };
    }

    // Check user targeting
    if (flag.targetUsers && flag.targetUsers.includes(userId)) {
      return {
        flagName,
        value: true,
        reason: 'User is in target list',
        source: 'user_targeting'
      };
    }

    // Check role targeting
    if (flag.targetRoles && userContext.roles) {
      const hasMatchingRole = flag.targetRoles.some(role => userContext.roles.includes(role));
      if (hasMatchingRole) {
        return {
          flagName,
          value: true,
          reason: 'User has matching role',
          source: 'role_targeting'
        };
      }
    }

    // Check percentage rollout
    if (flag.targetPercentage) {
      const userHash = this.hashUserId(userId);
      const percentage = userHash % 100;
      if (percentage < flag.targetPercentage) {
        return {
          flagName,
          value: true,
          reason: `User is in ${flag.targetPercentage}% rollout`,
          source: 'percentage'
        };
      }
    }

    // Check conditions
    if (flag.conditions && flag.conditions.length > 0) {
      const matchesConditions = flag.conditions.every(condition => {
        return this.evaluateCondition(condition, userContext);
      });

      if (matchesConditions) {
        return {
          flagName,
          value: true,
          reason: 'User matches conditions',
          source: 'condition'
        };
      }
    }

    // Return default value
    return {
      flagName,
      value: flag.defaultValue,
      reason: 'Using default value',
      source: 'default'
    };
  }

  // Get feature flag value for user
  getFlagValue(flagName: FeatureFlag, userId: string, userContext: any = {}): any {
    const evaluation = this.evaluateFlag(flagName, userId, userContext);
    return evaluation.value;
  }

  // Check if feature is enabled for user
  isEnabled(flagName: FeatureFlag, userId: string, userContext: any = {}): boolean {
    const value = this.getFlagValue(flagName, userId, userContext);
    return Boolean(value);
  }

  // Set user-specific flag value
  setUserFlag(userId: string, flagName: FeatureFlag, value: any): void {
    if (!this.userFlags.has(userId)) {
      this.userFlags.set(userId, new Map());
    }
    this.userFlags.get(userId)!.set(flagName, value);
  }

  // Remove user-specific flag value
  removeUserFlag(userId: string, flagName: FeatureFlag): void {
    const userFlags = this.userFlags.get(userId);
    if (userFlags) {
      userFlags.delete(flagName);
      if (userFlags.size === 0) {
        this.userFlags.delete(userId);
      }
    }
  }

  // Get all flags for user
  getUserFlags(userId: string, userContext: any = {}): Record<FeatureFlag, any> {
    const result: Record<FeatureFlag, any> = {} as any;
    
    this.flags.forEach((flag, flagName) => {
      result[flagName] = this.getFlagValue(flagName, userId, userContext);
    });

    return result;
  }

  // Update flag configuration
  updateFlag(flagName: FeatureFlag, updates: Partial<FeatureFlagConfig>): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      const updatedFlag = { ...flag, ...updates, updatedAt: new Date() };
      this.flags.set(flagName, updatedFlag);
    }
  }

  // Create new flag
  createFlag(flag: FeatureFlagConfig): void {
    this.flags.set(flag.name, flag);
  }

  // Delete flag
  deleteFlag(flagName: FeatureFlag): void {
    this.flags.delete(flagName);
  }

  // Get all flags
  getAllFlags(): FeatureFlagConfig[] {
    return Array.from(this.flags.values());
  }

  // Get flag configuration
  getFlag(flagName: FeatureFlag): FeatureFlagConfig | undefined {
    return this.flags.get(flagName);
  }

  // Hash user ID for percentage rollout
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Evaluate condition
  private evaluateCondition(condition: FeatureFlagCondition, userContext: any): boolean {
    const userValue = userContext[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return userValue === condition.value;
      case 'not_equals':
        return userValue !== condition.value;
      case 'greater_than':
        return userValue > condition.value;
      case 'less_than':
        return userValue < condition.value;
      case 'contains':
        return String(userValue).includes(String(condition.value));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(userValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(userValue);
      default:
        return false;
    }
  }

  // Get flag statistics
  getFlagStatistics(flagName: FeatureFlag): any {
    const flag = this.flags.get(flagName);
    if (!flag) return null;

    let enabledCount = 0;
    let totalCount = 0;

    // This would typically query the database for actual statistics
    // For now, return mock data
    return {
      flagName,
      enabledCount,
      totalCount,
      percentage: flag.targetPercentage || 0,
      status: flag.status,
      rolloutStrategy: flag.rolloutStrategy
    };
  }
}

// Create singleton instance
export const featureFlagsManager = new FeatureFlagsManager();

// Utility functions
export const isFeatureEnabled = (flagName: FeatureFlag, userId: string, userContext: any = {}): boolean => {
  return featureFlagsManager.isEnabled(flagName, userId, userContext);
};

export const getFeatureValue = (flagName: FeatureFlag, userId: string, userContext: any = {}): any => {
  return featureFlagsManager.getFlagValue(flagName, userId, userContext);
};

export const getUserFlags = (userId: string, userContext: any = {}): Record<FeatureFlag, any> => {
  return featureFlagsManager.getUserFlags(userId, userContext);
};

// React hook for feature flags
export const useFeatureFlag = (flagName: FeatureFlag, userId: string, userContext: any = {}) => {
  return featureFlagsManager.isEnabled(flagName, userId, userContext);
};

// Middleware for API routes
export const withFeatureFlag = (flagName: FeatureFlag) => {
  return (req: any, res: any, next: any) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!featureFlagsManager.isEnabled(flagName, userId, req.user)) {
      return res.status(403).json({ message: `Feature ${flagName} is not enabled` });
    }

    next();
  };
};

export default featureFlagsManager;
