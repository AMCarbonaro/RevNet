import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  constructor(private http: HttpClient) {}

  async loginWithGoogle(): Promise<void> {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  async loginWithGitHub(): Promise<void> {
    window.location.href = `${environment.apiUrl}/auth/github`;
  }

  async loginWithDiscord(): Promise<void> {
    window.location.href = `${environment.apiUrl}/auth/discord`;
  }

  async handleOAuthCallback(code: string, provider: string): Promise<AuthResponse> {
    const response = await this.http.post<AuthResponse>(`${environment.apiUrl}/auth/${provider}/callback`, { code }).toPromise();
    if (response) {
      return response;
    }
    throw new Error('No response received');
  }
}
