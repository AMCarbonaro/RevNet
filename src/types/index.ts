import { ObjectId } from 'mongodb';

// User Types
export interface User {
  _id?: ObjectId;
  id: string;
  name: string;
  email: string;
  image?: string;
  userType: 'creator' | 'supporter';
  letterProgress: LetterProgress;
  stats: UserStats;
  achievements: Achievement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LetterProgress {
  completedLetters: number[];
  currentBook: number;
  currentLetter: number;
  totalProgress: number;
  lastCompletedAt?: Date;
  assignmentsCompleted: number[];
}

export interface UserStats {
  totalDonations: number;
  totalProjects: number;
  totalLettersRead: number;
  totalAssignmentsCompleted: number;
  revolutionaryBadge: boolean;
  lastActiveAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

// Project Types
export interface Project {
  _id?: ObjectId;
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string[];
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  fundingGoal: number;
  currentFunding: number;
  backers: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'paused';
  timeline: {
    startDate: Date;
    endDate: Date;
    milestones: Milestone[];
  };
  team: ProjectRole[];
  updates: ProjectUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface ProjectRole {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  filled: boolean;
  userId?: string;
  userName?: string;
  appliedUsers: string[];
}

export interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  images?: string[];
}

// Letter Types
export interface Letter {
  _id?: ObjectId;
  id: number;
  book: number;
  title: string;
  content: string;
  assignment: string;
  theme: string;
  unlocks: string[];
  requiredLetters: number[];
  createdAt: Date;
  updatedAt: Date;
}

// Donation Types
export interface Donation {
  _id?: ObjectId;
  id: string;
  projectId: string;
  donorId?: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  message?: string;
  anonymous: boolean;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Organization Types
export interface Organization {
  _id?: ObjectId;
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'committee' | 'pac' | 'super_pac';
  fecId?: string;
  fecStatus: 'compliant' | 'warning' | 'violation' | 'unknown';
  totalRaised: number;
  lastFecCheck: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Types
export interface ChatMessage {
  _id?: ObjectId;
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  reactions: MessageReaction[];
  edited: boolean;
  editedAt?: Date;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

// Feed Types
export interface FeedPost {
  _id?: ObjectId;
  id: string;
  type: 'project_update' | 'donation' | 'milestone' | 'achievement';
  authorId: string;
  authorName: string;
  content: string;
  metadata: any;
  likes: string[];
  comments: FeedComment[];
  createdAt: Date;
}

export interface FeedComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  _id?: ObjectId;
  id: string;
  userId: string;
  type: 'donation' | 'project_update' | 'milestone' | 'achievement' | 'system';
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface CreateProjectForm {
  title: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string[];
  fundingGoal: number;
  timeline: {
    startDate: string;
    endDate: string;
  };
  team: Omit<ProjectRole, 'id' | 'filled' | 'appliedUsers'>[];
}

export interface DonationForm {
  amount: number;
  donorName: string;
  donorEmail: string;
  message?: string;
  anonymous: boolean;
}

// Socket.IO Event Types
export interface SocketEvents {
  // Chat events
  'join-room': (roomId: string) => void;
  'leave-room': (roomId: string) => void;
  'send-message': (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  'message-reaction': (messageId: string, reaction: Omit<MessageReaction, 'timestamp'>) => void;
  
  // Presence events
  'user-online': (userId: string) => void;
  'user-offline': (userId: string) => void;
  'typing-start': (roomId: string, userId: string) => void;
  'typing-stop': (roomId: string, userId: string) => void;
  
  // Project events
  'project-update': (projectId: string, update: ProjectUpdate) => void;
  'donation-received': (projectId: string, donation: Donation) => void;
  
  // Notification events
  'notification': (notification: Notification) => void;
}

// FEC Compliance Types
export interface FecComplianceStatus {
  organizationId: string;
  totalRaised: number;
  threshold4500: boolean;
  threshold5000: boolean;
  lastChecked: Date;
  status: 'compliant' | 'warning' | 'violation';
  violations: FecViolation[];
}

export interface FecViolation {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: Date;
  resolved: boolean;
}

// Analytics Types
export interface AnalyticsEvent {
  userId?: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
}

export interface UserAnalytics {
  userId: string;
  events: AnalyticsEvent[];
  sessionDuration: number;
  pageViews: number;
  lastActiveAt: Date;
}
