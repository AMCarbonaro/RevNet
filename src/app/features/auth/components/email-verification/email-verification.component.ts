import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit {
  token: string | null = null;
  email: string | null = null;
  verificationLink: string | null = null;
  isLoading = false;
  isVerified = false;
  errorMessage = '';
  successMessage = '';
  resendLoading = false;
  resendSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get token from query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      this.email = params['email'] || null;
      this.verificationLink = params['verificationLink'] || null;

      // If token is present, verify immediately
      if (this.token) {
        this.verifyEmail();
      }
    });
  }

  async verifyEmail(): Promise<void> {
    if (!this.token) {
      this.errorMessage = 'No verification token provided';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await this.authService.verifyEmail(this.token);
      if (response.success) {
        this.isVerified = true;
        this.successMessage = 'Email verified successfully! You can now log in.';
        // Redirect happens in auth service
      } else {
        this.errorMessage = response.message || 'Verification failed';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Email verification failed';
    } finally {
      this.isLoading = false;
    }
  }

  async resendVerificationEmail(): Promise<void> {
    console.log('resendVerificationEmail called, email:', this.email);
    
    if (!this.email) {
      this.errorMessage = 'Email address is required to resend verification';
      console.error('No email found in component');
      return;
    }

    this.resendLoading = true;
    this.resendSuccess = false;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      console.log('Calling authService.resendVerificationEmail with:', this.email);
      const response = await this.authService.resendVerificationEmail(this.email);
      console.log('Response received:', response);
      
      if (response.success) {
        this.resendSuccess = true;
        
        // If verification link is provided, update it in the component
        if (response.verificationLink) {
          console.log('Verification link received:', response.verificationLink);
          this.verificationLink = response.verificationLink;
          this.successMessage = 'Verification link generated! Click the button below to verify.';
        } else {
          console.log('No verification link in response (email service configured)');
          this.successMessage = 'Verification email sent! Please check your inbox.';
        }
      } else {
        console.error('Response not successful:', response);
        this.errorMessage = response.message || 'Failed to resend verification email';
      }
    } catch (error: any) {
      console.error('Error in resendVerificationEmail:', error);
      this.errorMessage = error.message || error.error?.message || 'Failed to resend verification email';
    } finally {
      this.resendLoading = false;
      console.log('resendLoading set to false');
    }
  }

  verifyWithLink(): void {
    if (this.verificationLink) {
      // Extract token from the full link
      const url = new URL(this.verificationLink);
      const token = url.searchParams.get('token');
      if (token) {
        this.token = token;
        this.verifyEmail();
      }
    }
  }

  copyLink(input: HTMLInputElement): void {
    input.select();
    document.execCommand('copy');
    // Show feedback
    const originalText = input.placeholder || '';
    input.placeholder = 'Copied!';
    setTimeout(() => {
      input.placeholder = originalText;
    }, 2000);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

