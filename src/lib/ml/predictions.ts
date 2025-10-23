import { mlModelManager, ProjectPrediction, UserSegment, ChurnPrediction } from './models';
import { logInfo, logError } from '../logger';

export interface PredictionRequest {
  type: 'project-success' | 'user-segmentation' | 'churn-prediction' | 'recommendations';
  data: any;
  userId?: string;
}

export interface PredictionResponse {
  success: boolean;
  data: any;
  timestamp: Date;
  modelVersion: string;
  confidence: number;
}

export interface RecommendationEngine {
  userId: string;
  recommendations: {
    projectId: string;
    score: number;
    reason: string;
    category: string;
  }[];
  totalRecommendations: number;
}

export interface FunnelAnalysis {
  stage: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
  averageTimeInStage: number;
}

export interface CohortAnalysis {
  cohort: string;
  period: string;
  users: number;
  retentionRate: number;
  revenue: number;
  avgSessionDuration: number;
}

export class PredictionEngine {
  private static instance: PredictionEngine;
  private predictionCache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  static getInstance(): PredictionEngine {
    if (!PredictionEngine.instance) {
      PredictionEngine.instance = new PredictionEngine();
    }
    return PredictionEngine.instance;
  }

  constructor() {
    // Set up cache cleanup interval
    setInterval(() => {
      this.cleanupCache();
    }, 5 * 60 * 1000); // Clean cache every 5 minutes
  }

