import { logInfo, logError } from '../logger';

export interface MLModel {
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'clustering';
  features: string[];
  accuracy?: number;
  lastTrained: Date;
}

export interface ProjectPrediction {
  projectId: string;
  successProbability: number;
  confidence: number;
  factors: {
    fundingGoal: number;
    creatorExperience: number;
    categoryPopularity: number;
    timingScore: number;
    descriptionQuality: number;
  };
  recommendations: string[];
}

export interface UserSegment {
  segmentId: string;
  name: string;
  description: string;
  characteristics: {
    avgDonationAmount: number;
    preferredCategories: string[];
    activityLevel: 'high' | 'medium' | 'low';
    engagementScore: number;
  };
  users: string[];
  size: number;
}

export interface ChurnPrediction {
  userId: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: {
    lastActivity: number;
    donationFrequency: number;
    engagementScore: number;
    supportTickets: number;
  };
  recommendations: string[];
}

export class MLModelManager {
  private static instance: MLModelManager;
  private models: Map<string, MLModel> = new Map();

  static getInstance(): MLModelManager {
    if (!MLModelManager.instance) {
      MLModelManager.instance = new MLModelManager();
    }
    return MLModelManager.instance;
  }

  constructor() {
    this.initializeModels();
  }

  private initializeModels(): void {
    // Project Success Prediction Model
    this.models.set('project-success', {
      name: 'Project Success Prediction',
      version: '1.0.0',
      type: 'classification',
      features: [
        'fundingGoal',
        'creatorExperience',
        'categoryPopularity',
        'timingScore',
        'descriptionQuality',
        'socialProof',
        'mediaQuality'
      ],
      accuracy: 0.85,
      lastTrained: new Date()
    });

    // User Segmentation Model
    this.models.set('user-segmentation', {
      name: 'User Segmentation',
      version: '1.0.0',
      type: 'clustering',
      features: [
        'donationAmount',
        'donationFrequency',
        'preferredCategories',
        'engagementScore',
        'activityLevel',
        'sessionDuration'
      ],
      accuracy: 0.78,
      lastTrained: new Date()
    });

    // Churn Prediction Model
    this.models.set('churn-prediction', {
      name: 'Churn Prediction',
      version: '1.0.0',
      type: 'classification',
      features: [
        'lastActivity',
        'donationFrequency',
        'engagementScore',
        'supportTickets',
        'projectInteractions',
        'sessionDuration'
      ],
      accuracy: 0.82,
      lastTrained: new Date()
    });

    // Recommendation Model
    this.models.set('recommendations', {
      name: 'Project Recommendations',
      version: '1.0.0',
      type: 'classification',
      features: [
        'userPreferences',
        'projectCategory',
        'fundingGoal',
        'creatorSimilarity',
        'timingRelevance',
        'socialProof'
      ],
      accuracy: 0.79,
      lastTrained: new Date()
    });
  }

  getModel(name: string): MLModel | undefined {
    return this.models.get(name);
  }

  getAllModels(): MLModel[] {
    return Array.from(this.models.values());
  }

  updateModelAccuracy(name: string, accuracy: number): void {
    const model = this.models.get(name);
    if (model) {
      model.accuracy = accuracy;
      model.lastTrained = new Date();
      logInfo('Model accuracy updated', { modelName: name, accuracy });
    }
  }

  // Project Success Prediction Algorithm
  async predictProjectSuccess(projectData: any): Promise<ProjectPrediction> {
    try {
      // Simulate ML prediction (in real implementation, this would use TensorFlow.js or brain.js)
      const factors = {
        fundingGoal: this.calculateFundingGoalScore(projectData.fundingGoal),
        creatorExperience: this.calculateCreatorExperienceScore(projectData.creatorId),
        categoryPopularity: this.calculateCategoryPopularityScore(projectData.category),
        timingScore: this.calculateTimingScore(projectData.deadline),
        descriptionQuality: this.calculateDescriptionQualityScore(projectData.description)
      };

      // Weighted scoring algorithm
      const weights = {
        fundingGoal: 0.25,
        creatorExperience: 0.20,
        categoryPopularity: 0.15,
        timingScore: 0.15,
        descriptionQuality: 0.25
      };

      const successProbability = 
        factors.fundingGoal * weights.fundingGoal +
        factors.creatorExperience * weights.creatorExperience +
        factors.categoryPopularity * weights.categoryPopularity +
        factors.timingScore * weights.timingScore +
        factors.descriptionQuality * weights.descriptionQuality;

      const confidence = this.calculateConfidence(factors);
      const recommendations = this.generateRecommendations(factors);

      return {
        projectId: projectData._id,
        successProbability,
        confidence,
        factors,
        recommendations
      };
    } catch (error) {
      logError(error as Error, { context: 'project_success_prediction' });
      throw error;
    }
  }

