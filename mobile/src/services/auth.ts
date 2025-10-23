import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as Keychain from 'react-native-keychain';
import * as Biometrics from 'react-native-biometrics';
import axios from 'axios';

const API_BASE_URL = 'https://revolutionnetwork.com/api';

export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'creator' | 'supporter';
  image?: string;
  letterProgress: {
    completedLetters: number[];
    currentBook: number;
    currentLetter: number;
    totalProgress: number;
  };
  stats: {
    totalDonations: number;
    totalProjects: number;
    totalLettersRead: number;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
}

class AuthService {
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    biometricEnabled: false
  };

  private listeners: ((state: AuthState) => void)[] = [];

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  /**
   * Get current auth state
   */
  getState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Initialize auth service
   */
  async initialize(): Promise<void> {
    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      // Check for stored credentials
      const credentials = await Keychain.getInternetCredentials('revolution-network');
      
      if (credentials) {
        // Try to validate stored token
        const isValid = await this.validateToken(credentials.password);
        
        if (isValid) {
          this.authState.isAuthenticated = true;
          await this.loadUserProfile();
        } else {
          // Clear invalid credentials
          await this.clearCredentials();
        }
      }

      // Check biometric availability
      const biometricAvailable = await this.checkBiometricAvailability();
      this.authState.biometricEnabled = biometricAvailable;

    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      this.authState.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<boolean> {
    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
        email,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store credentials securely
        await Keychain.setInternetCredentials(
          'revolution-network',
          email,
          token
        );

        this.authState.user = user;
        this.authState.isAuthenticated = true;

        // Enable biometric authentication if available
        if (this.authState.biometricEnabled) {
          await this.enableBiometric();
        }

        this.notifyListeners();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Failed', error.response?.data?.message || 'Please check your credentials');
      return false;
    } finally {
      this.authState.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * Sign in with biometric authentication
   */
  async signInWithBiometric(): Promise<boolean> {
    if (!this.authState.biometricEnabled) {
      return false;
    }

    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      const result = await Biometrics.simplePrompt({
        promptMessage: 'Authenticate with biometrics to access Revolution Network'
      });

      if (result.success) {
        // Retrieve stored credentials
        const credentials = await Keychain.getInternetCredentials('revolution-network');
        
        if (credentials) {
          const isValid = await this.validateToken(credentials.password);
          
          if (isValid) {
            this.authState.isAuthenticated = true;
            await this.loadUserProfile();
            this.notifyListeners();
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Biometric sign in error:', error);
      return false;
    } finally {
      this.authState.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * Sign up new user
   */
  async signUp(userData: {
    name: string;
    email: string;
    password: string;
    userType: 'creator' | 'supporter';
  }): Promise<boolean> {
    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);

      if (response.data.success) {
        // Auto sign in after successful signup
        return await this.signIn(userData.email, userData.password);
      }

      return false;
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('Sign Up Failed', error.response?.data?.message || 'Please try again');
      return false;
    } finally {
      this.authState.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      // Clear stored credentials
      await this.clearCredentials();
      
      this.authState.user = null;
      this.authState.isAuthenticated = false;
      this.authState.biometricEnabled = false;

      this.notifyListeners();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  /**
   * Validate stored token
   */
  private async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load user profile
   */
  private async loadUserProfile(): Promise<void> {
    try {
      const credentials = await Keychain.getInternetCredentials('revolution-network');
      
      if (credentials) {
        const response = await axios.get(`${API_BASE_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${credentials.password}`
          }
        });

        if (response.data.success) {
          this.authState.user = response.data.data;
        }
      }
    } catch (error) {
      console.error('Load user profile error:', error);
    }
  }

  /**
   * Check biometric availability
   */
  private async checkBiometricAvailability(): Promise<boolean> {
    try {
      const result = await Biometrics.isSensorAvailable();
      return result.available;
    } catch (error) {
      return false;
    }
  }

  /**
   * Enable biometric authentication
   */
  private async enableBiometric(): Promise<void> {
    try {
      const result = await Biometrics.createKeys();
      
      if (result.success) {
        // Store biometric key for future authentication
        await AsyncStorage.setItem('biometric_enabled', 'true');
      }
    } catch (error) {
      console.error('Enable biometric error:', error);
    }
  }

  /**
   * Clear stored credentials
   */
  private async clearCredentials(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials('revolution-network');
      await AsyncStorage.removeItem('biometric_enabled');
    } catch (error) {
      console.error('Clear credentials error:', error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updateData: Partial<User>): Promise<boolean> {
    try {
      const credentials = await Keychain.getInternetCredentials('revolution-network');
      
      if (credentials) {
        const response = await axios.patch(`${API_BASE_URL}/user/profile`, updateData, {
          headers: {
            'Authorization': `Bearer ${credentials.password}`
          }
        });

        if (response.data.success) {
          this.authState.user = { ...this.authState.user, ...response.data.data };
          this.notifyListeners();
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }

  /**
   * Get authentication token
   */
  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('revolution-network');
      return credentials ? credentials.password : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authState.user;
  }
}

// Singleton instance
export const authService = new AuthService();
export default authService;
