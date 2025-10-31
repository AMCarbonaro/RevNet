export interface User {
  id: string;
  email: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bio?: string;
  status: 'online' | 'away' | 'busy' | 'invisible';
  customStatus?: string;
  letterProgress: LetterProgress;
  revoltMemberships: string[];
  hasSeenWelcome?: boolean;
  createdAt: Date;
  lastActive: Date;
}

export interface LetterProgress {
  completedLetters: number[];
  currentLetter: number;
  totalLetters: number;
  canAccessDiscord: boolean;
  assignments: AssignmentProgress[];
}

export interface AssignmentProgress {
  letterId: number;
  assignmentId: string;
  completed: boolean;
  submittedAt?: Date;
  content?: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  verificationLink?: string; // Provided when email service is not configured
  message?: string;
}
