import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { OAuthService } from '../../../../core/services/oauth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.loginForm.valid) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.login(this.loginForm.value);
      // Redirects to letters automatically in service
    } catch (error: any) {
      this.errorMessage = error.message || 'Login failed';
      this.isLoading = false;
    }
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
