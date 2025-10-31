import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { OAuthService } from '../../../../core/services/oauth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showVerificationLink = false;
  userEmail = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['verified'] === 'true') {
        this.successMessage = 'Email verified successfully! You can now log in.';
      }
      if (params['passwordReset'] === 'true') {
        this.successMessage = 'Password reset successfully! You can now log in with your new password.';
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.loginForm.valid) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showVerificationLink = false;
    
    try {
      await this.authService.login(this.loginForm.value);
      // Redirects to letters automatically in service
    } catch (error: any) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        this.errorMessage = 'Email not verified. Please check your email and verify your account before logging in.';
        this.showVerificationLink = true;
        this.userEmail = this.loginForm.get('email')?.value || '';
      } else {
        this.errorMessage = error.message || 'Login failed';
      }
      this.isLoading = false;
    }
  }

  async resendVerificationEmail(): Promise<void> {
    if (!this.userEmail) return;
    
    try {
      await this.authService.resendVerificationEmail(this.userEmail);
      this.successMessage = 'Verification email sent! Please check your inbox.';
      this.showVerificationLink = false;
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to resend verification email';
    }
  }

  goToPasswordReset(): void {
    this.router.navigate(['/password-reset-request']);
  }

  loginWithGoogle(): void {
    this.oauthService.loginWithGoogle();
  }

  loginWithGitHub(): void {
    this.oauthService.loginWithGitHub();
  }

  loginWithDiscord(): void {
    this.oauthService.loginWithDiscord();
  }

  async demoQuickStart(): Promise<void> {
    await this.authService.demoLogin('quick');
  }

  async demoFullJourney(): Promise<void> {
    await this.authService.demoLogin('full');
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
