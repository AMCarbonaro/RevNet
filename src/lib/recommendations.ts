import { logInfo, logError } from '../logger';

export interface Recommendation {
  id: string;
  type: 'project' | 'user' | 'content' | 'action';
  title: string;
  description: string;
  score: number;
  confidence: number;
  category: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface ProjectRecommendation extends Recommendation {
  type: 'project';
  projectId: string;
  projectData: {
    title: string;
    description: string;
    category: string;
    fundingGoal: number;
    currentFunding: number;
    deadline: Date;
    creator: string;
    imageUrl?: string;
  };
  reasons: string[];
}

export interface UserRecommendation extends Recommendation {
  type: 'user';
  userId: string;
  userData: {
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    interests: string[];
  };
  reasons: string[];
}

export interface ContentRecommendation extends Recommendation {
  type: 'content';
  contentId: string;
  contentData: {
    title: string;
    type: 'article' | 'video' | 'podcast' | 'guide';
    description: string;
    url: string;
    thumbnail?: string;
  };
  reasons: string[];
}

export interface ActionRecommendation extends Recommendation {
  type: 'action';
  action: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  steps: string[];
}

export interface RecommendationEngineConfig {
  maxRecommendations: number;
  minScore: number;
  minConfidence: number;
  categories: string[];
  excludeSeen: boolean;
  personalize: boolean;
}

export class RecommendationEngine {
  private static instance: RecommendationEngine;
  private config: RecommendationEngineConfig;
  private userPreferences: Map<string, any> = new Map();
  private seenRecommendations: Map<string, Set<string>> = new Map();

  static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  constructor() {
    this.config = {
      maxRecommendations: 10,
      minScore: 0.3,
      minConfidence: 0.6,
      categories: ['Political Campaign', 'Social Justice', 'Environmental Protection', 'Community Organization'],
      excludeSeen: true,
      personalize: true
    };
  }

  async getProjectRecommendations(userId: string, availableProjects: any[]): Promise<ProjectRecommendation[]> {
    try {
      const userProfile = await this.getUserProfile(userId);
      const recommendations: ProjectRecommendation[] = [];

      for (const project of availableProjects) {
        const score = this.calculateProjectScore(userProfile, project);
        const confidence = this.calculateConfidence(userProfile, project);
        
        if (score >= this.config.minScore && confidence >= this.config.minConfidence) {
          const reasons = this.generateProjectReasons(userProfile, project);
          
          recommendations.push({
            id: `project-${project._id}`,
            type: 'project',
            title: `Recommended Project: ${project.title}`,
            description: `This project matches your interests and donation history`,
            score,
            confidence,
            category: project.category,
            metadata: {
              fundingProgress: project.currentFunding / project.fundingGoal,
              daysRemaining: Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
              creatorExperience: project.creatorExperience || 0
            },
            createdAt: new Date(),
            projectId: project._id,
            projectData: {
              title: project.title,
              description: project.description,
              category: project.category,
              fundingGoal: project.fundingGoal,
              currentFunding: project.currentFunding,
              deadline: new Date(project.deadline),
              creator: project.creatorName,
              imageUrl: project.imageUrl
            },
            reasons
          });
        }
      }

      // Sort by score and limit results
      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, this.config.maxRecommendations);

      // Filter out seen recommendations if enabled
      if (this.config.excludeSeen) {
        const seenSet = this.seenRecommendations.get(userId) || new Set();
        return sortedRecommendations.filter(rec => !seenSet.has(rec.id));
      }

      logInfo('Project recommendations generated', { 
        userId, 
        count: sortedRecommendations.length 
      });

      return sortedRecommendations;
    } catch (error) {
      logError(error as Error, { context: 'project_recommendations', userId });
      return [];
    }
  }

