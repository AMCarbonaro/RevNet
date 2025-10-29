import { User } from '../models/user.model';
import { LetterProgress } from '../models/letter.model';
import { Revolt } from '../models/revolt.model';

export interface AppState {
  // User state
  user: UserState;
  
  // Revolts state
  revolts: RevoltsState;
  
  // Channels state
  channels: ChannelsState;
  
  // Messages state
  messages: MessagesState;
  
  // Voice state
  voice: VoiceState;
  
  // UI state
  ui: UiState;
  
  // Notifications state
  notifications: NotificationsState;
}

export interface MessagesState {
  messages: any[];
  isLoading: boolean;
  error: string | null;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  letterProgress: LetterProgress;
  isLoading: boolean;
  error: string | null;
}

export interface RevoltsState {
  joinedRevolts: Revolt[];
  availableRevolts: Revolt[];
  currentRevolt: Revolt | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChannelsState {
  channels: any[]; // Channel interface will be defined later
  currentChannel: any | null;
  messages: any[]; // Message interface will be defined later
  isLoading: boolean;
  error: string | null;
}

export interface VoiceState {
  isConnected: boolean;
  currentVoiceChannel: any | null;
  participants: any[];
  isMuted: boolean;
  isDeafened: boolean;
  isScreenSharing: boolean;
}

export interface UiState {
  sidebarOpen: boolean;
  currentView: string;
  theme: 'light' | 'dark';
  loading: boolean;
}

export interface NotificationsState {
  notifications: any[];
  unreadCount: number;
}
