import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export interface OfflineAction {
  id: string;
  type: string;
  endpoint: string;
  method: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  isProcessing: boolean;
}

class OfflineService {
  private state: OfflineState = {
    isOnline: false,
    pendingActions: [],
    isProcessing: false
  };

  private listeners: ((state: OfflineState) => void)[] = [];
  private queueKey = 'offline_queue';

  /**
   * Initialize offline service
   */
  async initialize(): Promise<void> {
    // Check initial network status
    const netInfo = await NetInfo.fetch();
    this.state.isOnline = netInfo.isConnected || false;

    // Load pending actions from storage
    await this.loadPendingActions();

    // Subscribe to network changes
    NetInfo.addEventListener(state => {
      const wasOffline = !this.state.isOnline;
      this.state.isOnline = state.isConnected || false;

      // If we just came back online, process pending actions
      if (wasOffline && this.state.isOnline) {
        this.processPendingActions();
      }

      this.notifyListeners();
    });

    this.notifyListeners();
  }

  /**
   * Subscribe to offline state changes
   */
  subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Get current offline state
   */
  getState(): OfflineState {
    return { ...this.state };
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return this.state.isOnline;
  }

  /**
   * Queue action for offline execution
   */
  async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const offlineAction: OfflineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.state.pendingActions.push(offlineAction);
    await this.savePendingActions();
    this.notifyListeners();

    // If online, try to execute immediately
    if (this.state.isOnline) {
      await this.executeAction(offlineAction);
    }
  }

  /**
   * Process all pending actions
   */
  async processPendingActions(): Promise<void> {
    if (this.state.isProcessing || !this.state.isOnline) {
      return;
    }

    this.state.isProcessing = true;
    this.notifyListeners();

    try {
      const actions = [...this.state.pendingActions];
      
      for (const action of actions) {
        await this.executeAction(action);
      }
    } catch (error) {
      console.error('Error processing pending actions:', error);
    } finally {
      this.state.isProcessing = false;
      this.notifyListeners();
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: OfflineAction): Promise<void> {
    try {
      const axios = require('axios');
      
      const response = await axios({
        method: action.method,
        url: `https://revolutionnetwork.com/api${action.endpoint}`,
        data: action.data,
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if available
          ...(await this.getAuthHeaders())
        }
      });

      // Remove successful action from queue
      await this.removeAction(action.id);
      
      // Show success notification
      Alert.alert('Success', 'Action completed successfully');

    } catch (error: any) {
      console.error('Action execution failed:', error);
      
      // Increment retry count
      action.retryCount++;
      
      // Remove action if max retries reached
      if (action.retryCount >= 3) {
        await this.removeAction(action.id);
        Alert.alert('Failed', 'Action failed after multiple attempts');
      } else {
        await this.savePendingActions();
      }
    }
  }

  /**
   * Remove action from queue
   */
  private async removeAction(actionId: string): Promise<void> {
    this.state.pendingActions = this.state.pendingActions.filter(
      action => action.id !== actionId
    );
    await this.savePendingActions();
    this.notifyListeners();
  }

  /**
   * Save pending actions to storage
   */
  private async savePendingActions(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.queueKey,
        JSON.stringify(this.state.pendingActions)
      );
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  }

  /**
   * Load pending actions from storage
   */
  private async loadPendingActions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.queueKey);
      if (stored) {
        this.state.pendingActions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  }

  /**
   * Get authentication headers
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const authService = require('./auth').authService;
      const token = await authService.getToken();
      
      if (token) {
        return { 'Authorization': `Bearer ${token}` };
      }
    } catch (error) {
      console.error('Error getting auth headers:', error);
    }
    
    return {};
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Clear all pending actions
   */
  async clearPendingActions(): Promise<void> {
    this.state.pendingActions = [];
    await AsyncStorage.removeItem(this.queueKey);
    this.notifyListeners();
  }

  /**
   * Get action count
   */
  getPendingActionCount(): number {
    return this.state.pendingActions.length;
  }

  /**
   * Retry failed actions
   */
  async retryFailedActions(): Promise<void> {
    if (!this.state.isOnline) {
      Alert.alert('Offline', 'Cannot retry actions while offline');
      return;
    }

    await this.processPendingActions();
  }
}

// Singleton instance
export const offlineService = new OfflineService();
export default offlineService;
