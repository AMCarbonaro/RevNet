import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { OAuthService } from '../../../../core/services/oauth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  async onSubmit(): Promise<void> {
    if (!this.registerForm.valid) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.register(this.registerForm.value);
      // Redirects to letters automatically in service
    } catch (error: any) {
      this.errorMessage = error.message || 'Registration failed';
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

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private passwordMatchValidator(g: AbstractControl) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }
}
