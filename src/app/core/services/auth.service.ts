import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '../models/user.model';
import { AppState } from '../store/app.state';
import * as UserActions from '../store/actions/user.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();
  
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('token');
    const demoMode = localStorage.getItem('demo_mode');
    
    if (token && this.isTokenValid(token)) {
      this.tokenSubject.next(token);
      this.loadUserProfile();
    } else if (demoMode) {
      const demoUser = this.createDemoUser('full');
      this.userSubject.next(demoUser);
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private loadUserProfile(): void {
    // In a real app, you'd load user profile from API
    // For now, we'll create a demo user
    const demoUser = this.createDemoUser('full');
    this.userSubject.next(demoUser);
  }

  async register(credentials: RegisterRequest): Promise<AuthResponse> {
    this.store.dispatch(UserActions.register({ credentials }));
    try {
      const response = await this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, credentials).toPromise();
      if (response) {
        // Don't auto-login after registration - redirect to verification page
        // Include verification link in query params if provided (development mode)
        const queryParams: any = { email: credentials.email };
        if (response.verificationLink) {
          queryParams.verificationLink = response.verificationLink;
        }
        this.router.navigate(['/verify-email'], { queryParams });
        return response;
      }
      throw new Error('No response received');
    } catch (error: any) {
      this.store.dispatch(UserActions.registerFailure({ error: error.error?.message || 'Registration failed' }));
      throw new Error(error.error?.message || 'Registration failed');
    }
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.http.post<{ success: boolean; message: string }>(
        `${environment.apiUrl}/auth/verify-email`,
        { token }
      ).toPromise();
      
      if (response?.success) {
        // Redirect to login after successful verification
        this.router.navigate(['/login'], { queryParams: { verified: 'true' } });
      }
      
      return response || { success: false, message: 'Verification failed' };
    } catch (error: any) {
      throw new Error(error.error?.message || 'Email verification failed');
    }
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string; verificationLink?: string }> {
    try {
      console.log('AuthService: Calling /auth/resend-verification with email:', email);
      const response = await this.http.post<{ success: boolean; message: string; verificationLink?: string }>(
        `${environment.apiUrl}/auth/resend-verification`,
        { email }
      ).toPromise();
      
      console.log('AuthService: Response received:', response);
      
      // Don't navigate - let the component handle the verificationLink update
      // The component will update its own verificationLink property from the response
      
      return response || { success: false, message: 'Failed to resend verification email' };
    } catch (error: any) {
      console.error('AuthService: Error in resendVerificationEmail:', error);
      throw new Error(error.error?.message || error.message || 'Failed to resend verification email');
    }
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.http.post<{ success: boolean; message: string }>(
        `${environment.apiUrl}/auth/request-password-reset`,
        { email }
      ).toPromise();
      
      return response || { success: false, message: 'Failed to send password reset email' };
    } catch (error: any) {
      throw new Error(error.error?.message || 'Failed to send password reset email');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.http.post<{ success: boolean; message: string }>(
        `${environment.apiUrl}/auth/reset-password`,
        { token, newPassword }
      ).toPromise();
      
      if (response?.success) {
        // Redirect to login after successful password reset
        this.router.navigate(['/login'], { queryParams: { passwordReset: 'true' } });
      }
      
      return response || { success: false, message: 'Password reset failed' };
    } catch (error: any) {
      throw new Error(error.error?.message || 'Password reset failed');
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).toPromise();
      if (response) {
        this.store.dispatch(UserActions.login({ user: response.user }));
        this.handleAuthSuccess(response);
        return response;
      }
      throw new Error('No response received');
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Login failed';
      this.store.dispatch(UserActions.loginFailure({ error: errorMessage }));
      
      // Check if error is about email verification
      if (errorMessage.includes('not verified') || errorMessage.includes('verify')) {
        throw new Error('EMAIL_NOT_VERIFIED');
      }
      
      throw new Error(errorMessage);
    }
  }

  async loginWithOAuth(provider: string, code: string): Promise<AuthResponse> {
    try {
      const response = await this.http.post<AuthResponse>(`${environment.apiUrl}/auth/oauth`, { provider, code }).toPromise();
      if (response) {
        this.handleAuthSuccess(response);
        return response;
      }
      throw new Error('No response received');
    } catch (error: any) {
      throw new Error(error.error?.message || 'OAuth login failed');
    }
  }

  async demoLogin(type: 'quick' | 'full'): Promise<void> {
    this.store.dispatch(UserActions.demoLogin({ demoType: type }));
    const demoUser = this.createDemoUser(type);
    
    localStorage.setItem('demo_mode', 'true');
    this.userSubject.next(demoUser);
    this.store.dispatch(UserActions.demoLoginSuccess({ user: demoUser }));
    
    // Redirect based on user state
    if (demoUser.letterProgress.canAccessDiscord) {
      this.router.navigate(['/discord']);
    } else if (!demoUser.hasSeenWelcome) {
      this.router.navigate(['/welcome']);
    } else {
      this.router.navigate(['/letters']);
    }
  }

  private createDemoUser(type: 'quick' | 'full'): User {
    return {
      id: 'demo-user',
      email: 'demo@revnet.local',
      username: 'DemoUser',
      discriminator: '0001',
      status: 'online',
      letterProgress: {
        completedLetters: type === 'quick' ? [1, 2, 3, 4, 5, 6, 7] : [],
        currentLetter: type === 'quick' ? 8 : 1,
        totalLetters: 30,
        canAccessDiscord: false,
        assignments: []
      },
      revoltMemberships: [],
      hasSeenWelcome: false,
      createdAt: new Date(),
      lastActive: new Date()
    };
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (response.tokens?.accessToken) {
      localStorage.setItem('token', response.tokens.accessToken);
      this.tokenSubject.next(response.tokens.accessToken);
    }
    
    this.userSubject.next(response.user);
    
    // Redirect based on user state
    if (response.user.letterProgress.canAccessDiscord) {
      this.router.navigate(['/discord']);
    } else if (!response.user.hasSeenWelcome) {
      this.router.navigate(['/welcome']);
    } else {
      this.router.navigate(['/letters']);
    }
  }

  logout(): void {
    this.store.dispatch(UserActions.logout());
    localStorage.removeItem('token');
    localStorage.removeItem('demo_mode');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const demoMode = localStorage.getItem('demo_mode');
    return (token ? this.isTokenValid(token) : false) || !!demoMode;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  updateUser(user: User): void {
    this.userSubject.next(user);
    // Also update in localStorage for persistence
    localStorage.setItem('current_user', JSON.stringify(user));
  }
}