  async getUserRecommendations(userId: string, availableUsers: any[]): Promise<UserRecommendation[]> {
    try {
      const userProfile = await this.getUserProfile(userId);
      const recommendations: UserRecommendation[] = [];

      for (const user of availableUsers) {
        if (user._id === userId) continue; // Don't recommend self

        const score = this.calculateUserScore(userProfile, user);
        const confidence = this.calculateUserConfidence(userProfile, user);
        
        if (score >= this.config.minScore && confidence >= this.config.minConfidence) {
          const reasons = this.generateUserReasons(userProfile, user);
          
          recommendations.push({
            id: `user-${user._id}`,
            type: 'user',
            title: `Connect with ${user.name}`,
            description: `This user shares similar interests and values`,
            score,
            confidence,
            category: 'Networking',
            metadata: {
              mutualConnections: user.mutualConnections || 0,
              sharedInterests: user.sharedInterests || 0,
              activityLevel: user.activityLevel || 'medium'
            },
            createdAt: new Date(),
            userId: user._id,
            userData: {
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              bio: user.bio,
              interests: user.interests || []
            },
            reasons
          });
        }
      }

      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, this.config.maxRecommendations);

      logInfo('User recommendations generated', { 
        userId, 
        count: sortedRecommendations.length 
      });

      return sortedRecommendations;
    } catch (error) {
      logError(error as Error, { context: 'user_recommendations', userId });
      return [];
    }
  }

  async getContentRecommendations(userId: string, availableContent: any[]): Promise<ContentRecommendation[]> {
    try {
      const userProfile = await this.getUserProfile(userId);
      const recommendations: ContentRecommendation[] = [];

      for (const content of availableContent) {
        const score = this.calculateContentScore(userProfile, content);
        const confidence = this.calculateContentConfidence(userProfile, content);
        
        if (score >= this.config.minScore && confidence >= this.config.minConfidence) {
          const reasons = this.generateContentReasons(userProfile, content);
          
          recommendations.push({
            id: `content-${content._id}`,
            type: 'content',
            title: `Recommended Content: ${content.title}`,
            description: `This content aligns with your interests`,
            score,
            confidence,
            category: content.category,
            metadata: {
              contentType: content.type,
              readTime: content.readTime || 5,
              popularity: content.popularity || 0
            },
            createdAt: new Date(),
            contentId: content._id,
            contentData: {
              title: content.title,
              type: content.type,
              description: content.description,
              url: content.url,
              thumbnail: content.thumbnail
            },
            reasons
          });
        }
      }

      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, this.config.maxRecommendations);

      logInfo('Content recommendations generated', { 
        userId, 
        count: sortedRecommendations.length 
      });

      return sortedRecommendations;
    } catch (error) {
      logError(error as Error, { context: 'content_recommendations', userId });
      return [];
    }
  }

  async getActionRecommendations(userId: string): Promise<ActionRecommendation[]> {
    try {
      const userProfile = await this.getUserProfile(userId);
      const recommendations: ActionRecommendation[] = [];

      // Generate action recommendations based on user behavior
      const actions = this.generateActionRecommendations(userProfile);

      for (const action of actions) {
        recommendations.push({
          id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'action',
          title: action.title,
          description: action.description,
          score: action.score,
          confidence: action.confidence,
          category: 'Action',
          metadata: {
            priority: action.priority,
            estimatedImpact: action.estimatedImpact
          },
          createdAt: new Date(),
          action: action.action,
          priority: action.priority,
          estimatedImpact: action.estimatedImpact,
          steps: action.steps
        });
      }

      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, this.config.maxRecommendations);

      logInfo('Action recommendations generated', { 
        userId, 
        count: sortedRecommendations.length 
      });

      return sortedRecommendations;
    } catch (error) {
      logError(error as Error, { context: 'action_recommendations', userId });
      return [];
    }
  }

  async getPersonalizedRecommendations(userId: string, type: 'all' | 'projects' | 'users' | 'content' | 'actions' = 'all'): Promise<Recommendation[]> {
    try {
      const recommendations: Recommendation[] = [];

      if (type === 'all' || type === 'projects') {
        // Mock project data - in real implementation, this would fetch from database
        const projects = await this.getAvailableProjects();
        const projectRecs = await this.getProjectRecommendations(userId, projects);
        recommendations.push(...projectRecs);
      }

      if (type === 'all' || type === 'users') {
        // Mock user data - in real implementation, this would fetch from database
        const users = await this.getAvailableUsers();
        const userRecs = await this.getUserRecommendations(userId, users);
        recommendations.push(...userRecs);
      }

      if (type === 'all' || type === 'content') {
        // Mock content data - in real implementation, this would fetch from database
        const content = await this.getAvailableContent();
        const contentRecs = await this.getContentRecommendations(userId, content);
        recommendations.push(...contentRecs);
      }

      if (type === 'all' || type === 'actions') {
        const actionRecs = await this.getActionRecommendations(userId);
        recommendations.push(...actionRecs);
      }

      // Sort all recommendations by score
      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, this.config.maxRecommendations);

      logInfo('Personalized recommendations generated', { 
        userId, 
        type,
        count: sortedRecommendations.length 
      });

      return sortedRecommendations;
    } catch (error) {
      logError(error as Error, { context: 'personalized_recommendations', userId });
      return [];
    }
  }

  markRecommendationSeen(userId: string, recommendationId: string): void {
    const seenSet = this.seenRecommendations.get(userId) || new Set();
    seenSet.add(recommendationId);
    this.seenRecommendations.set(userId, seenSet);
  }

  updateUserPreferences(userId: string, preferences: any): void {
    this.userPreferences.set(userId, preferences);
    logInfo('User preferences updated', { userId, preferences });
  }

  updateConfig(config: Partial<RecommendationEngineConfig>): void {
    this.config = { ...this.config, ...config };
    logInfo('Recommendation engine config updated', { config });
  }

  // Private helper methods
  private async getUserProfile(userId: string): Promise<any> {
    // Mock user profile - in real implementation, this would fetch from database
    return {
      _id: userId,
      interests: ['Political Campaign', 'Social Justice'],
      donationHistory: [
        { amount: 50, category: 'Political Campaign' },
        { amount: 100, category: 'Social Justice' }
      ],
      averageDonation: 75,
      totalDonated: 150,
      preferredCategories: ['Political Campaign', 'Social Justice'],
      activityLevel: 'medium',
      engagementScore: 0.7
    };
  }

  private calculateProjectScore(userProfile: any, project: any): number {
    let score = 0.5; // Base score

    // Category preference scoring
    if (userProfile.preferredCategories.includes(project.category)) {
      score += 0.3;
    }

    // Funding goal scoring
    if (project.fundingGoal <= userProfile.averageDonation * 100) {
      score += 0.2;
    }

    // Creator experience scoring
    if (project.creatorExperience > 0.7) {
      score += 0.1;
    }

    // Timing scoring
    const daysRemaining = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysRemaining >= 30 && daysRemaining <= 60) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private calculateConfidence(userProfile: any, project: any): number {
    // Calculate confidence based on data quality and user profile completeness
    let confidence = 0.7; // Base confidence

    if (userProfile.donationHistory.length > 0) confidence += 0.1;
    if (userProfile.preferredCategories.length > 0) confidence += 0.1;
    if (project.description && project.description.length > 100) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private generateProjectReasons(userProfile: any, project: any): string[] {
    const reasons: string[] = [];

    if (userProfile.preferredCategories.includes(project.category)) {
      reasons.push(`Matches your interest in ${project.category}`);
    }

    if (project.fundingGoal <= userProfile.averageDonation * 100) {
      reasons.push('Similar to projects you\'ve supported before');
    }

    if (project.creatorExperience > 0.7) {
      reasons.push('Created by an experienced project creator');
    }

    const daysRemaining = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysRemaining >= 30 && daysRemaining <= 60) {
      reasons.push('Optimal campaign timeline');
    }

    return reasons;
  }

  private calculateUserScore(userProfile: any, user: any): number {
    let score = 0.5; // Base score

    // Shared interests scoring
    const sharedInterests = userProfile.interests.filter((interest: string) => 
      user.interests?.includes(interest)
    );
    score += (sharedInterests.length / userProfile.interests.length) * 0.3;

    // Activity level scoring
    if (user.activityLevel === userProfile.activityLevel) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private calculateUserConfidence(userProfile: any, user: any): number {
    return 0.8; // Mock confidence
  }

  private generateUserReasons(userProfile: any, user: any): string[] {
    const reasons: string[] = [];

    const sharedInterests = userProfile.interests.filter((interest: string) => 
      user.interests?.includes(interest)
    );

    if (sharedInterests.length > 0) {
      reasons.push(`Shares interests in ${sharedInterests.join(', ')}`);
    }

    if (user.activityLevel === userProfile.activityLevel) {
      reasons.push('Similar activity level');
    }

    return reasons;
  }

  private calculateContentScore(userProfile: any, content: any): number {
    let score = 0.5; // Base score

    // Category preference scoring
    if (userProfile.preferredCategories.includes(content.category)) {
      score += 0.3;
    }

    // Content type scoring
    if (content.type === 'article' && userProfile.preferredContentTypes?.includes('article')) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private calculateContentConfidence(userProfile: any, content: any): number {
    return 0.75; // Mock confidence
  }

  private generateContentReasons(userProfile: any, content: any): string[] {
    const reasons: string[] = [];

    if (userProfile.preferredCategories.includes(content.category)) {
      reasons.push(`Matches your interest in ${content.category}`);
    }

    if (content.type === 'article') {
      reasons.push('Educational content to expand your knowledge');
    }

    return reasons;
  }

  private generateActionRecommendations(userProfile: any): any[] {
    const actions: any[] = [];

    // Based on user behavior, generate action recommendations
    if (userProfile.totalDonated < 100) {
      actions.push({
        title: 'Increase Your Impact',
        description: 'Consider making a larger donation to support causes you care about',
        score: 0.8,
        confidence: 0.9,
        action: 'increase_donation',
        priority: 'medium',
        estimatedImpact: 'Medium impact on project success',
        steps: [
          'Review your donation history',
          'Identify projects you care about',
          'Consider increasing donation amount'
        ]
      });
    }

    if (userProfile.projectCount === 0) {
      actions.push({
        title: 'Create Your First Project',
        description: 'Start your own project to make a difference in your community',
        score: 0.9,
        confidence: 0.95,
        action: 'create_project',
        priority: 'high',
        estimatedImpact: 'High impact on community engagement',
        steps: [
          'Identify a cause you care about',
          'Plan your project details',
          'Set realistic funding goals',
          'Create compelling project description'
        ]
      });
    }

    return actions;
  }

  private async getAvailableProjects(): Promise<any[]> {
    // Mock data - in real implementation, this would fetch from database
    return [
      {
        _id: 'proj1',
        title: 'Community Garden Initiative',
        description: 'Creating a sustainable community garden in downtown area',
        category: 'Community Organization',
        fundingGoal: 5000,
        currentFunding: 2500,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        creatorName: 'John Smith',
        creatorExperience: 0.8,
        imageUrl: '/images/garden.jpg'
      }
    ];
  }

  private async getAvailableUsers(): Promise<any[]> {
    // Mock data - in real implementation, this would fetch from database
    return [
      {
        _id: 'user1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        interests: ['Political Campaign', 'Social Justice'],
        activityLevel: 'high',
        mutualConnections: 5,
        sharedInterests: 2
      }
    ];
  }

  private async getAvailableContent(): Promise<any[]> {
    // Mock data - in real implementation, this would fetch from database
    return [
      {
        _id: 'content1',
        title: 'How to Start a Political Campaign',
        type: 'article',
        description: 'A comprehensive guide to launching your political campaign',
        category: 'Political Campaign',
        url: '/articles/political-campaign-guide',
        readTime: 10
      }
    ];
  }
}

export const recommendationEngine = RecommendationEngine.getInstance();
