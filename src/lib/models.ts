import mongoose, { Schema, Document } from 'mongoose';
import { User, Project, Letter, Donation, Organization, ChatMessage, FeedPost, Notification } from '@/types';

// User Schema
const userSchema = new Schema<User & Document>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  userType: { type: String, enum: ['creator', 'supporter'], required: true },
  letterProgress: {
    completedLetters: [Number],
    currentBook: { type: Number, default: 1 },
    currentLetter: { type: Number, default: 1 },
    totalProgress: { type: Number, default: 0 },
    lastCompletedAt: Date,
    assignmentsCompleted: [Number]
  },
  stats: {
    totalDonations: { type: Number, default: 0 },
    totalProjects: { type: Number, default: 0 },
    totalLettersRead: { type: Number, default: 0 },
    totalAssignmentsCompleted: { type: Number, default: 0 },
    revolutionaryBadge: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now }
  },
  achievements: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    unlockedAt: Date
  }],
  // Security
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  backupCodes: [String],
  twoFactorLastUsed: { type: Date },
  twoFactorSetupDate: { type: Date },
  twoFactorDisabledDate: { type: Date },
  webauthnCredentials: [{
    id: { type: String, required: true },
    publicKey: { type: String, required: true },
    counter: { type: Number, default: 0 },
    deviceType: { type: String, enum: ['platform', 'cross-platform'] },
    transports: [String],
    createdAt: { type: Date, default: Date.now },
    lastUsed: { type: Date },
    name: { type: String },
    userAgent: { type: String }
  }],
  webauthnChallenge: { type: String },
  webauthnChallengeExpiry: { type: Date },
  webauthnLastUsed: { type: Date },
  securityEvents: [{
    id: { type: String, required: true },
    type: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String },
    userAgent: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    description: { type: String },
    metadata: { type: Schema.Types.Mixed }
  }],
  riskScore: { type: Number, default: 0 },
  lastSecurityReview: { type: Date },
  // Email Preferences
  emailPreferences: {
    newsletters: { type: Boolean, default: true },
    projectUpdates: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  unsubscribeToken: { type: String },
  unsubscribedAt: { type: Date },
  lastPreferenceUpdate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Project Schema
const projectSchema = new Schema<Project & Document>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String, required: true },
  category: { type: String, required: true },
  tags: [String],
  creatorId: { type: String, required: true },
  creatorName: { type: String, required: true },
  creatorEmail: { type: String, required: true },
  fundingGoal: { type: Number, required: true },
  currentFunding: { type: Number, default: 0 },
  backers: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'cancelled', 'paused'], 
    default: 'draft' 
  },
  timeline: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    milestones: [{
      id: String,
      title: String,
      description: String,
      targetDate: Date,
      completed: { type: Boolean, default: false },
      completedAt: Date
    }]
  },
  team: [{
    id: String,
    title: String,
    description: String,
    requirements: [String],
    filled: { type: Boolean, default: false },
    userId: String,
    userName: String,
    appliedUsers: [String]
  }],
  updates: [{
    id: String,
    title: String,
    content: String,
    authorId: String,
    authorName: String,
    createdAt: { type: Date, default: Date.now },
    images: [String]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Letter Schema
const letterSchema = new Schema<Letter & Document>({
  id: { type: Number, required: true, unique: true },
  book: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  assignment: { type: String, required: true },
  theme: { type: String, required: true },
  unlocks: [String],
  requiredLetters: [Number],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Donation Schema
const donationSchema = new Schema<Donation & Document>({
  id: { type: String, required: true, unique: true },
  projectId: { type: String, required: true },
  donorId: String,
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  message: String,
  anonymous: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  stripePaymentIntentId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Organization Schema
const organizationSchema = new Schema<Organization & Document>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['individual', 'committee', 'pac', 'super_pac'], 
    required: true 
  },
  fecId: String,
  fecStatus: { 
    type: String, 
    enum: ['compliant', 'warning', 'violation', 'unknown'], 
    default: 'unknown' 
  },
  totalRaised: { type: Number, default: 0 },
  lastFecCheck: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Chat Message Schema
const chatMessageSchema = new Schema<ChatMessage & Document>({
  id: { type: String, required: true, unique: true },
  roomId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  reactions: [{
    emoji: String,
    userId: String,
    userName: String,
    timestamp: { type: Date, default: Date.now }
  }],
  edited: { type: Boolean, default: false },
  editedAt: Date
});

// Feed Post Schema
const feedPostSchema = new Schema<FeedPost & Document>({
  id: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['project_update', 'donation', 'milestone', 'achievement'], 
    required: true 
  },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  metadata: Schema.Types.Mixed,
  likes: [String],
  comments: [{
    id: String,
    authorId: String,
    authorName: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Notification Schema
const notificationSchema = new Schema<Notification & Document>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['donation', 'project_update', 'milestone', 'achievement', 'system'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  metadata: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

// Analytics Event Schema
const analyticsEventSchema = new Schema({
  userId: { type: String, required: true },
  event: { type: String, required: true },
  properties: { type: Schema.Types.Mixed, required: true },
  sessionId: { type: String, required: true },
  page: { type: String, required: true },
  referrer: { type: String },
  userAgent: { type: String },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ML Prediction Schema
const mlPredictionSchema = new Schema({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['project-success', 'user-segmentation', 'churn-prediction', 'recommendations'], 
    required: true 
  },
  inputData: { type: Schema.Types.Mixed, required: true },
  prediction: { type: Schema.Types.Mixed, required: true },
  confidence: { type: Number, required: true },
  modelVersion: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// A/B Test Schema
const abTestSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'running', 'paused', 'completed'], 
    default: 'draft' 
  },
  hypothesis: { type: String, required: true },
  metric: { type: String, required: true },
  variants: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    trafficPercentage: { type: Number, required: true },
    configuration: { type: Schema.Types.Mixed, required: true },
    isControl: { type: Boolean, default: false }
  }],
  trafficSplit: { type: Number, default: 50 },
  startDate: { type: Date },
  endDate: { type: Date },
  results: {
    totalUsers: { type: Number, default: 0 },
    variants: [{
      variantId: { type: String, required: true },
      users: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      improvement: { type: Number, default: 0 }
    }],
    statisticalSignificance: { type: Number, default: 0 },
    winner: { type: String },
    recommendation: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// User Segment Schema
const userSegmentSchema = new Schema({
  segmentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  characteristics: {
    avgDonationAmount: { type: Number, default: 0 },
    preferredCategories: [String],
    activityLevel: { 
      type: String, 
      enum: ['high', 'medium', 'low'], 
      default: 'medium' 
    },
    engagementScore: { type: Number, default: 0 }
  },
  users: [String],
  size: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ 'stats.lastActiveAt': -1 });

projectSchema.index({ status: 1 });
projectSchema.index({ creatorId: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ currentFunding: -1 });

letterSchema.index({ book: 1, id: 1 });
letterSchema.index({ requiredLetters: 1 });

donationSchema.index({ projectId: 1 });
donationSchema.index({ donorId: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });

organizationSchema.index({ type: 1 });
organizationSchema.index({ fecStatus: 1 });

chatMessageSchema.index({ roomId: 1, timestamp: -1 });
chatMessageSchema.index({ senderId: 1 });

feedPostSchema.index({ type: 1 });
feedPostSchema.index({ authorId: 1 });
feedPostSchema.index({ createdAt: -1 });

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

// Create indexes for new models
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ event: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1 });

mlPredictionSchema.index({ userId: 1, timestamp: -1 });
mlPredictionSchema.index({ type: 1, timestamp: -1 });

abTestSchema.index({ status: 1 });
abTestSchema.index({ createdAt: -1 });

userSegmentSchema.index({ segmentId: 1 });
userSegmentSchema.index({ createdAt: -1 });

performanceMetricsSchema.index({ userId: 1, timestamp: -1 });
performanceMetricsSchema.index({ url: 1, timestamp: -1 });
performanceMetricsSchema.index({ timestamp: -1 });

// Export models
export const UserModel = mongoose.models.User || mongoose.model<User & Document>('User', userSchema);
export const ProjectModel = mongoose.models.Project || mongoose.model<Project & Document>('Project', projectSchema);
export const LetterModel = mongoose.models.Letter || mongoose.model<Letter & Document>('Letter', letterSchema);
export const DonationModel = mongoose.models.Donation || mongoose.model<Donation & Document>('Donation', donationSchema);
export const OrganizationModel = mongoose.models.Organization || mongoose.model<Organization & Document>('Organization', organizationSchema);
export const ChatMessageModel = mongoose.models.ChatMessage || mongoose.model<ChatMessage & Document>('ChatMessage', chatMessageSchema);
export const FeedPostModel = mongoose.models.FeedPost || mongoose.model<FeedPost & Document>('FeedPost', feedPostSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model<Notification & Document>('Notification', notificationSchema);

// Performance Metrics Schema
const performanceMetricsSchema = new Schema({
  userId: { type: String, required: true },
  url: { type: String, required: true },
  metrics: {
    lcp: { type: Number, default: 0 },
    fid: { type: Number, default: 0 },
    cls: { type: Number, default: 0 },
    fcp: { type: Number, default: 0 },
    ttfb: { type: Number, default: 0 },
    pageLoadTime: { type: Number, default: 0 },
    domContentLoaded: { type: Number, default: 0 },
    resourceLoadTime: { type: Number, default: 0 },
    cacheHitRate: { type: Number, default: 0 },
    networkRequests: { type: Number, default: 0 },
    offlineRequests: { type: Number, default: 0 }
  },
  userAgent: { type: String },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Export new analytics and ML models
export const AnalyticsEventModel = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', analyticsEventSchema);
export const MLPredictionModel = mongoose.models.MLPrediction || mongoose.model('MLPrediction', mlPredictionSchema);
export const ABTestModel = mongoose.models.ABTest || mongoose.model('ABTest', abTestSchema);
export const UserSegmentModel = mongoose.models.UserSegment || mongoose.model('UserSegment', userSegmentSchema);
export const PerformanceMetricsModel = mongoose.models.PerformanceMetrics || mongoose.model('PerformanceMetrics', performanceMetricsSchema);