  async makePrediction(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      const cacheKey = this.generateCacheKey(request);
      
      // Check cache first
      if (this.isCacheValid(cacheKey)) {
        const cachedResult = this.predictionCache.get(cacheKey);
        logInfo('Prediction served from cache', { type: request.type, cacheKey });
        return cachedResult;
      }

      let predictionData: any;
      let confidence: number = 0.8;

      switch (request.type) {
        case 'project-success':
          predictionData = await mlModelManager.predictProjectSuccess(request.data);
          confidence = predictionData.confidence;
          break;
          
        case 'user-segmentation':
          predictionData = await mlModelManager.segmentUsers(request.data);
          confidence = 0.85;
          break;
          
        case 'churn-prediction':
          predictionData = await mlModelManager.predictChurn(request.data);
          confidence = predictionData.churnProbability;
          break;
          
        case 'recommendations':
          predictionData = await this.generateRecommendations(request.userId!, request.data);
          confidence = 0.75;
          break;
          
        default:
          throw new Error(`Unknown prediction type: ${request.type}`);
      }

      const response: PredictionResponse = {
        success: true,
        data: predictionData,
        timestamp: new Date(),
        modelVersion: '1.0.0',
        confidence
      };

      // Cache the result
      this.cachePrediction(cacheKey, response);

      logInfo('Prediction completed', { 
        type: request.type, 
        confidence,
        cacheKey 
      });

      return response;
    } catch (error) {
      logError(error as Error, { context: 'prediction_engine', type: request.type });
      
      return {
        success: false,
        data: null,
        timestamp: new Date(),
        modelVersion: '1.0.0',
        confidence: 0
      };
    }
  }

  async generateRecommendations(userId: string, availableProjects: any[]): Promise<RecommendationEngine> {
    try {
      // Get user preferences and history
      const userProfile = await this.getUserProfile(userId);
      
      const recommendations = availableProjects.map(project => {
        const score = this.calculateRecommendationScore(userProfile, project);
        return {
          projectId: project._id,
          score,
          reason: this.getRecommendationReason(userProfile, project),
          category: project.category
        };
      }).sort((a, b) => b.score - a.score).slice(0, 10);

      return {
        userId,
        recommendations,
        totalRecommendations: recommendations.length
      };
    } catch (error) {
      logError(error as Error, { context: 'recommendation_generation', userId });
      throw error;
    }
  }

  async analyzeFunnel(funnelData: any[]): Promise<FunnelAnalysis[]> {
    try {
      const stages = ['landing', 'signup', 'first_project', 'first_donation', 'repeat_donor'];
      const analysis: FunnelAnalysis[] = [];

      let previousUsers = funnelData.length; // Total users who landed

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const stageUsers = this.getUsersAtStage(funnelData, stage);
        const conversionRate = i === 0 ? 1 : stageUsers / previousUsers;
        const dropOffRate = 1 - conversionRate;
        const avgTimeInStage = this.calculateAverageTimeInStage(funnelData, stage);

        analysis.push({
          stage,
          users: stageUsers,
          conversionRate,
          dropOffRate,
          averageTimeInStage: avgTimeInStage
        });

        previousUsers = stageUsers;
      }

      return analysis;
    } catch (error) {
      logError(error as Error, { context: 'funnel_analysis' });
      throw error;
    }
  }

  async analyzeCohorts(userData: any[]): Promise<CohortAnalysis[]> {
    try {
      const cohorts: CohortAnalysis[] = [];
      const cohortPeriods = this.generateCohortPeriods();

      for (const period of cohortPeriods) {
        const cohortUsers = userData.filter(user => {
          const userJoinDate = new Date(user.createdAt);
          return this.isInCohortPeriod(userJoinDate, period);
        });

        const retentionRate = this.calculateRetentionRate(cohortUsers, period);
        const revenue = this.calculateCohortRevenue(cohortUsers);
        const avgSessionDuration = this.calculateAverageSessionDuration(cohortUsers);

        cohorts.push({
          cohort: period,
          period,
          users: cohortUsers.length,
          retentionRate,
          revenue,
          avgSessionDuration
        });
      }

      return cohorts;
    } catch (error) {
      logError(error as Error, { context: 'cohort_analysis' });
      throw error;
    }
  }

  async generateInsights(data: any): Promise<string[]> {
    try {
      const insights: string[] = [];

      // Analyze user growth
      const userGrowth = this.calculateUserGrowth(data.users);
      if (userGrowth > 0.1) {
        insights.push(`User growth is strong at ${(userGrowth * 100).toFixed(1)}% this month`);
      } else if (userGrowth < -0.05) {
        insights.push(`User growth is declining at ${(userGrowth * 100).toFixed(1)}% this month`);
      }

      // Analyze donation trends
      const donationTrends = this.analyzeDonationTrends(data.donations);
      if (donationTrends.trend === 'increasing') {
        insights.push(`Donations are trending upward with ${donationTrends.change}% increase`);
      } else if (donationTrends.trend === 'decreasing') {
        insights.push(`Donations are trending downward with ${donationTrends.change}% decrease`);
      }

      // Analyze project success rates
      const projectSuccessRate = this.calculateProjectSuccessRate(data.projects);
      if (projectSuccessRate > 0.7) {
        insights.push(`Project success rate is excellent at ${(projectSuccessRate * 100).toFixed(1)}%`);
      } else if (projectSuccessRate < 0.4) {
        insights.push(`Project success rate needs improvement at ${(projectSuccessRate * 100).toFixed(1)}%`);
      }

      // Analyze user engagement
      const engagementScore = this.calculateOverallEngagement(data.users);
      if (engagementScore > 0.8) {
        insights.push(`User engagement is high with a score of ${(engagementScore * 100).toFixed(1)}`);
      } else if (engagementScore < 0.5) {
        insights.push(`User engagement is low with a score of ${(engagementScore * 100).toFixed(1)}`);
      }

      // Analyze churn risk
      const highChurnUsers = await this.identifyHighChurnRiskUsers(data.users);
      if (highChurnUsers.length > 0) {
        insights.push(`${highChurnUsers.length} users are at high risk of churning`);
      }

      return insights;
    } catch (error) {
      logError(error as Error, { context: 'insights_generation' });
      return ['Unable to generate insights at this time'];
    }
  }

  // Helper methods
  private generateCacheKey(request: PredictionRequest): string {
    return `${request.type}-${JSON.stringify(request.data)}-${request.userId || ''}`;
  }

  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  private cachePrediction(cacheKey: string, prediction: PredictionResponse): void {
    this.predictionCache.set(cacheKey, prediction);
    this.cacheExpiry.set(cacheKey, Date.now() + (5 * 60 * 1000)); // 5 minutes cache
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.predictionCache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  private async getUserProfile(userId: string): Promise<any> {
    // This would fetch user profile from database
    // For now, return a mock profile
    return {
      _id: userId,
      preferredCategories: ['Political Campaign', 'Social Justice'],
      donationHistory: [
        { amount: 50, category: 'Political Campaign' },
        { amount: 100, category: 'Social Justice' }
      ],
      averageDonation: 75,
      totalDonated: 150
    };
  }

  private calculateRecommendationScore(userProfile: any, project: any): number {
    let score = 0.5; // Base score

    // Category preference scoring
    if (userProfile.preferredCategories.includes(project.category)) {
      score += 0.3;
    }

    // Funding goal scoring
    if (project.fundingGoal <= userProfile.averageDonation * 100) {
      score += 0.2;
    }

    // Creator similarity scoring (mock)
    score += Math.random() * 0.2;

    return Math.min(score, 1.0);
  }

  private getRecommendationReason(userProfile: any, project: any): string {
    if (userProfile.preferredCategories.includes(project.category)) {
      return `Matches your interest in ${project.category}`;
    }
    if (project.fundingGoal <= userProfile.averageDonation * 100) {
      return 'Similar to projects you\'ve supported before';
    }
    return 'Recommended based on your activity patterns';
  }

  private getUsersAtStage(funnelData: any[], stage: string): number {
    // Mock implementation - would query actual data
    return Math.floor(funnelData.length * (0.9 - (funnelData.indexOf(stage) * 0.15)));
  }

  private calculateAverageTimeInStage(funnelData: any[], stage: string): number {
    // Mock implementation - would calculate actual time
    return Math.random() * 24 * 60 * 60 * 1000; // Random time in milliseconds
  }

  private generateCohortPeriods(): string[] {
    const periods: string[] = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push(date.toISOString().substring(0, 7)); // YYYY-MM format
    }
    
    return periods;
  }

  private isInCohortPeriod(userJoinDate: Date, period: string): boolean {
    const userPeriod = userJoinDate.toISOString().substring(0, 7);
    return userPeriod === period;
  }

  private calculateRetentionRate(users: any[], period: string): number {
    // Mock implementation - would calculate actual retention
    return Math.random() * 0.5 + 0.3; // Random retention between 30-80%
  }

  private calculateCohortRevenue(users: any[]): number {
    return users.reduce((sum, user) => sum + (user.totalDonated || 0), 0);
  }

  private calculateAverageSessionDuration(users: any[]): number {
    return users.reduce((sum, user) => sum + (user.avgSessionDuration || 0), 0) / users.length;
  }

  private calculateUserGrowth(users: any[]): number {
    // Mock implementation - would calculate actual growth
    return Math.random() * 0.2 - 0.1; // Random growth between -10% and +10%
  }

  private analyzeDonationTrends(donations: any[]): { trend: string; change: number } {
    // Mock implementation - would analyze actual trends
    const change = Math.random() * 20 - 10; // Random change between -10% and +10%
    return {
      trend: change > 0 ? 'increasing' : 'decreasing',
      change: Math.abs(change)
    };
  }

  private calculateProjectSuccessRate(projects: any[]): number {
    const successfulProjects = projects.filter(p => p.status === 'completed' && p.currentFunding >= p.fundingGoal);
    return successfulProjects.length / projects.length;
  }

  private calculateOverallEngagement(users: any[]): number {
    const totalEngagement = users.reduce((sum, user) => {
      let engagement = 0;
      if (user.donationCount > 0) engagement += 0.3;
      if (user.projectCount > 0) engagement += 0.3;
      if (user.commentCount > 0) engagement += 0.2;
      if (user.shareCount > 0) engagement += 0.2;
      return sum + engagement;
    }, 0);
    
    return totalEngagement / users.length;
  }

  private async identifyHighChurnRiskUsers(users: any[]): Promise<any[]> {
    const highRiskUsers: any[] = [];
    
    for (const user of users) {
      const churnPrediction = await mlModelManager.predictChurn(user);
      if (churnPrediction.riskLevel === 'high') {
        highRiskUsers.push(user);
      }
    }
    
    return highRiskUsers;
  }
}

export const predictionEngine = PredictionEngine.getInstance();