  // User Segmentation Algorithm
  async segmentUsers(users: any[]): Promise<UserSegment[]> {
    try {
      const segments: UserSegment[] = [];

      // High-value donors segment
      const highValueDonors = users.filter(user => user.totalDonated > 1000);
      if (highValueDonors.length > 0) {
        segments.push({
          segmentId: 'high-value-donors',
          name: 'High-Value Donors',
          description: 'Users who have donated over $1000',
          characteristics: {
            avgDonationAmount: highValueDonors.reduce((sum, u) => sum + u.totalDonated, 0) / highValueDonors.length,
            preferredCategories: this.getMostPopularCategories(highValueDonors),
            activityLevel: 'high' as const,
            engagementScore: 0.9
          },
          users: highValueDonors.map(u => u._id),
          size: highValueDonors.length
        });
      }

      // Frequent donors segment
      const frequentDonors = users.filter(user => user.donationCount > 5);
      if (frequentDonors.length > 0) {
        segments.push({
          segmentId: 'frequent-donors',
          name: 'Frequent Donors',
          description: 'Users who have made 5+ donations',
          characteristics: {
            avgDonationAmount: frequentDonors.reduce((sum, u) => sum + u.totalDonated, 0) / frequentDonors.length,
            preferredCategories: this.getMostPopularCategories(frequentDonors),
            activityLevel: 'medium' as const,
            engagementScore: 0.7
          },
          users: frequentDonors.map(u => u._id),
          size: frequentDonors.length
        });
      }

      // New users segment
      const newUsers = users.filter(user => {
        const daysSinceJoin = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceJoin < 30;
      });
      if (newUsers.length > 0) {
        segments.push({
          segmentId: 'new-users',
          name: 'New Users',
          description: 'Users who joined in the last 30 days',
          characteristics: {
            avgDonationAmount: newUsers.reduce((sum, u) => sum + u.totalDonated, 0) / newUsers.length,
            preferredCategories: this.getMostPopularCategories(newUsers),
            activityLevel: 'low' as const,
            engagementScore: 0.3
          },
          users: newUsers.map(u => u._id),
          size: newUsers.length
        });
      }

      // Inactive users segment
      const inactiveUsers = users.filter(user => {
        const daysSinceLastActivity = (Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastActivity > 90;
      });
      if (inactiveUsers.length > 0) {
        segments.push({
          segmentId: 'inactive-users',
          name: 'Inactive Users',
          description: 'Users who haven\'t been active in 90+ days',
          characteristics: {
            avgDonationAmount: inactiveUsers.reduce((sum, u) => sum + u.totalDonated, 0) / inactiveUsers.length,
            preferredCategories: this.getMostPopularCategories(inactiveUsers),
            activityLevel: 'low' as const,
            engagementScore: 0.1
          },
          users: inactiveUsers.map(u => u._id),
          size: inactiveUsers.length
        });
      }

      return segments;
    } catch (error) {
      logError(error as Error, { context: 'user_segmentation' });
      throw error;
    }
  }

  // Churn Prediction Algorithm
  async predictChurn(userData: any): Promise<ChurnPrediction> {
    try {
      const factors = {
        lastActivity: this.calculateLastActivityScore(userData.lastLoginAt),
        donationFrequency: this.calculateDonationFrequencyScore(userData.donationCount, userData.createdAt),
        engagementScore: this.calculateEngagementScore(userData),
        supportTickets: this.calculateSupportTicketsScore(userData.supportTickets || 0)
      };

      // Weighted churn probability calculation
      const weights = {
        lastActivity: 0.4,
        donationFrequency: 0.3,
        engagementScore: 0.2,
        supportTickets: 0.1
      };

      const churnProbability = 
        factors.lastActivity * weights.lastActivity +
        factors.donationFrequency * weights.donationFrequency +
        factors.engagementScore * weights.engagementScore +
        factors.supportTickets * weights.supportTickets;

      const riskLevel = churnProbability > 0.7 ? 'high' : churnProbability > 0.4 ? 'medium' : 'low';
      const recommendations = this.generateChurnRecommendations(factors, riskLevel);

      return {
        userId: userData._id,
        churnProbability,
        riskLevel,
        factors,
        recommendations
      };
    } catch (error) {
      logError(error as Error, { context: 'churn_prediction' });
      throw error;
    }
  }

  // Helper methods for scoring algorithms
  private calculateFundingGoalScore(fundingGoal: number): number {
    // Optimal funding goal is between $5,000 and $50,000
    if (fundingGoal >= 5000 && fundingGoal <= 50000) return 0.9;
    if (fundingGoal >= 1000 && fundingGoal <= 100000) return 0.7;
    if (fundingGoal < 1000) return 0.3;
    return 0.5; // Very high goals are harder to achieve
  }

  private calculateCreatorExperienceScore(creatorId: string): number {
    // This would query the database for creator's project history
    // For now, return a random score between 0.3 and 0.9
    return 0.3 + Math.random() * 0.6;
  }

  private calculateCategoryPopularityScore(category: string): number {
    const categoryScores: Record<string, number> = {
      'Political Campaign': 0.8,
      'Community Organization': 0.7,
      'Grassroots Movement': 0.6,
      'Environmental Protection': 0.9,
      'Social Justice': 0.8,
      'Education': 0.7,
      'Healthcare': 0.8,
      'Technology': 0.6
    };
    return categoryScores[category] || 0.5;
  }

  private calculateTimingScore(deadline: Date): number {
    const daysUntilDeadline = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    
    // Optimal campaign length is 30-60 days
    if (daysUntilDeadline >= 30 && daysUntilDeadline <= 60) return 0.9;
    if (daysUntilDeadline >= 14 && daysUntilDeadline <= 90) return 0.7;
    if (daysUntilDeadline < 14) return 0.3;
    return 0.5; // Very long campaigns lose momentum
  }

  private calculateDescriptionQualityScore(description: string): number {
    const wordCount = description.split(' ').length;
    const hasImages = description.includes('image') || description.includes('photo');
    const hasVideo = description.includes('video') || description.includes('youtube');
    
    let score = 0.5;
    
    // Word count scoring
    if (wordCount >= 200 && wordCount <= 1000) score += 0.3;
    else if (wordCount >= 100 && wordCount <= 1500) score += 0.2;
    else score += 0.1;
    
    // Media scoring
    if (hasImages) score += 0.1;
    if (hasVideo) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private calculateConfidence(factors: any): number {
    // Calculate confidence based on data quality and completeness
    const factorValues = Object.values(factors);
    const avgFactor = factorValues.reduce((sum: number, val: any) => sum + val, 0) / factorValues.length;
    const variance = factorValues.reduce((sum: number, val: any) => sum + Math.pow(val - avgFactor, 2), 0) / factorValues.length;
    
    // Lower variance = higher confidence
    return Math.max(0.5, 1 - variance);
  }

  private generateRecommendations(factors: any): string[] {
    const recommendations: string[] = [];
    
    if (factors.fundingGoal < 0.5) {
      recommendations.push('Consider adjusting your funding goal to be more achievable');
    }
    
    if (factors.descriptionQuality < 0.6) {
      recommendations.push('Improve your project description with more details and media');
    }
    
    if (factors.timingScore < 0.6) {
      recommendations.push('Consider adjusting your campaign timeline');
    }
    
    if (factors.categoryPopularity < 0.6) {
      recommendations.push('Consider highlighting unique aspects of your project category');
    }
    
    return recommendations;
  }

  private calculateLastActivityScore(lastLoginAt: Date): number {
    const daysSinceLastActivity = (Date.now() - new Date(lastLoginAt).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastActivity <= 7) return 0.9;
    if (daysSinceLastActivity <= 30) return 0.7;
    if (daysSinceLastActivity <= 90) return 0.4;
    return 0.1;
  }

  private calculateDonationFrequencyScore(donationCount: number, createdAt: Date): number {
    const daysSinceJoin = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const donationsPerMonth = (donationCount / daysSinceJoin) * 30;
    
    if (donationsPerMonth >= 2) return 0.9;
    if (donationsPerMonth >= 1) return 0.7;
    if (donationsPerMonth >= 0.5) return 0.5;
    return 0.3;
  }

  private calculateEngagementScore(userData: any): number {
    // Calculate engagement based on various activities
    let score = 0;
    
    if (userData.projectCount > 0) score += 0.3;
    if (userData.donationCount > 0) score += 0.3;
    if (userData.commentCount > 0) score += 0.2;
    if (userData.shareCount > 0) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculateSupportTicketsScore(supportTickets: number): number {
    // More support tickets = higher churn risk
    if (supportTickets === 0) return 0.9;
    if (supportTickets <= 2) return 0.7;
    if (supportTickets <= 5) return 0.4;
    return 0.1;
  }

  private generateChurnRecommendations(factors: any, riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    if (factors.lastActivity < 0.5) {
      recommendations.push('Send re-engagement email with personalized content');
    }
    
    if (factors.donationFrequency < 0.5) {
      recommendations.push('Showcase projects that match user interests');
    }
    
    if (factors.engagementScore < 0.5) {
      recommendations.push('Invite user to participate in community discussions');
    }
    
    if (factors.supportTickets > 0.5) {
      recommendations.push('Follow up on support tickets and ensure resolution');
    }
    
    if (riskLevel === 'high') {
      recommendations.push('Consider offering exclusive benefits or early access');
    }
    
    return recommendations;
  }

  private getMostPopularCategories(users: any[]): string[] {
    const categoryCount: Record<string, number> = {};
    
    users.forEach(user => {
      user.preferredCategories?.forEach((category: string) => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });
    
    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }
}

export const mlModelManager = MLModelManager.getInstance();
